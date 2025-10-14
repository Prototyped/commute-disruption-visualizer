import { TflApiClient } from '../tflApi';
import { TflStopPointDisruption, TflLineStatusResponse } from '../../types/tfl';

// Mock fetch globally
global.fetch = jest.fn();

describe('TflApiClient', () => {
  let client: TflApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new TflApiClient('https://api.test.tfl.gov.uk');
    mockFetch.mockClear();
  });

  describe('getLineStatus', () => {
    it('should fetch line status successfully', async () => {
      const mockLineStatus: TflLineStatusResponse[] = [
        {
          id: 'bakerloo',
          name: 'Bakerloo',
          modeName: 'tube',
          created: '2025-10-08T08:47:00Z',
          modified: '2025-10-08T15:15:00Z',
          lineStatuses: [
            {
              id: 0,
              lineId: 'bakerloo',
              statusSeverity: 0,
              statusSeverityDescription: 'Good Service',
              created: '2025-10-08T08:47:00Z',
              validityPeriods: [
                {
                  fromDate: '2025-10-08T08:47:00Z',
                  toDate: '2025-10-08T23:59:59Z',
                  isNow: true
                }
              ]
            }
          ]
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLineStatus,
      } as Response);

      const result = await client.getLineStatus(['metropolitan', 'bakerloo']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tfl.gov.uk/Line/metropolitan,bakerloo/Status?detail=true'
      );
      expect(result).toEqual(mockLineStatus);
    });

    it('should return empty array for empty line IDs', async () => {
      const result = await client.getLineStatus([]);
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should successfully process all batches for large requests', async () => {
      const lineIds = Array.from({ length: 25 }, (_, i) => `line${i}`);
      
      // Mock 3 responses (25 IDs with batch size 10 = 3 batches)
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);
      }

      await client.getLineStatus(lineIds);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Status?detail=true')
      );
    });

    it('should continue with other batches if one fails', async () => {
      const lineIds = Array.from({ length: 25 }, (_, i) => `line${i}`);
      
      // Mock first batch to fail, rest to succeed with only one returning data
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);
      
      // Mock remaining 2 batches (1 empty, 1 with data)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'line-status-1' }],
      } as Response);

      const result = await client.getLineStatus(lineIds);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual([{ id: 'line-status-1' }]);
    });
  });

  describe('getStopPointDisruptions', () => {
    it('should fetch stop point disruptions successfully', async () => {
      const mockDisruptions: TflStopPointDisruption[] = [
        {
          atcoCode: '490000240W',
          fromDate: '2025-10-08T09:00:00Z',
          toDate: '2025-10-08T17:00:00Z',
          description: 'Bus stop temporarily closed due to works',
          commonName: 'Turnham Green Station',
          type: 'Closure',
          mode: 'bus',
          stationAtcoCode: '490G00000240',
          appearance: 'Information'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDisruptions,
      } as Response);

      const result = await client.getStopPointDisruptions(['490000240W']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tfl.gov.uk/StopPoint/490000240W/Disruption'
      );
      expect(result).toEqual(mockDisruptions);
    });

    it('should successfully process all batches for large requests', async () => {
      const stopIds = Array.from({ length: 75 }, (_, i) => `stop${i}`);
      
      // Mock 8 responses (75 IDs with batch size 10 = 8 batches)
      for (let i = 0; i < 8; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);
      }

      await client.getStopPointDisruptions(stopIds);

      expect(mockFetch).toHaveBeenCalledTimes(8);
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
      
      // Mock first batch to fail, rest to succeed with only one returning data
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);
      
      // Mock remaining 7 batches (6 empty, 1 with data)
      for (let i = 0; i < 6; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'disruption1' }],
      } as Response);

      const result = await client.getStopPointDisruptions(stopIds);

      expect(mockFetch).toHaveBeenCalledTimes(8);
      expect(result).toEqual([{ id: 'disruption1' }]);
    });
  });

  describe('processLineStatusResponses', () => {
    it('should process line status responses correctly', () => {
      const mockLineStatusResponse: TflLineStatusResponse = {
        id: '94',
        name: '94',
        modeName: 'bus',
        created: '2024-01-01T10:00:00Z',
        modified: '2024-01-01T10:00:00Z',
        lineStatuses: [
          {
            id: 0,
            lineId: '94',
            statusSeverity: 10,
            statusSeverityDescription: 'Special Service',
            reason: 'Route 94 not serving final stop due to works',
            created: '2024-01-01T08:00:00Z',
            validityPeriods: [
              {
                fromDate: '2024-01-01T08:00:00Z',
                toDate: '2024-01-01T18:00:00Z',
                isNow: true
              }
            ],
            disruption: {
              category: 'RealTime',
              categoryDescription: 'RealTime',
              description: 'Route 94 not serving final stop due to works',
              created: '2024-01-01T08:00:00Z',
              affectedRoutes: [
                {
                  id: '1394',
                  name: 'Acton Green - Charles II Street',
                  direction: 'outbound',
                  originationName: 'Acton Green',
                  destinationName: 'Charles II Street',
                  isEntireRouteSection: true,
                  routeSectionNaptanEntrySequence: [
                    {
                      ordinal: 0,
                      stopPoint: {
                        naptanId: '490003076C',
                        id: '490003076C',
                        commonName: 'Acton Green',
                        placeType: 'StopPoint',
                        modes: [],
                        icsCode: '1003076',
                        stationNaptan: '490G00003076',
                        lines: [],
                        lineGroup: [],
                        lineModeGroups: [],
                        status: true,
                        additionalProperties: [],
                        children: [],
                        lat: 0.0,
                        lon: 0.0
                      }
                    },
                    {
                      ordinal: 1,
                      stopPoint: {
                        naptanId: '490020000Z',
                        id: '490020000Z',
                        commonName: 'Charles II Street',
                        placeType: 'StopPoint',
                        modes: [],
                        icsCode: '1020000',
                        stationNaptan: '490G00020000',
                        lines: [],
                        lineGroup: [],
                        lineModeGroups: [],
                        status: true,
                        additionalProperties: [],
                        children: [],
                        lat: 0.0,
                        lon: 0.0
                      }
                    }
                  ]
                }
              ],
              affectedStops: [] // Usually empty in real API responses
            }
          }
        ]
      };

      const result = client.processLineStatusResponses([mockLineStatusResponse]);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'Special Service',
        description: 'Route 94 not serving final stop due to works',
        mode: 'bus',
        isActive: true,
        source: 'line',
        lineId: '94',
        affectedStopPoints: ['490003076C', '490G00003076', '490020000Z', '490G00020000']
      });
      expect(result[0].affectedRoutes).toBeDefined();
      expect(result[0].affectedRoutes).toHaveLength(1);
    });

    it('should return empty array for responses without disruptions', () => {
      const mockLineStatusResponse: TflLineStatusResponse = {
        id: 'bakerloo',
        name: 'Bakerloo',
        modeName: 'tube',
        created: '2024-01-01T10:00:00Z',
        modified: '2024-01-01T10:00:00Z',
        lineStatuses: [
          {
            id: 0,
            lineId: 'bakerloo',
            statusSeverity: 0,
            statusSeverityDescription: 'Good Service',
            created: '2024-01-01T10:00:00Z',
            validityPeriods: [
              {
                fromDate: '2024-01-01T09:00:00Z',
                toDate: '2024-01-01T17:00:00Z',
                isNow: true
              }
            ]
            // No disruption field
          }
        ]
      };

      const result = client.processLineStatusResponses([mockLineStatusResponse]);
      expect(result).toHaveLength(0);
    });
  });

  describe('processStopPointDisruptions', () => {
    it('should process stop point disruptions with correct field mappings', () => {
      const rawDisruptions: TflStopPointDisruption[] = [
        {
          atcoCode: '490000240W',
          fromDate: '2025-10-08T09:00:00Z',
          toDate: '2025-10-08T17:00:00Z',
          description: 'Bus stop temporarily closed due to works',
          commonName: 'Turnham Green Station',
          type: 'Closure',
          mode: 'bus',
          stationAtcoCode: '490G00000240',
          appearance: 'Information'
        }
      ];

      const processed = client.processStopPointDisruptions(rawDisruptions);

      expect(processed).toHaveLength(1);
      expect(processed[0]).toMatchObject({
        type: 'Closure',
        description: 'Bus stop temporarily closed due to works',
        commonName: 'Turnham Green Station',
        mode: 'bus',
        source: 'stopPoint',
        stopPointId: '490000240W',
        stationAtcoCode: '490G00000240'
      });
    });
  });
});