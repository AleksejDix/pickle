# Reactive Time Units

useTemporal leverages `@vue/reactivity` (not the Vue framework) to provide reactive time units that automatically update when the browsing period changes.

## How It Works

### Core Reactivity

useTemporal uses Vue's standalone reactivity system:

```typescript
import { ref, computed, reactive } from '@vue/reactivity'

// Inside createTemporal
const temporal = {
  browsing: ref(initialPeriod),
  now: ref(currentTimePeriod),
  // ...
}
```

This reactivity system is:
- **Framework agnostic** - Works with any UI framework
- **Tree-shakeable** - Only includes what you use
- **Efficient** - Tracks dependencies automatically

### Reactive Periods

The `usePeriod` composable creates reactive periods:

```typescript
const month = usePeriod(temporal, 'month')
// month is a ComputedRef<Period>

// Automatically updates when browsing changes
temporal.browsing.value = next(temporal, temporal.browsing.value)
// month.value now reflects the new month
```

## Integration with Frameworks

### Vue 3

Works seamlessly with Vue's reactivity:

```vue
<script setup>
import { usePeriod, divide } from 'usetemporal'
import { computed } from 'vue'

const props = defineProps(['temporal'])

const month = usePeriod(props.temporal, 'month')
const days = computed(() => divide(props.temporal, month.value, 'day'))
</script>

<template>
  <div>
    <h2>{{ month.value.date.toLocaleDateString('en', { month: 'long' }) }}</h2>
    <div v-for="day in days" :key="day.date.toISOString()">
      {{ day.date.getDate() }}
    </div>
  </div>
</template>
```

### React

Use with React's state management:

```typescript
import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePeriod, divide } from 'usetemporal'

function useReactivePeriod(temporal, unit) {
  return useSyncExternalStore(
    (callback) => {
      // Subscribe to changes
      const stop = temporal.browsing.watch(callback)
      return stop
    },
    () => usePeriod(temporal, unit).value
  )
}

function Calendar({ temporal }) {
  const month = useReactivePeriod(temporal, 'month')
  const [days, setDays] = useState([])
  
  useEffect(() => {
    setDays(divide(temporal, month, 'day'))
  }, [month, temporal])
  
  return (
    <div>
      {days.map(day => (
        <div key={day.date.toISOString()}>
          {day.date.getDate()}
        </div>
      ))}
    </div>
  )
}
```

### Svelte

Integration with Svelte stores:

```javascript
import { writable, derived } from 'svelte/store'
import { usePeriod, divide } from 'usetemporal'

// Create a Svelte store from temporal
function createTemporalStore(temporal) {
  const { subscribe, set } = writable(temporal.browsing.value)
  
  // Watch for changes
  temporal.browsing.watch((newValue) => {
    set(newValue)
  })
  
  return {
    subscribe,
    next: () => temporal.browsing.value = next(temporal, temporal.browsing.value),
    previous: () => temporal.browsing.value = previous(temporal, temporal.browsing.value)
  }
}

// In component
const browsing = createTemporalStore(temporal)
const month = derived(browsing, $browsing => 
  usePeriod(temporal, 'month').value
)
```

### Vanilla JavaScript

Use without any framework:

```javascript
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')

// Manual subscription
let unwatch = month.watch((newMonth) => {
  console.log('Month changed:', newMonth)
  updateCalendarUI(newMonth)
})

// Update browsing
document.getElementById('next').addEventListener('click', () => {
  temporal.browsing.value = next(temporal, month.value)
})

// Cleanup when done
// unwatch()
```

## Reactive Patterns

### Computed Chains

Build reactive computation chains:

```typescript
const year = usePeriod(temporal, 'year')
const months = computed(() => divide(temporal, year.value, 'month'))
const currentMonth = computed(() => 
  months.value.find(m => isSame(temporal, m, temporal.now.value, 'month'))
)
const days = computed(() => 
  currentMonth.value ? divide(temporal, currentMonth.value, 'day') : []
)
```

### Reactive Filtering

Filter periods reactively:

```typescript
const month = usePeriod(temporal, 'month')
const allDays = computed(() => divide(temporal, month.value, 'day'))
const weekdays = computed(() => allDays.value.filter(isWeekday))
const weekends = computed(() => allDays.value.filter(isWeekend))
const today = computed(() => 
  allDays.value.find(day => isToday(day, temporal))
)
```

### Side Effects

Handle side effects with watchers:

```typescript
import { watch } from '@vue/reactivity'

const month = usePeriod(temporal, 'month')

// Watch for changes
watch(month, (newMonth, oldMonth) => {
  console.log('Month changed from', oldMonth, 'to', newMonth)
  
  // Fetch data for new month
  fetchEventsForMonth(newMonth)
  
  // Update URL
  updateURLParams({ month: newMonth.date.toISOString() })
})
```

## Performance Considerations

### Memoization

Reactive computations are automatically memoized:

```typescript
const month = usePeriod(temporal, 'month')
const days = computed(() => {
  console.log('Computing days...') // Only runs when month changes
  return divide(temporal, month.value, 'day')
})

// Access multiple times - computation only runs once
console.log(days.value.length)
console.log(days.value[0])
```

### Lazy Evaluation

Computations are lazy - only run when accessed:

```typescript
const expensiveComputation = computed(() => {
  console.log('This only runs if accessed')
  return divide(temporal, year.value, 'hour') // 8760+ periods
})

// Computation hasn't run yet

if (showHourlyView) {
  console.log(expensiveComputation.value) // Now it runs
}
```

### Cleanup

Always clean up watchers to prevent memory leaks:

```typescript
const stopWatching = watch(temporal.browsing, (newValue) => {
  // Handle changes
})

// When component unmounts
onUnmounted(() => {
  stopWatching()
})
```

## Advanced Patterns

### Custom Reactive Composables

Create your own reactive time utilities:

```typescript
function useTimeRange(temporal, startDate, endDate) {
  return computed(() => {
    const periods = []
    let current = toPeriod(temporal, startDate, 'day')
    const end = toPeriod(temporal, endDate, 'day')
    
    while (current.start <= end.start) {
      periods.push(current)
      current = next(temporal, current)
    }
    
    return periods
  })
}

// Usage
const range = useTimeRange(
  temporal,
  new Date('2024-01-01'),
  new Date('2024-01-31')
)
```

### Reactive Aggregations

Build reactive statistics:

```typescript
function useMonthStats(temporal) {
  const month = usePeriod(temporal, 'month')
  
  return computed(() => {
    const days = divide(temporal, month.value, 'day')
    
    return {
      totalDays: days.length,
      weekdays: days.filter(isWeekday).length,
      weekends: days.filter(isWeekend).length,
      weeks: Math.ceil(days.length / 7),
      firstDay: days[0],
      lastDay: days[days.length - 1]
    }
  })
}
```

## Debugging Reactive Time

### Track Dependencies

See what triggers updates:

```typescript
import { onTrack, onTrigger } from '@vue/reactivity'

const month = computed(() => {
  return usePeriod(temporal, 'month').value
}, {
  onTrack(e) {
    console.log('Tracking:', e)
  },
  onTrigger(e) {
    console.log('Triggered by:', e)
  }
})
```

### Debug Subscriptions

Monitor active subscriptions:

```typescript
let subscriptionCount = 0

function debugWatch(source, callback) {
  subscriptionCount++
  console.log(`Active subscriptions: ${subscriptionCount}`)
  
  const stop = watch(source, callback)
  
  return () => {
    subscriptionCount--
    console.log(`Active subscriptions: ${subscriptionCount}`)
    stop()
  }
}
```

## See Also

- [Framework Agnostic](/guide/framework-agnostic) - How it works without Vue
- [usePeriod](/api/composables/use-period) - Main reactive composable
- [Vue Integration](/examples/frameworks/vue-integration) - Vue examples
- [React Integration](/examples/frameworks/react-integration) - React examples