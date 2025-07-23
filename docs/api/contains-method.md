# Contains Method

The `contains` method is available on all time units and allows you to check if a date or another time unit falls within the boundaries of the current time unit.

## Syntax

```typescript
timeUnit.contains(target: Date | TimeUnit): boolean
```

## Parameters

- `target` - The date or time unit to check. Can be either a JavaScript `Date` object or another `TimeUnit`.

## Returns

- `boolean` - Returns `true` if the target falls within the time unit's boundaries, `false` otherwise.

## Examples

### Basic Usage

```typescript
const year = periods.year(temporal);
const month = periods.month(temporal);
const day = periods.day(temporal);

// Check if year contains month
year.contains(month); // true (if month is in the same year)

// Check if month contains day
month.contains(day); // true (if day is in the same month)

// Check with Date objects
month.contains(new Date(2024, 5, 15)); // true/false depending on month
```

### Calendar Highlighting

```typescript
// Highlight days that belong to the current month
const month = periods.month(temporal);
const calendarDays = temporal.divide(stableMonth, "day");

calendarDays.forEach((day) => {
  if (month.contains(day)) {
    // Apply current month styling
  } else {
    // Apply other month styling (grayed out)
  }
});
```

### Event Filtering

```typescript
// Filter events by time period
function getEventsForPeriod(events: Event[], period: TimeUnit) {
  return events.filter((event) => period.contains(event.date));
}

// Get events for current month
const monthEvents = getEventsForPeriod(allEvents, currentMonth);

// Get events for current week
const weekEvents = getEventsForPeriod(allEvents, currentWeek);

// Get events for today
const todayEvents = getEventsForPeriod(allEvents, currentDay);
```

### Navigation Boundaries

```typescript
// Check if navigation is within valid range
const validYearRange = periods.year(temporal, { date: new Date(2024, 0, 1) });
const selectedMonth = periods.month(temporal, { date: userSelectedDate });

if (!validYearRange.contains(selectedMonth)) {
  // Disable navigation or show warning
  showMessage("Please select a date within 2024");
}
```

### Time Slot Validation

```typescript
// Check if selected time is within business hours
const businessDay = periods.day(temporal);
const selectedHour = periods.hour(temporal, { date: userSelectedTime });

if (businessDay.contains(selectedHour)) {
  // Time is within the business day
  processAppointment(selectedHour);
} else {
  showError("Please select a time within business hours");
}
```

## Special Cases

### StableMonth Contains

The `stableMonth` unit has special behavior - while it represents a 6-week grid (42 days), the `contains` method only returns `true` for dates that belong to the actual calendar month:

```typescript
const stableMonth = periods.stableMonth(temporal, {
  date: new Date(2024, 1, 1),
}); // February 2024

// StableMonth grid includes Jan 29 - Mar 10
stableMonth.contains(new Date(2024, 0, 31)); // false (January 31, even though it's in the grid)
stableMonth.contains(new Date(2024, 1, 15)); // true (February 15)
stableMonth.contains(new Date(2024, 2, 1)); // false (March 1, even though it's in the grid)
```

### Week Contains

Week boundaries depend on the `weekStartsOn` configuration:

```typescript
// With Monday start (weekStartsOn: 1)
const week = periods.week(temporal, {
  date: new Date(2024, 0, 10), // Wednesday
  weekStartsOn: 1,
});

// Week is Mon Jan 8 - Sun Jan 14
week.contains(new Date(2024, 0, 8)); // true (Monday)
week.contains(new Date(2024, 0, 14)); // true (Sunday)
week.contains(new Date(2024, 0, 15)); // false (Next Monday)
```

## Containment Hierarchy

The contains method respects the natural hierarchy of time units:

```typescript
// Valid containment relationships
year.contains(month)     ✓ // Year can contain months
year.contains(week)      ✓ // Year can contain weeks
year.contains(day)       ✓ // Year can contain days
year.contains(hour)      ✓ // Year can contain hours

month.contains(week)     ✓ // Month can contain (partial) weeks
month.contains(day)      ✓ // Month can contain days
month.contains(hour)     ✓ // Month can contain hours

week.contains(day)       ✓ // Week contains days
week.contains(hour)      ✓ // Week contains hours

day.contains(hour)       ✓ // Day contains hours
day.contains(minute)     ✓ // Day contains minutes

hour.contains(minute)    ✓ // Hour contains minutes
hour.contains(second)    ✓ // Hour contains seconds

// Illogical relationships (always return false)
day.contains(month)      ✗ // Day cannot contain month
hour.contains(day)       ✗ // Hour cannot contain day
```

## Performance

The `contains` method is optimized for performance:

- Uses simple timestamp comparisons for most units
- Special optimization for `stableMonth` to check month equality
- No complex date calculations on each call

## See Also

- [Time Units API](./time-units.md)
- [StableMonth Unit](./stable-month.md)
- [Calendar Grid Generation](./calendar-grid.md)
