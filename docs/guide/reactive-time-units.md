# Reactive Time Units

useTemporal's reactive time units are the core building blocks that make working with time intuitive and powerful. This guide explains how reactivity works and how to leverage it in your applications.

## Understanding Reactivity

useTemporal uses Vue's reactivity system (`@vue/reactivity`) to create time units that automatically update when their underlying values change. This means your UI and computed values stay in sync with time changes without manual updates.

```typescript
const temporal = createTemporal()
const hour = useHour(temporal)

// These values are reactive and update automatically
console.log(hour.name.value)   // "3 PM"
console.log(hour.number.value) // 15

// When time changes, values update automatically
hour.future() // Navigate to next hour
console.log(hour.name.value)   // "4 PM" - automatically updated!
```

## Time Unit Structure

Every time unit shares the same reactive structure:

```typescript
interface TimeUnit {
  // Reactive properties
  name: Ref<string>      // Human-readable name
  number: Ref<number>    // Numeric value
  start: Ref<Date>       // Start of the unit
  end: Ref<Date>         // End of the unit
  
  // Navigation methods
  past(): void           // Go to previous unit
  future(): void         // Go to next unit
  now(): void           // Go to current unit
}
```

## Available Time Units

useTemporal provides composables for all common time units:

### Year
```typescript
const year = useYear(temporal)
year.name.value   // "2024"
year.number.value // 2024
year.start.value  // Jan 1, 2024 00:00:00
year.end.value    // Dec 31, 2024 23:59:59
```

### Month
```typescript
const month = useMonth(temporal)
month.name.value   // "March"
month.number.value // 3 (1-indexed)
month.start.value  // Mar 1, 2024 00:00:00
month.end.value    // Mar 31, 2024 23:59:59
```

### Week
```typescript
const week = useWeek(temporal)
week.name.value   // "Week 12"
week.number.value // 12 (week of year)
week.start.value  // Sunday 00:00:00
week.end.value    // Saturday 23:59:59
```

### Day
```typescript
const day = useDay(temporal)
day.name.value   // "Monday"
day.number.value // 15 (day of month)
day.start.value  // Mar 15, 2024 00:00:00
day.end.value    // Mar 15, 2024 23:59:59
```

### Hour
```typescript
const hour = useHour(temporal)
hour.name.value   // "3 PM"
hour.number.value // 15 (24-hour format)
hour.start.value  // Mar 15, 2024 15:00:00
hour.end.value    // Mar 15, 2024 15:59:59
```

### Minute
```typescript
const minute = useMinute(temporal)
minute.name.value   // "3:45 PM"
minute.number.value // 45
minute.start.value  // Mar 15, 2024 15:45:00
minute.end.value    // Mar 15, 2024 15:45:59
```

### Quarter
```typescript
const quarter = useQuarter(temporal)
quarter.name.value   // "Q1"
quarter.number.value // 1
quarter.start.value  // Jan 1, 2024 00:00:00
quarter.end.value    // Mar 31, 2024 23:59:59
```

## Reactivity in Frameworks

### Vue 3
Time units work seamlessly with Vue's reactivity:

```vue
<template>
  <div>
    <h1>{{ year.name.value }}</h1>
    <p>Day: {{ day.number.value }}</p>
    <button @click="day.future()">Next Day</button>
  </div>
</template>

<script setup>
import { createTemporal, useYear, useDay } from 'usetemporal'

const temporal = createTemporal()
const year = useYear(temporal)
const day = useDay(temporal)
</script>
```

### React
Use the reactive values with state updates:

```jsx
import { useState, useEffect } from 'react'
import { createTemporal, useMonth } from 'usetemporal'

function Calendar() {
  const [temporal] = useState(() => createTemporal())
  const [month] = useState(() => useMonth(temporal))
  const [monthName, setMonthName] = useState(month.name.value)
  
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = month.name.subscribe(value => {
      setMonthName(value)
    })
    return unsubscribe
  }, [month])
  
  return (
    <div>
      <h2>{monthName}</h2>
      <button onClick={() => month.future()}>Next</button>
    </div>
  )
}
```

### Vanilla JavaScript
Access reactive values directly:

```javascript
const temporal = createTemporal()
const hour = useHour(temporal)

// Get current values
console.log(hour.name.value)

// Watch for changes
hour.name.subscribe(value => {
  document.getElementById('hour').textContent = value
})

// Navigate
document.getElementById('next').onclick = () => hour.future()
```

## Computed Values

Create derived reactive values using computed:

```typescript
import { computed } from '@vue/reactivity'

const temporal = createTemporal()
const day = useDay(temporal)
const hour = useHour(temporal)

// Computed greeting based on time
const greeting = computed(() => {
  const h = hour.number.value
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

// Computed date display
const dateDisplay = computed(() => {
  return `${day.name.value}, ${hour.name.value}`
})
```

## Watching Changes

React to time unit changes:

```typescript
import { watch, watchEffect } from '@vue/reactivity'

const temporal = createTemporal()
const month = useMonth(temporal)

// Watch specific property
watch(month.number, (newMonth, oldMonth) => {
  console.log(`Month changed from ${oldMonth} to ${newMonth}`)
})

// Watch multiple properties
watchEffect(() => {
  console.log(`Current month: ${month.name.value} (${month.number.value})`)
})
```

## Performance Optimization

### Efficient Updates
Reactive updates are batched for performance:

```typescript
const day = useDay(temporal)

// Multiple navigations are batched
day.future()
day.future()
day.future()
// Only triggers one update cycle
```

### Lazy Evaluation
Properties are only computed when accessed:

```typescript
const year = useYear(temporal)
// No computation happens yet

console.log(year.name.value) // Now it computes
```

### Memory Management
Unsubscribe from watchers when done:

```typescript
const unsubscribe = hour.name.subscribe(value => {
  console.log(value)
})

// Clean up when done
unsubscribe()
```

## Advanced Patterns

### Custom Reactive Time Units
Create your own reactive time units:

```typescript
import { ref, computed } from '@vue/reactivity'

function useBusinessDay(temporal) {
  const day = useDay(temporal)
  
  const isBusinessDay = computed(() => {
    const dayNum = new Date(day.start.value).getDay()
    return dayNum !== 0 && dayNum !== 6 // Not weekend
  })
  
  return {
    ...day,
    isBusinessDay
  }
}
```

### Synchronized Time Units
Multiple units stay in sync automatically:

```typescript
const temporal = createTemporal()
const year = useYear(temporal)
const month = useMonth(temporal)
const day = useDay(temporal)

// Navigate day
day.future()

// Year and month update automatically if day crosses boundaries
console.log(year.number.value)  // Updates if year changes
console.log(month.name.value)   // Updates if month changes
```

### Reactive Divide Pattern
The divide pattern returns reactive arrays:

```typescript
const year = useYear(temporal)
const months = temporal.divide(year, 'month')

// months is a reactive array
watchEffect(() => {
  console.log(`Year has ${months.length} months`)
  months.forEach(m => {
    console.log(m.name.value) // Each month is reactive
  })
})
```

## Best Practices

1. **Access Values Properly**: Always use `.value` to access reactive values
2. **Clean Up Subscriptions**: Unsubscribe from watchers to prevent memory leaks
3. **Batch Updates**: Group multiple navigations for better performance
4. **Use Computed**: Create computed values for derived state
5. **Framework Integration**: Use framework-specific patterns for optimal integration

## Troubleshooting

### Values Not Updating
Ensure you're accessing the `.value` property:
```typescript
// Wrong
console.log(hour.name) // RefImpl object

// Correct
console.log(hour.name.value) // "3 PM"
```

### Memory Leaks
Always clean up subscriptions:
```typescript
// In component lifecycle
onMounted(() => {
  const unsubscribe = hour.name.subscribe(handler)
  onUnmounted(() => unsubscribe())
})
```

### Performance Issues
Use `watchEffect` for multiple dependencies:
```typescript
// Less efficient
watch(day.name, handler)
watch(hour.name, handler)

// More efficient
watchEffect(() => {
  handler(day.name.value, hour.name.value)
})
```

## Next Steps

- Learn about the [divide pattern](/guide/divide-pattern)
- Explore [framework integration](/guide/framework-agnostic)
- See [examples](/examples/basic-usage) of reactive time units in action