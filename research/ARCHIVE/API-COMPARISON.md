# API Comparison: Before & After

## Quick Reference: What Changes

### 🎯 The Goal

Make the API feel natural while keeping the unique `divide()` pattern that sets useTemporal apart.

## Core Concepts Comparison

### Getting Current Time Units

#### Before (Technical but Clear)

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = periods.year(temporal);
const month = periods.month(temporal);
const day = periods.day(temporal);
```

#### After (Natural & Intuitive)

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = current("year", temporal);
const month = current("month", temporal);
const day = current("day", temporal);

// Or with destructuring
const { current } = temporal;
const today = current("day");
```

### Navigation ✅ IMPLEMENTED

#### Before

```typescript
year.future(); // Confusing: Next year? End of year?
year.past(); // Confusing: Previous year? Beginning?
```

#### After (Now Available!)

```typescript
// Clear navigation methods
year.next(); // Obviously go to next year
year.previous(); // Obviously go to previous year
year.go(2); // Skip 2 years forward
year.go(-3); // Go 3 years back

// Also available as tree-shakable functions
import { next, previous, go } from "@usetemporal/core";
next(year); // Same as year.next()
previous(year); // Same as year.previous()
go(year, 2); // Same as year.go(2)
```

> **Note**: The old `future()` and `past()` methods still work for backward compatibility.

### The Divide Pattern

#### Before (Powerful but Awkward)

```typescript
const months = temporal.divide(year, "month");
const days = temporal.divide(month, "day");
const hours = temporal.divide(day, "hour");
```

#### After (Natural & Flexible)

```typescript
// Method style
const months = year.divide("month");
const days = month.divide("day");

// Property style (for common cases)
const months = year.months;
const days = month.days;
const hours = day.hours;

// Function style (tree-shakable)
import { divide, months, days } from "@usetemporal/core";
const monthList = months(year);
const dayList = days(month);
```

### Comparisons

#### Before (Low-level)

```typescript
day.isNow.value; // Reactive ref
adapter.isSame(date1, date2, "day");
adapter.isBefore(date1, date2);
```

#### After (High-level)

```typescript
// Methods
day.isToday();
month.contains(date);
week.overlaps(otherWeek);
year.includes(month);

// Functions
import { isToday, contains, overlaps } from "@usetemporal/core";
isToday(day);
contains(month, date);
```

## Complete Examples

### Building a Calendar Month View

#### Before

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const month = periods.month(temporal);
const days = temporal.divide(month, "day");

days.forEach((day) => {
  if (day.isNow.value) {
    // Highlight today
  }
});

// Navigation
function nextMonth() {
  month.future();
}
```

#### After

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const month = current("month", temporal);
const days = month.days; // or month.divide('day')

days.forEach((day) => {
  if (day.isToday()) {
    // Highlight today
  }
});

// Navigation
function nextMonth() {
  month.next(); // or next(month)
}
```

### Year Overview with Quarters

#### Before

```typescript
const year = periods.year(temporal);
const quarters = temporal.divide(year, "quarter");
quarters.forEach((quarter) => {
  const months = temporal.divide(quarter, "month");
  // Process months
});
```

#### After

```typescript
const year = current("year", temporal);
const quarters = year.quarters; // or year.divide('quarter')
quarters.forEach((quarter) => {
  const months = quarter.months;
  // Process months
});
```

### Date Range Checking

#### Before

```typescript
const startDate = new Date("2024-01-15");
const endDate = new Date("2024-01-20");
const month = periods.month(temporal);

// Check if dates are in current month
const startInMonth = adapter.isSame(startDate, month.start.value, "month");
```

#### After

```typescript
const startDate = new Date("2024-01-15");
const endDate = new Date("2024-01-20");
const month = current("month", temporal);

// Check if dates are in current month
const startInMonth = month.contains(startDate);
const rangeInMonth = month.contains(startDate) && month.contains(endDate);
```

## Import Comparison

### Before (Monolithic)

```typescript
import { createTemporal, periods } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Everything comes through these objects
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = periods.year(temporal);
```

### After (Granular & Tree-shakable)

```typescript
// Option 1: Import what you need
import { createTemporal, current } from "@usetemporal/core";
import { next, previous } from "@usetemporal/core/navigation";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Option 2: Keep using the old way (backward compatible)
import { createTemporal, periods } from "@usetemporal/core";

// Option 3: convenience imports for common patterns
import { createTemporal, current, next, previous } from "usetemporal";
```

## Mental Model Shift

### Before: Technical Precision

- Think in terms of reactive refs (`.value`)
- Understand adapter pattern
- Know difference between `future()` and forward navigation
- Work with low-level date comparisons

### After: Natural Language

- "Get the current month"
- "Go to next month"
- "Get this month's days"
- "Check if date is in this month"

## Bundle Size Impact

```typescript
// Before: Always includes divide logic
import { createTemporal } from "@usetemporal/core"; // ~4KB

// After: Pay for what you use
import { createTemporal } from "@usetemporal/core"; // ~2KB
import { current } from "@usetemporal/core"; // +0.2KB
import { next, previous } from "@usetemporal/core"; // +0.3KB
import { divide } from "@usetemporal/core"; // +1KB

// Total: 3.5KB (vs 4KB) if using all features
// Total: 2.2KB if only using basic features
```

## Migration Path

```typescript
// Step 1: Everything still works
year.future(); // Works but shows deprecation warning

// Step 2: Use new methods
year.next(); // New preferred way

// Step 3: Remove deprecated methods in v4.0
```

## Summary

The new API achieves the "magic balance":

- **Technical users** get the same power with clearer names
- **Casual users** get intuitive methods that match their mental model
- **Everyone** benefits from better tree-shaking and clearer code

The unique `divide()` pattern remains the heart of the library, just with better ergonomics.
