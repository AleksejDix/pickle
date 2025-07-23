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
        :initial-month="currentMonth"
        @select-day="handleDaySelect"
      />

      <WeekView
        v-else-if="currentView === 'week'"
        :temporal="temporal"
        :initial-week="currentWeek"
      />

      <DayView v-else-if="currentView === 'day'" :temporal="temporal" :initial-day="currentDay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createTemporal, periods, type TimeUnit } from 'usetemporal'
import YearView from './YearView.vue'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import DayView from './DayView.vue'

type ViewType = 'year' | 'month' | 'week' | 'day'

const temporal = createTemporal()

const currentView = ref<ViewType>('month')
const year = periods.year(temporal)
const month = periods.month(temporal)
const week = periods.week(temporal)
const day = periods.day(temporal)

const currentYear = ref(year)
const currentMonth = ref(month)
const currentWeek = ref(week)
const currentDay = ref(day)

const views = [
  { type: 'day' as ViewType, label: 'Day' },
  { type: 'week' as ViewType, label: 'Week' },
  { type: 'month' as ViewType, label: 'Month' },
  { type: 'year' as ViewType, label: 'Year' },
]

const currentPeriodLabel = computed(() => {
  switch (currentView.value) {
    case 'year':
      return currentYear.value.number.value.toString()
    case 'month':
      return currentMonth.value.name.value
    case 'week':
      const weekStart = currentWeek.value.timespan.value.start
      const weekEnd = currentWeek.value.timespan.value.end
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    case 'day':
      return currentDay.value.raw.value.toLocaleDateString('en-US', {
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

function switchView(view: ViewType) {
  currentView.value = view
}

function goToToday() {
  currentYear.value = periods.year(temporal)
  currentMonth.value = periods.month(temporal)
  currentWeek.value = periods.week(temporal)
  currentDay.value = periods.day(temporal)
}

function navigatePrevious() {
  switch (currentView.value) {
    case 'year':
      currentYear.value.past()
      break
    case 'month':
      currentMonth.value.past()
      break
    case 'week':
      currentWeek.value.past()
      break
    case 'day':
      currentDay.value.past()
      break
  }
}

function navigateNext() {
  switch (currentView.value) {
    case 'year':
      currentYear.value.future()
      break
    case 'month':
      currentMonth.value.future()
      break
    case 'week':
      currentWeek.value.future()
      break
    case 'day':
      currentDay.value.future()
      break
  }
}

function handleMonthSelect(month: TimeUnit) {
  currentMonth.value = periods.month(temporal, month.raw.value)
  currentView.value = 'month'
}

function handleDaySelect(day: TimeUnit) {
  currentDay.value = periods.day(temporal, day.raw.value)
  currentView.value = 'day'
}
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
