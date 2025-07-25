# createCustomPeriod

Creates a custom period with arbitrary start and end dates.

## Signature

```typescript
function createCustomPeriod(
  start: Date,
  end: Date
): Period
```

## Parameters

- `start` - `Date` - The start date of the period (inclusive)
- `end` - `Date` - The end date of the period (exclusive)

## Returns

`Period` - A period object with type `'custom'` and the specified date range

## Description

The `createCustomPeriod` function allows you to create periods with arbitrary date ranges that don't conform to standard time units. The reference date is automatically calculated as the midpoint between start and end.

## Basic Usage

```typescript
import { createCustomPeriod } from 'usetemporal'

// Create a Q1 2024 period
const q1_2024 = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-04-01')
)

// Create a project timeline
const projectPeriod = createCustomPeriod(
  new Date('2024-03-15'),
  new Date('2024-06-30')
)

// Use with temporal operations
const temporal = createTemporal({ date: new Date() })
const days = divide(temporal, projectPeriod, 'day')
```

## Reference Date Calculation

The reference date (`date` property) is calculated as:

```typescript
date = new Date((start.getTime() + end.getTime()) / 2)
```

## See Also

- [createPeriod](/api/factory-functions/create-period) - Create standard unit periods
- [toPeriod](/api/factory-functions/to-period) - Convert date to period
- [Period Type](/api/types/period) - Period interface documentation
- [Business Logic Patterns](/guide/patterns/business-logic) - Custom period examples