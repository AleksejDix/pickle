# Time Unit API Reference

This page provides a comprehensive reference for all methods and properties available on time unit objects in useTemporal.

## Common Properties

All time units (year, month, week, day, hour, minute, second) share these common properties:

### Core Properties

#### `start`

- **Type**: `Date`
- **Description**: The exact start moment of the time unit
- **Reactive**: Yes

```javascript
const month = temporal.periods.month(temporal);
console.log(month.start); // 2024-03-01T00:00:00.000Z
```

#### `end`

- **Type**: `Date`
- **Description**: The exact end moment of the time unit (inclusive)
- **Reactive**: Yes

```javascript
const month = temporal.periods.month(temporal);
console.log(month.end); // 2024-03-31T23:59:59.999Z
```

#### `period`

- **Type**: `{ value: { start: Date, end: Date } }`
- **Description**: Object containing both start and end dates
- **Reactive**: Yes

```javascript
const week = temporal.periods.week(temporal);
console.log(week.period.value);
// { start: Date, end: Date }
```

### Comparison Properties

#### `isNow`

- **Type**: `boolean`
- **Description**: Whether this time unit contains the current moment
- **Reactive**: Yes (updates automatically)

```javascript
const day = temporal.periods.day(temporal);
if (day.isNow) {
  console.log("This is today!");
}
```

#### `isPast`

- **Type**: `boolean`
- **Description**: Whether this time unit is entirely in the past
- **Reactive**: Yes

```javascript
const month = temporal.periods.month(temporal);
if (month.isPast) {
  console.log("This month has already ended");
}
```

#### `isFuture`

- **Type**: `boolean`
- **Description**: Whether this time unit is entirely in the future
- **Reactive**: Yes

```javascript
const year = temporal.periods.year(temporal);
const nextYear = year.future();
console.log(nextYear.isFuture); // true
```

### Navigation Methods

#### `future(offset?: number)`

- **Parameters**:
  - `offset` (optional): Number of units to move forward (default: 1)
- **Returns**: New time unit instance
- **Description**: Creates a new time unit in the future

```javascript
const month = temporal.periods.month(temporal);
const nextMonth = month.future(); // Next month
const threeMonthsLater = month.future(3); // 3 months from now
```

#### `past(offset?: number)`

- **Parameters**:
  - `offset` (optional): Number of units to move backward (default: 1)
- **Returns**: New time unit instance
- **Description**: Creates a new time unit in the past

```javascript
const week = temporal.periods.week(temporal);
const lastWeek = week.past(); // Previous week
const fourWeeksAgo = week.past(4); // 4 weeks ago
```

## Unit-Specific Properties

### Year Unit

#### `number`

- **Type**: `number`
- **Description**: The full year number (e.g., 2024)
- **Range**: Any valid year

```javascript
const year = temporal.periods.year(temporal);
console.log(year.number); // 2024
```

#### `isLeap`

- **Type**: `boolean`
- **Description**: Whether this is a leap year

```javascript
const year2024 = temporal.periods.year(temporal, {
  date: new Date(2024, 0, 1),
});
console.log(year2024.isLeap); // true
```

#### `days`

- **Type**: `number`
- **Description**: Total number of days in the year (365 or 366)

```javascript
const year = temporal.periods.year(temporal);
console.log(year.days); // 366 (for leap year)
```

#### `weeks`

- **Type**: `number`
- **Description**: Number of ISO weeks in the year (52 or 53)

```javascript
const year = temporal.periods.year(temporal);
console.log(year.weeks); // 52
```

### Month Unit

#### `number`

- **Type**: `number`
- **Description**: Month number (1-12, where 1 = January)
- **Range**: 1-12

```javascript
const month = temporal.periods.month(temporal);
console.log(month.number); // 3 (March)
```

#### `name`

- **Type**: `string`
- **Description**: Full month name in the configured locale

```javascript
const month = temporal.periods.month(temporal);
console.log(month.name); // "March"
```

#### `shortName`

- **Type**: `string`
- **Description**: Abbreviated month name (3 letters)

```javascript
const month = temporal.periods.month(temporal);
console.log(month.shortName); // "Mar"
```

#### `year`

- **Type**: `number`
- **Description**: The year this month belongs to

```javascript
const month = temporal.periods.month(temporal);
console.log(month.year); // 2024
```

#### `days`

- **Type**: `number`
- **Description**: Number of days in the month (28-31)

```javascript
const february = temporal.periods.month(temporal, {
  date: new Date(2024, 1, 1),
});
console.log(february.days); // 29 (leap year)
```

#### `weeks`

- **Type**: `number`
- **Description**: Number of weeks that overlap with this month

```javascript
const month = temporal.periods.month(temporal);
console.log(month.weeks); // 5
```

### Week Unit

#### `number`

- **Type**: `number`
- **Description**: ISO week number within the year
- **Range**: 1-53

```javascript
const week = temporal.periods.week(temporal);
console.log(week.number); // 11
```

#### `year`

- **Type**: `number`
- **Description**: The ISO week-year (may differ from calendar year)

```javascript
// January 1, 2024 might be in week 52 of 2023
const week = temporal.periods.week(temporal, {
  date: new Date(2024, 0, 1),
});
console.log(week.year); // Could be 2023 or 2024
```

#### `days`

- **Type**: `number`
- **Description**: Always 7 for a complete week

```javascript
const week = temporal.periods.week(temporal);
console.log(week.days); // 7
```

### Day Unit

#### `number`

- **Type**: `number`
- **Description**: Day of the month
- **Range**: 1-31

```javascript
const day = temporal.periods.day(temporal);
console.log(day.number); // 14
```

#### `dayOfWeek`

- **Type**: `number`
- **Description**: Day of week (0 = Sunday, 6 = Saturday)
- **Range**: 0-6

```javascript
const day = temporal.periods.day(temporal);
console.log(day.dayOfWeek); // 4 (Thursday)
```

#### `dayOfYear`

- **Type**: `number`
- **Description**: Day number within the year
- **Range**: 1-366

```javascript
const day = temporal.periods.day(temporal);
console.log(day.dayOfYear); // 74 (March 14)
```

#### `name`

- **Type**: `string`
- **Description**: Full weekday name

```javascript
const day = temporal.periods.day(temporal);
console.log(day.name); // "Thursday"
```

#### `shortName`

- **Type**: `string`
- **Description**: Abbreviated weekday name (3 letters)

```javascript
const day = temporal.periods.day(temporal);
console.log(day.shortName); // "Thu"
```

#### `isWeekend`

- **Type**: `boolean`
- **Description**: Whether this day is Saturday or Sunday

```javascript
const day = temporal.periods.day(temporal);
console.log(day.isWeekend); // false (for Thursday)
```

#### `isWeekday`

- **Type**: `boolean`
- **Description**: Whether this day is Monday through Friday

```javascript
const day = temporal.periods.day(temporal);
console.log(day.isWeekday); // true (for Thursday)
```

#### `month`

- **Type**: `number`
- **Description**: Month number this day belongs to (1-12)

```javascript
const day = temporal.periods.day(temporal);
console.log(day.month); // 3 (March)
```

#### `year`

- **Type**: `number`
- **Description**: Year this day belongs to

```javascript
const day = temporal.periods.day(temporal);
console.log(day.year); // 2024
```

### Hour Unit

#### `number`

- **Type**: `number`
- **Description**: Hour of the day (24-hour format)
- **Range**: 0-23

```javascript
const hour = temporal.periods.hour(temporal);
console.log(hour.number); // 14 (2 PM)
```

#### `hour12`

- **Type**: `number`
- **Description**: Hour in 12-hour format
- **Range**: 1-12

```javascript
const hour = temporal.periods.hour(temporal);
console.log(hour.hour12); // 2 (for 14:00)
```

#### `isPM`

- **Type**: `boolean`
- **Description**: Whether this hour is in PM (noon or later)

```javascript
const hour = temporal.periods.hour(temporal);
console.log(hour.isPM); // true (for 14:00)
```

#### `isAM`

- **Type**: `boolean`
- **Description**: Whether this hour is in AM (before noon)

```javascript
const hour = temporal.periods.hour(temporal);
console.log(hour.isAM); // false (for 14:00)
```

#### `minutes`

- **Type**: `number`
- **Description**: Always 60

```javascript
const hour = temporal.periods.hour(temporal);
console.log(hour.minutes); // 60
```

### Minute Unit

#### `number`

- **Type**: `number`
- **Description**: Minute within the hour
- **Range**: 0-59

```javascript
const minute = temporal.periods.minute(temporal);
console.log(minute.number); // 30
```

#### `seconds`

- **Type**: `number`
- **Description**: Always 60

```javascript
const minute = temporal.periods.minute(temporal);
console.log(minute.seconds); // 60
```

### Second Unit

#### `number`

- **Type**: `number`
- **Description**: Second within the minute
- **Range**: 0-59

```javascript
const second = temporal.periods.second(temporal);
console.log(second.number); // 45
```

#### `milliseconds`

- **Type**: `number`
- **Description**: Always 1000

```javascript
const second = temporal.periods.second(temporal);
console.log(second.milliseconds); // 1000
```

## Special Units

### Quarter Unit

#### `number`

- **Type**: `number`
- **Description**: Quarter of the year
- **Range**: 1-4

```javascript
const quarter = temporal.periods.quarter(temporal);
console.log(quarter.number); // 1 (Q1: Jan-Mar)
```

#### `months`

- **Type**: `number`
- **Description**: Always 3

```javascript
const quarter = temporal.periods.quarter(temporal);
console.log(quarter.months); // 3
```

#### `name`

- **Type**: `string`
- **Description**: Quarter designation

```javascript
const quarter = temporal.periods.quarter(temporal);
console.log(quarter.name); // "Q1"
```

### StableMonth Unit

The stableMonth is a special unit that always contains exactly 42 days (6 weeks), useful for calendar UI components.

#### All Standard Month Properties

StableMonth has all the same properties as a regular month unit.

#### `days`

- **Type**: `number`
- **Description**: Always 42 (6 complete weeks)

```javascript
const stableMonth = temporal.periods.stableMonth(temporal);
console.log(stableMonth.days); // Always 42
```

#### `weeks`

- **Type**: `number`
- **Description**: Always 6

```javascript
const stableMonth = temporal.periods.stableMonth(temporal);
console.log(stableMonth.weeks); // Always 6
```

## Usage Examples

### Chaining Navigation

```javascript
const today = temporal.periods.day(temporal);
const nextWeekSameDay = today.future(7);
const lastMonthSameDay = today.past(30);
```

### Reactive Updates

```javascript
import { watch } from "@vue/reactivity";

const hour = temporal.periods.hour(temporal);

// Watch for when the hour changes
watch(
  () => hour.isNow,
  (isCurrentHour) => {
    if (!isCurrentHour) {
      console.log("The hour has changed!");
    }
  }
);
```

### Combining Properties

```javascript
const day = temporal.periods.day(temporal);

// Create a display string
const displayString = `${day.name}, ${day.month}/${day.number}/${day.year}`;
// "Thursday, 3/14/2024"

// Check if it's a working day
const isWorkingDay = day.isWeekday && !isHoliday(day.start);
```

## Type Definitions

All time units implement the `TimeUnit` interface:

```typescript
interface TimeUnit {
  // Core properties
  readonly start: Date;
  readonly end: Date;
  readonly period: Ref<Period>;

  // Comparison properties
  readonly isNow: boolean;
  readonly isPast: boolean;
  readonly isFuture: boolean;

  // Navigation methods
  future(offset?: number): TimeUnit;
  past(offset?: number): TimeUnit;

  // Unit-specific properties
  readonly number: number;
  [key: string]: any;
}
```
