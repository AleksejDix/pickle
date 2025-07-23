# API Improvements Based on Usage Analysis

After analyzing how developers use useTemporal in the examples, I've identified key improvements that would significantly enhance the developer experience.

## 1. Formatted Output Properties

**Problem**: Developers repeatedly format dates manually across components

```typescript
// Current repetitive pattern:
month.raw.value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
day.raw.value.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
```

**Solution**: Add formatted properties to time units

```typescript
interface TimeUnit {
  // ... existing properties
  formatted: {
    long: string; // "January 2024" for month, "Monday, January 15, 2024" for day
    short: string; // "Jan 2024" for month, "Mon, Jan 15" for day
    narrow: string; // "J" for month, "M" for day
    numeric: string; // "01/2024" for month, "15" for day
  };
}

// Usage:
month.formatted.long; // "January 2024"
day.formatted.full; // "Monday, January 15, 2024"
hour.formatted.time; // "2:30 PM"
```

## 2. Calendar Grid Generation

**Problem**: Complex, repetitive logic for generating calendar grids

```typescript
// Current pattern repeated across components:
const weeks = temporal.divide(stableMonth, "week");
weeks.map((week) => {
  const days = temporal.divide(week, "day");
  return days.map((day) => ({
    day,
    isCurrentMonth: stableMonth.contains!(day.raw.value),
    isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
  }));
});
```

**Solution**: Built-in grid generation utility

```typescript
// Proposed API:
const grid = temporal.createCalendarGrid(month, {
  includeWeekends: true,
  startOfWeek: 1, // Monday
});

// Returns:
interface CalendarGrid {
  weeks: Week[];
  metadata: {
    totalDays: number;
    firstDayOfMonth: TimeUnit;
    lastDayOfMonth: TimeUnit;
    previousMonthDays: TimeUnit[];
    nextMonthDays: TimeUnit[];
  };
}

interface Week {
  days: CalendarDay[];
  weekNumber: number;
}

interface CalendarDay extends TimeUnit {
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isHoliday?: boolean;
}
```

## 3. Relative Time Utilities

**Problem**: Manual implementation of relative time descriptions

```typescript
// Current workaround in DayView:
const diffDays = Math.round(
  (selectedDay.start.value.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
);
if (diffDays === 0) return "Today";
if (diffDays === 1) return "Tomorrow";
if (diffDays === -1) return "Yesterday";
```

**Solution**: Built-in relative time properties

```typescript
interface TimeUnit {
  // ... existing properties
  relative: {
    description: string; // "Today", "Tomorrow", "Next Monday", "Last week"
    fromNow: string; // "in 2 days", "3 hours ago"
    calendar: string; // "Today at 2:30 PM", "Tomorrow", "Monday at 3:00 PM"
  };
}

// Usage:
day.relative.description; // "Today"
hour.relative.fromNow; // "in 2 hours"
week.relative.calendar; // "Next week"
```

## 4. Simplified StableMonth Creation

**Problem**: Verbose stableMonth creation requiring multiple properties

```typescript
// Current verbose pattern:
const stableMonth = computed(() =>
  periods.stableMonth({
    now: props.temporal.now,
    browsing: month.browsing,
    adapter: props.temporal.adapter,
    weekStartsOn: props.temporal.weekStartsOn,
  })
);
```

**Solution**: Simplified API

```typescript
// Proposed:
const stableMonth = temporal.stableMonth(month);
// or
const stableMonth = month.toStableMonth();
```

## 5. Time Range Support

**Problem**: No built-in support for date ranges (needed for calendars, date pickers)

```typescript
// Currently developers manually handle ranges
```

**Solution**: First-class range support

```typescript
// Proposed API:
const range = temporal.createRange(startDate, endDate);

interface TimeRange {
  start: TimeUnit;
  end: TimeUnit;
  duration: {
    days: number;
    hours: number;
    minutes: number;
    formatted: string; // "3 days, 2 hours"
  };
  contains(date: Date | TimeUnit): boolean;
  overlaps(other: TimeRange): boolean;
  intersect(other: TimeRange): TimeRange | null;
  union(other: TimeRange): TimeRange;
  split(unit: "day" | "week" | "month"): TimeUnit[];
}

// Usage:
const vacation = temporal.createRange(startDate, endDate);
vacation.duration.days; // 14
vacation.contains(someDate); // true/false
vacation.formatted; // "July 15 - July 29, 2024"
```

## 6. Utility Functions

**Problem**: Common operations require manual implementation

```typescript
// Current manual implementations:
isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6;
isToday: temporal.adapter.isSame(day.raw.value, now.value, "day");
```

**Solution**: Built-in utility functions

```typescript
// Proposed utilities:
temporal.utils = {
  // Date checks
  isWeekend(date: Date | TimeUnit): boolean
  isWeekday(date: Date | TimeUnit): boolean
  isToday(date: Date | TimeUnit): boolean
  isTomorrow(date: Date | TimeUnit): boolean
  isYesterday(date: Date | TimeUnit): boolean
  isPast(date: Date | TimeUnit): boolean
  isFuture(date: Date | TimeUnit): boolean

  // Comparisons
  isBefore(date1: Date | TimeUnit, date2: Date | TimeUnit): boolean
  isAfter(date1: Date | TimeUnit, date2: Date | TimeUnit): boolean
  isBetween(date: Date | TimeUnit, start: Date | TimeUnit, end: Date | TimeUnit): boolean

  // Differences
  diff(date1: Date | TimeUnit, date2: Date | TimeUnit, unit: TimeUnitKind): number

  // Formatting helpers
  formatHour(hour: number, format: '12h' | '24h'): string
  formatDuration(minutes: number): string  // "2h 30m"

  // Calendar helpers
  getDaysInMonth(month: TimeUnit): number
  getWeekNumber(date: Date | TimeUnit): number
  getQuarter(date: Date | TimeUnit): number
}
```

## 7. Navigation Improvements

**Problem**: Repetitive switch statements for navigation

```typescript
// Current pattern:
function navigatePrevious() {
  switch (currentView.value) {
    case "year":
      currentYear.previous();
      break;
    case "month":
      currentMonth.previous();
      break;
    case "week":
      currentWeek.previous();
      break;
    case "day":
      currentDay.previous();
      break;
  }
}
```

**Solution**: Unified navigation API

```typescript
// Proposed:
temporal.navigate(unit: TimeUnitKind, direction: 'next' | 'previous' | 'today')
temporal.goToDate(date: Date)
temporal.goToToday()

// Also add to time units:
month.goToToday()
year.goTo(2025)
```

## 8. Direct Property Access

**Problem**: Frequent `.raw.value` access for common operations

```typescript
// Current:
day.raw.value.getDay();
month.raw.value.getMonth();
```

**Solution**: Direct properties on time units

```typescript
interface TimeUnit {
  // ... existing properties

  // Direct accessors (for day unit)
  weekday: number; // 0-6
  weekdayName: string; // "Monday"
  date: number; // 1-31

  // Direct accessors (for month unit)
  month: number; // 0-11
  monthName: string; // "January"
  daysInMonth: number; // 28-31

  // Direct accessors (for year unit)
  year: number; // 2024
  isLeapYear: boolean;
}
```

## 9. Event/Holiday Support

**Problem**: No built-in support for marking special dates

```typescript
// Developers need to manually track holidays/events
```

**Solution**: Event marking system

```typescript
// Proposed:
const holidays = temporal.createEventMarker();
holidays.mark("2024-12-25", { name: "Christmas", type: "holiday" });
holidays.mark("2024-07-04", { name: "Independence Day", type: "holiday" });

// Check in time units:
day.isMarked; // true/false
day.markers; // [{ name: 'Christmas', type: 'holiday' }]
```

## 10. Vue-Specific Composables Package

Since Vue is heavily used, create `@usetemporal/vue`:

```typescript
// Proposed Vue composables:
import {
  useCalendarGrid,
  useRelativeTime,
  useTimePosition,
} from "@usetemporal/vue";

// Auto-updating calendar grid
const { grid, currentMonth, navigate } = useCalendarGrid(temporal);

// Auto-updating relative time
const { relative } = useRelativeTime(temporal, selectedDate);

// For time indicators in calendars
const { position, percentage } = useTimePosition(temporal);
```

## Implementation Priority

1. **High Priority** (Most impact, addresses common pain points)
   - Formatted output properties
   - Calendar grid generation
   - Simplified stableMonth API
   - Basic utility functions (isWeekend, isToday, etc.)

2. **Medium Priority** (Useful but not critical)
   - Relative time utilities
   - Time range support
   - Navigation improvements
   - Direct property access

3. **Low Priority** (Nice to have)
   - Event/holiday support
   - Vue-specific package
   - Advanced utilities

## Breaking Changes

Most improvements can be added without breaking changes:

- New properties on existing interfaces
- New methods on temporal object
- New utility namespace

The only potential breaking change would be simplifying stableMonth creation, but we can support both APIs during a transition period.

## Conclusion

These improvements would:

1. Reduce boilerplate code by 50-70%
2. Make common operations intuitive
3. Provide better TypeScript support
4. Make the library more competitive with alternatives
5. Improve developer experience significantly

The improvements are based on real usage patterns and address actual pain points developers face when building calendar and date-picker components.
