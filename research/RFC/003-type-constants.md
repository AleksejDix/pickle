# RFC-003: Type-Safe Unit Constants

## Summary

Export type-safe constants for period types to prevent typos and improve developer experience.

## Motivation

Current API uses string literals which are error-prone:

```typescript
// Current - string literals can have typos
divide(temporal, year, "mnth"); // Runtime error!
createPeriod(temporal, "motnh", someDate); // Runtime error!

// No autocomplete support
divide(temporal, year, "???"); // What are valid options?
```

## Detailed Design

### Type-Safe Period Constants

Export constants for all period types to ensure type safety and enable IDE autocomplete:

### API

```typescript
// Type-safe period type constants
export const PERIOD_TYPES = {
  year: "year",
  quarter: "quarter",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  stableMonth: "stableMonth",
  custom: "custom",
} as const;

export type PeriodTypeKey = keyof typeof PERIOD_TYPES;
export type PeriodTypeValue = (typeof PERIOD_TYPES)[PeriodTypeKey];

// Convenience individual exports
export const YEAR = "year" as const;
export const QUARTER = "quarter" as const;
export const MONTH = "month" as const;
export const WEEK = "week" as const;
export const DAY = "day" as const;
export const HOUR = "hour" as const;
export const MINUTE = "minute" as const;
export const SECOND = "second" as const;
export const STABLE_MONTH = "stableMonth" as const;
export const CUSTOM = "custom" as const;
```

### Usage Examples

```typescript
import { PERIOD_TYPES, MONTH, DAY } from "@usetemporal/core";

// Using the constants object
const months = divide(temporal, year, PERIOD_TYPES.month);
const days = divide(temporal, month, PERIOD_TYPES.day);

// Using individual constants
const monthPeriod = createPeriod(temporal, MONTH, somePeriod);
const dayPeriod = toPeriod(temporal, new Date(), DAY);

// IDE autocomplete works
const period = createPeriod(temporal, PERIOD_TYPES./* autocomplete shows all options */, date);

// Type checking prevents errors
divide(temporal, year, "mnth"); // TypeScript error!
createPeriod(temporal, "motnh", date); // TypeScript error!
```

### Integration with Existing Operations

All operations would accept both string literals and constants:

```typescript
// Both work, but constants are safer
divide(temporal, year, "month"); // Still valid
divide(temporal, year, PERIOD_TYPES.month); // Recommended

// Operations with constants
zoomIn(temporal, year, PERIOD_TYPES.month);
zoomOut(temporal, day, PERIOD_TYPES.month);
createPeriod(temporal, PERIOD_TYPES.week, existingPeriod);
isSame(temporal, periodA, periodB, PERIOD_TYPES.day);
```

## Implementation

```typescript
// types/period.ts
export const PERIOD_TYPES = {
  year: "year",
  quarter: "quarter",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  stableMonth: "stableMonth",
  custom: "custom",
} as const;

// Individual exports for convenience
export const YEAR = PERIOD_TYPES.year;
export const QUARTER = PERIOD_TYPES.quarter;
// ... etc

// Update PeriodType to use the constants
export type PeriodType = (typeof PERIOD_TYPES)[keyof typeof PERIOD_TYPES];
```

## Benefits

- **Type Safety**: Prevents runtime errors from typos
- **IDE Support**: Autocomplete shows all valid period types
- **Refactoring**: Renaming a constant updates all usages
- **Documentation**: Constants serve as API documentation
- **Tree-shakable**: Import only the constants you need

## Drawbacks

- More imports needed (but can use \* import)
- Some developers prefer string literals
- Slightly more verbose

## Alternatives

1. Keep string literals only (status quo)
2. Use TypeScript enum instead of const object
3. Use string union types without constants
4. Generate constants from TypeScript types

## Migration Path

No breaking changes. Pure addition to the API:

```typescript
// String literals still work
divide(temporal, year, "month"); // Valid

// Constants are recommended
divide(temporal, year, PERIOD_TYPES.month); // Better
divide(temporal, year, MONTH); // Also good

// Can adopt gradually
import { PERIOD_TYPES } from "@usetemporal/core";
```

## Notes on Current Implementation

**Update**: The zoom navigation functionality mentioned in the original RFC has already been implemented as `zoomIn()` and `zoomOut()` operations in the current codebase. This RFC now focuses solely on providing type-safe constants for period types.
