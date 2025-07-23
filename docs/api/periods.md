# periods

The `periods` object provides factory functions for creating all types of time units in useTemporal. It's available on every temporal instance and is the primary way to create time units.

## Overview

```javascript
temporal.periods.year(temporal)    // Create a year unit
temporal.periods.month(temporal)   // Create a month unit
temporal.periods.week(temporal)    // Create a week unit
temporal.periods.day(temporal)     // Create a day unit
temporal.periods.hour(temporal)    // Create an hour unit
temporal.periods.minute(temporal)  // Create a minute unit
temporal.periods.second(temporal)  // Create a second unit
temporal.periods.quarter(temporal) // Create a quarter unit
temporal.periods.stableMonth(temporal) // Create a stableMonth unit
```

## Common Parameters

All period factory functions accept the same parameters:

### `temporal` (required)

- **Type**: `TemporalCore`
- **Description**: The temporal instance created by `createTemporal()`

### `options` (optional)

- **Type**: `{ date?: Date }`
- **Description**: Configuration object with optional date parameter

#### `options.date`

- **Type**: `Date`
- **Default**: Current browsing date from temporal
- **Description**: Specific date to create the time unit for

```javascript
// Use current browsing date (default)
const currentMonth = temporal.periods.month(temporal);

// Use specific date
const marchMonth = temporal.periods.month(temporal, {
  date: new Date(2024, 2, 15) // March 15, 2024
});
```

## Period Functions

### year()

Creates a year time unit.

```javascript
const year = temporal.periods.year(temporal);

// Properties
console.log(year.number);  // 2024
console.log(year.isLeap);  // true/false
console.log(year.days);    // 365 or 366
console.log(year.weeks);   // 52 or 53

// Navigation
const nextYear = year.future();
const lastYear = year.past();
const fiveYearsAgo = year.past(5);
```

### month()

Creates a month time unit.

```javascript
const month = temporal.periods.month(temporal);

// Properties
console.log(month.number);    // 1-12 (not 0-11!)
console.log(month.name);      // "March"
console.log(month.shortName); // "Mar"
console.log(month.year);      // 2024
console.log(month.days);      // 28-31
console.log(month.weeks);     // 4-6

// Navigation
const nextMonth = month.future();
const lastMonth = month.past();
```

### week()

Creates a week time unit. Week boundaries respect the `weekStartsOn` configuration.

```javascript
const week = temporal.periods.week(temporal);

// Properties
console.log(week.number);  // 1-53 (ISO week number)
console.log(week.year);    // ISO week year
console.log(week.days);    // Always 7

// Navigation
const nextWeek = week.future();
const twoWeeksAgo = week.past(2);
```

### day()

Creates a day time unit.

```javascript
const day = temporal.periods.day(temporal);

// Properties
console.log(day.number);      // 1-31 (day of month)
console.log(day.dayOfWeek);   // 0-6 (0 = Sunday)
console.log(day.dayOfYear);   // 1-366
console.log(day.name);        // "Thursday"
console.log(day.shortName);   // "Thu"
console.log(day.isWeekend);   // true/false
console.log(day.isWeekday);   // true/false
console.log(day.month);       // 1-12
console.log(day.year);        // 2024

// Navigation
const tomorrow = day.future();
const yesterday = day.past();
const nextWeekSameDay = day.future(7);
```

### hour()

Creates an hour time unit.

```javascript
const hour = temporal.periods.hour(temporal);

// Properties
console.log(hour.number);   // 0-23 (24-hour format)
console.log(hour.hour12);   // 1-12 (12-hour format)
console.log(hour.isPM);     // true/false
console.log(hour.isAM);     // true/false
console.log(hour.minutes);  // Always 60

// Navigation
const nextHour = hour.future();
const threeHoursAgo = hour.past(3);
```

### minute()

Creates a minute time unit.

```javascript
const minute = temporal.periods.minute(temporal);

// Properties
console.log(minute.number);   // 0-59
console.log(minute.seconds);  // Always 60

// Navigation
const nextMinute = minute.future();
const fiveMinutesAgo = minute.past(5);
```

### second()

Creates a second time unit.

```javascript
const second = temporal.periods.second(temporal);

// Properties
console.log(second.number);        // 0-59
console.log(second.milliseconds);  // Always 1000

// Navigation
const nextSecond = second.future();
const tenSecondsAgo = second.past(10);
```

### quarter()

Creates a quarter time unit (3-month period).

```javascript
const quarter = temporal.periods.quarter(temporal);

// Properties
console.log(quarter.number);  // 1-4
console.log(quarter.months);  // Always 3
console.log(quarter.name);    // "Q1", "Q2", "Q3", "Q4"

// Navigation
const nextQuarter = quarter.future();
const lastQuarter = quarter.past();
```

### stableMonth()

Creates a special month unit that always contains exactly 42 days (6 complete weeks). Perfect for calendar grid displays.

```javascript
const stableMonth = temporal.periods.stableMonth(temporal);

// Properties (same as month, but with fixed dimensions)
console.log(stableMonth.days);   // Always 42
console.log(stableMonth.weeks);  // Always 6

// Division always returns consistent results
const days = temporal.divide(stableMonth, "day");
console.log(days.length); // Always 42

// Useful for calendar grids
const weeks = temporal.divide(stableMonth, "week");
console.log(weeks.length); // Always 6
```


## Examples

### Creating Time Units for Specific Dates

```javascript
// Create units for a specific date
const specificDate = new Date(2024, 11, 25); // Christmas 2024

const christmasYear = temporal.periods.year(temporal, { date: specificDate });
const christmasMonth = temporal.periods.month(temporal, { date: specificDate });
const christmasDay = temporal.periods.day(temporal, { date: specificDate });

console.log(christmasMonth.name); // "December"
console.log(christmasDay.name);   // "Wednesday"
console.log(christmasDay.number); // 25
```

### Building a Calendar View

```javascript
// Get current month
const currentMonth = temporal.periods.month(temporal);

// Get stable month for consistent grid
const stableMonth = temporal.periods.stableMonth(temporal);

// Divide into days for calendar grid
const calendarDays = temporal.divide(stableMonth, "day");

// Mark which days belong to current month
const calendarData = calendarDays.map(day => ({
  date: day.number,
  isCurrentMonth: day.month === currentMonth.number,
  isToday: day.isNow,
  isWeekend: day.isWeekend
}));
```

### Time Range Selection

```javascript
// Create a date range picker
function getDateRange(startDate, endDate) {
  const days = [];
  let current = startDate;
  
  while (current <= endDate) {
    const day = temporal.periods.day(temporal, { date: current });
    days.push(day);
    current = new Date(current);
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// Get all days in current week
const week = temporal.periods.week(temporal);
const weekDays = temporal.divide(week, "day");

// Get business days only
const businessDays = weekDays.filter(day => day.isWeekday);
```

### Reactive Time Display

```javascript
import { watch } from "@vue/reactivity";

// Create reactive time units
const currentHour = temporal.periods.hour(temporal);
const currentMinute = temporal.periods.minute(temporal);
const currentSecond = temporal.periods.second(temporal);

// Watch for changes
watch(() => currentHour.isNow, (isCurrentHour) => {
  if (!isCurrentHour) {
    console.log("Hour changed!");
    // Update hour display
  }
});

// Create a clock display
function getTimeDisplay() {
  return {
    hour: currentHour.hour12,
    minute: currentMinute.number.toString().padStart(2, '0'),
    second: currentSecond.number.toString().padStart(2, '0'),
    period: currentHour.isPM ? 'PM' : 'AM'
  };
}
```

### Working with Quarters

```javascript
// Get current quarter
const currentQuarter = temporal.periods.quarter(temporal);
console.log(`We are in ${currentQuarter.name}`); // "We are in Q1"

// Get all months in quarter
const quarterMonths = temporal.divide(currentQuarter, "month");
quarterMonths.forEach(month => {
  console.log(`${month.name}: ${month.days} days`);
});

// Calculate quarterly statistics
const quarterDays = temporal.divide(currentQuarter, "day");
const workDays = quarterDays.filter(day => day.isWeekday).length;
console.log(`Q${currentQuarter.number} has ${workDays} work days`);
```

## Navigation Patterns

All time units support navigation through `future()` and `past()` methods:

```javascript
// Single unit navigation
const today = temporal.periods.day(temporal);
const tomorrow = today.future();
const yesterday = today.past();

// Multiple unit navigation
const nextWeek = today.future(7);
const lastMonth = today.past(30);

// Chained navigation
const month = temporal.periods.month(temporal);
const quarterAgo = month.past(3);
const yearAgo = month.past(12);

// Navigate and get properties
const futureMonth = month.future(2);
console.log(`In 2 months it will be ${futureMonth.name}`);
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
import type { TimeUnit } from "@usetemporal/core";

// All period functions return TimeUnit
const year: TimeUnit = temporal.periods.year(temporal);
const month: TimeUnit = temporal.periods.month(temporal);

// With options
const specificDay = temporal.periods.day(temporal, {
  date: new Date(2024, 2, 14)
});

// Type-safe property access
const monthNumber: number = month.number;
const monthName: string = month.name;
const isCurrentMonth: boolean = month.isNow;
```

## Performance Tips

1. **Reuse Time Units**: Time units are reactive objects. Create them once and reuse them rather than recreating.

```javascript
// ❌ Inefficient
function updateDisplay() {
  const month = temporal.periods.month(temporal); // Creates new object
  displayMonth(month.name);
}

// ✅ Better
const month = temporal.periods.month(temporal); // Create once
function updateDisplay() {
  displayMonth(month.name); // Reuse reactive object
}
```

2. **Use StableMonth for Calendars**: When building calendar UIs, use `stableMonth` for consistent 42-day grids.

```javascript
// ❌ Complex calendar logic
const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day");
// Need to add padding days...

// ✅ Simple with stableMonth
const stableMonth = temporal.periods.stableMonth(temporal);
const days = temporal.divide(stableMonth, "day"); // Always 42 days
```

3. **Batch Operations**: When creating multiple time units, batch the operations.

```javascript
// Create all needed units at once
const now = new Date();
const units = {
  year: temporal.periods.year(temporal, { date: now }),
  month: temporal.periods.month(temporal, { date: now }),
  day: temporal.periods.day(temporal, { date: now }),
  hour: temporal.periods.hour(temporal, { date: now })
};
```

## See Also

- [createTemporal](/api/create-temporal) - Create a temporal instance
- [divide() Method](/api/divide) - Divide time units into smaller units
- [Time Unit Reference](/api/time-unit-reference) - All properties and methods
- [Reactive Time Units Guide](/guide/reactive-time-units) - Understanding reactivity
- [Getting Started](/guide/getting-started) - Basic usage examples
