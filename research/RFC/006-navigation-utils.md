# RFC-006: Navigation Utility Functions

## Summary

Add utility functions for common navigation patterns: `goto()`, `today()`, `jumpTo()`.

## Motivation

Common navigation operations with the Period-centric API could benefit from convenience utilities:

```typescript
// Current patterns
temporal.browsing.value = toPeriod(
  temporal,
  new Date(2024, 0, 15),
  temporal.browsing.value.type
);
temporal.browsing.value = temporal.now.value;

// In components
function goToToday() {
  temporal.browsing.value = toPeriod(
    temporal,
    temporal.now.value.date,
    temporal.browsing.value.type
  );
}
```

## Detailed Design

### API (Updated for Period-centric Architecture)

```typescript
// Navigation utilities
export function goto(
  temporal: Temporal,
  date: Date | string,
  type?: PeriodType
): void;
export function jumpTo(temporal: Temporal, period: Period): void;
export function today(temporal: Temporal): void;
export function now(temporal: Temporal): void;

// Usage
import { goto, jumpTo, today } from "@usetemporal/core/utils";

// Navigate to date (maintains current period type)
goto(temporal, "2024-01-15");
goto(temporal, new Date(2024, 0, 15));

// Navigate to date with specific period type
goto(temporal, "2024-01-15", "month");

// Jump to a specific period
const targetPeriod = createPeriod(temporal, "year", somePeriod);
jumpTo(temporal, targetPeriod);

// Go to today (maintains current period type)
today(temporal);

// Reset to current time
now(temporal);
```

### Advanced Navigation

```typescript
// Relative navigation shortcuts
export function nextPeriod(temporal: Temporal): void;
export function previousPeriod(temporal: Temporal): void;
export function goNext(temporal: Temporal, steps = 1): void;
export function goPrevious(temporal: Temporal, steps = 1): void;

// Usage in calendar header
<button @click="() => nextPeriod(temporal)">Next</button>
<button @click="() => previousPeriod(temporal)">Previous</button>
```

## Implementation

```typescript
// In src/operations/navigationUtils.ts
import { toPeriod, next, previous, go } from "@usetemporal/core";

export function goto(
  temporal: Temporal,
  date: Date | string,
  type?: PeriodType
): void {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const periodType = type || temporal.browsing.value.type;
  temporal.browsing.value = toPeriod(temporal, targetDate, periodType);
}

export function jumpTo(temporal: Temporal, period: Period): void {
  temporal.browsing.value = period;
}

export function today(temporal: Temporal): void {
  temporal.browsing.value = toPeriod(
    temporal,
    new Date(),
    temporal.browsing.value.type
  );
}

export function now(temporal: Temporal): void {
  temporal.browsing.value = temporal.now.value;
}

export function nextPeriod(temporal: Temporal): void {
  temporal.browsing.value = next(temporal, temporal.browsing.value);
}

export function previousPeriod(temporal: Temporal): void {
  temporal.browsing.value = previous(temporal, temporal.browsing.value);
}

export function goNext(temporal: Temporal, steps = 1): void {
  temporal.browsing.value = go(temporal, temporal.browsing.value, steps);
}

export function goPrevious(temporal: Temporal, steps = 1): void {
  temporal.browsing.value = go(temporal, temporal.browsing.value, -steps);
}
```

## Benefits

- Cleaner navigation code
- Consistent patterns across apps
- String date support for convenience
- Tree-shakable functions
- Works seamlessly with Period-centric architecture

## Drawbacks

- Another set of APIs to learn
- Simple wrappers over existing operations
- String parsing could fail
- May encourage direct mutation of temporal state

## Alternatives

1. Add methods to temporal object (breaks minimal state principle)
2. Keep in userland (current approach)
3. Create navigation object: `temporal.nav.goto()`
4. Use existing operations directly (more verbose but explicit)

## Migration Path

No breaking changes. Pure additions that can be adopted gradually:

```typescript
// Direct approach (current)
temporal.browsing.value = next(temporal, temporal.browsing.value);

// With utilities
import { nextPeriod } from "@usetemporal/core/utils";
nextPeriod(temporal);
```

## Notes

These utilities are convenience wrappers around existing operations. They don't add new functionality but provide a more ergonomic API for common navigation patterns in UI components.
