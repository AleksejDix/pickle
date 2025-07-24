# Migration Guide: Object-Oriented to Functional API

## Overview

useTemporal v2 has been redesigned with a functional API inspired by Vue's Composition API. This provides better tree-shaking, clearer dependencies, and more flexible composition.

## Key Changes

### 1. Temporal is now a minimal state container

**Before:**

```typescript
const temporal = createTemporal({ dateAdapter });
temporal.divide(period, "month");
temporal.periods.year(temporal);
```

**After:**

```typescript
const temporal = createTemporal({ dateAdapter });
// temporal only contains: adapter, weekStartsOn, browsing, now
```

### 2. Period creation uses module exports

**Before:**

```typescript
import { periods } from "@usetemporal/core";
const year = periods.year(temporal, temporal);
```

**After:**

```typescript
import { useYear } from "@usetemporal/core";
const year = useYear(temporal); // Returns ComputedRef<Period>
// Access the value
console.log(year.value.number); // 2024
```

### 3. Operations are standalone functions

**Before:**

```typescript
const year = periods.year(temporal, temporal);
year.next(); // Mutates browsing
year.contains(month);
year.zoomIn("month");
```

**After:**

```typescript
import { useYear, next, contains, zoomIn } from "@usetemporal/core";

const year = useYear(temporal);
const nextYear = next(temporal, year.value); // Pure function, returns new Period
const hasMonth = contains(year.value, month.value);
const months = zoomIn(temporal, year.value, "month");
```

### 4. Navigation is pure functional

**Before (mutating):**

```typescript
month.next(); // Changes browsing ref
month.go(5);
```

**After (pure):**

```typescript
const nextMonth = next(temporal, month.value);
const futureMonth = go(temporal, month.value, 5);

// To update browsing:
temporal.browsing.value = nextMonth.value;
```

### 5. Period is now a plain data structure

**Before:**

```typescript
interface TimeUnit {
  number: ComputedRef<number>;
  start: ComputedRef<Date>;
  end: ComputedRef<Date>;
  next(): void;
  previous(): void;
  contains(target: Date | TimeUnit): boolean;
  // ... many methods
}
```

**After:**

```typescript
interface Period {
  start: Date;
  end: Date;
  type: PeriodType;
  value: Date;
  number: number;
}
// No methods - use functions instead
```

## Complete Example

### Creating a Calendar Year View

**Before:**

```typescript
const temporal = createTemporal({ dateAdapter });
const year = periods.year(temporal, temporal);
const months = temporal.divide(year, "month");

months.forEach((month) => {
  const weeks = temporal.divide(month, "week");
  weeks.forEach((week) => {
    const days = temporal.divide(week, "day");
    days.forEach((day) => {
      if (month.contains(day)) {
        // Render day
      }
    });
  });
});
```

**After:**

```typescript
import { createTemporal, useYear, divide, contains } from "@usetemporal/core";

const temporal = createTemporal({ dateAdapter });
const year = useYear(temporal);
const months = divide(temporal, year.value, "month");

months.forEach((month) => {
  const weeks = divide(temporal, month, "week");
  weeks.forEach((week) => {
    const days = divide(temporal, week, "day");
    days.forEach((day) => {
      if (contains(month, day)) {
        // Render day
      }
    });
  });
});
```

## Benefits

1. **Better Tree-shaking**: Import only what you use
2. **Clearer Dependencies**: Functions explicitly show what they need
3. **Pure Functions**: Easier to test and reason about
4. **Flexible Composition**: Combine functions however you need
5. **Type Safety**: TypeScript can better infer types with explicit functions

## Composition Patterns

```typescript
// Custom composable
function useCalendarGrid(temporal: Temporal) {
  const month = useMonth(temporal);

  const grid = computed(() => {
    const weeks = divide(temporal, month.value, "week");
    return weeks.map((week) => divide(temporal, week, "day"));
  });

  return { month, grid };
}

// Pipe operations
import { pipe } from "your-utils";
const futureMonths = pipe(
  year.value,
  (y) => next(temporal, y),
  (y) => next(temporal, y),
  (y) => divide(temporal, y, "month")
);
```
