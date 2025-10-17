# TfL Disruption Monitoring System

## Overview

This project creates a React-based web application to visualize Transport for London (TfL) disruptions organized by specific travel routes. The application queries TfL's public APIs to fetch disruption information for both transit lines and stop points.

## Development Instructions

### Initial Setup
1. **Set up a basic build system for a TypeScript project** with:
   - TypeScript compilation with strict type checking
   - ESLint for code linting  
   - Jest for testing
   - Automated build scripts
   - Development and production workflows

2. **Examine the TfL API responses** to determine correct data modeling:
   - **Stop Point Disruptions**: `https://api.tfl.gov.uk/StopPoint/490014520N,490014520S,490003818E/Disruption`
   - **Line Disruptions**: `https://api.tfl.gov.uk/Line/central,94/Disruption`
   - Model TypeScript interfaces based on actual API responses, not assumptions

3. **Create failing tests first** and then implement logic to make them pass
4. **Build React application** using the implemented logic

### API Endpoints

#### Line Disruptions
- **Endpoint**: `https://api.tfl.gov.uk/Line/{line_ids}/Disruption`
- **Example**: `https://api.tfl.gov.uk/Line/metropolitan,bakerloo,elizabeth,112,206,224/Disruption`
- **Real Example**: `https://api.tfl.gov.uk/Line/central,94/Disruption`
- **Documentation**: https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_DisruptionByPathIds

#### Stop Point Disruptions  
- **Endpoint**: `https://api.tfl.gov.uk/StopPoint/{stop_point_ids}/Disruption`
- **Example**: `https://api.tfl.gov.uk/StopPoint/490008746N,490G00008463,490G00004297/Disruption`
- **Real Example**: `https://api.tfl.gov.uk/StopPoint/490014520N,490014520S,490003818E/Disruption`
- **Documentation**: https://api-portal.tfl.gov.uk/api-details#api=StopPoint&operation=StopPoint_DisruptionByPathIdsQueryGetFamilyQueryIncludeRouteBlockedStopsQuer

### API Response Structures (Verified)

#### Stop Point Disruption Response
```json
[
  {
    "atcoCode": "490014520N",
    "fromDate": "2025-09-15T07:00:00Z",
    "toDate": "2025-10-19T15:00:00Z", 
    "description": "This bus stop is closed due to SGN works...",
    "commonName": "West Way",
    "type": "Closure",
    "mode": "bus",
    "stationAtcoCode": "490G00014520",
    "appearance": "Information"
  }
]
```

#### Line Disruption Response
```json
[
  {
    "category": "RealTime",
    "type": "lineInfo",
    "categoryDescription": "RealTime",
    "description": "Central Line: Minor delays between Leytonstone and Epping...",
    "created": "2025-10-08T08:47:00Z",
    "lastUpdate": "2025-10-08T15:15:00Z",
    "affectedRoutes": [],
    "affectedStops": [],
    "closureText": "minorDelays"
  }
]
```

## Routes to Monitor

The application monitors disruptions for the following routes in both directions:

### Route 1: Kingfisher Way to Liverpool Street via Wembley Park
**Outbound**: Bus 206 → Metropolitan Line
- Bus 206: Kingfisher Way → Wembley Park Station
- Metropolitan Line: Wembley Park Station → Baker Street → Liverpool Street Station

**Inbound**: Metropolitan Line → Bus 206
- Metropolitan Line: Liverpool Street Station → Baker Street → Wembley Park Station
- Bus 206: Wembley Park Station → Kingfisher Way

### Route 2: Kingfisher Way to Liverpool Street via Harlesden
**Outbound**: Bus 206/224 → Bakerloo Line → Hammersmith & City/Circle Line
- Bus 206 or 224: Kingfisher Way → Harlesden Station
- Bakerloo Line: Harlesden Station → Baker Street
- Hammersmith & City Line or Circle Line: Baker Street → Liverpool Street Station

**Inbound**: Hammersmith & City/Circle Line → Bakerloo Line → Bus 206/224
- Hammersmith & City Line or Circle Line: Liverpool Street Station → Baker Street
- Bakerloo Line: Baker Street → Harlesden Station
- Bus 206 or 224: Harlesden Station → Kingfisher Way

### Route 3: Normansmead to Liverpool Street via Ealing Broadway
**Outbound**: Bus 112 → Elizabeth Line
- Bus 112: Normansmead → Haven Grn/Ealing Broadway Station
- Elizabeth Line: Ealing Broadway Station → Liverpool Street Station

**Inbound**: Elizabeth Line → Bus 112
- Elizabeth Line: Liverpool Street Station → Ealing Broadway Station
- Bus 112: Haven Grn/Ealing Broadway Station → Wrights Place

## Lines

| Line Name | TfL Identifier |
|-----------|----------------|
| Metropolitan Line | `metropolitan` |
| Hammersmith and City Line | `hammersmith-city` |
| Circle Line | `circle` |
| Bakerloo Line | `bakerloo` |
| Elizabeth Line | `elizabeth` |
| Bus route 112 | `112` |
| Bus route 206 | `206` |
| Bus route 224 | `224` |

## Stop Points

### Bus 206: Kingfisher Way → Wembley Park Station
```
490G00008746:Kingfisher Way
490G00008463:IKEA Brent Park/Drury Way
490G00004297:Brent Park Tesco
490G00007753:Hannah Close
490G00013614:Third Way
490G00006858:First Way
490G00010593:Olympic Way
490G00011818:Rutherford Way
490G00007063:Fulton Road
490G00006565:Empire Way
490000257M:Wembley Park Station
```

### Bus 206: Wembley Park Station → Kingfisher Way
```
490000257O:Wembley Park Station
490G00006565:Empire Way
490G00007063:Fulton Road
490G00011818:Rutherford Way
490G00010593:Olympic Way
490G00006858:First Way
490G00013614:Third Way
490G00007753:Hannah Close
490G00004297:Brent Park Tesco
490G00008456:IKEA Brent Park
490G00008746:Kingfisher Way
```

### Metropolitan Line: Wembley Park ↔ Liverpool Street
```
940GZZLUWYP:Wembley Park
940GZZLUFYR:Finchley Road
940GZZLUBST:Baker Street
940GZZLUGPS:Great Portland Street
940GZZLUESQ:Euston Square
940GZZLUKSX:King's Cross St. Pancras
940GZZLUFCN:Farringdon
940GZZLUBBN:Barbican
940GZZLUMGT:Moorgate
940GZZLULVT:Liverpool Street
```

### Bus 206/224: Kingfisher Way → Harlesden Station
```
490G00008746:Kingfisher Way
490G00013098:Swaminarayan Temple
490G00012018:Gloucester Close
490G00006769:Fawood Avenue
490G00008865:Knatchbull Road
490G00014798:Winchelsea Road/Harlesden Station
490000100S:Harlesden Station
```

### Bus 206/224: Harlesden Station → Kingfisher Way
```
490000100N:Harlesden Station
490G00014798:Winchelsea Road/Harlesden Station
490G00008865:Knatchbull Road
490G00006769:Fawood Avenue
490G00012018:Gloucester Close
490G00013098:Swaminarayan Temple
490G00008746:Kingfisher Way
```

### Bakerloo Line: Harlesden ↔ Baker Street
```
940GZZLUSGP:Stonebridge Park
940GZZLUHSN:Harlesden
940GZZLUWJN:Willesden Junction
940GZZLUKSL:Kensal Green
940GZZLUQPS:Queen's Park
940GZZLUKPK:Kilburn Park
940GZZLUMVL:Maida Vale
940GZZLUWKA:Warwick Avenue
940GZZLUPAC:Paddington
940GZZLUERB:Edgware Road (Bakerloo Line)
940GZZLUMYB:Marylebone
940GZZLUBST:Baker Street
```

### Bus 112: Normansmead → Haven Grn/Ealing Broadway Station
```
490G00010313:Normansmead
490G00005538:Conduit Way
490G00007855:Harrow Road
490G00010347:Point Place
490000224A:Stonebridge Park Station
490G00003914:Beresford Avenue
490G00003029:Abbey Road
490G00008521:Iveagh Avenue
490G00007696:Brentmead Gardens
490G00010751:Park Avenue
490000099J:Hanger Lane Station
490G000904:Ashbourne Road
490G00008210:Hillcrest Road
490G00003477:Audley Road
490000158A:North Ealing Station
490G000376:Westbury Road
490G000578:Haven Grn/Ealing Broadway Station
```

### Bus 112: Haven Grn/Ealing Broadway Station → Wrights Place
```
490G000578:Haven Grn/Ealing Broadway Station
490G000376:Westbury Road
490G000377:Hanger Lane
490G00008210:Hillcrest Road
490000099A:Hanger Lane Station
490G000568:Hanger Lane Gyratory
490G00010751:Park Avenue
490G00007696:Brentmead Gardens
490G00008521:Iveagh Avenue
490G00003029:Abbey Road
490G00003914:Beresford Avenue
490000224B:Stonebridge Park Station
490G00010347:Point Place
490G00007855:Harrow Road
490G00005538:Conduit Way
490G00014960:Wrights Place
```

### Elizabeth Line: Ealing Broadway ↔ Liverpool Street
```
910GEALINGB:Ealing Broadway
910GACTONML:Acton Main Line
910GPADTLL:Paddington
910GBONDST:Bond Street
910GTOTCTRD:Tottenham Court Road
910GFRNDXR:Farringdon
910GLIVSTLL:Liverpool Street
```

## Implementation Approach

### Phase 1: Build System Setup
1. **TypeScript Configuration**: Set up `tsconfig.json` with JSX support and DOM types
2. **Testing Framework**: Configure Jest with `ts-jest` preset for TypeScript testing
3. **Code Quality**: Set up ESLint with TypeScript parser and rules
4. **Build Scripts**: Create npm scripts for development, testing, and production builds
5. **Project Structure**: Organize code into logical directories (services, components, types, data)

### Phase 2: API Analysis and Modeling
1. **Examine Real API Responses**: Use curl commands to fetch actual TfL API data
2. **Create TypeScript Interfaces**: Model interfaces based on real response structures, not documentation
3. **Validate Assumptions**: Test API endpoints with real data to verify response formats
4. **Handle API Variations**: Account for differences between Stop Point and Line disruption structures

### Phase 3: Test-Driven Development
1. **Write Failing Tests First**: Create comprehensive test suites before implementing logic
2. **Mock External Dependencies**: Use Jest mocks for fetch calls and external APIs
3. **Test Error Scenarios**: Include tests for API failures, network errors, and invalid responses
4. **Verify Data Processing**: Test severity classification, date handling, and route mapping

### Phase 4: Core Implementation
1. **API Client**: Implement TfL API client with proper error handling and response processing
2. **Data Processing**: Create services to transform API data into application-friendly formats
3. **Route Mapping**: Implement logic to associate disruptions with specific travel routes
4. **Business Logic**: Add severity determination, active status calculation, and filtering

### Phase 5: React Application
1. **Component Architecture**: Build reusable components for routes, disruptions, and route segments
2. **State Management**: Implement state management for disruption data and UI interactions
3. **Real-time Updates**: Add periodic data refresh and loading states
4. **Responsive Design**: Create mobile-friendly layouts with CSS

### Phase 6: Testing and Validation
1. **Unit Tests**: Ensure all services and utilities are thoroughly tested
2. **Integration Tests**: Test API client with mock responses that match real API structures
3. **Component Tests**: Test React components with realistic data scenarios
4. **Error Handling**: Verify graceful degradation when APIs are unavailable

## Key Implementation Details

### API Response Processing
- **Stop Point Disruptions**: Simple flat objects with `fromDate`/`toDate` for time ranges
- **Line Disruptions**: Rich objects with `created`/`lastUpdate` timestamps and text descriptions
- **Severity Classification**: Parse description text to determine disruption severity levels
- **Mode Detection**: Extract transport mode (bus/tube/rail) from descriptions and stop data

### Route Association Logic
- **Stop Point Matching**: Match disruptions using both `atcoCode` and `stationAtcoCode` with route stop point IDs
- **Dual Identifier Support**: Handle mixed station ATCO codes and stop ATCO codes from TfL API responses
- **Line Matching**: Extract line identifiers from disruption descriptions
- **Bidirectional Support**: Handle different stop sequences for outbound vs inbound routes
- **Multi-modal Routes**: Support routes that combine bus and rail segments

### Data Transformation
- **Unified Interface**: Convert both API response types to common `ProcessedDisruption` format
- **Active Status**: Determine if disruptions are currently active based on timestamps
- **Route Status**: Calculate overall route status from individual disruption severities
- **Filtering**: Remove duplicate disruptions and irrelevant data

## Application Features

- **Route-based Organization**: Group disruptions by specific travel routes
- **Bidirectional Display**: Show both outbound and inbound journey disruptions
- **Severity Indicators**: Color-coded disruption levels (low/medium/high/severe)
- **Detailed Route Views**: Expandable cards showing route segments and stop sequences
- **Real-time Updates**: Auto-refresh every 5 minutes with manual refresh option
- **Responsive Design**: Mobile-optimized interface with touch-friendly interactions
- **Error Resilience**: Graceful handling of API failures and partial data

## Technical Stack

- **React 18** with TypeScript for type-safe component development
- **Jest** with `ts-jest` for comprehensive testing
- **Fetch API** for HTTP requests with proper error handling
- **CSS Modules** for component-scoped styling
- **ESLint** with TypeScript parser for code quality
- **Modern ES6+** features with proper browser support

## Development Process Summary

This application was developed following a systematic approach:

1. **Build System First**: Established TypeScript, Jest, and ESLint configuration before writing any application code
2. **API-First Design**: Examined real TfL API responses to create accurate data models rather than relying on documentation alone
3. **Test-Driven Development**: Wrote comprehensive test suites with failing tests, then implemented code to make them pass
4. **Iterative Refinement**: Corrected API modeling based on actual responses, updating both interfaces and processing logic
5. **Component-Based Architecture**: Built reusable React components with proper separation of concerns

### Key Lessons Learned

- **Real API Exploration is Critical**: The initial API modeling based on documentation was incorrect; examining actual responses revealed simpler, flatter data structures
- **TypeScript Interfaces Must Match Reality**: Interfaces should reflect actual API responses, not assumed structures
- **Test-First Approach Works**: Writing tests before implementation helped catch modeling errors early
- **Error Handling is Essential**: TfL APIs can return various error conditions that must be handled gracefully
- **Route Mapping Complexity**: Associating disruptions with specific routes requires careful matching logic for both line and stop-point data
- **API Data Inconsistency**: TfL stop point disruptions use mixed identifier types (`atcoCode` and `stationAtcoCode`) requiring flexible matching logic

## Recent Enhancements

### Line Status API Migration (Latest)

**Problem**: The Line Disruption API endpoint (`/Line/{ids}/Disruption`) never populated the `affectedRoutes` and `affectedStops` fields, making it impossible to determine which specific lines and stop points were affected by disruptions.

**Solution Implemented**:
1. **API Endpoint Migration**: Replaced Line Disruption API with Line Status API (`/Line/{ids}/Status?detail=true`)
2. **Enhanced Data Processing**: The Line Status API provides detailed disruption information including:
   - Populated `affectedRoutes` with complete route section details via `routeSectionNaptanEntrySequence`
   - Each entry contains full stop point details with multiple identifiers (`naptanId`, `id`, `stationNaptan`)
   - Fallback to `affectedStops` when available (though typically empty in real responses)
3. **Comprehensive Stop Point Extraction**: Implemented logic to extract all stop point identifiers from:
   - Primary source: `affectedRoutes[].routeSectionNaptanEntrySequence[].stopPoint`
   - Fallback source: `affectedStops[]` (usually empty but handled for completeness)
   - Multiple identifier types: `naptanId`, `id`, and `stationNaptan` to ensure comprehensive coverage
4. **Dual-Layer Filtering Logic**: Implemented comprehensive filtering that considers both data sources with correct priority:
   - **Primary**: Check extracted `affectedStopPoints` (most granular and specific data)
   - **Fallback**: Direct matching against `affectedRoutes` data when stop points are not available
   - **Final Fallback**: Include disruptions with no specific affected routes/stops (entire line disruptions)
5. **Intelligent Route Matching**: Advanced logic to determine route relevance by analyzing actual affected route sections rather than just extracted stop point lists
6. **Batch Request Handling**: Added batching support for Line Status API calls (limit of 10 lines per request)
7. **Stop Point Validation**: Disruptions are filtered to exclude those affecting irrelevant stop points not part of monitored routes
8. **Comprehensive Testing**: Updated all tests to use Line Status API patterns and added extensive test coverage for filtering logic including edge cases

**Key Benefits**:
- **Accurate Disruption Mapping**: Can now precisely identify which stop points are affected
- **Relevant Information Only**: Filters out disruptions for stop points outside monitored routes
- **Better Data Quality**: Uses API endpoint that properly populates affected routes and stops
- **Scalable Architecture**: Batched requests handle large numbers of lines efficiently

### Stop Point Identifier Handling

During implementation, it was discovered that the TfL Stop Point Disruption API returns stop point identifiers in two different fields:
- `atcoCode`: Standard ATCO codes for stop points
- `stationAtcoCode`: Station-level ATCO codes for larger transport hubs

**Problem**: The initial implementation only used `atcoCode` for mapping disruptions to routes, missing disruptions that were identified by `stationAtcoCode`.

**Solution Implemented**:
1. **Extended Data Model**: Added `stationAtcoCode` field to `ProcessedDisruption` interface
2. **Enhanced Processing**: Modified `processStopPointDisruption()` to propagate both identifier types
3. **Flexible Matching**: Updated route mapping logic to check both `stopPointId` (from `atcoCode`) and `stationAtcoCode` when filtering disruptions
4. **Comprehensive Testing**: Added test coverage for all identifier matching scenarios
5. **Fixed Test Issues**: Corrected existing test expectations to match actual API batching behavior

**Result**: The system now correctly identifies and maps disruptions regardless of which identifier type the TfL API uses, ensuring comprehensive coverage of all stop point disruptions.

This comprehensive approach resulted in a robust, well-tested application that accurately processes real TfL disruption data and presents it in an intuitive, route-based interface.

## Disruption Grouping Feature

A significant enhancement was implemented to improve the user experience by grouping together disruptions that share identical descriptions across multiple stops on the same route. This prevents duplicate information from cluttering the interface when the same disruption (e.g., "Severe delays due to an incident") affects multiple stops along a route.

### Implementation Details

#### Key Files Modified

1. **`src/types/tfl.ts`**
   - Added `GroupedDisruption` interface to represent aggregated disruption data
   - Extended `RouteDisruptions` interface to include `groupedDisruptions` field
   - `GroupedDisruption` combines multiple `ProcessedDisruption` objects with identical descriptions

2. **`src/services/routeDisruptionService.ts`**
   - Implemented `groupDisruptionsByDescription()` method that:
     - Groups disruptions by exact description text match
     - Aggregates affected lines, stop points, and stop names
     - Determines overall date range (minimum start, maximum end)
     - Maintains active status if any grouped disruption is active
     - Generates stable group IDs for consistent rendering
   - Modified `mapDisruptionsToRoute()` to call the grouping logic
   - Groups are created from both line disruptions and stop point disruptions

3. **`src/components/GroupedDisruptionCard.tsx`**
   - New React component for displaying grouped disruption information
   - Shows consolidated view with all affected locations
   - Formats affected items (stops/lines) with intelligent truncation
   - Displays count of original disruptions when grouped (e.g., "Grouped from 3 disruptions")
   - Handles both stop names and line names in the header

4. **`src/components/RouteCard.tsx`**
   - Updated to use `GroupedDisruptionCard` instead of individual disruption cards
   - Displays grouped disruptions as the primary view
   - Shows count of active vs. resolved grouped disruptions
   - Maintains existing functionality for showing/hiding resolved disruptions

### Grouping Logic

The grouping algorithm works as follows:

1. **Collection**: All disruptions (both line and stop point) for a route are collected
2. **Grouping**: Disruptions are grouped by exact description text match using a Map
3. **Aggregation**: For each group:
   - Collect all unique affected lines and stop points/names
   - Calculate date range (earliest start to latest end)
   - Determine if group is active (true if any disruption is active)
   - Identify source type (stopPoint, line, or mixed)
   - Generate stable group ID for consistent rendering
4. **Display**: Groups are displayed as consolidated cards showing all affected locations

### Benefits

- **Reduced Clutter**: Eliminates duplicate disruption cards for the same incident
- **Better Overview**: Users can quickly see which areas of a route are affected
- **Preserved Detail**: Original disruption data is maintained for debugging/analysis
- **Intelligent Formatting**: Smart truncation of affected location lists
- **Consistent UX**: Grouped disruptions follow the same interaction patterns as individual ones

### Example Scenarios

- **Before Grouping**: 5 separate cards showing "Severe delays due to incident" for different bus stops
- **After Grouping**: 1 card showing "Severe delays due to incident" affecting "Stop A, Stop B, Stop C and 2 more"

This enhancement significantly improves the readability and usability of the disruption information while maintaining all the underlying data integrity and functionality.

## Wembley Event Day Integration

A specialized feature was implemented to automatically detect Wembley Stadium event days and generate appropriate disruptions for affected routes. This integration provides real-time awareness of scheduled transport changes during major events.

### Implementation Details

#### Key Files Added/Modified

1. **`src/services/wembleyEventService.ts`** (New)
   - Service for fetching Wembley Stadium event data from Brent Council API
   - Handles multipart form data API requests with precise carriage return formatting
   - Provides methods to check if a date is an event day and get upcoming events
   - Processes raw API responses into normalized `WembleyEvent` objects

2. **`src/services/routeDisruptionService.ts`** (Enhanced)
   - Integrated `WembleyEventService` to check for event day disruptions
   - Added `getWembleyEventDisruptions()` method targeting specific route
   - Enhanced `mapDisruptionsToRoute()` to include Wembley event disruptions
   - Made service methods async to handle event day API calls

3. **`src/types/tfl.ts`** (Enhanced)
   - Extended `RouteDisruptions` interface with `wembleyEventDisruptions` field
   - Maintains separation between TfL API disruptions and event-based disruptions

4. **Test Files** (New)
   - `src/services/__tests__/wembleyEventService.test.ts`
   - `src/services/__tests__/routeDisruptionService.wembley.test.ts`

### Event Day Disruption Logic

The system specifically monitors the **inbound route from Liverpool Street to Kingfisher Way via Wembley Park Station** (route1-inbound) for Wembley event day impacts:

#### Disruption Details
- **Affected Route**: Only `route1-inbound` (Liverpool Street → Kingfisher Way via Wembley Park)
- **Affected Service**: Bus 206 inbound direction
- **Time Window**: 13:00 - 23:00 on event days
- **Impact**: Bus 206 does not enter Wembley area; northernmost stop becomes Brent Park Tesco
- **Affected Stops**: 
  - Wembley Park Station (490000257O)
  - Empire Way (490G00006565)
  - Fulton Road (490G00007063)
  - Rutherford Way (490G00011818)
  - Olympic Way (490G00010593)
  - First Way (490G00006858)
  - Third Way (490G00013614)
  - Hannah Close (490G00007753)

#### API Integration
- **Source**: Brent Council API (`https://gurdasani.com/brent-api/search/list`)
- **Method**: POST with multipart/form-data
- **Filter**: Wembley Stadium events with specific template criteria
- **Response Processing**: Extracts event title, date, and venue information

#### Real-time Behavior
- **Daily Check**: Service checks current date against event calendar
- **Time-based Status**: Disruptions marked as active only during 13:00-23:00 window
- **Event Detection**: Creates disruption entries automatically for detected event days
- **Multi-event Support**: Handles multiple events on the same day

### Testing Strategy

#### Unit Tests Coverage
1. **API Response Parsing**: Validates correct processing of Brent Council API responses
2. **Event Day Detection**: Tests date matching logic for various scenarios
3. **Route Targeting**: Ensures disruptions only apply to the correct route
4. **Time Window Logic**: Verifies active/inactive status based on current time
5. **Error Handling**: Tests graceful degradation when API is unavailable
6. **Integration**: Validates inclusion in grouped disruptions display

#### Test Scenarios
- ✅ Event day during disruption hours → Active disruption created
- ✅ Event day outside disruption hours → Inactive disruption created  
- ✅ Non-event day → No disruption created
- ✅ Wrong route → No disruption created
- ✅ API errors → Graceful fallback
- ✅ Multiple events → Multiple disruption entries

### Benefits

1. **Proactive Information**: Users receive advance notice of service changes
2. **Real-time Status**: Disruptions activate/deactivate based on actual time windows
3. **Targeted Impact**: Only affects the specific route and direction impacted
4. **Reliable Source**: Uses official Brent Council event data
5. **Automated Detection**: No manual intervention required for event day monitoring
6. **Consistent UX**: Integrates seamlessly with existing disruption display system

### Usage Example

On a Wembley event day (e.g., October 19, 2025), users viewing the Liverpool Street to Kingfisher Way route would see:

```
🚌 Wembley Event Day Service Change
Bus 206 service disrupted due to Wembley Stadium event: Jacksonville Jaguars 2025. 
Bus 206 does not enter Wembley area - northernmost stop is Brent Park Tesco. 
Wembley Park Station to Kingfisher Way stops not served.
Active: 13:00 - 23:00
```

### Time Window Update

The disruption time window was revised from the original 16:00-23:00 to **13:00-23:00** to provide earlier notification of service changes. This adjustment:

- **Extended Coverage**: Provides 3 additional hours of advance notice
- **Better User Experience**: Users are informed earlier in the day about evening service disruptions
- **Operational Alignment**: Reflects typical event day preparation and crowd management periods

#### Implementation Changes Made:
- Updated `RouteDisruptionService.getWembleyEventDisruptions()` to set start time to 13:00
- Modified all test cases to use 15:00 as the test time within the new window
- Added specific test for 13:00 boundary validation
- Updated time range validation tests to reflect new 13:00-23:00 window

This feature ensures users are always informed about planned service changes related to major events at Wembley Stadium.

## Data Source Separation and Grouping Logic

An important architectural decision was made to maintain clear separation between different data sources in the disruption system:

### Grouping Policy
- **TfL Sourced Disruptions**: Only disruptions from TfL Line Status API and TfL StopPoint Disruptions API are included in the grouped disruptions view
- **Wembley Event Disruptions**: Kept separate in their own field (`wembleyEventDisruptions`) and displayed independently
- **Rationale**: This separation ensures data integrity and prevents mixing official TfL data with external event-based predictions

### Implementation Changes
The `groupDisruptionsByDescription()` method was modified to:
- Only process TfL-sourced disruptions (line and stop point disruptions)
- Exclude Wembley event day disruptions from the grouping logic
- Maintain clear boundaries between official transport data and event-based service predictions

### Benefits of Separation
1. **Data Integrity**: Official TfL disruption data remains uncontaminated by external predictions
2. **Source Transparency**: Users can distinguish between official disruptions and event-based service changes
3. **Simplified Logic**: Grouping algorithm focuses solely on official TfL data patterns
4. **Maintainability**: Different data sources can be updated independently without affecting each other

This architectural approach ensures that the system remains reliable and that users can clearly understand the source and nature of different types of disruption information.

## Multipart Form Data Implementation

A critical fix was implemented to ensure the Wembley Event API requests match the exact format required by the Brent Council API.

### Technical Details

The multipart/form-data format is highly prescriptive and requires precise line ending handling:

#### Original Incorrect Implementation
```javascript
// INCORRECT: Concatenated lines without proper separators
const formData = [
  `--${boundary}${cr}`,
  `Content-Disposition: form-data; name="searchQuery"${cr}`,
  // ... other parts
].join('');
```

#### Final Corrected Implementation
```javascript
// CORRECT: Every line must end with carriage return + line feed (\r\n)
const boundary = 'bucees';
const crlf = '\r\n';

const formData = [
  `--${boundary}${crlf}`,
  `Content-Disposition: form-data; name="searchQuery"${crlf}`,
  `${crlf}`,
  `${JSON.stringify(searchQuery)}${crlf}`,
  `--${boundary}--${crlf}`
].join('');
```

### Key Requirements Addressed

1. **Exact Format Matching**: The implementation now precisely matches the cURL command format
2. **Universal CRLF Endings**: Every single line must end with carriage return + line feed (`\r\n`)
3. **Final Line Termination**: The closing boundary line also requires CRLF termination
4. **Boundary Handling**: Correct multipart boundary markers with proper termination
5. **Content Disposition**: Exact header formatting for form field identification

### Testing Enhancements

Added comprehensive test coverage for the API request format:

- **Format Validation**: Tests verify the exact multipart structure matches the cURL specification
- **Universal CRLF Testing**: Ensures every line ends with `\r\n`, including the final boundary
- **Complete Line Validation**: Verifies no line is missing CRLF ending by checking split results
- **Boundary Testing**: Validates correct boundary markers and termination sequences
- **JSON Payload Integrity**: Confirms the search query JSON is properly embedded
- **Final Termination Check**: Specifically tests that the last boundary ends with CRLF

### Benefits of Correct Implementation

1. **API Compatibility**: Ensures reliable communication with Brent Council API
2. **Specification Compliance**: Adheres to RFC 7578 multipart/form-data standard
3. **Reliability**: Prevents request failures due to format mismatches
4. **Maintainability**: Clear separation of lines makes the format easier to understand and modify

This fix ensures that the Wembley event day feature functions reliably by maintaining strict adherence to the API's expected request format.