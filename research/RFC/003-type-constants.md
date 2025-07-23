# RFC-003: Type-Safe Time Navigation with Zoom API

## Summary

Introduce a zoom-based navigation API with type-safe constants for intuitive time unit traversal.

## Motivation

Current API has limitations:
```typescript
// Current - only goes one direction
temporal.divide(year, "month"); // Get months in year
// But how do you go from month back to year?

// String literals are error-prone
temporal.divide(year, "mnth"); // Runtime error!
```

## Detailed Design

### Core Concepts

**Zoom Navigation** - Move between time hierarchies like zooming a map:
- **zoomIn**: Go from larger to smaller units (year → months)
- **zoomOut**: Go from smaller to containing unit (month → year)
- **zoomTo**: Jump to any related unit level (day → year)

### API

```typescript
// Type-safe unit constants
export const UNITS = {
  year: "year",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  stableMonth: "stableMonth",
} as const;

export type UnitKey = keyof typeof UNITS;
export type UnitValue = typeof UNITS[UnitKey];

// Zoom API on temporal
interface Temporal {
  zoomIn(from: TimeUnit, to: UnitValue): TimeUnit[]
  zoomOut(from: TimeUnit, to: UnitValue): TimeUnit
  zoomTo(from: TimeUnit, to: UnitValue): TimeUnit
}

// Also available on TimeUnit
interface TimeUnit {
  zoomIn(to: UnitValue): TimeUnit[]
  zoomOut(to: UnitValue): TimeUnit
  zoomTo(to: UnitValue): TimeUnit
}
```

### Usage Examples

```typescript
import { UNITS } from "@usetemporal/core";

// Zoom in - get smaller units within
const months = year.zoomIn(UNITS.month);      // 12 months
const weeks = month.zoomIn(UNITS.week);       // 4-6 weeks
const days = week.zoomIn(UNITS.day);          // 7 days

// Zoom out - get containing unit
const year = month.zoomOut(UNITS.year);       // Containing year
const month = day.zoomOut(UNITS.month);       // Containing month
const week = day.zoomOut(UNITS.week);         // Containing week

// Zoom to - jump to any level
const year = day.zoomTo(UNITS.year);          // Which year is this day in?
const month = hour.zoomTo(UNITS.month);       // Which month is this hour in?

// Still support divide for compatibility
const months = temporal.divide(year, UNITS.month); // Works too
```

### Type Safety

```typescript
// Valid zoom operations
year.zoomIn(UNITS.month)     ✓ // Year contains months
month.zoomOut(UNITS.year)    ✓ // Month is in a year
day.zoomTo(UNITS.week)       ✓ // Day can find its week

// TypeScript errors for invalid operations
hour.zoomIn(UNITS.year)      ✗ // Error: Can't zoom from hour to year
day.zoomOut(UNITS.hour)      ✗ // Error: Day doesn't contain hours
```

### Hierarchy Rules

```
year
  ├── month
  │     ├── week (partial)
  │     └── day
  │           └── hour
  │                 └── minute
  │                       └── second
  └── week
        └── day
```

## Implementation

```typescript
// In TimeUnit interface
interface TimeUnit {
  zoomIn(to: UnitValue): TimeUnit[] {
    // Use existing divide logic
    return temporal.divide(this, to);
  }
  
  zoomOut(to: UnitValue): TimeUnit {
    // Create a unit at the target level containing this unit's date
    return periods[to]({
      now: this.now,
      browsing: this.raw,
      adapter: this.adapter
    });
  }
  
  zoomTo(to: UnitValue): TimeUnit {
    // Alias for zoomOut - jump to any containing level
    return this.zoomOut(to);
  }
}
```

## Benefits

- **Intuitive**: Zoom metaphor matches mental model
- **Bidirectional**: Navigate up and down the hierarchy
- **Type-safe**: Constants prevent typos
- **Discoverable**: IDE autocomplete shows valid operations
- **Compatible**: `divide` still works

## Drawbacks

- Another API to learn (but more intuitive)
- "Zoom" metaphor might not translate well
- Some redundancy with existing `divide`

## Alternatives

1. Keep only `divide` (status quo)
2. Use different naming: `drillDown`/`bubbleUp`
3. Use `children()`/`parent()` methods
4. Hierarchical API: `year.months`, `month.year`

## Migration Path

No breaking changes. Both APIs work:
```typescript
// Old way
temporal.divide(year, "month");

// New ways - all equivalent
year.zoomIn(UNITS.month);
temporal.zoomIn(year, UNITS.month);
```

## Future Considerations

This API opens doors for more intuitive operations:
```typescript
// Potential future additions
day.zoomIn(UNITS.hour, { range: "business" }); // Only business hours
month.zoomOut(UNITS.year, { fiscal: true });   // Fiscal year
week.siblings();                                // Other weeks in month
```