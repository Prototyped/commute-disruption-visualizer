# TfL Disruption Monitor

A comprehensive React-based web application for monitoring Transport for London (TfL) disruptions across key commuter routes. This application provides real-time disruption information organized by specific travel routes between key locations in London.

## 🚇 Features

- **Real-time Disruption Monitoring**: Fetches live data from TfL APIs
- **Route-based Organization**: Groups disruptions by specific travel routes
- **Bidirectional Route Support**: Monitors both outbound and inbound journeys
- **Severity Classification**: Categorizes disruptions by severity (low, medium, high, severe)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Auto-refresh**: Automatically updates data every 5 minutes
- **Comprehensive Coverage**: Monitors bus, tube, and rail services

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
npm run dev          # Run with ts-node for development
npm run build:watch  # Compile TypeScript in watch mode

# Production
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run the compiled application

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically

# Utilities
npm run clean        # Remove build artifacts
```

## 🏗️ Architecture

### Project Structure

```
src/
├── components/           # React components
│   ├── DisruptionCard.tsx       # Individual disruption display
│   ├── RouteCard.tsx            # Route with disruptions
│   ├── RouteSegmentDisplay.tsx  # Route visualization
│   └── *.css                    # Component styles
├── data/
│   └── routes.ts        # Route definitions and stop points
├── services/
│   ├── tflApi.ts               # TfL API client
│   ├── routeDisruptionService.ts  # Business logic
│   └── __tests__/              # Service tests
├── types/
│   └── tfl.ts          # TypeScript interfaces
├── App.tsx             # Main application component
└── index.ts            # Application entry point
```

### Key Components

- **TflApiClient**: Handles all TfL API communication
- **RouteDisruptionService**: Processes and maps disruptions to routes
- **RouteCard**: Displays route information and associated disruptions
- **DisruptionCard**: Shows individual disruption details
- **RouteSegmentDisplay**: Visualizes route segments and stops

### Data Flow

1. **Data Fetching**: Service fetches disruptions from TfL APIs
2. **Processing**: Raw API data is processed and categorized
3. **Route Mapping**: Disruptions are mapped to specific routes
4. **UI Rendering**: React components display organized information
5. **Auto-refresh**: Process repeats every 5 minutes

## 🔧 Configuration

### TfL API Integration

The application uses these TfL API endpoints:

- **Line Disruptions**: `https://api.tfl.gov.uk/Line/{line_ids}/Disruption`
- **Stop Point Disruptions**: `https://api.tfl.gov.uk/StopPoint/{stop_point_ids}/Disruption`

### Monitored Transport Lines

- Metropolitan Line
- Hammersmith & City Line
- Circle Line
- Bakerloo Line
- Elizabeth Line
- Bus routes: 112, 206, 224

### Route Configuration

Routes are defined in `src/data/routes.ts` with:
- Line identifiers
- Stop point sequences
- Direction indicators
- Mode types (bus/tube/rail)

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm run test

# Test specific components
npm run test -- tflApi.test.ts
npm run test -- routeDisruptionService.test.ts
```

### Test Coverage

- ✅ TfL API client functionality
- ✅ Disruption processing logic
- ✅ Route mapping algorithms
- ✅ Error handling scenarios
- ✅ Data transformation

## 🎨 Styling

- **CSS Modules**: Component-scoped styling
- **Responsive Design**: Mobile-first approach
- **Severity Colors**: Visual disruption severity indicators
- **Accessibility**: WCAG compliant color contrasts

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security

- No API keys required (TfL APIs are public)
- Client-side only (no server storage)
- HTTPS ready for production deployment

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

The built application can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 📊 Performance

- **Bundle Size**: Optimized for fast loading
- **API Batching**: Efficient TfL API usage
- **Caching**: Smart data refresh strategy
- **Error Recovery**: Graceful API failure handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Transport for London (TfL)** for providing public APIs
- **React Team** for the excellent framework
- **TypeScript Team** for type safety

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include browser and environment information

---

*Last updated: January 2024*