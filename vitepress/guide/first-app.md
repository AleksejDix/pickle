# Your First App

Let's build a simple calendar navigation to understand useTemporal's power.

## Basic Setup

First, create a temporal instance:

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create temporal instance
const temporal = createTemporal()

// Get current month
const month = usePeriod(temporal, 'month')

// Divide into days
const days = divide(temporal, month.value, 'day')

console.log(`${month.value.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}`)
console.log(`This month has ${days.length} days`)
```

## Add Navigation

Navigate between time periods:

```typescript
import { next, previous, go } from 'usetemporal'

// Navigate to next month
temporal.browsing.value = next(temporal, month.value)

// Navigate to previous month  
temporal.browsing.value = previous(temporal, month.value)

// Jump 3 months ahead
temporal.browsing.value = go(temporal, month.value, 3)
```

## Simple Calendar Component

Here's a minimal calendar showing the divide pattern:

```vue
<template>
  <div>
    <header>
      <button @click="goMonth(-1)">←</button>
      <h2>{{ monthName }}</h2>
      <button @click="goMonth(1)">→</button>
    </header>
    
    <div class="days">
      <div v-for="day in days" :key="day.date.toISOString()">
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, go } from 'usetemporal'

const temporal = createTemporal()
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const monthName = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)

function goMonth(direction) {
  temporal.browsing.value = go(temporal, month.value, direction)
}
</script>

<style scoped>
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
</style>
```

## What's Happening?

1. **Reactive Updates**: When `temporal.browsing` changes, `month` updates automatically
2. **Automatic Recalculation**: The `days` computed property recalculates when month changes
3. **Clean Navigation**: The `go()` function creates new periods without mutations

## Try These Experiments

1. **Show week numbers**:
```typescript
const weeks = divide(temporal, month.value, 'week')
console.log(`This month spans ${weeks.length} weeks`)
```

2. **Highlight today**:
```typescript
import { isSame } from 'usetemporal'

const isToday = (day) => 
  isSame(temporal, day.date, new Date(), 'day')
```

3. **Show hours in a day**:
```typescript
const today = days.find(d => isToday(d))
const hours = divide(temporal, today, 'hour')
```

## Next Steps

- See [Complete Examples](/examples/) for full implementations
- Learn about [Operations](/guide/operations) 
- Explore [Date Adapters](/guide/adapters)