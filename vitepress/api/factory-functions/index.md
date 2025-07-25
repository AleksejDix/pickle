# Factory Functions

Factory functions are used to create temporal instances and period objects.

## Core Factory Functions

### [createTemporal](/api/factory-functions/create-temporal)
Creates a new temporal instance with date adapter and configuration.

```typescript
const temporal = createTemporal({
  adapter: nativeAdapter,
  weekStartsOn: 1 // Monday
})
```

### [createPeriod](/api/factory-functions/create-period)
Creates a period of a specific unit type from a date.

```typescript
const monthPeriod = createPeriod(temporal, new Date(), 'month')
```

### [createCustomPeriod](/api/factory-functions/create-custom-period)
Creates a custom period with arbitrary start and end dates.

```typescript
const customPeriod = createCustomPeriod(
  temporal,
  new Date('2024-01-01'),
  new Date('2024-03-31')
)
```

### [toPeriod](/api/factory-functions/to-period)
Converts a date to a period of the specified unit type.

```typescript
const dayPeriod = toPeriod(new Date(), 'day', temporal)
```

## Usage Examples

```typescript
import { 
  createTemporal, 
  createPeriod, 
  createCustomPeriod,
  toPeriod 
} from 'usetemporal'

// Create temporal instance
const temporal = createTemporal()

// Create different types of periods
const yearPeriod = createPeriod(temporal, new Date(), 'year')
const monthPeriod = toPeriod(new Date(), 'month', temporal)
const customRange = createCustomPeriod(
  temporal,
  new Date('2024-01-01'),
  new Date('2024-12-31')
)
```