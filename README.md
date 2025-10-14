# TfL Disruption Visualizer

A React-based web application that monitors and visualizes Transport for London (TfL) service disruptions for specific commuter routes between Kingfisher Way/Normansmead and Liverpool Street Station.

## Overview

This application tracks disruptions on three specific commuting routes by monitoring TfL's public APIs for both line and stop point disruptions. It organizes and displays this information in a route-centric view, making it easy to see the current status of each journey segment.

## Features

- Real-time monitoring of TfL disruptions using public APIs
- Route-based organization of disruptions
- Support for both outbound and inbound journeys
- Integration with multiple TfL services (buses, underground, and Elizabeth line)
- Automatic data refresh every 5 minutes
- Mobile-friendly responsive design

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
│   ├── RouteCard         # Display route information
│   └── RouteSegmentDisplay # Visualize route segments
├── services/
│   ├── tflApi           # TfL API client
│   └── routeDisruptionService  # Disruption processing
├── types/
│   └── tfl.ts          # TfL API type definitions
└── data/
    └── routes.ts       # Route definitions
```

### Key Components

The application is built with three main service layers:

1. **TfL API Integration** (`tflApi.ts`)
   - Handles communication with TfL APIs
   - Implements batched requests for better performance
   - Processes API responses into consistent formats

2. **Route Disruption Service** (`routeDisruptionService.ts`)
   - Maps disruptions to specific routes
   - Tracks both stop point and line disruptions
   - Processes bi-directional route information

3. **React Components**
   - Route-based display of disruptions
   - Real-time updates with 5-minute refresh
   - Mobile-responsive design

## TfL API Integration

The application uses two main TfL API endpoints:
- Line Disruptions: `https://api.tfl.gov.uk/Line/{line_ids}/Disruption`
- Stop Point Disruptions: `https://api.tfl.gov.uk/StopPoint/{stop_point_ids}/Disruption`

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

## License

MIT License - see LICENSE file for details