<template>
  <div class="day-view">
    <div class="day-header">
      <h2>{{ dayTitle }}</h2>
      <div class="day-info">
        {{ dayInfo }}
      </div>
    </div>

    <div class="day-timeline">
      <div class="hours-container">
        <div
          v-for="hour in hours"
          :key="hour.date.toISOString()"
          class="hour-block"
          :class="{ 'is-current': isCurrentHour(hour) }"
        >
          <div class="hour-label">
            {{ formatHour(hour.date.getHours()) }}
          </div>
          <div class="hour-content">
            <div class="hour-line"></div>
          </div>
        </div>

        <div
          v-if="isToday(day)"
          class="current-time-indicator"
          :style="{ top: currentTimePosition + 'px' }"
        >
          <div class="time-dot"></div>
          <div class="time-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import type { Temporal, Period } from 'usetemporal'
import { usePeriod, divide, isSame, toPeriod } from 'usetemporal'

const props = defineProps<{
  temporal: Temporal
  initialDay?: ComputedRef<Period>
}>()

const day = props.initialDay || usePeriod(props.temporal, 'day')

const dayTitle = computed(() => {
  return formatDate(day.value.date)
})

const dayInfo = computed(() => {
  return getDayOfWeek(day.value.date)
})

const hours = computed(() => divide(props.temporal, day.value, 'hour'))

// Use temporal's reactive now value which updates automatically
const currentTime = computed(() => props.temporal.now.value.date)

const currentTimePosition = computed(() => {
  const now = currentTime.value
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes
  return (totalMinutes / (24 * 60)) * (24 * 80) // 80px per hour
})

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getDayOfWeek(date: Date) {
  const dayPeriod = toPeriod(props.temporal, date, 'day')

  if (isSame(props.temporal, dayPeriod, props.temporal.now.value, 'day')) return 'Today'

  const diffTime = date.getTime() - props.temporal.now.value.date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'

  return ''
}

function isToday(day: Period): boolean {
  return isSame(props.temporal, day, props.temporal.now.value, 'day')
}

function isCurrentHour(hour: Period): boolean {
  return isSame(props.temporal, hour, props.temporal.now.value, 'hour')
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}
</script>

<style scoped>
.day-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.day-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.day-header h2 {
  font-size: 24px;
  font-weight: 400;
  color: #333;
  margin: 0 0 5px 0;
}

.day-info {
  font-size: 14px;
  color: #666;
}

.day-timeline {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.hours-container {
  position: relative;
  padding-bottom: 20px;
}

.hour-block {
  display: flex;
  height: 80px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.hour-block.is-current {
  background-color: #fff3e0;
}

.hour-label {
  width: 80px;
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  text-align: right;
  flex-shrink: 0;
}

.hour-content {
  flex: 1;
  position: relative;
  padding: 8px 16px;
}

.hour-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e0e0e0;
}

.current-time-indicator {
  position: absolute;
  left: 80px;
  right: 0;
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.time-dot {
  width: 12px;
  height: 12px;
  background-color: #ff3b30;
  border-radius: 50%;
  margin-right: -6px;
  position: relative;
  left: -6px;
}

.time-line {
  flex: 1;
  height: 2px;
  background-color: #ff3b30;
}

.hour-block:hover {
  background-color: #f5f5f5;
}

.hour-block.is-current:hover {
  background-color: #ffe0b2;
}

@media (max-width: 768px) {
  .hour-label {
    width: 60px;
    font-size: 11px;
    padding: 8px;
  }

  .hour-block {
    height: 60px;
  }

  .current-time-indicator {
    left: 60px;
  }
}
</style>
