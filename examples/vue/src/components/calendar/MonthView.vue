<template>
  <div class="month-view">
    <div class="month-header">
      <h2>{{ month.name?.value || 'Loading...' }}</h2>
    </div>

    <div class="calendar-grid">
      <div class="weekday-headers">
        <div v-for="weekday in weekdays" :key="weekday" class="weekday">
          {{ weekday }}
        </div>
      </div>

      <div class="days-grid">
        <div v-for="n in monthStartPadding" :key="`pad-start-${n}`" class="day-pad">
          <span class="day-number">{{ previousMonthDays[n - 1] }}</span>
        </div>

        <div
          v-for="day in days"
          :key="day.raw.value.toISOString()"
          class="day"
          :class="{
            'is-today': day.isNow.value,
            'is-weekend': day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
            'is-selected': selectedDay?.raw.value.getTime() === day.raw.value.getTime(),
          }"
          @click="selectDay(day)"
        >
          <span class="day-number">{{ day.number.value }}</span>
          <div class="day-content"></div>
        </div>

        <div v-for="n in monthEndPadding" :key="`pad-end-${n}`" class="day-pad">
          <span class="day-number">{{ n }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TemporalCore, TimeUnit } from 'usetemporal'
import { useMonth } from 'usetemporal'

const props = defineProps<{
  temporal: TemporalCore
  initialMonth?: TimeUnit
}>()

const emit = defineEmits<{
  selectDay: [day: TimeUnit]
}>()

const month = props.initialMonth ? props.initialMonth : useMonth(props.temporal)
const days = computed(() => props.temporal.divide(month, 'day'))
const selectedDay = ref<TimeUnit | null>(null)

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const monthStartPadding = computed(() => {
  if (days.value.length === 0) return 0
  const firstDay = days.value[0]
  return firstDay.raw.value.getDay()
})

const monthEndPadding = computed(() => {
  if (days.value.length === 0) return 0
  const lastDay = days.value[days.value.length - 1]
  const lastDayOfWeek = lastDay.raw.value.getDay()
  return lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek
})

const previousMonthDays = computed(() => {
  if (monthStartPadding.value === 0) return []

  const prevMonth = new Date(month.raw.value)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate()

  const result: number[] = []
  for (let i = monthStartPadding.value - 1; i >= 0; i--) {
    result.push(daysInPrevMonth - i)
  }
  return result
})

function selectDay(day: TimeUnit) {
  selectedDay.value = day
  emit('selectDay', day)
}
</script>

<style scoped>
.month-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.month-header {
  text-align: center;
  margin-bottom: 20px;
}

.month-header h2 {
  font-size: 24px;
  font-weight: 400;
  color: #333;
  margin: 0;
}

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

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.day,
.day-pad {
  background: white;
  min-height: 100px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.day-pad {
  background-color: #fafafa;
  cursor: default;
}

.day-pad .day-number {
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
