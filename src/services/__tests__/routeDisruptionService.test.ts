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
});