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
- **Simplified `Unit` type** (fully implemented!)
- **Single composable `usePeriod`** (implemented!)
- **Minimal Temporal interface** with just: adapter, weekStartsOn, browsing, now

❌ **Opportunities Before Release:**

- Mixed operation signatures (some still use TemporalContext vs Temporal)
- Large export surface (but improving)
- Remove deprecated type aliases

## Proposed Simplifications

### 1. ~~Simplify Time Unit Types~~ ✅ IMPLEMENTED

**Status**: The `Unit` type has been fully implemented as proposed. Old types (`TimeUnitKind`, `PeriodType`, `DivideUnit`) are now just aliases for backward compatibility.

**Update**: Based on the latest code review:

- ✅ Adapter interface now uses `Unit` (uses `Exclude<Unit, "custom">`)
- ✅ split.ts now uses `Unit` in SplitOptions interface
- ⏳ Type aliases remain for backward compatibility (can be removed in future)

### 2. ~~Single Composable Pattern~~ ✅ IMPLEMENTED

**Status**: The `usePeriod` composable has been implemented! The individual composables (useYear, useMonth, etc.) are still exported but `usePeriod` provides the unified interface as proposed.

```typescript
import { usePeriod } from "@usetemporal/core";
const year = usePeriod(temporal, "year");
const month = usePeriod(temporal, "month");
const week = usePeriod(temporal, "week");

// Dynamic usage is supported
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

**Current exports (as of latest changes):**

```typescript
// Factory (1)
createTemporal;
CreateTemporalOptions;

// Composables (1 main + legacy)
usePeriod; // New unified composable

// Operations (14)
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

// Types (10)
(Period,
  Unit, // New unified type
  PeriodType, // Deprecated alias for Unit
  Temporal,
  TemporalContext,
  Adapter,
  AdapterOptions,
  Duration,
  TimeUnitKind, // Deprecated alias for Unit
  DivideUnit, // Deprecated alias for Unit
  DateOrRef,
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

- ✅ Keep Period as plain data (no methods, just: start, end, type, date)
- ✅ Keep operations as functions (not methods)
- ✅ Keep adapter pattern (handles complexity well)
- ✅ Keep reactive browsing/now (valuable for UI)
- ✅ No more TimeUnit classes - everything uses Period interface

## Current Core Types

```typescript
// The actual current types in the codebase:
interface Period {
  start: Date;
  end: Date;
  type: Unit;
  date: Date;
}

interface TemporalContext {
  adapter: Adapter;
  weekStartsOn: number; // 0-6 for Sunday-Saturday
}

interface Temporal extends TemporalContext {
  browsing: Ref<Period>;
  now: Ref<Period>;
}

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

## Recommended Changes for v2.0

1. **Already Done** ✅:
   - Unified types to single `Unit` type (complete!)
   - Single `usePeriod` composable (implemented!)
   - Removed rarely used units (millennium, century, decade, millisecond)
   - Updated Adapter to use Unit type
   - No more TimeUnit classes

2. **High Priority** (Complete before Release):
   - Make operation signatures consistent (all use Temporal, not TemporalContext)
   - Remove deprecated type aliases

3. **Medium Priority** (Can wait for v2.1):
   - Remove individual composables (keep only usePeriod)
   - Further API reduction

4. **Low Priority** (Future):
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
