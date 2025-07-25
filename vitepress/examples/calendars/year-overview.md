# Year Overview Calendar

Display an entire year at a glance with all months.

## Basic Year View

```vue
<template>
  <div class="year-overview">
    <div class="year-header">
      <button @click="previousYear">‹</button>
      <h1>{{ year.value.date.getFullYear() }}</h1>
      <button @click="nextYear">›</button>
    </div>
    
    <div class="months-grid">
      <div 
        v-for="month in months" 
        :key="month.date.toISOString()"
        class="month-block"
      >
        <h3>{{ getMonthName(month) }}</h3>
        <MiniMonth :month="month" :temporal="temporal" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePeriod, divide, next, previous } from 'usetemporal'

const props = defineProps({
  temporal: {
    type: Object,
    required: true
  }
})

// Year and months
const year = usePeriod(props.temporal, 'year')
const months = computed(() => divide(props.temporal, year.value, 'month'))

// Navigation
const previousYear = () => {
  props.temporal.browsing.value = previous(props.temporal, year.value)
}

const nextYear = () => {
  props.temporal.browsing.value = next(props.temporal, year.value)
}

// Helpers
const getMonthName = (month) => {
  return month.date.toLocaleDateString('en', { month: 'short' })
}
</script>

<!-- Mini Month Component -->
<script>
export const MiniMonth = {
  props: ['month', 'temporal'],
  setup(props) {
    const days = computed(() => divide(props.temporal, props.month, 'day'))
    const weeks = computed(() => {
      const result = []
      for (let i = 0; i < days.value.length; i += 7) {
        result.push(days.value.slice(i, i + 7))
      }
      return result
    })
    
    return { weeks }
  },
  template: `
    <div class="mini-month">
      <div class="week" v-for="(week, i) in weeks" :key="i">
        <div 
          v-for="day in week" 
          :key="day.date.toISOString()"
          class="day"
          :class="{
            'today': isToday(day, temporal),
            'weekend': isWeekend(day)
          }"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </div>
  `
}
</script>

<style>
.year-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.year-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.month-block {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}

.month-block h3 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.mini-month {
  font-size: 0.875rem;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.day.weekend {
  color: #666;
}

.day.today {
  background-color: #e3f2fd;
  border-radius: 50%;
  font-weight: bold;
}
</style>
```

## Compact Year Calendar

A more compact version showing just the month grids:

```vue
<template>
  <div class="compact-year">
    <h2>{{ year.value.date.getFullYear() }}</h2>
    
    <div class="compact-months">
      <div 
        v-for="(month, index) in months" 
        :key="month.date.toISOString()"
        class="compact-month"
        @click="selectMonth(month)"
      >
        <div class="month-name">{{ monthNames[index] }}</div>
        <div class="days-grid">
          <div 
            v-for="day in getDaysForMonth(month)" 
            :key="day.date.toISOString()"
            class="compact-day"
            :class="getDayClass(day)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getDaysForMonth = (month) => {
  return divide(props.temporal, month, 'day')
}

const getDayClass = (day) => ({
  weekend: isWeekend(day),
  today: isToday(day, props.temporal)
})

const selectMonth = (month) => {
  props.temporal.browsing.value = month
  emit('monthSelected', month)
}
</script>

<style>
.compact-months {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.compact-month {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.compact-month:hover {
  background-color: #f5f5f5;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-top: 0.25rem;
}

.compact-day {
  aspect-ratio: 1;
  background-color: #e0e0e0;
}

.compact-day.weekend {
  background-color: #f0f0f0;
}

.compact-day.today {
  background-color: #2196f3;
}
</style>
```

## Heat Map Year View

Show data intensity across the year:

```vue
<template>
  <div class="heatmap-year">
    <h2>Activity in {{ year.value.date.getFullYear() }}</h2>
    
    <div class="heatmap-months">
      <div 
        v-for="day in yearDays" 
        :key="day.date.toISOString()"
        class="heatmap-day"
        :style="{ backgroundColor: getHeatColor(day) }"
        :title="getTooltip(day)"
      />
    </div>
    
    <div class="heatmap-legend">
      <span>Less</span>
      <div class="legend-scale">
        <div v-for="i in 5" :key="i" :style="{ backgroundColor: getHeatColor(null, i) }" />
      </div>
      <span>More</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  temporal: Object,
  data: Object // { 'YYYY-MM-DD': value }
})

const yearDays = computed(() => 
  divide(props.temporal, year.value, 'day')
)

const getHeatColor = (day, level = null) => {
  if (level !== null) {
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
    return colors[level - 1]
  }
  
  const dateKey = day.date.toISOString().split('T')[0]
  const value = props.data[dateKey] || 0
  const maxValue = Math.max(...Object.values(props.data))
  
  if (value === 0) return '#ebedf0'
  const intensity = Math.ceil((value / maxValue) * 4)
  return getHeatColor(null, intensity)
}

const getTooltip = (day) => {
  const dateKey = day.date.toISOString().split('T')[0]
  const value = props.data[dateKey] || 0
  return `${dateKey}: ${value} activities`
}
</script>
```

## Usage

```vue
<template>
  <YearOverview :temporal="temporal" />
</template>

<script setup>
import { createTemporal } from 'usetemporal'
import YearOverview from './YearOverview.vue'

const temporal = createTemporal({ date: new Date() })
</script>
```

## See Also

- [Month Calendar](/examples/calendars/month-calendar) - Detailed month view
- [Mini Calendar](/examples/calendars/mini-calendar) - Compact calendar widget
- [divide() Pattern](/guide/patterns/divide-pattern) - How year division works