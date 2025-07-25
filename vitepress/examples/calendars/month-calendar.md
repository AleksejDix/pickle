# Month Calendar

A complete month calendar implementation using useTemporal.

## Basic Month Calendar

```vue
<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth">‹</button>
      <h2>{{ monthName }}</h2>
      <button @click="nextMonth">›</button>
    </div>
    
    <div class="calendar-grid">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
      
      <div 
        v-for="day in days" 
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
import { 
  usePeriod, 
  divide, 
  next, 
  previous,
  isSame,
  isWeekend,
  isToday
} from 'usetemporal'

const props = defineProps({
  temporal: {
    type: Object,
    required: true
  }
})

// Reactive month period
const month = usePeriod(props.temporal, 'month')

// Month name for header
const monthName = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)

// Days in the month
const days = computed(() => 
  divide(props.temporal, month.value, 'day')
)

// Weekday names
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Navigation
const previousMonth = () => {
  props.temporal.browsing.value = previous(props.temporal, month.value)
}

const nextMonth = () => {
  props.temporal.browsing.value = next(props.temporal, month.value)
}

// Day selection
const selectedDay = ref(null)
const selectDay = (day) => {
  selectedDay.value = day
}

// Day styling
const getDayClasses = (day) => ({
  'calendar-day': true,
  'weekend': isWeekend(day),
  'today': isToday(day, props.temporal),
  'selected': selectedDay.value && 
    isSame(props.temporal, day, selectedDay.value, 'day')
})
</script>

<style>
.calendar {
  width: 350px;
  font-family: system-ui;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.calendar-day:hover {
  background-color: #f0f0f0;
}

.weekend {
  color: #666;
}

.today {
  background-color: #e3f2fd;
  font-weight: bold;
}

.selected {
  background-color: #1976d2;
  color: white;
}
</style>
```

## Stable Month Calendar (6-week grid)

For a consistent 6-week calendar grid that always shows the same number of cells:

```vue
<template>
  <div class="stable-calendar">
    <!-- Same header as above -->
    
    <div class="calendar-grid">
      <div 
        v-for="day in stableDays" 
        :key="day.date.toISOString()"
        :class="getStableDayClasses(day)"
      >
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
// ... imports

const stableMonth = computed(() => 
  createPeriod(props.temporal, 'stableMonth', month.value)
)

const stableDays = computed(() => 
  divide(props.temporal, stableMonth.value, 'day')
)

const getStableDayClasses = (day) => ({
  'calendar-day': true,
  'weekend': isWeekend(day),
  'today': isToday(day, props.temporal),
  'other-month': !isSame(props.temporal, day, month.value, 'month'),
  'selected': selectedDay.value && 
    isSame(props.temporal, day, selectedDay.value, 'day')
})
</script>

<style>
.other-month {
  opacity: 0.3;
}
</style>
```

## With Events

Add event display to your calendar:

```vue
<template>
  <div class="calendar-with-events">
    <!-- Calendar grid -->
    <div 
      v-for="day in days" 
      :key="day.date.toISOString()"
      class="calendar-day"
    >
      <div class="day-number">{{ day.date.getDate() }}</div>
      
      <div class="day-events">
        <div 
          v-for="event in getEventsForDay(day)"
          :key="event.id"
          class="event-dot"
          :style="{ backgroundColor: event.color }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  temporal: Object,
  events: Array // [{ id, date, title, color }]
})

const getEventsForDay = (day) => {
  return props.events.filter(event => 
    isSame(props.temporal, 
      toPeriod(props.temporal, event.date, 'day'),
      day,
      'day'
    )
  )
}
</script>
```

## Usage

```vue
<template>
  <MonthCalendar :temporal="temporal" />
</template>

<script setup>
import { createTemporal } from 'usetemporal'
import MonthCalendar from './MonthCalendar.vue'

const temporal = createTemporal({ 
  date: new Date(),
  weekStartsOn: 1 // Monday
})
</script>
```

## See Also

- [Year Overview](/examples/calendars/year-overview) - Display full year
- [Mini Calendar](/examples/calendars/mini-calendar) - Compact calendar widget
- [divide() Pattern](/guide/patterns/divide-pattern) - Understanding divide()
- [Navigation](/guide/patterns/navigation) - Calendar navigation patterns