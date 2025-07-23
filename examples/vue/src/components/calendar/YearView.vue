<template>
  <div class="year-view">
    <div class="year-header">
      <h1>{{ year.number.value }}</h1>
    </div>

    <div class="months-grid">
      <div
        v-for="(month, index) in months"
        :key="index"
        class="month-card"
        :class="{ 'is-current': month.isNow.value }"
        @click="$emit('selectMonth', month)"
      >
        <div class="month-header">
          {{ month.raw.value.toLocaleDateString('en-US', { month: 'short' }) }}
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
                  'is-today': dayInfo.day.isNow.value,
                  'is-weekend': dayInfo.isWeekend,
                  'is-other-month': !dayInfo.isCurrentMonth,
                }"
              >
                {{ dayInfo.day.number.value }}
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
import type { TemporalCore, TimeUnit } from 'usetemporal'
import { periods } from 'usetemporal'

const props = defineProps<{
  temporal: TemporalCore
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  selectMonth: [month: TimeUnit]
}>()

const year = periods.year(props.temporal)
const months = computed(() => props.temporal.divide(year, 'month'))

// Weekdays starting with Monday if configured
const weekdays =
  props.temporal.weekStartsOn === 1
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Get stableMonth for each month to show full calendar grid
function getStableMonth(month: TimeUnit) {
  return periods.stableMonth({
    now: props.temporal.now,
    browsing: month.browsing,
    adapter: props.temporal.adapter,
    weekStartsOn: props.temporal.weekStartsOn,
  })
}

// Get weeks for a stableMonth
function getMonthWeeks(month: TimeUnit) {
  const stableMonth = getStableMonth(month)
  const weeks = props.temporal.divide(stableMonth, 'week')

  return weeks.map((week) => {
    const days = props.temporal.divide(week, 'day')
    return days.map((day) => ({
      day,
      isCurrentMonth: stableMonth.contains!(day.raw.value),
      isWeekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
    }))
  })
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
