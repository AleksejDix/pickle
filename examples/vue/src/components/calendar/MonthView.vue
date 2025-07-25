<template>
  <div class="calendar-grid">
    <div class="weekday-headers">
      <div v-for="weekday in weekdays" :key="weekday" class="weekday">
        {{ weekday }}
      </div>
    </div>

    <div class="weeks-grid">
      <div v-for="(week, weekIndex) in gridWeeks" :key="`week-${weekIndex}`" class="week">
        <div
          v-for="(dayInfo, dayIndex) in week"
          :key="`day-${weekIndex}-${dayIndex}`"
          class="day"
          :class="{
            'is-today': isToday(dayInfo.day),
            'is-weekend': dayInfo.isWeekend,
            'is-selected': selectedDay && selectedDay.date.getTime() === dayInfo.day.date.getTime(),
            'is-other-month': !dayInfo.isCurrentMonth,
          }"
          @click="dayInfo.isCurrentMonth && selectDay(dayInfo.day)"
        >
          <span class="day-number">{{ dayInfo.day.date.getDate() }}</span>
          <div class="day-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue'
import type { Temporal, Period } from 'usetemporal'
import { usePeriod, divide } from 'usetemporal'

const props = defineProps<{
  temporal: Temporal
  initialMonth?: ComputedRef<Period>
}>()

const emit = defineEmits<{
  selectDay: [day: Period]
}>()

const month = props.initialMonth || usePeriod(props.temporal, 'month')

// Use stableMonth for the calendar grid
const stableMonth = usePeriod(props.temporal, 'stableMonth')

const selectedDay = ref<Period | null>(null)

const weeks = computed(() => divide(props.temporal, stableMonth.value, 'week'))

// Weekdays starting with Monday
const weekdays =
  props.temporal.weekStartsOn === 1
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Group days by week for the grid
const gridWeeks = computed(() => {
  return weeks.value.map((week) => {
    const days = divide(props.temporal, week, 'day')
    return days.map((day) => ({
      day,
      isCurrentMonth: day.date.getMonth() === month.value.date.getMonth(),
      isWeekend: day.date.getDay() === 0 || day.date.getDay() === 6,
    }))
  })
})

function selectDay(day: Period) {
  selectedDay.value = day
  emit('selectDay', day)
}

function isToday(day: Period): boolean {
  const today = new Date()
  return (
    day.date.getFullYear() === today.getFullYear() &&
    day.date.getMonth() === today.getMonth() &&
    day.date.getDate() === today.getDate()
  )
}
</script>

<style scoped>
.calendar-grid {
  width: 100%;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weeks-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.day {
  background: white;
  min-height: 100px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.day.is-other-month {
  background-color: #fafafa;
  cursor: default;
}

.day.is-other-month .day-number {
  color: #ccc;
}

.day:hover {
  background-color: #f5f5f5;
}

.day.is-today {
  background-color: #e3f2fd;
}

.day.is-selected {
  background-color: #007aff;
  color: white;
}

.day.is-selected .day-number {
  color: white;
}

.day.is-weekend {
  background-color: #fafafa;
}

.day.is-weekend.is-today {
  background-color: #e3f2fd;
}

.day.is-weekend.is-selected {
  background-color: #007aff;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.day-content {
  margin-top: 5px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .month-view {
    padding: 10px;
  }

  .day,
  .day-pad {
    min-height: 60px;
    padding: 4px;
  }

  .weekday {
    font-size: 11px;
  }

  .day-number {
    font-size: 12px;
  }
}
</style>
