import { TflStopPointDisruption, TflLineDisruption, ProcessedDisruption } from '../types/tfl';

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
   * Fetch line disruptions for given line IDs
   */
  async getLineDisruptions(lineIds: string[]): Promise<TflLineDisruption[]> {
    if (lineIds.length === 0) {
      return [];
    }

    const url = `${this.baseUrl}/Line/${lineIds.join(',')}/Disruption`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TfL API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching line disruptions:', error);
      throw new Error(`Failed to fetch line disruptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * Process line disruptions into our internal format
   */
  processLineDisruptions(disruptions: TflLineDisruption[]): ProcessedDisruption[] {
    return disruptions.map(disruption => this.processLineDisruption(disruption));
  }

  private processLineDisruption(disruption: TflLineDisruption): ProcessedDisruption {
    // Use created/lastUpdate if available, otherwise use current time
    const startDate = disruption.created ? new Date(disruption.created) : new Date();
    const endDate = disruption.lastUpdate ? new Date(disruption.lastUpdate) : new Date();

    return {
      id: `line-${disruption.category}-${disruption.created || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: disruption.type,
      description: disruption.description,
      mode: this.inferModeFromDescription(disruption.description),
      startDate,
      endDate,
      isActive: this.isLineDisruptionActive(disruption),
      source: 'line',
      lineId: this.extractLineIdFromDescription(disruption.description)
    };
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

  private isLineDisruptionActive(disruption: TflLineDisruption): boolean {
    // For line disruptions, if there's a lastUpdate, assume it's active if recent
    if (disruption.lastUpdate) {
      const lastUpdate = new Date(disruption.lastUpdate);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      // Consider active if updated within last 24 hours
      return hoursDiff <= 24;
    }
    
    // If no timestamp info, assume active for real-time disruptions
    return disruption.category === 'RealTime';
  }

  private isStopPointDisruptionActive(disruption: TflStopPointDisruption): boolean {
    const now = new Date();
    const startDate = new Date(disruption.fromDate);
    const endDate = new Date(disruption.toDate);
    
    return now >= startDate && now <= endDate;
  }
}