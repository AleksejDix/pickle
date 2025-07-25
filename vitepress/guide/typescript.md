# TypeScript Support

useTemporal is written in TypeScript and provides comprehensive type safety.

## Basic Types

All core types are automatically inferred:

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'
import type { Temporal, Period, Unit } from 'usetemporal'

// Types are inferred
const temporal = createTemporal()                    // Temporal
const month = usePeriod(temporal, 'month')          // ComputedRef<Period>
const days = divide(temporal, month.value, 'day')   // Period[]
```

## Type Definitions

### Core Types

```typescript
interface Temporal {
  adapter: Adapter
  weekStartsOn: number
  browsing: Ref<Period>
  now: Ref<Period>
}

interface Period {
  type: Unit
  date: Date
  start: Date
  end: Date
}

type Unit = 
  | 'year' 
  | 'month' 
  | 'week' 
  | 'day' 
  | 'hour' 
  | 'minute' 
  | 'second'
```

### Operation Types

```typescript
// Navigation
function next(temporal: Temporal, period: Period): Period
function previous(temporal: Temporal, period: Period): Period
function go(temporal: Temporal, period: Period, steps: number): Period

// Comparison
function contains(period: Period, date: Date | Period): boolean
function isSame(temporal: Temporal, a: Date, b: Date, unit: Unit): boolean

// Division
function divide(temporal: Temporal, period: Period, unit: Unit): Period[]
```

## Type Safety

TypeScript catches common errors:

```typescript
// ✅ Valid units
const month = usePeriod(temporal, 'month')
const day = usePeriod(temporal, 'day')

// ❌ Invalid unit - TypeScript error
const invalid = usePeriod(temporal, 'invalid')

// ✅ Valid divide operation
const days = divide(temporal, month.value, 'day')

// ❌ Wrong parameter order - TypeScript error
const wrong = divide(month.value, temporal, 'day')
```

## Custom Unit Types

Extend the Unit type for custom units:

```typescript
// Declare module augmentation
declare module 'usetemporal' {
  interface UnitRegistry {
    'quarter': true
    'fortnight': true
  }
}

// Now these are valid
const quarter = usePeriod(temporal, 'quarter')
const fortnight = usePeriod(temporal, 'fortnight')
```

## Generic Constraints

Work with generic time operations:

```typescript
function createCalendar<T extends Unit>(
  temporal: Temporal,
  unit: T
): ComputedRef<Period[]> {
  const period = usePeriod(temporal, unit)
  return computed(() => {
    if (unit === 'year') {
      return divide(temporal, period.value, 'month')
    }
    if (unit === 'month') {
      return divide(temporal, period.value, 'day')
    }
    return [period.value]
  })
}
```

## Strict Mode

Enable strict TypeScript for better safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## IDE Support

Get full IntelliSense in VS Code:

1. **Auto-imports**: Types and functions auto-import
2. **Parameter hints**: See function signatures
3. **Type checking**: Errors shown inline
4. **Refactoring**: Safe rename operations

## Next Steps

- Review [API Reference](/api/) for all types
- See [Examples](/examples/) with TypeScript
- Check [Troubleshooting](/guide/troubleshooting) for type issues