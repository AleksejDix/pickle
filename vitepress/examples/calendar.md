# Calendar Examples

Complete calendar implementations in different frameworks.

## Month Calendar

A full-featured month calendar with navigation and selection:

::: code-group

```vue [Vue.js]
<template>
  <div class="calendar">
    <!-- Navigation -->
    <header>
      <button @click="navigateMonth(-1)">Previous</button>
      <h2>{{ monthLabel }}</h2>
      <button @click="navigateMonth(1)">Next</button>
    </header>
    
    <!-- Week days header -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>
    
    <!-- Calendar grid -->
    <div class="days-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        :class="{
          empty: !day,
          today: day && isToday(day),
          weekend: day && isWeekend(day)
        }"
        @click="day && selectDay(day)"
      >
        {{ day?.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, go, isSame } from 'usetemporal'

const temporal = createTemporal({ weekStartsOn: 1 })
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthLabel = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)

const calendarDays = computed(() => {
  const allDays = days.value
  const firstDay = allDays[0]
  const startPadding = (firstDay.date.getDay() + 6) % 7
  
  const calendar = Array(startPadding).fill(null)
  calendar.push(...allDays)
  
  while (calendar.length % 7 !== 0) {
    calendar.push(null)
  }
  
  return calendar
})

function navigateMonth(direction) {
  temporal.browsing.value = go(temporal, month.value, direction)
}

function selectDay(day) {
  temporal.browsing.value = day
  console.log('Selected:', day.date)
}

function isToday(day) {
  return isSame(temporal, day.date, new Date(), 'day')
}

function isWeekend(day) {
  const dayOfWeek = day.date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}
</script>

<style scoped>
.calendar {
  max-width: 400px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.days-grid > div {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  cursor: pointer;
}

.days-grid > div:not(.empty):hover {
  background: #e0e0e0;
}

.today {
  background: #007aff !important;
  color: white;
}

.weekend {
  color: #ff3b30;
}

.empty {
  cursor: default !important;
  background: transparent !important;
}
</style>
```

```tsx [React]
import React, { useMemo } from 'react'
import { createTemporal, usePeriod, divide, go, isSame } from 'usetemporal'

function Calendar() {
  const temporal = useMemo(() => 
    createTemporal({ weekStartsOn: 1 }), []
  )
  
  const month = usePeriod(temporal, 'month')
  const days = useMemo(() => 
    divide(temporal, month.value, 'day'), 
    [month.value]
  )
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  const monthLabel = month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
  
  const calendarDays = useMemo(() => {
    const firstDay = days[0]
    const startPadding = (firstDay.date.getDay() + 6) % 7
    
    const calendar = Array(startPadding).fill(null)
    calendar.push(...days)
    
    while (calendar.length % 7 !== 0) {
      calendar.push(null)
    }
    
    return calendar
  }, [days])
  
  const navigateMonth = (direction) => {
    temporal.browsing.value = go(temporal, month.value, direction)
  }
  
  const selectDay = (day) => {
    temporal.browsing.value = day
    console.log('Selected:', day.date)
  }
  
  const isToday = (day) => 
    isSame(temporal, day.date, new Date(), 'day')
  
  const isWeekend = (day) => {
    const dayOfWeek = day.date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }
  
  return (
    <div className="calendar">
      <header>
        <button onClick={() => navigateMonth(-1)}>Previous</button>
        <h2>{monthLabel}</h2>
        <button onClick={() => navigateMonth(1)}>Next</button>
      </header>
      
      <div className="weekdays">
        {weekDays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      <div className="days-grid">
        {calendarDays.map((day, index) => (
          <div 
            key={index}
            className={`
              ${!day ? 'empty' : ''}
              ${day && isToday(day) ? 'today' : ''}
              ${day && isWeekend(day) ? 'weekend' : ''}
            `}
            onClick={() => day && selectDay(day)}
          >
            {day?.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
```

```svelte [Svelte]
<script>
  import { createTemporal, usePeriod, divide, go, isSame } from 'usetemporal'
  
  const temporal = createTemporal({ weekStartsOn: 1 })
  const month = usePeriod(temporal, 'month')
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  $: days = divide(temporal, $month, 'day')
  $: firstDay = days[0]
  $: startPadding = (firstDay.date.getDay() + 6) % 7
  
  $: monthLabel = $month.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
  
  $: calendarDays = [
    ...Array(startPadding).fill(null),
    ...days,
    ...Array((7 - ((startPadding + days.length) % 7)) % 7).fill(null)
  ]
  
  function navigateMonth(direction) {
    temporal.browsing.value = go(temporal, $month, direction)
  }
  
  function selectDay(day) {
    temporal.browsing.value = day
    console.log('Selected:', day.date)
  }
  
  function isToday(day) {
    return isSame(temporal, day.date, new Date(), 'day')
  }
  
  function isWeekend(day) {
    const dayOfWeek = day.date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }
</script>

<div class="calendar">
  <header>
    <button on:click={() => navigateMonth(-1)}>Previous</button>
    <h2>{monthLabel}</h2>
    <button on:click={() => navigateMonth(1)}>Next</button>
  </header>
  
  <div class="weekdays">
    {#each weekDays as day}
      <div>{day}</div>
    {/each}
  </div>
  
  <div class="days-grid">
    {#each calendarDays as day, i}
      <div 
        class:empty={!day}
        class:today={day && isToday(day)}
        class:weekend={day && isWeekend(day)}
        on:click={() => day && selectDay(day)}
      >
        {day?.date.getDate() || ''}
      </div>
    {/each}
  </div>
</div>
```

:::

## Year Overview

Display an entire year with month statistics:

```typescript
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'

function createYearOverview(temporal) {
  const year = usePeriod(temporal, 'year')
  const months = computed(() => divide(temporal, year.value, 'month'))
  
  const overview = computed(() => 
    months.value.map(month => {
      const days = divide(temporal, month, 'day')
      const weeks = Math.ceil((days[0].date.getDay() + days.length) / 7)
      
      const workDays = days.filter(day => {
        const dow = day.date.getDay()
        return dow >= 1 && dow <= 5
      })
      
      return {
        name: month.date.toLocaleDateString('en', { month: 'long' }),
        totalDays: days.length,
        workDays: workDays.length,
        weekends: days.length - workDays.length,
        weeks: weeks,
        hasToday: days.some(day => 
          isSame(temporal, day.date, new Date(), 'day')
        )
      }
    })
  )
  
  return { year, overview }
}
```

## Time Picker

Create time slots with business hours:

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

function createTimePicker(temporal) {
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
      
      // Create 30-minute slots
      for (let i = 0; i < 60; i += 30) {
        slots.push({
          label: `${hour.date.getHours().toString().padStart(2, '0')}:${i.toString().padStart(2, '0')}`,
          available: minutes[i].date > new Date(),
          period: minutes[i]
        })
      }
    })
    
    return slots
  })
  
  return { day, timeSlots }
}
```

## Week View

Show a week with hourly breakdown:

```typescript
const week = usePeriod(temporal, 'week')
const days = computed(() => divide(temporal, week.value, 'day'))

const weekView = computed(() => 
  days.value.map(day => ({
    name: day.date.toLocaleDateString('en', { weekday: 'short' }),
    date: day.date.getDate(),
    hours: divide(temporal, day, 'hour').map(hour => ({
      time: hour.date.getHours(),
      isBusinessHour: hour.date.getHours() >= 9 && hour.date.getHours() < 17
    }))
  }))
)