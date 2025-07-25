# Mini Calendar

A compact calendar widget perfect for date pickers and sidebars.

## Basic Mini Calendar

```vue
<template>
  <div class="mini-calendar">
    <div class="mini-header">
      <button @click="previousMonth" class="nav-btn">‹</button>
      <div class="month-year">
        {{ monthYear }}
      </div>
      <button @click="nextMonth" class="nav-btn">›</button>
    </div>
    
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>
    
    <div class="days-grid">
      <div 
        v-for="day in paddedDays" 
        :key="day?.date?.toISOString() || Math.random()"
        class="day-cell"
        :class="getDayClasses(day)"
        @click="day && selectDate(day)"
      >
        {{ day?.date.getDate() || '' }}
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
  isToday,
  createPeriod
} from 'usetemporal'

const props = defineProps({
  temporal: {
    type: Object,
    required: true
  },
  selectedDate: Date
})

const emit = defineEmits(['dateSelected'])

// Data
const month = usePeriod(props.temporal, 'month')
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Computed
const monthYear = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'short', 
    year: 'numeric' 
  })
)

const days = computed(() => divide(props.temporal, month.value, 'day'))

const paddedDays = computed(() => {
  const firstDay = days.value[0]
  const startPadding = firstDay.date.getDay()
  
  return [
    ...Array(startPadding).fill(null),
    ...days.value
  ]
})

// Methods
const previousMonth = () => {
  props.temporal.browsing.value = previous(props.temporal, month.value)
}

const nextMonth = () => {
  props.temporal.browsing.value = next(props.temporal, month.value)
}

const selectDate = (day) => {
  emit('dateSelected', day.date)
}

const getDayClasses = (day) => {
  if (!day) return { empty: true }
  
  return {
    'day': true,
    'weekend': isWeekend(day),
    'today': isToday(day, props.temporal),
    'selected': props.selectedDate && 
      isSame(props.temporal, 
        day, 
        toPeriod(props.temporal, props.selectedDate, 'day'), 
        'day'
      )
  }
}
</script>

<style>
.mini-calendar {
  width: 280px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.nav-btn:hover {
  background-color: #f5f5f5;
}

.month-year {
  font-weight: 600;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  padding: 0.25rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.day-cell.empty {
  cursor: default;
}

.day-cell.day:hover {
  background-color: #f5f5f5;
}

.day-cell.weekend {
  color: #999;
}

.day-cell.today {
  background-color: #e3f2fd;
  font-weight: 600;
}

.day-cell.selected {
  background-color: #2196f3;
  color: white;
}

.day-cell.selected:hover {
  background-color: #1976d2;
}
</style>
```

## Inline Mini Calendar

Even more compact version for tight spaces:

```vue
<template>
  <div class="inline-mini">
    <div class="inline-header">
      <button @click="changeMonth(-1)">‹</button>
      <span>{{ monthName }}</span>
      <button @click="changeMonth(1)">›</button>
    </div>
    
    <div class="inline-grid">
      <template v-for="(week, i) in weeks" :key="i">
        <div 
          v-for="day in week" 
          :key="day?.date?.toISOString() || `empty-${i}`"
          :class="['inline-day', getDayClass(day)]"
          @click="day && onSelect(day)"
        >
          {{ day?.date.getDate() || '' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePeriod, divide, go } from 'usetemporal'

const props = defineProps(['temporal', 'onSelect'])

const month = usePeriod(props.temporal, 'month')
const monthName = computed(() => 
  month.value.date.toLocaleDateString('en', { month: 'short' })
)

const weeks = computed(() => {
  const days = divide(props.temporal, month.value, 'day')
  const firstDay = days[0].date.getDay()
  const padded = [...Array(firstDay).fill(null), ...days]
  
  const result = []
  for (let i = 0; i < padded.length; i += 7) {
    result.push(padded.slice(i, i + 7))
  }
  return result
})

const changeMonth = (direction) => {
  props.temporal.browsing.value = go(props.temporal, month.value, direction)
}

const getDayClass = (day) => {
  if (!day) return ''
  return [
    isToday(day, props.temporal) && 'today',
    isWeekend(day) && 'weekend'
  ].filter(Boolean).join(' ')
}
</script>

<style>
.inline-mini {
  width: 200px;
  font-size: 0.75rem;
}

.inline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.inline-header button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem 0.25rem;
}

.inline-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.inline-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.625rem;
}

.inline-day:hover {
  background-color: #f0f0f0;
}

.inline-day.today {
  background-color: #2196f3;
  color: white;
  border-radius: 50%;
}

.inline-day.weekend {
  color: #999;
}
</style>
```

## Date Picker Mini Calendar

Used as a dropdown for date inputs:

```vue
<template>
  <div class="date-picker">
    <input 
      :value="formattedDate" 
      @focus="showCalendar = true"
      @blur="handleBlur"
      placeholder="Select date"
      readonly
    >
    
    <div v-if="showCalendar" class="calendar-dropdown">
      <MiniCalendar 
        :temporal="temporal"
        :selected-date="selectedDate"
        @date-selected="selectDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createTemporal } from 'usetemporal'
import MiniCalendar from './MiniCalendar.vue'

const props = defineProps({
  modelValue: Date
})

const emit = defineEmits(['update:modelValue'])

const temporal = createTemporal({ date: props.modelValue || new Date() })
const showCalendar = ref(false)
const selectedDate = ref(props.modelValue)

const formattedDate = computed(() => 
  selectedDate.value?.toLocaleDateString() || ''
)

const selectDate = (date) => {
  selectedDate.value = date
  emit('update:modelValue', date)
  showCalendar.value = false
}

const handleBlur = (e) => {
  // Keep calendar open if clicking inside it
  setTimeout(() => {
    if (!e.relatedTarget?.closest('.calendar-dropdown')) {
      showCalendar.value = false
    }
  }, 200)
}
</script>

<style>
.date-picker {
  position: relative;
}

.date-picker input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

## Usage

```vue
<template>
  <div>
    <!-- Basic mini calendar -->
    <MiniCalendar 
      :temporal="temporal"
      :selected-date="selectedDate"
      @date-selected="handleDateSelect"
    />
    
    <!-- Date picker -->
    <DatePicker v-model="selectedDate" />
    
    <!-- Inline version -->
    <InlineMini 
      :temporal="temporal"
      :on-select="handleDateSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createTemporal } from 'usetemporal'
import MiniCalendar from './MiniCalendar.vue'
import DatePicker from './DatePicker.vue'
import InlineMini from './InlineMini.vue'

const temporal = createTemporal({ date: new Date() })
const selectedDate = ref(null)

const handleDateSelect = (date) => {
  selectedDate.value = date
  console.log('Selected:', date)
}
</script>
```

## See Also

- [Month Calendar](/examples/calendars/month-calendar) - Full-size calendar
- [Year Overview](/examples/calendars/year-overview) - Year at a glance
- [Date Range Picker](/examples/recipes/date-range-picker) - Range selection