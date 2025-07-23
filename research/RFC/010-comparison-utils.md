# RFC-010: Advanced Comparison Utilities

## Summary

Add advanced date comparison utilities like `isBetween()`, `diff()`, and `closest()`.

## Motivation

Complex date comparisons require manual implementation:

```typescript
// Current approach
const isInRange = date >= start && date <= end;
const diffInDays = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
const closest = dates.reduce((prev, curr) => 
  Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
);
```

## Detailed Design

### API

```typescript
interface ComparisonUtils {
  // Range checks
  isBetween(date: Date | TimeUnit, start: Date | TimeUnit, end: Date | TimeUnit, inclusive?: boolean): boolean;
  
  // Differences
  diff(from: Date | TimeUnit, to: Date | TimeUnit, unit: UnitValue): number;
  duration(from: Date | TimeUnit, to: Date | TimeUnit): Duration;
  
  // Finding
  closest(target: Date | TimeUnit, dates: (Date | TimeUnit)[]): Date | TimeUnit;
  min(...dates: (Date | TimeUnit)[]): Date | TimeUnit;
  max(...dates: (Date | TimeUnit)[]): Date | TimeUnit;
  
  // Sorting
  sort(dates: (Date | TimeUnit)[], order?: 'asc' | 'desc'): (Date | TimeUnit)[];
}

interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  
  // Convenience
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  
  // Formatting
  format(template?: string): string; // "2y 3m 15d"
}

// Access via temporal.compare
temporal.compare.isBetween(date, start, end);
temporal.compare.diff(date1, date2, 'days');
```

### Usage Examples

```typescript
// Check if date is in range
if (temporal.compare.isBetween(selectedDate, rangeStart, rangeEnd)) {
  console.log("Date is within range");
}

// Get exact difference
const daysDiff = temporal.compare.diff(startDate, endDate, 'days'); // 15
const duration = temporal.compare.duration(startDate, endDate);
console.log(duration.format()); // "15 days"

// Find closest date
const holidays = [date1, date2, date3];
const nearest = temporal.compare.closest(today, holidays);

// Sort dates
const sorted = temporal.compare.sort(dates, 'desc');
```

## Implementation

```typescript
export function createComparisonUtils(temporal: Temporal): ComparisonUtils {
  return {
    isBetween(date, start, end, inclusive = true) {
      const d = getDate(date);
      const s = getDate(start);
      const e = getDate(end);
      
      if (inclusive) {
        return d >= s && d <= e;
      }
      return d > s && d < e;
    },
    
    diff(from, to, unit) {
      const f = getDate(from);
      const t = getDate(to);
      
      switch(unit) {
        case 'days':
          return Math.floor((t - f) / (1000 * 60 * 60 * 24));
        case 'hours':
          return Math.floor((t - f) / (1000 * 60 * 60));
        // ... other units
      }
    },
    
    closest(target, dates) {
      const t = getDate(target).getTime();
      return dates.reduce((closest, date) => {
        const d = getDate(date).getTime();
        const c = getDate(closest).getTime();
        return Math.abs(d - t) < Math.abs(c - t) ? date : closest;
      });
    },
    
    // ... other methods
  };
}
```

## Benefits

- Common operations built-in
- Consistent API
- Type-safe comparisons
- Reduces date math errors

## Drawbacks

- Large API surface
- Some overlap with adapter methods
- Duration object adds complexity

## Alternatives

1. Add methods to TimeUnit
2. Use date-fns or similar
3. Keep simple, omit duration object

## Migration Path

Pure addition, no breaking changes.