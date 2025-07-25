# createTemporal

Creates a new temporal instance - the central controller for time operations in useTemporal.

## Signature

```typescript
createTemporal(options: CreateTemporalOptions): Temporal
```

## Parameters

- `options` - `CreateTemporalOptions` - Configuration options

### CreateTemporalOptions

```typescript
interface CreateTemporalOptions {
  date: Date | Ref<Date>     // Initial browsing date
  adapter?: Adapter          // Date operations adapter (required for @usetemporal/core)
  now?: Date | Ref<Date>     // Current time reference
  weekStartsOn?: number      // 0-6, default: 1 (Monday)
}
```

## Returns

`Temporal` - The temporal instance with reactive properties

### Temporal Interface

```typescript
interface Temporal {
  adapter: Adapter           // Date operations adapter
  weekStartsOn: number       // 0-6
  browsing: Ref<Period>      // Currently browsed period
  now: Ref<Period>           // Current time period
}
```

## Description

The `createTemporal` function initializes the core temporal system. It manages two key reactive states: the browsing period (for navigation) and the current time period. All time operations in useTemporal flow through this central instance.

## Basic Usage

```typescript
import { createTemporal } from 'usetemporal'

// Create with current date
const temporal = createTemporal({ date: new Date() })

// Create with specific configuration
const temporal = createTemporal({
  date: new Date(2024, 2, 14),
  weekStartsOn: 0, // Sunday
  adapter: createLuxonAdapter()
})

// Access reactive properties
console.log(temporal.browsing.value) // Current browsing period
console.log(temporal.now.value)      // Current time period
```

## Package Differences

- `usetemporal` - Includes native adapter by default
- `@usetemporal/core` - Requires explicit adapter

```typescript
// Using usetemporal (adapter optional)
import { createTemporal } from 'usetemporal'
const temporal = createTemporal({ date: new Date() })

// Using @usetemporal/core (adapter required)
import { createTemporal } from '@usetemporal/core'
import { createNativeAdapter } from '@usetemporal/adapter-native'
const temporal = createTemporal({ 
  date: new Date(),
  adapter: createNativeAdapter()
})
```

## See Also

- [usePeriod](/api/composables/use-period) - Create reactive periods
- [Adapters](/guide/adapters) - Available date adapters
- [Getting Started](/guide/getting-started) - Basic usage guide
- [Core Concepts](/guide/core-concepts) - Understanding temporal instances