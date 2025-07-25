# Stable Month Calendar

Create a calendar grid that always displays exactly 6 weeks (42 days), preventing layout shifts between months.

## The Problem

Regular calendars can have different numbers of weeks:
- February 2021: 4 weeks (starting on Monday)
- March 2024: 6 weeks (when 1st is Friday)

This causes annoying layout jumps when navigating between months.

## The Solution

Calculate a stable 6-week grid that includes padding days from adjacent months:

```typescript
import { createTemporal, usePeriod, divide, isSame } from 'usetemporal'

function createStableMonthGrid(temporal, month) {
  // Get all days in the month
  const monthDays = divide(temporal, month, 'day')
  const firstDay = monthDays[0]
  const lastDay = monthDays[monthDays.length - 1]
  
  // Calculate padding needed at start
  const firstDayOfWeek = firstDay.date.getDay()
  const startPadding = (firstDayOfWeek - temporal.weekStartsOn + 7) % 7
  
  // Get the start date (may be in previous month)
  const gridStart = new Date(firstDay.start)
  gridStart.setDate(gridStart.getDate() - startPadding)
  
  // Create exactly 42 days
  const days = []
  const current = new Date(gridStart)
  
  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current >= firstDay.start && current < lastDay.end
    })
    current.setDate(current.getDate() + 1)
  }
  
  return days
}
```

## Vue Component

```vue
<template>
  <div class="calendar">
    <header>
      <button @click="navigatePrevious">←</button>
      <h2>{{ monthName }} {{ year }}</h2>
      <button @click="navigateNext">→</button>
    </header>

    <!-- Weekday headers -->
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>

    <!-- 6x7 Grid -->
    <div class="days-grid">
      <div
        v-for="(day, index) in stableDays"
        :key="index"
        :class="getDayClasses(day)"
        @click="selectDate(day.date)"
      >
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, next, previous, isSame, toPeriod } from 'usetemporal'

const temporal = createTemporal({ 
  date: new Date(),
  weekStartsOn: 1 // Monday
})

const month = usePeriod(temporal, 'month')

const monthName = computed(() => 
  month.value.date.toLocaleDateString('en', { month: 'long' })
)
const year = computed(() => month.value.date.getFullYear())

const weekdays = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // Rotate based on weekStartsOn
  return [...days.slice(temporal.weekStartsOn), ...days.slice(0, temporal.weekStartsOn)]
})

const stableDays = computed(() => {
  const monthDays = divide(temporal, month.value, 'day')
  const firstDay = monthDays[0]
  const lastDay = monthDays[monthDays.length - 1]
  
  // Calculate padding
  const firstDayOfWeek = firstDay.date.getDay()
  const startPadding = (firstDayOfWeek - temporal.weekStartsOn + 7) % 7
  
  // Get grid start date
  const gridStart = new Date(firstDay.start)
  gridStart.setDate(gridStart.getDate() - startPadding)
  
  // Generate exactly 42 days
  const days = []
  const current = new Date(gridStart)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(current)
    days.push({
      date,
      isCurrentMonth: date >= firstDay.start && date < lastDay.end,
      period: toPeriod(temporal, date, 'day')
    })
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

const getDayClasses = (day) => ({
  'day': true,
  'other-month': !day.isCurrentMonth,
  'today': isSame(temporal, day.period, temporal.now.value, 'day'),
  'weekend': day.date.getDay() === 0 || day.date.getDay() === 6
})

const navigatePrevious = () => {
  temporal.browsing.value = previous(temporal, month.value)
}

const navigateNext = () => {
  temporal.browsing.value = next(temporal, month.value)
}

const selectDate = (date) => {
  console.log('Selected:', date)
}
</script>

<style scoped>
.calendar {
  max-width: 400px;
  margin: 0 auto;
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
  gap: 2px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
}

.day:hover {
  background: #f0f0f0;
}

.day.other-month {
  color: #ccc;
  background: #fafafa;
}

.day.today {
  background: #2196f3;
  color: white;
  font-weight: bold;
}

.day.weekend {
  background: #f5f5f5;
}
</style>
```

## React Component

```jsx
import React, { useMemo } from 'react'
import { createTemporal, usePeriod, divide, next, previous, isSame, toPeriod } from 'usetemporal'

function StableCalendar() {
  const temporal = useMemo(() => 
    createTemporal({ 
      date: new Date(),
      weekStartsOn: 1 // Monday
    }), []
  )
  
  const month = usePeriod(temporal, 'month')
  
  const monthName = month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
  
  const weekdays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return [...days.slice(temporal.weekStartsOn), ...days.slice(0, temporal.weekStartsOn)]
  }, [temporal.weekStartsOn])
  
  const stableDays = useMemo(() => {
    const monthDays = divide(temporal, month.value, 'day')
    const firstDay = monthDays[0]
    const lastDay = monthDays[monthDays.length - 1]
    
    // Calculate padding
    const firstDayOfWeek = firstDay.date.getDay()
    const startPadding = (firstDayOfWeek - temporal.weekStartsOn + 7) % 7
    
    // Get grid start date
    const gridStart = new Date(firstDay.start)
    gridStart.setDate(gridStart.getDate() - startPadding)
    
    // Generate exactly 42 days
    const days = []
    const current = new Date(gridStart)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(current)
      days.push({
        date,
        isCurrentMonth: date >= firstDay.start && date < lastDay.end,
        period: toPeriod(temporal, date, 'day')
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [month.value])
  
  const getDayClasses = (day) => {
    const classes = ['day']
    if (!day.isCurrentMonth) classes.push('other-month')
    if (isSame(temporal, day.period, temporal.now.value, 'day')) classes.push('today')
    if (day.date.getDay() === 0 || day.date.getDay() === 6) classes.push('weekend')
    return classes.join(' ')
  }
  
  const navigatePrevious = () => {
    temporal.browsing.value = previous(temporal, month.value)
  }
  
  const navigateNext = () => {
    temporal.browsing.value = next(temporal, month.value)
  }
  
  return (
    <div className="calendar">
      <header>
        <button onClick={navigatePrevious}>←</button>
        <h2>{monthName}</h2>
        <button onClick={navigateNext}>→</button>
      </header>
      
      <div className="weekdays">
        {weekdays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      <div className="days-grid">
        {stableDays.map((day, index) => (
          <div 
            key={index}
            className={getDayClasses(day)}
            onClick={() => console.log('Selected:', day.date)}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StableCalendar
```

## Benefits

1. **No Layout Shifts**: Always exactly 6 rows × 7 columns
2. **Better UX**: Smooth transitions between months
3. **Simpler CSS**: Fixed grid dimensions
4. **Context**: Shows adjacent month days
5. **International**: Respects week start configuration

## Example Output

February 2024 (Monday start):
```
Mon Tue Wed Thu Fri Sat Sun
29  30  31   1   2   3   4    ← Jan | Feb
 5   6   7   8   9  10  11
12  13  14  15  16  17  18
19  20  21  22  23  24  25
26  27  28  29   1   2   3    ← Feb | Mar
 4   5   6   7   8   9  10    ← March
```

## See Also

- [Month Calendar](/examples/calendars/month-calendar) - Basic month view
- [Calendar Examples](/examples/calendar) - More calendar patterns
- [divide() Pattern](/guide/patterns/divide-pattern) - Understanding divide()
