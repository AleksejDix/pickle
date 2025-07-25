# UnitRegistry

Registry system for managing time unit definitions.

## Type Definition

```typescript
interface UnitRegistry {
  [key: string]: true
}

interface UnitDefinition {
  adapter?: boolean
  getDuration?: (start: Date, end: Date) => number
  add?: (date: Date, value: number) => Date
  startOf?: (date: Date, weekStartsOn?: WeekDay) => Date
  endOf?: (date: Date, weekStartsOn?: WeekDay) => Date
}

// Internal registry type
type UnitDefinitions = Map<Unit, UnitDefinition>
```

## Description

The UnitRegistry provides a type-safe, extensible system for registering and managing time units. It works in conjunction with TypeScript's module augmentation to provide compile-time type safety for custom units.

## Built-in Units

The following units are pre-registered:

```typescript
// Standard calendar units
'year' | 'quarter' | 'month' | 'week' | 'day'

// Time units  
'hour' | 'minute' | 'second'

// Special units
'stableMonth' | 'custom'
```

## Extending the Registry

### TypeScript Module Augmentation

Register custom units for type safety:

```typescript
// In your application code or type definitions
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'fiscal-year': true
    'sprint': true
    'fortnight': true
  }
}

// Now these are valid Unit types
const fiscalYear: Unit = 'fiscal-year' // ✓
const sprint: Unit = 'sprint'           // ✓
```

### Runtime Registration

Define custom unit behavior:

```typescript
import { defineUnit } from '@usetemporal/core'

// Define a two-week sprint unit
defineUnit('sprint', {
  getDuration: () => 14 * 24 * 60 * 60 * 1000, // 14 days in ms
  add: (date, value) => {
    const d = new Date(date)
    d.setDate(d.getDate() + value * 14)
    return d
  },
  startOf: (date) => {
    // Sprint starts on Monday
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
  },
  endOf: (date) => {
    // Sprint ends 13 days after start
    const start = defineUnit.get('sprint')!.startOf!(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 13)
    end.setHours(23, 59, 59, 999)
    return end
  }
})
```

## Unit Definition Properties

### adapter

Indicates if the unit requires adapter support.

```typescript
defineUnit('custom-month', {
  adapter: true // Uses temporal.adapter for calculations
})
```

### getDuration

Returns the duration of the unit in milliseconds.

```typescript
defineUnit('fortnight', {
  getDuration: () => 14 * 24 * 60 * 60 * 1000 // 14 days
})
```

### add

Adds a number of units to a date.

```typescript
defineUnit('quarter', {
  add: (date, value) => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + value * 3)
    return d
  }
})
```

### startOf / endOf

Get boundaries of the unit.

```typescript
defineUnit('fiscal-year', {
  startOf: (date) => {
    const d = new Date(date)
    // Fiscal year starts April 1
    if (d.getMonth() < 3) {
      d.setFullYear(d.getFullYear() - 1)
    }
    d.setMonth(3, 1) // April 1
    d.setHours(0, 0, 0, 0)
    return d
  },
  endOf: (date) => {
    const start = /* get fiscal year start */
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    end.setMilliseconds(-1)
    return end
  }
})
```

## Usage Examples

### Checking Registration

```typescript
import { hasUnit } from '@usetemporal/core'

// Check if a unit is registered
if (hasUnit('sprint')) {
  const sprintPeriod = createPeriod(temporal, 'sprint', date)
}
```

### Getting Unit Definition

```typescript
import { getUnitDefinition } from '@usetemporal/core'

const sprintDef = getUnitDefinition('sprint')
if (sprintDef?.getDuration) {
  const duration = sprintDef.getDuration(start, end)
  console.log(`Sprint duration: ${duration}ms`)
}
```

### Creating Domain-Specific Units

```typescript
// Academic calendar units
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'semester': true
    'academic-year': true
    'course-week': true
  }
}

defineUnit('semester', {
  getDuration: () => 16 * 7 * 24 * 60 * 60 * 1000, // 16 weeks
  startOf: (date) => {
    // Fall: August 15, Spring: January 15
    const d = new Date(date)
    const month = d.getMonth()
    if (month >= 7) { // Fall semester
      d.setMonth(7, 15)
    } else { // Spring semester  
      d.setMonth(0, 15)
    }
    d.setHours(0, 0, 0, 0)
    return d
  }
})
```

## Integration with Operations

Custom units work seamlessly with all operations:

```typescript
// After registering 'sprint' unit
const sprint = createPeriod(temporal, 'sprint', date)
const nextSprint = next(temporal, sprint)
const sprintDays = divide(temporal, sprint, 'day') // 14 days

// Custom units in navigation
temporal.browsing.value = toPeriod(temporal, date, 'sprint')
```

## Best Practices

### Type-First Registration

Always declare types before runtime registration:

```typescript
// 1. First, declare the type
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'billing-period': true
  }
}

// 2. Then, define the behavior
defineUnit('billing-period', {
  // ... implementation
})
```

### Consistent Behavior

Custom units should follow standard patterns:

```typescript
defineUnit('custom-week', {
  // Consistent with built-in week
  getDuration: () => 7 * 24 * 60 * 60 * 1000,
  
  // Respect weekStartsOn parameter
  startOf: (date, weekStartsOn = 0) => {
    // Implementation respecting weekStartsOn
  }
})
```

### Documentation

Document custom units for team members:

```typescript
/**
 * Sprint unit - 2-week development cycle
 * Starts on Monday, ends on Sunday of second week
 * Used for: Sprint planning, velocity tracking
 */
defineUnit('sprint', {
  // ... implementation
})
```

## Registry Access

The registry is accessible via the temporal instance:

```typescript
const temporal = createTemporal({ date: new Date() })

// TypeScript knows about all registered units
const units: UnitRegistry = temporal.units

// Runtime checks
if ('sprint' in temporal.units) {
  // Sprint is available
}
```

## See Also

- [defineUnit](/api/unit-system/define-unit) - Define custom units
- [hasUnit](/api/unit-system/has-unit) - Check unit registration
- [getUnitDefinition](/api/unit-system/get-unit-definition) - Get unit config
- [Unit](/api/types/unit) - Unit type
- [Custom Units Guide](/guide/custom-units) - Tutorial