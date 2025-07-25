# contains

Check if a period contains a date or another period.

## Signature

```typescript
function contains(
  period: Period,
  target: Date | Period
): boolean
```

## Parameters

- `period` - `Period` - The period to check within
- `target` - `Date | Period` - The date or period to check for containment

## Returns

`boolean` - True if the target is fully contained within the period

## Description

The `contains` function determines whether a date or period falls within the boundaries of another period. For dates, it checks if the date falls between the period's start and end (inclusive). For periods, it checks if the entire target period is contained within the source period.

## Basic Usage

```typescript
import { contains, toPeriod, createTemporal } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = toPeriod(temporal, new Date('2024-01-15'), 'month')

// Check if dates are in the month
console.log(contains(month, new Date('2024-01-20')))  // true
console.log(contains(month, new Date('2024-02-01')))  // false
```

## Special Cases

- Boundaries are inclusive (start and end dates are contained)
- A period always contains itself
- Works with full timestamp precision

## See Also

- [isSame](/api/operations/is-same) - Check period equality
- [Time Analysis Patterns](/guide/patterns/time-analysis) - Advanced containment examples
- [Period Type](/api/types/period) - Period interface