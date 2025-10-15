import { TflApiClient } from './tflApi';
import { RouteDefinition, RouteDisruptions, ProcessedDisruption, GroupedDisruption } from '../types/tfl';
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
      // Fetch all line status and stop point disruptions in parallel
      const [lineStatusResponses, stopDisruptions] = await Promise.all([
        this.tflClient.getLineStatus(ALL_LINE_IDS),
        this.tflClient.getStopPointDisruptions(getAllStopPointIds())
      ]);

      // Process the raw disruptions using the correct methods
      const processedLineDisruptions = this.tflClient.processLineStatusResponses(lineStatusResponses);
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
      const [lineStatusResponses, stopDisruptions] = await Promise.all([
        this.tflClient.getLineStatus(lineIds),
        this.tflClient.getStopPointDisruptions(stopPointIds)
      ]);

      // Process the raw disruptions using the correct methods
      const processedLineDisruptions = this.tflClient.processLineStatusResponses(lineStatusResponses);
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
    const relevantLineDisruptions = lineDisruptions.filter(disruption => {
      // First check if the lineId matches any route segment
      if (disruption.lineId && routeLineIds.some(routeLineId => routeLineId.includes(disruption.lineId!))) {
        // If we have specific affected stop points, use those (most granular)
        if (disruption.affectedStopPoints && disruption.affectedStopPoints.length > 0) {
          // Only include if at least one affected stop point is in our route
          return disruption.affectedStopPoints.some(stopId => routeStopIds.includes(stopId));
        }
        
        // Fallback: Check if any affected routes match our route definition
        if (disruption.affectedRoutes && disruption.affectedRoutes.length > 0) {
          return this.isRouteAffectedByDisruption(route, disruption);
        }
        
        // If no affected routes or stop points specified, include the disruption (affects entire line)
        return true;
      }
      return false;
    });

    const relevantStopDisruptions = stopDisruptions.filter(disruption =>
      // For stop point disruptions, check if either the stopPointId (atcoCode) or stationAtcoCode matches any route stop
      (disruption.stopPointId && routeStopIds.includes(disruption.stopPointId)) ||
      (disruption.stationAtcoCode && routeStopIds.includes(disruption.stationAtcoCode))
    );

    // Group disruptions by description text
    const allDisruptions = [...relevantLineDisruptions, ...relevantStopDisruptions];
    const groupedDisruptions = this.groupDisruptionsByDescription(allDisruptions);

    return {
      route,
      lineDisruptions: relevantLineDisruptions,
      stopDisruptions: relevantStopDisruptions,
      groupedDisruptions,
    };
  }

  /**
   * Check if a route is affected by a disruption based on affected routes and stop points
   */
  private isRouteAffectedByDisruption(route: RouteDefinition, disruption: ProcessedDisruption): boolean {
    const routeStopIds = this.getRouteStopPointIds(route);
    
    // Check each affected route from the TfL API
    if (disruption.affectedRoutes) {
      for (const affectedRoute of disruption.affectedRoutes) {
        // Check if any stop points in the affected route match our monitored route
        if (affectedRoute.routeSectionNaptanEntrySequence) {
          for (const entry of affectedRoute.routeSectionNaptanEntrySequence) {
            if (entry.stopPoint) {
              // Check all possible identifiers for the stop point
              const stopIdentifiers = [
                entry.stopPoint.naptanId,
                entry.stopPoint.id,
                entry.stopPoint.stationNaptan
              ].filter((id): id is string => Boolean(id)); // Remove undefined values with type guard
              
              // If any identifier matches our route stop points, this route is affected
              if (stopIdentifiers.some(stopId => routeStopIds.includes(stopId))) {
                return true;
              }
            }
          }
        }
      }
    }
    
    return false;
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

  /**
   * Group disruptions by identical description text
   */
  private groupDisruptionsByDescription(disruptions: ProcessedDisruption[]): GroupedDisruption[] {
    // Group by exact description match
    const descriptionGroups = new Map<string, ProcessedDisruption[]>();
    
    disruptions.forEach(disruption => {
      const description = disruption.description.trim();
      if (!descriptionGroups.has(description)) {
        descriptionGroups.set(description, []);
      }
      descriptionGroups.get(description)!.push(disruption);
    });

    // Convert groups to GroupedDisruption objects
    const groupedDisruptions: GroupedDisruption[] = [];
    
    descriptionGroups.forEach((disruptionsInGroup, description) => {
      if (disruptionsInGroup.length === 0) return;

      // Collect all unique affected lines and stop points
      const affectedLines = new Set<string>();
      const affectedStopPoints = new Set<string>();
      const affectedStopNames = new Set<string>();
      
      // Determine date range (min start, max end)
      let minStartDate = disruptionsInGroup[0].startDate;
      let maxEndDate = disruptionsInGroup[0].endDate;
      
      // Determine if any disruption in the group is active
      let isActive = false;
      
      // Determine source type
      const sources = new Set<string>();
      
      // Aggregate modes (should be consistent within a group typically)
      const modes = new Set<string>();
      const types = new Set<string>();

      disruptionsInGroup.forEach(disruption => {
        // Collect affected lines
        if (disruption.lineId) {
          affectedLines.add(disruption.lineId);
        }
        if (disruption.affectedStopPoints) {
          disruption.affectedStopPoints.forEach(stopId => affectedStopPoints.add(stopId));
        }
        
        // Collect affected stop points and names
        if (disruption.stopPointId) {
          affectedStopPoints.add(disruption.stopPointId);
        }
        if (disruption.stationAtcoCode) {
          affectedStopPoints.add(disruption.stationAtcoCode);
        }
        if (disruption.commonName) {
          affectedStopNames.add(disruption.commonName);
        }
        
        // Update date range
        if (disruption.startDate < minStartDate) {
          minStartDate = disruption.startDate;
        }
        if (disruption.endDate > maxEndDate) {
          maxEndDate = disruption.endDate;
        }
        
        // Check if any disruption is active
        if (disruption.isActive) {
          isActive = true;
        }
        
        // Collect source types
        sources.add(disruption.source);
        modes.add(disruption.mode);
        types.add(disruption.type);
      });

      // Determine overall source type
      let source: 'stopPoint' | 'line' | 'mixed';
      if (sources.size === 1) {
        source = Array.from(sources)[0] as 'stopPoint' | 'line';
      } else {
        source = 'mixed';
      }

      // Use the most common mode and type
      const mode = Array.from(modes)[0] || 'unknown';
      const type = Array.from(types)[0] || 'Unknown';

      // Generate a stable ID for the group
      const groupId = `group-${description.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}-${Array.from(affectedLines).sort().join(',')}-${Array.from(affectedStopPoints).sort().join(',').substring(0, 50)}`;

      groupedDisruptions.push({
        id: groupId,
        type,
        description,
        mode,
        startDate: minStartDate,
        endDate: maxEndDate,
        isActive,
        source,
        affectedLines: Array.from(affectedLines).sort(),
        affectedStopPoints: Array.from(affectedStopPoints).sort(),
        affectedStopNames: Array.from(affectedStopNames).sort(),
        originalDisruptions: disruptionsInGroup
      });
    });

    return groupedDisruptions;
  }
}