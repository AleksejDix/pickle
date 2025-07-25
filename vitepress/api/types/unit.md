# Unit

Time unit types supported by useTemporal.

## Type Definition

```typescript
type Unit = 
  | 'year'
  | 'quarter' 
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'stableMonth'
  | 'custom'
  | (string & {})  // Extensible for custom units
```

## Description

The `Unit` type represents all possible time units in useTemporal. It includes standard calendar units, special units like `stableMonth`, and is extensible to support custom units through the unit plugin system.

## Standard Units

### Calendar Units

- **`year`** - Calendar year (January 1 to December 31)
- **`quarter`** - Three-month period (Q1: Jan-Mar, Q2: Apr-Jun, etc.)
- **`month`** - Calendar month
- **`week`** - 7-day period (start day configurable via `weekStartsOn`)
- **`day`** - 24-hour period (midnight to midnight)

### Time Units

- **`hour`** - 60-minute period
- **`minute`** - 60-second period  
- **`second`** - Base time unit

### Special Units

- **`stableMonth`** - 6-week calendar grid for consistent month displays
- **`custom`** - Arbitrary date ranges created with `createCustomPeriod`

## Usage Examples

### With Operations

```typescript
// All operations accept Unit type
divide(temporal, yearPeriod, 'month')
split(temporal, yearPeriod, { by: 'week' })
createPeriod(temporal, monthPeriod.date, 'day')
createPeriod(temporal, dayPeriod.date, 'month')
isSame(temporal, periodA, periodB, 'day')
```

### With Factory Functions

```typescript
// Create periods of specific units
createPeriod(temporal, 'year', somePeriod)
toPeriod(temporal, new Date(), 'month')
usePeriod(temporal, 'week')
```

### Type Safety

```typescript
// TypeScript provides autocomplete
const unit: Unit = 'month' // ✓ Valid

// Type errors for invalid units
const invalid: Unit = 'fortnight' // ✗ Type error (unless registered)
```

## Unit Hierarchy

Units have a natural hierarchy from largest to smallest:

```
year
  └── quarter (3 months)
      └── month
          └── week* / stableMonth*
              └── day
                  └── hour
                      └── minute
                          └── second
```

*Note: weeks and stableMonth can overlap month boundaries

## Extensibility

The Unit type is extensible through TypeScript module augmentation:

```typescript
// Register a custom unit
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'fiscal-year': true
    'sprint': true
  }
}

// Now these are valid Unit values
const fiscalYear: Unit = 'fiscal-year' // ✓
const sprint: Unit = 'sprint'           // ✓
```

## Unit Constants

For type safety and better developer experience, use the UNITS constants:

```typescript
import { UNITS } from '@usetemporal/core'

// Use constants instead of strings
divide(temporal, year, UNITS.MONTH)
toPeriod(temporal, date, UNITS.DAY)
```

## Special Unit Behaviors

### StableMonth

The `stableMonth` unit creates a 6-week grid:

```typescript
const stableMonth = createPeriod(temporal, 'stableMonth', period)
// Always returns exactly 42 days (6 weeks)
```

### Custom

The `custom` unit represents arbitrary date ranges:

```typescript
const customPeriod = createCustomPeriod(start, end)
console.log(customPeriod.type) // 'custom'

// Custom periods maintain their duration when navigating
const next = next(temporal, customPeriod)
// Same duration, shifted forward
```

## Unit Validation

Operations validate unit compatibility:

```typescript
// Valid: can divide year into months
divide(temporal, yearPeriod, 'month') // ✓

// Invalid: can't divide day into months
divide(temporal, dayPeriod, 'month') // ✗ Error
```

## Adapter Units

Some units require adapter support:

```typescript
type AdapterUnit = 
  | 'year'
  | 'quarter'
  | 'month' 
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
```

Custom units and `stableMonth` are handled by useTemporal internally.

## See Also

- [UnitRegistry](/api/types/unit-registry) - Unit registration system
- [UNITS Constants](/api/unit-system/constants) - Type-safe unit constants
- [Period Type](/api/types/period) - Period interface
- [Custom Units Guide](/guide/custom-units) - Creating custom units