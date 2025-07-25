# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

useTemporal is a revolutionary time library featuring a unique `divide()` pattern for hierarchical time management. The project is organized as a monorepo with framework-agnostic architecture.

**Current API Status (v2.0.0)**: The library has been significantly simplified with a unified functional API. There are NO individual time unit composables like `useYear()` or `useMonth()` - only `usePeriod()` exists.

## Documentation Structure

The project follows BMad-Method documentation patterns with clear separation between user and developer documentation:

### User Documentation (`/vitepress`)
- End-user guides for using the library
- API reference for public functions
- Examples and tutorials
- Hosted documentation site

### Developer Documentation (`/docs`)
Following BMad-Method structure:
- **`/docs/prd/`** - Product Requirements Documents
  - Main PRD: `usetemporal-prd.md`
- **`/docs/architecture/`** - Technical Architecture
  - Main Architecture: `usetemporal-architecture.md`
- **`/docs/epics/`** - Feature epics grouping related stories
- **`/docs/stories/`** - User stories for implementation
- **`/docs/development/`** - Developer guides and processes

### Key Documents for AI Agents
1. **Architecture**: `/docs/architecture/usetemporal-architecture.md` - Current system state, not idealized
2. **PRD**: `/docs/prd/usetemporal-prd.md` - Requirements and planned enhancements
3. **Stories**: `/docs/stories/` - Actionable development tasks with full context
4. **This file**: `CLAUDE.md` - AI agent guidance

### Working with Stories
When implementing a story:
1. Read the complete story file including all 9 sections
2. Check Dev Notes for technical context and architecture references
3. Update story status when beginning work
4. Mark tasks complete as you progress
5. Fill in Dev Agent Record section

## Core Philosophy: "Calculus for Time"

This library follows a minimal philosophy inspired by calculus - provide fundamental operations that compose into complex solutions:

1. **Fundamental Operations Only** - Like derivatives and integrals in calculus, we provide only the essential building blocks
2. **Composition Over Convenience** - Users compose operations rather than relying on pre-built conveniences
3. **Pure Functions** - All operations are pure, returning new values without mutations
4. **Minimal API Surface** - Every addition must be truly fundamental and irreducible

### Examples of the Philosophy

```typescript
// Fundamental operations (like dx, ∫)
createPeriod(temporal, date, unit)  // Create any period
divide(temporal, period, unit)      // Break down periods
merge(temporal, periods)            // Combine periods
next/previous/go                    // Navigate relatively

// Everything else is composition
today(temporal, unit) = createPeriod(temporal, new Date(), unit)

// Users can compose their own abstractions
const isThisWeek = (period, temporal) => 
  isSame(temporal, period, createPeriod(temporal, new Date(), "week"), "week");
```

### What This Means for Development

- **Question every addition**: Can this be easily composed from existing operations?
- **Reject trivial wrappers**: Functions that just reorder parameters or save a few characters
- **Document patterns**: Instead of adding conveniences, show users how to compose
- **Trust users**: They can create their own abstractions when needed

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

# Run a single test file
npx vitest run path/to/test.test.ts

# Type checking for all packages
npm run type-check

# Lint all packages
npm run lint

# Format code with Prettier
npm run format

# Check formatting without writing
npm run format:check

# Clean all build artifacts
npm run clean

# Build and publish packages (requires changeset)
npm run release

# Documentation
npm run docs:dev      # Start docs dev server
npm run docs:build    # Build documentation
npm run docs:preview  # Preview built docs
```

### Package-Specific Commands

```bash
# Run dev mode for core
npm run dev

# Build specific package
npm run build --workspace=@usetemporal/adapter-luxon

# Test specific package
npm test --workspace=@usetemporal/core

# Run any command in a specific workspace
npm run <command> --workspace=<package-name>
```

## Architecture

### Current API Design (IMPORTANT)

The library uses a **functional, Period-centric architecture**:

```typescript
// Core types
interface Period {
  type: Unit;    // 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
  date: Date;    // Representative date
  start: Date;   // Period start
  end: Date;     // Period end (exclusive)
}

interface Temporal {
  adapter: Adapter;
  weekStartsOn: number;
  browsing: Ref<Period>;  // Currently browsed period
  now: Ref<Period>;       // Current time period
}
```

### Key API Elements

1. **Factory Function**: `createTemporal(options)` - requires an adapter
2. **Single Composable**: `usePeriod(temporal, unit)` - creates reactive periods
3. **Operations**: All are pure functions that work with Period objects
   - `divide(temporal, period, unit)` - The revolutionary pattern
   - `next()`, `previous()`, `go()` - Navigation
   - `contains()`, `isSame()` - Comparison
   - `zoomIn()`, `zoomOut()`, `zoomTo()` - Zooming
   - `split()`, `merge()` - Advanced operations

### Monorepo Structure

```
pickle/
├── packages/
│   ├── core/                    # Core library (functional API)
│   ├── adapter-native/          # Native JS Date adapter
│   ├── adapter-date-fns/        # date-fns adapter
│   ├── adapter-luxon/           # Luxon adapter
│   ├── adapter-temporal/        # Temporal API adapter
│   ├── usetemporal/            # Meta package (core + native adapter)
│   └── tsconfig/               # Shared TypeScript configs
├── examples/
│   └── vue/                    # Vue.js example with routing
├── docs/                       # VitePress documentation
└── research/                   # RFCs and design documents
```

### Adapter System

Adapters must implement this minimal interface:

```typescript
interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, value: number, unit: AdapterUnit): Date;
  diff(start: Date, end: Date, unit: AdapterUnit): number;
}
```

### Unit Registry System

The library supports custom units through module augmentation:

```typescript
// Define custom unit
defineUnit('fortnight', {
  duration: { weeks: 2 },
  validate: (adapter, date) => boolean
});

// TypeScript augmentation
declare module '@usetemporal/core' {
  interface UnitRegistry {
    fortnight: true;
  }
}
```

## Important Implementation Notes

1. **NO Vue Framework Dependency**: Uses only `@vue/reactivity` for reactivity
2. **Functional Design**: No classes, all operations are pure functions
3. **ESM Only**: All packages use `"type": "module"`
4. **Unified Types**: Single `Unit` type, single `Period` type
5. **Required Adapters**: `createTemporal()` requires an adapter instance

## Testing Guidelines

- Tests use Vitest and are located in `src/__tests__/`
- Mock adapter available in `src/test/mockAdapter.ts`
- Test utilities in `src/test/utils.ts`
- Focus on Period operations and reactivity

## Common Pitfalls

1. **Don't import from 'vue'** - Always use '@vue/reactivity'
2. **Don't use old API** - No `useYear()`, `useMonth()` etc., only `usePeriod()`
3. **Adapters are required** - Always pass an adapter to `createTemporal()`
4. **Operations are functions** - `divide()` is not a method on temporal

## Current Development Focus

- Bundle size optimization (target <6KB)
- Performance improvements for divide() operations
- Additional framework examples
- Documentation improvements