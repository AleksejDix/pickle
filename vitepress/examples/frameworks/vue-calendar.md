# Vue Calendar

A complete calendar implementation using Vue 3 and useTemporal.

## Full Calendar Component

```vue
<template>
  <div class="calendar-app">
    <CalendarHeader 
      :temporal="temporal"
      :currentPeriod="currentPeriod"
      @view-change="changeView"
    />
    
    <component 
      :is="viewComponent" 
      :temporal="temporal"
      :period="currentPeriod"
      @date-select="handleDateSelect"
    />
    
    <CalendarSidebar
      :temporal="temporal"
      :selectedDate="selectedDate"
      :events="events"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { createTemporal, usePeriod } from 'usetemporal'
import CalendarHeader from './CalendarHeader.vue'
import CalendarSidebar from './CalendarSidebar.vue'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import DayView from './DayView.vue'

// Initialize temporal
const temporal = createTemporal({ 
  date: new Date(),
  now: { interval: 60000 } // Update "now" every minute
})

// State
const currentView = ref('month')
const selectedDate = ref(null)
const events = ref([])

// Computed
const currentPeriod = computed(() => 
  usePeriod(temporal, currentView.value).value
)

const viewComponent = computed(() => ({
  month: MonthView,
  week: WeekView,
  day: DayView
}[currentView.value]))

// Methods
const changeView = (view) => {
  currentView.value = view
}

const handleDateSelect = (date) => {
  selectedDate.value = date
  
  // Navigate to day view on date selection
  if (currentView.value !== 'day') {
    temporal.browsing.value = toPeriod(temporal, date, 'day')
    currentView.value = 'day'
  }
}

// Load events for current period
watch(currentPeriod, async (period) => {
  events.value = await loadEventsForPeriod(period)
})

// Keyboard navigation
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
})

const handleKeyboard = (e) => {
  if (e.key === 'ArrowLeft') {
    temporal.browsing.value = previous(temporal, currentPeriod.value)
  } else if (e.key === 'ArrowRight') {
    temporal.browsing.value = next(temporal, currentPeriod.value)
  }
}
</script>

<style scoped>
.calendar-app {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: #f5f5f5;
}
</style>
```

## Calendar Header Component

```vue
<template>
  <header class="calendar-header">
    <div class="nav-controls">
      <button @click="goToday">Today</button>
      <button @click="goPrevious">&lt;</button>
      <button @click="goNext">&gt;</button>
    </div>
    
    <h1 class="period-title">{{ periodTitle }}</h1>
    
    <div class="view-controls">
      <button 
        v-for="view in views" 
        :key="view"
        :class="{ active: currentView === view }"
        @click="$emit('view-change', view)"
      >
        {{ view }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { next, previous, toPeriod } from 'usetemporal'

const props = defineProps({
  temporal: Object,
  currentPeriod: Object
})

const emit = defineEmits(['view-change'])

const views = ['month', 'week', 'day']

const currentView = computed(() => props.currentPeriod.type)

const periodTitle = computed(() => {
  const date = props.currentPeriod.date
  const formatters = {
    month: () => date.toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    week: () => `Week of ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
    day: () => date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
  return formatters[currentView.value]()
})

const goToday = () => {
  props.temporal.browsing.value = toPeriod(props.temporal, new Date(), currentView.value)
}

const goPrevious = () => {
  props.temporal.browsing.value = previous(props.temporal, props.currentPeriod)
}

const goNext = () => {
  props.temporal.browsing.value = next(props.temporal, props.currentPeriod)
}
</script>

<style scoped>
.calendar-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.nav-controls {
  display: flex;
  gap: 0.5rem;
}

.view-controls {
  display: flex;
  gap: 0.25rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background: #f5f5f5;
}

button.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.period-title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
```

## Month View Component

```vue
<template>
  <div class="month-view">
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>
    
    <div class="days-grid">
      <div
        v-for="day in stableMonthDays"
        :key="day.date.toISOString()"
        class="day-cell"
        :class="getDayClasses(day)"
        @click="$emit('date-select', day.date)"
      >
        <div class="day-number">{{ day.date.getDate() }}</div>
        <div class="day-events">
          <div 
            v-for="event in getEventsForDay(day)" 
            :key="event.id"
            class="event-dot"
            :style="{ background: event.color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { divide, createPeriod, isSame, isToday, isWeekend } from 'usetemporal'

const props = defineProps({
  temporal: Object,
  period: Object,
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['date-select'])

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Use stable month for consistent 6-week grid
const stableMonth = computed(() => 
  createPeriod(props.temporal, 'stableMonth', props.period)
)

const stableMonthDays = computed(() => 
  divide(props.temporal, stableMonth.value, 'day')
)

const getDayClasses = (day) => ({
  'other-month': !isSame(props.temporal, day, props.period, 'month'),
  'today': isToday(day, props.temporal),
  'weekend': isWeekend(day),
  'has-events': getEventsForDay(day).length > 0
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

<style scoped>
.month-view {
  padding: 1rem;
  background: white;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
}

.day-cell {
  background: white;
  min-height: 100px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:hover {
  background-color: #f5f5f5;
}

.day-cell.other-month {
  color: #999;
  background: #fafafa;
}

.day-cell.today {
  background-color: #e3f2fd;
}

.day-cell.weekend {
  background-color: #f5f5f5;
}

.day-number {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.day-events {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
```

## Using Composition API

```vue
<script setup>
import { ref, computed, watch } from 'vue'
import { createTemporal, usePeriod, divide, next, previous } from 'usetemporal'

// Composable for calendar logic
function useCalendar(initialDate = new Date()) {
  const temporal = createTemporal({ date: initialDate })
  const view = ref('month')
  
  // Reactive period based on current view
  const period = computed(() => 
    usePeriod(temporal, view.value).value
  )
  
  // Navigation methods
  const navigate = {
    next: () => temporal.browsing.value = next(temporal, period.value),
    previous: () => temporal.browsing.value = previous(temporal, period.value),
    today: () => temporal.browsing.value = toPeriod(temporal, new Date(), view.value),
    toDate: (date) => temporal.browsing.value = toPeriod(temporal, date, view.value)
  }
  
  // View methods
  const changeView = (newView) => {
    view.value = newView
  }
  
  // Get visible periods
  const visiblePeriods = computed(() => {
    if (view.value === 'month') {
      const stable = createPeriod(temporal, 'stableMonth', period.value)
      return divide(temporal, stable, 'day')
    }
    return divide(temporal, period.value, 'day')
  })
  
  return {
    temporal,
    view,
    period,
    visiblePeriods,
    navigate,
    changeView
  }
}

// Use in component
const {
  temporal,
  view,
  period,
  visiblePeriods,
  navigate,
  changeView
} = useCalendar()
</script>
```

## Integration with Pinia

```javascript
// stores/calendar.js
import { defineStore } from 'pinia'
import { createTemporal, usePeriod, next, previous, toPeriod } from 'usetemporal'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    temporal: createTemporal({ date: new Date() }),
    view: 'month',
    selectedDate: null,
    events: []
  }),
  
  getters: {
    currentPeriod() {
      return usePeriod(this.temporal, this.view).value
    },
    
    periodTitle() {
      const date = this.currentPeriod.date
      const formats = {
        year: { year: 'numeric' },
        month: { month: 'long', year: 'numeric' },
        week: { month: 'short', day: 'numeric' },
        day: { weekday: 'long', month: 'long', day: 'numeric' }
      }
      return date.toLocaleDateString('en', formats[this.view])
    }
  },
  
  actions: {
    navigateNext() {
      this.temporal.browsing.value = next(this.temporal, this.currentPeriod)
    },
    
    navigatePrevious() {
      this.temporal.browsing.value = previous(this.temporal, this.currentPeriod)
    },
    
    navigateToday() {
      this.temporal.browsing.value = toPeriod(
        this.temporal, 
        new Date(), 
        this.view
      )
    },
    
    changeView(view) {
      this.view = view
    },
    
    selectDate(date) {
      this.selectedDate = date
    },
    
    async loadEvents(period) {
      // Load events for period
      this.events = await api.getEvents({
        start: period.start,
        end: period.end
      })
    }
  }
})
```

## See Also

- [Month Calendar](/examples/calendars/month-calendar) - Month view implementation
- [Reactive Time Units](/guide/reactive-time-units) - Vue reactivity integration
- [Framework Agnostic](/guide/framework-agnostic) - Core concepts
- [React Calendar](/examples/frameworks/react-calendar) - React implementation