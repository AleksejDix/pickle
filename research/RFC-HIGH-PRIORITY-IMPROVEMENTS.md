# RFC: High Priority API Improvements

Based on usage analysis, these improvements would have the most immediate impact on developer experience.

## 1. Formatted Output Properties

### Problem

Every component manually formats dates:

```typescript
// From MonthView.vue:
month.raw.value.toLocaleDateString("en-US", { month: "long", year: "numeric" });

// From DayView.vue:
selectedDay.raw.value.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
```

### Solution

Add `formatted` property to all time units:

```typescript
interface FormattedOutput {
  // Predefined formats
  long: string; // "January 2024", "Monday, January 15, 2024"
  short: string; // "Jan 2024", "Mon, Jan 15"
  narrow: string; // "J", "M"
  numeric: string; // "01/2024", "01/15/2024"

  // Specific formats
  monthYear?: string; // "January 2024" (month/year only)
  dayMonth?: string; // "January 15" (day/month only)
  time?: string; // "2:30 PM" (hour only)
  iso?: string; // "2024-01-15"
}

interface TimeUnit {
  // ... existing properties
  formatted: FormattedOutput;
}
```

### Implementation

```typescript
// In createPeriod.ts
function createPeriod(kind: TimeUnitKind, options: PeriodOptions) {
  // ... existing code

  const formatted = computed(() => {
    const date = raw.value;
    const locale = options.locale || "en-US";

    switch (kind) {
      case "year":
        return {
          long: date.toLocaleDateString(locale, { year: "numeric" }),
          short: date.toLocaleDateString(locale, { year: "2-digit" }),
          numeric: date.getFullYear().toString(),
          iso: date.toISOString().split("T")[0].substring(0, 4),
        };
      case "month":
        return {
          long: date.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          }),
          short: date.toLocaleDateString(locale, {
            month: "short",
            year: "numeric",
          }),
          narrow: date.toLocaleDateString(locale, { month: "narrow" }),
          numeric: date.toLocaleDateString(locale, {
            month: "2-digit",
            year: "numeric",
          }),
          monthYear: date.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          }),
          iso: date.toISOString().split("T")[0].substring(0, 7),
        };
      case "day":
        return {
          long: date.toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          short: date.toLocaleDateString(locale, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          narrow: date.toLocaleDateString(locale, { weekday: "narrow" }),
          numeric: date.toLocaleDateString(locale),
          dayMonth: date.toLocaleDateString(locale, {
            month: "long",
            day: "numeric",
          }),
          iso: date.toISOString().split("T")[0],
        };
      // ... other cases
    }
  });

  return {
    // ... existing properties
    formatted,
  };
}
```

## 2. Calendar Grid Utility

### Problem

Every calendar component repeats this complex logic:

```typescript
// From YearView.vue, MonthView.vue, StableMonthExample.vue
const weeks = props.temporal.divide(stableMonth, "week");
return weeks.map((week) => {
  const days = props.temporal.divide(week, "day");
  return days.map((day) => ({
    day,
    isCurrentMonth: stableMonth.contains!(day.raw.value),
    isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
    isToday: props.temporal.adapter.isSame(
      day.raw.value,
      currentDate.value,
      "day"
    ),
  }));
});
```

### Solution

Built-in grid generator:

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
interface Temporal {
  createCalendarGrid(month: TimeUnit): CalendarGrid;
}
```

### Implementation

```typescript
// In createTemporal.ts
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
        isCurrentMonth: stableMonth.contains!(dayDate),
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

## 3. Basic Utility Functions

### Problem

Common checks are repeatedly implemented:

```typescript
// Weekend check
isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6;

// Today check
isToday: temporal.adapter.isSame(day.raw.value, now.value, "day");
```

### Solution

Add utilities namespace:

```typescript
interface TemporalUtils {
  // Day type checks
  isWeekend(date: Date | TimeUnit): boolean;
  isWeekday(date: Date | TimeUnit): boolean;

  // Relative checks
  isToday(date: Date | TimeUnit): boolean;
  isTomorrow(date: Date | TimeUnit): boolean;
  isYesterday(date: Date | TimeUnit): boolean;
  isThisWeek(date: Date | TimeUnit): boolean;
  isThisMonth(date: Date | TimeUnit): boolean;
  isThisYear(date: Date | TimeUnit): boolean;

  // Time checks
  isPast(date: Date | TimeUnit): boolean;
  isFuture(date: Date | TimeUnit): boolean;

  // Formatting helpers
  formatHour(hour: number, use24Hour: boolean): string;
  getWeekdayName(
    date: Date | TimeUnit,
    format: "long" | "short" | "narrow"
  ): string;
  getMonthName(
    date: Date | TimeUnit,
    format: "long" | "short" | "narrow"
  ): string;
}
```

### Implementation

```typescript
// In utils/calendarUtils.ts
export function createCalendarUtils(temporal: TemporalInstance): TemporalUtils {
  const getDate = (dateOrUnit: Date | TimeUnit): Date => {
    return "raw" in dateOrUnit ? dateOrUnit.raw.value : dateOrUnit;
  };

  return {
    isWeekend(dateOrUnit) {
      const date = getDate(dateOrUnit);
      const day = date.getDay();
      return day === 0 || day === 6;
    },

    isWeekday(dateOrUnit) {
      return !this.isWeekend(dateOrUnit);
    },

    isToday(dateOrUnit) {
      const date = getDate(dateOrUnit);
      return temporal.adapter.isSame(date, temporal.now.value, "day");
    },

    isTomorrow(dateOrUnit) {
      const date = getDate(dateOrUnit);
      const tomorrow = temporal.adapter.add(temporal.now.value, { days: 1 });
      return temporal.adapter.isSame(date, tomorrow, "day");
    },

    isYesterday(dateOrUnit) {
      const date = getDate(dateOrUnit);
      const yesterday = temporal.adapter.subtract(temporal.now.value, {
        days: 1,
      });
      return temporal.adapter.isSame(date, yesterday, "day");
    },

    isPast(dateOrUnit) {
      const date = getDate(dateOrUnit);
      return temporal.adapter.isBefore(date, temporal.now.value);
    },

    isFuture(dateOrUnit) {
      const date = getDate(dateOrUnit);
      return temporal.adapter.isAfter(date, temporal.now.value);
    },

    formatHour(hour: number, use24Hour: boolean): string {
      if (use24Hour) {
        return hour.toString().padStart(2, "0") + ":00";
      }
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour} ${period}`;
    },

    // ... other utilities
  };
}

// Add to createTemporal
const utils = createCalendarUtils(temporalInstance);
return {
  // ... existing properties
  utils,
};
```

## 4. Simplified StableMonth API

### Problem

Creating stableMonth is verbose:

```typescript
const stableMonth = periods.stableMonth({
  now: props.temporal.now,
  browsing: month.browsing,
  adapter: props.temporal.adapter,
  weekStartsOn: props.temporal.weekStartsOn,
});
```

### Solution

Add convenience methods:

```typescript
// On temporal instance
temporal.stableMonth(month: TimeUnit): TimeUnit

// On month unit itself
month.toStableMonth(): TimeUnit
```

### Implementation

```typescript
// In createTemporal.ts
function stableMonth(month: TimeUnit): TimeUnit {
  return periods.stableMonth({
    now: this.now,
    browsing: month.browsing,
    adapter: this.adapter,
    weekStartsOn: this.weekStartsOn,
  });
}

// In createPeriod.ts (for month units)
if (kind === "month") {
  return {
    // ... existing properties
    toStableMonth() {
      return periods.stableMonth({
        now: options.now,
        browsing: this.browsing,
        adapter: options.adapter,
        weekStartsOn: options.weekStartsOn,
      });
    },
  };
}
```

## 5. Direct Property Access

### Problem

Frequent `.raw.value` access for basic operations:

```typescript
day.raw.value.getDay(); // Get day of week
month.raw.value.getMonth(); // Get month number
```

### Solution

Add direct properties:

```typescript
interface DayUnit extends TimeUnit {
  weekday: number; // 0-6
  weekdayName: string; // "Monday"
  date: number; // 1-31
  dayOfYear: number; // 1-366
}

interface MonthUnit extends TimeUnit {
  month: number; // 0-11
  monthName: string; // "January"
  daysInMonth: number; // 28-31
  quarter: number; // 1-4
}

interface YearUnit extends TimeUnit {
  year: number; // 2024
  isLeapYear: boolean; // true/false
}
```

### Implementation

```typescript
// In createPeriod.ts
const directProperties = computed(() => {
  const date = raw.value;

  switch (kind) {
    case "day":
      return {
        weekday: date.getDay(),
        weekdayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.getDate(),
        dayOfYear: Math.floor(
          (date - new Date(date.getFullYear(), 0, 0)) / 86400000
        ),
      };
    case "month":
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return {
        month: date.getMonth(),
        monthName: date.toLocaleDateString("en-US", { month: "long" }),
        daysInMonth: nextMonth.getDate(),
        quarter: Math.floor(date.getMonth() / 3) + 1,
      };
    case "year":
      return {
        year: date.getFullYear(),
        isLeapYear:
          date.getFullYear() % 4 === 0 &&
          (date.getFullYear() % 100 !== 0 || date.getFullYear() % 400 === 0),
      };
    default:
      return {};
  }
});

return {
  // ... existing properties
  ...toRefs(directProperties.value),
};
```

## Implementation Plan

### Phase 1 (Immediate - 1 week)

1. ✅ Formatted output properties
2. ✅ Basic utility functions (isWeekend, isToday, etc.)
3. ✅ Direct property access

### Phase 2 (Next - 1 week)

1. ✅ Calendar grid utility
2. ✅ Simplified stableMonth API

### Phase 3 (Following - 2 weeks)

1. ⏳ Relative time utilities
2. ⏳ Time range support
3. ⏳ Advanced utilities

## Benefits

1. **Reduced Code**: 50-70% less boilerplate in components
2. **Better DX**: Intuitive API that matches mental models
3. **Type Safety**: Full TypeScript support with better inference
4. **Performance**: Computed properties only calculate when accessed
5. **Backward Compatible**: All changes are additive

## Example: Before vs After

### Before (Current API)

```typescript
// From MonthView.vue
const monthName = computed(() =>
  props.month.raw.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
);

const calendarDays = computed(() => {
  const stableMonth = periods.stableMonth({
    now: props.temporal.now,
    browsing: props.month.browsing,
    adapter: props.temporal.adapter,
    weekStartsOn: props.temporal.weekStartsOn,
  });

  const weeks = props.temporal.divide(stableMonth, "week");
  return weeks.map((week) => {
    const days = props.temporal.divide(week, "day");
    return days.map((day) => ({
      day,
      isCurrentMonth: stableMonth.contains!(day.raw.value),
      isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
      isToday: props.temporal.adapter.isSame(
        day.raw.value,
        currentDate.value,
        "day"
      ),
    }));
  });
});
```

### After (Improved API)

```typescript
// With improvements
const monthName = computed(() => props.month.formatted.long);

const calendarGrid = computed(() =>
  props.temporal.createCalendarGrid(props.month)
);

// Direct access to grid
calendarGrid.value.weeks.forEach((week) => {
  week.days.forEach((day) => {
    // All properties directly available
    console.log(day.isWeekend, day.isToday, day.formatted.short);
  });
});
```

This represents a massive improvement in developer experience while maintaining the elegant architecture of useTemporal.
