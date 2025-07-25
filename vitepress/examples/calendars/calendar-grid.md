# Calendar Grid Examples

This page demonstrates various ways to create calendar grids using useTemporal's divide() pattern.

## Basic Calendar Grid

Create a simple calendar grid with day cells:

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

// Add padding for first week
const firstDay = days[0]
const startPadding = (firstDay.date.getDay() + 6) % 7 // Monday = 0

const calendarGrid = [
  ...Array(startPadding).fill(null),
  ...days
]
```

## Vue Calendar Component

A complete calendar component with Vue 3:

```vue
<template>
  <div class="calendar-grid">
    <div 
      v-for="day in days" 
      :key="day.date.toISOString()"
      :class="{ 
        today: isToday(day),
        weekend: isWeekend(day)
      }"
    >
      {{ day.date.getDate() }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const isToday = (day) => 
  isSame(temporal, day.date, new Date(), 'day')

const isWeekend = (day) => {
  const dow = day.date.getDay()
  return dow === 0 || dow === 6
}
</script>

<style>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.today {
  background: #e3f2fd;
  font-weight: bold;
}

.weekend {
  color: #666;
}
</style>
```

## React Calendar Component

Calendar implementation with React:

```tsx
import React, { useMemo } from 'react'
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'

export function Calendar() {
  const temporal = useMemo(() => 
    createTemporal({ date: new Date() }), []
  )
  
  const month = usePeriod(temporal, 'month')
  const days = useMemo(() => 
    divide(temporal, month.value, 'day'), [month.value]
  )
  
  const isToday = (day) => 
    isSame(temporal, day.date, new Date(), 'day')
  
  const isWeekend = (day) => {
    const dow = day.date.getDay()
    return dow === 0 || dow === 6
  }
  
  return (
    <div className="calendar-grid">
      {days.map((day) => (
        <div 
          key={day.date.toISOString()}
          className={`
            ${isToday(day) ? 'today' : ''}
            ${isWeekend(day) ? 'weekend' : ''}
          `}
        >
          {day.date.getDate()}
        </div>
      ))}
    </div>
  )
}
```

## Calendar with Week Headers

Add day-of-week headers:

```typescript
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// In your template
<div class="calendar">
  <div class="week-headers">
    <div v-for="day in weekDays" :key="day">{{ day }}</div>
  </div>
  <div class="calendar-grid">
    <!-- Calendar days here -->
  </div>
</div>
```

## Calendar with Previous/Next Month Days

Show days from adjacent months:

```typescript
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

// Get first day of month and its day of week
const firstDay = days[0]
const startDayOfWeek = (firstDay.date.getDay() + 6) % 7 // Monday = 0

// Get previous month's last days
const prevMonth = previous(temporal, month.value)
const prevDays = divide(temporal, prevMonth, 'day')
const prevMonthDays = prevDays.slice(-startDayOfWeek)

// Get next month's first days
const totalCells = 42 // 6 rows × 7 days
const nextMonth = next(temporal, month.value)
const nextDays = divide(temporal, nextMonth, 'day')
const remainingCells = totalCells - days.length - prevMonthDays.length
const nextMonthDays = nextDays.slice(0, remainingCells)

// Combine all days
const calendarDays = [
  ...prevMonthDays.map(d => ({ ...d, otherMonth: true })),
  ...days,
  ...nextMonthDays.map(d => ({ ...d, otherMonth: true }))
]
```

## Mini Calendar

A compact calendar for date pickers:

```vue
<template>
  <div class="mini-calendar">
    <div class="header">
      <button @click="goToPrevMonth">‹</button>
      <span>{{ monthLabel }}</span>
      <button @click="goToNextMonth">›</button>
    </div>
    
    <div class="days-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.date.toISOString()"
        :class="getDayClasses(day)"
        @click="selectDay(day)"
      >
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, next, previous } from 'usetemporal'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const temporal = createTemporal({ date: props.modelValue || new Date() })
const month = usePeriod(temporal, 'month')

const monthLabel = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)

const calendarDays = computed(() => {
  const days = divide(temporal, month.value, 'day')
  // Add padding logic here
  return days
})

const goToPrevMonth = () => {
  temporal.browsing.value = previous(temporal, month.value)
}

const goToNextMonth = () => {
  temporal.browsing.value = next(temporal, month.value)
}

const selectDay = (day) => {
  emit('update:modelValue', day.date)
}

const getDayClasses = (day) => {
  return {
    selected: isSame(temporal, day.date, props.modelValue, 'day'),
    today: isSame(temporal, day.date, new Date(), 'day')
  }
}
</script>
```

## Calendar with Events

Display events on calendar days:

```typescript
interface Event {
  id: string
  title: string
  date: Date
}

const events: Event[] = [
  { id: '1', title: 'Meeting', date: new Date(2024, 2, 15) },
  { id: '2', title: 'Birthday', date: new Date(2024, 2, 20) }
]

// Group events by day
const eventsByDay = computed(() => {
  const map = new Map()
  
  events.forEach(event => {
    const dayKey = event.date.toDateString()
    if (!map.has(dayKey)) {
      map.set(dayKey, [])
    }
    map.get(dayKey).push(event)
  })
  
  return map
})

// In template
<div v-for="day in days" :key="day.date.toISOString()">
  <div class="day-number">{{ day.date.getDate() }}</div>
  <div class="events">
    <div 
      v-for="event in eventsByDay.get(day.date.toDateString()) || []"
      :key="event.id"
      class="event"
    >
      {{ event.title }}
    </div>
  </div>
</div>
```

## See Also

- [Basic Calendar Example](/examples/calendar)
- [Stable Month Calendar](/examples/stable-month-calendar)
- [divide() API Reference](/api/operations/divide)
- [Calendar Systems History](/resources/calendar-systems-history)