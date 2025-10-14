import { TflApiClient } from './tflApi';
import { RouteDefinition, RouteDisruptions, ProcessedDisruption } from '../types/tfl';
import { ALL_ROUTES, ALL_LINE_IDS, getAllStopPointIds } from '../data/routes';

/**
 * Service for managing route-based disruption data
 */
export class RouteDisruptionService {
  private tflClient: TflApiClient;

  constructor(tflClient?: TflApiClient) {
    this.tflClient = tflClient || new TflApiClient();
  }

  /**
   * Fetch all disruptions for all monitored routes
   */
  async getAllRouteDisruptions(): Promise<RouteDisruptions[]> {
    try {
      // Fetch all line and stop point disruptions in parallel
      const [lineDisruptions, stopDisruptions] = await Promise.all([
        this.tflClient.getLineDisruptions(ALL_LINE_IDS),
        this.tflClient.getStopPointDisruptions(getAllStopPointIds())
      ]);

      // Process the raw disruptions using the correct methods
      const processedLineDisruptions = this.tflClient.processLineDisruptions(lineDisruptions);
      const processedStopDisruptions = this.tflClient.processStopPointDisruptions(stopDisruptions);

      // Map disruptions to routes
      return ALL_ROUTES.map(route => 
        this.mapDisruptionsToRoute(route, processedLineDisruptions, processedStopDisruptions)
      );
    } catch (error) {
      console.error('Error fetching route disruptions:', error);
      throw new Error(`Failed to fetch route disruptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch disruptions for a specific route
   */
  async getRouteDisruptions(routeId: string): Promise<RouteDisruptions | null> {
    const route = ALL_ROUTES.find(r => r.id === routeId);
    if (!route) {
      throw new Error(`Route not found: ${routeId}`);
    }

    try {
      // Get line IDs and stop point IDs for this specific route
      const lineIds = this.getRouteLineIds(route);
      const stopPointIds = this.getRouteStopPointIds(route);

      // Fetch disruptions
      const [lineDisruptions, stopDisruptions] = await Promise.all([
        this.tflClient.getLineDisruptions(lineIds),
        this.tflClient.getStopPointDisruptions(stopPointIds)
      ]);

      // Process the raw disruptions using the correct methods
      const processedLineDisruptions = this.tflClient.processLineDisruptions(lineDisruptions);
      const processedStopDisruptions = this.tflClient.processStopPointDisruptions(stopDisruptions);

      return this.mapDisruptionsToRoute(route, processedLineDisruptions, processedStopDisruptions);
    } catch (error) {
      console.error(`Error fetching disruptions for route ${routeId}:`, error);
      throw new Error(`Failed to fetch disruptions for route ${routeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map processed disruptions to a specific route
   */
  private mapDisruptionsToRoute(
    route: RouteDefinition,
    lineDisruptions: ProcessedDisruption[],
    stopDisruptions: ProcessedDisruption[]
  ): RouteDisruptions {
    const routeLineIds = this.getRouteLineIds(route);
    const routeStopIds = this.getRouteStopPointIds(route);

    // Filter disruptions relevant to this route
    const relevantLineDisruptions = lineDisruptions.filter(disruption =>
      // For line disruptions, check if the lineId matches any route segment
      disruption.lineId && routeLineIds.some(routeLineId => routeLineId.includes(disruption.lineId!))
    );

    const relevantStopDisruptions = stopDisruptions.filter(disruption =>
      // For stop point disruptions, check if either the stopPointId (atcoCode) or stationAtcoCode matches any route stop
      (disruption.stopPointId && routeStopIds.includes(disruption.stopPointId)) ||
      (disruption.stationAtcoCode && routeStopIds.includes(disruption.stationAtcoCode))
    );

    return {
      route,
      lineDisruptions: relevantLineDisruptions,
      stopDisruptions: relevantStopDisruptions,
    };
  }

  /**
   * Get all line IDs used by a route
   */
  private getRouteLineIds(route: RouteDefinition): string[] {
    const lineIds = new Set<string>();
    
    route.segments.forEach(segment => {
      // Handle comma-separated line IDs (e.g., "206,224")
      segment.lineId.split(',').forEach(id => lineIds.add(id.trim()));
    });

    return Array.from(lineIds);
  }

  /**
   * Get all stop point IDs used by a route
   */
  private getRouteStopPointIds(route: RouteDefinition): string[] {
    const stopIds = new Set<string>();
    
    route.segments.forEach(segment => {
      segment.stopPoints.forEach(stop => stopIds.add(stop.id));
    });

    return Array.from(stopIds);
  }

  /**
   * Get routes by direction
   */
  getRoutesByDirection(): { outbound: RouteDefinition[], inbound: RouteDefinition[] } {
    const outbound = ALL_ROUTES.filter(route => route.id.includes('outbound'));
    const inbound = ALL_ROUTES.filter(route => route.id.includes('inbound'));
    
    return { outbound, inbound };
  }

  /**
   * Get route by ID
   */
  getRoute(routeId: string): RouteDefinition | undefined {
    return ALL_ROUTES.find(route => route.id === routeId);
  }

  /**
   * Get all routes
   */
  getAllRoutes(): RouteDefinition[] {
    return [...ALL_ROUTES];
  }
}