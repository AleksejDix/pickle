# The divide() Pattern

The `divide()` pattern is the **revolutionary core feature** that sets useTemporal apart from every other date library. It enables hierarchical time subdivision with perfect synchronization between parent and child time units.

## What Makes It Revolutionary

Unlike traditional date libraries that treat time as isolated points, useTemporal introduces a **hierarchical time model** where any time period can be subdivided into smaller units while maintaining reactive synchronization.

::: info Why This Matters
Traditional approaches require manual calculation and state management for time subdivisions. The divide() pattern automates this with a single, elegant function call.
:::

## Core Concept

Think of time as a **tree structure** where each node can be subdivided into smaller units:

```mermaid
graph TD
    Y[Year 2024] --> M1[January]
    Y --> M2[February]
    Y --> M3[March]
    M1 --> W1[Week 1]
    M1 --> W2[Week 2]
    M1 --> W3[Week 3]
    M1 --> W4[Week 4]
    W1 --> D1[Day 1]
    W1 --> D2[Day 2]
    W1 --> D3[Day 3]
    D1 --> H1[Hour 0]
    D1 --> H2[Hour 1]
    D1 --> H3[Hour 2]
```

## Basic Usage

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

const temporal = createTemporal({
  adapter: createNativeAdapter()
})

// Get the current year as a reactive period
const year = usePeriod(temporal, 'year')

// Divide year into months - returns exactly 12 month periods
const months = divide(temporal, year.value, 'month')
console.log(months.length) // 12

// Each month is a Period object
const january = months[0]
console.log(january.date) // Date object for January 1st
console.log(january.start) // Start of January
console.log(january.end) // End of January

// Continue dividing - get all days in January
const days = divide(temporal, january, 'day')
console.log(days.length) // 31 (for January)

// Each day is a Period
const firstDay = days[0]
console.log(firstDay.date) // Date object for January 1st
```

## Key Features

### 1. Infinite Subdivision

You can divide time units as deep as needed, creating a complete hierarchy:

```typescript
const year = usePeriod(temporal, 'year')

// Level 1: Year → Months
const months = divide(temporal, year.value, 'month')

// Level 2: Month → Days
const days = divide(temporal, months[0], 'day')

// Level 3: Day → Hours
const hours = divide(temporal, days[0], 'hour')

// Level 4: Hour → Minutes
const minutes = divide(temporal, hours[0], 'minute')

// Level 5: Minute → Seconds
const seconds = divide(temporal, minutes[0], 'second')
```

### 2. Perfect Synchronization

All subdivisions automatically update when their parent changes:

```typescript
import { watch } from '@vue/reactivity'

const month = usePeriod(temporal, 'month')

// Create reactive subdivisions
const days = computed(() => divide(temporal, month.value, 'day'))

// Initial state - January has 31 days
console.log(days.value.length) // 31

// Navigate to February
temporal.browsing.value = next(temporal, month.value)

// Days automatically update!
console.log(days.value.length) // 28 or 29
```

### 3. Type-Safe Operations

Every operation is fully type-safe:

```typescript
// TypeScript knows these are valid units
const validDays = divide(temporal, month.value, 'day') // ✅
const validHours = divide(temporal, day, 'hour') // ✅

// TypeScript catches invalid operations
// const invalid = divide(temporal, month.value, 'invalid') // ❌ Type error
```

## Real-World Examples

### Building a Calendar View

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

function createCalendarMonth(temporal: Temporal) {
  const month = usePeriod(temporal, 'month')
  const days = computed(() => divide(temporal, month.value, 'day'))
  
  const calendarGrid = computed(() => {
    const allDays = days.value
    const firstDay = allDays[0]
    const startPadding = firstDay.date.getDay()
    
    // Create calendar grid with padding
    const grid = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startPadding; i++) {
      grid.push(null)
    }
    
    // Add all days of the month
    allDays.forEach(day => {
      grid.push({
        number: day.date.getDate(),
        isToday: isSame(temporal, day.date, new Date(), 'day'),
        isWeekend: day.date.getDay() === 0 || day.date.getDay() === 6,
        period: day
      })
    })
    
    // Group into weeks
    const weeks = []
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7))
    }
    
    return weeks
  })
  
  return { month, days, calendarGrid }
}
```

### Creating a Year Heatmap

```typescript
function createYearHeatmap(temporal: Temporal, data: Map<string, number>) {
  const year = usePeriod(temporal, 'year')
  const months = computed(() => divide(temporal, year.value, 'month'))
  
  const heatmap = computed(() => 
    months.value.map(month => {
      const days = divide(temporal, month, 'day')
      
      return {
        month: month.date.toLocaleDateString('en', { month: 'long' }),
        weeks: groupIntoWeeks(days.map(day => ({
          date: day.date,
          value: data.get(day.date.toISOString().split('T')[0]) || 0,
          weekDay: day.date.getDay()
        })))
      }
    })
  )
  
  return { year, heatmap }
}
```

### Building a Time Picker

```typescript
function createTimeSlots(temporal: Temporal, slotDuration = 30) {
  const day = usePeriod(temporal, 'day')
  const hours = computed(() => divide(temporal, day.value, 'hour'))
  
  const timeSlots = computed(() => {
    const slots = []
    
    // Business hours only (9 AM - 5 PM)
    const businessHours = hours.value.filter(hour => {
      const h = hour.date.getHours()
      return h >= 9 && h < 17
    })
    
    businessHours.forEach(hour => {
      const minutes = divide(temporal, hour, 'minute')
      
      // Create slots every 30 minutes
      for (let i = 0; i < 60; i += slotDuration) {
        const minute = minutes[i]
        slots.push({
          time: `${hour.date.getHours().toString().padStart(2, '0')}:${i.toString().padStart(2, '0')}`,
          hour: hour.date.getHours(),
          minute: i,
          isPast: minute.date < new Date(),
          isFuture: minute.date > new Date(),
          period: minute
        })
      }
    })
    
    return slots
  })
  
  return { day, timeSlots }
}
```

## Advanced Patterns

### Hierarchical Navigation

Create complex navigation structures with ease:

```typescript
import { ref, computed } from '@vue/reactivity'

interface DateNavigator {
  year: ComputedRef<Period>
  months: ComputedRef<Period[]>
  currentMonth: Ref<Period>
  days: ComputedRef<Period[]>
  
  selectMonth(index: number): void
  selectDay(day: Period): void
  goToToday(): void
}

function createDateNavigator(temporal: Temporal): DateNavigator {
  const year = usePeriod(temporal, 'year')
  const months = computed(() => divide(temporal, year.value, 'month'))
  const currentMonth = ref(months.value[new Date().getMonth()])
  
  const days = computed(() => 
    divide(temporal, currentMonth.value, 'day')
  )
  
  return {
    year,
    months,
    currentMonth,
    days,
    
    selectMonth(index: number) {
      currentMonth.value = months.value[index]
      temporal.browsing.value = months.value[index]
    },
    
    selectDay(day: Period) {
      temporal.browsing.value = day
    },
    
    goToToday() {
      temporal.browsing.value = toPeriod(temporal, new Date(), 'day')
    }
  }
}
```

### Comparative Analysis

Compare multiple time periods easily:

```typescript
function compareYears(year1: number, year2: number) {
  const temp1 = createTemporal({
    adapter: createNativeAdapter(),
    date: new Date(year1, 0, 1)
  })
  const temp2 = createTemporal({
    adapter: createNativeAdapter(),
    date: new Date(year2, 0, 1)
  })
  
  const y1 = usePeriod(temp1, 'year')
  const y2 = usePeriod(temp2, 'year')
  
  const months1 = divide(temp1, y1.value, 'month')
  const months2 = divide(temp2, y2.value, 'month')
  
  return months1.map((month1, index) => {
    const month2 = months2[index]
    const days1 = divide(temp1, month1, 'day')
    const days2 = divide(temp2, month2, 'day')
    
    return {
      month: month1.date.toLocaleDateString('en', { month: 'long' }),
      year1Days: days1.length,
      year2Days: days2.length,
      difference: days1.length - days2.length
    }
  })
}
```

## Working with Custom Units

The divide() pattern works with custom units too:

```typescript
import { defineUnit } from 'usetemporal'

// Define a business quarter (3 months)
defineUnit('businessQuarter', {
  duration: { months: 3 },
  validate: (adapter, date) => {
    const month = date.getMonth()
    return month % 3 === 0 // Must start on Jan, Apr, Jul, Oct
  }
})

// Now use it with divide()
const year = usePeriod(temporal, 'year')
const quarters = divide(temporal, year.value, 'businessQuarter') // 4 quarters

// Each quarter can be further divided
const q1Days = divide(temporal, quarters[0], 'day') // ~90 days
```

## Performance Optimization

### Lazy Evaluation

Subdivisions are created on-demand for optimal performance:

```typescript
const year = usePeriod(temporal, 'year')
const months = divide(temporal, year.value, 'month')
// Only 12 Period objects created

// Days are created only when accessed
const januaryDays = divide(temporal, months[0], 'day') // 31 objects
const februaryDays = divide(temporal, months[1], 'day') // 28/29 objects
```

### Efficient Updates

When using computed properties, subdivisions update efficiently:

```typescript
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

// Navigate to next month
temporal.browsing.value = next(temporal, month.value)

// Only the days array is recalculated, not the entire time tree
```

## Best Practices

### 1. Use Computed for Reactive Subdivisions

```typescript
// ✅ Good: Reactive subdivisions
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

// ❌ Avoid: Manual subdivision
let days = divide(temporal, month.value, 'day')
watch(month, () => {
  days = divide(temporal, month.value, 'day')
})
```

### 2. Cache Static Subdivisions

```typescript
// ✅ Good: Cache subdivisions that don't change
const year2024 = createPeriod(temporal, 'year', new Date(2024, 0, 1))
const months2024 = divide(temporal, year2024, 'month')

// Use cached months multiple times
const januaryDays = divide(temporal, months2024[0], 'day')
const februaryDays = divide(temporal, months2024[1], 'day')
```

### 3. Use Appropriate Granularity

```typescript
// ✅ Good: Only divide to the level you need
const hours = divide(temporal, day, 'hour')

// ❌ Avoid: Unnecessary deep subdivision
const seconds = hours
  .flatMap(hour => divide(temporal, hour, 'minute'))
  .flatMap(minute => divide(temporal, minute, 'second'))
```

## Framework Integration

The divide() pattern works seamlessly across all frameworks:

::: code-group

```vue [Vue.js]
<template>
  <div class="calendar">
    <div v-for="(week, i) in weeks" :key="i" class="week">
      <div
        v-for="(day, j) in week"
        :key="j"
        class="day"
        :class="{ 
          today: day && isSame(temporal, day.date, new Date(), 'day'),
          empty: !day 
        }"
      >
        {{ day?.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

const temporal = createTemporal({
  adapter: createNativeAdapter()
})

const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const weeks = computed(() => {
  const allDays = days.value
  const firstDay = allDays[0]
  const startPadding = (firstDay.date.getDay() + 6) % 7 // Monday = 0
  
  const weeks = []
  let week = Array(startPadding).fill(null)
  
  allDays.forEach(day => {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  })
  
  if (week.length > 0) {
    weeks.push([...week, ...Array(7 - week.length).fill(null)])
  }
  
  return weeks
})
</script>
```

```tsx [React]
import { useMemo } from 'react'
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

function Calendar() {
  const temporal = useMemo(() => createTemporal({
    adapter: createNativeAdapter()
  }), [])
  
  const month = usePeriod(temporal, 'month')
  const days = useMemo(() => 
    divide(temporal, month.value, 'day'),
    [month.value]
  )
  
  const weeks = useMemo(() => {
    const firstDay = days[0]
    const startPadding = (firstDay.date.getDay() + 6) % 7
    
    const weeks = []
    let week = Array(startPadding).fill(null)
    
    days.forEach(day => {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    })
    
    if (week.length > 0) {
      weeks.push([...week, ...Array(7 - week.length).fill(null)])
    }
    
    return weeks
  }, [days])
  
  return (
    <div className="calendar">
      {weeks.map((week, i) => (
        <div key={i} className="week">
          {week.map((day, j) => (
            <div
              key={j}
              className={`day ${
                day && isSame(temporal, day.date, new Date(), 'day') 
                  ? 'today' 
                  : ''
              } ${!day ? 'empty' : ''}`}
            >
              {day?.date.getDate()}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

```svelte [Svelte]
<script>
  import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'
  import { createNativeAdapter } from '@usetemporal/adapter-native'
  
  const temporal = createTemporal({
    adapter: createNativeAdapter()
  })
  
  const month = usePeriod(temporal, 'month')
  $: days = divide(temporal, $month, 'day')
  
  $: firstDay = days[0]
  $: startPadding = (firstDay.date.getDay() + 6) % 7
  
  $: weeks = (() => {
    const weeks = []
    let week = Array(startPadding).fill(null)
    
    days.forEach(day => {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    })
    
    if (week.length > 0) {
      weeks.push([...week, ...Array(7 - week.length).fill(null)])
    }
    
    return weeks
  })()
</script>

<div class="calendar">
  {#each weeks as week, i}
    <div class="week">
      {#each week as day, j}
        <div 
          class="day"
          class:today={day && isSame(temporal, day.date, new Date(), 'day')}
          class:empty={!day}
        >
          {day?.date.getDate() || ''}
        </div>
      {/each}
    </div>
  {/each}
</div>
```

:::

## Why divide() is Revolutionary

1. **No Manual Calculations**: Traditional libraries require you to calculate subdivisions manually. With divide(), it's automatic.

2. **Reactive by Default**: Changes propagate through the hierarchy automatically.

3. **Type-Safe**: Full TypeScript support ensures you can't divide incorrectly.

4. **Framework Agnostic**: Works identically across all JavaScript frameworks.

5. **Extensible**: Works with custom units just as well as built-in ones.

The divide() pattern transforms how we work with time in JavaScript, making complex time-based UIs simple and intuitive to build.