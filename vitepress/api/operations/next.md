# next

Navigate to the next period of the same type.

## Signature

```typescript
function next(
  temporal: Temporal,
  period: Period
): Period
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `period` - `Period` - The current period to navigate from

## Returns

`Period` - The next period of the same type and duration

## Description

Creates a new period that immediately follows the given period, maintaining the same unit type and duration. For custom periods, the duration is preserved.

## Example

```typescript
const tomorrow = next(temporal, today)
const nextMonth = next(temporal, currentMonth)
```

## See Also

- [previous](/api/operations/previous) - Navigate backward
- [go](/api/operations/go) - Navigate multiple steps
- [Navigation Patterns](/guide/patterns/navigation) - Common navigation patterns