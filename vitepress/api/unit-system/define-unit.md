# defineUnit

Register a custom time unit with its behavior.

## Signature

```typescript
function defineUnit(
  type: string,
  definition: UnitDefinition
): void

interface UnitDefinition {
  createPeriod(date: Date, adapter: Adapter): {
    start: Date;
    end: Date;
  };
  validate?(period: { start: Date; end: Date; type: string }): boolean;
  divisions?: string[];
  mergesTo?: string;
}
```

## Parameters

- `type` - `string` - The name of the unit type to register
- `definition` - `UnitDefinition` - Configuration object defining unit behavior

## Description

The `defineUnit` function allows you to register custom time units that define how to create and validate periods. This enables extending useTemporal with domain-specific units like fiscal quarters, sprints, or any other time period relevant to your application.

## Type Declaration

Before using a custom unit, declare it for TypeScript:

```typescript
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'sprint': true
    'fiscal-quarter': true
  }
}
```

## Examples

### Basic Sprint Unit

```typescript
import { defineUnit } from '@usetemporal/core'

// Define a 2-week sprint
defineUnit('sprint', {
  createPeriod(date: Date, adapter: Adapter) {
    // Sprints start on Monday
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    
    const start = new Date(d)
    const end = new Date(d)
    end.setDate(end.getDate() + 13)
    end.setHours(23, 59, 59, 999)
    
    return { start, end }
  },
  
  validate(period) {
    // Ensure it's exactly 14 days
    const days = (period.end.getTime() - period.start.getTime()) / (24 * 60 * 60 * 1000)
    return Math.round(days) === 14
  },
  
  divisions: ['day', 'hour'],
  mergesTo: 'month'
})

// Now use it
const sprint = createPeriod(temporal, 'sprint', new Date())
const nextSprint = next(temporal, sprint)
```

### Fiscal Quarter

```typescript
// Fiscal year starts July 1
defineUnit('fiscal-quarter', {
  createPeriod(date: Date, adapter: Adapter) {
    const d = new Date(date)
    const month = d.getMonth()
    
    // Determine fiscal quarter start
    let quarterStart: number
    if (month >= 6 && month <= 8) quarterStart = 6      // Q1: Jul-Sep
    else if (month >= 9 && month <= 11) quarterStart = 9 // Q2: Oct-Dec
    else if (month >= 0 && month <= 2) quarterStart = 0  // Q3: Jan-Mar
    else quarterStart = 3                                 // Q4: Apr-Jun
    
    const start = new Date(d)
    start.setMonth(quarterStart, 1)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(start)
    end.setMonth(end.getMonth() + 3)
    end.setMilliseconds(-1)
    
    return { start, end }
  },
  
  divisions: ['month', 'week', 'day'],
  mergesTo: 'fiscal-year'
})
```

### Academic Semester

```typescript
defineUnit('semester', {
  createPeriod(date: Date, adapter: Adapter) {
    const d = new Date(date)
    const month = d.getMonth()
    
    const start = new Date(d)
    const end = new Date(d)
    
    if (month >= 7 || month === 0) { // Fall: Aug-Dec
      start.setMonth(7, 15) // August 15
      if (month === 0) start.setFullYear(start.getFullYear() - 1)
      end.setMonth(11, 20) // December 20
      end.setFullYear(start.getFullYear())
    } else { // Spring: Jan-May
      start.setMonth(0, 15) // January 15
      end.setMonth(4, 15) // May 15
    }
    
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    
    return { start, end }
  },
  
  validate(period) {
    // Check if it spans approximately 16 weeks
    const weeks = (period.end.getTime() - period.start.getTime()) / (7 * 24 * 60 * 60 * 1000)
    return weeks >= 15 && weeks <= 17
  },
  
  divisions: ['week', 'day'],
  mergesTo: 'academic-year'
})
```

## Definition Properties

### createPeriod

Defines how to create a normalized period from any date:

```typescript
defineUnit('custom-month', {
  createPeriod(date: Date, adapter: Adapter) {
    // Use adapter for standard operations
    const start = adapter.startOf(date, 'month')
    const end = adapter.endOf(date, 'month')
    return { start, end }
  }
})
```

### validate

Optional validation to ensure a period conforms to unit rules:

```typescript
defineUnit('fortnight', {
  createPeriod(date: Date, adapter: Adapter) {
    const start = adapter.startOf(date, 'week')
    const end = new Date(start)
    end.setDate(end.getDate() + 13)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  },
  
  validate(period) {
    const days = (period.end.getTime() - period.start.getTime()) / (24 * 60 * 60 * 1000)
    return Math.round(days) === 14
  }
})
```

### divisions

Specify what units this can be divided into:

```typescript
defineUnit('quarter', {
  createPeriod(date: Date, adapter: Adapter) {
    // Quarter logic
  },
  divisions: ['month', 'week', 'day'] // Can divide quarter into these units
})
```

### mergesTo

Specify what unit multiple of these merge into:

```typescript
defineUnit('sprint', {
  createPeriod(date: Date, adapter: Adapter) {
    // Sprint logic
  },
  mergesTo: 'quarter' // Multiple sprints can merge into a quarter
})
```

## Usage After Definition

Once defined, custom units work with all operations:

```typescript
// Create periods
const sprint = createPeriod(temporal, 'sprint', date)
const semester = toPeriod(temporal, date, 'semester')

// Navigate
const nextSprint = next(temporal, sprint)
const prevSemester = previous(temporal, semester)

// Divide
const sprintDays = divide(temporal, sprint, 'day') // 14 days
const semesterWeeks = divide(temporal, semester, 'week') // 16 weeks

// Compare
const isSameSprint = isSame(temporal, periodA, periodB, 'sprint')
```

## Best Practices

### 1. Immutability

Always return new Date objects:

```typescript
// ✓ Good
add: (date, value) => {
  const result = new Date(date)
  result.setDate(result.getDate() + value)
  return result
}

// ✗ Bad - mutates input
add: (date, value) => {
  date.setDate(date.getDate() + value)
  return date
}
```

### 2. Consistent Boundaries

Ensure start and end dates are properly calculated:

```typescript
defineUnit('workday', {
  createPeriod(date: Date, adapter: Adapter) {
    const start = new Date(date)
    start.setHours(9, 0, 0, 0) // 9 AM
    
    const end = new Date(date)
    end.setHours(17, 59, 59, 999) // 5:59:59.999 PM
    
    return { start, end }
  }
})
```

### 3. Handle Edge Cases

Consider boundary conditions:

```typescript
defineUnit('month-pair', {
  createPeriod(date: Date, adapter: Adapter) {
    const start = adapter.startOf(date, 'month')
    
    // Add 2 months for the end
    const end = new Date(start)
    end.setMonth(end.getMonth() + 2)
    end.setMilliseconds(-1)
    
    return { start, end }
  },
  
  validate(period) {
    // Ensure it spans exactly 2 months
    const start = new Date(period.start)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 2)
    end.setMilliseconds(-1)
    
    return end.getTime() === period.end.getTime()
  }
})
```

### 4. Document Behavior

Add clear documentation:

```typescript
/**
 * Billing cycle unit - Monthly billing starting on the 15th
 * - Starts: 15th of each month at midnight
 * - Ends: 14th of next month at 23:59:59.999
 * - Duration: Variable (28-31 days)
 * - Used for: Subscription billing, usage tracking
 */
defineUnit('billing-cycle', {
  createPeriod(date: Date, adapter: Adapter) {
    const d = new Date(date)
    
    // Start on the 15th
    const start = new Date(d)
    start.setDate(15)
    start.setHours(0, 0, 0, 0)
    
    // End on the 14th of next month
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    end.setDate(14)
    end.setHours(23, 59, 59, 999)
    
    return { start, end }
  },
  
  divisions: ['day', 'hour'],
  mergesTo: 'year'
})
```

## Error Handling

The function validates inputs:

```typescript
// Unit name must be non-empty
defineUnit('', {}) // Error: Invalid unit name

// Definition must be an object
defineUnit('custom', null) // Error: Invalid definition

// At least one method should be defined
defineUnit('empty', {}) // Warning: Unit has no behavior
```

## See Also

- [UnitRegistry](/api/types/unit-registry) - Type declarations
- [hasUnit](/api/unit-system/has-unit) - Check registration
- [getUnitDefinition](/api/unit-system/get-unit-definition) - Get definition
- [Custom Units Guide](/guide/custom-units) - Complete tutorial