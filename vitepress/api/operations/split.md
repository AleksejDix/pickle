# split

Split a period into smaller units with flexible options.

## Signature

```typescript
function split(
  temporal: Temporal,
  period: Period,
  options: SplitOptions
): Period[]

interface SplitOptions {
  by?: Unit                    // Split by specific unit type
  count?: number              // Split into N equal parts
  duration?: {                // Split by duration intervals
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
  }
}
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `period` - `Period` - The period to split
- `options` - `SplitOptions` - Options controlling how to split

## Returns

`Period[]` - Array of periods resulting from the split

## Description

The `split` function provides flexible ways to divide a period into smaller parts. Unlike `divide` which always splits by a specific unit, `split` offers three different approaches:

1. **By unit** - Same as `divide`, splits into standard units
2. **By count** - Splits into N equal parts
3. **By duration** - Splits into chunks of specific duration

## Basic Usage

```typescript
import { createTemporal, split } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const year = toPeriod(temporal, new Date(), 'year')

// Split by unit
const months = split(temporal, year, { by: 'month' })

// Split by count
const quarters = split(temporal, year, { count: 4 })

// Split by duration
const bimonthly = split(temporal, year, { duration: { months: 2 } })
```

## See Also

- [divide](/api/operations/divide) - Split by standard units
- [merge](/api/operations/merge) - Combine periods
- [Time Analysis Patterns](/guide/patterns/time-analysis) - Advanced splitting examples
- [Business Logic Patterns](/guide/patterns/business-logic) - Time slot examples