# RFC: Pending API Improvements for useTemporal

**Date**: 2025-01-23  
**Status**: Active  
**Focus**: Remaining approved features

## Summary

This RFC details the remaining API improvements that have been approved based on the decision matrix scoring (>60/70) and alignment with Vue.js philosophy.

## Pending Improvements

### 1. Type-Safe Unit Constants

**Motivation**: Prevent runtime errors from typos in unit strings.

**Current Problem**:

```typescript
// Typo causes runtime error
temporal.divide(year, "mnth"); // Error: Unknown unit "mnth"
```

**Proposed Solution**:

```typescript
// packages/core/src/constants/units.ts
export const UNITS = {
  millennium: "millennium",
  century: "century",
  decade: "decade",
  year: "year",
  quarter: "quarter",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  millisecond: "millisecond",
  stableMonth: "stableMonth",
} as const;

export type UnitKey = keyof typeof UNITS;
export type UnitValue = (typeof UNITS)[UnitKey];

// Usage
import { UNITS } from "@usetemporal/core";
temporal.divide(year, UNITS.month); // Type-safe, autocomplete works
```

**Benefits**:

- Type safety at compile time
- IDE autocomplete
- No runtime overhead (const object)
- Tree-shakable

### 2. Temporal Utility Functions

**Motivation**: Simplify common operations with dedicated functions.

**Current Verbose Patterns**:

```typescript
// Navigate to specific date
temporal.browsing.value = new Date("2024-01-15");

// Select a date
temporal.picked.value = someDate;

// Go to today
temporal.browsing.value = new Date();
```

**Proposed API**:

```typescript
// packages/core/src/utils/temporal.ts
export function goto(temporal: TemporalCore, date: Date | string): void {
  temporal.browsing.value = typeof date === "string" ? new Date(date) : date;
}

export function select(temporal: TemporalCore, date: Date | string): void {
  temporal.picked.value = typeof date === "string" ? new Date(date) : date;
}

export function today(temporal: TemporalCore): void {
  temporal.browsing.value = new Date();
}

export function reset(temporal: TemporalCore): void {
  const now = new Date();
  temporal.browsing.value = now;
  temporal.picked.value = now;
  temporal.now.value = now;
}

// Usage
import { goto, select, today } from "@usetemporal/core/utils";

goto(temporal, "2024-01-15");
select(temporal, pickedDate);
today(temporal);
```

**Additional Utilities to Consider**:

```typescript
// Check if browsing specific period
export function isBrowsing(temporal: TemporalCore, unit: TimeUnit): boolean {
  return unit.raw.value.getTime() === temporal.browsing.value.getTime();
}

// Check if date is selected
export function isSelected(temporal: TemporalCore, date: Date): boolean {
  return date.getTime() === temporal.picked.value.getTime();
}
```

### 3. Standalone Divide Function

**Motivation**: Better tree-shaking and functional programming style.

**Current**:

```typescript
// divide is always part of temporal object
const months = temporal.divide(year, "month");
```

**Proposed API**:

```typescript
// packages/core/src/divide/index.ts
export function divide(interval: TimeUnit, unit: TimeUnitKind): TimeUnit[] {
  // Implementation same as temporal.divide
  // Can reference temporal from interval's context
}

// Convenience functions for common divisions
export function months(interval: TimeUnit): TimeUnit[] {
  return divide(interval, "month");
}

export function days(interval: TimeUnit): TimeUnit[] {
  return divide(interval, "day");
}

export function weeks(interval: TimeUnit): TimeUnit[] {
  return divide(interval, "week");
}

export function hours(interval: TimeUnit): TimeUnit[] {
  return divide(interval, "hour");
}

// Usage
import { divide, months, days } from "@usetemporal/core/divide";

const monthsInYear = divide(year, "month");
// or
const monthsInYear = months(year);
```

## Implementation Guidelines

### Follow Vue.js Philosophy

- Small, focused functions
- Tree-shakable exports
- Explicit over implicit
- No hidden side effects

### Maintain Backward Compatibility

- All changes are additive
- Existing APIs continue to work
- Gradual migration path

### Testing Requirements

- Unit tests for each function
- Type tests for TypeScript features
- Bundle size impact measurement
- Performance benchmarks

## Migration Examples

### Before

```typescript
import { createTemporal, periods } from "@usetemporal/core";

const temporal = createTemporal({ dateAdapter });
const year = periods.year(temporal);
const months = temporal.divide(year, "month");
temporal.browsing.value = new Date("2024-01-15");
```

### After (with new features)

```typescript
import { createTemporal, periods } from "@usetemporal/core";
import { UNITS } from "@usetemporal/core/constants";
import { divide } from "@usetemporal/core/divide";
import { goto } from "@usetemporal/core/utils";

const temporal = createTemporal({ dateAdapter });
const year = periods.year(temporal);
const months = divide(year, UNITS.month);
goto(temporal, "2024-01-15");
```

## Bundle Size Impact

Estimated impact of new features:

- Type constants: ~100 bytes (just object definition)
- Utility functions: ~300 bytes (all utilities)
- Divide function: ~200 bytes (extracted logic)
- Total: ~600 bytes gzipped

## Timeline

1. **Week 1**: Type constants (lowest hanging fruit)
2. **Week 2**: Utility functions
3. **Week 3**: Standalone divide function
4. **Week 4**: Documentation and examples

## Success Metrics

- Zero breaking changes
- Bundle size increase < 1KB gzipped
- All functions tree-shakable
- 100% TypeScript coverage
- Positive developer feedback
