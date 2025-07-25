# Research Directory

This directory contains the feature backlog and RFC (Request for Comments) documents for the useTemporal project.

## Structure

```
research/
├── BACKLOG.md        # Feature backlog with priorities
├── RFC/              # Individual RFC documents
│   ├── 001-calendar-grid.md
│   ├── 002-utility-functions.md
│   ├── 003-type-constants.md
│   └── ...
├── COMPLETED/        # Completed feature stories
│   ├── USER-STORY-CONTAINS-METHOD.md
│   ├── USER-STORY-STABLE-MONTH.md
│   ├── USER-STORY-UNIFIED-NAVIGATION.md
│   └── USER-STORY-WEEK-START.md
└── ARCHIVE/          # Historical documents
```

## How to Use

1. **Check the Backlog** - `BACKLOG.md` shows all features with their priority and RFC links
2. **Read RFCs** - Each RFC in the `RFC/` folder details one specific improvement
3. **Completed Features** - The `COMPLETED/` folder has implemented feature stories

## RFC Format

Each RFC follows this structure:

- **Summary** - One-line description
- **Motivation** - Why this feature is needed
- **Detailed Design** - API and implementation details
- **Benefits** - What this improves
- **Drawbacks** - Potential downsides
- **Alternatives** - Other approaches considered
- **Migration Path** - How to adopt the feature

## Current Implementation Status (v2.0.0-alpha.1)

The library has undergone a major architectural shift to a **Period-centric API**:

### Core Architecture Changes

- **Period-based Operations**: All operations now work with `Period` objects instead of `TimeUnit` classes
- **Functional API**: Pure functions that take temporal context and periods
- **Minimal Temporal State**: The temporal instance is now just a state container with adapter, config, and reactive periods

### Implemented Features

1. **Period Operations**
   - `createPeriod()` - Create period of specified type
   - `createCustomPeriod()` - Create custom period with start/end dates
   - `toPeriod()` - Convert date to period

2. **Division/Split Operations**
   - `divide()` - The signature pattern for hierarchical time division
   - `split()` - Advanced splitting with unit/count/duration options

3. **Navigation**
   - `next()`, `previous()`, `go()` - Move between periods
   - `zoomIn()`, `zoomOut()` - Zoom navigation (aliases for divide/merge)

4. **Merging**
   - `merge()` - Intelligent period merging with natural unit detection

5. **Comparison**
   - `isSame()` - Check if periods are in same unit
   - `contains()` - Check if period contains date/period

6. **Reactive Composables**
   - `useYear()`, `useMonth()`, `useWeek()`, `useDay()`, etc.
   - `useQuarter()` - Quarter support
   - `useStableMonth()` - 6-week calendar grid

### Key API Differences from Original Design

- No TimeUnit classes - uses plain Period objects
- All operations are standalone functions
- Simplified Temporal instance
- Mandatory date parameter in createTemporal
- Everything revolves around the Period interface

## Contributing

When proposing a new feature:

1. Add it to `BACKLOG.md` with appropriate priority
2. Create a new RFC file: `RFC/XXX-feature-name.md`
3. Follow the RFC template structure
4. Link the RFC from the backlog entry
