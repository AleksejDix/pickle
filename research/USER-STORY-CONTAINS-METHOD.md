# User Story: Universal Contains Method for Time Units

## Story

**As a** developer using useTemporal  
**I want** a `contains` method on every time unit  
**So that** I can easily check if one time unit falls within another time unit

## Current Problem

Currently, only `stableMonth` has a `contains` method, but developers need to check containment relationships between all types of time units:

```typescript
// Current - only works for stableMonth
stableMonth.contains(day.raw.value); // true/false

// Needed but not available
year.contains(month); // Is this month in this year?
month.contains(day); // Is this day in this month?
week.contains(day); // Is this day in this week?
day.contains(hour); // Is this hour in this day?
hour.contains(minute); // Is this minute in this hour?

// Currently requires manual checks
const isInMonth =
  day.raw.value.getMonth() === month.raw.value.getMonth() &&
  day.raw.value.getFullYear() === month.raw.value.getFullYear();
```

## Real-World Use Cases

### 1. Calendar Highlighting

```typescript
// Highlight all days in the current month
days.forEach((day) => {
  if (currentMonth.contains(day)) {
    day.classList.add("current-month");
  }
});
```

### 2. Event Filtering

```typescript
// Show only events in the selected week
const weekEvents = events.filter((event) => selectedWeek.contains(event.date));
```

### 3. Time Range Validation

```typescript
// Check if selected time slot is within business hours
const businessDay = periods.day(temporal);
const selectedHour = periods.hour(temporal);

if (!businessDay.contains(selectedHour)) {
  showError("Please select a time within business hours");
}
```

### 4. Navigation Boundaries

```typescript
// Disable navigation if date is outside valid range
const validYear = periods.year(temporal, { date: new Date(2024, 0, 1) });
const canNavigate = validYear.contains(selectedMonth);
```

## Proposed Solution

Add `contains` method to all time units:

```typescript
interface TimeUnit {
  // ... existing properties

  /**
   * Check if this time unit contains another time unit or date
   * @param target - The time unit or date to check
   * @returns true if the target is within this time unit's boundaries
   */
  contains(target: TimeUnit | Date): boolean;
}
```

## Implementation Details

### Type-Safe Contains

The method should be type-safe and logical:

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

// Invalid relationships (should return false or TypeScript error)
day.contains(month)      ✗ // Day cannot contain month
hour.contains(day)       ✗ // Hour cannot contain day
```

### Implementation Example

```typescript
// In createPeriod.ts
function createPeriod(kind: TimeUnitKind, options: PeriodOptions) {
  // ... existing code

  const contains = (target: TimeUnit | Date): boolean => {
    const targetDate = target instanceof Date ? target : target.raw.value;
    const start = period.value.start;
    const end = period.value.end;

    // Check if target date falls within this period
    return (
      (adapter.isAfter(targetDate, start) &&
        adapter.isBefore(targetDate, end)) ||
      adapter.isSame(targetDate, start, kind) ||
      adapter.isSame(targetDate, end, kind)
    );
  };

  return {
    // ... existing properties
    contains,
  };
}
```

### Special Cases

#### 1. Week Contains

Weeks can contain partial weeks from adjacent months:

```typescript
// January 2024 starts on Monday
const januaryWeek1 = periods.week(temporal, { date: new Date(2024, 0, 1) });
const december31 = periods.day(temporal, { date: new Date(2023, 11, 31) });

januaryWeek1.contains(december31); // false - Dec 31 is Sunday, week starts Monday
```

#### 2. StableMonth Contains

StableMonth already has special behavior - it contains 42 days but only returns true for actual month days:

```typescript
const stableMonth = periods.stableMonth(temporal, {
  date: new Date(2024, 1, 1),
});
const jan31 = new Date(2024, 0, 31);
const feb1 = new Date(2024, 1, 1);

stableMonth.contains(jan31); // false - even though jan31 is in the grid
stableMonth.contains(feb1); // true - feb1 is in February
```

#### 3. Cross-Timezone Handling

Contains should respect the adapter's timezone handling:

```typescript
// Ensure timezone-aware comparison
const contains = (target: TimeUnit | Date): boolean => {
  const targetDate = target instanceof Date ? target : target.raw.value;

  // Use adapter's comparison methods which handle timezones
  return (
    !adapter.isBefore(targetDate, period.value.start) &&
    !adapter.isAfter(targetDate, period.value.end)
  );
};
```

## API Examples

### Basic Usage

```typescript
const year2024 = periods.year(temporal, { date: new Date(2024, 5, 15) });
const june2024 = periods.month(temporal, { date: new Date(2024, 5, 15) });
const randomDay = periods.day(temporal, { date: new Date(2024, 5, 20) });

year2024.contains(june2024); // true
june2024.contains(randomDay); // true
year2024.contains(randomDay); // true
```

### Calendar Component Usage

```typescript
function CalendarDay({ day, month, year }) {
  const classes = []

  if (month.contains(day)) {
    classes.push('current-month')
  } else {
    classes.push('other-month')
  }

  if (year.contains(day)) {
    classes.push('current-year')
  }

  return <div className={classes.join(' ')}>{day.number.value}</div>
}
```

### Event Filtering

```typescript
function getEventsForPeriod(events: Event[], period: TimeUnit) {
  return events.filter((event) => period.contains(event.date));
}

// Usage
const monthEvents = getEventsForPeriod(allEvents, currentMonth);
const weekEvents = getEventsForPeriod(allEvents, currentWeek);
const dayEvents = getEventsForPeriod(allEvents, currentDay);
```

## Acceptance Criteria

- [ ] All time units have a `contains` method
- [ ] Method accepts both TimeUnit and Date objects
- [ ] Contains respects period boundaries (inclusive)
- [ ] Works correctly across month/year boundaries
- [ ] Handles timezone considerations through adapter
- [ ] TypeScript types prevent illogical comparisons
- [ ] Performance optimized for frequent calls
- [ ] Comprehensive test coverage for edge cases
- [ ] Documentation includes examples for each unit type

## Testing Scenarios

```typescript
describe("contains method", () => {
  it("should check year contains month", () => {
    const year = periods.year(temporal, { date: new Date(2024, 0, 1) });
    const janMonth = periods.month(temporal, { date: new Date(2024, 0, 15) });
    const decMonth = periods.month(temporal, { date: new Date(2023, 11, 15) });

    expect(year.contains(janMonth)).toBe(true);
    expect(year.contains(decMonth)).toBe(false);
  });

  it("should check month contains day", () => {
    const month = periods.month(temporal, { date: new Date(2024, 1, 15) }); // February
    const feb15 = periods.day(temporal, { date: new Date(2024, 1, 15) });
    const mar1 = periods.day(temporal, { date: new Date(2024, 2, 1) });

    expect(month.contains(feb15)).toBe(true);
    expect(month.contains(mar1)).toBe(false);
  });

  it("should handle edge cases", () => {
    const day = periods.day(temporal, { date: new Date(2024, 0, 1) });
    const midnight = periods.hour(temporal, {
      date: new Date(2024, 0, 1, 0, 0),
    });
    const lastHour = periods.hour(temporal, {
      date: new Date(2024, 0, 1, 23, 0),
    });
    const nextDay = periods.hour(temporal, {
      date: new Date(2024, 0, 2, 0, 0),
    });

    expect(day.contains(midnight)).toBe(true);
    expect(day.contains(lastHour)).toBe(true);
    expect(day.contains(nextDay)).toBe(false);
  });
});
```

## Benefits

1. **Consistent API**: All time units work the same way
2. **Reduced Boilerplate**: No more manual date comparisons
3. **Type Safety**: TypeScript ensures valid comparisons
4. **Intuitive**: Matches mental model of time containment
5. **Performance**: Optimized implementation using adapter methods

## Implementation Priority

**HIGH** - This is a fundamental operation that improves many common use cases and should be implemented alongside the other high-priority improvements.

## Dependencies

- Requires adapter methods for date comparison
- Should be implemented in the base `createPeriod` function to work for all units
- No breaking changes required - purely additive
