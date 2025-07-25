# Unit Constants

Type-safe constants for all available time units.

## Import

```typescript
import { UNITS } from '@usetemporal/core'
```

## Constants

```typescript
const UNITS = {
  // Calendar units
  YEAR: 'year' as const,
  QUARTER: 'quarter' as const,
  MONTH: 'month' as const,
  WEEK: 'week' as const,
  DAY: 'day' as const,
  
  // Time units
  HOUR: 'hour' as const,
  MINUTE: 'minute' as const,
  SECOND: 'second' as const,
  
  // Special units
  STABLE_MONTH: 'stableMonth' as const,
  CUSTOM: 'custom' as const
} as const
```

## Description

The `UNITS` object provides type-safe constants for all built-in time units. Using these constants instead of string literals helps prevent typos and provides better IDE support with autocomplete.

## Usage Examples

### Basic Usage

```typescript
import { UNITS, divide, createPeriod } from '@usetemporal/core'

// Using constants instead of strings
const year = createPeriod(temporal, UNITS.YEAR, date)
const months = divide(temporal, year, UNITS.MONTH)
const weeks = divide(temporal, year, UNITS.WEEK)
```

### With Operations

```typescript
// Navigation
const nextMonth = next(temporal, period, UNITS.MONTH)
const prevWeek = previous(temporal, period, UNITS.WEEK)

// Comparison
const isSameDay = isSame(temporal, periodA, periodB, UNITS.DAY)
const isSameMonth = isSame(temporal, periodA, periodB, UNITS.MONTH)

// Navigation between units
const monthView = createPeriod(temporal, dayPeriod.date, UNITS.MONTH)
const hours = divide(temporal, dayPeriod, UNITS.HOUR)
```

### Type Safety Benefits

```typescript
// TypeScript provides autocomplete
divide(temporal, period, UNITS.) // Shows all available options

// Prevents typos at compile time
divide(temporal, period, 'mnth')     // ✗ Type error
divide(temporal, period, UNITS.MONTH) // ✓ Type safe

// Works with type narrowing
function processUnit(unit: Unit) {
  switch (unit) {
    case UNITS.YEAR:
      // Handle year
      break
    case UNITS.MONTH:
      // Handle month
      break
    // TypeScript knows all cases
  }
}
```

## Comparison with String Literals

```typescript
// String literals work but have drawbacks
createPeriod(temporal, 'month', date)  // No autocomplete
createPeriod(temporal, 'mnth', date)   // Typo not caught until runtime

// Constants provide safety and convenience
createPeriod(temporal, UNITS.MONTH, date) // Autocomplete + type safety
createPeriod(temporal, UNITS.MNTH, date)  // TypeScript error
```

## Using with Custom Units

While UNITS only includes built-in units, you can create similar constants for custom units:

```typescript
// Define custom unit constants
export const CUSTOM_UNITS = {
  SPRINT: 'sprint' as const,
  FISCAL_YEAR: 'fiscal-year' as const,
  SEMESTER: 'semester' as const
} as const

// Declare types
declare module '@usetemporal/core' {
  interface UnitRegistry {
    'sprint': true
    'fiscal-year': true
    'semester': true
  }
}

// Use consistently
const sprint = createPeriod(temporal, CUSTOM_UNITS.SPRINT, date)
```

## Benefits

### 1. Autocomplete Support

IDEs can suggest available units:

```typescript
// Type UNITS. and see all options
const period = createPeriod(temporal, UNITS.█)
// IDE shows: YEAR, QUARTER, MONTH, WEEK, DAY, etc.
```

### 2. Refactoring Safety

Renaming units is safer with constants:

```typescript
// If unit names change, only need to update constant definition
// All usages automatically get the new value
```

### 3. Prevents Runtime Errors

Typos are caught at compile time:

```typescript
// These errors are caught by TypeScript
divide(temporal, period, 'weakk')     // ✗ Runtime error
divide(temporal, period, UNITS.WEAKK) // ✗ Compile-time error
```

### 4. Code Consistency

Enforces consistent unit references:

```typescript
// Team members use the same constants
// No mix of 'stableMonth' vs 'stable-month' vs 'STABLE_MONTH'
```

## Common Patterns

### Unit Type Guards

```typescript
function isCalendarUnit(unit: Unit): boolean {
  return [
    UNITS.YEAR,
    UNITS.QUARTER,
    UNITS.MONTH,
    UNITS.WEEK,
    UNITS.DAY
  ].includes(unit as any)
}

function isTimeUnit(unit: Unit): boolean {
  return [
    UNITS.HOUR,
    UNITS.MINUTE,
    UNITS.SECOND
  ].includes(unit as any)
}
```

### Configuration Objects

```typescript
const UNIT_CONFIG = {
  [UNITS.YEAR]: { label: 'Year', plural: 'Years' },
  [UNITS.MONTH]: { label: 'Month', plural: 'Months' },
  [UNITS.WEEK]: { label: 'Week', plural: 'Weeks' },
  [UNITS.DAY]: { label: 'Day', plural: 'Days' },
  // ...
} as const

// Usage
function getUnitLabel(unit: Unit, count: number): string {
  const config = UNIT_CONFIG[unit]
  return count === 1 ? config.label : config.plural
}
```

### Unit Hierarchies

```typescript
const UNIT_HIERARCHY = [
  UNITS.YEAR,
  UNITS.QUARTER,
  UNITS.MONTH,
  UNITS.WEEK,
  UNITS.DAY,
  UNITS.HOUR,
  UNITS.MINUTE,
  UNITS.SECOND
] as const

function canDivide(parent: Unit, child: Unit): boolean {
  const parentIndex = UNIT_HIERARCHY.indexOf(parent as any)
  const childIndex = UNIT_HIERARCHY.indexOf(child as any)
  return parentIndex < childIndex
}
```

## Best Practices

1. **Always Import**: Import UNITS at the top of files using units
2. **Consistent Usage**: Use constants throughout your codebase
3. **Avoid Magic Strings**: Replace all unit string literals with constants
4. **Document Custom Units**: Create similar constants for domain units

## See Also

- [Unit](/api/types/unit) - Unit type definition
- [UnitRegistry](/api/types/unit-registry) - Unit registration
- [Operations](/api/operations/) - Using units with operations