# RFC-006: Navigation Utility Functions

## Summary

Add utility functions for common navigation patterns: `goto()`, `select()`, `today()`.

## Motivation

Common navigation operations require verbose property access:

```typescript
// Current patterns
temporal.browsing.value = new Date(2024, 0, 15);
temporal.picked.value = someDate;
temporal.browsing.value = temporal.now.value;

// In components
function goToToday() {
  props.temporal.browsing.value = props.temporal.now.value;
}
```

## Detailed Design

### API

```typescript
// Navigation utilities
export function goto(temporal: Temporal, date: Date | string): void;
export function select(temporal: Temporal, date: Date | string): void;
export function today(temporal: Temporal): void;
export function reset(temporal: Temporal): void;

// Usage
import { goto, select, today } from "@usetemporal/core/utils";

goto(temporal, "2024-01-15");      // Navigate to date
goto(temporal, new Date(2024, 0, 15)); // Also accepts Date

select(temporal, selectedDate);      // Update picked date
today(temporal);                     // Go to today
reset(temporal);                     // Reset both picked and browsing to now
```

### Advanced Navigation

```typescript
// Could also add relative navigation
export function goToNextMonth(temporal: Temporal): void;
export function goToPreviousMonth(temporal: Temporal): void;
export function goToNextYear(temporal: Temporal): void;
export function goToPreviousYear(temporal: Temporal): void;

// Usage in calendar header
<button @click="() => goToNextMonth(temporal)">Next Month</button>
```

## Implementation

```typescript
// In src/utils/navigation.ts
export function goto(temporal: Temporal, date: Date | string): void {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  temporal.browsing.value = targetDate;
}

export function select(temporal: Temporal, date: Date | string): void {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  temporal.picked.value = targetDate;
}

export function today(temporal: Temporal): void {
  temporal.browsing.value = temporal.now.value;
}

export function reset(temporal: Temporal): void {
  temporal.browsing.value = temporal.now.value;
  temporal.picked.value = temporal.now.value;
}

export function goToNextMonth(temporal: Temporal): void {
  temporal.browsing.value = temporal.adapter.add(temporal.browsing.value, { months: 1 });
}
```

## Benefits

- Cleaner navigation code
- Consistent patterns across apps
- String date support for convenience
- Tree-shakable functions

## Drawbacks

- Another set of APIs to learn
- Simple wrappers over property access
- String parsing could fail

## Alternatives

1. Add methods to temporal object
2. Keep in userland
3. Create navigation object: `temporal.nav.goto()`

## Migration Path

No breaking changes. Pure additions that can be adopted gradually.