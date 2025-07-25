# Core Concepts

Understanding these core concepts will help you use useTemporal effectively.

## The Temporal Instance

The temporal instance is your central time controller:

```typescript
import { createTemporal } from 'usetemporal'

const temporal = createTemporal({
  adapter: createNativeAdapter(),   // Required: date adapter
  date: new Date(),                 // Optional: initial browsing date
  now: new Date(),                  // Optional: reference for "now"
  weekStartsOn: 1,                  // Optional: 0 = Sunday, 1 = Monday
})
```

### Key Properties

The temporal instance has two reactive properties:

- **`temporal.browsing`** - The currently browsed period (what the user is looking at)
- **`temporal.now`** - The current time reference (typically real-time)

## The Period Type

Everything in useTemporal is a Period:

```typescript
interface Period {
  type: Unit        // 'year' | 'month' | 'week' | 'day' | 'hour' | etc.
  date: Date        // Representative date for the period
  start: Date       // Start of the period (inclusive)
  end: Date         // End of the period (exclusive)
}
```

### Why Periods?

Instead of separate types for each time unit, useTemporal uses a unified Period type. This enables:
- Consistent operations across all time units
- Simple mental model
- Type-safe operations
- Easy extensibility

## Reactive Periods with usePeriod

Create reactive periods that update automatically:

```typescript
import { usePeriod } from 'usetemporal'

const month = usePeriod(temporal, 'month')
const year = usePeriod(temporal, 'year')

// These update automatically when browsing changes
console.log(month.value.start)  // First millisecond of month
console.log(month.value.end)    // First millisecond of next month
```

## The divide() Pattern

This is what makes useTemporal unique - any period can be divided into smaller units:

```typescript
import { divide } from 'usetemporal'

const year = usePeriod(temporal, 'year')
const months = divide(temporal, year.value, 'month')  // Array of 12 Period objects

// Chain divisions for granular control
const january = months[0]
const days = divide(temporal, january, 'day')        // Array of 31 Period objects
```

## Functional Operations

All operations are pure functions that work with Period objects:

```typescript
import { next, previous, contains } from 'usetemporal'

const month = usePeriod(temporal, 'month')

// Navigation
const nextMonth = next(temporal, month.value)
const prevMonth = previous(temporal, month.value)

// Comparison
const today = new Date()
const isInMonth = contains(month.value, today)
```

## Reactivity

useTemporal uses `@vue/reactivity` (not the Vue framework) for reactive state:

```typescript
// When browsing changes, all dependent periods update
temporal.browsing.value = next(temporal, month.value)

// In Vue/React/Svelte, these updates trigger re-renders automatically
```

## Next Steps

- Build your [First App](/guide/first-app)
- Explore the [divide() Pattern](/guide/divide-pattern) in detail
- Learn about [Operations](/guide/operations)