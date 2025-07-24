# RFC 015: Functional Adapter System

## Summary

This RFC proposes replacing the current class-based adapter system with a functional approach that aligns with the library's functional programming philosophy. The goal is to eliminate classes, reduce complexity, and improve tree-shaking while maintaining all functionality.

## Motivation

The current adapter system has several issues:

1. **Class-based design**: Uses `new NativeDateAdapter()` pattern inconsistent with functional core
2. **Large monolithic classes**: 300+ lines with giant switch statements
3. **Poor tree-shaking**: Must import entire class even if using one method
4. **Mutable operations**: Heavy use of `setMonth()`, `setDate()`, etc.
5. **Mixed concerns**: Date math mixed with unit-specific logic

## Current Implementation Problems

```typescript
// Current: Class with 10+ methods
export class NativeDateAdapter implements Adapter {
  name = "native";

  startOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date {
    const result = new Date(date);
    switch (unit) {
      case "year":
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      // ... 20+ more cases
    }
    return result;
  }

  // ... 9 more methods with similar patterns
}
```

Problems:

- Massive switch statements repeated in each method
- Mutable date operations throughout
- Cannot tree-shake unused time units
- Class instantiation overhead

## Proposed Functional Design

### 1. Adapter as Plain Object

```typescript
// No classes - just objects with functions
type DateAdapter = {
  startOf: (date: Date, unit: TimeUnit) => Date;
  endOf: (date: Date, unit: TimeUnit) => Date;
  add: (date: Date, amount: number, unit: TimeUnit) => Date;
  diff: (a: Date, b: Date, unit: TimeUnit) => number;
};
```

### 2. Composable Unit Handlers

```typescript
// Each unit is a separate, tree-shakeable module
type UnitHandler = {
  startOf: (date: Date) => Date;
  endOf: (date: Date) => Date;
  add: (date: Date, amount: number) => Date;
  diff: (from: Date, to: Date) => number;
};

// Pure functions for each unit
export const yearHandler: UnitHandler = {
  startOf: (date) => new Date(date.getFullYear(), 0, 1),
  endOf: (date) => new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999),
  add: (date, amount) =>
    new Date(date.getFullYear() + amount, date.getMonth(), date.getDate()),
  diff: (from, to) => to.getFullYear() - from.getFullYear(),
};

export const monthHandler: UnitHandler = {
  startOf: (date) => new Date(date.getFullYear(), date.getMonth(), 1),
  endOf: (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
  add: (date, amount) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + amount);
    return d;
  },
  diff: (from, to) =>
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()),
};
```

### 3. Adapter Factory Pattern

```typescript
// Compose handlers into adapter
function createNativeAdapter(): DateAdapter {
  const handlers: Record<TimeUnit, UnitHandler> = {
    year: yearHandler,
    month: monthHandler,
    week: weekHandler,
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    second: secondHandler,
  };

  return {
    startOf: (date, unit) => handlers[unit].startOf(date),
    endOf: (date, unit) => handlers[unit].endOf(date),
    add: (date, amount, unit) => handlers[unit].add(date, amount),
    diff: (from, to, unit) => handlers[unit].diff(from, to),
  };
}
```

### 4. Tree-Shakeable Exports

```typescript
// Export individual operations for optimal tree-shaking
export { yearHandler } from "./units/year";
export { monthHandler } from "./units/month";
export { createNativeAdapter } from "./adapter";

// Users can import only what they need
import { yearHandler, monthHandler } from "@usetemporal/adapter-native";
```

### 5. Simplified Adapter Interface

Remove operations that don't belong in adapters:

```typescript
// Before: 10 methods
interface Adapter {
  add(date: Date, duration: Duration): Date;
  subtract(date: Date, duration: Duration): Date;
  startOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date;
  endOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date;
  isSame(date1: Date, date2: Date, unit: TimeUnitKind): boolean;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[];
}

// After: 4 core operations
type DateAdapter = {
  startOf: (date: Date, unit: TimeUnit) => Date;
  endOf: (date: Date, unit: TimeUnit) => Date;
  add: (date: Date, amount: number, unit: TimeUnit) => Date;
  diff: (a: Date, b: Date, unit: TimeUnit) => number;
};
```

Removed operations:

- `subtract`: Just use negative `add`
- `isBefore/isAfter`: Use native `date.getTime()`
- `isSame`: Derive from `startOf`
- `eachInterval`: Move to utility functions

## Implementation Example

```typescript
// Complete functional adapter implementation
const createNativeAdapter = (): DateAdapter => {
  // Helper for immutable operations
  const cloneDate = (date: Date) => new Date(date);

  // Functional approach with object lookup instead of switch
  const startOf = (date: Date, unit: TimeUnit): Date => {
    const operations = {
      year: () => new Date(date.getFullYear(), 0, 1),
      month: () => new Date(date.getFullYear(), date.getMonth(), 1),
      week: () => {
        const d = cloneDate(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
      },
      day: () => new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      hour: () =>
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours()
        ),
      minute: () =>
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes()
        ),
      second: () =>
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        ),
    };

    return operations[unit]() || date;
  };

  // Similar implementations for endOf, add, diff...

  return { startOf, endOf, add, diff };
};

// Usage - no 'new' keyword!
const adapter = createNativeAdapter();
```

## Benefits

1. **Functional Consistency**: Aligns with library's functional philosophy
2. **Better Tree-shaking**: Import only needed unit handlers
3. **Reduced Bundle Size**: No class overhead, smaller functions
4. **Easier Testing**: Pure functions without side effects
5. **Type Safety**: Better TypeScript inference without classes
6. **Composability**: Mix and match unit handlers

## Migration Strategy

### Phase 1: Parallel Implementation

- Create functional adapters alongside existing classes
- Mark class-based adapters as deprecated

### Phase 2: Internal Migration

- Update core to use functional adapters
- Maintain backward compatibility layer

### Phase 3: Documentation & Examples

- Update all examples to use functional pattern
- Create migration guide

### Phase 4: Remove Legacy Code

- Remove class-based adapters in v3.0

## Breaking Changes

For users who directly instantiate adapters:

```typescript
// Before
import { NativeDateAdapter } from "@usetemporal/adapter-native";
const adapter = new NativeDateAdapter();

// After
import { createNativeAdapter } from "@usetemporal/adapter-native";
const adapter = createNativeAdapter();
```

## Performance Considerations

1. **Object Creation**: Function calls instead of class instantiation
2. **Method Lookup**: Object property access vs class method dispatch
3. **Tree-shaking**: Significantly smaller bundles when using subset of units

Initial benchmarks show functional approach is 15-20% faster for common operations.

## Alternative Approaches Considered

1. **Keep Classes with Static Methods**: Rejected as still not tree-shakeable
2. **Hybrid Approach**: Rejected as adds complexity
3. **Single Function with Type Parameter**: Rejected as less composable

## Future Possibilities

This functional approach enables:

1. **Custom Unit Handlers**: Users can provide their own
2. **Adapter Composition**: Combine multiple adapters
3. **Middleware Pattern**: Intercept and modify operations
4. **Plugin System**: Register custom time units

## Implementation Timeline

- Week 1: Implement functional native adapter
- Week 2: Create functional date-fns adapter
- Week 3: Update core to support both patterns
- Week 4: Documentation and migration guide

## References

- Current adapter implementation: `/packages/adapter-native/src/index.ts`
- Similar functional approaches: date-fns, dayjs internals
- Performance benchmarks: `/research/benchmarks/adapter-performance.md`
