# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

useTemporal is a revolutionary time library featuring a unique `divide()` pattern for hierarchical time management. The project is organized as a monorepo with framework-agnostic architecture, supporting Vue, React, Angular, Svelte, and vanilla JavaScript.

Key innovation: The library provides the only JavaScript time handling with the `divide()` pattern, allowing infinite subdivision of time units with perfect synchronization.

## Commands

### Root Level Commands

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Run tests across all packages
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking for all packages
npm run type-check

# Lint all packages
npm run lint

# Format code with Prettier
npm run format

# Clean all build artifacts
npm run clean

# Build and publish packages
npm run release
```

### Package-Specific Commands

Run commands for specific packages using workspace syntax:

```bash
# Run dev mode for a specific package
npm run dev --workspace=@usetemporal/core

# Build a specific package
npm run build --workspace=@usetemporal/adapter-luxon

# Test a specific package
npm test --workspace=@usetemporal/core
```

### Example Application Commands

```bash
# Start Vue example application (port 5173)
cd examples/vue
npm run dev

# Build Vue example
npm run build

# Preview production build
npm run preview
```

## Architecture

### Monorepo Structure

```
pickle/
├── packages/
│   ├── core/                    # @usetemporal/core - Core library with reactive time units
│   ├── adapter-native/          # @usetemporal/adapter-native - Native JS Date adapter
│   ├── adapter-date-fns/        # @usetemporal/adapter-date-fns - date-fns adapter
│   ├── adapter-luxon/           # @usetemporal/adapter-luxon - Luxon adapter
│   ├── adapter-temporal/        # @usetemporal/adapter-temporal - Temporal API adapter
│   ├── usetemporal/            # Main package bundling core + native adapter
│   └── tsconfig/               # Shared TypeScript configurations
├── examples/
│   └── vue/                    # Vue.js demo application
└── coverage/                   # Test coverage reports
```

### Core Library Architecture

The core library (`packages/core/src/`) provides:
- `createTemporal()` - Main factory function
- Time unit composables: `useYear()`, `useMonth()`, `useWeek()`, `useDay()`, `useHour()`
- Reactive properties using `@vue/reactivity` (not Vue framework)
- TypeScript type definitions

### Key Design Patterns

1. **Reactive Core**: Uses `@vue/reactivity` for framework-agnostic reactivity
2. **Adapter Pattern**: Pluggable date library support with separate packages
3. **Composable Pattern**: Each time unit follows a consistent interface
4. **Functional Architecture**: No classes, pure functional design
5. **Modular Packages**: Each adapter is a separate, tree-shakeable package

### Revolutionary divide() Pattern

```typescript
const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // Returns 12 month units
const weeks = temporal.divide(month, "week");   // Returns ~4 week units
const days = temporal.divide(week, "day");      // Returns 7 day units
```

### Date Adapter System

The library supports multiple date libraries through adapter packages:

- `@usetemporal/adapter-native` - Native JavaScript Date (zero dependencies)
- `@usetemporal/adapter-date-fns` - date-fns integration
- `@usetemporal/adapter-luxon` - Luxon integration
- `@usetemporal/adapter-temporal` - Temporal API (future-proof)

Installation examples:
```bash
# Basic installation (includes native adapter)
npm install usetemporal

# With specific adapter
npm install @usetemporal/core @usetemporal/adapter-luxon luxon
```

## Important Implementation Notes

1. **Framework Agnostic**: The library uses only `@vue/reactivity`, not the Vue framework. All imports must be from `@vue/reactivity`, not `vue`.

2. **Zero Dependencies Goal**: The native adapter provides full functionality without external dependencies. Other adapters require their respective date libraries as peer dependencies.

3. **ESM Only**: All packages use `"type": "module"` and are ESM-only. No CommonJS builds are provided.

4. **TypeScript**: The project uses TypeScript with shared configurations in `packages/tsconfig/`. Each package extends from the base configuration.

5. **Testing**: Uses Vitest for testing. Tests are located in each package's `src/__tests__/` directory.

6. **Linting**: Uses `oxlint` for fast linting. Configuration is in `oxlintrc.json`.

7. **Bundle Size**: Target bundle size is <6KB for core + native adapter.

## Development Workflow

1. **Monorepo Management**: Uses npm workspaces for dependency management
2. **Version Management**: Uses changesets for coordinated releases
3. **Build Tool**: Vite for fast builds and development
4. **Test Runner**: Vitest for unit testing
5. **Type Checking**: TypeScript strict mode enabled

## Current Status

The project is at v2.0.0-alpha.1 with:
- ✅ Framework-agnostic architecture complete
- ✅ Modular adapter system with separate packages
- ✅ Professional API naming (createTemporal)
- ✅ Zero-dependency native adapter
- 🔄 Bundle size optimization in progress
- 🔄 Additional framework examples needed beyond Vue