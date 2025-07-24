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

The solution leverages the branded types insight - units are just Period objects with validation rules.

```typescript
// Core Library
@usetemporal/core
├── Core Units: Built-in validators for common units
├── Operations: Work on any Period regardless of type
└── Unit Registry: Simple Map<string, UnitDefinition>

// Extension Packages (lightweight validators)
@usetemporal/units-business    // quarter, fiscal-year validators
@usetemporal/units-academic    // semester, term validators
@usetemporal/units-historical  // century, decade validators
```

### Core Interfaces

```typescript
// Simplified Unit Definition - just a validator/normalizer
interface UnitDefinition {
  // Create a normalized period of this unit type from any date
  createPeriod(date: Date, context: TemporalContext): Period;
  
  // Validate that a period conforms to this unit's rules (optional)
  validate?(period: Period): boolean;
  
  // What units this can divide into (for divide operation)
  divisions?: string[];
  
  // What unit multiple of these merge into (for merge operation)
  mergesTo?: string;
}

// Type to extend Unit type
declare module '@usetemporal/core' {
  interface UnitRegistry {
    // Extended by packages to add their units
  }
  
  // Unit type becomes extensible
  type Unit = keyof UnitRegistry | (string & {});
}

// Simple registration
export function defineUnit(type: string, definition: UnitDefinition): void;

### Usage Examples

#### Basic Usage (Core Units Only)

```typescript
import { createTemporal } from '@usetemporal/core';
import { nativeAdapter } from '@usetemporal/adapter-native';

const temporal = createTemporal({
  adapter: nativeAdapter
});

// Core units work out of the box
const year = usePeriod(temporal, 'year'); ✓
const month = usePeriod(temporal, 'month'); ✓
const quarter = usePeriod(temporal, 'quarter'); ✓ // If included in core
```

#### Adding Business Units

```typescript
import { createTemporal, defineUnit } from '@usetemporal/core';
import { nativeAdapter } from '@usetemporal/adapter-native';
import '@usetemporal/units-business'; // Side-effect import registers units

// Units are automatically available after import
const temporal = createTemporal({ adapter: nativeAdapter });
const quarter = usePeriod(temporal, 'quarter'); ✓
const fiscalYear = usePeriod(temporal, 'fiscal-year'); ✓
```

#### Custom Unit Definition

```typescript
// Define a sprint unit (2-week periods)
defineUnit('sprint', {
  createPeriod(date: Date, context: TemporalContext): Period {
    // Find the Monday of this week
    const start = context.adapter.startOf(date, 'week', { 
      weekStartsOn: 1 
    });
    // Sprint is 2 weeks
    const end = context.adapter.add(start, { days: 13 });
    
    return {
      start,
      end,
      type: 'sprint',
      date
    };
  },
  
  // Sprints can be divided into weeks and days
  divisions: ['week', 'day'],
  
  // 6 sprints make a quarter (roughly)
  mergesTo: 'quarter'
});

// Now use it
const sprint = usePeriod(temporal, 'sprint');
const days = divide(temporal, sprint.value, 'day'); // 14 days
```

#### Direct Period Creation (No Registration Needed)

```typescript
// You can always create custom periods without registration
const customPeriod: Period = {
  start: new Date('2024-01-01'),
  end: new Date('2024-03-31'),
  type: 'q1-2024',  // Any string works!
  date: new Date('2024-01-01')
};

// Operations work on any Period
const weeks = divide(temporal, customPeriod, 'week'); // Works!
const next = next(temporal, customPeriod); // Works!
```

### Type Safety with Module Augmentation

```typescript
// @usetemporal/units-business/types.d.ts
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'quarter': true;
    'fiscal-year': true;
    'business-day': true;
  }
}

// This enables TypeScript autocomplete
const quarter = usePeriod(temporal, 'quarter'); // Type-safe!
```

## Key Insights

### Why This Works

1. **Units are just strings**: The Period type tag is all that matters
2. **Operations are generic**: They work on Period shape, not specific units
3. **Validation is optional**: Many units just need boundary calculation
4. **Zero runtime overhead**: Unused validators are tree-shaken

### Example: How Operations Work

```typescript
// The next() operation doesn't care about unit types
function next(context: TemporalContext, period: Period): Period {
  // Just shift the period forward by its duration
  const duration = period.end.getTime() - period.start.getTime() + 1;
  return {
    start: new Date(period.end.getTime() + 1),
    end: new Date(period.end.getTime() + duration),
    type: period.type,  // Preserve the "brand"
    date: new Date(period.end.getTime() + 1)
  };
}

// Works for ANY unit type!
next(temporal, monthPeriod);   // Next month
next(temporal, sprintPeriod);  // Next sprint  
next(temporal, customPeriod);  // Next whatever
```

## Implementation Plan

### Phase 1: Core Simplification (v2.1)

1. Add `defineUnit()` function to core
2. Convert existing units to use definitions
3. Make Unit type extensible via module augmentation
4. Update operations to check unit registry when needed

### Phase 2: Extension Packages (v2.2)

1. Create `@usetemporal/units-business`
   - Simple validators for quarter, fiscal-year
2. Create `@usetemporal/units-academic`
   - Validators for semester, term, academic-year
3. Create `@usetemporal/units-historical`
   - Validators for century, decade, millennium

### Phase 3: Documentation (v2.3)

1. Unit definition guide
2. Best practices for custom units
3. Example implementations

## Success Metrics

1. **Bundle Size**: Core library reduced by 30-40% (fewer built-in units)
2. **Simplicity**: Unit definition < 20 lines of code
3. **Adoption**: Community creates 10+ custom units within 3 months
4. **Performance**: No performance regression (operations remain O(1))

## Benefits of Branded Types Approach

1. **Extreme Simplicity**: Units are just validators, not complex objects
2. **Zero Overhead**: Period objects are plain data
3. **Universal Operations**: All operations work on any Period
4. **Easy Extension**: Adding a unit is just one function
5. **Type Safety**: TypeScript can still provide autocomplete

## Risks & Mitigation

### Risk 1: String Collisions

- **Risk**: Two packages define same unit name
- **Mitigation**: Last registration wins, console warning

### Risk 2: Invalid Periods

- **Risk**: Users create malformed Period objects
- **Mitigation**: Operations validate periods when needed

### Risk 3: Type Discovery

- **Risk**: Users don't know available units
- **Mitigation**: Good documentation, TypeScript autocomplete

## Distribution Strategy

### Core Package

```typescript
// @usetemporal/core includes only essential units
const year = usePeriod(temporal, 'year');   // ✓ Built-in
const month = usePeriod(temporal, 'month'); // ✓ Built-in
const day = usePeriod(temporal, 'day');     // ✓ Built-in
```

### Extension Packages

```typescript
// Import packages for additional units
import '@usetemporal/units-business';  // Adds quarter, fiscal-year
import '@usetemporal/units-academic';  // Adds semester, term

// Now these work
const quarter = usePeriod(temporal, 'quarter');
const semester = usePeriod(temporal, 'semester');
```


## Comparison with Original Plugin Approach

| Aspect | Complex Plugin System | Branded Types Approach |
|--------|----------------------|------------------------|
| Unit Definition | ~50 lines (interface) | ~10 lines (function) |
| Runtime Overhead | Plugin objects | None (just strings) |
| Type Extension | Complex generics | Simple augmentation |
| Operations | May need customization | Universal (work on any Period) |
| Bundle Impact | Heavier core | Minimal core |

## Open Questions

1. **Should some units stay in core?** (year, month, day seem essential)
2. **How to handle unit-specific operations?** (e.g., `isLeapYear` for year periods)
3. **Naming for unit packages?** (`@usetemporal/units-*` vs `@usetemporal/*-units`)

## Conclusion

By recognizing that units are simply branded types (Period objects with a type tag), we can dramatically simplify the extension system. Instead of complex plugins, we just need:

1. A way to register unit validators (simple functions)
2. A type system that allows extension (module augmentation)
3. Operations that work on the Period shape (already done!)

This approach perfectly aligns with useTemporal's **functional architecture**:
- No classes or inheritance
- Pure functions for operations
- Immutable Period data structures
- Composition over configuration
- Side-effect free unit definitions

This makes useTemporal incredibly flexible while keeping the core tiny and the mental model simple: **Everything is just a Period with a type string, and all operations are pure functions**.
