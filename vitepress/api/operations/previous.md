# previous

Navigate to the previous period of the same type.

## Signature

```typescript
function previous(
  temporal: Temporal,
  period: Period
): Period
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `period` - `Period` - The current period to navigate from

## Returns

`Period` - The previous period of the same type and duration

## Description

Creates a new period that immediately precedes the given period, maintaining the same unit type and duration. For custom periods, the duration is preserved.

## Example

```typescript
const yesterday = previous(temporal, today)
const lastMonth = previous(temporal, currentMonth)
```

## See Also

- [next](/api/operations/next) - Navigate forward
- [go](/api/operations/go) - Navigate multiple steps
- [Navigation Patterns](/guide/patterns/navigation) - Common navigation patterns