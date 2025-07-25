# Operations

Operations are pure functions that work with Period objects to perform time calculations and transformations.

## Time Division Operations

### [divide](/api/operations/divide)
The signature pattern of useTemporal - divide any period into smaller units.

```typescript
const months = divide(temporal, yearPeriod, 'month') // 12 months
const days = divide(temporal, monthPeriod, 'day')    // 28-31 days
```

### [split](/api/operations/split)
Advanced splitting with custom options for unit count or duration.

```typescript
const quarters = split(temporal, yearPeriod, { unit: 'month', count: 3 })
```

### [merge](/api/operations/merge)
Merge multiple periods into a single larger period.

```typescript
const year = merge(temporal, months) // 12 months → 1 year
```

## Navigation Operations

### [next](/api/operations/next)
Navigate to the next period of the same type.

```typescript
const nextMonth = next(monthPeriod, temporal)
```

### [previous](/api/operations/previous)
Navigate to the previous period of the same type.

```typescript
const prevMonth = previous(monthPeriod, temporal)
```

### [go](/api/operations/go)
Navigate forward or backward by a number of steps.

```typescript
const futureMonth = go(monthPeriod, 3, temporal)  // 3 months forward
const pastMonth = go(monthPeriod, -2, temporal)   // 2 months back
```

## Comparison Operations

### [isSame](/api/operations/is-same)
Check if two periods represent the same time unit.

```typescript
const same = isSame(periodA, periodB, 'day')
```

### [contains](/api/operations/contains)
Check if a period contains a date or another period.

```typescript
const isInMonth = contains(monthPeriod, new Date())
```

## Zoom Pattern (Removed Operations)

The zoom operations (`zoomIn`, `zoomOut`, `zoomTo`) have been removed in v2.0.0 to maintain API minimalism. You can achieve the same functionality by composing existing operations:

**Zoom In Pattern:**
```typescript
// Instead of: zoomIn(yearPeriod, 'month')
const months = divide(temporal, yearPeriod, 'month');
const targetMonth = months.find(m => contains(m, yearPeriod.date)) || months[0];
```

**Zoom Out Pattern:**
```typescript
// Instead of: zoomOut(monthPeriod, 'year')
const year = createPeriod(temporal, monthPeriod.date, 'year');
```

See the [migration guide](/guide/migration#zoom-operations) for more details.