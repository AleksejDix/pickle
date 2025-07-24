<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="calendar-container">
    <div class="calendar-toolbar">
      <div class="toolbar-left">
        <button class="btn-today" @click="goToToday">Today</button>
        <div class="navigation-arrows">
          <button class="btn-nav" @click="navigatePrevious" :disabled="!canNavigateBack">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button class="btn-nav" @click="navigateNext">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="toolbar-center">
        <h1 class="current-period">{{ currentPeriodLabel }}</h1>
      </div>

      <div class="toolbar-right">
        <div class="view-switcher">
          <button
            v-for="view in views"
            :key="view.type"
            class="btn-view"
            :class="{ active: currentView === view.type }"
            @click="switchView(view.type)"
          >
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="calendar-content">
      <YearView
        v-if="currentView === 'year'"
        :temporal="temporal"
        @select-month="handleMonthSelect"
      />

      <MonthView
        v-else-if="currentView === 'month'"
        :temporal="temporal"
        @select-day="handleDaySelect"
      />

      <WeekView v-else-if="currentView === 'week'" :temporal="temporal" />

      <DayView v-else-if="currentView === 'day'" :temporal="temporal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePeriod, go, type Period, DAY } from 'usetemporal'
import { temporal } from '@/composables/useTemporal'
import YearView from './YearView.vue'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import DayView from './DayView.vue'

type ViewType = 'year' | 'month' | 'week' | 'day'

interface Props {
  view?: ViewType
  year?: number
  month?: number
  week?: number
  day?: number
}

const props = withDefaults(defineProps<Props>(), {
  view: 'month',
})

const router = useRouter()
const route = useRoute()

const currentView = ref<ViewType>(props.view || 'month')

// Using the unified usePeriod composable with reactive unit
const currentPeriod = usePeriod(temporal, currentView)

const views = [
  { type: 'day' as ViewType, label: 'Day' },
  { type: 'week' as ViewType, label: 'Week' },
  { type: 'month' as ViewType, label: 'Month' },
  { type: 'year' as ViewType, label: 'Year' },
]

const currentPeriodLabel = computed(() => {
  const period = currentPeriod.value

  switch (period.type) {
    case 'year':
      return period.date.getFullYear().toString()
    case 'month':
      return period.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'week':
      const weekStart = period.start
      const weekEnd = period.end
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    case 'day':
      return period.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    default:
      return ''
  }
})

const canNavigateBack = computed(() => {
  return true
})

// Get week number for a date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Navigate to a specific route based on view and date
function navigateToDate(date: Date, view: ViewType) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const week = getWeekNumber(date)

  switch (view) {
    case 'year':
      router.push({ name: 'year', params: { year } })
      break
    case 'month':
      router.push({ name: 'month', params: { year, month } })
      break
    case 'week':
      router.push({ name: 'week', params: { year, week } })
      break
    case 'day':
      router.push({ name: 'day', params: { year, month, day } })
      break
  }
}

function switchView(view: ViewType) {
  // Use the current browsing date when switching views
  navigateToDate(temporal.browsing.value.date, view)
}

function goToToday() {
  const now = new Date()
  navigateToDate(now, currentView.value)
}

function navigatePrevious() {
  const prevPeriod = go(temporal, currentPeriod.value, -1)
  navigateToDate(prevPeriod.date, currentView.value)
}

function navigateNext() {
  const nextPeriod = go(temporal, currentPeriod.value, 1)
  navigateToDate(nextPeriod.date, currentView.value)
}

// No longer needed - go() handles this automatically

function handleMonthSelect(month: Period) {
  navigateToDate(month.date, 'month')
}

function handleDaySelect(day: Period) {
  navigateToDate(day.date, 'day')
}

// Watch for route changes and update temporal state
watch(
  () => route.params,
  (params) => {
    if (params.year) {
      const year = parseInt(params.year as string)
      const month = params.month ? parseInt(params.month as string) - 1 : 0
      const day = params.day ? parseInt(params.day as string) : 1
      const week = params.week ? parseInt(params.week as string) : 1
      
      const date = new Date(year, month, day)
      
      // If week view, calculate date from week number
      if (route.name === 'week' && params.week) {
        const janFirst = new Date(year, 0, 1)
        const daysOffset = (week - 1) * 7
        date.setTime(janFirst.getTime() + daysOffset * 24 * 60 * 60 * 1000)
        // Adjust to start of week
        const dayOfWeek = date.getDay()
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        date.setDate(diff)
      }
      
      temporal.browsing.value = {
        start: date,
        end: date,
        type: DAY,
        date: date,
      }
    }
  },
  { immediate: true }
)

// Update currentView when route changes
watch(
  () => route.name,
  (name) => {
    if (name && typeof name === 'string') {
      currentView.value = name as ViewType
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.btn-today {
  padding: 6px 12px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-today:hover {
  background: #0051d5;
}

.navigation-arrows {
  display: flex;
  gap: 4px;
}

.btn-nav {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d1d6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.btn-nav:hover:not(:disabled) {
  background: #f0f0f0;
}

.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.current-period {
  font-size: 20px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
}

.view-switcher {
  display: flex;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 2px;
}

.btn-view {
  padding: 6px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  color: #333;
}

.btn-view.active {
  background: white;
  color: #007aff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .calendar-toolbar {
    flex-wrap: wrap;
    padding: 10px;
  }

  .toolbar-center {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
  }

  .toolbar-left,
  .toolbar-right {
    flex: 1;
  }

  .current-period {
    font-size: 18px;
  }

  .btn-view {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style>
