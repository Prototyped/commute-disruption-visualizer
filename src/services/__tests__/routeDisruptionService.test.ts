import { RouteDisruptionService } from '../routeDisruptionService';
import { TflApiClient } from '../tflApi';
import { TflStopPointDisruption, TflLineStatusResponse, ProcessedDisruption } from '../../types/tfl';

// Mock the TfL API client
jest.mock('../tflApi');

describe('RouteDisruptionService', () => {
  let service: RouteDisruptionService;
  let mockTflClient: jest.Mocked<TflApiClient>;

  beforeEach(() => {
    // Create a proper mock of the TflApiClient class
    mockTflClient = new TflApiClient() as jest.Mocked<TflApiClient>;

    // Mock all the public methods
    mockTflClient.getLineStatus = jest.fn();
    mockTflClient.getStopPointDisruptions = jest.fn();
    mockTflClient.processLineStatusResponses = jest.fn();
    mockTflClient.processStopPointDisruptions = jest.fn();
    mockTflClient.isBus206Curtailed = jest.fn().mockResolvedValue(false);

    service = new RouteDisruptionService(mockTflClient);
  });

  describe('getAllRouteDisruptions', () => {
    it('should fetch, process and return correctly structured disruptions for all routes', async () => {
      const mockLineStatusResponses: TflLineStatusResponse[] = [];
      const mockStopDisruptions: TflStopPointDisruption[] = [];

      const mockProcessedLineDisruptions: ProcessedDisruption[] = [];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [];

      mockTflClient.getLineStatus.mockResolvedValue(mockLineStatusResponses);
      mockTflClient.getStopPointDisruptions.mockResolvedValue(mockStopDisruptions);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);

      const result = await service.getAllRouteDisruptions();

      expect(mockTflClient.getLineStatus).toHaveBeenCalledWith([
        'metropolitan', 'hammersmith-city', 'circle', 'bakerloo', 'elizabeth', '112', '206', '224'
      ]);
      expect(mockTflClient.getStopPointDisruptions).toHaveBeenCalledWith(
        expect.arrayContaining(['490G00008746', '940GZZLUBST'])
      );
      expect(result).toHaveLength(6); // 6 routes total (3 outbound + 3 inbound)
      
      // Check that routes are returned with correct structure
      expect(result).toHaveLength(6); // 6 routes total (3 outbound + 3 inbound)
      const route1Outbound = result.find(r => r.route.id === 'route1-outbound');
      expect(route1Outbound).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      mockTflClient.getLineStatus.mockRejectedValue(new Error('API Error'));

      await expect(service.getAllRouteDisruptions())
        .rejects.toThrow('Failed to fetch route disruptions: API Error');
    });
  });

  describe('getRouteDisruptions', () => {
    it('should fetch disruptions and return correctly identified route', async () => {
      const mockLineStatusResponses: TflLineStatusResponse[] = [];
      const mockStopDisruptions: TflStopPointDisruption[] = [];
      const mockProcessedLineDisruptions: ProcessedDisruption[] = [];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [];

      mockTflClient.getLineStatus.mockResolvedValue(mockLineStatusResponses);
      mockTflClient.getStopPointDisruptions.mockResolvedValue(mockStopDisruptions);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);

      const result = await service.getRouteDisruptions('route1-outbound');

      expect(result).toBeDefined();
      expect(result!.route.id).toBe('route1-outbound');
      expect(mockTflClient.getLineStatus).toHaveBeenCalledWith(['206', 'metropolitan']);
    });

    it('should throw error for invalid route ID', async () => {
      await expect(service.getRouteDisruptions('invalid-route'))
        .rejects.toThrow('Route not found: invalid-route');
    });

    it('should handle API errors for specific route', async () => {
      mockTflClient.getLineStatus.mockRejectedValue(new Error('API Error'));

      await expect(service.getRouteDisruptions('route1-outbound'))
        .rejects.toThrow('Failed to fetch disruptions for route route1-outbound: API Error');
    });
  });

  describe('getRoutesByDirection', () => {
    it('should separate routes by direction', () => {
      const { outbound, inbound } = service.getRoutesByDirection();

      expect(outbound).toHaveLength(3);
      expect(inbound).toHaveLength(3);
      
      expect(outbound.every(route => route.id.includes('outbound'))).toBe(true);
      expect(inbound.every(route => route.id.includes('inbound'))).toBe(true);
    });
  });

  describe('getRoute', () => {
    it('should return route by ID', () => {
      const route = service.getRoute('route1-outbound');
      expect(route).toBeDefined();
      expect(route!.id).toBe('route1-outbound');
    });

    it('should return undefined for invalid ID', () => {
      const route = service.getRoute('invalid-route');
      expect(route).toBeUndefined();
    });
  });

  describe('getAllRoutes', () => {
    it('should return all routes', () => {
      const routes = service.getAllRoutes();
      expect(routes).toHaveLength(6);
    });
  });

  describe('step-free disruption filtering', () => {
    it('should filter out line disruptions with step-free in description', async () => {
      const mockProcessedLineDisruptions: ProcessedDisruption[] = [
        {
          id: 'step-free-1',
          type: 'Severe Delays',
          description: 'Wembley Park: No Step Free Access - faulty lift',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'line',
          lineId: 'metropolitan',
          affectedStopPoints: ['940GZZLUWYP'],
        },
        {
          id: 'real-1',
          type: 'Severe Delays',
          description: 'Metropolitan Line: Delays due to signal failure',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'line',
          lineId: 'metropolitan',
          affectedStopPoints: ['940GZZLUWYP'],
        },
      ];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [];

      mockTflClient.getLineStatus.mockResolvedValue([]);
      mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);
      mockTflClient.isBus206Curtailed.mockResolvedValue(false);

      const result = await service.getRouteDisruptions('route1-outbound');

      expect(result!.lineDisruptions).toHaveLength(1);
      expect(result!.lineDisruptions[0].id).toBe('real-1');
    });

    it('should filter out stop point disruptions with step-free in description', async () => {
      const mockProcessedLineDisruptions: ProcessedDisruption[] = [];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [
        {
          id: 'step-free-sp',
          type: 'Closure',
          description: 'Willesden Junction: No Step Free Access - faulty lift',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'stopPoint',
          stopPointId: '940GZZLUWJN',
        },
        {
          id: 'real-sp',
          type: 'Closure',
          description: 'Willesden Junction: Platform access closed',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'stopPoint',
          stopPointId: '940GZZLUWJN',
        },
      ];

      mockTflClient.getLineStatus.mockResolvedValue([]);
      mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);
      mockTflClient.isBus206Curtailed.mockResolvedValue(false);

      const result = await service.getRouteDisruptions('route2-outbound');

      expect(result!.stopDisruptions).toHaveLength(1);
      expect(result!.stopDisruptions[0].id).toBe('real-sp');
    });

    it('should filter step-free descriptions with hyphenated step-free', async () => {
      const mockProcessedLineDisruptions: ProcessedDisruption[] = [
        {
          id: 'step-free-hyphen',
          type: 'Severe Delays',
          description: 'King\'s Cross: Step-free access not available due to lift failure',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'line',
          lineId: 'metropolitan',
          affectedStopPoints: ['940GZZLUKSX'],
        },
      ];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [];

      mockTflClient.getLineStatus.mockResolvedValue([]);
      mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);
      mockTflClient.isBus206Curtailed.mockResolvedValue(false);

      const result = await service.getRouteDisruptions('route1-outbound');

      expect(result!.lineDisruptions).toHaveLength(0);
    });

    it('should filter out line disruptions with category "Information"', async () => {
      const mockProcessedLineDisruptions: ProcessedDisruption[] = [
        {
          id: 'info-1',
          type: 'Severe Delays',
          description: 'Wembley Park: Lift out of service',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'line',
          lineId: 'metropolitan',
          affectedStopPoints: ['940GZZLUWYP'],
          category: 'Information',
        },
        {
          id: 'real-2',
          type: 'Severe Delays',
          description: 'Metropolitan Line: Delays due to signal failure',
          mode: 'tube',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          source: 'line',
          lineId: 'metropolitan',
          affectedStopPoints: ['940GZZLUWYP'],
          category: 'RealTime',
        },
      ];
      const mockProcessedStopDisruptions: ProcessedDisruption[] = [];

      mockTflClient.getLineStatus.mockResolvedValue([]);
      mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
      mockTflClient.processLineStatusResponses.mockReturnValue(mockProcessedLineDisruptions);
      mockTflClient.processStopPointDisruptions.mockReturnValue(mockProcessedStopDisruptions);
      mockTflClient.isBus206Curtailed.mockResolvedValue(false);

      const result = await service.getRouteDisruptions('route1-outbound');

      expect(result!.lineDisruptions).toHaveLength(1);
      expect(result!.lineDisruptions[0].id).toBe('real-2');
    });
  });
});