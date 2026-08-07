# Commute Disruption Visualizer

A React + TypeScript web app that visualizes Transport for London (TfL) service disruptions for specific multi-modal commute routes. Queries TfL public APIs for line status and stop point disruptions, then maps results to user-defined routes.

## Overview

The app monitors three commute routes between Kingfisher Way/Normansmead and Liverpool Street Station, grouping disruptions by route and displaying them in collapsible cards. It fetches data from TfL APIs on load and refreshes every 5 minutes.

## Features

- **Real-time Disruption Monitoring**: Fetches live data from TfL Line Status and Stop Point Disruption APIs
- **Route-based Organization**: Groups disruptions by 6 predefined routes (3 outbound + 3 inbound)
- **Bus 206 Curtailment Detection**: Automatically detects when bus 206 inbound is curtailed (does not reach The Paddocks) using the TfL Arrivals API
- **Intelligent Grouping**: Deduplicates TfL disruptions with identical descriptions, merging affected lines and date ranges
- **Multiple Data Sources**: Combines line status (primary) and stop point disruption data
- **Support for Multiple Journeys**: Both outbound and inbound routes across bus, tube, and rail modes
- **Automatic Updates**: Refreshes disruption data every 5 minutes
- **Responsive Layout**: Outbound and inbound routes displayed in separate sections

## Routes

| Route ID | Description | Segments |
|---|---|---|
| `route1-outbound` | Kingfisher Way → Liverpool Street via Wembley Park | Bus 206 → Metropolitan Line |
| `route1-inbound` | Liverpool Street → Kingfisher Way via Wembley Park | Metropolitan Line → Bus 206 |
| `route2-outbound` | Kingfisher Way → Liverpool Street via Harlesden | Bus 206/224 → Bakerloo Line → H&C/Circle Line |
| `route2-inbound` | Liverpool Street → Kingfisher Way via Harlesden | H&C/Circle Line → Bakerloo Line → Bus 206/224 |
| `route3-outbound` | Normansmead → Liverpool Street via Ealing Broadway | Bus 112 → Elizabeth Line |
| `route3-inbound` | Liverpool Street → Wrights Place via Ealing Broadway | Elizabeth Line → Bus 112 |

**Lines monitored**: `metropolitan`, `hammersmith-city`, `circle`, `bakerloo`, `elizabeth`, `112`, `206`, `224`

**Bus 206 curtailment**: For `route1-inbound` only. The app queries the TfL Arrivals API at Brent Park Tesco (stop `490004297W`). If any 206 arrival has `destinationName` containing "Paddocks", the route is normal. If arrivals exist but none contain "Paddocks", the route is curtailed. If no arrivals exist (off-hours), the route is assumed not curtailed (fail open).

## Getting Started

### Prerequisites

- Node.js v16+
- npm

### Installation

```bash
git clone <repository-url>
cd commute-disruption-visualizer
npm install
npm run dev
```

The webpack dev server runs on port 3000, serving from `public/`.

### Available Scripts

| Command | Action |
|---------|--------|
| `npm run dev` / `npm run start` | Webpack dev server (port 3000) |
| `npm run build` | Clean + production webpack build |
| `npm run clean` | Remove `dist/` directory |
| `npm run test` | Jest test runner |
| `npm run test:watch` | Jest in watch mode |
| `npm run lint` | ESLint (`src/**/*.ts` + `src/**/*.tsx`) |
| `npm run lint:fix` | ESLint with `--fix` |

## Project Structure

```
src/
├── App.tsx                          # Main app: fetches, renders RouteCards, handles loading/error states
├── index.ts                         # Entry point
├── types/
│   └── tfl.ts                       # All TypeScript interfaces (TfL API types + internal data models)
├── data/
│   └── routes.ts                    # Route definitions (6 routes), line IDs, stop IDs
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
└── *.css                            # Plain CSS files (App.css, index.css, components/*.css)
```

## Architecture

### Data Flow

1. **`App.tsx`** mounts and calls `routeService.getAllRouteDisruptions()` on load, then every 5 minutes via `setInterval`.
2. **`TflApiClient.getLineStatus()`** and **`getStopPointDisruptions()`** fetch in parallel, batching at 10 IDs per request.
3. **`processLineStatusResponses()`** extracts disruptions from `lineStatuses[].disruption`, pulling affected stop points from `affectedRoutes[].routeSectionNaptanEntrySequence[].stopPoint` (primary) and `affectedStops[]` (fallback).
4. **`processStopPointDisruptions()`** converts TfL stop disruptions to `ProcessedDisruption`, preserving `atcoCode` (as `stopPointId`) and `stationAtcoCode`.
5. **`RouteDisruptionService.mapDisruptionsToRoute()`** filters disruptions to those relevant to a specific route by matching `lineId`, `affectedStopPoints`, `affectedRoutes` stop identifiers, and `stopPointId`/`stationAtcoCode` against the route's stop point IDs.
6. **`TflApiClient.isBus206Curtailed()`** checks arrivals at Brent Park Tesco for line 206 destination names.
7. **`RouteCard`** renders each route as a collapsible card. `GroupedDisruptionCard` shows deduplicated TfL disruptions. Bus 206 curtailment disruptions render separately under "206 Curtailment Notice" without timestamps.
8. **Loading overlay**: `.loading-overlay` + `.loading-modal` fullscreen modal shows during all loading states. Refresh button is disabled during loading.

### Route Matching Logic

- **Line disruptions**: Check `disruption.lineId` matches a route segment's `lineId`. If `affectedStopPoints` exists, match those against route stop IDs. If absent, check `affectedRoutes` entries by iterating `routeSectionNaptanEntrySequence` and matching `naptanId`/`id`/`stationNaptan`. If no specific stops listed, include the disruption (affects entire line).
- **Stop point disruptions**: Match `stopPointId` (from `atcoCode`) or `stationAtcoCode` against route stop IDs.

### Grouping

Disruptions with identical `description` text are grouped into `GroupedDisruption` objects combining affected lines, stop points, and date ranges (min start, max end). Only TfL-sourced disruptions are grouped; bus 206 curtailment disruptions stay separate.

## API Integration

### TfL APIs

| Endpoint | Purpose | Batch Limit |
|---|---|---|
| `GET /Line/{ids}/Status?detail=true` | Primary disruption source with affected stop points | 10 line IDs |
| `GET /StopPoint/{ids}/Disruption` | Secondary stop point disruptions | 10 stop point IDs |
| `GET /StopPoint/{id}/Arrivals?lines={ids}` | Bus 206 curtailment detection (destination names) | N/A |

The Line Status API is used instead of the Line Disruption API because the latter never populates `affectedRoutes`/`affectedStops`. The `detail=true` query parameter is mandatory — without it, structured disruption data is absent.

### Monitored Services

**Rail Lines**: Metropolitan (`metropolitan`), Hammersmith & City (`hammersmith-city`), Circle (`circle`), Bakerloo (`bakerloo`), Elizabeth (`elizabeth`)

**Bus Routes**: 112 (`112`), 206 (`206`), 224 (`224`)

## Development

- TypeScript strict mode, ES2022 target, `react-jsx` JSX transform
- Jest 29 + `ts-jest` + `@testing-library/react` in `jsdom` environment for components, `node` environment for services
- CSS moduleNameMapper mocks `.css` imports via `src/__tests__/styleMock.js`
- ESLint 8 with `@typescript-eslint` for code quality
- Plain CSS files (not CSS Modules)
- `@/*` path alias maps to `src/*`

## Testing

- **Service tests**: `src/services/__tests__/tflApi.test.ts`, `routeDisruptionService.test.ts`, `routeDisruptionService.wembley.test.ts`
- **Component tests**: `src/components/__tests__/RouteCard.test.tsx`

## Configuration

| File | Purpose |
|---|---|
| `webpack.config.js` | Entry `src/index.ts`, output `dist/bundle.js`, `HtmlWebpackPlugin` from `public/index.html` |
| `tsconfig.json` | ES2022 target, strict mode, `@/*` path alias, excludes test files |
| `jest.config.js` | `ts-jest` preset, `node` environment, CSS mock, `@/*` path alias |
| `.eslintrc.json` | ESLint configuration |

## License

MIT License - see LICENSE file for details
