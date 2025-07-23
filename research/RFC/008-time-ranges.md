# RFC-008: Time Range Support

## Summary

Add first-class support for time ranges with operations like contains, overlaps, and merge.

## Motivation

Many applications need to work with time ranges:
- Event duration
- Business hours
- Vacation periods
- Booking slots

Currently, developers manually track start/end dates.

## Detailed Design

### API

```typescript
interface TimeRange {
  start: TimeUnit;
  end: TimeUnit;
  
  // Computed properties
  duration: {
    days: number;
    hours: number;
    minutes: number;
    formatted: string; // "3 days, 2 hours"
  };
  
  // Methods
  contains(date: Date | TimeUnit): boolean;
  overlaps(other: TimeRange): boolean;
  intersect(other: TimeRange): TimeRange | null;
  union(other: TimeRange): TimeRange;
  split(by: UnitValue): TimeUnit[];
}

// Factory function
temporal.createRange(start: Date | TimeUnit, end: Date | TimeUnit): TimeRange;

// Usage
const vacation = temporal.createRange(startDate, endDate);
console.log(vacation.duration.formatted); // "14 days"

if (vacation.contains(meeting.date)) {
  // Conflict!
}
```

### Advanced Usage

```typescript
// Check overlapping events
const events = [range1, range2, range3];
const conflicts = events.filter((e1, i) => 
  events.slice(i + 1).some(e2 => e1.overlaps(e2))
);

// Merge overlapping ranges
const merged = ranges.reduce((acc, range) => {
  const last = acc[acc.length - 1];
  if (last && last.overlaps(range)) {
    acc[acc.length - 1] = last.union(range);
  } else {
    acc.push(range);
  }
  return acc;
}, []);
```

## Benefits

- First-class range support
- Common operations built-in
- Type-safe range operations
- Useful for scheduling apps

## Drawbacks

- Adds complexity
- Another concept to learn
- May overlap with interval libraries

## Alternatives

1. Keep ranges in userland
2. Create separate range library
3. Add range methods to TimeUnit

## Migration Path

Pure addition, no breaking changes.