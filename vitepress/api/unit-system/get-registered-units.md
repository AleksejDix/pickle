# getRegisteredUnits

Get all registered unit types in the system.

## Signature

```typescript
function getRegisteredUnits(): string[]
```

## Returns

`string[]` - Array of all registered unit type names

## Description

The `getRegisteredUnits` function returns an array of all unit types that have been registered in the system, including both built-in units and custom units defined via `defineUnit`.

## Examples

### Basic Usage

```typescript
import { getRegisteredUnits } from '@usetemporal/core'

// Get all available units
const units = getRegisteredUnits()
console.log(units)
// ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'stableMonth', 'custom', ...]

// Check if custom units are registered
const hasCustomUnits = units.some(unit => 
  !['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'].includes(unit)
)
```

### Building Unit Selectors

```typescript
// Create a dynamic unit selector
function UnitSelector({ onSelect, exclude = [] }) {
  const allUnits = getRegisteredUnits()
  const availableUnits = allUnits.filter(unit => !exclude.includes(unit))
  
  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select a unit...</option>
      {availableUnits.map(unit => (
        <option key={unit} value={unit}>
          {unit.charAt(0).toUpperCase() + unit.slice(1)}
        </option>
      ))}
    </select>
  )
}

// Usage
<UnitSelector 
  onSelect={(unit) => console.log('Selected:', unit)}
  exclude={['second', 'minute']} // Exclude time units
/>
```

### Unit Discovery

```typescript
// Find all units that can divide into days
function findUnitsWithDayDivision(): string[] {
  const units = getRegisteredUnits()
  
  return units.filter(unit => {
    const def = getUnitDefinition(unit)
    return def?.divisions?.includes('day')
  })
}

// Example result: ['year', 'quarter', 'month', 'week']
```

### Unit Categorization

```typescript
// Categorize units by their characteristics
function categorizeUnits() {
  const units = getRegisteredUnits()
  const categorized = {
    calendar: [] as string[],
    time: [] as string[],
    custom: [] as string[],
    special: [] as string[]
  }
  
  const standardCalendar = ['year', 'quarter', 'month', 'week', 'day']
  const standardTime = ['hour', 'minute', 'second']
  const special = ['stableMonth', 'custom']
  
  for (const unit of units) {
    if (standardCalendar.includes(unit)) {
      categorized.calendar.push(unit)
    } else if (standardTime.includes(unit)) {
      categorized.time.push(unit)
    } else if (special.includes(unit)) {
      categorized.special.push(unit)
    } else {
      categorized.custom.push(unit)
    }
  }
  
  return categorized
}

// Usage
const categories = categorizeUnits()
console.log('Custom units:', categories.custom)
```

### Validation Helper

```typescript
// Validate configuration against available units
function validateUnitConfig(config: {
  defaultUnit: string
  allowedUnits: string[]
}): string[] {
  const errors: string[] = []
  const registered = getRegisteredUnits()
  
  if (!registered.includes(config.defaultUnit)) {
    errors.push(`Default unit '${config.defaultUnit}' is not registered`)
  }
  
  const unregistered = config.allowedUnits.filter(
    unit => !registered.includes(unit)
  )
  
  if (unregistered.length > 0) {
    errors.push(`Unregistered units: ${unregistered.join(', ')}`)
  }
  
  return errors
}
```

### Building Unit Hierarchies

```typescript
// Build a complete unit hierarchy
function buildUnitHierarchy() {
  const units = getRegisteredUnits()
  const hierarchy: Record<string, {
    divisions: string[]
    mergesTo?: string
  }> = {}
  
  for (const unit of units) {
    const def = getUnitDefinition(unit)
    if (def) {
      hierarchy[unit] = {
        divisions: def.divisions || [],
        mergesTo: def.mergesTo
      }
    }
  }
  
  return hierarchy
}

// Visualize as tree
function printUnitTree() {
  const hierarchy = buildUnitHierarchy()
  
  // Start from units that don't merge into anything
  const roots = getRegisteredUnits().filter(
    unit => !Object.values(hierarchy).some(h => h.divisions.includes(unit))
  )
  
  // Recursive print function
  function printUnit(unit: string, indent = '') {
    console.log(indent + unit)
    const divisions = hierarchy[unit]?.divisions || []
    for (const div of divisions) {
      printUnit(div, indent + '  ')
    }
  }
  
  roots.forEach(root => printUnit(root))
}
```

### Testing Utilities

```typescript
// Test helper to ensure required units are available
export function requireUnits(units: string[]): void {
  const registered = getRegisteredUnits()
  const missing = units.filter(unit => !registered.includes(unit))
  
  if (missing.length > 0) {
    throw new Error(
      `Required units not registered: ${missing.join(', ')}`
    )
  }
}

// Use in tests
beforeEach(() => {
  requireUnits(['sprint', 'fiscal-year'])
})
```

### Dynamic Feature Detection

```typescript
// Enable features based on available units
function getAvailableFeatures() {
  const units = getRegisteredUnits()
  
  return {
    hasFiscalCalendar: units.includes('fiscal-year') && 
                       units.includes('fiscal-quarter'),
    hasAcademicCalendar: units.includes('semester') && 
                         units.includes('academic-year'),
    hasAgilePlanning: units.includes('sprint') && 
                      units.includes('epic'),
    hasCustomTimeUnits: units.some(unit => 
      !['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second']
        .includes(unit)
    )
  }
}
```

## Common Patterns

### Unit Registration Check

```typescript
// Check if minimum required units are registered
function hasMinimumUnits(): boolean {
  const required = ['year', 'month', 'week', 'day']
  const registered = getRegisteredUnits()
  return required.every(unit => registered.includes(unit))
}
```

### Unit Cleanup

```typescript
// For testing - track units added during test
function trackCustomUnits() {
  const before = getRegisteredUnits()
  
  return {
    getAdded() {
      const after = getRegisteredUnits()
      return after.filter(unit => !before.includes(unit))
    }
  }
}
```

## Notes

- The function returns a snapshot of currently registered units
- The array includes all built-in units plus any custom units
- The order of units in the array is not guaranteed
- Units registered after calling this function won't appear in the result

## See Also

- [defineUnit](/api/unit-system/define-unit) - Register custom units
- [hasUnit](/api/unit-system/has-unit) - Check specific unit
- [getUnitDefinition](/api/unit-system/get-unit-definition) - Get unit config
- [Unit](/api/types/unit) - Unit type definition