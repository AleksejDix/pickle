# RFC 014: API Simplification Before v2.0 Release

**Status: PROPOSED** - For consideration before initial v2.0 release

## Summary

This RFC proposes significant simplifications to the useTemporal API surface to reduce complexity, improve developer experience, and create a more cohesive mental model. The goal is to reduce the API from 30+ exports to approximately 10-15, while maintaining all functionality.

## Motivation

The Period-centric architecture is a significant improvement, but since we haven't released v2.0 yet, we have an opportunity to simplify the API further before the initial release:

1. **Type proliferation**: `TimeUnitKind` (14 types) including rarely used units
2. **Multiple composables**: 9 separate composables (`useYear`, `useMonth`, etc.)
3. **Mixed operation signatures**: Some operations use (context, period), others use (temporal, period)
4. **Large API surface**: 30+ exports when fewer would suffice

## Current State (Pre-release)

The Period-centric architecture has already implemented many good design principles:

✅ **Already Implemented:**

- Period as plain data structure (no methods)
- Operations as pure functions
- Simplified Period interface (no `number` field)
- Functional architecture throughout

❌ **Opportunities Before Release:**

- 14 time unit types (including rarely used ones)
- 9 separate composables
- Mixed operation signatures
- 30+ exports

## Proposed Simplifications

### 1. Simplify Time Unit Types

**Current:**

```typescript
type TimeUnitKind =
  | "millennium"
  | "century"
  | "decade"
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "stableMonth";
type PeriodType =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "quarter"
  | "stableMonth"
  | "custom";
type DivideUnit = TimeUnitKind | "stableMonth";
```

**Proposed:**

```typescript
type Unit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "quarter"
  | "stableMonth"
  | "custom";
```

Benefits:

- Single type for all time units (no confusing distinctions)
- Remove rarely used units: `millennium`, `century`, `decade`, `millisecond`
- No more overlapping types (TimeUnitKind vs PeriodType vs DivideUnit)

### 2. Single Composable Pattern

**Current:**

```typescript
import { useYear, useMonth, useWeek, useDay } from "@usetemporal/core";
const year = useYear(temporal);
const month = useMonth(temporal);
const week = useWeek(temporal);
```

**Proposed:**

```typescript
import { usePeriod } from "@usetemporal/core";
const year = usePeriod(temporal, "year");
const month = usePeriod(temporal, "month");
const week = usePeriod(temporal, "week");

// Enables dynamic usage
const unit = ref("month");
const period = usePeriod(temporal, unit);
```

### 3. Consistent Operation Signatures

**Current (Mixed):**

```typescript
// Some use (context, period)
divide(context: TemporalContext, period: Period, unit: DivideUnit): Period[]
next(context: TemporalContext, period: Period): Period
go(context: TemporalContext, period: Period, steps: number): Period

// Some use (temporal, period)
merge(temporal: Temporal, periods: Period[]): Period
split(temporal: Temporal, period: Period, options: SplitOptions): Period[]
zoomIn(temporal: Temporal, period: Period, unit: DivideUnit): Period[]
```

**Proposed (Consistent):**

```typescript
// All operations use same pattern: (temporal, ...args)
divide(temporal: Temporal, period: Period, unit: Unit): Period[]
next(temporal: Temporal, period: Period): Period
go(temporal: Temporal, period: Period, steps: number): Period
merge(temporal: Temporal, periods: Period[]): Period
split(temporal: Temporal, period: Period, options: SplitOptions): Period[]
```

**Current exports (30+):**

```typescript
// Factory
createTemporal;

// 9 Composables
(useYear,
  useMonth,
  useWeek,
  useDay,
  useHour,
  useMinute,
  useSecond,
  useQuarter,
  useStableMonth);

// 14 Operations
(divide,
  next,
  previous,
  go,
  contains,
  zoomIn,
  zoomOut,
  zoomTo,
  createPeriod,
  split,
  merge,
  createCustomPeriod,
  isSame,
  toPeriod);

// 8+ Types
(Period,
  PeriodType,
  Temporal,
  TemporalContext,
  Adapter,
  AdapterOptions,
  Duration,
  TimeUnitKind,
  SplitOptions);
```

**Proposed exports (~15):**

```typescript
// Core factory
export function createTemporal(options): Temporal;

// Single composable
export function usePeriod(temporal, unit): ComputedRef<Period>;

// Core operations (10)
export function createPeriod(temporal, date, unit): Period;
export function toPeriod(temporal, date, unit): Period;
export function divide(temporal, period, unit): Period[];
export function split(temporal, period, options): Period[];
export function merge(temporal, periods): Period;
export function next(temporal, period): Period;
export function previous(temporal, period): Period;
export function go(temporal, period, steps): Period;
export function contains(period, target): boolean;
export function isSame(temporal, a, b, unit): boolean;

// Types (5)
export type { Period, Temporal, Unit, Adapter, SplitOptions };
```

## Benefits

1. **50% Fewer Exports**: From 30+ to ~15
2. **Single Composable**: Learn one pattern instead of 9
3. **Consistent API**: All operations follow same signature pattern
4. **Simpler Types**: Fewer overlapping type definitions
5. **Better Tree-shaking**: Import only what you need

## Implementation Timeline

Since v2.0 hasn't been released yet:

1. **Option A - Implement Now**: Make these changes before v2.0 release
   - Pro: Start with the cleanest API
   - Con: Delays release

2. **Option B - Release Current, Plan for v2.1**:
   - Pro: Ship sooner
   - Con: Breaking changes soon after release

3. **Option C - Partial Implementation**:
   - Implement consistent signatures now
   - Defer single composable to v2.1
   - Remove unused types now

## Example Usage Comparison

**Current (Pre-release):**

```typescript
import { createTemporal, useYear, useMonth, divide } from "@usetemporal/core";

const temporal = createTemporal({ date: new Date() });
const year = useYear(temporal);
const month = useMonth(temporal);
const days = divide(temporal, month.value, "day");
```

**Proposed (v2.0 with simplifications):**

```typescript
import { createTemporal, usePeriod, divide } from "@usetemporal/core";

const temporal = createTemporal({ date: new Date() });
const year = usePeriod(temporal, "year");
const month = usePeriod(temporal, "month");
const days = divide(temporal, month.value, "day");
```

## Key Decisions

1. **Simplify Before Release**: Take advantage of pre-release flexibility
2. **Focus on High-Impact Changes**: Single composable, consistent signatures, unified types
3. **Keep What Works**: Functional architecture, Period-centric approach

## What NOT to Change

Based on current implementation success:

- ✅ Keep Period as plain data (no methods)
- ✅ Keep operations as functions (not methods)
- ✅ Keep adapter pattern (handles complexity well)
- ✅ Keep reactive browsing/now (valuable for UI)

## Recommended Changes for v2.0

1. **High Priority** (Before Release):
   - Unify types to single `Unit` type
   - Make operation signatures consistent
   - Remove rarely used units

2. **Medium Priority** (Can wait for v2.1):
   - Single `usePeriod` composable
   - Further API reduction

3. **Low Priority** (Future):
   - Additional simplifications based on user feedback

## Next Steps

1. Decide which changes to implement before v2.0
2. Prototype high-priority changes
3. Update implementation
4. Prepare for initial release

## References

- Current implementation: `/packages/core/src/`
- Period interface without `number`: Already implemented
- Functional operations: Already implemented
- Mixed signatures: Needs fixing before release
