# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

useTemporal is a revolutionary time library featuring a unique `divide()` pattern for hierarchical time management. The project is organized as a monorepo with framework-agnostic architecture, supporting Vue, React, Angular, Svelte, and vanilla JavaScript.

Key innovation: The library provides the only JavaScript time handling with the `divide()` pattern, allowing infinite subdivision of time units with perfect synchronization.

## Commands

### Development

```bash
# Install dependencies for all packages
npm install

# Start demo application (port 8080)
npm run dev

# Build library
npm run build:lib

# Build demo
npm run build:demo

# Build everything
npm run build
```

### Library Package Commands (packages/usetemporal/)

```bash
# Build library
npm run build

# Watch mode
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test

# Bundle size analysis
npm run bundle-size
```

### Demo Package Commands (packages/demo/)

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Architecture

### Monorepo Structure

- `packages/usetemporal/` - Core library with zero dependencies goal
- `packages/demo/` - Vue demo application showcasing features
- `research/` - RFCs documenting architectural decisions

### Core Library Architecture (packages/usetemporal/src/)

- `core/` - Main `createTemporal()` function and core logic
- `composables/` - Time unit composables (useYear, useMonth, etc.)
- `adapters/` - Date adapter plugin system supporting native JS, date-fns, Luxon, and Temporal API
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

### Key Design Patterns

1. **Reactive Core**: Uses `@vue/reactivity` (not Vue framework) for framework-agnostic reactivity
2. **Adapter Pattern**: Pluggable date library support with auto-detection
3. **Composable Pattern**: Each time unit (year, month, day) follows consistent interface
4. **Functional Architecture**: No classes, pure functional design

### Revolutionary divide() Pattern

```typescript
const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // 12 months
const days = temporal.divide(month, "day"); // ~30 days
```

### Date Adapter System

The library supports multiple date libraries through adapters:

- Native JavaScript Date (zero dependencies)
- date-fns (optional peer dependency)
- Luxon (optional peer dependency)
- Temporal API (future-proof)

Auto-detection with fallback: Temporal API → date-fns → Luxon → native

### Fiscal Year Support

Comprehensive support for global fiscal year systems:

- US Federal (July start)
- UK/India (April start)
- Japan (April start)
- Australia (July start)
- Configurable for any month (0-11)

## Important Implementation Notes

1. **Framework Agnostic**: The library uses only `@vue/reactivity`, not the Vue framework. All imports must be from `@vue/reactivity`, not `vue`.

2. **Zero Dependencies Goal**: The native adapter provides full functionality without external dependencies. Other adapters are optional.

3. **Tree-shaking**: Modular exports allow importing only needed parts:
   - `usetemporal/core`
   - `usetemporal/composables`
   - `usetemporal/adapters`

4. **Naming Convention**: The library was renamed from `usePickle` to `createTemporal`. All "pickle" references have been removed.

5. **Testing**: Run tests with `npm run test` in the library package. The project uses Vitest.

## Current Status

The project is in v2.0.0-alpha.1 with:

- ✅ Framework-agnostic architecture complete
- ✅ Date adapter plugin system implemented
- ✅ Professional API naming (createTemporal)
- ✅ Fiscal year support
- 🔄 Bundle size optimization in progress (target: <6KB)
- 🔄 Cross-framework examples needed

See `research/STRATEGY-SUMMARY.md` for detailed roadmap and completion status.
