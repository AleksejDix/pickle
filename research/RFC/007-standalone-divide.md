# RFC-007: Standalone Divide Function

**Status: PARTIALLY COMPLETED** - `divide()` is already a standalone function. Convenience wrappers are still proposed.

## Summary

~~Extract the divide functionality into standalone, tree-shakable functions.~~ ✅ Already done!

Add convenience wrappers for common divide operations.

## Motivation

The `divide()` function is already standalone in the Period-centric architecture:

```typescript
// Current (already implemented)
import { divide } from "@usetemporal/core";
const months = divide(temporal, year, "month");
const days = divide(temporal, month, "day");

// Could add convenience wrappers
const months = monthsIn(temporal, year);
const days = daysIn(temporal, month);
```

## Detailed Design

### API (Updated for Period-centric Architecture)

```typescript
// Core divide function (already implemented)
export function divide(
  context: TemporalContext,
  period: Period,
  unit: PeriodType
): Period[];

// Proposed convenience wrappers
export function yearsIn(temporal: Temporal, period: Period): Period[];
export function quartersIn(temporal: Temporal, period: Period): Period[];
export function monthsIn(temporal: Temporal, period: Period): Period[];
export function weeksIn(temporal: Temporal, period: Period): Period[];
export function daysIn(temporal: Temporal, period: Period): Period[];
export function hoursIn(temporal: Temporal, period: Period): Period[];
export function minutesIn(temporal: Temporal, period: Period): Period[];
export function secondsIn(temporal: Temporal, period: Period): Period[];

// Usage
import { monthsIn, daysIn } from "@usetemporal/core/utils";

const months = monthsIn(temporal, yearPeriod);
const days = daysIn(temporal, monthPeriod);
const hours = hoursIn(temporal, dayPeriod);
```

### Type Safety with Period Types

```typescript
// Runtime validation based on period types
function monthsIn(temporal: Temporal, period: Period): Period[] {
  if (period.type !== "year") {
    throw new Error(`Cannot get months in a ${period.type}`);
  }
  return divide(temporal, period, "month");
}

function daysIn(temporal: Temporal, period: Period): Period[] {
  // Days can be in month, week, or custom periods
  if (!["month", "week", "stableMonth", "custom"].includes(period.type)) {
    throw new Error(`Cannot get days in a ${period.type}`);
  }
  return divide(temporal, period, "day");
}
```

## Implementation

```typescript
// In src/operations/divideUtils.ts
import { divide } from "./divide";

export function yearsIn(temporal: Temporal, period: Period): Period[] {
  // Years can only be divided from custom periods spanning multiple years
  if (period.type !== "custom") {
    throw new Error("Can only get years from custom multi-year periods");
  }
  return divide(temporal, period, "year");
}

export function quartersIn(temporal: Temporal, period: Period): Period[] {
  if (period.type !== "year") {
    throw new Error("Can only get quarters in a year");
  }
  return divide(temporal, period, "quarter");
}

export function monthsIn(temporal: Temporal, period: Period): Period[] {
  if (!["year", "quarter", "custom"].includes(period.type)) {
    throw new Error(`Cannot get months in a ${period.type}`);
  }
  return divide(temporal, period, "month");
}

export function weeksIn(temporal: Temporal, period: Period): Period[] {
  if (!["month", "stableMonth", "custom"].includes(period.type)) {
    throw new Error(`Cannot get weeks in a ${period.type}`);
  }
  return divide(temporal, period, "week");
}

export function daysIn(temporal: Temporal, period: Period): Period[] {
  return divide(temporal, period, "day");
}

export function hoursIn(temporal: Temporal, period: Period): Period[] {
  return divide(temporal, period, "hour");
}

// ... similar for minutes, seconds
```

## Benefits

- ✅ Tree-shakable divide function (already achieved)
- More intuitive API with convenience functions
- Runtime validation for invalid operations
- Clearer intent with named functions

## Drawbacks

- Multiple ways to do the same thing
- More imports to manage
- Convenience functions add API surface
- Runtime validation instead of compile-time

## Alternatives

1. Keep only divide() function (current state)
2. Add TypeScript overloads for better type inference
3. Use different naming: `getMonthsIn()`, `getDaysIn()`
4. Create a single polymorphic function with better inference

## Current State

The core functionality is already implemented:

- ✅ `divide()` is a standalone, tree-shakable function
- ✅ Works with Period objects and TemporalContext
- ✅ Supports all period types

The convenience wrappers remain a future enhancement for better developer ergonomics.

## Migration Path

No breaking changes needed. The convenience functions would be pure additions:

```typescript
// Current way (already works)
import { divide } from "@usetemporal/core";
const months = divide(temporal, yearPeriod, "month");

// Proposed convenience way
import { monthsIn } from "@usetemporal/core/utils";
const months = monthsIn(temporal, yearPeriod);
```
