# Vue.js Integration Examples

Complete examples showing how to use useTemporal with Vue 3.

## Basic Setup

### Installation

```bash
npm install usetemporal vue
```

### Creating a Temporal Instance

```vue
<script setup>
import { createTemporal } from 'usetemporal'
import { provide } from 'vue'

// Create temporal instance
const temporal = createTemporal({ 
  date: new Date(),
  weekStartsOn: 1 // Monday
})

// Provide to child components
provide('temporal', temporal)
</script>
```

## Composable Pattern

Create a reusable composable:

```typescript
// composables/useTemporal.ts
import { createTemporal } from 'usetemporal'
import { inject, provide } from 'vue'

const TEMPORAL_KEY = Symbol('temporal')

export function provideTemporalInstance() {
  const temporal = createTemporal({ date: new Date() })
  provide(TEMPORAL_KEY, temporal)
  return temporal
}

export function useTemporal() {
  const temporal = inject(TEMPORAL_KEY)
  if (!temporal) {
    throw new Error('Temporal instance not provided')
  }
  return temporal
}
```

## Calendar Component

A complete calendar component with navigation:

```vue
<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth">←</button>
      <h2>{{ monthTitle }}</h2>
      <button @click="nextMonth">→</button>
    </div>
    
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>
    
    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="getDayClasses(day)"
        @click="selectDate(day)"
      >
        <span v-if="day">{{ day.date.getDate() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { createTemporal, usePeriod, divide, next, previous, isSame } from 'usetemporal'

const props = defineProps({
  modelValue: Date,
  weekStartsOn: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue'])

const temporal = createTemporal({ 
  date: props.modelValue || new Date(),
  weekStartsOn: props.weekStartsOn
})

const month = usePeriod(temporal, 'month')

const monthTitle = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)

const weekDays = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // Rotate array based on weekStartsOn
  return [...days.slice(props.weekStartsOn), ...days.slice(0, props.weekStartsOn)]
})

const calendarDays = computed(() => {
  const days = divide(temporal, month.value, 'day')
  const firstDay = days[0]
  const startPadding = (firstDay.date.getDay() - props.weekStartsOn + 7) % 7
  
  return [
    ...Array(startPadding).fill(null),
    ...days
  ]
})

const getDayClasses = (day) => {
  if (!day) return 'empty'
  
  return {
    'calendar-day': true,
    'today': isSame(temporal, day.date, new Date(), 'day'),
    'selected': props.modelValue && isSame(temporal, day.date, props.modelValue, 'day'),
    'weekend': day.date.getDay() === 0 || day.date.getDay() === 6
  }
}

const previousMonth = () => {
  temporal.browsing.value = previous(temporal, month.value)
}

const nextMonth = () => {
  temporal.browsing.value = next(temporal, month.value)
}

const selectDate = (day) => {
  if (day) {
    emit('update:modelValue', day.date)
  }
}
</script>

<style scoped>
.calendar {
  max-width: 400px;
  margin: 0 auto;
}

.calendar-header {
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

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #eee;
}

.calendar-day:hover {
  background: #f5f5f5;
}

.today {
  background: #e3f2fd;
  font-weight: bold;
}

.selected {
  background: #2196f3;
  color: white;
}

.weekend {
  color: #999;
}

.empty {
  visibility: hidden;
}
</style>
```

## Date Picker Component

A date picker with dropdown calendar:

```vue
<template>
  <div class="date-picker" ref="pickerRef">
    <input
      type="text"
      :value="displayValue"
      @click="showCalendar = !showCalendar"
      readonly
    />
    
    <Transition name="fade">
      <div v-if="showCalendar" class="calendar-dropdown">
        <Calendar
          v-model="selectedDate"
          @update:modelValue="handleDateSelect"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Calendar from './Calendar.vue'

const props = defineProps({
  modelValue: Date,
  format: {
    type: String,
    default: 'MM/DD/YYYY'
  }
})

const emit = defineEmits(['update:modelValue'])

const pickerRef = ref()
const showCalendar = ref(false)
const selectedDate = ref(props.modelValue)

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  
  const date = selectedDate.value
  const formats = {
    'MM/DD/YYYY': `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`,
    'DD/MM/YYYY': `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
    'YYYY-MM-DD': `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  return formats[props.format] || date.toLocaleDateString()
})

const handleDateSelect = (date) => {
  selectedDate.value = date
  emit('update:modelValue', date)
  showCalendar.value = false
}

// Close calendar on outside click
const handleClickOutside = (event) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target)) {
    showCalendar.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.date-picker {
  position: relative;
  display: inline-block;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Time Range Selector

Select a time range within a day:

```vue
<template>
  <div class="time-range-selector">
    <h3>Select Time Range</h3>
    
    <div class="time-grid">
      <div
        v-for="slot in timeSlots"
        :key="slot.start.toISOString()"
        :class="getSlotClasses(slot)"
        @click="toggleSlot(slot)"
      >
        {{ slot.label }}
      </div>
    </div>
    
    <div v-if="selectedRange" class="selected-info">
      Selected: {{ formatRange(selectedRange) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const day = usePeriod(temporal, 'day')

const selectedSlots = ref(new Set())
const selectionStart = ref(null)

const timeSlots = computed(() => {
  const hours = divide(temporal, day.value, 'hour')
  return hours
    .filter(hour => {
      const h = hour.date.getHours()
      return h >= 8 && h <= 20 // 8 AM to 8 PM
    })
    .map(hour => ({
      start: hour.start,
      end: hour.end,
      label: hour.date.toLocaleTimeString('en', {
        hour: 'numeric',
        hour12: true
      }),
      id: hour.start.toISOString()
    }))
})

const selectedRange = computed(() => {
  if (selectedSlots.value.size === 0) return null
  
  const sorted = Array.from(selectedSlots.value).sort()
  return {
    start: new Date(sorted[0]),
    end: new Date(sorted[sorted.length - 1])
  }
})

const getSlotClasses = (slot) => {
  return {
    'time-slot': true,
    'selected': selectedSlots.value.has(slot.id),
    'in-range': isInRange(slot)
  }
}

const isInRange = (slot) => {
  if (!selectionStart.value || selectedSlots.value.size < 2) return false
  
  const sorted = Array.from(selectedSlots.value).sort()
  const start = sorted[0]
  const end = sorted[sorted.length - 1]
  
  return slot.id > start && slot.id < end
}

const toggleSlot = (slot) => {
  if (!selectionStart.value) {
    // Start new selection
    selectionStart.value = slot.id
    selectedSlots.value.clear()
    selectedSlots.value.add(slot.id)
  } else {
    // Complete range selection
    const start = new Date(selectionStart.value)
    const end = new Date(slot.id)
    
    selectedSlots.value.clear()
    
    // Add all slots in range
    timeSlots.value.forEach(s => {
      if (s.start >= Math.min(start, end) && s.start <= Math.max(start, end)) {
        selectedSlots.value.add(s.id)
      }
    })
    
    selectionStart.value = null
  }
}

const formatRange = (range) => {
  if (!range) return ''
  
  const format = { hour: 'numeric', minute: '2-digit', hour12: true }
  return `${range.start.toLocaleTimeString('en', format)} - ${new Date(range.end.getTime() + 3600000).toLocaleTimeString('en', format)}`
}
</script>

<style scoped>
.time-range-selector {
  max-width: 600px;
  margin: 0 auto;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 20px 0;
}

.time-slot {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.time-slot:hover {
  background: #f5f5f5;
}

.time-slot.selected {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.time-slot.in-range {
  background: #e3f2fd;
  border-color: #2196f3;
}

.selected-info {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  text-align: center;
}
</style>
```

## Reactive Time Display

Show current time with live updates:

```vue
<template>
  <div class="time-display">
    <div class="current-time">
      {{ currentTime }}
    </div>
    <div class="time-details">
      <div>{{ currentDate }}</div>
      <div>Week {{ weekNumber }} of {{ year }}</div>
      <div>Day {{ dayOfYear }} of 365</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createTemporal, usePeriod, divide, toPeriod } from 'usetemporal'

const now = ref(new Date())
const temporal = createTemporal({ 
  date: now,
  now: now
})

const year = usePeriod(temporal, 'year')
const week = usePeriod(temporal, 'week')
const day = usePeriod(temporal, 'day')

const currentTime = computed(() => 
  now.value.toLocaleTimeString('en', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
)

const currentDate = computed(() =>
  now.value.toLocaleDateString('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
)

const weekNumber = computed(() => {
  const yearStart = year.value.start
  const weeksSinceStart = Math.floor(
    (week.value.start.getTime() - yearStart.getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  ) + 1
  return weeksSinceStart
})

const dayOfYear = computed(() => {
  const yearStart = year.value.start
  const daysSinceStart = Math.floor(
    (day.value.start.getTime() - yearStart.getTime()) / 
    (24 * 60 * 60 * 1000)
  ) + 1
  return daysSinceStart
})

let timer
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.time-display {
  text-align: center;
  padding: 2rem;
}

.current-time {
  font-size: 3rem;
  font-weight: 300;
  font-family: monospace;
  margin-bottom: 1rem;
}

.time-details {
  color: #666;
}

.time-details > div {
  margin: 0.5rem 0;
}
</style>
```

## See Also

- [React Integration Examples](/examples/frameworks/react-integration)
- [Getting Started Guide](/guide/getting-started)
- [Core Concepts](/guide/core-concepts)
- [API Reference](/api/)