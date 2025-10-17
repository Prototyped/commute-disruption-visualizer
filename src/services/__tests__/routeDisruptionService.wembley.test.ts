import { RouteDisruptionService } from '../routeDisruptionService';
import { TflApiClient } from '../tflApi';
import { WembleyEventService, WembleyEvent } from '../wembleyEventService';
import { RouteDefinition, ProcessedDisruption } from '../../types/tfl';

// Mock the dependencies
jest.mock('../tflApi');
jest.mock('../wembleyEventService');

describe('RouteDisruptionService - Wembley Events', () => {
  let service: RouteDisruptionService;
  let mockTflClient: jest.Mocked<TflApiClient>;
  let mockWembleyService: jest.Mocked<WembleyEventService>;

  const mockRoute1Inbound: RouteDefinition = {
    id: 'route1-inbound',
    name: 'Route 1 Inbound',
    description: 'Liverpool Street → Kingfisher Way via Wembley Park',
    segments: [
      {
        id: 'route1-in-metropolitan',
        lineId: 'metropolitan',
        lineName: 'Metropolitan Line',
        mode: 'tube',
        direction: 'inbound',
        stopPoints: [
          { id: '940GZZLULVT', name: 'Liverpool Street', order: 1 },
          { id: '940GZZLUWYP', name: 'Wembley Park', order: 2 }
        ]
      },
      {
        id: 'route1-in-bus206',
        lineId: '206',
        lineName: 'Bus 206',
        mode: 'bus',
        direction: 'inbound',
        stopPoints: [
          { id: '490000257O', name: 'Wembley Park Station', order: 1 },
          { id: '490G00006565', name: 'Empire Way', order: 2 },
          { id: '490G00008746', name: 'Kingfisher Way', order: 3 }
        ]
      }
    ]
  };

  const mockRoute2Inbound: RouteDefinition = {
    id: 'route2-inbound',
    name: 'Route 2 Inbound',
    description: 'Liverpool Street → Kingfisher Way via Harlesden',
    segments: [
      {
        id: 'route2-in-bus206-224',
        lineId: '206,224',
        lineName: 'Bus 206/224',
        mode: 'bus',
        direction: 'inbound',
        stopPoints: [
          { id: '490000100N', name: 'Harlesden Station', order: 1 },
          { id: '490G00008746', name: 'Kingfisher Way', order: 2 }
        ]
      }
    ]
  };

  const mockWembleyEvent: WembleyEvent = {
    id: 'test-event-123',
    title: 'Test Wembley Event',
    summary: 'A test event at Wembley Stadium',
    date: '2025-10-19T12:00:00+00:00',
    displayDate: '2025-10-19T13:00:00+01:00',
    venue: ['Wembley Stadium'],
    eventType: ['Sport, health and fitness'],
    address: 'Wembley Stadium, Wembley, ',
    postcode: 'HA9 0WS',
    url: '/events-in-brent/2025/october/test-event'
  };

  beforeEach(() => {
    mockTflClient = new TflApiClient() as jest.Mocked<TflApiClient>;
    mockWembleyService = new WembleyEventService() as jest.Mocked<WembleyEventService>;
    
    // Mock basic TfL responses
    mockTflClient.getLineStatus.mockResolvedValue([]);
    mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
    mockTflClient.processLineStatusResponses.mockReturnValue([]);
    mockTflClient.processStopPointDisruptions.mockReturnValue([]);

    service = new RouteDisruptionService(mockTflClient, mockWembleyService);
  });

  describe('Wembley event day detection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add Wembley event disruption for route1-inbound on event day during event hours', async () => {
      // Set current time to event day during disruption hours (15:00)
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: [mockWembleyEvent]
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(1);
      
      const disruption = result.wembleyEventDisruptions[0];
      expect(disruption.id).toBe('wembley-event-test-event-123');
      expect(disruption.type).toBe('Wembley Event Day Service Change');
      expect(disruption.description).toContain('Bus 206 service disrupted due to Wembley Stadium event: Test Wembley Event');
      expect(disruption.description).toContain('Bus 206 does not enter Wembley area');
      expect(disruption.lineId).toBe('206');
      expect(disruption.isActive).toBe(true); // Should be active during event hours
      expect(disruption.affectedStopPoints).toContain('490000257O'); // Wembley Park Station
      expect(disruption.affectedStopPoints).toContain('490G00007753'); // Hannah Close
    });

    it('should add Wembley event disruption but mark as inactive outside event hours', async () => {
      // Set current time to event day but outside disruption hours (10:00)
      jest.setSystemTime(new Date('2025-10-19T10:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: [mockWembleyEvent]
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(1);
      
      const disruption = result.wembleyEventDisruptions[0];
      expect(disruption.isActive).toBe(false); // Should be inactive outside event hours
    });

    it('should not add Wembley event disruption for other routes', async () => {
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: [mockWembleyEvent]
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute2Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });

    it('should not add Wembley event disruption on non-event days', async () => {
      jest.setSystemTime(new Date('2025-10-20T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: false,
        events: []
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });

    it('should handle multiple events on the same day', async () => {
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      const multipleEvents = [
        mockWembleyEvent,
        {
          ...mockWembleyEvent,
          id: 'test-event-456',
          title: 'Second Test Event'
        }
      ];

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: multipleEvents
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(2);
      expect(result.wembleyEventDisruptions[0].id).toBe('wembley-event-test-event-123');
      expect(result.wembleyEventDisruptions[1].id).toBe('wembley-event-test-event-456');
    });

    it('should handle Wembley service errors gracefully', async () => {
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockRejectedValue(new Error('Service error'));

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });
  });

  describe('Separation from grouped disruptions', () => {
    it('should NOT include Wembley event disruptions in grouped disruptions', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: [mockWembleyEvent]
      });

      // Add some TfL disruptions to test grouping separation
      const mockTflDisruption: ProcessedDisruption = {
        id: 'tfl-disruption-1',
        type: 'Service Change',
        description: 'Test TfL disruption',
        mode: 'bus',
        startDate: new Date('2025-10-19T10:00:00Z'),
        endDate: new Date('2025-10-19T20:00:00Z'),
        isActive: true,
        source: 'line',
        lineId: '206',
        affectedStopPoints: ['490000257O'],
        affectedRoutes: []
      };

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [mockTflDisruption], []);

      // Should have Wembley disruption in separate field
      expect(result.wembleyEventDisruptions).toHaveLength(1);
      
      // Grouped disruptions should only contain TfL disruptions
      expect(result.groupedDisruptions).toHaveLength(1);
      const group = result.groupedDisruptions[0];
      expect(group.originalDisruptions).toHaveLength(1);
      expect(group.originalDisruptions[0].id).toBe('tfl-disruption-1');
      
      // Wembley disruptions should NOT be in grouped view
      const wembleyGroup = result.groupedDisruptions.find(group =>
        group.originalDisruptions.some(d => d.id.startsWith('wembley-event-'))
      );
      expect(wembleyGroup).toBeUndefined();

      jest.useRealTimers();
    });

    it('should handle empty TfL disruptions with Wembley events', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-19T15:00:00Z'));

      mockWembleyService.isWembleyEventDay.mockResolvedValue({
        isEventDay: true,
        events: [mockWembleyEvent]
      });

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      // Should have Wembley disruption but no grouped disruptions
      expect(result.wembleyEventDisruptions).toHaveLength(1);
      expect(result.groupedDisruptions).toHaveLength(0);

      jest.useRealTimers();
    });
  });

  describe('Time range checking', () => {
    it('should correctly identify times within range', () => {
      const start = new Date('2025-10-19T13:00:00Z');
      const end = new Date('2025-10-19T23:00:00Z');
      const during = new Date('2025-10-19T15:00:00Z');
      const before = new Date('2025-10-19T10:00:00Z');
      const after = new Date('2025-10-20T01:00:00Z');

      expect(service['isTimeInRange'](during, start, end)).toBe(true);
      expect(service['isTimeInRange'](before, start, end)).toBe(false);
      expect(service['isTimeInRange'](after, start, end)).toBe(false);
      expect(service['isTimeInRange'](start, start, end)).toBe(true); // Boundary
      expect(service['isTimeInRange'](end, start, end)).toBe(true); // Boundary
    });

    it('should handle new 13:00 start time correctly', () => {
      const start = new Date('2025-10-19T13:00:00Z');
      const end = new Date('2025-10-19T23:00:00Z');
      const at1300 = new Date('2025-10-19T13:00:00Z');
      const at1259 = new Date('2025-10-19T12:59:59Z');
      const at1301 = new Date('2025-10-19T13:01:00Z');

      expect(service['isTimeInRange'](at1300, start, end)).toBe(true); // Exactly at start
      expect(service['isTimeInRange'](at1259, start, end)).toBe(false); // Just before
      expect(service['isTimeInRange'](at1301, start, end)).toBe(true); // Just after start
    });
  });
});