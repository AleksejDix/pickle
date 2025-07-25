# usePeriod

Creates a reactive period that automatically updates based on the temporal instance's browsing state.

## Signature

```typescript
function usePeriod(
  temporal: Temporal, 
  unit: Unit | Ref<Unit>
): ComputedRef<Period>
```

## Parameters

- `temporal` - `Temporal` - The temporal instance
- `unit` - `Unit | Ref<Unit>` - Time unit ('year', 'month', 'week', 'day', etc.)

## Returns

`ComputedRef<Period>` - Reactive period that updates when browsing changes

## Description

Creates a computed period based on the current browsing date and specified unit. The period automatically updates when `temporal.browsing` changes.

## Example

```typescript
const month = usePeriod(temporal, 'month')
const year = usePeriod(temporal, 'year')

// Access current values
console.log(month.value.start)
console.log(year.value.date)
```

## See Also

- [Reactive Time Units](/guide/reactive-time-units) - How reactivity works
- [Period Type](/api/types/period) - Period interface
- [createPeriod](/api/factory-functions/create-period) - Non-reactive alternative