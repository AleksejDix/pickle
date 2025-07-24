# RFC-002: Basic Utility Functions

**Status: PROPOSED** - Not yet implemented

## Summary

Add common date checking functions like `isWeekend()`, `isToday()`, `isPast()`, etc. as standalone operations following the new Period-centric architecture.

## Motivation

Developers repeatedly implement the same basic checks:

```typescript
// Current repetitive patterns
const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
const isToday = isSame(temporal, day, temporal.now.value, "day");
const isPast = day.end < temporal.now.value.start;
```

## Detailed Design

### API (Updated for Period-centric Architecture)

```typescript
// Standalone utility functions that work with Periods
export function isWeekend(context: TemporalContext, period: Period): boolean;
export function isWeekday(context: TemporalContext, period: Period): boolean;

// Relative to now
export function isToday(temporal: Temporal, period: Period): boolean;
export function isTomorrow(temporal: Temporal, period: Period): boolean;
export function isYesterday(temporal: Temporal, period: Period): boolean;
export function isPast(temporal: Temporal, period: Period): boolean;
export function isFuture(temporal: Temporal, period: Period): boolean;

// Relative to current period
export function isThisWeek(temporal: Temporal, period: Period): boolean;
export function isThisMonth(temporal: Temporal, period: Period): boolean;
export function isThisYear(temporal: Temporal, period: Period): boolean;
```

### Usage Examples

```typescript
import {
  isWeekday,
  isPast,
  isToday,
  isWeekend,
  isTomorrow,
} from "@usetemporal/core/utils";

// Filter business days
const businessDays = days.filter(
  (day) => isWeekday(temporal, day) && !isPast(temporal, day)
);

// Highlight special days
if (isToday(temporal, day)) {
  classList.add("today");
} else if (isWeekend(temporal, day)) {
  classList.add("weekend");
}

// Show relative dates
const eventPeriod = toPeriod(temporal, event.date, "day");
if (isTomorrow(temporal, eventPeriod)) {
  return "Tomorrow";
}
```

## Implementation

```typescript
// operations/isWeekend.ts
export function isWeekend(context: TemporalContext, period: Period): boolean {
  const day = period.date.getDay();
  return day === 0 || day === 6;
}

// operations/isWeekday.ts
export function isWeekday(context: TemporalContext, period: Period): boolean {
  return !isWeekend(context, period);
}

// operations/isToday.ts
export function isToday(temporal: Temporal, period: Period): boolean {
  return isSame(temporal, period, temporal.now.value, "day");
}

// operations/isTomorrow.ts
export function isTomorrow(temporal: Temporal, period: Period): boolean {
  const tomorrow = next(temporal, temporal.now.value);
  return isSame(temporal, period, tomorrow, "day");
}

// operations/isPast.ts
export function isPast(temporal: Temporal, period: Period): boolean {
  return period.end < temporal.now.value.start;
}

// operations/isFuture.ts
export function isFuture(temporal: Temporal, period: Period): boolean {
  return period.start > temporal.now.value.end;
}

// operations/isThisWeek.ts
export function isThisWeek(temporal: Temporal, period: Period): boolean {
  const currentWeek = toPeriod(temporal, temporal.now.value.date, "week");
  return isSame(temporal, period, currentWeek, "week");
}

// Similar implementations for isThisMonth, isThisYear, etc.
```

## Benefits

- Eliminates repetitive date checking logic
- Consistent with Period-centric architecture
- Tree-shakable - import only what you need
- Type-safe with Period objects
- Leverages existing operations like `isSame()` and `next()`

## Drawbacks

- More functions to import individually
- Some functions might be too simple to warrant inclusion
- Weekend definition is culturally specific (Sat/Sun)

## Alternatives

1. Keep these in userland
2. Bundle as a utils namespace export
3. Create a separate `@usetemporal/utils` package
4. Add to Period interface as getters (but violates data-only principle)

## Migration Path

No breaking changes. Pure addition to the API. Each utility is a standalone function that can be imported as needed:

```typescript
// Individual imports (recommended for tree-shaking)
import { isWeekend, isToday } from "@usetemporal/core/operations";

// Or from a utils barrel export
import { isWeekend, isToday } from "@usetemporal/core/utils";
```

## Implementation Notes

These utility functions have been designed to work with the current Period-centric architecture but have not been implemented yet. They represent convenience functions that would make common date operations more ergonomic while maintaining the functional, tree-shakable nature of the library.
