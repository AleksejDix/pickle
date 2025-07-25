# API Reference

The useTemporal API is organized into the following sections:

## [Factory Functions](/api/factory-functions/)

Core functions for creating temporal instances and periods.

- [`createTemporal`](/api/factory-functions/create-temporal) - Create a temporal instance
- [`createPeriod`](/api/factory-functions/create-period) - Create a period of specific type
- [`createCustomPeriod`](/api/factory-functions/create-custom-period) - Create custom date ranges
- [`toPeriod`](/api/factory-functions/to-period) - Convert date to period

## [Operations](/api/operations/)

Functions for manipulating and working with periods.

### Time Division
- [`divide`](/api/operations/divide) - The signature divide() pattern
- [`split`](/api/operations/split) - Advanced splitting with options
- [`merge`](/api/operations/merge) - Merge periods into larger units

### Navigation
- [`next`](/api/operations/next) - Navigate to next period
- [`previous`](/api/operations/previous) - Navigate to previous period
- [`go`](/api/operations/go) - Navigate by steps

### Comparison
- [`isSame`](/api/operations/is-same) - Check period equality
- [`contains`](/api/operations/contains) - Check containment


## [Utilities](/api/utilities/)

Helper functions for common date operations.

- [`isWeekend`](/api/utilities/is-weekend) - Check if period is weekend
- [`isWeekday`](/api/utilities/is-weekday) - Check if period is weekday
- [`isToday`](/api/utilities/is-today) - Check if period is today

## [Types](/api/types/)

TypeScript type definitions.

- [`Period`](/api/types/period) - Core period interface
- [`Unit`](/api/types/unit) - Time unit types
- [`Temporal`](/api/types/temporal) - Temporal instance type
- [`Adapter`](/api/types/adapter) - Date adapter interface
- [`UnitRegistry`](/api/types/unit-registry) - Unit plugin system types

## [Composables](/api/composables/)

Reactive composables for frameworks.

- [`usePeriod`](/api/composables/use-period) - Create reactive period

## [Unit System](/api/unit-system/)

Plugin system for custom units.

- [`defineUnit`](/api/unit-system/define-unit) - Register custom units
- [`UNITS`](/api/unit-system/constants) - Unit constants
- [`getUnitDefinition`](/api/unit-system/get-unit-definition) - Get unit configuration
- [`hasUnit`](/api/unit-system/has-unit) - Check if unit is registered

## Quick Start

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create temporal instance
const temporal = createTemporal()

// Create reactive periods
const month = usePeriod(temporal, 'month')
const year = usePeriod(temporal, 'year')

// Divide operations
const days = divide(temporal, month.value, 'day')
const months = divide(temporal, year.value, 'month')
```

For a complete guide, see [Getting Started](/guide/getting-started).