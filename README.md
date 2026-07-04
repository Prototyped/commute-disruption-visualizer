# TfL Disruption Visualizer

A React-based web application that monitors and visualizes Transport for London (TfL) service disruptions for specific commuter routes between Kingfisher Way/Normansmead and Liverpool Street Station.

## Overview

This application tracks disruptions on three specific commuting routes by monitoring TfL's public APIs for both line and stop point disruptions. It organizes and displays this information in a route-centric view, making it easy to see the current status of each journey segment.

## Features

- **Real-time Disruption Monitoring**: Fetches live data from TfL APIs
- **Route-based Organization**: Groups disruptions by specific transport routes
- **Wembley Event Day Integration**: Automatic detection and notification of service changes during Wembley Stadium events
- **Intelligent Grouping**: Consolidates duplicate disruptions for cleaner display
- **Multiple Data Sources**: Combines line status, stop-point disruption data, and external event calendars
- **Support for Multiple Journeys**: Both outbound and inbound routes
- **Integration with Multiple Services**: Buses, underground, Elizabeth line, and event APIs
- **Automatic Updates**: Refreshes disruption data every 5 minutes
- **Mobile-friendly Design**: Responsive interface for all devices

## 🛣️ Monitored Routes

### Route 1: Kingfisher Way ↔ Liverpool Street (via Wembley Park)
- **Outbound**: Bus 206 → Metropolitan Line
- **Inbound**: Metropolitan Line → Bus 206

### Route 2: Kingfisher Way ↔ Liverpool Street (via Harlesden)
- **Outbound**: Bus 206/224 → Bakerloo Line → Hammersmith & City/Circle Line
- **Inbound**: Hammersmith & City/Circle Line → Bakerloo Line → Bus 206/224

### Route 3: Normansmead ↔ Liverpool Street (via Ealing Broadway)
- **Outbound**: Bus 112 → Elizabeth Line
- **Inbound**: Elizabeth Line → Bus 112

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd commute-disruption-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Webpack dev server
npm run start        # Alias for dev server

# Production
npm run build        # Production webpack build
npm run clean        # Clean build artifacts

# Testing
npm run test         # Jest test runner
npm run test:watch   # Jest in watch mode

# Code Quality
npm run lint         # ESLint (`.ts` + `.tsx`)
npm run lint:fix     # ESLint with --fix
```

## Technical Implementation

### Project Structure

```
src/
├── __tests__/              # Shared test utilities
│   └── styleMock.js            # CSS module mock for Jest
├── components/             # React components
│   ├── __tests__/
│   │   └── RouteCard.test.tsx      # Component tests
│   ├── GroupedDisruptionCard.tsx   # Grouped TfL disruptions
│   ├── RouteCard.tsx               # Route-level disruption display
│   ├── RouteCard.css
│   ├── RouteSegmentDisplay.tsx     # Visualize route segments
│   └── RouteSegmentDisplay.css
├── services/
│   ├── __tests__/              # Service-layer tests
│   ├── routeDisruptionService.ts   # Map disruptions to routes
│   ├── tflApi.ts               # TfL API client
│   └── wembleyEventService.ts  # Wembley event detection
├── types/
│   └── tfl.ts              # TfL API type definitions
├── data/
│   └── routes.ts           # Route definitions
└── utils/                  # Shared utilities
```

### Key Components

The application is built with five main layers:

1. **TfL API Integration** (`tflApi.ts`)
   - Batched requests (max 10 IDs) to Line Status and Stop Point Disruption endpoints
   - Extracts structured data from `lineStatuses[].disruption.affectedRoutes[]`

2. **Wembley Event Service** (`wembleyEventService.ts`)
   - Brent Council API via multipart/form-data POST (proxied through nginx)
   - Event day detection and upcoming event queries

3. **Route Disruption Service** (`routeDisruptionService.ts`)
   - Maps disruptions to routes by matching stop identifiers (`naptanId`, `id`, `stationNaptan`, `atcoCode`, `stationAtcoCode`)
   - Groups duplicate TfL disruptions; keeps Wembley event disruptions separate
   - Generates synthetic disruptions for Wembley event days (bus 206 curtailment)

4. **React Components**
   - `RouteCard` — collapses/expands per route; renders grouped TfL and separate Wembley event disruptions
   - `GroupedDisruptionCard` — deduplicated disruption display
   - `RouteSegmentDisplay` — visual route segment breakdown

5. **Modal Loading Overlay**
   - Fixed fullscreen backdrop with centered spinner card during all loading states (initial load and refreshes)
   - Refresh button does not spin; it is simply disabled during loading

## API Integration

### TfL APIs
The application uses two main TfL API endpoints:
- **Line Status** (with detail): `https://api.tfl.gov.uk/Line/{line_ids}/Status?detail=true` — the primary source of disruption data, including affected stop points
- **Stop Point Disruptions**: `https://api.tfl.gov.uk/StopPoint/{stop_point_ids}/Disruption`

### Wembley Event API
- **Brent Council Events**: `https://gurdasani.com/brent-api/search/list`
- **Method**: POST with multipart/form-data
- **Purpose**: Detect Wembley Stadium event days for service impact predictions

### Monitored Services

#### Rail Lines
- Metropolitan Line (`metropolitan`)
- Hammersmith and City Line (`hammersmith-city`)
- Circle Line (`circle`)
- Bakerloo Line (`bakerloo`)
- Elizabeth Line (`elizabeth`)

#### Bus Routes
- Route 112 (`112`)
- Route 206 (`206`)
- Route 224 (`224`)

## Development

- TypeScript throughout
- Jest with `ts-jest` for testing; component tests use `@jest-environment jsdom` and `@testing-library/react`
- CSS moduleNameMapper mocks `.css` imports for Jest (`src/__tests__/styleMock.js`)
- ESLint for code quality
- Plain CSS files (not CSS Modules)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Wembley Event Day Integration

The application includes specialized functionality to automatically detect Wembley Stadium event days and generate appropriate service disruptions.

### Key Features

- **Automatic Event Detection**: Integrates with Brent Council API to fetch upcoming Wembley Stadium events
- **Route-Specific Impact**: Targets only the inbound route from Liverpool Street to Kingfisher Way via Wembley Park Station
- **Time-Based Activation**: Disruptions are active from 13:00-23:00 on event days
- **Real-Time Status**: Shows active/inactive status based on current time
- **Service Details**: Provides specific information about Bus 206 service changes

### How It Works

1. **Event Calendar Sync**: Daily checks against Brent Council's event calendar
2. **Route Targeting**: Only affects `route1-inbound` (Liverpool Street → Kingfisher Way via Wembley Park)
3. **Service Impact**: On event days, Bus 206 cannot enter Wembley area
4. **Alternative Stops**: Northernmost stop becomes Brent Park Tesco
5. **Affected Stations**: Wembley Park Station through Kingfisher Way stops not served

### Technical Implementation

- **WembleyEventService**: Handles API integration with Brent Council event system
- **Multipart Form Data**: Precise HTTP request formatting for API compatibility
- **Data Separation**: Wembley disruptions kept separate from TfL-sourced data
- **Error Handling**: Graceful degradation when event API is unavailable
- **Comprehensive Testing**: Full test coverage including API format validation

### Example Output

On a Wembley event day, users see:

```
🚌 Wembley Event Day Service Change
Bus 206 service disrupted due to Wembley Stadium event: [Event Name]
Bus 206 does not enter Wembley area - northernmost stop is Brent Park Tesco.
Wembley Park Station to Kingfisher Way stops not served.
Active: 13:00 - 23:00
```

### Data Source Separation

The application maintains clear separation between different disruption sources:
- **TfL Disruptions**: Official transport authority data (grouped together)
- **Wembley Event Disruptions**: Event-based service predictions (displayed separately)
- **Benefits**: Ensures data integrity and source transparency for users

## License

MIT License - see LICENSE file for details