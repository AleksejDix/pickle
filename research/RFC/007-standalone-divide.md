# RFC-007: Standalone Divide Function

## Summary

Extract the divide functionality into standalone, tree-shakable functions.

## Motivation

The `temporal.divide()` method is always included even if unused, and the API could be more ergonomic:

```typescript
// Current
const months = temporal.divide(year, "month");
const days = temporal.divide(month, "day");

// Could be cleaner
const months = divide(year, "month");
// Or even better
const months = monthsIn(year);
const days = daysIn(month);
```

## Detailed Design

### API

```typescript
// Core divide function
export function divide(unit: TimeUnit, into: UnitValue): TimeUnit[];

// Convenience wrappers
export function yearsIn(unit: TimeUnit): TimeUnit[];
export function monthsIn(unit: TimeUnit): TimeUnit[];
export function weeksIn(unit: TimeUnit): TimeUnit[];
export function daysIn(unit: TimeUnit): TimeUnit[];
export function hoursIn(unit: TimeUnit): TimeUnit[];

// Usage
import { divide, monthsIn, daysIn } from "@usetemporal/core/divide";

const months = divide(year, "month");
// or
const months = monthsIn(year);

const days = daysIn(month);
const hours = hoursIn(day);
```

### Type Safety

```typescript
// These would be TypeScript errors
daysIn(hour);    // Error: Can't divide hour into days
yearsIn(month);  // Error: Can't divide month into years

// Valid operations
monthsIn(year);  // ✓
weeksIn(month);  // ✓ (partial weeks)
daysIn(week);    // ✓
```

## Implementation

```typescript
// In src/divide/index.ts
export function divide(unit: TimeUnit, into: UnitValue): TimeUnit[] {
  // Extract logic from current temporal.divide
  const { start, end } = unit.period.value;
  const adapter = (unit as any).adapter;
  
  // ... existing divide logic
}

// Convenience wrappers with type constraints
export function monthsIn(unit: TimeUnit): TimeUnit[] {
  if (unit.number.value < 12) { // Only years have 12+ as number
    throw new Error("Can only get months in a year");
  }
  return divide(unit, "month");
}

export function daysIn(unit: TimeUnit): TimeUnit[] {
  return divide(unit, "day");
}

// Keep temporal.divide for backward compatibility
temporal.divide = (unit, into) => divide(unit, into);
```

## Benefits

- Tree-shakable - only pay for what you use
- More intuitive API with convenience functions
- Better type safety possibilities
- Reduces temporal object size

## Drawbacks

- Two ways to do the same thing
- More imports to manage
- Convenience functions add API surface

## Alternatives

1. Keep only temporal.divide (status quo)
2. Make divide a method on TimeUnit
3. Use different naming: `splitInto()`

## Migration Path

No breaking changes. Both APIs work:

```typescript
// Old way continues to work
temporal.divide(year, "month");

// New way
import { monthsIn } from "@usetemporal/core/divide";
monthsIn(year);
```