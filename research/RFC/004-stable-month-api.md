# RFC-004: Simplified StableMonth API

## Summary

Add convenience methods to create stableMonth units with less boilerplate.

## Motivation

Creating a stableMonth currently requires passing many properties:

```typescript
// Current verbose approach
const stableMonth = periods.stableMonth({
  now: temporal.now,
  browsing: month.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
});
```

This pattern is repeated in every calendar component.

## Detailed Design

### API

```typescript
// Method 1: On temporal instance
temporal.stableMonth(month: TimeUnit): TimeUnit

// Method 2: On month units
month.toStableMonth(): TimeUnit

// Usage examples
const grid = temporal.stableMonth(currentMonth);
// or
const grid = currentMonth.toStableMonth();
```

### Real-world Usage

```typescript
// Before: 6 lines
const stableMonth = periods.stableMonth({
  now: props.temporal.now,
  browsing: month.browsing,
  adapter: props.temporal.adapter,
  weekStartsOn: props.temporal.weekStartsOn,
});

// After: 1 line
const stableMonth = props.temporal.stableMonth(month);
// or
const stableMonth = month.toStableMonth();
```

## Implementation

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

// In createPeriod.ts
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

## Benefits

- 80% less code to create stableMonth
- More intuitive API
- Reduces chance of errors
- Better discoverability

## Drawbacks

- Two ways to do the same thing
- Only works for month units
- Adds methods to already large interfaces

## Alternatives

1. Keep current API only
2. Create a factory function: `createStableMonth(temporal, month)`
3. Auto-detect in divide: `temporal.divide(month, 'week', { stable: true })`

## Migration Path

No breaking changes. Old method continues to work:

```typescript
// Both approaches work
const stable1 = periods.stableMonth({...}); // Old way
const stable2 = temporal.stableMonth(month); // New way
```
