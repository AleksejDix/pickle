<template>
  <div class="stable-month-example">
    <h2>StableMonth Example</h2>
    <p>StableMonth always displays a 6-week calendar grid (42 days)</p>

    <div class="controls">
      <button @click="temporal.browsing.value = today">Today</button>
      <button @click="stableMonth.previous()">Previous</button>
      <span class="month-year">{{ monthName }} {{ year }}</span>
      <button @click="stableMonth.next()">Next</button>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="weeks">
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="week">
          <div
            v-for="day in week"
            :key="day.date"
            class="day"
            :class="{
              'other-month': !day.isCurrentMonth,
              today: day.isToday,
              weekend: day.isWeekend,
            }"
          >
            {{ day.number }}
          </div>
        </div>
      </div>
    </div>

    <div class="info">
      <p>Current month: {{ stableMonth.number.value }}</p>
      <p>Grid always shows {{ weeks.length }} weeks ({{ weeks.length * 7 }} days)</p>
      <p>Week starts on: {{ weekStartsOn === 0 ? 'Sunday' : 'Monday' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createTemporal, periods } from '@usetemporal/core'
import { nativeAdapter } from '@usetemporal/adapter-native'

const today = new Date()

// Create temporal with Monday as week start
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
})

// Create stableMonth instance
const stableMonth = periods.stableMonth({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
})

// Computed properties
const weekStartsOn = computed(() => temporal.weekStartsOn)

const monthName = computed(() => {
  const date = stableMonth.raw.value
  return date.toLocaleDateString('en-US', { month: 'long' })
})

const year = computed(() => {
  return stableMonth.raw.value.getFullYear()
})

const weekdays = computed(() => {
  const days =
    weekStartsOn.value === 0
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days
})

const weeks = computed(() => {
  const weeksArray = temporal.divide(stableMonth, 'week')

  return weeksArray.map((week) => {
    const days = temporal.divide(week, 'day')

    return days.map((day) => {
      const dayOfWeek = day.raw.value.getDay()
      const isWeekend =
        weekStartsOn.value === 0
          ? dayOfWeek === 0 || dayOfWeek === 6
          : dayOfWeek === 0 || dayOfWeek === 6

      return {
        date: day.raw.value.toISOString(),
        number: day.number.value,
        isCurrentMonth: stableMonth.contains(day.raw.value),
        isToday: day.isNow.value,
        isWeekend,
      }
    })
  })
})
</script>

<style scoped>
.stable-month-example {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 10px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  background: #f5f5f5;
}

.month-year {
  font-weight: 600;
  font-size: 18px;
}

.calendar-grid {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
}

.weeks {
  background: white;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.day:nth-child(7n) {
  border-right: none;
}

.week:last-child .day {
  border-bottom: none;
}

.day:hover {
  background: #f8f8f8;
}

.day.other-month {
  color: #ccc;
}

.day.today {
  background: #007bff;
  color: white;
  font-weight: 600;
}

.day.weekend {
  background: #fafafa;
}

.day.weekend.other-month {
  background: #fcfcfc;
}

.info {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.info p {
  margin: 5px 0;
  font-size: 13px;
}
</style>
