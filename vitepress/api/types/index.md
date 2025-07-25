# Types

TypeScript type definitions for useTemporal.

## Core Types

### [Period](/api/types/period)
The fundamental data structure representing a time period.

```typescript
interface Period {
  start: Date     // Inclusive start
  end: Date       // Exclusive end
  type: Unit      // Time unit type
  date: Date      // Reference date
}
```

### [Unit](/api/types/unit)
Supported time unit types.

```typescript
type Unit = 
  | 'year' 
  | 'quarter'
  | 'month' 
  | 'week' 
  | 'day' 
  | 'hour' 
  | 'minute' 
  | 'second'
  | 'stableMonth'
  | 'custom'
  | (string & {}) // Extensible for custom units
```

### [Temporal](/api/types/temporal)
The central state container for time navigation.

```typescript
interface Temporal {
  adapter: Adapter
  weekStartsOn: number
  browsing: Ref<Period>
  now: ComputedRef<Period>
  divide: (period: Period, unit: Unit) => Period[]
  split: (period: Period, options: SplitOptions) => Period[]
}
```

### [Adapter](/api/types/adapter)
Interface for date library adapters.

```typescript
interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date
  endOf(date: Date, unit: AdapterUnit): Date
  add(date: Date, amount: number, unit: AdapterUnit): Date
  diff(start: Date, end: Date, unit: AdapterUnit): number
}
```

## Configuration Types

### [CreateTemporalOptions](/api/types/create-temporal-options)
Options for creating a temporal instance.

```typescript
interface CreateTemporalOptions {
  date: Date | Ref<Date>
  now?: Date | Ref<Date>
  adapter: Adapter
  weekStartsOn?: number // 0-6 (Sunday to Saturday)
}
```

### [SplitOptions](/api/types/split-options)
Options for the split operation.

```typescript
interface SplitOptions {
  unit?: Unit
  count?: number
  duration?: Duration
}
```

## Plugin System Types

### [UnitRegistry](/api/types/unit-registry)
Registry for custom unit types.

```typescript
interface UnitRegistry {
  year: true
  quarter: true
  month: true
  week: true
  day: true
  hour: true
  minute: true
  second: true
  stableMonth: true
  custom: true
  // Extended by plugins
}
```

### [UnitDefinition](/api/types/unit-definition)
Definition for custom units.

```typescript
interface UnitDefinition {
  createPeriod(date: Date, adapter: Adapter): { start: Date; end: Date }
  validate?(period: { start: Date; end: Date; type: string }): boolean
  divisions?: string[]
  mergesTo?: string
}
```