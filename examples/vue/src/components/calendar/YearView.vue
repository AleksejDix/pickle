<template>
  <div class="year-view">
    <div class="year-header">
      <h1>{{ year.date.getFullYear() }}</h1>
    </div>

    <div class="months-grid">
      <div
        v-for="(month, index) in months"
        :key="index"
        class="month-card"
        :class="{ 'is-current': isCurrentMonth(month) }"
        @click="$emit('selectMonth', month)"
      >
        <div class="month-header">
          {{ month.date.toLocaleDateString('en-US', { month: 'short' }) }}
        </div>

        <div class="month-calendar">
          <div class="weekday-headers">
            <div v-for="weekday in weekdays" :key="weekday" class="weekday">
              {{ weekday }}
            </div>
          </div>

          <div class="weeks-grid">
            <div
              v-for="(week, weekIndex) in getMonthWeeks(month)"
              :key="`week-${weekIndex}`"
              class="week"
            >
              <div
                v-for="(dayInfo, dayIndex) in week"
                :key="`day-${weekIndex}-${dayIndex}`"
                class="day"
                :class="{
                  'is-today': dayInfo.isToday,
                  'is-weekend': dayInfo.isWeekend,
                  'is-other-month': !dayInfo.isCurrentMonth,
                }"
              >
                {{ dayInfo.dayNumber }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Temporal, Period } from 'usetemporal'
import { useYear, divide, useMonth, isSame, toPeriod } from 'usetemporal'

const props = defineProps<{
  temporal: Temporal
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  selectMonth: [month: Period]
}>()

const year = useYear(props.temporal)
const months = computed(() => divide(props.temporal, year.value, 'month'))

// Weekdays starting with Monday if configured
const weekdays =
  props.temporal.weekStartsOn === 1
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Get current month to check against
const currentMonth = useMonth(props.temporal)

// Check if a month is the current month
function isCurrentMonth(month: Period): boolean {
  return isSame(props.temporal, month, currentMonth.value, 'month')
}

// Check if a day is today
function isToday(day: Date): boolean {
  const dayPeriod = toPeriod(props.temporal, day, 'day')
  return isSame(props.temporal, dayPeriod, props.temporal.now.value, 'day')
}

// Get weeks for a month showing the full calendar grid
function getMonthWeeks(month: Period) {
  // For mini calendar in year view, we'll create a simple grid
  // showing all days of the month including padding days
  const firstDay = new Date(month.date.getFullYear(), month.date.getMonth(), 1)
  const lastDay = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0)
  const startPadding = (firstDay.getDay() - props.temporal.weekStartsOn + 7) % 7

  const weeks: Array<
    Array<{ dayNumber: number; isCurrentMonth: boolean; isWeekend: boolean; isToday: boolean }>
  > = []
  let currentWeek: Array<{
    dayNumber: number
    isCurrentMonth: boolean
    isWeekend: boolean
    isToday: boolean
  }> = []

  // Add padding days from previous month
  const prevMonthLastDay = new Date(month.date.getFullYear(), month.date.getMonth(), 0).getDate()
  for (let i = startPadding - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    currentWeek.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      isWeekend: false,
      isToday: false,
    })
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(month.date.getFullYear(), month.date.getMonth(), day)
    const dayOfWeek = date.getDay()
    currentWeek.push({
      dayNumber: day,
      isCurrentMonth: true,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: isToday(date),
    })

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Add padding days from next month
  if (currentWeek.length > 0) {
    let nextDay = 1
    while (currentWeek.length < 7) {
      currentWeek.push({
        dayNumber: nextDay++,
        isCurrentMonth: false,
        isWeekend: false,
        isToday: false,
      })
    }
    weeks.push(currentWeek)
  }

  return weeks
}
</script>

<style scoped>
.year-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.year-header {
  text-align: center;
  margin-bottom: 30px;
}

.year-header h1 {
  font-size: 32px;
  font-weight: 300;
  color: #333;
  margin: 0;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.month-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.month-card.is-current {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.month-header {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.month-calendar {
  font-size: 11px;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 5px;
}

.weekday {
  text-align: center;
  color: #666;
  font-weight: 500;
  padding: 2px;
}

.weeks-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  border-radius: 4px;
  color: #333;
}

.day.is-other-month {
  color: #ddd;
}

.day {
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.day:hover {
  background-color: #f0f0f0;
}

.day.is-today {
  background-color: #007aff;
  color: white;
  font-weight: 600;
}

.day.is-weekend {
  color: #999;
}

.day.is-today.is-weekend {
  color: white;
}
</style>
