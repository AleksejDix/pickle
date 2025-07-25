# isSame

Check if two periods represent the same time unit.

## Signature

```typescript
function isSame(
  temporal: Temporal,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: Unit
): boolean
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `a` - `Period | null | undefined` - First period to compare
- `b` - `Period | null | undefined` - Second period to compare  
- `unit` - `Unit` - The unit level to compare at

## Returns

`boolean` - True if both periods represent the same unit, false otherwise

## Description

The `isSame` function compares two periods at a specific unit level. It uses the reference dates of the periods to determine if they fall within the same time unit. This is useful for checking if two dates are in the same day, month, year, etc.

## Basic Usage

```typescript
import { createTemporal, isSame, toPeriod } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

// Check if two dates are in the same month
const date1 = new Date('2024-01-15')
const date2 = new Date('2024-01-30')

const period1 = toPeriod(temporal, date1, 'day')
const period2 = toPeriod(temporal, date2, 'day')

console.log(isSame(temporal, period1, period2, 'month')) // true
console.log(isSame(temporal, period1, period2, 'day'))   // false
```

## Special Cases

- Returns `false` for null/undefined values
- For custom periods, compares reference dates
- For stableMonth, checks if in same stable month grid

## See Also

- [contains](/api/operations/contains) - Check if period contains a date
- [isToday](/api/utilities/is-today) - Check if period is today
- [Navigation Patterns](/guide/patterns/navigation) - Using isSame in navigation