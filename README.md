# TypeScript Project

A TypeScript project with a complete build system setup.

## Features

- TypeScript compilation with strict type checking
- ESLint for code linting
- Jest for testing
- Automated build scripts
- Development and production workflows

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Compile in watch mode
- `npm run dev` - Run the project in development mode with ts-node
- `npm run start` - Run the compiled JavaScript
- `npm run clean` - Remove build output
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Project Structure

```
├── src/
│   ├── index.ts           # Main entry point
│   ├── utils/             # Utility modules
│   └── __tests__/         # Test files
├── dist/                  # Compiled output (generated)
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── .eslintrc.json         # ESLint configuration
└── package.json           # Project dependencies and scripts
```

## Development Workflow

1. Start development: `npm run dev`
2. Run tests: `npm run test`
3. Lint code: `npm run lint`
4. Build for production: `npm run build`
5. Run production build: `npm run start`