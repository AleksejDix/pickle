# hasUnit

Check if a unit is registered in the system.

## Signature

```typescript
function hasUnit(unit: string): boolean
```

## Parameters

- `unit` - `string` - The name of the unit to check

## Returns

`boolean` - True if the unit is registered, false otherwise

## Description

The `hasUnit` function checks whether a unit has been registered in the unit system, either as a built-in unit or through `defineUnit`. This is useful for validation, conditional logic, and feature detection.

## Examples

### Basic Usage

```typescript
import { hasUnit } from '@usetemporal/core'

// Check built-in units
console.log(hasUnit('day'))    // true
console.log(hasUnit('month'))  // true
console.log(hasUnit('year'))   // true

// Check non-existent unit
console.log(hasUnit('fortnight')) // false

// Check after defining custom unit
defineUnit('fortnight', { /* ... */ })
console.log(hasUnit('fortnight')) // true
```

### Validation Before Use

```typescript
function createSafePeriod(
  temporal: Temporal, 
  unit: string, 
  date: Date
): Period | null {
  if (!hasUnit(unit)) {
    console.error(`Unit '${unit}' is not registered`)
    return null
  }
  
  return createPeriod(temporal, unit as Unit, date)
}

// Usage
const period = createSafePeriod(temporal, userInputUnit, new Date())
if (period) {
  // Safe to use period
}
```

### Feature Detection

```typescript
// Check if custom units are available
function hasCustomCalendarUnits(): boolean {
  return hasUnit('fiscal-year') && 
         hasUnit('fiscal-quarter') && 
         hasUnit('fiscal-month')
}

// Conditionally show features
function CalendarControls({ temporal }) {
  const showFiscalOptions = hasCustomCalendarUnits()
  
  return (
    <div>
      <button onClick={() => setView('month')}>Month</button>
      <button onClick={() => setView('year')}>Year</button>
      {showFiscalOptions && (
        <button onClick={() => setView('fiscal-year')}>Fiscal Year</button>
      )}
    </div>
  )
}
```

### Dynamic Unit Lists

```typescript
// Get all available units for UI
function getAvailableUnits(): string[] {
  const allPossibleUnits = [
    // Built-in units
    'year', 'quarter', 'month', 'week', 'day', 
    'hour', 'minute', 'second', 'stableMonth',
    // Potential custom units
    'sprint', 'fiscal-year', 'semester', 'fortnight'
  ]
  
  return allPossibleUnits.filter(hasUnit)
}

// Create unit selector
function UnitSelector({ onSelect }) {
  const units = getAvailableUnits()
  
  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      {units.map(unit => (
        <option key={unit} value={unit}>
          {unit.charAt(0).toUpperCase() + unit.slice(1)}
        </option>
      ))}
    </select>
  )
}
```

### Plugin System

```typescript
// Check if required units are available
function checkPluginRequirements(plugin: Plugin): string[] {
  const missingUnits: string[] = []
  
  for (const requiredUnit of plugin.requiredUnits || []) {
    if (!hasUnit(requiredUnit)) {
      missingUnits.push(requiredUnit)
    }
  }
  
  return missingUnits
}

// Usage
const plugin = {
  name: 'Academic Calendar',
  requiredUnits: ['semester', 'academic-year', 'course-week']
}

const missing = checkPluginRequirements(plugin)
if (missing.length > 0) {
  console.error(`Missing units: ${missing.join(', ')}`)
}
```

### Fallback Behavior

```typescript
// Use custom unit if available, fallback to standard
function getBillingPeriod(temporal: Temporal, date: Date): Period {
  const unit = hasUnit('billing-cycle') ? 'billing-cycle' : 'month'
  return createPeriod(temporal, unit as Unit, date)
}

// Progressive enhancement
function getDisplayUnit(preferredUnit: string, fallback: Unit = 'day'): Unit {
  return hasUnit(preferredUnit) ? preferredUnit as Unit : fallback
}
```

### Unit Categories

```typescript
// Categorize available units
function categorizeUnits(): Record<string, string[]> {
  const categories = {
    calendar: ['year', 'quarter', 'month', 'week', 'day'],
    time: ['hour', 'minute', 'second'],
    custom: ['sprint', 'fiscal-year', 'semester'],
    special: ['stableMonth', 'custom']
  }
  
  const available: Record<string, string[]> = {}
  
  for (const [category, units] of Object.entries(categories)) {
    available[category] = units.filter(hasUnit)
  }
  
  return available
}
```

### Migration Support

```typescript
// Check for deprecated units during migration
function checkDeprecatedUnits(): void {
  const deprecated = [
    { old: 'working-day', new: 'business-day' },
    { old: 'bi-week', new: 'fortnight' }
  ]
  
  for (const { old, new: newUnit } of deprecated) {
    if (hasUnit(old)) {
      console.warn(
        `Unit '${old}' is deprecated. Use '${newUnit}' instead.`
      )
    }
  }
}
```

### Testing Utilities

```typescript
// Test helper for unit availability
export function withUnits(
  units: string[], 
  testFn: () => void
): void {
  const missingUnits = units.filter(unit => !hasUnit(unit))
  
  if (missingUnits.length > 0) {
    test.skip(
      `Skipping test - missing units: ${missingUnits.join(', ')}`
    )
    return
  }
  
  testFn()
}

// Usage in tests
withUnits(['sprint', 'fiscal-year'], () => {
  test('sprint planning with fiscal years', () => {
    // Test only runs if both units are available
  })
})
```

## Type Narrowing

While `hasUnit` accepts a string, you can use it for type narrowing:

```typescript
function isValidUnit(unit: string): unit is Unit {
  return hasUnit(unit)
}

// Usage
const userInput = 'month'
if (isValidUnit(userInput)) {
  // TypeScript now knows userInput is a Unit
  const period = createPeriod(temporal, userInput, date)
}
```

## Performance

The function has O(1) lookup time:

```typescript
// Efficient for repeated checks
const units = ['day', 'week', 'month', 'custom-unit', 'invalid']
const valid = units.filter(hasUnit) // Fast filtering
```

## Common Patterns

### Configuration Validation

```typescript
interface AppConfig {
  defaultUnit: string
  availableUnits: string[]
}

function validateConfig(config: AppConfig): string[] {
  const errors: string[] = []
  
  if (!hasUnit(config.defaultUnit)) {
    errors.push(`Default unit '${config.defaultUnit}' not found`)
  }
  
  const invalid = config.availableUnits.filter(u => !hasUnit(u))
  if (invalid.length > 0) {
    errors.push(`Invalid units: ${invalid.join(', ')}`)
  }
  
  return errors
}
```

### Lazy Loading Units

```typescript
async function ensureUnit(unit: string): Promise<boolean> {
  if (hasUnit(unit)) return true
  
  try {
    // Dynamically import unit definition
    const module = await import(`./units/${unit}.js`)
    module.register()
    return hasUnit(unit)
  } catch {
    return false
  }
}
```

## See Also

- [defineUnit](/api/unit-system/define-unit) - Register units
- [getUnitDefinition](/api/unit-system/get-unit-definition) - Get unit config
- [Unit](/api/types/unit) - Unit type
- [UnitRegistry](/api/types/unit-registry) - Registry system