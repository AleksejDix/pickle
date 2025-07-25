# toPeriod

Converts a date to a period of a specific unit type.

## Signature

```typescript
function toPeriod(
  temporal: Temporal,
  date: Date,
  type?: Unit
): Period
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter and configuration
- `date` - `Date` - The date to convert into a period
- `type` - `Unit` (optional) - The unit type to create. Defaults to `'day'`

## Returns

`Period` - A period of the specified type containing the given date

## Description

The `toPeriod` function is a convenience method that converts a JavaScript Date object into a Period of the specified unit type. It's one of the most commonly used functions for creating periods from dates.

## Basic Usage

```typescript
import { createTemporal, toPeriod } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const now = new Date()

// Create a day period (default)
const today = toPeriod(temporal, now)

// Create a month period
const currentMonth = toPeriod(temporal, now, 'month')

// Create a year period  
const currentYear = toPeriod(temporal, now, 'year')

// Navigate to a specific date
const targetDate = new Date('2024-12-25')
temporal.browsing.value = toPeriod(temporal, targetDate, 'month')
```

## Default Behavior

When the `type` parameter is omitted, `toPeriod` creates a day period:

```typescript
const period = toPeriod(temporal, new Date())
// Equivalent to:
const period = toPeriod(temporal, new Date(), 'day')
```

## See Also

- [createPeriod](/api/factory-functions/create-period) - Create period from another period
- [createCustomPeriod](/api/factory-functions/create-custom-period) - Create arbitrary date ranges
- [Unit Types](/api/types/unit) - Available unit types
- [Navigation Patterns](/guide/patterns/navigation) - Navigation examples