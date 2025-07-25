# Migration Guide: Zoom Operations Removal

## Overview

In v2.0.0, the zoom operations (`zoomIn`, `zoomOut`, `zoomTo`) have been removed to better align with the "Calculus for Time" philosophy. These operations were not fundamental and could be easily composed from existing operations.

## Why Were They Removed?

1. **Not Fundamental**: Each zoom operation was just a thin wrapper around existing operations
2. **Side Effects**: The implementations had impure side effects (mutating `temporal.browsing`)
3. **Philosophy**: They violated our minimalist approach of providing only essential operations
4. **Redundancy**: Users can achieve the same results with existing operations

## Migration Patterns

### Replacing `zoomIn`

**Before:**
```typescript
const monthPeriod = zoomIn(temporal, yearPeriod, 'month');
```

**After:**
```typescript
// Option 1: Get first matching period
const months = divide(temporal, yearPeriod, 'month');
const monthPeriod = months.find(m => contains(m, yearPeriod.date)) || months[0];

// Option 2: Create a helper function
function zoomIn(temporal: Temporal, period: Period, targetUnit: Unit): Period {
  const subPeriods = divide(temporal, period, targetUnit);
  return subPeriods.find(p => contains(p, period.date)) || subPeriods[0];
}
```

### Replacing `zoomOut`

**Before:**
```typescript
const yearPeriod = zoomOut(temporal, monthPeriod, 'year');
```

**After:**
```typescript
// Direct replacement
const yearPeriod = createPeriod(temporal, monthPeriod.date, 'year');

// Or use toPeriod
const yearPeriod = toPeriod(temporal, monthPeriod.date, 'year');
```

### Replacing `zoomTo`

**Before:**
```typescript
const dayPeriod = zoomTo(temporal, monthPeriod, 'day');
```

**After:**
```typescript
// Direct replacement
const dayPeriod = createPeriod(temporal, monthPeriod.date, 'day');

// Or use toPeriod
const dayPeriod = toPeriod(temporal, monthPeriod.date, 'day');
```

## Common Patterns

### Calendar Navigation

```typescript
// Navigate from year view to month view
const year = usePeriod(temporal, 'year');
const months = divide(temporal, year.value, 'month');
const currentMonth = months.find(m => contains(m, temporal.browsing.value.date)) || months[0];

// Navigate from month view to day view
const month = usePeriod(temporal, 'month');
const days = divide(temporal, month.value, 'day');
const today = days.find(d => contains(d, new Date())) || days[0];
```

### Hierarchical Navigation

```typescript
// Create a utility for hierarchical navigation
const unitHierarchy = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'] as const;

function getNextSmallerUnit(unit: Unit): Unit | null {
  const index = unitHierarchy.indexOf(unit as any);
  return index >= 0 && index < unitHierarchy.length - 1 
    ? unitHierarchy[index + 1] 
    : null;
}

function getNextLargerUnit(unit: Unit): Unit | null {
  const index = unitHierarchy.indexOf(unit as any);
  return index > 0 ? unitHierarchy[index - 1] : null;
}

// Zoom in pattern
function zoomInPattern(temporal: Temporal, period: Period): Period | null {
  const smallerUnit = getNextSmallerUnit(period.type);
  if (!smallerUnit) return null;
  
  const subPeriods = divide(temporal, period, smallerUnit);
  return subPeriods.find(p => contains(p, period.date)) || subPeriods[0];
}

// Zoom out pattern
function zoomOutPattern(temporal: Temporal, period: Period): Period | null {
  const largerUnit = getNextLargerUnit(period.type);
  return largerUnit ? createPeriod(temporal, period.date, largerUnit) : null;
}
```

## Benefits of the Change

1. **Smaller Bundle**: ~500 bytes reduction in bundle size
2. **Cleaner API**: Fewer operations to learn and remember
3. **More Flexibility**: Compose your own zoom logic exactly as needed
4. **Pure Functions**: No hidden side effects or mutations

## Need Help?

If you have specific use cases that are difficult to migrate, please open an issue on GitHub and we'll help you find the best pattern for your needs.