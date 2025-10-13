import { TflApiClient } from '../tflApi';
import { TflStopPointDisruption, TflLineDisruption } from '../../types/tfl';

// Mock fetch globally
global.fetch = jest.fn();

describe('TflApiClient', () => {
  let client: TflApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new TflApiClient('https://api.test.tfl.gov.uk');
    mockFetch.mockClear();
  });

  describe('getLineDisruptions', () => {
    it('should fetch line disruptions successfully', async () => {
      const mockDisruptions: TflLineDisruption[] = [
        {
          category: 'RealTime',
          type: 'routeInfo',
          categoryDescription: 'RealTime',
          description: 'Central Line: Minor delays between Leytonstone and Epping due to train cancellations.',
          created: '2025-10-08T08:47:00Z',
          lastUpdate: '2025-10-08T15:15:00Z',
          affectedRoutes: [],
          affectedStops: [],
          closureText: 'minorDelays'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDisruptions,
      } as Response);

      const result = await client.getLineDisruptions(['metropolitan', 'bakerloo']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tfl.gov.uk/Line/metropolitan,bakerloo/Disruption'
      );
      expect(result).toEqual(mockDisruptions);
    });

    it('should return empty array for empty line IDs', async () => {
      const result = await client.getLineDisruptions([]);
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(client.getLineDisruptions(['metropolitan']))
        .rejects.toThrow('TfL API error: 500 Internal Server Error');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getLineDisruptions(['metropolitan']))
        .rejects.toThrow('Failed to fetch line disruptions: Network error');
    });

    it('should handle non-array responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Invalid response' }),
      } as Response);

      const result = await client.getLineDisruptions(['metropolitan']);
      expect(result).toEqual([]);
    });
  });

  describe('getStopPointDisruptions', () => {
    it('should fetch stop point disruptions successfully', async () => {
      const mockDisruptions: TflStopPointDisruption[] = [
        {
          atcoCode: '490G00008746',
          fromDate: '2024-01-01T07:00:00Z',
          toDate: '2024-12-31T23:59:59Z',
          description: 'Bus stop temporarily closed due to works',
          commonName: 'Kingfisher Way',
          type: 'Closure',
          mode: 'bus',
          stationAtcoCode: '490G00008746',
          appearance: 'Information'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDisruptions,
      } as Response);

      const result = await client.getStopPointDisruptions(['490G00008746']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tfl.gov.uk/StopPoint/490G00008746/Disruption'
      );
      expect(result).toEqual(mockDisruptions);
    });

    it('should batch large requests', async () => {
      const stopIds = Array.from({ length: 75 }, (_, i) => `stop${i}`);
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      await client.getStopPointDisruptions(stopIds);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('StopPoint/')
      );
    });

    it('should return empty array for empty stop point IDs', async () => {
      const result = await client.getStopPointDisruptions([]);
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should continue with other batches if one fails', async () => {
      const stopIds = Array.from({ length: 75 }, (_, i) => `stop${i}`);
      
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'disruption1' }],
        } as Response);

      const result = await client.getStopPointDisruptions(stopIds);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ id: 'disruption1' }]);
    });
  });

  describe('processLineDisruptions', () => {
    it('should process line disruptions correctly', () => {
      const rawDisruptions: TflLineDisruption[] = [
        {
          category: 'RealTime',
          type: 'routeInfo',
          categoryDescription: 'RealTime',
          description: 'Central Line: Minor delays between Leytonstone and Epping due to train cancellations.',
          created: '2025-10-08T08:47:00Z',
          lastUpdate: '2025-10-08T15:15:00Z',
          affectedRoutes: [],
          affectedStops: [],
          closureText: 'minorDelays'
        }
      ];

      const processed = client.processLineDisruptions(rawDisruptions);

      expect(processed).toHaveLength(1);
      expect(processed[0]).toMatchObject({
        type: 'routeInfo',
        description: 'Central Line: Minor delays between Leytonstone and Epping due to train cancellations.',
        severity: 'medium', // Should detect "minor delays"
        mode: 'tube', // Should detect "Central Line"
        isActive: false, // Historical timestamp makes it inactive
        source: 'line',
        lineId: 'central'
      });
      expect(processed[0].startDate).toBeInstanceOf(Date);
      expect(processed[0].endDate).toBeInstanceOf(Date);
      expect(processed[0].id).toBeDefined();
    });
  });

  describe('processStopPointDisruptions', () => {
    it('should process stop point disruptions correctly', () => {
      const rawDisruptions: TflStopPointDisruption[] = [
        {
          atcoCode: '490G00008746',
          fromDate: '2024-01-01T07:00:00Z',
          toDate: '2099-12-31T23:59:59Z',
          description: 'Bus stop closed due to major works',
          commonName: 'Kingfisher Way',
          type: 'Closure',
          mode: 'bus',
          stationAtcoCode: '490G00008746',
          appearance: 'Information'
        }
      ];

      const processed = client.processStopPointDisruptions(rawDisruptions);

      expect(processed).toHaveLength(1);
      expect(processed[0]).toMatchObject({
        type: 'Closure',
        description: 'Bus stop closed due to major works',
        commonName: 'Kingfisher Way',
        severity: 'severe', // Should detect "closure"
        mode: 'bus',
        isActive: true,
        source: 'stopPoint',
        stopPointId: '490G00008746'
      });
      expect(processed[0].startDate).toBeInstanceOf(Date);
      expect(processed[0].endDate).toBeInstanceOf(Date);
      expect(processed[0].id).toBeDefined();
    });

    it('should determine severity levels correctly', () => {
      const testCases = [
        {
          type: 'Closure',
          description: 'Bus stop closed',
          expectedSeverity: 'severe'
        },
        {
          type: 'Information',
          description: 'Stop closed due to works',
          expectedSeverity: 'severe'
        },
        {
          type: 'Information',
          description: 'Severe delays at this stop',
          expectedSeverity: 'high'
        },
        {
          type: 'Information',
          description: 'Major delays expected',
          expectedSeverity: 'high'
        },
        {
          type: 'Information',
          description: 'Minor delays possible',
          expectedSeverity: 'medium'
        },
        {
          type: 'Information',
          description: 'Services diverted',
          expectedSeverity: 'medium'
        },
        {
          type: 'Information',
          description: 'Good service',
          expectedSeverity: 'low'
        }
      ];

      testCases.forEach(({ type, description, expectedSeverity }) => {
        const disruption: TflStopPointDisruption = {
          atcoCode: '490G00008746',
          fromDate: '2024-01-01T07:00:00Z',
          toDate: '2099-12-31T23:59:59Z',
          description,
          commonName: 'Test Stop',
          type,
          mode: 'bus',
          stationAtcoCode: '490G00008746',
          appearance: 'Information'
        };

        const processed = client.processStopPointDisruptions([disruption]);
        expect(processed[0].severity).toBe(expectedSeverity);
      });
    });
  });
});