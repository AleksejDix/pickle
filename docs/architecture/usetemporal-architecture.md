# useTemporal Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the useTemporal codebase, including technical patterns, architectural decisions, and implementation realities. It serves as a reference for AI agents and developers working on enhancements.

### Document Scope

Focused on areas relevant to: Documentation refactoring and BMad-Method implementation, with emphasis on core library and adapter system.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-25 | 1.0 | Initial brownfield analysis | BMad Master |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `packages/core/src/index.ts` - All public exports
- **Types**: `packages/core/src/types.ts` - Core type definitions
- **Factory**: `packages/core/src/createTemporal.ts` - Main factory function
- **Operations**: `packages/core/src/operations/` - All time operations
- **Composables**: `packages/core/src/composables/usePeriods.ts` - Reactive period hook
- **Unit Registry**: `packages/core/src/unit-registry.ts` - Extensible unit system

### Documentation Impact Areas

For the planned documentation refactoring:
- `CLAUDE.md` - Will need updates for new doc structure
- `/vitepress/` - VitePress user documentation (preserve)
- `/docs/STORIES/` - Active stories to migrate
- `/docs/ARCHIVE/` and `/docs/COMPLETED/` - To be removed/archived

## High Level Architecture

### Technical Summary

useTemporal is a revolutionary time library implementing a "Calculus for Time" philosophy. It provides fundamental operations that compose into complex time manipulations, centered around a unique `divide()` pattern for hierarchical time management.

### Actual Tech Stack (from package.json)

| Category | Technology | Version | Notes |
|----------|------------|---------|--------|
| Runtime | Node.js | ESM modules | `"type": "module"` in all packages |
| Core Dependency | @vue/reactivity | ^3.5.18 | Provides reactivity without Vue framework |
| Build Tool | Vite | ^6.0.7 | Used for all packages |
| Test Framework | Vitest | ^3.2.4 | With coverage reporting |
| Type System | TypeScript | ^5.7.3 | Strict typing throughout |
| Documentation | VitePress | Not in core | Separate docs site |

### Repository Structure Reality Check

- Type: Monorepo using npm workspaces
- Package Manager: npm (with workspace support)
- Notable: Clean separation between core, adapters, and meta package

## Source Tree and Module Organization

### Project Structure (Actual)

```text
pickle/
├── packages/
│   ├── core/                    # Core library - THE HEART OF THE SYSTEM
│   │   ├── src/
│   │   │   ├── index.ts        # Public API exports
│   │   │   ├── types.ts        # Core type definitions
│   │   │   ├── createTemporal.ts # Factory function
│   │   │   ├── unit-registry.ts  # Extensible unit system
│   │   │   ├── composables/    # Vue reactivity hooks
│   │   │   │   └── usePeriods.ts # Single reactive composable
│   │   │   ├── operations/     # Pure functional operations
│   │   │   │   ├── divide.ts   # Revolutionary divide pattern
│   │   │   │   ├── contains.ts # Period containment checks
│   │   │   │   ├── go.ts       # Navigation operations
│   │   │   │   ├── merge.ts    # Period merging
│   │   │   │   ├── split.ts    # Period splitting
│   │   │   │   ├── zoom*.ts    # Zoom operations (may be deprecated)
│   │   │   │   └── utils/      # Utility functions
│   │   │   └── units/          # Unit definitions
│   │   │       └── definitions.ts # Core unit registrations
│   │   └── test/              # Testing utilities
│   │       ├── functionalMockAdapter.ts # Mock for testing
│   │       └── shared-adapter-tests.ts  # Adapter compliance
│   ├── adapter-native/         # Pure JS Date adapter
│   ├── adapter-date-fns/       # date-fns integration
│   ├── adapter-luxon/          # Luxon integration
│   ├── adapter-temporal/       # Temporal API adapter
│   ├── usetemporal/           # Meta package (core + native)
│   └── tsconfig/              # Shared TypeScript configs
├── vitepress/                 # VitePress documentation (user-facing)
├── docs/                      # Development documentation (to refactor)
│   ├── STORIES/              # Active development stories
│   ├── ARCHIVE/              # To be removed
│   └── COMPLETED/            # To be removed
└── examples/
    └── vue/                  # Vue.js example application
```

### Key Modules and Their Purpose

- **Core Factory**: `createTemporal()` - Creates temporal instances with adapter and configuration
- **Period System**: All operations work with Period objects `{ start, end, type, date }`
- **Reactive Layer**: `usePeriod()` - The ONLY composable, creates reactive periods
- **Operations**:
  - `divide()` - Split period into smaller units (THE core innovation)
  - `next/previous/go()` - Navigation operations
  - `contains/isSame()` - Comparison operations
  - `merge/split()` - Advanced operations
  - `zoomIn/Out/To()` - Hierarchical navigation (candidate for removal per stories)
- **Unit Registry**: Extensible system supporting custom time units

## Data Models and APIs

### Core Data Models

The Period type is the fundamental data structure:

```typescript
interface Period {
  start: Date;    // Inclusive start
  end: Date;      // Inclusive end
  type: Unit;     // Time unit type
  date: Date;     // Reference date
}

interface Temporal {
  adapter: Adapter;
  weekStartsOn: number;
  browsing: Ref<Period>;  // Currently browsed period
  now: Ref<Period>;       // Current time period
}
```

### Adapter Interface

All adapters must implement this minimal interface:

```typescript
interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, value: number, unit: AdapterUnit): Date;
  diff(start: Date, end: Date, unit: AdapterUnit): number;
}
```

### Public API Surface

Exports are organized into categories:
- Factory: `createTemporal`
- Composables: `usePeriod` (single composable)
- Operations: 15 pure functions
- Types: Full TypeScript support
- Constants: `UNITS`, `YEAR`, `MONTH`, etc.
- Unit Registry: `defineUnit`, `getUnitDefinition`, etc.

## Technical Patterns and Design Decisions

### Current Implementation Patterns

1. **Functional Composition**: All operations are pure functions, no classes
2. **Reactivity via @vue/reactivity**: Framework-agnostic reactive system
3. **Period-Centric**: Everything operates on Period objects
4. **Adapter Pattern**: Clean separation between core logic and date libraries
5. **Unit Registry**: Runtime extensible unit system with TypeScript augmentation

### Known Technical Considerations

Based on story analysis in `/docs/STORIES/`:

1. **API Minimalism**: Story 017 suggests removing zoom operations as aliases
2. **TypeScript Errors**: Story 001 indicates some type issues to fix
3. **Unit Constants**: Stories 012-015 involve implementing/testing unit constants
4. **API Consistency**: Story 016 addresses consistency issues

### Testing Reality

- Unit tests using Vitest with good coverage
- Multi-adapter test suite ensures adapter compliance
- Test utilities in `packages/core/src/test/`
- Mock adapter available for testing
- Tests located alongside source files (`.test.ts`)

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Key Files |
|---------|---------|------------------|-----------|
| @vue/reactivity | Reactivity system | Direct dependency | Used throughout |
| date-fns | Date manipulation | Optional adapter | `adapter-date-fns/` |
| Luxon | Date manipulation | Optional adapter | `adapter-luxon/` |
| Temporal API | Future standard | Optional adapter | `adapter-temporal/` |

### Internal Integration Points

- **Adapter System**: Clean interface allows any date library integration
- **Unit Registry**: Module augmentation for custom units
- **Composables**: Vue-reactivity based but framework agnostic

## Development and Deployment

### Local Development Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start documentation dev server
npm run docs:dev
```

### Build and Deployment Process

- **Build Command**: `npm run build` (uses Vite for all packages)
- **Test Command**: `npm test` (Vitest for all packages)
- **Publishing**: Via changesets (see release script)
- **Documentation**: VitePress site separate from packages

### Testing Commands

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npx vitest run path/to/test.test.ts  # Single test
```

## If Documentation Refactoring PRD - Impact Analysis

### Files That Will Need Modification

Based on the documentation refactoring requirements:

1. **CLAUDE.md** - Update with new documentation structure references
2. **package.json** files - Possibly add documentation-related scripts
3. **/vitepress/** - Preserve but clearly separate from development docs

### New Files/Directories Needed

- `/docs/prd/usetemporal-prd.md` - Already created
- `/docs/architecture/usetemporal-architecture.md` - This document
- `/docs/epics/` - Epic documentation
- `/docs/stories/` - Migrated story files
- `/docs/development/` - Developer guides

### Integration Considerations

- Must preserve VitePress functionality
- Git history should be maintained during migration
- Clear separation between user and developer documentation
- AI agents need updated paths in CLAUDE.md

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
npm run dev                 # Watch mode for core
npm run build              # Build all packages
npm test                   # Run tests
npm run type-check         # TypeScript checking
npm run lint               # Lint code
npm run format             # Format with Prettier

# Documentation
npm run docs:dev           # Start VitePress dev server
npm run docs:build         # Build documentation
npm run docs:preview       # Preview built docs

# Package-specific
npm run build --workspace=@usetemporal/core
npm test --workspace=@usetemporal/adapter-native
```

### Common Issues and Solutions

- **Build Issues**: Ensure all dependencies installed with `npm install`
- **Type Errors**: Run `npm run type-check` to identify issues
- **Test Failures**: Check adapter compliance with shared test suite
- **Documentation Build**: VitePress requires specific structure in `/vitepress`