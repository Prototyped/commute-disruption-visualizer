import { TflStopPointDisruption, TflLineStatusResponse, TflLineStatus, TflDisruptionDetail, ProcessedDisruption } from '../types/tfl';

/**
 * TfL API client for fetching disruption data
 */

const BASE_URL = 'https://api.tfl.gov.uk';

export class TflApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch line status for given line IDs with detailed disruption information
   */
  async getLineStatus(lineIds: string[]): Promise<TflLineStatusResponse[]> {
    if (lineIds.length === 0) {
      return [];
    }

    // TfL API has URL length limits, so batch requests if needed
    const batchSize = 10; // Conservative batch size
    const batches: string[][] = [];
    
    for (let i = 0; i < lineIds.length; i += batchSize) {
      batches.push(lineIds.slice(i, i + batchSize));
    }

    const allLineStatuses: TflLineStatusResponse[] = [];

    for (const batch of batches) {
      const url = `${this.baseUrl}/Line/${batch.join(',')}/Status?detail=true`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`TfL API warning for line status batch: ${response.status} ${response.statusText}`);
          continue; // Continue with other batches
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          allLineStatuses.push(...data);
        }
      } catch (error) {
        console.error('Error fetching line status batch:', error);
        // Continue with other batches rather than failing completely
      }
    }

    return allLineStatuses;
  }

  /**
   * Fetch stop point disruptions for given stop point IDs
   */
  async getStopPointDisruptions(stopPointIds: string[]): Promise<TflStopPointDisruption[]> {
    if (stopPointIds.length === 0) {
      return [];
    }

    // TfL API has URL length limits, so batch requests if needed
    const batchSize = 10; // Conservative batch size
    const batches: string[][] = [];
    
    for (let i = 0; i < stopPointIds.length; i += batchSize) {
      batches.push(stopPointIds.slice(i, i + batchSize));
    }

    const allDisruptions: TflStopPointDisruption[] = [];

    for (const batch of batches) {
      const url = `${this.baseUrl}/StopPoint/${batch.join(',')}/Disruption`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`TfL API warning for batch: ${response.status} ${response.statusText}`);
          continue; // Continue with other batches
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          allDisruptions.push(...data);
        }
      } catch (error) {
        console.error('Error fetching stop point disruptions batch:', error);
        // Continue with other batches rather than failing completely
      }
    }

    return allDisruptions;
  }

  /**
   * Process stop point disruptions into our internal format
   */
  processStopPointDisruptions(disruptions: TflStopPointDisruption[]): ProcessedDisruption[] {
    return disruptions.map(disruption => this.processStopPointDisruption(disruption));
  }

  /**
   * Process line status responses into our internal format
   */
  processLineStatusResponses(lineStatuses: TflLineStatusResponse[]): ProcessedDisruption[] {
    const allDisruptions: ProcessedDisruption[] = [];
    
    for (const lineStatus of lineStatuses) {
      // Extract disruptions from lineStatuses array
      for (const status of lineStatus.lineStatuses) {
        if (status.disruption) {
          const disruption = this.processLineStatusDisruption(status, lineStatus.id, lineStatus.modeName);
          if (disruption) {
            allDisruptions.push(disruption);
          }
        }
      }
      
      // Also check the optional top-level disruptions array (if present)
      if (lineStatus.disruptions && lineStatus.disruptions.length > 0) {
        // Handle legacy disruptions if present
        console.warn('Legacy disruptions array found in line status response');
      }
    }
    
    return allDisruptions;
  }

  private processLineStatusDisruption(status: TflLineStatus, lineId: string, modeName: string): ProcessedDisruption | null {
    if (!status.disruption) {
      return null;
    }

    const disruption = status.disruption;
    
    // Extract dates from validity periods
    const validityPeriod = status.validityPeriods?.[0];
    const startDate = validityPeriod?.fromDate ? new Date(validityPeriod.fromDate) : new Date(disruption.created);
    const endDate = validityPeriod?.toDate ? new Date(validityPeriod.toDate) : new Date();

    return {
      id: `linestatus-${lineId}-${disruption.created}-${Math.random().toString(36).substr(2, 9)}`,
      type: status.statusSeverityDescription,
      description: disruption.description,
      mode: modeName,
      startDate,
      endDate,
      isActive: this.isLineStatusDisruptionActive(status),
      source: 'line',
      lineId: lineId,
      affectedStopPoints: this.extractAffectedStopPoints(disruption),
      affectedRoutes: disruption.affectedRoutes
    };
  }

  /**
   * Extract affected stop points from a line status disruption
   */
  private extractAffectedStopPoints(disruption: TflDisruptionDetail): string[] {
    const affectedStops: string[] = [];
    
    // Extract from affectedRoutes -> routeSectionNaptanEntrySequence (primary source)
    if (disruption.affectedRoutes) {
      for (const route of disruption.affectedRoutes) {
        if (route.routeSectionNaptanEntrySequence) {
          for (const entry of route.routeSectionNaptanEntrySequence) {
            if (entry.stopPoint) {
              // Use naptanId as the primary identifier
              affectedStops.push(entry.stopPoint.naptanId);
              // Also include id if different from naptanId
              if (entry.stopPoint.id && entry.stopPoint.id !== entry.stopPoint.naptanId) {
                affectedStops.push(entry.stopPoint.id);
              }
              // Also include stationNaptan if different and present
              if (entry.stopPoint.stationNaptan && 
                  entry.stopPoint.stationNaptan !== entry.stopPoint.naptanId &&
                  entry.stopPoint.stationNaptan !== entry.stopPoint.id) {
                affectedStops.push(entry.stopPoint.stationNaptan);
              }
            }
          }
        }
      }
    }
    
    // Extract from affectedStops (fallback, usually empty)
    if (disruption.affectedStops) {
      for (const stop of disruption.affectedStops) {
        affectedStops.push(stop.id);
      }
    }
    
    // Remove duplicates
    return [...new Set(affectedStops)];
  }

  private processStopPointDisruption(disruption: TflStopPointDisruption): ProcessedDisruption {
    const startDate = new Date(disruption.fromDate);
    const endDate = new Date(disruption.toDate);

    return {
      id: `stoppoint-${disruption.atcoCode}-${disruption.fromDate}-${Math.random().toString(36).substr(2, 9)}`,
      type: disruption.type,
      description: disruption.description,
      commonName: disruption.commonName,
      mode: disruption.mode,
      startDate,
      endDate,
      isActive: this.isStopPointDisruptionActive(disruption),
      source: 'stopPoint',
      stopPointId: disruption.atcoCode,
      stationAtcoCode: disruption.stationAtcoCode
    };
  }

  private inferModeFromDescription(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('central line') || desc.includes('metropolitan') || desc.includes('bakerloo') || 
        desc.includes('circle') || desc.includes('hammersmith')) {
      return 'tube';
    }
    
    if (desc.includes('elizabeth line')) {
      return 'rail';
    }
    
    if (desc.includes('route ') || desc.includes('bus')) {
      return 'bus';
    }
    
    return 'unknown';
  }

  private extractLineIdFromDescription(description: string): string | undefined {
    const desc = description.toLowerCase();
    
    // Try to extract line names from description
    if (desc.includes('central line')) return 'central';
    if (desc.includes('metropolitan')) return 'metropolitan';
    if (desc.includes('bakerloo')) return 'bakerloo';
    if (desc.includes('circle line')) return 'circle';
    if (desc.includes('hammersmith')) return 'hammersmith-city';
    if (desc.includes('elizabeth line')) return 'elizabeth';
    
    // Try to extract bus route numbers
    const busMatch = desc.match(/route (\d+)/);
    if (busMatch) return busMatch[1];
    
    return undefined;
  }

  private isLineStatusDisruptionActive(status: TflLineStatus): boolean {
    // Check validity periods first
    for (const period of status.validityPeriods) {
      if (period.isNow) {
        return true;
      }
      
      // Also check if we're within the validity period
      const now = new Date();
      const fromDate = new Date(period.fromDate);
      const toDate = new Date(period.toDate);
      
      if (now >= fromDate && now <= toDate) {
        return true;
      }
    }
    
    // If no valid periods, check if it's a real-time disruption
    return status.disruption?.category === 'RealTime';
  }

  private isStopPointDisruptionActive(disruption: TflStopPointDisruption): boolean {
    const now = new Date();
    const startDate = new Date(disruption.fromDate);
    const endDate = new Date(disruption.toDate);
    
    return now >= startDate && now <= endDate;
  }
}