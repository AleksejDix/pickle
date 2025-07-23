# divide()

The revolutionary `divide()` method is the heart of useTemporal's unique time management pattern. It allows you to split any time unit into smaller units with perfect synchronization and consistency.

## Syntax

```typescript
temporal.divide(interval: TimeUnit, unit: DivideUnit): TimeUnit[]
```

## Parameters

### `interval`

- **Type**: `TimeUnit`
- **Description**: The time unit to divide. Can be any time unit created by the periods object (year, month, week, day, hour, minute, second, quarter, or stableMonth).

```javascript
const month = temporal.periods.month(temporal);
const year = temporal.periods.year(temporal);
const week = temporal.periods.week(temporal);
```

### `unit`

- **Type**: `DivideUnit`
- **Values**: `"year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second"`
- **Description**: The type of units to divide into. Must be smaller than the interval unit.

## Return Value

Returns an array of `TimeUnit` objects representing the divisions of the interval. Each unit in the array:

- Has all standard time unit properties (start, end, isNow, etc.)
- Is reactive and updates automatically
- Can be further divided into smaller units

## Division Rules

### Valid Divisions

The following divisions are supported:

| From | To | Example Result |
|------|----|----||
| year | quarter | 4 quarters |
| year | month | 12 months |
| year | week | 52-53 weeks |
| year | day | 365-366 days |
| quarter | month | 3 months |
| quarter | week | ~13 weeks |
| quarter | day | ~90 days |
| month | week | 4-6 weeks |
| month | day | 28-31 days |
| week | day | 7 days |
| day | hour | 24 hours |
| hour | minute | 60 minutes |
| minute | second | 60 seconds |

### Special Case: StableMonth

The `stableMonth` unit has special division behavior:

```javascript
const stableMonth = temporal.periods.stableMonth(temporal);

// Always returns exactly 42 days (6 weeks)
const days = temporal.divide(stableMonth, "day");
console.log(days.length); // 42

// Always returns exactly 6 weeks
const weeks = temporal.divide(stableMonth, "week");
console.log(weeks.length); // 6
```

## Examples

### Basic Division

```javascript
// Divide a month into days
const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day");

days.forEach((day) => {
  console.log(`${day.number} - ${day.name}`);
});
// Output: "1 - Thursday", "2 - Friday", etc.
```

### Nested Division

```javascript
// Get all hours in a week
const week = temporal.periods.week(temporal);
const days = temporal.divide(week, "day");

const allHours = days.flatMap((day) => temporal.divide(day, "hour"));

console.log(allHours.length); // 168 (7 * 24)
```

### Calendar Grid Creation

```javascript
// Create a perfect 6-week calendar grid
const stableMonth = temporal.periods.stableMonth(temporal);
const calendarDays = temporal.divide(stableMonth, "day");

// Group into weeks for display
const weeks = [];
for (let i = 0; i < calendarDays.length; i += 7) {
  weeks.push(calendarDays.slice(i, i + 7));
}

// weeks is now a 6x7 grid perfect for calendar UI
```

### Business Days Calculation

```javascript
const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day");

const businessDays = days.filter((day) => day.isWeekday);
const weekends = days.filter((day) => day.isWeekend);

console.log(`Business days: ${businessDays.length}`);
console.log(`Weekend days: ${weekends.length}`);
```

### Time Slots Generation

```javascript
// Generate hourly appointment slots for a day
const day = temporal.periods.day(temporal);
const hours = temporal.divide(day, "hour");

const appointmentSlots = hours
  .filter((hour) => hour.number >= 9 && hour.number < 17) // 9 AM to 5 PM
  .map((hour) => ({
    time: hour.start,
    label: `${hour.hour12}:00 ${hour.isPM ? "PM" : "AM"}`,
    available: !isBooked(hour.start),
  }));
```

### Year Overview

```javascript
// Get all months in a year with their day counts
const year = temporal.periods.year(temporal);
const months = temporal.divide(year, "month");

const monthOverview = months.map((month) => ({
  name: month.name,
  days: month.days,
  weeks: temporal.divide(month, "week").length,
  firstDay: temporal.divide(month, "day")[0].name,
}));
```

## Reactive Updates

All divided units maintain reactivity:

```javascript
import { watch } from "@vue/reactivity";

const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day");

// Watch for the current day
watch(
  () => days.map((d) => d.isNow),
  (nowStates) => {
    const todayIndex = nowStates.findIndex((isNow) => isNow);
    if (todayIndex !== -1) {
      console.log(`Today is day ${todayIndex + 1} of the month`);
    }
  }
);
```

## Performance Considerations

### Efficient Division

```javascript
// ❌ Inefficient: Creating many small units at once
const year = temporal.periods.year(temporal);
const allMinutes = temporal.divide(year, "minute"); // 525,600 objects!

// ✅ Better: Divide progressively as needed
const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day");

// Then divide specific days only when needed
const todayHours = temporal.divide(days[14], "hour");
```

### Caching Results

```javascript
// Cache expensive divisions
const monthDaysCache = new Map();

function getMonthDays(monthKey) {
  if (!monthDaysCache.has(monthKey)) {
    const month = temporal.periods.month(temporal);
    monthDaysCache.set(monthKey, temporal.divide(month, "day"));
  }
  return monthDaysCache.get(monthKey);
}
```

### Using Generators for Large Sets

```javascript
// Generator for memory-efficient iteration
function* generateYearMinutes(year) {
  const months = temporal.divide(year, "month");

  for (const month of months) {
    const days = temporal.divide(month, "day");

    for (const day of days) {
      const hours = temporal.divide(day, "hour");

      for (const hour of hours) {
        const minutes = temporal.divide(hour, "minute");
        yield* minutes;
      }
    }
  }
}

// Use generator instead of creating all at once
const year = temporal.periods.year(temporal);
for (const minute of generateYearMinutes(year)) {
  if (shouldProcess(minute)) {
    processMinute(minute);
  }
}
```

## Error Handling

The divide method will throw errors for invalid operations:

```javascript
try {
  // Cannot divide by a larger unit
  const day = temporal.periods.day(temporal);
  const months = temporal.divide(day, "month"); // Error!
} catch (error) {
  console.error("Invalid division");
}

try {
  // Cannot divide by stableMonth
  const year = temporal.periods.year(temporal);
  const stableMonths = temporal.divide(year, "stableMonth"); // Error!
} catch (error) {
  console.error("Cannot divide by stableMonth");
}

try {
  // StableMonth can only be divided by day or week
  const stableMonth = temporal.periods.stableMonth(temporal);
  const hours = temporal.divide(stableMonth, "hour"); // Error!
} catch (error) {
  console.error("Invalid stableMonth division");
}
```

## TypeScript

Full type safety with TypeScript:

```typescript
import type { TimeUnit, DivideUnit } from "@usetemporal/core";

// Type-safe division
const month: TimeUnit = temporal.periods.month(temporal);
const days: TimeUnit[] = temporal.divide(month, "day");

// Type error: invalid unit
// const invalid = temporal.divide(month, "invalid"); // Type error

// Helper function with types
function getDaysInPeriod(period: TimeUnit): TimeUnit[] {
  return temporal.divide(period, "day");
}

// Generic division function
function divideAndFilter<T extends TimeUnit>(
  interval: T,
  unit: DivideUnit,
  predicate: (unit: TimeUnit) => boolean
): TimeUnit[] {
  return temporal.divide(interval, unit).filter(predicate);
}
```

## Common Patterns

### Calendar Display

```javascript
// Standard month calendar
const month = temporal.periods.month(temporal);
const monthDays = temporal.divide(month, "day");

// Full 6-week calendar grid
const stableMonth = temporal.periods.stableMonth(temporal);
const gridDays = temporal.divide(stableMonth, "day");

// Mark days from current month
const markedDays = gridDays.map((day) => ({
  ...day,
  isCurrentMonth: day.month === month.number,
}));
```

### Time Range Selection

```javascript
// Get time slots between two dates
function getTimeSlots(startDate, endDate, slotDuration = "hour") {
  const slots = [];
  let current = startDate;

  while (current < endDate) {
    const period = temporal.periods[slotDuration](temporal, { date: current });
    slots.push(period);
    current = period.end;
  }

  return slots;
}
```

### Statistical Analysis

```javascript
// Analyze time distribution
const year = temporal.periods.year(temporal);
const months = temporal.divide(year, "month");

const stats = months.map((month) => {
  const days = temporal.divide(month, "day");
  const weekdays = days.filter((d) => d.isWeekday);
  const weekends = days.filter((d) => d.isWeekend);

  return {
    month: month.name,
    totalDays: days.length,
    weekdays: weekdays.length,
    weekends: weekends.length,
    ratio: weekdays.length / weekends.length,
  };
});
```

## See Also

- [createTemporal](/api/create-temporal) - Create a temporal instance
- [periods Object](/api/periods) - Create time units to divide
- [Time Unit Reference](/api/time-unit-reference) - Properties of divided units
- [Performance Guide](/guide/performance) - Optimization strategies
- [Advanced Patterns](/guide/advanced-patterns) - Complex division examples
