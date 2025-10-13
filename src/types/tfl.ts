/**
 * TypeScript interfaces for TfL API responses - CORRECTED based on actual API
 */

// Actual response from StopPoint Disruption API
export interface TflStopPointDisruption {
  $type?: string; // TfL metadata
  atcoCode: string;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
  description: string;
  commonName: string;
  type: string; // e.g., "Closure"
  mode: string; // e.g., "bus"
  stationAtcoCode: string;
  appearance: string; // e.g., "Information"
}

// Actual response from Line Disruption API
export interface TflLineDisruption {
  $type?: string; // TfL metadata
  category: string; // e.g., "RealTime"
  type: string; // e.g., "lineInfo", "routeInfo"
  categoryDescription: string; // e.g., "RealTime"
  description: string; // Human-readable disruption description
  created?: string; // ISO date string (optional)
  lastUpdate?: string; // ISO date string (optional)
  affectedRoutes: any[]; // Currently empty arrays in real responses
  affectedStops: any[]; // Currently empty arrays in real responses
  closureText?: string; // e.g., "minorDelays"
}

// Union type for any TfL disruption
export type TflDisruption = TflStopPointDisruption | TflLineDisruption;

export interface StopPoint {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  stopType?: string;
  accessibilitySummary?: string;
  hasDisruption?: boolean;
  lines?: LineInfo[];
  lineGroup?: LineGroup[];
  lineModeGroups?: LineModeGroup[];
}

export interface LineGroup {
  naptanIdReference: string;
  stationAtcoCode: string;
  lineIdentifier: string[];
}

export interface LineModeGroup {
  modeName: string;
  lineIdentifier: string[];
}

// Route definitions for our application
export interface RouteDefinition {
  id: string;
  name: string;
  description: string;
  segments: RouteSegment[];
}

export interface RouteSegment {
  id: string;
  lineId: string;
  lineName: string;
  mode: 'bus' | 'tube' | 'rail';
  stopPoints: StopPointInfo[];
  direction: 'outbound' | 'inbound';
}

export interface StopPointInfo {
  id: string;
  name: string;
  order: number;
}

// Processed disruption data for the UI
export interface ProcessedDisruption {
  id: string;
  type: string;
  description: string;
  commonName?: string; // Stop name for stop point disruptions
  severity: 'low' | 'medium' | 'high' | 'severe';
  mode: string; // bus, tube, rail, etc.
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  source: 'stopPoint' | 'line'; // Which API this came from
  stopPointId?: string; // For stop point disruptions
  lineId?: string; // For line disruptions
}

export interface RouteDisruptions {
  route: RouteDefinition;
  lineDisruptions: ProcessedDisruption[];
  stopDisruptions: ProcessedDisruption[];
  overallStatus: 'good' | 'minor' | 'major' | 'severe';
}