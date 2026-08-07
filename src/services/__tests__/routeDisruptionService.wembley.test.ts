import { RouteDisruptionService } from '../routeDisruptionService';
import { TflApiClient } from '../tflApi';
import { RouteDefinition, ProcessedDisruption } from '../../types/tfl';

jest.mock('../tflApi');

describe('RouteDisruptionService - Bus 206 Curtailment', () => {
  let service: RouteDisruptionService;
  let mockTflClient: jest.Mocked<TflApiClient>;

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

  beforeEach(() => {
    jest.spyOn(console, 'error').mockReturnValue(undefined);
    jest.spyOn(console, 'warn').mockReturnValue(undefined);

    mockTflClient = new TflApiClient() as jest.Mocked<TflApiClient>;

    // Mock basic TfL responses
    mockTflClient.getLineStatus.mockResolvedValue([]);
    mockTflClient.getStopPointDisruptions.mockResolvedValue([]);
    mockTflClient.processLineStatusResponses.mockReturnValue([]);
    mockTflClient.processStopPointDisruptions.mockReturnValue([]);
    mockTflClient.isBus206Curtailed.mockResolvedValue(false);

    service = new RouteDisruptionService(mockTflClient);
  });

  describe('Bus 206 curtailment detection', () => {
    it('should add curtailment disruption for route1-inbound when 206 is curtailed', async () => {
      mockTflClient.isBus206Curtailed.mockResolvedValue(true);

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(1);

      const disruption = result.wembleyEventDisruptions[0];
      expect(disruption.id).toContain('bus206-curtailment');
      expect(disruption.type).toBe('Bus 206 Service Change');
      expect(disruption.description).toContain('Bus 206 is not reaching The Paddocks');
      expect(disruption.lineId).toBe('206');
      expect(disruption.isActive).toBe(true);
      expect(disruption.affectedStopPoints).toContain('490000257O'); // Wembley Park Station
      expect(disruption.affectedStopPoints).toContain('490G00007753'); // Hannah Close
    });

    it('should not add curtailment disruption when 206 is operating normally', async () => {
      mockTflClient.isBus206Curtailed.mockResolvedValue(false);

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });

    it('should not add curtailment disruption for other routes', async () => {
      mockTflClient.isBus206Curtailed.mockResolvedValue(true);

      const result = await service['mapDisruptionsToRoute'](mockRoute2Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });

    it('should handle TfL service errors gracefully', async () => {
      mockTflClient.isBus206Curtailed.mockRejectedValue(new Error('Service error'));

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      expect(result.wembleyEventDisruptions).toHaveLength(0);
    });
  });

  describe('Separation from grouped disruptions', () => {
    it('should NOT include curtailment disruptions in grouped disruptions', async () => {
      mockTflClient.isBus206Curtailed.mockResolvedValue(true);

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

      // Should have curtailment disruption in separate field
      expect(result.wembleyEventDisruptions).toHaveLength(1);

      // Grouped disruptions should only contain TfL disruptions
      expect(result.groupedDisruptions).toHaveLength(1);
      const group = result.groupedDisruptions[0];
      expect(group.originalDisruptions).toHaveLength(1);
      expect(group.originalDisruptions[0].id).toBe('tfl-disruption-1');

      // Curtailment disruptions should NOT be in grouped view
      const curtailmentGroup = result.groupedDisruptions.find(group =>
        group.originalDisruptions.some(d => d.id.startsWith('bus206-curtailment'))
      );
      expect(curtailmentGroup).toBeUndefined();
    });

    it('should handle empty TfL disruptions with curtailment', async () => {
      mockTflClient.isBus206Curtailed.mockResolvedValue(true);

      const result = await service['mapDisruptionsToRoute'](mockRoute1Inbound, [], []);

      // Should have curtailment disruption but no grouped disruptions
      expect(result.wembleyEventDisruptions).toHaveLength(1);
      expect(result.groupedDisruptions).toHaveLength(0);
    });
  });
});
