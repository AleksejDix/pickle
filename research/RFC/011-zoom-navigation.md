# RFC-011: Zoom Navigation API

## Summary

Introduce an intuitive zoom-based navigation API for traversing time hierarchies bidirectionally.

## Motivation

Current `divide` API only goes one direction and doesn't match how people think about time:

```typescript
// Current limitations
temporal.divide(year, "month"); // Get months in year ✓
// But how do you go from month to its year? 🤔
// How do you go from a day to its containing week? 🤔

// Mental model mismatch
// People think: "zoom into the month to see days"
// API says: "divide the month by days"
```

## Detailed Design

### Core Concept

Time navigation as **zooming** - like a map or calendar app:

- **Zoom in**: See more detail (year → months → days)
- **Zoom out**: See the bigger picture (day → month → year)
- **Zoom to**: Jump to any level (hour → year)

### API

```typescript
interface TimeUnit {
  // Zoom in to see contained units
  zoomIn(unit: UnitValue): TimeUnit[];

  // Zoom out to containing unit
  zoomOut(unit: UnitValue): TimeUnit;

  // Zoom directly to any level
  zoomTo(unit: UnitValue): TimeUnit;
}

// Also available on temporal
interface Temporal {
  zoomIn(from: TimeUnit, to: UnitValue): TimeUnit[];
  zoomOut(from: TimeUnit, to: UnitValue): TimeUnit;
  zoomTo(from: TimeUnit, to: UnitValue): TimeUnit;
}
```

### Real-World Examples

```typescript
// Calendar navigation
const year2024 = periods.year(temporal);
const months = year2024.zoomIn("month"); // See all months
const january = months[0];
const days = january.zoomIn("day"); // See all days in January
const jan15 = days[14];
const containingWeek = jan15.zoomOut("week"); // Which week is Jan 15 in?
const containingYear = jan15.zoomTo("year"); // Jump directly to year

// Date picker navigation
function handleDayClick(day: TimeUnit) {
  const month = day.zoomOut("month"); // Show month view
  const year = day.zoomOut("year"); // Or jump to year view
}

// Breadcrumb navigation
function getBreadcrumbs(day: TimeUnit) {
  return {
    year: day.zoomTo("year"),
    month: day.zoomTo("month"),
    week: day.zoomTo("week"),
    day: day,
  };
}
```

### Comparison with Current API

```typescript
// BEFORE: One-directional, technical
const months = temporal.divide(year, "month");
// How to go back? Need to manually create: 🤯
const year = periods.year({
  now: temporal.now,
  browsing: month.browsing,
  adapter: temporal.adapter,
});

// AFTER: Bidirectional, intuitive
const months = year.zoomIn("month"); // Down the hierarchy
const year = month.zoomOut("year"); // Up the hierarchy
```

### Type Safety

With constants from RFC-003:

```typescript
import { UNITS } from "@usetemporal/core";

// Type-safe navigation
year.zoomIn(UNITS.month); // ✓ Autocomplete works
month.zoomOut(UNITS.year); // ✓ No typos possible
day.zoomTo(UNITS.week); // ✓ Jump to any level

// TypeScript prevents invalid operations
hour.zoomIn(UNITS.year); // ❌ TypeScript error
```

## Implementation Strategy

### Phase 1: Add zoom methods

```typescript
// In createPeriod.ts
const zoomIn = (to: UnitValue): TimeUnit[] => {
  return temporal.divide(this, to);
};

const zoomOut = (to: UnitValue): TimeUnit => {
  return periods[to]({
    now: options.now,
    browsing: raw,
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn,
  });
};

const zoomTo = zoomOut; // Alias for clarity
```

### Phase 2: Optimize common patterns

```typescript
// Add shortcuts for common operations
day.week; // Same as day.zoomOut("week")
month.year; // Same as month.zoomOut("year")
week.days; // Same as week.zoomIn("day")
```

## Benefits

1. **Intuitive**: Matches how people think about time
2. **Bidirectional**: Navigate up and down easily
3. **Discoverable**: Clear what each method does
4. **Powerful**: Enables complex navigation simply
5. **Compatible**: Works alongside existing API

## Use Cases

### Calendar Applications

```typescript
// User clicks on a day in year view
function drillDown(day: TimeUnit) {
  const month = day.zoomOut("month");
  showMonthView(month);
}

// Breadcrumb navigation
<Breadcrumb>
  <Item onClick={() => show(day.zoomTo("year"))}>2024</Item>
  <Item onClick={() => show(day.zoomTo("month"))}>January</Item>
  <Item active>15</Item>
</Breadcrumb>
```

### Date Range Selection

```typescript
// Find all days in the same month as selected day
const selectedMonth = selectedDay.zoomOut("month");
const allDaysInMonth = selectedMonth.zoomIn("day");

// Find week boundaries
const week = selectedDay.zoomOut("week");
const weekDays = week.zoomIn("day");
const [firstDay, lastDay] = [weekDays[0], weekDays[6]];
```

### Analytics Dashboards

```typescript
// Aggregate data by different time periods
function aggregateData(day: TimeUnit, level: UnitValue) {
  const period = day.zoomTo(level);
  return getDataForPeriod(period);
}

// Easy period comparison
const thisMonth = today.zoomOut("month");
const lastMonth = thisMonth.previous();
```

## Migration Path

1. Add zoom methods alongside divide (non-breaking)
2. Update documentation to prefer zoom API
3. Keep divide for backward compatibility
4. Consider deprecating divide in v3

```typescript
// Both work during transition
temporal.divide(year, "month"); // Old way
year.zoomIn("month"); // New way
```

## Alternatives Considered

1. **Hierarchical properties**: `year.months`, `month.days`
   - Pro: Very simple
   - Con: Not flexible, returns arrays when might want single unit

2. **Parent/children methods**: `month.parent()`, `month.children("day")`
   - Pro: Clear relationship
   - Con: Doesn't convey the zooming/navigation aspect

3. **Get methods**: `getContaining("year")`, `getContained("day")`
   - Pro: Explicit
   - Con: Verbose, less intuitive

## Conclusion

The zoom API transforms time navigation from a technical operation to an intuitive action that matches how people naturally think about time hierarchies. It makes useTemporal significantly more powerful while remaining simple to understand.
