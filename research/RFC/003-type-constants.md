# RFC-003: Type-Safe Unit Constants

## Summary

Export type-safe constants for time unit names to prevent runtime errors from typos.

## Motivation

String literals for time units are error-prone:

```typescript
// Current - typo causes runtime error
temporal.divide(year, "mnth"); // Runtime error!
temporal.divide(month, "week"); // Valid but may not make sense

// No autocomplete, no type checking
const unit: string = "day";
temporal.divide(month, unit); // No type safety
```

## Detailed Design

### API

```typescript
export const UNITS = {
  year: "year",
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
export type UnitValue = typeof UNITS[UnitKey];

// Usage
import { UNITS } from "@usetemporal/core";

temporal.divide(year, UNITS.month); // Type-safe, autocomplete
temporal.divide(month, UNITS.day);  // Type-safe
```

### Type Safety

```typescript
// This would now be a TypeScript error
temporal.divide(year, "mnth"); // Error: Argument of type '"mnth"' is not assignable

// Full type safety with variables
const unit: UnitValue = UNITS.day;
temporal.divide(month, unit); // ✓ Type-safe
```

## Implementation

```typescript
// In src/constants/units.ts
export const UNITS = {
  year: "year",
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
export type UnitValue = typeof UNITS[UnitKey];

// Re-export from main index
export { UNITS } from "./constants/units";
```

## Benefits

- Prevents runtime errors from typos
- Provides autocomplete in IDEs
- Makes code more maintainable
- Zero runtime overhead (just constants)
- Tree-shakable

## Drawbacks

- Slightly more verbose than strings
- Another import to remember
- May encourage over-use of divide

## Alternatives

1. Keep using string literals (status quo)
2. Use TypeScript enums (heavier runtime)
3. Use symbol constants (not serializable)

## Migration Path

No breaking changes. String literals continue to work. Can migrate gradually:

```typescript
// Both work during transition
temporal.divide(year, "month");      // Still works
temporal.divide(year, UNITS.month);  // New way
```