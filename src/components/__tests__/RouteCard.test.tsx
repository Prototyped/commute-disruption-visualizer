/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RouteCard from '../RouteCard';
import { RouteDisruptions, RouteDefinition, ProcessedDisruption } from '../../types/tfl';

const mockRoute: RouteDefinition = {
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
        { id: '490G00008746', name: 'Kingfisher Way', order: 2 }
      ]
    }
  ]
};

function createWembleyDisruption(overrides: Partial<ProcessedDisruption> = {}): ProcessedDisruption {
  return {
    id: 'wembley-event-test-event-123',
    type: 'Wembley Event Day Service Change',
    description: 'Bus 206 service disrupted due to Wembley Stadium event: Test Event. Bus 206 does not enter Wembley area.',
    mode: 'bus',
    startDate: new Date('2025-10-19T13:00:00Z'),
    endDate: new Date('2025-10-19T23:00:00Z'),
    isActive: true,
    source: 'line',
    lineId: '206',
    affectedStopPoints: ['490000257O', '490G00006565', '490G00007753'],
    ...overrides
  };
}

function createBaseRouteDisruptions(overrides: Partial<RouteDisruptions> = {}): RouteDisruptions {
  return {
    route: mockRoute,
    lineDisruptions: [],
    stopDisruptions: [],
    groupedDisruptions: [],
    wembleyEventDisruptions: [],
    ...overrides
  };
}

describe('RouteCard - Wembley event rendering', () => {
  describe('Collapsed state (header)', () => {
    it('shows "Wembley Event" badge when active Wembley disruptions exist', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption()]
      });
      render(<RouteCard routeDisruptions={disruptions} />);

      expect(screen.getByText('Wembley Event')).toBeInTheDocument();
    });

    it('does not show "Wembley Event" badge when Wembley disruptions are all inactive', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption({ isActive: false })]
      });
      render(<RouteCard routeDisruptions={disruptions} />);

      expect(screen.queryByText('Wembley Event')).not.toBeInTheDocument();
    });

    it('does not show "Wembley Event" badge when no Wembley disruptions', () => {
      const disruptions = createBaseRouteDisruptions();
      render(<RouteCard routeDisruptions={disruptions} />);

      expect(screen.queryByText('Wembley Event')).not.toBeInTheDocument();
    });
  });

  describe('Expanded state', () => {
    it('shows Wembley event day section with disruption details when expanded', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption()]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Wembley Event Day')).toBeInTheDocument();
      expect(screen.getByText('Wembley Event Day Service Change')).toBeInTheDocument();
      expect(screen.getByText(/Bus 206 service disrupted due to Wembley Stadium event/)).toBeInTheDocument();
    });

    it('shows active status as "Yes" for active Wembley disruption', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption({ isActive: true })]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Active: Yes')).toBeInTheDocument();
    });

    it('shows active status as "No" for inactive Wembley disruption', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption({ isActive: false })]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Active: No')).toBeInTheDocument();
    });

    it('shows affected line for Wembley disruption', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption()]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Affected Line: 206')).toBeInTheDocument();
    });

    it('shows mode for Wembley disruption', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption()]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Mode: bus')).toBeInTheDocument();
    });

    it('shows timestamps for Wembley disruption', () => {
      const startDate = new Date('2025-10-19T13:00:00Z');
      const endDate = new Date('2025-10-19T23:00:00Z');
      const startStr = startDate.toLocaleString();
      const endStr = endDate.toLocaleString();

      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [createWembleyDisruption({ startDate, endDate })]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText(`Start: ${startStr}`)).toBeInTheDocument();
      expect(screen.getByText(`End: ${endStr}`)).toBeInTheDocument();
    });

    it('does not show Wembley section when no Wembley disruptions', () => {
      const disruptions = createBaseRouteDisruptions();
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.queryByText('Wembley Event Day')).not.toBeInTheDocument();
    });

    it('shows "No disruptions reported" when both TfL and Wembley are empty', () => {
      const disruptions = createBaseRouteDisruptions();
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('No disruptions reported')).toBeInTheDocument();
    });

    it('shows both TfL disruptions and Wembley section when both present', () => {
      const tflDisruption: ProcessedDisruption = {
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

      const disruptions = createBaseRouteDisruptions({
        groupedDisruptions: [{
          id: 'group-tfl',
          type: 'Service Change',
          description: 'Test TfL disruption',
          mode: 'bus',
          startDate: new Date('2025-10-19T10:00:00Z'),
          endDate: new Date('2025-10-19T20:00:00Z'),
          isActive: true,
          source: 'line',
          affectedLines: ['206'],
          affectedStopPoints: ['490000257O'],
          affectedStopNames: [],
          originalDisruptions: [tflDisruption]
        }],
        wembleyEventDisruptions: [createWembleyDisruption()]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('Wembley Event Day')).toBeInTheDocument();
      expect(screen.getByText('Test TfL disruption')).toBeInTheDocument();
      expect(screen.getByText(/Bus 206 service disrupted due to Wembley Stadium event/)).toBeInTheDocument();
    });

    it('renders multiple Wembley events on the same day', () => {
      const disruptions = createBaseRouteDisruptions({
        wembleyEventDisruptions: [
          createWembleyDisruption({ id: 'event-1', description: 'First event' }),
          createWembleyDisruption({ id: 'event-2', description: 'Second event' })
        ]
      });
      render(<RouteCard routeDisruptions={disruptions} isExpanded={true} />);

      expect(screen.getByText('First event')).toBeInTheDocument();
      expect(screen.getByText('Second event')).toBeInTheDocument();
    });
  });
});
