# Basic Usage

Quick examples to get you started with useTemporal.

## First Steps

```typescript
import { createTemporal, usePeriod } from 'usetemporal'

// Create temporal instance
const temporal = createTemporal({ 
  date: new Date() 
})

// Get current month
const month = usePeriod(temporal, 'month')
console.log(month.value.start) // First day of month
console.log(month.value.end)   // Last day of month
```

## Navigation

```typescript
import { createTemporal, usePeriod, next, previous } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')

// Navigate months
temporal.browsing.value = next(temporal, month.value)
temporal.browsing.value = previous(temporal, month.value)
```

## The divide() Pattern

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')

// Get all days in month
const days = divide(temporal, month.value, 'day')
console.log(`This month has ${days.length} days`)
```

## More Examples

- [Creating Calendars](/examples/calendars/month-calendar) - Build calendar views
- [Time Navigation](/guide/patterns/navigation) - Advanced navigation patterns
- [Framework Integration](/examples/frameworks/vue-integration) - Vue & React examples
- [Date Comparison](/guide/patterns/time-analysis) - Compare and analyze dates