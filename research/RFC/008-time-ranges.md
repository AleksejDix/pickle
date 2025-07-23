# RFC-008: Unified Period System - Merge and Split Operations

## Status: IMPLEMENTED ✅

Implemented as part of RFC-012 unified navigation system.

## Summary

Extend the existing Period concept to support merging and splitting operations, where standard time units naturally emerge from merged periods (e.g., 7 days → week, 3 months → quarter).

## Motivation

Currently, Period is a simple `{ start: Date, end: Date }` object. By adding merge and split operations, we can:

1. Create custom time ranges by merging existing units
2. Discover natural time units through merging (7 days = week)
3. Split periods into constituent units
4. Build a unified abstraction where ALL time spans are just Periods

```typescript
// Current limitation
const days = temporal.divide(week, "day"); // 7 days
// But can't go the other way - merge 7 days into a week

// Vision: Bidirectional operations
const week = temporal.merge(days); // 7 consecutive days → week
const quarter = temporal.merge([jan, feb, mar]); // 3 months → quarter
```

## Detailed Design

### Core Concept

Every time span is a Period. Standard units (week, month, quarter) are just Periods with specific merge/split rules.

### API

```typescript
// Extend TemporalCore interface
interface TemporalCore {
  // Merge consecutive periods into larger period
  merge(periods: TimeUnit[]): TimeUnit | null;

  // Split a period by duration or count
  split(period: TimeUnit, options: SplitOptions): TimeUnit[];

  // Create custom period from dates
  createPeriod(start: Date, end: Date): TimeUnit;
}

interface SplitOptions {
  by?: UnitValue; // Split by unit type
  count?: number; // Split into N equal parts
  duration?: Duration; // Split by duration
}

// Smart merging - detects natural units
const days = weekDays.map((d) => temporal.periods.day(temporal, { date: d }));
const week = temporal.merge(days); // Returns week unit if 7 consecutive days

const months = [jan, feb, mar];
const quarter = temporal.merge(months); // Returns quarter unit if consecutive
```

### Natural Unit Detection

When merging periods, the system detects if they form a standard unit:

```typescript
// Merge rules
temporal.merge([7 consecutive days]) → week
temporal.merge([28-31 consecutive days starting at month boundary]) → month
temporal.merge([3 consecutive months in same quarter]) → quarter
temporal.merge([12 consecutive months]) → year
temporal.merge([4 consecutive quarters]) → year
temporal.merge([6 consecutive weeks from month start]) → stableMonth

// If no natural unit matches, return generic Period
temporal.merge([day1, day3, day5]) → Period { start: day1.start, end: day5.end }
```

### Split Operations

```typescript
// Split by unit
const weeks = temporal.split(month, { by: "week" }); // 4-6 week periods
const halves = temporal.split(year, { count: 2 }); // 2 6-month periods

// Custom splits
const shifts = temporal.split(day, {
  duration: { hours: 8 },
}); // Three 8-hour shifts

// Split with boundaries
const workWeek = temporal.split(week, {
  by: "day",
  filter: (day) => !day.isWeekend,
}); // 5 days
```

### Custom Period Creation

```typescript
// Create arbitrary period
const sprint = temporal.createPeriod(
  new Date(2024, 0, 1),
  new Date(2024, 0, 14)
);

// Has all TimeUnit properties
console.log(sprint.days); // 14
console.log(sprint.contains(someDate)); // true

// Can be split
const sprintDays = temporal.split(sprint, { by: "day" });

// Can be merged with adjacent periods
const nextSprint = temporal.createPeriod(
  new Date(2024, 0, 15),
  new Date(2024, 0, 28)
);
const month = temporal.merge([sprint, nextSprint]); // Detects as January
```

### Advanced Examples

```typescript
// Business quarters from fiscal year
const fiscalYear = temporal.createPeriod(
  new Date(2024, 3, 1), // April 1
  new Date(2025, 2, 31) // March 31
);
const quarters = temporal.split(fiscalYear, { count: 4 });

// Academic semesters
const academicYear = temporal.createPeriod(
  new Date(2024, 8, 1), // Sept 1
  new Date(2025, 5, 30) // June 30
);
const semesters = temporal.split(academicYear, { count: 2 });

// Merge non-consecutive periods (returns generic Period)
const holidays = temporal.merge([christmas, newYear, thanksgiving]);
console.log(holidays.days); // Total days across all periods
console.log(holidays.isContiguous); // false
```

### Period Properties

```typescript
interface Period {
  start: Date;
  end: Date;

  // New properties
  isContiguous: boolean; // No gaps in period
  isNaturalUnit: boolean; // Matches a standard unit
  unitType?: UnitValue; // "week", "month", etc. if natural

  // Statistics
  businessDays: number;
  weekendDays: number;
  totalDays: number;
}
```

## Implementation Strategy

1. Extend Period type with merge/split awareness
2. Add pattern matching for natural unit detection
3. Ensure all operations maintain TimeUnit interface
4. Keep existing divide() for compatibility

## Benefits

1. **Unified abstraction**: Everything is a Period
2. **Bidirectional**: Can both split and merge
3. **Flexible**: Custom periods for any use case
4. **Natural**: Standard units emerge from merging
5. **Powerful**: Complex time calculations become simple

## Use Cases

### Sprint Planning

```typescript
const quarter = temporal.periods.quarter(temporal);
const sprints = temporal.split(quarter, { count: 6 }); // 2-week sprints
```

### Availability Checking

```typescript
const workHours = temporal.merge(
  weekdays.flatMap((day) =>
    temporal.createPeriod(
      day.start.value.setHours(9),
      day.start.value.setHours(17)
    )
  )
);
```

### Billing Periods

```typescript
const billingCycle = temporal.createPeriod(
  subscription.startDate,
  subscription.endDate
);
const months = temporal.split(billingCycle, { by: "month" });
```

## Migration Path

1. Add merge/split without changing existing API
2. Period remains `{ start, end }`
3. All existing code continues working
4. Gradually document merge patterns

## Alternatives Considered

1. **Separate Range class**: More complex, two abstractions
2. **Only in userland**: Misses natural unit detection
3. **Builder pattern**: `Period.from(days).to(week)`

## Future Possibilities

```typescript
// Period arithmetic
period1.intersect(period2); // Overlapping period
period1.union(period2); // Combined period
period1.subtract(period2); // Remaining periods

// Period queries
period.gaps(); // Find gaps in non-contiguous period
period.overlaps(other); // Check overlap
```

## Conclusion

By extending Period with merge/split operations, we create a powerful unified abstraction where any time span is just a Period, and standard units naturally emerge from merging smaller periods. This maintains the simplicity of the current API while adding significant power for complex time operations.
