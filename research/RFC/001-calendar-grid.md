# RFC-001: Calendar Grid Generation

## Summary

Add a `createCalendarGrid()` method to generate calendar grids with all necessary metadata, eliminating repetitive complex logic in calendar components.

## Motivation

Every calendar component in the examples repeats the same ~20 lines of complex logic:

```typescript
// Current repetitive pattern
const weeks = temporal.divide(stableMonth, "week");
return weeks.map((week) => {
  const days = temporal.divide(week, "day");
  return days.map((day) => ({
    day,
    isCurrentMonth: stableMonth.contains(day.raw.value),
    isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
    isToday: temporal.adapter.isSame(day.raw.value, currentDate.value, "day"),
  }));
});
```

## Detailed Design

### API

```typescript
interface CalendarDay extends TimeUnit {
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

interface CalendarGrid {
  weeks: CalendarWeek[];
  month: TimeUnit;
  stableMonth: TimeUnit;
}

// Add to temporal
temporal.createCalendarGrid(month: TimeUnit): CalendarGrid
```

### Usage

```typescript
// Before: 20+ lines
// After: 1 line
const grid = temporal.createCalendarGrid(month);

// Access structured data
grid.weeks.forEach(week => {
  week.days.forEach(day => {
    if (day.isCurrentMonth && !day.isWeekend) {
      // Business day in current month
    }
  });
});
```

## Implementation

```typescript
function createCalendarGrid(month: TimeUnit): CalendarGrid {
  const stableMonth = periods.stableMonth({
    now: this.now,
    browsing: month.browsing,
    adapter: this.adapter,
    weekStartsOn: this.weekStartsOn,
  });

  const weeks = this.divide(stableMonth, "week");
  const today = this.adapter.startOf(this.now.value, "day");

  const calendarWeeks = weeks.map((week, weekIndex) => {
    const days = this.divide(week, "day");

    const calendarDays = days.map((day) => {
      const dayDate = day.raw.value;
      const dayOfWeek = dayDate.getDay();

      return {
        ...day,
        isCurrentMonth: stableMonth.contains(dayDate),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: this.adapter.isSame(dayDate, today, "day"),
        isPast: this.adapter.isBefore(dayDate, today),
        isFuture: this.adapter.isAfter(dayDate, today),
      } as CalendarDay;
    });

    return {
      days: calendarDays,
      weekNumber: weekIndex + 1,
    };
  });

  return {
    weeks: calendarWeeks,
    month,
    stableMonth,
  };
}
```

## Benefits

- Reduces calendar component code by ~40%
- Provides consistent calendar structure
- Includes all commonly needed metadata
- Works seamlessly with stableMonth
- Type-safe with full TypeScript support

## Drawbacks

- Adds ~1KB to bundle size
- Opinionated about what metadata to include
- May calculate unused properties for some use cases

## Alternatives

1. Keep logic in userland (current approach)
2. Provide a calendar composable for Vue only
3. Create a separate calendar package

## Migration Path

No breaking changes. This is a new addition that doesn't affect existing code.