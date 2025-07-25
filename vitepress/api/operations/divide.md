# divide()

The revolutionary `divide()` function is the heart of useTemporal's unique time management pattern. It allows you to split any time period into smaller units with perfect synchronization and consistency.

## Syntax

```typescript
function divide(
  temporal: Temporal,
  period: Period,
  unit: Unit
): Period[]
```

## Parameters

### `temporal`

- **Type**: `Temporal`
- **Description**: The temporal instance created by `createTemporal({ date: new Date() })`.

### `period`

- **Type**: `Period`
- **Description**: The period to divide. Can be any period created by `usePeriod()`, navigation operations, or other functions.

```typescript
const monthPeriod = usePeriod(temporal, 'month')
const yearPeriod = usePeriod(temporal, 'year')
const customPeriod = { type: 'custom', start: date1, end: date2, date: date1 }
```

### `unit`

- **Type**: `Unit`
- **Values**: `"year" | "month" | "week" | "day" | "hour" | "minute" | "second"`
- **Description**: The type of units to divide into. Must be smaller than the period's unit.

## Return Value

Returns an array of `Period` objects representing the divisions. Each period:

- Contains all standard properties: `type`, `date`, `start`, `end`
- Can be further divided into smaller units
- Represents a complete, non-overlapping time span

## Division Rules

### Valid Divisions

Common division patterns:

| From | To | Typical Result |
|------|----|----------------|
| year | month | 12 months |
| year | week | 52-53 weeks |
| year | day | 365-366 days |
| month | week | 4-6 weeks |
| month | day | 28-31 days |
| week | day | 7 days |
| day | hour | 24 hours |
| hour | minute | 60 minutes |
| minute | second | 60 seconds |

## Basic Example

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')

// Divide a month into days
const days = divide(temporal, month.value, 'day')
console.log(days.length) // 28-31 depending on month

// Divide a day into hours
const day = usePeriod(temporal, 'day')
const hours = divide(temporal, day.value, 'hour')
console.log(hours.length) // 24
```



## Custom Period Division

divide() works with any period, not just those from `usePeriod()`:

```typescript
// Custom period
const customPeriod: Period = {
  type: 'sprint',
  start: new Date('2024-01-01'),
  end: new Date('2024-01-14'),
  date: new Date('2024-01-01')
}

// Divide custom period into days
const sprintDays = divide(temporal, customPeriod, 'day')
console.log(sprintDays.length) // 14
```

## TypeScript

Full type safety:

```typescript
import type { Temporal, Period, Unit } from 'usetemporal'

// Type-safe division
const month = usePeriod(temporal, 'month')
const days: Period[] = divide(temporal, month.value, 'day')

// TypeScript catches invalid units at compile time
// const invalid = divide(temporal, month.value, 'invalid-unit')
// Error: Argument of type '"invalid-unit"' is not assignable to parameter of type 'Unit'

// Generic helper
function getDaysInPeriod(temporal: Temporal, period: Period): Period[] {
  return divide(temporal, period, 'day')
}
```

## Errors

The function throws errors in these cases:

- `Cannot divide by stableMonth` - Use useStableMonth() instead
- `Cannot divide by custom unit` - Custom periods have arbitrary boundaries  
- `Unit 'X' cannot be divided into 'Y'` - When division is not valid (e.g., dividing day into month)
- `stableMonth can only be divided by 'day' or 'week'` - When trying invalid divisions of stableMonth

The function also has a safety limit of 1000 periods to prevent memory issues.


## See Also

- [createTemporal](/api/factory-functions/create-temporal) - Create a temporal instance
- [usePeriod](/api/composables/use-period) - Create reactive periods
- [divide() Pattern Guide](/guide/divide-pattern) - In-depth usage patterns
- [Calendar Examples](/examples/calendars/calendar-grid) - Calendar implementations
- [Performance Guide](/guide/advanced/performance-optimization) - Optimization tips