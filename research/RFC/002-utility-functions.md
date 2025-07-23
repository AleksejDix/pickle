# RFC-002: Basic Utility Functions

## Summary

Add a `utils` namespace with common date checking functions like `isWeekend()`, `isToday()`, `isPast()`, etc.

## Motivation

Developers repeatedly implement the same basic checks:

```typescript
// Current repetitive patterns
isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6;
isToday: temporal.adapter.isSame(day.raw.value, now.value, "day");
isPast: temporal.adapter.isBefore(day.raw.value, now.value);
```

## Detailed Design

### API

```typescript
interface TemporalUtils {
  // Day type checks
  isWeekend(date: Date | TimeUnit): boolean;
  isWeekday(date: Date | TimeUnit): boolean;

  // Relative to now
  isToday(date: Date | TimeUnit): boolean;
  isTomorrow(date: Date | TimeUnit): boolean;
  isYesterday(date: Date | TimeUnit): boolean;
  isPast(date: Date | TimeUnit): boolean;
  isFuture(date: Date | TimeUnit): boolean;

  // Relative to current period
  isThisWeek(date: Date | TimeUnit): boolean;
  isThisMonth(date: Date | TimeUnit): boolean;
  isThisYear(date: Date | TimeUnit): boolean;
}

// Access via temporal.utils
temporal.utils.isWeekend(day);
temporal.utils.isToday(date);
```

### Usage Examples

```typescript
// Filter business days
const businessDays = days.filter(
  (day) => temporal.utils.isWeekday(day) && !temporal.utils.isPast(day)
);

// Highlight special days
if (temporal.utils.isToday(day)) {
  classList.add("today");
} else if (temporal.utils.isWeekend(day)) {
  classList.add("weekend");
}

// Show relative dates
if (temporal.utils.isTomorrow(event.date)) {
  return "Tomorrow";
}
```

## Implementation

```typescript
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

    isPast(dateOrUnit) {
      const date = getDate(dateOrUnit);
      return temporal.adapter.isBefore(date, temporal.now.value);
    },

    isFuture(dateOrUnit) {
      const date = getDate(dateOrUnit);
      return temporal.adapter.isAfter(date, temporal.now.value);
    },

    // ... other methods
  };
}
```

## Benefits

- Eliminates repetitive date checking logic
- Consistent API across the codebase
- Works with both Date objects and TimeUnits
- Leverages adapter for timezone-aware comparisons

## Drawbacks

- Adds another namespace to remember
- Some functions might be too simple to warrant inclusion
- Weekend definition is culturally specific (Sat/Sun)

## Alternatives

1. Keep these in userland
2. Add as methods on TimeUnit objects
3. Export as standalone functions
4. Create a separate utils package

## Migration Path

No breaking changes. Pure addition to the API.
