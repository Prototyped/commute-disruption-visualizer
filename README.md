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
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tfl-disruption-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run start        # Start development server
npm run build:watch  # Watch mode compilation

# Production
npm run build        # Create production build
npm run clean        # Clean build artifacts

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## Technical Implementation

### Project Structure

```
src/
├── components/        # React components
│   ├── DisruptionCard     # Display individual disruptions
│   ├── GroupedDisruptionCard # Display grouped disruptions
│   ├── RouteCard         # Display route information
│   └── RouteSegmentDisplay # Visualize route segments
├── services/
│   ├── tflApi           # TfL API client
│   ├── wembleyEventService # Wembley event detection
│   └── routeDisruptionService  # Disruption processing
├── types/
│   └── tfl.ts          # TfL API type definitions
└── data/
    └── routes.ts       # Route definitions
```

### Key Components

The application is built with four main service layers:

1. **TfL API Integration** (`tflApi.ts`)
   - Handles communication with TfL APIs
   - Implements batched requests for better performance
   - Processes API responses into consistent formats

2. **Wembley Event Service** (`wembleyEventService.ts`)
   - Integrates with Brent Council API for Wembley Stadium events
   - Handles precise multipart/form-data API requests
   - Provides event day detection and upcoming event queries

3. **Route Disruption Service** (`routeDisruptionService.ts`)
   - Maps disruptions to specific routes
   - Tracks stop point, line, and event-based disruptions
   - Processes bi-directional route information
   - Groups TfL disruptions while keeping event disruptions separate

4. **React Components**
   - Route-based display of disruptions
   - Grouped and individual disruption views
   - Real-time updates with 5-minute refresh
   - Mobile-responsive design

## API Integration

### TfL APIs
The application uses two main TfL API endpoints:
- **Line Disruptions**: `https://api.tfl.gov.uk/Line/{line_ids}/Disruption`
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

The project follows a test-driven development approach with:
- TypeScript for type safety
- Jest for testing
- ESLint for code quality
- React for UI components
- CSS Modules for styling

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