# createPeriod

Creates a period of a specific unit type using another period's date as reference.

## Signature

```typescript
function createPeriod(
  temporal: Temporal,
  type: Unit,
  period: Period
): Period
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter and configuration
- `type` - `Unit` - The unit type to create (`'year'`, `'month'`, `'week'`, `'day'`, etc.)
- `period` - `Period` - Reference period whose date will be used

## Returns

`Period` - A new period of the specified type containing the reference date

## Description

Creates a new period of the specified unit type, using the date from the provided period as a reference point. Useful for converting between different time units.

## Example

```typescript
const yearPeriod = createPeriod(temporal, 'year', monthPeriod)
const dayPeriod = createPeriod(temporal, 'day', monthPeriod)
```

## See Also

- [toPeriod](/api/factory-functions/to-period) - Create period from a Date
- [usePeriod](/api/composables/use-period) - Create reactive periods
- [Period Type](/api/types/period) - Period interface