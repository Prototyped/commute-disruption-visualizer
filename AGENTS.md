# AGENTS.md — Commute Disruption Visualizer

## Project

React + TypeScript web app that visualizes TfL disruptions grouped by commute routes. Queries TfL public APIs for disruptions to transit lines and stop points, then maps results to specific multi-modal routes.

## Tech Stack

- **Runtime**: Node.js v16+
- **Language**: TypeScript (strict mode, ES2022 target)
- **UI**: React 18 with `react-jsx` JSX transform
- **Build**: Webpack 5 (`ts-loader` for TS, `css-loader` + `style-loader` for CSS)
- **Testing**: Jest 29 + `ts-jest` + `@testing-library/react` + `jsdom` environment
- **Linting**: ESLint 8 with `@typescript-eslint`
- **CSS**: Plain CSS files (not CSS Modules), mocked in tests via `src/__tests__/styleMock.js`

## Project Structure

```
src/
├── App.tsx                          # Main app: fetches, renders RouteCards, handles loading/error states
├── index.ts                         # Entry point
├── types/
│   └── tfl.ts                       # All TypeScript interfaces (TfL API types + internal data models)
├── data/
│   └── routes.ts                    # Route definitions (6 routes: 3 outbound + 3 inbound), line IDs, stop IDs
├── services/
│   ├── tflApi.ts                    # TfL API client: Line Status, Stop Point Disruptions, Arrivals, batching, processing
│   ├── routeDisruptionService.ts    # Maps disruptions to routes, groups by description, bus 206 curtailment detection
│   └── __tests__/                   # Service tests
├── components/
│   ├── RouteCard.tsx                # Collapsible route card showing grouped + curtailment disruptions
│   ├── GroupedDisruptionCard.tsx    # Display for grouped TfL disruptions
│   ├── RouteSegmentDisplay.tsx      # Visual route segment breakdown
│   └── __tests__/RouteCard.test.tsx # Component tests (jsdom)
├── __tests__/styleMock.js           # CSS mock for Jest
└── App.css, index.css, components/*.css  # Plain CSS
```

## API Endpoints

### Line Status API (Primary)
- **Endpoint**: `GET https://api.tfl.gov.uk/Line/{ids}/Status?detail=true`
- **Detail** parameter is mandatory — without it, structured disruption data is absent.
- **Batch limit**: 10 line IDs per request (URL length limit).
- The Line Status API is used instead of the Line Disruption API because the latter never populates `affectedRoutes`/`affectedStops`.

#### Key response types (from `src/types/tfl.ts`)
```
TflLineStatusResponse:
  id: string                    // line ID (e.g. "metropolitan", "206")
  name: string
  modeName: string
  lineStatuses: TflLineStatus[]
  disruptions?: TflLineDisruption[]  // legacy; usually empty

TflLineStatus:
  id: number
  lineId: string
  statusSeverity: number
  statusSeverityDescription: string  // e.g. "Minor Delays"
  reason?: string
  created: string
  validityPeriods: TflValidityPeriod[]
  disruption?: TflDisruptionDetail    // where the real data lives

TflDisruptionDetail:
  category: string
  categoryDescription: string
  description: string
  created: string
  affectedRoutes?: TflAffectedRoute[]   // PRIMARY source of stop data
  affectedStops?: TflAffectedStop[]     // usually empty
  closureText?: string

TflAffectedRoute:
  id: string
  name: string
  direction: string
  originationName: string
  destinationName: string
  isEntireRouteSection: boolean
  routeSectionNaptanEntrySequence: TflRouteSectionNaptanEntry[]

TflRouteSectionNaptanEntry:
  ordinal: number
  stopPoint: TflStopPointDetail

TflStopPointDetail:
  naptanId: string          // primary stop identifier
  id: string                // may differ from naptanId
  commonName: string
  stationNaptan?: string    // station-level ATCO code
  modes: string[]
```

### Stop Point Disruptions API (Secondary)
- **Endpoint**: `GET https://api.tfl.gov.uk/StopPoint/{ids}/Disruption`
- **Batch limit**: 10 stop point IDs per request.

#### Key response type
```
TflStopPointDisruption:
  atcoCode: string           // stop-level identifier
  stationAtcoCode: string    // station-level identifier
  fromDate: string           // ISO date
  toDate: string             // ISO date
  description: string
  commonName: string
  type: string               // e.g. "Closure"
  mode: string               // e.g. "bus"
  appearance: string         // e.g. "Information"
```

### Stop Point Arrivals API
- **Endpoint**: `GET https://api.tfl.gov.uk/StopPoint/{id}/Arrivals?lines={ids}`
- **Purpose**: Fetch real-time arrival predictions for a stop, optionally filtered by line. Used to detect bus 206 curtailment by checking destination names.
- Returns `TflPrediction[]` with `destinationName` (e.g. "Wembley Park, The Paddocks"), `lineId`, `lineName`, `expectedArrival`.

## Routes

6 route definitions in `src/data/routes.ts` (3 outbound + 3 inbound):

| Route ID | Description | Segments |
|---|---|---|
| `route1-outbound` | Kingfisher Way → Liverpool Street via Wembley Park | Bus 206 → Metropolitan Line |
| `route1-inbound` | Liverpool Street → Kingfisher Way via Wembley Park | Metropolitan Line → Bus 206 |
| `route2-outbound` | Kingfisher Way → Liverpool Street via Harlesden | Bus 206/224 → Bakerloo Line → H&C/Circle Line |
| `route2-inbound` | Liverpool Street → Kingfisher Way via Harlesden | H&C/Circle Line → Bakerloo Line → Bus 206/224 |
| `route3-outbound` | Normansmead → Liverpool Street via Ealing Broadway | Bus 112 → Elizabeth Line |
| `route3-inbound` | Liverpool Street → Wrights Place via Ealing Broadway | Elizabeth Line → Bus 112 |

**Lines monitored**: `metropolitan`, `hammersmith-city`, `circle`, `bakerloo`, `elizabeth`, `112`, `206`, `224`

**Bus 206 curtailment**: When bus 206 inbound does not reach The Paddocks, the northernmost stop becomes Brent Park Tesco (stop `490004297W`). Only affects `route1-inbound`. Detection uses the Stop Point Arrivals API at Brent Park Tesco — if no 206 arrivals have `destinationName` containing "Paddocks", the route is curtailed. If no arrivals exist (off-hours), the route is assumed not curtailed (fail open).

## Architecture

### Data flow

1. **`App.tsx`** mounts and calls `routeService.getAllRouteDisruptions()` on load, then every 5 minutes via `setInterval`.
2. **`TflApiClient.getLineStatus()`** and **`getStopPointDisruptions()`** fetch in parallel, batching at 10 IDs per request.
3. **`processLineStatusResponses()`** extracts disruptions from `lineStatuses[].disruption`, pulling affected stop points from `affectedRoutes[].routeSectionNaptanEntrySequence[].stopPoint` (primary) and `affectedStops[]` (fallback). Collects `naptanId`, `id`, and `stationNaptan` identifiers.
4. **`processStopPointDisruptions()`** converts TfL stop disruptions to `ProcessedDisruption`, preserving `atcoCode` (as `stopPointId`) and `stationAtcoCode`.
5. **`RouteDisruptionService.mapDisruptionsToRoute()`** filters disruptions to those relevant to a specific route by checking `lineId`, `affectedStopPoints`, `affectedRoutes` stop identifiers, and `stopPointId`/`stationAtcoCode` against the route's stop point IDs.
6. **`TflApiClient.isBus206Curtailed()`** checks arrivals at Brent Park Tesco (stop `490004297W`) for line 206. If any arrival has `destinationName` containing "Paddocks", the route is normal. If arrivals exist but none contain "Paddocks", the route is curtailed. If no arrivals exist, the route is assumed normal.
7. **`RouteCard`** renders each route as a collapsible card. `GroupedDisruptionCard` shows deduplicated TfL disruptions. Bus 206 curtailment disruptions render separately under "206 Curtailment Notice" without timestamps.
8. **Loading overlay**: `.loading-overlay` + `.loading-modal` fullscreen modal shows during all loading states (initial load and refreshes). Refresh button is disabled during loading but does not spin.

### Disruption filtering

- **Step-free access notices**: Disruptions whose description contains "step free" or "step-free" (case insensitive) are filtered out before route matching. These are accessibility notices about lift/escalator outages, not service disruptions that affect able-bodied passengers. Filtering applies to both line and stop point disruptions in `mapDisruptionsToRoute()`.

### Route matching logic

- **Line disruptions**: Check `disruption.lineId` matches a route segment's `lineId`. If `affectedStopPoints` exists (most granular), match those against route stop IDs. If absent, check `affectedRoutes` entries by iterating `routeSectionNaptanEntrySequence` and matching `naptanId`/`id`/`stationNaptan` against route stop IDs. If no specific stops listed, include disruption (affects entire line).
- **Stop point disruptions**: Match `stopPointId` (from `atcoCode`) or `stationAtcoCode` against route stop IDs.

### Grouping

Disruptions with identical `description` text are grouped into `GroupedDisruption` objects combining affected lines, stop points, and date ranges (min start, max end). Only TfL-sourced disruptions are grouped; bus 206 curtailment disruptions stay separate.

### Bus 206 curtailment integration

`getBus206CurtailmentDisruptions()` calls `this.tflClient.isBus206Curtailed()` for `route1-inbound`. When curtailed, it generates a `ProcessedDisruption` with `lineId: "206"` and the affected inbound stop points (Wembley Park Station through Hannah Close). These populate the `wembleyEventDisruptions` field on `RouteDisruptions`, rendered separately from grouped TfL disruptions in `RouteCard` under the heading "206 Curtailment Notice" with no time range displayed.

## Internal Data Model (from `src/types/tfl.ts`)

```
ProcessedDisruption:
  id, type, description, commonName?, mode
  startDate, endDate (Date objects)
  isActive
  source: 'stopPoint' | 'line'
  stopPointId?: string          // from atcoCode
  stationAtcoCode?: string      // from stationAtcoCode
  lineId?: string
  affectedStopPoints?: string[] // extracted from line status
  affectedRoutes?: TflAffectedRoute[]

GroupedDisruption:
  id, type, description, mode
  startDate, endDate (aggregated min/max)
  isActive
  source: 'stopPoint' | 'line' | 'mixed'
  affectedLines: string[]
  affectedStopPoints: string[]
  affectedStopNames: string[]
  originalDisruptions: ProcessedDisruption[]

RouteDisruptions:
  route: RouteDefinition
  lineDisruptions: ProcessedDisruption[]
  stopDisruptions: ProcessedDisruption[]
  groupedDisruptions: GroupedDisruption[]
  wembleyEventDisruptions: ProcessedDisruption[]

TflPrediction:
  id, operationType, vehicleId, naptanId, stationName
  lineId, lineName, platformName, direction, bearing, tripId
  baseVersion, destinationNaptanId, destinationName
  timestamp, timeToStation, currentLocation, towards
  expectedArrival, timeToLive, modeName

RouteDefinition:
  id, name, description
  segments: RouteSegment[]

RouteSegment:
  id, lineId, lineName, mode ('bus' | 'tube' | 'rail')
  stopPoints: StopPointInfo[]
  direction: 'outbound' | 'inbound'
```

## Implementation Notes

- **Line Status API is preferred over Line Disruption API**. The latter never populates `affectedRoutes`/`affectedStops`.
- **Step-free access notices are filtered out** in `mapDisruptionsToRoute()` before route matching. Disruptions with "step free" or "step-free" (case insensitive) in the description are excluded as they describe accessibility issues, not service disruptions for able-bodied passengers.
- **Check both `affectedRoutes` and `affectedStopPoints`**. The former is typically populated; the latter is usually empty but more granular when present. Prefer `affectedStopPoints` when non-empty.
- **Stop point matching must check `naptanId`, `id`, and `stationNaptan`** from `routeSectionNaptanEntrySequence` entries, plus `atcoCode` and `stationAtcoCode` from Stop Point Disruption responses.
- **Bus stop identifiers differ by direction**. Inbound and outbound bus routes use different stop point IDs even when the common name is the same. Rail line identifiers are the same in both directions.
- **Batch requests: max 10 line IDs or stop point IDs** per API call. TfL enforces URL length limits.
- **Do not filter unknown-type fields** from API responses if the logic references them.
- **Component tests** use `@jest-environment jsdom` and `@testing-library/react`. CSS imports are mocked via `src/__tests__/styleMock.js` (configured in `jest.config.js` `moduleNameMapper`).
- **Webpack dev server** runs on port 3000, serves from `public/` directory.
- **TypeScript** uses `@/*` path alias mapping to `src/*`.

## Available Scripts

| Command | Action |
|---------|--------|
| `npm run build` | Clean + production webpack build |
| `npm run dev` | Webpack dev server (port 3000) |
| `npm run start` | Alias for dev server |
| `npm run clean` | Remove `dist/` directory |
| `npm run test` | Jest test runner |
| `npm run test:watch` | Jest in watch mode |
| `npm run lint` | ESLint (`src/**/*.ts` + `src/**/*.tsx`) |
| `npm run lint:fix` | ESLint with `--fix` |

## Testing

- Service tests: `src/services/__tests__/` — `tflApi.test.ts`, `routeDisruptionService.test.ts`, `routeDisruptionService.wembley.test.ts`
- Component tests: `src/components/__tests__/RouteCard.test.tsx` — uses `@testing-library/react` with `jsdom` environment
- Jest config: `jest.config.js` — `ts-jest` preset, `node` test environment, CSS mocked via `styleMock.js`

## Configuration Files

- `webpack.config.js` — entry `src/index.ts`, output `dist/bundle.js`, `HtmlWebpackPlugin` from `public/index.html`.
- `tsconfig.json` — target ES2022, strict mode, `@/*` path alias, excludes test files from compilation.
- `jest.config.js` — `ts-jest` preset, `node` environment, CSS module mapper.
- `.eslintrc.json` — ESLint configuration.
