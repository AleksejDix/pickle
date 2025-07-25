# go

Navigate forward or backward by multiple periods.

## Signature

```typescript
function go(
  temporal: Temporal,
  period: Period,
  steps: number
): Period
```

## Parameters

- `temporal` - `Temporal` - The temporal instance containing adapter
- `period` - `Period` - The current period to navigate from
- `steps` - `number` - Number of steps to move (positive = forward, negative = backward, 0 = no change)

## Returns

`Period` - A new period moved by the specified number of steps

## Description

Allows navigation by multiple periods in a single operation. It's equivalent to calling `next` or `previous` multiple times but more efficient.

## Example

```typescript
const threeMonthsLater = go(temporal, month, 3)
const weekAgo = go(temporal, today, -7)
const sameMonth = go(temporal, month, 0)
```

## See Also

- [next](/api/operations/next) - Navigate one step forward
- [previous](/api/operations/previous) - Navigate one step backward
- [Navigation Patterns](/guide/patterns/navigation) - Navigation examples and patterns