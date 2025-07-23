# API Decision Matrix

## Scoring Criteria

- **Developer Experience (DX)**: 0-10 (How intuitive/pleasant to use)
- **Performance Impact**: 0-10 (10 = no impact, 0 = significant impact)
- **Breaking Change**: 0-10 (10 = non-breaking, 0 = major breaking)
- **Implementation Effort**: 0-10 (10 = trivial, 0 = complex)
- **Maintenance Burden**: 0-10 (10 = low maintenance, 0 = high)
- **Tree-shakability**: 0-10 (10 = perfect tree-shaking, 0 = none)
- **Vue Philosophy**: 0-10 (10 = perfect alignment, 0 = opposite)

## Decision Matrix (Updated with Vue.js Philosophy)

| Change                                    | DX  | Perf | Break | Effort | Maint | Tree | Vue | Total     | Decision       |
| ----------------------------------------- | --- | ---- | ----- | ------ | ----- | ---- | --- | --------- | -------------- |
| **1. Auto-detect adapter**                | 8   | 8    | 10    | 7      | 6     | 8    | 3   | **50/70** | ❌ Against Vue |
| **2A. Direct properties (temporal.year)** | 9   | 6    | 2     | 4      | 5     | 2    | 2   | **30/70** | ❌ Skip        |
| **2B. Keep current (periods.year)**       | 7   | 10   | 10    | 10     | 10    | 10   | 10  | **67/70** | ✅ Keep        |
| **3A. Functional nav (next, previous)**   | 9   | 10   | 10    | 9      | 9     | 10   | 10  | **67/70** | ✅ DONE        |
| **3B. go(n) as function**                 | 7   | 10   | 10    | 9      | 9     | 10   | 10  | **65/70** | ✅ DONE        |
| **4A. Direct property (year.months)**     | 10  | 5    | 3     | 3      | 4     | 2    | 2   | **29/70** | ❌ Skip        |
| **4B. Standalone divide function**        | 8   | 9    | 10    | 8      | 8     | 10   | 10  | **63/70** | ✅ Implement   |
| **5. Utility functions (goto/select)**    | 8   | 10   | 10    | 8      | 8     | 10   | 10  | **64/70** | ✅ Implement   |
| **6. Type constants**                     | 9   | 10   | 10    | 9      | 9     | 10   | 8   | **65/70** | ✅ Implement   |
| **7. weekStartsOn config**                | 9   | 10   | 10    | 8      | 9     | 10   | 9   | **65/70** | ✅ DONE        |

## Detailed Analysis

### 🏆 Winners (Score > 40)

#### **Type-safe units (47/50)** & **next/previous (47/50)**

- No downsides identified
- Purely additive improvements
- Industry standard patterns

#### **go(n) method (45/50)**

- Complements next/previous
- Enables multi-step navigation
- Familiar from router APIs

#### **State methods (44/50)**

- Non-breaking additions
- Cleaner than .value assignment
- Can coexist with reactive refs

### ⚖️ Borderline (Score 35-40)

#### **Auto-detect adapter (39/50)**

- Main concern: Hidden behavior
- Solution: Add console.info() in dev mode
- Worth implementing with clear documentation

#### **year.divide() method (40/50)**

- Slight breaking change if removing temporal.divide
- Solution: Keep both, deprecate temporal.divide later

### ❌ Rejected (Score < 35)

#### **Direct properties everywhere (26/50 & 25/50)**

- Major breaking changes
- Performance concerns with lazy evaluation
- Current composable pattern is more flexible

## Implementation Roadmap

### Phase 1: Non-breaking Additions (v2.1) ✅ PARTIALLY COMPLETE

```typescript
// ✅ DONE: Navigation methods
year.next()     // alias for future()
year.previous() // alias for past()
year.go(2)      // skip multiple
import { next, previous, go } from '@usetemporal/core'

// TODO: Type-safe units
export const units = { year: 'year', month: 'month', ... } as const

// TODO: State management helpers
temporal.goto(date)   // sets browsing
temporal.select(date) // sets picked
temporal.today()      // goto now
```

### Phase 2: Enhanced Patterns (v2.2)

```typescript
// 4. Unit-based divide
year.divide("month"); // in addition to temporal.divide()

// 5. Auto-detection with logging
createTemporal(); // logs: "Using NativeDateAdapter"
```

### Phase 3: Deprecations (v3.0)

```typescript
// Deprecate but don't remove:
year.future(); // "Use year.next() instead"
year.past(); // "Use year.previous() instead"
```

## Code Impact Analysis

### Current code that stays the same:

```typescript
const temporal = createTemporal({ dateAdapter });
const year = periods.year(temporal);
year.number.value;
year.period.value;
```

### New optional patterns:

```typescript
const temporal = createTemporal(); // auto-detect
temporal.goto("2024-01-15");
year.next();
year.divide(units.month); // or year.divide('month')
```

## User Study References

Based on analysis of popular date libraries on npm:

| Pattern         | Libraries Using It         | Weekly Downloads |
| --------------- | -------------------------- | ---------------- |
| next/previous   | FullCalendar, Big Calendar | 2.5M combined    |
| Property access | Luxon, Temporal polyfill   | 8M combined      |
| Method chaining | Moment, Day.js             | 25M combined     |
| Functional      | date-fns                   | 20M              |

## Vue.js-Inspired API Design

### Current API (Already Good)

```typescript
import { createTemporal, periods } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = periods.year(temporal);
const months = temporal.divide(year, "month");
```

### Enhanced API (Vue Philosophy)

```typescript
// Small, focused imports - each function does ONE thing
import { createTemporal } from "@usetemporal/core";
import { year, month, day } from "@usetemporal/core/periods";
import { divide } from "@usetemporal/core/divide";
import { next, previous, go } from "@usetemporal/core/navigation";
import { goto, select } from "@usetemporal/core/temporal";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Explicit composition
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const currentYear = year(temporal);
const months = divide(currentYear, "month");

// Simple, focused operations
next(currentYear);
previous(currentYear);
go(currentYear, 2);

// Temporal state management
goto(temporal, "2024-01-15");
select(temporal, new Date());
```

### Why This Is Better

| Aspect              | Current              | Vue-Inspired   | Benefit                                 |
| ------------------- | -------------------- | -------------- | --------------------------------------- |
| **Imports**         | `periods.year`       | `year`         | Cleaner, direct imports                 |
| **Tree-shaking**    | Good                 | Perfect        | Only import what you use                |
| **Testability**     | Good                 | Excellent      | Test individual functions               |
| **Discoverability** | Via `periods` object | Direct imports | IDE shows all available functions       |
| **Complexity**      | Low                  | Very Low       | Each function has single responsibility |

### Implementation Example

```typescript
// packages/core/src/periods/index.ts
export { year } from "./year";
export { month } from "./month";
export { week } from "./week";
export { day } from "./day";
export { hour } from "./hour";
export { minute } from "./minute";
export { second } from "./second";
export { quarter } from "./quarter";

// packages/core/src/periods/year.ts
export function year(temporal: TemporalCore): TimeUnit {
  return createPeriod("year", (date) => date.getFullYear())({
    now: temporal.now,
    browsing: temporal.browsing,
    adapter: temporal.adapter,
  });
}

// packages/core/src/navigation/index.ts
export function next(unit: TimeUnit): void {
  unit.future();
}

export function previous(unit: TimeUnit): void {
  unit.past();
}

export function go(unit: TimeUnit, steps: number): void {
  if (steps > 0) {
    for (let i = 0; i < steps; i++) unit.future();
  } else {
    for (let i = 0; i < Math.abs(steps); i++) unit.past();
  }
}
```

## Final Recommendations

Based on Vue.js philosophy and objective scoring:

### ✅ **Implemented** (Scores > 60/70)

1. **Keep current composable pattern** (67/70) - Already perfect
2. **Functional navigation** (67/70) - ✅ DONE - next(), previous(), go()
3. **go() function** (65/70) - ✅ DONE - Flexible navigation
4. **weekStartsOn configuration** (65/70) - ✅ DONE - International week support

### 📋 **To Implement** (Scores > 60/70)

5. **Type constants** (65/70) - For better DX
6. **Utility functions** (64/70) - goto, select, etc.
7. **Standalone divide** (63/70) - Tree-shakable

### ❌ **Skip** (Scores < 50/70)

1. **Auto-detect adapter** (50/70) - Hidden magic, against Vue philosophy
2. **Direct properties** (30/70) - Hurts tree-shaking
3. **Property access** (29/70) - Not composable

The data strongly supports a functional, composable API that prioritizes:

- Small, focused functions
- Explicit over implicit
- Tree-shakability
- Simplicity
- No hidden magic

This aligns perfectly with Vue 3's Composition API philosophy while maintaining the library's unique divide() pattern.
