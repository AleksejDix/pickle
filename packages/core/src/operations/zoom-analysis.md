# Zoom Operations Analysis

## Current Implementation

### zoomIn(temporal, period, targetUnit)
- Uses `divide()` to get sub-periods
- Finds sub-period containing browsing date
- Falls back to period's date, then first sub-period
- **MUTATES** temporal.browsing indirectly through contains()

### zoomOut(temporal, period, targetUnit)  
- **MUTATES** temporal.browsing.value directly
- Simply calls `createPeriod(temporal, targetUnit, period)`

### zoomTo(temporal, period, targetUnit)
- **MUTATES** temporal.browsing.value directly
- Simply calls `createPeriod(temporal, targetUnit, period)`

## Analysis Against "Calculus for Time" Philosophy

### 1. Are they fundamental operations?

**NO** - All three operations can be expressed as compositions:

```typescript
// zoomIn without mutation
const zoomInPure = (temporal, period, targetUnit) => {
  const subPeriods = divide(temporal, period, targetUnit);
  return subPeriods.find(p => contains(p, period.date)) || subPeriods[0];
};

// zoomOut without mutation
const zoomOutPure = (temporal, period, targetUnit) => {
  return createPeriod(temporal, targetUnit, period);
};

// zoomTo without mutation  
const zoomToPure = (temporal, period, targetUnit) => {
  return createPeriod(temporal, targetUnit, period);
};
```

### 2. Do they violate pure function principles?

**YES** - Current implementations have side effects:
- zoomOut and zoomTo directly mutate `temporal.browsing.value`
- zoomIn indirectly causes mutations through contains()

This violates the library's pure function principle stated in CLAUDE.md.

### 3. Are they providing unique value?

**NO** - They are thin wrappers that:
- zoomOut/zoomTo are nearly identical to createPeriod
- zoomIn is divide + find logic
- All add mutation side effects that break purity

## Recommendation: REMOVE

### Reasons:
1. **Not fundamental** - Easily composed from existing operations
2. **Impure** - Current implementations have side effects
3. **Redundant** - zoomOut/zoomTo duplicate createPeriod functionality
4. **Philosophy violation** - Goes against "Calculus for Time" minimalism
5. **Bundle size** - Removing saves ~1KB (estimated)

### Migration Path:

```typescript
// Before
const zoomed = zoomIn(temporal, yearPeriod, 'month');

// After - Option 1: Direct composition
const months = divide(temporal, yearPeriod, 'month');
const zoomed = months.find(m => contains(m, yearPeriod.date)) || months[0];

// After - Option 2: User-defined helper
const zoomIn = (temporal, period, unit) => {
  const children = divide(temporal, period, unit);
  return children.find(c => contains(c, period.date)) || children[0];
};
```

### User Impact:
- Migration is straightforward
- Patterns are simple to understand
- Removes confusion about side effects
- Aligns with library philosophy

## Decision: REMOVE in v2.0.0

Since we're already at v2.0.0 and these operations violate core principles, they should be removed immediately rather than deprecated.