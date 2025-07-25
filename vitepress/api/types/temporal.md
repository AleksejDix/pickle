# Temporal

The main temporal instance that manages time state and operations.

## Type Definition

```typescript
interface Temporal {
  adapter: Adapter
  browsing: Ref<Period>
  now: Ref<Period>
  units: UnitRegistry
  weekStartsOn: WeekDay
}
```

## Properties

### adapter

The date adapter instance used for all date operations.

- **Type**: `Adapter`
- **Description**: Handles date calculations and manipulations
- **Example**: Native adapter, Luxon adapter, date-fns adapter

### browsing

The currently browsed period, reactive reference.

- **Type**: `Ref<Period>`
- **Description**: Tracks the current period being viewed/browsed
- **Reactive**: Changes trigger UI updates

### now

The current time period, reactive reference.

- **Type**: `Ref<Period>` 
- **Description**: Represents "now" in the temporal system
- **Updates**: Can be manually set or auto-update

### units

Registry of available time units.

- **Type**: `UnitRegistry`
- **Description**: Contains all registered unit definitions
- **Extensible**: Can add custom units via `defineUnit`

### weekStartsOn

Configures which day starts the week.

- **Type**: `WeekDay` (0-6, where 0 is Sunday)
- **Default**: `0` (Sunday)
- **Used by**: Week calculations and calendar displays

## Creation

Use `createTemporal` to create a Temporal instance:

```typescript
import { createTemporal } from '@usetemporal/core'

// Basic creation
const temporal = createTemporal({ date: new Date() })

// With options
const temporal = createTemporal({
  adapter: luxonAdapter,
  weekStartsOn: 1, // Monday
  date: new Date('2024-03-15'),
  now: new Date('2024-03-15T10:00:00')
})
```

## Usage Examples

### Accessing Properties

```typescript
// Get current adapter
const adapter = temporal.adapter

// Access current browsing period
const currentPeriod = temporal.browsing.value
console.log(currentPeriod.start, currentPeriod.end)

// Check current time
const now = temporal.now.value
console.log('Current time:', now.date)

// Get week configuration
console.log('Week starts on:', temporal.weekStartsOn)
```

### Reactive Updates

```typescript
import { watch } from '@vue/reactivity'

// Watch browsing changes
watch(temporal.browsing, (newPeriod, oldPeriod) => {
  console.log('Browsing changed from', oldPeriod, 'to', newPeriod)
})

// Update browsing period
temporal.browsing.value = createPeriod(temporal, 'month', someDate)
```

### Working with Now

```typescript
// Manually update "now"
temporal.now.value = createPeriod(temporal, 'minute', new Date())

// Check if a period is today
const isToday = isSame(temporal, somePeriod, temporal.now.value, 'day')
```

### Unit Registry Access

```typescript
// Check available units
const hasCustomUnit = temporal.units.hasUnit('fiscal-quarter')

// Get unit definition
const dayUnit = temporal.units.getDefinition('day')
```

## Common Patterns

### Calendar Navigation

```typescript
function navigateCalendar(direction: 'next' | 'previous') {
  const current = temporal.browsing.value
  temporal.browsing.value = direction === 'next' 
    ? next(temporal, current)
    : previous(temporal, current)
}
```

### Today Button

```typescript
function goToToday() {
  temporal.browsing.value = createPeriod(
    temporal, 
    temporal.browsing.value.type,
    temporal.now.value.date
  )
}
```

### Period Synchronization

```typescript
// Keep multiple views in sync
function syncViews(mainTemporal: Temporal, viewTemporal: Temporal) {
  watch(mainTemporal.browsing, (newPeriod) => {
    viewTemporal.browsing.value = newPeriod
  })
}
```

## Framework Integration

### Vue Composition API

```typescript
import { computed } from 'vue'

export function useCalendar(temporal: Temporal) {
  const currentMonth = computed(() => temporal.browsing.value)
  const isCurrentMonth = computed(() => 
    isSame(temporal, temporal.browsing.value, temporal.now.value, 'month')
  )
  
  return {
    currentMonth,
    isCurrentMonth,
    next: () => temporal.browsing.value = next(temporal, temporal.browsing.value),
    previous: () => temporal.browsing.value = previous(temporal, temporal.browsing.value)
  }
}
```

### React Hook

```typescript
import { useSyncExternalStore } from 'react'

export function useTemporal(temporal: Temporal) {
  const browsing = useSyncExternalStore(
    (callback) => {
      return temporal.browsing.watch(callback)
    },
    () => temporal.browsing.value
  )
  
  return {
    browsing,
    setBrowsing: (period: Period) => temporal.browsing.value = period
  }
}
```

## Type Safety

The Temporal interface ensures type safety across operations:

```typescript
// Type-safe operations
function performOperation(temporal: Temporal) {
  // TypeScript knows these properties exist
  const period = temporal.browsing.value
  const adapter = temporal.adapter
  const weekStart = temporal.weekStartsOn
  
  // Operations are type-checked
  const nextPeriod = next(temporal, period)
  const days = divide(temporal, period, 'day')
}
```

## Best Practices

1. **Single Instance**: Usually create one Temporal instance per application
2. **Reactive Watchers**: Use framework reactivity to respond to changes
3. **Consistent Now**: Keep `now` updated if real-time matters
4. **Week Configuration**: Set `weekStartsOn` based on user locale

## See Also

- [createTemporal](/api/factory-functions/create-temporal) - Factory function
- [Period](/api/types/period) - Period type
- [Adapter](/api/types/adapter) - Adapter interface
- [UnitRegistry](/api/types/unit-registry) - Unit registry