# Adapter

Date adapter interface for integrating different date libraries.

## Type Definition

```typescript
interface Adapter {
  startOf(date: Date, unit: AdapterUnit, weekStartsOn?: WeekDay): Date
  endOf(date: Date, unit: AdapterUnit, weekStartsOn?: WeekDay): Date
  add(date: Date, value: number, unit: AdapterUnit): Date
  diff(start: Date, end: Date, unit: AdapterUnit): number
}

type AdapterUnit = 
  | 'year'
  | 'quarter'
  | 'month'
  | 'week' 
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
```

## Methods

### startOf

Get the start of a time unit.

```typescript
startOf(date: Date, unit: AdapterUnit, weekStartsOn?: WeekDay): Date
```

- **Parameters**:
  - `date` - Reference date
  - `unit` - Time unit to get start of
  - `weekStartsOn` - First day of week (0-6, for week unit only)
- **Returns**: Date at the start of the specified unit

### endOf

Get the end of a time unit.

```typescript
endOf(date: Date, unit: AdapterUnit, weekStartsOn?: WeekDay): Date
```

- **Parameters**:
  - `date` - Reference date
  - `unit` - Time unit to get end of
  - `weekStartsOn` - First day of week (0-6, for week unit only)
- **Returns**: Date at the end of the specified unit

### add

Add time to a date.

```typescript
add(date: Date, value: number, unit: AdapterUnit): Date
```

- **Parameters**:
  - `date` - Starting date
  - `value` - Amount to add (can be negative)
  - `unit` - Unit of time to add
- **Returns**: New date with time added

### diff

Calculate difference between dates.

```typescript
diff(start: Date, end: Date, unit: AdapterUnit): number
```

- **Parameters**:
  - `start` - Start date
  - `end` - End date  
  - `unit` - Unit to measure difference in
- **Returns**: Difference as a number in the specified unit

## Available Adapters

### Native Adapter

Uses JavaScript's built-in Date methods.

```typescript
import { createTemporal } from 'usetemporal'

// Automatically uses native adapter
const temporal = createTemporal({ date: new Date() })
```

### Luxon Adapter

Integration with the Luxon library.

```typescript
import { createTemporal } from '@usetemporal/core'
import { adapter as luxonAdapter } from '@usetemporal/adapter-luxon'

const temporal = createTemporal({
  adapter: luxonAdapter
})
```

### date-fns Adapter

Integration with date-fns library.

```typescript
import { createTemporal } from '@usetemporal/core'
import { adapter as dateFnsAdapter } from '@usetemporal/adapter-date-fns'

const temporal = createTemporal({
  adapter: dateFnsAdapter
})
```

### Temporal API Adapter

Future-proof adapter for the TC39 Temporal proposal.

```typescript
import { createTemporal } from '@usetemporal/core'
import { adapter as temporalAdapter } from '@usetemporal/adapter-temporal'

const temporal = createTemporal({
  adapter: temporalAdapter
})
```

## Implementation Example

Here's how to implement a custom adapter:

```typescript
const customAdapter: Adapter = {
  startOf(date: Date, unit: AdapterUnit, weekStartsOn = 0): Date {
    const d = new Date(date)
    
    switch (unit) {
      case 'year':
        d.setMonth(0, 1)
        d.setHours(0, 0, 0, 0)
        break
      case 'month':
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        break
      case 'day':
        d.setHours(0, 0, 0, 0)
        break
      // ... other units
    }
    
    return d
  },
  
  endOf(date: Date, unit: AdapterUnit, weekStartsOn = 0): Date {
    // Implementation
  },
  
  add(date: Date, value: number, unit: AdapterUnit): Date {
    const d = new Date(date)
    
    switch (unit) {
      case 'year':
        d.setFullYear(d.getFullYear() + value)
        break
      case 'month':
        d.setMonth(d.getMonth() + value)
        break
      // ... other units
    }
    
    return d
  },
  
  diff(start: Date, end: Date, unit: AdapterUnit): number {
    // Implementation
  }
}
```

## Usage in Operations

Adapters are used internally by all temporal operations:

```typescript
// These operations use the adapter internally
const period = createPeriod(temporal, 'month', date)
// Uses adapter.startOf() and adapter.endOf()

const nextMonth = next(temporal, period)  
// Uses adapter.add()

const daysBetween = diff(temporal, periodA, periodB, 'day')
// Uses adapter.diff()
```

## Adapter Requirements

### Immutability

Adapters must never mutate input dates:

```typescript
// ✓ Good - creates new date
add(date: Date, value: number, unit: AdapterUnit): Date {
  const result = new Date(date)
  // modify result
  return result
}

// ✗ Bad - mutates input
add(date: Date, value: number, unit: AdapterUnit): Date {
  date.setMonth(date.getMonth() + value) // Don't do this!
  return date
}
```

### Consistency

All methods must handle edge cases consistently:

```typescript
// Month boundaries
startOf(new Date('2024-01-31'), 'month') // 2024-01-01
endOf(new Date('2024-02-15'), 'month')   // 2024-02-29 (leap year)

// Week boundaries respect weekStartsOn
startOf(date, 'week', 0) // Sunday start
startOf(date, 'week', 1) // Monday start
```

### Precision

Methods should maintain appropriate precision:

```typescript
// startOf should zero out smaller units
startOf(new Date('2024-03-15T14:30:45.123'), 'day')
// Returns: 2024-03-15T00:00:00.000

// endOf should maximize smaller units  
endOf(new Date('2024-03-15T14:30:45.123'), 'day')
// Returns: 2024-03-15T23:59:59.999
```

## Performance Considerations

1. **Caching**: Adapters can cache frequently used calculations
2. **Lazy Loading**: Heavy date libraries can be lazy loaded
3. **Native Performance**: Native adapter is fastest for simple operations

## Testing Adapters

```typescript
// Test adapter implementation
function testAdapter(adapter: Adapter) {
  const date = new Date('2024-03-15T10:30:00')
  
  // Test startOf
  expect(adapter.startOf(date, 'day')).toEqual(
    new Date('2024-03-15T00:00:00')
  )
  
  // Test endOf
  expect(adapter.endOf(date, 'day')).toEqual(
    new Date('2024-03-15T23:59:59.999')
  )
  
  // Test add
  expect(adapter.add(date, 1, 'month')).toEqual(
    new Date('2024-04-15T10:30:00')
  )
  
  // Test diff
  const later = new Date('2024-04-15T10:30:00')
  expect(adapter.diff(date, later, 'day')).toBe(31)
}
```

## See Also

- [Temporal](/api/types/temporal) - Temporal instance
- [Date Adapters Guide](/guide/adapters) - Choosing adapters
- [Native Adapter](/packages/adapter-native) - Default adapter
- [Creating Custom Adapters](/guide/custom-adapters) - Advanced guide