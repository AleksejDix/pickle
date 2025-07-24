# Product Requirements Document: Unit Extension System (Branded Types Approach)

**Status**: Draft  
**Version**: 2.0  
**Last Updated**: 2025-07-24  
**Author**: useTemporal Team

## Executive Summary

This PRD outlines a lightweight unit extension system based on the insight that units are simply "branded types" - Period objects with a type tag. This approach dramatically simplifies extensibility while maintaining type safety and keeping the core minimal.

## Problem Statement

Currently, useTemporal includes all time units in the core library, which:

- Increases bundle size for users who only need basic units
- Limits extensibility for domain-specific units (fiscal years, academic terms, etc.)
- Couples unit definitions with the core library release cycle
- Makes it impossible to support niche units without bloating the core

## Key Insight: Units as Branded Types

The fundamental insight is that units aren't complex entities - they're just Period objects with a type tag. A "month" is simply:
```typescript
{
  start: Date,    // Start of month
  end: Date,      // End of month  
  type: "month",  // The "brand"
  date: Date      // Reference date
}
```

This realization simplifies the entire architecture.

## Goals

### Primary Goals

1. **Minimal Core**: Ship only essential units in core
2. **Simple Extensions**: Adding units should be trivial (just validators)
3. **Type Safety**: Maintain TypeScript support for custom units
4. **Zero Overhead**: Units are just strings, validators are tree-shakable
5. **Domain Support**: Any string can be a unit type

### Non-Goals

- Complex plugin architecture
- Runtime plugin discovery
- Unit inheritance or hierarchies

## User Personas

### 1. **Basic User** (80% of users)

- Needs: Standard time units (year, month, day)
- Pain: Current bundle includes units they never use
- Solution: Smaller core bundle with just essential units

### 2. **Business Developer**

- Needs: Quarters, fiscal years, business days
- Pain: Has to calculate these manually
- Solution: `@usetemporal/business-units` plugin

### 3. **Academic Developer**

- Needs: Semesters, terms, academic years
- Pain: No built-in support for academic calendars
- Solution: `@usetemporal/academic-units` plugin

### 4. **Domain Expert**

- Needs: Custom units specific to their domain
- Pain: Cannot extend the library
- Solution: Create custom unit plugins

## Proposed Solution

### Architecture Overview

```typescript
// Core Library - Minimal Units Only
@usetemporal/core
├── Units: year, month, week, day, hour, minute, second
├── Operations: divide, merge, next, previous, etc.
└── Plugin System: UnitPlugin interface, registration

// Official Unit Plugins
@usetemporal/business-units    // quarter, fiscal-year, business-day
@usetemporal/academic-units    // semester, term, academic-year
@usetemporal/historical-units  // century, decade, millennium
@usetemporal/astronomical-units // lunar-month, season, solar-year

// Community Plugins
@company/project-units         // sprint, milestone, release
@domain/specialized-units      // Any domain-specific units
```

### Core Interfaces

```typescript
// Unit Plugin Interface
interface UnitPlugin {
  // Unique identifier for the unit
  type: string; // e.g., "quarter", "century"

  // Display name for the unit
  name: string; // e.g., "Quarter", "Century"

  // Calculate period boundaries for a given date
  getPeriod(date: Date, context: TemporalContext): Period;

  // Define what units this can be divided into
  canDivideInto?: string[]; // e.g., century -> ["decade", "year"]

  // Define what this can merge into
  canMergeInto?: string; // e.g., month -> "quarter"

  // Validation rules
  validate?(period: Period): boolean;

  // Custom operations (optional)
  operations?: {
    next?: (period: Period, context: TemporalContext) => Period;
    previous?: (period: Period, context: TemporalContext) => Period;
  };
}

// Plugin Registration
interface CreateTemporalOptions {
  adapter: Adapter;
  plugins?: UnitPlugin[]; // Register unit plugins
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### Usage Examples

#### Basic Usage (No Plugins)

```typescript
import { createTemporal } from '@usetemporal/core';
import { nativeAdapter } from '@usetemporal/adapter-native';

const temporal = createTemporal({
  adapter: nativeAdapter
});

// Only core units available
const year = usePeriod(temporal, 'year'); ✓
const quarter = usePeriod(temporal, 'quarter'); ✗ // Error: Unknown unit
```

#### With Business Units Plugin

```typescript
import { createTemporal } from '@usetemporal/core';
import { nativeAdapter } from '@usetemporal/adapter-native';
import { quarterPlugin, fiscalYearPlugin } from '@usetemporal/business-units';

const temporal = createTemporal({
  adapter: nativeAdapter,
  plugins: [quarterPlugin, fiscalYearPlugin]
});

// Now business units work!
const quarter = usePeriod(temporal, 'quarter'); ✓
const quarters = divide(temporal, year.value, 'quarter'); // 4 quarters
```

#### Custom Unit Plugin

```typescript
// my-company-units.ts
export const sprintPlugin: UnitPlugin = {
  type: "sprint",
  name: "Sprint",

  getPeriod(date: Date, context: TemporalContext): Period {
    // 2-week sprints starting on Monday
    const start = context.adapter.startOf(date, "week", {
      weekStartsOn: 1,
    });
    const end = context.adapter.add(start, { weeks: 2 });

    return {
      start,
      end: context.adapter.subtract(end, { milliseconds: 1 }),
      type: "sprint",
      date,
    };
  },

  canDivideInto: ["week", "day"],
  canMergeInto: "quarter",
};

// Usage
const temporal = createTemporal({
  adapter: nativeAdapter,
  plugins: [sprintPlugin],
});

const sprint = usePeriod(temporal, "sprint");
const days = divide(temporal, sprint.value, "day"); // 14 days
```

### Type Safety with Module Augmentation

```typescript
// @usetemporal/business-units/types.d.ts
declare module "@usetemporal/core" {
  interface UnitRegistry {
    quarter: true;
    "fiscal-year": true;
    "business-day": true;
  }
}

// This enables TypeScript support
const quarter = usePeriod(temporal, "quarter"); // Type-safe!
```

## Implementation Plan

### Phase 1: Core Plugin System (v2.1)

1. Define `UnitPlugin` interface
2. Add plugin registration to `createTemporal`
3. Update operations to check plugins
4. Move non-essential units to plugins
5. Update TypeScript types for extensibility

### Phase 2: Official Plugins (v2.2)

1. Create `@usetemporal/business-units`
   - quarter, fiscal-year, business-day
2. Create `@usetemporal/historical-units`
   - century, decade, millennium
3. Create `@usetemporal/academic-units`
   - semester, term, academic-year

### Phase 3: Community & Documentation (v2.3)

1. Plugin development guide
2. Plugin testing utilities
3. Plugin registry/marketplace
4. Example custom plugins

## Success Metrics

1. **Bundle Size**: Core library reduced by 40-50%
2. **Adoption**: 20+ community plugins within 6 months
3. **Performance**: No performance regression with plugins
4. **Developer Satisfaction**: Positive feedback on extensibility

## Risks & Mitigation

### Risk 1: Type Safety Complexity

- **Risk**: Module augmentation might be confusing
- **Mitigation**: Provide clear documentation and examples

### Risk 2: Plugin Conflicts

- **Risk**: Multiple plugins defining same unit type
- **Mitigation**: Runtime validation and clear error messages

### Risk 3: Backward Compatibility

- **Risk**: Breaking existing code using removed units
- **Mitigation**: Provide migration guide and legacy plugin

## Migration Strategy

### For Users

```typescript
// Before (v2.0)
import { createTemporal } from "@usetemporal/core";
const temporal = createTemporal({ adapter });
const quarter = usePeriod(temporal, "quarter"); // Works

// After (v3.0)
import { createTemporal } from "@usetemporal/core";
import { quarterPlugin } from "@usetemporal/business-units";
const temporal = createTemporal({
  adapter,
  plugins: [quarterPlugin],
});
const quarter = usePeriod(temporal, "quarter"); // Works
```

### Compatibility Package

```typescript
// For easy migration
import { createTemporal } from "@usetemporal/core";
import { legacyUnits } from "@usetemporal/legacy-units";

const temporal = createTemporal({
  adapter,
  plugins: legacyUnits, // Includes all v2.0 units
});
```

## Open Questions

1. **Plugin Discovery**: Should we have a plugin registry/marketplace?
2. **Validation**: How strict should plugin validation be?
3. **Performance**: Should plugins be able to optimize operations?
4. **Naming**: Better name than "Unit Plugin"? (Period Plugin? Time Plugin?)

## Alternative Approaches Considered

### 1. Runtime Registration

```typescript
temporal.registerUnit("sprint", sprintPlugin);
```

**Rejected**: Less tree-shakable, harder to type

### 2. Subclassing

```typescript
class SprintUnit extends BaseUnit { ... }
```

**Rejected**: Goes against functional architecture

### 3. Configuration-based

```typescript
units: {
  sprint: { duration: '2 weeks', startOn: 'monday' }
}
```

**Rejected**: Not flexible enough for complex units

## Conclusion

The Unit Plugin System will transform useTemporal from a monolithic time library into an extensible platform for time manipulation. By keeping the core minimal and enabling plugins, we can support any conceivable time unit while maintaining a small bundle size for basic use cases.

This positions useTemporal as the most flexible and extensible time library in the JavaScript ecosystem.
