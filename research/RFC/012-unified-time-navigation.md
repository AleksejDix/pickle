# RFC-012: Unified Time Navigation - Combining Zoom and Period Operations

## Status: FULLY IMPLEMENTED ✅

- ✅ `split()` method with flexible options
- ✅ `merge()` method with natural unit detection
- ✅ `createPeriod()` for custom time periods
- ✅ `zoomIn()`, `zoomOut()`, `zoomTo()` methods
- ✅ Enhanced periods as default system

## Summary

Combine the zoom navigation API (RFC-011) with the unified period system (RFC-008) to create a complete time manipulation system where zooming, merging, and splitting are all part of the same coherent API.

## Motivation

RFC-011 (Zoom Navigation) and RFC-008 (Unified Periods) are solving related problems:

- Zoom: Navigate between time hierarchy levels (year ↔ month ↔ day)
- Periods: Merge/split time units to create custom periods

These should be one unified system where:

1. `zoomIn()` is a semantic wrapper around `split()`
2. `zoomOut()` naturally finds or creates the containing period
3. `merge()` can create any period, including standard units
4. All operations work on the same Period abstraction

## Unified Design

### Core Insight

Every time operation is about navigating, splitting, or merging periods:

```typescript
// These are conceptually related:
year.zoomIn("month"); // Split year into month periods
temporal.split(year, { by: "month" }); // Same operation, different name

// These create containing periods:
month.zoomOut("year"); // Find/create containing year
temporal.merge([jan, feb, ...dec]); // Merge 12 months into year

// These work together:
const weeks = month.zoomIn("week"); // Get weeks in month
const month = temporal.merge(weeks); // Merge back into month
```

### Unified API

```typescript
interface TimeUnit {
  // Navigation (semantic sugar over split/merge)
  zoomIn(unit: UnitValue): TimeUnit[]     // → split(this, { by: unit })
  zoomOut(unit: UnitValue): TimeUnit      // → find containing period
  zoomTo(unit: UnitValue): TimeUnit       // → navigate to any level

  // Direct operations
  split(options: SplitOptions): TimeUnit[]
  merge(with: TimeUnit[]): TimeUnit | null

  // All TimeUnits are Periods
  period: Period
  contains(target: Date | TimeUnit): boolean
  overlaps(other: TimeUnit): boolean
}

interface TemporalCore {
  // Factory operations
  divide(from: TimeUnit, unit: UnitValue): TimeUnit[]    // Legacy
  split(period: TimeUnit, options: SplitOptions): TimeUnit[]
  merge(periods: TimeUnit[]): TimeUnit | null
  createPeriod(start: Date, end: Date): TimeUnit

  // Navigation helpers
  zoomIn(from: TimeUnit, to: UnitValue): TimeUnit[]
  zoomOut(from: TimeUnit, to: UnitValue): TimeUnit
  zoomTo(from: TimeUnit, to: UnitValue): TimeUnit
}
```

### Implementation Unification

```typescript
// zoomIn is implemented using split
const zoomIn = (unit: UnitValue): TimeUnit[] => {
  return temporal.split(this, { by: unit });
};

// zoomOut finds or creates containing period
const zoomOut = (unit: UnitValue): TimeUnit => {
  // For standard units, use the normal composables
  if (isStandardUnit(unit)) {
    return periods[unit]({
      now: options.now,
      browsing: this.raw,
      adapter: options.adapter,
    });
  }

  // For custom periods, find containing
  return temporal.findContaining(this, unit);
};

// merge can produce standard units
const merge = (periods: TimeUnit[]): TimeUnit | null => {
  // Detect if periods form a standard unit
  const detected = detectNaturalUnit(periods);
  if (detected) {
    return createStandardUnit(detected.type, detected.period);
  }

  // Otherwise create custom period
  return createCustomPeriod(periods);
};
```

## Integration with Existing System

### Current Architecture Strengths

The existing codebase is already well-designed for this enhancement:

1. **Period Foundation**: Every `TimeUnit` already has a `period: ComputedRef<Period>` property
2. **Interface Ready**: `TimeUnit` interface already defines zoom methods (not yet implemented)
3. **Factory Pattern**: `createPeriod()` can be extended for custom periods
4. **Modular Design**: New features are purely additive

### Integration Approach

```typescript
// 1. Existing TimeUnit objects gain new capabilities
const month = useMonth(temporal);
month.period.value; // Already exists: { start: Date, end: Date }
month.contains(day); // Already implemented
month.zoomIn("week"); // New: returns weeks in month
month.zoomOut("year"); // New: returns containing year

// 2. Standard composables continue to work
const year = useYear(temporal); // Existing API unchanged
const months = year.zoomIn("month"); // New capability
const quarter = temporal.merge([months[0], months[1], months[2]]); // Creates Q1

// 3. Custom periods use the same interface
const sprint = temporal.createPeriod(startDate, endDate);
sprint.contains(day); // Works like any TimeUnit
sprint.zoomIn("day"); // Split into days
const quarter = sprint.zoomOut("quarter"); // Find containing quarter
```

### Backward Compatibility

All existing code continues to work:

```typescript
// These all continue to work unchanged
const year = useYear(temporal);
const months = temporal.divide(year, "month");
const isInMonth = month.contains(someDate);
month.next();
month.previous();

// New methods are purely additive
const weeks = month.zoomIn("week"); // New
const quarter = temporal.merge([jan, feb, mar]); // New
```

## Unified Examples

### Example 1: Calendar Navigation

```typescript
// Navigate using zoom (user-friendly)
const year = periods.year(temporal);
const months = year.zoomIn("month"); // 12 months
const january = months[0];
const weeks = january.zoomIn("week"); // 4-5 weeks
const firstWeek = weeks[0];
const days = firstWeek.zoomIn("day"); // 7 days

// Same operation using split (more control)
const monthsAlt = temporal.split(year, { by: "month" });
const weeksAlt = temporal.split(january, { by: "week" });
const daysAlt = temporal.split(firstWeek, { by: "day" });

// Navigate back up
const backToMonth = firstWeek.zoomOut("month"); // January
const backToYear = firstWeek.zoomTo("year"); // 2024
```

### Example 2: Custom Periods

```typescript
// Create quarterly view
const year = periods.year(temporal);
const quarters = year.split({ count: 4 }); // 4 periods of 3 months each

// Or using semantic API
const months = year.zoomIn("month");
const q1 = temporal.merge([months[0], months[1], months[2]]);
const q2 = temporal.merge([months[3], months[4], months[5]]);

// Fiscal year handling
const fiscalYear = temporal.createPeriod(
  new Date(2024, 3, 1), // April 1
  new Date(2025, 2, 31) // March 31
);
const fiscalQuarters = fiscalYear.split({ count: 4 });
const fiscalMonths = fiscalYear.zoomIn("month"); // 12 months, April-March
```

### Example 3: Working with Non-Standard Periods

```typescript
// Sprint planning - 2 week sprints
const quarter = periods.quarter(temporal);
const sprints = quarter.split({
  duration: { weeks: 2 },
});

// Navigate from a day to its sprint
const today = periods.day(temporal);
const currentSprint = sprints.find((sprint) => sprint.contains(today));

// Academic terms
const academicYear = temporal.createPeriod(
  new Date(2024, 8, 1), // Sept 1
  new Date(2025, 5, 30) // June 30
);
const terms = academicYear.split({ count: 3 }); // Trimester system

// Navigate from any date to its term
const someDayInNovember = periods.day(temporal, {
  date: new Date(2024, 10, 15),
});
const fallTerm = terms.find((term) => term.contains(someDayInNovember));
```

### Example 4: Complex Business Logic

```typescript
// Business hours calculation
const week = periods.week(temporal);
const days = week.zoomIn("day");
const workDays = days.filter((day) => !isWeekend(day));

// Create work hours for each day
const workHours = workDays.map((day) => {
  const hours = day.zoomIn("hour");
  return temporal.merge(hours.slice(9, 17)); // 9 AM to 5 PM
});

// Total work hours in week
const totalWorkPeriod = temporal.merge(workHours);
console.log(totalWorkPeriod.hours); // 40

// Check if meeting time is in work hours
const meeting = temporal.createPeriod(
  new Date(2024, 0, 15, 14, 0), // 2 PM
  new Date(2024, 0, 15, 15, 0) // 3 PM
);
const isWorkHours = totalWorkPeriod.contains(meeting);
```

## Benefits of Unification

1. **Conceptual Clarity**: One mental model for all time operations
2. **API Consistency**: Same patterns whether navigating, splitting, or merging
3. **Flexibility**: Use high-level zoom API or low-level split/merge
4. **Power**: Combine operations for complex use cases
5. **Intuitive**: Matches how people think about time

## Implementation Phases

### Phase 1: Core Unification

- Implement split/merge operations on Period
- Make zoomIn use split internally
- Add period detection for merge

### Phase 2: Enhanced Navigation

- Add zoomOut using containing period logic
- Implement zoomTo for direct navigation
- Add findContaining helper

### Phase 3: Advanced Features

- Custom period types (sprint, semester, etc.)
- Period arithmetic (intersect, union, subtract)
- Period templates for common patterns

## Migration Strategy

```typescript
// Phase 1: All three APIs coexist
temporal.divide(year, "month"); // Original API (deprecated)
year.zoomIn("month"); // Navigation API
year.split({ by: "month" }); // Period API

// Phase 2: Remove divide in v3.0
// divide was just a limited version of split
// zoomIn provides the semantic clarity divide was meant to have
```

## Why Divide Becomes Obsolete

The `divide` function was our v1 API, but the unified system makes it redundant:

1. **Split is more powerful**: `split` can divide by unit, count, or duration
2. **ZoomIn is more intuitive**: `zoomIn` better expresses the intent
3. **One less concept**: Simpler mental model with just split/merge/zoom

```typescript
// Old way (limited)
temporal.divide(year, "month"); // Only splits by unit type

// New ways (flexible)
year.zoomIn("month"); // Semantic: "zoom into months"
year.split({ by: "month" }); // Explicit: "split by month"
year.split({ count: 4 }); // Powerful: "split into quarters"
year.split({ duration: { weeks: 2 } }); // Flexible: "split into 2-week periods"
```

## Conclusion

By unifying zoom navigation with period operations, we create a single, powerful system for all time manipulation needs. Users can choose the API style that matches their mental model while the implementation remains consistent and efficient.
