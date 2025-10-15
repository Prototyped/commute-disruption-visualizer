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

// Actual response from Line Status API
export interface TflLineStatusResponse {
    $type?: string;
    id: string;
    name: string;
    modeName: string;
    disruptions?: TflLineDisruption[];
    created: string;
    modified: string;
    lineStatuses: TflLineStatus[];
    routeSections?: TflRouteSection[];
    serviceTypes?: TflServiceType[];
    crowding?: unknown;
}

export interface TflLineStatus {
    $type?: string;
    id: number;
    lineId: string;
    statusSeverity: number;
    statusSeverityDescription: string;
    reason?: string;
    created: string;
    validityPeriods: TflValidityPeriod[];
    disruption?: TflDisruptionDetail;
}

export interface TflValidityPeriod {
    $type?: string;
    fromDate: string;
    toDate: string;
    isNow: boolean;
}

export interface TflDisruptionDetail {
    $type?: string;
    category: string;
    categoryDescription: string;
    description: string;
    created: string;
    affectedRoutes?: TflAffectedRoute[];
    affectedStops?: TflAffectedStop[];
    closureText?: string;
}

export interface TflAffectedRoute {
    $type?: string;
    id: string;
    name: string;
    direction: string;
    originationName: string;
    destinationName: string;
    isEntireRouteSection: boolean;
    routeSectionNaptanEntrySequence: TflRouteSectionNaptanEntry[];
}

export interface TflRouteSectionNaptanEntry {
    $type?: string;
    ordinal: number;
    stopPoint: TflStopPointDetail;
}

export interface TflStopPointDetail {
    $type?: string;
    naptanId: string;
    indicator?: string;
    stopLetter?: string;
    modes: string[];
    icsCode: string;
    stationNaptan?: string;
    lines: unknown[];
    lineGroup: unknown[];
    lineModeGroups: unknown[];
    status: boolean;
    id: string;
    commonName: string;
    placeType: string;
    additionalProperties: unknown[];
    children: unknown[];
    lat: number;
    lon: number;
}

export interface TflAffectedStop {
    $type?: string;
    id: string;
    commonName: string;
    placeType: string;
    modes: string[];
    stopType?: string;
    status: boolean;
}

export interface TflRouteSection {
    $type?: string;
    originationName: string;
    destinationName: string;
}

export interface TflServiceType {
    $type?: string;
    name: string;
    uri: string;
}

// Legacy interface for Line Disruption API (to be removed)
export interface TflLineDisruption {
    $type?: string;
    category: string;
    type: string;
    categoryDescription: string;
    description: string;
    created?: string;
    lastUpdate?: string;
    affectedRoutes: Array<{
        $type: string;
        id: string;
        name: string;
        direction?: string;
        originationName: string;
        destinationName: string;
        isActive: boolean;
    }>;
    affectedStops: Array<{
        $type: string;
        id: string;
        commonName: string;
        placeType: string;
        modes: string[];
        stopType: string;
        status: boolean;
    }>;
    closureText?: string;
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

export interface LineInfo {
    id: string;
    name: string;
    modeName: string;
    crowding?: {
        $type: string;
        type: string;
    };
    disruptions: TflLineDisruption[];
    created?: string;
    modified?: string;
    lineStatuses: Array<{
        $type: string;
        id: number;
        lineId: string;
        statusSeverity: number;
        statusSeverityDescription: string;
        reason?: string;
        validityPeriods: Array<{
            $type: string;
            fromDate: string;
            toDate: string;
            isNow: boolean;
        }>;
    }>;
    routeSections: Array<{
        $type: string;
        originationName: string;
        destinationName: string;
    }>;
    serviceTypes: Array<{
        $type: string;
        name: string;
        uri: string;
    }>;
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
  mode: string; // bus, tube, rail, etc.
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  source: 'stopPoint' | 'line'; // Which API this came from
  stopPointId?: string; // For stop point disruptions (from atcoCode)
  stationAtcoCode?: string; // For stop point disruptions (from stationAtcoCode)
  lineId?: string; // For line disruptions
  affectedStopPoints?: string[]; // For line status disruptions - list of affected stop point IDs
  affectedRoutes?: TflAffectedRoute[]; // Original affected routes data from TfL API
}

// Grouped disruption data for display - combines disruptions with identical descriptions
export interface GroupedDisruption {
  id: string;
  type: string;
  description: string;
  mode: string;
  startDate: Date; // Minimum start date across all grouped disruptions
  endDate: Date; // Maximum end date across all grouped disruptions
  isActive: boolean; // True if any disruption in the group is active
  source: 'stopPoint' | 'line' | 'mixed'; // Mixed if group contains both types
  affectedLines: string[]; // All unique line IDs affected
  affectedStopPoints: string[]; // All unique stop point IDs affected
  affectedStopNames: string[]; // All unique stop names affected
  originalDisruptions: ProcessedDisruption[]; // Reference to original disruptions for debugging
}

export interface RouteDisruptions {
  route: RouteDefinition;
  lineDisruptions: ProcessedDisruption[];
  stopDisruptions: ProcessedDisruption[];
  groupedDisruptions: GroupedDisruption[]; // New grouped view
}