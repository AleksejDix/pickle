# getUnitDefinition

Retrieve the definition of a registered unit.

## Signature

```typescript
function getUnitDefinition(type: string): UnitDefinition | undefined

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

- `type` - `string` - The name of the unit type to retrieve

## Returns

`UnitDefinition | undefined` - The unit definition if registered, undefined otherwise

## Description

The `getUnitDefinition` function retrieves the configuration object for a registered unit. This is useful for inspecting unit behavior, creating derived units, or conditionally using unit-specific features.

## Examples

### Basic Usage

```typescript
import { getUnitDefinition } from '@usetemporal/core'

// Get built-in unit definition
const dayDef = getUnitDefinition('day')
if (dayDef) {
  console.log(dayDef.divisions) // ['hour', 'minute', 'second']
}

// Get custom unit definition
const sprintDef = getUnitDefinition('sprint')
if (sprintDef?.validate) {
  const isValid = sprintDef.validate(somePeriod)
  console.log(`Period is valid sprint: ${isValid}`)
}
```

### Checking Unit Capabilities

```typescript
function canDivideInto(unit: string, targetUnit: string): boolean {
  const def = getUnitDefinition(unit)
  return def?.divisions?.includes(targetUnit) ?? false
}

function canMergeInto(unit: string): string | undefined {
  const def = getUnitDefinition(unit)
  return def?.mergesTo
}

// Usage
if (canDivideInto('sprint', 'day')) {
  const days = divide(temporal, sprintPeriod, 'day')
}

const mergeTarget = canMergeInto('sprint')
if (mergeTarget) {
  console.log(`Sprints can merge into ${mergeTarget}`)
}
```

### Creating Derived Units

```typescript
// Create a unit based on another unit
function createDerivedUnit(baseUnit: string, multiplier: number): UnitDefinition {
  const baseDef = getUnitDefinition(baseUnit)
  
  if (!baseDef) {
    throw new Error(`Base unit ${baseUnit} not found`)
  }
  
  return {
    createPeriod(date: Date, adapter: Adapter) {
      // Create base period
      const basePeriod = baseDef.createPeriod(date, adapter)
      
      // Extend by multiplier
      const start = new Date(basePeriod.start)
      const end = new Date(basePeriod.end)
      
      // Adjust end date based on multiplier
      const duration = end.getTime() - start.getTime()
      end.setTime(start.getTime() + duration * multiplier)
      
      return { start, end }
    },
    
    divisions: baseDef.divisions,
    mergesTo: baseDef.mergesTo
  }
}

// Define a fortnight as 2 weeks
defineUnit('fortnight', createDerivedUnit('week', 2))
```

### Unit Introspection

```typescript
function describeUnit(unit: string): string {
  const def = getUnitDefinition(unit)
  
  if (!def) return `Unit '${unit}' is not registered`
  
  const features: string[] = []
  
  if (def.validate) features.push('has validation')
  if (def.divisions) features.push(`can divide into: ${def.divisions.join(', ')}`)
  if (def.mergesTo) features.push(`merges to: ${def.mergesTo}`)
  
  return `Unit '${unit}': ${features.join('; ')}`
}

// Examples
console.log(describeUnit('sprint'))
// "Unit 'sprint': has validation; can divide into: day, hour; merges to: month"

console.log(describeUnit('quarter'))
// "Unit 'quarter': can divide into: month, week, day"
```

### Conditional Behavior

```typescript
function validatePeriod(period: Period): boolean {
  const def = getUnitDefinition(period.type)
  
  if (def?.validate) {
    // Custom validation
    return def.validate(period)
  }
  
  // Default validation - check if start < end
  return period.start < period.end
}

// Check if operations are supported
function getSupportedOperations(unit: string): string[] {
  const def = getUnitDefinition(unit)
  const operations: string[] = ['createPeriod', 'next', 'previous']
  
  if (def?.divisions && def.divisions.length > 0) {
    operations.push('divide')
  }
  
  if (def?.mergesTo) {
    operations.push('merge')
  }
  
  return operations
}
```

### Unit Validation

```typescript
function validateCustomUnit(unit: Unit): string[] {
  const errors: string[] = []
  const def = getUnitDefinition(unit)
  
  if (!def) {
    errors.push(`Unit '${unit}' is not registered`)
    return errors
  }
  
  // Check for common issues
  if (!def.createPeriod) {
    errors.push('Unit missing required createPeriod method')
  }
  
  if (def.createPeriod) {
    // Test period creation
    try {
      const date = new Date()
      const period = def.createPeriod(date, temporal.adapter)
      
      if (period.start >= period.end) {
        errors.push('createPeriod returns invalid period (start >= end)')
      }
    } catch (e) {
      errors.push(`createPeriod throws error: ${e.message}`)
    }
  }
  
  return errors
}
```

### Working with Divisions

```typescript
// Find all units that can divide into a target unit
function findDivisibleUnits(targetUnit: string): string[] {
  const allUnits = getRegisteredUnits()
  
  return allUnits.filter(unit => {
    const def = getUnitDefinition(unit)
    return def?.divisions?.includes(targetUnit) ?? false
  })
}

// Build unit hierarchy
function buildUnitHierarchy(): Map<string, string[]> {
  const hierarchy = new Map<string, string[]>()
  const units = getRegisteredUnits()
  
  for (const unit of units) {
    const def = getUnitDefinition(unit)
    if (def?.divisions) {
      hierarchy.set(unit, def.divisions)
    }
  }
  
  return hierarchy
}
```

## Working with Unit Relationships

```typescript
// Build merge chain
function getMergeChain(startUnit: string): string[] {
  const chain: string[] = [startUnit]
  let current = startUnit
  
  while (current) {
    const def = getUnitDefinition(current)
    if (def?.mergesTo) {
      chain.push(def.mergesTo)
      current = def.mergesTo
    } else {
      break
    }
  }
  
  return chain
}

// Example: getMergeChain('day') might return ['day', 'week', 'month', 'year']
```

## Error Handling

```typescript
// Safe unit operation
function safeUnitOperation<T>(
  unit: Unit,
  operation: (def: UnitDefinition) => T,
  fallback: T
): T {
  const def = getUnitDefinition(unit)
  
  if (!def) {
    console.warn(`Unit '${unit}' not found`)
    return fallback
  }
  
  try {
    return operation(def)
  } catch (error) {
    console.error(`Error in unit operation for '${unit}':`, error)
    return fallback
  }
}

// Usage
const duration = safeUnitOperation(
  'custom-unit',
  (def) => def.getDuration!(start, end),
  0 // fallback value
)
```

## Performance Considerations

The function has O(1) lookup time:

```typescript
// Definitions are stored in a Map internally
// Multiple calls are efficient
const def1 = getUnitDefinition('day')
const def2 = getUnitDefinition('day')
// def1 === def2 (same object reference)
```

## See Also

- [defineUnit](/api/unit-system/define-unit) - Register units
- [hasUnit](/api/unit-system/has-unit) - Check registration
- [UnitRegistry](/api/types/unit-registry) - Registry types
- [Unit](/api/types/unit) - Unit type definition