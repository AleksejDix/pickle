# merge

Merge multiple periods into a single larger period.

## Signature

```typescript
function merge(
  temporal: Temporal,
  periods: Period[]
): Period | null
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `periods` - `Period[]` - Array of periods to merge

## Returns

`Period | null` - A merged period, or null if the array is empty

## Description

The `merge` function combines multiple periods into a single period. It intelligently detects when periods form natural units (like 7 days forming a week) and creates the appropriate period type. Otherwise, it creates a custom period spanning from the earliest start to the latest end.

## Basic Usage

```typescript
import { createTemporal, merge, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

// Get all days in a week
const week = toPeriod(temporal, new Date(), 'week')
const days = divide(temporal, week, 'day')

// Merge back into a week
const mergedWeek = merge(temporal, days)
// Result: Period with type 'week'
```

## Natural Unit Detection

The function recognizes these patterns:

| Period Count | Period Type | Result Type | Condition |
|--------------|-------------|-------------|-----------|
| 7 | day | week | Must form complete week |
| 3 | month | quarter | Must be consecutive quarter months |
| Other | any | custom | Always creates custom period |

## See Also

- [divide](/api/operations/divide) - Split periods into smaller units
- [split](/api/operations/split) - Flexible period splitting
- [Time Analysis Patterns](/guide/patterns/time-analysis) - Advanced merging examples
- [Period Type](/api/types/period) - Period interface documentation