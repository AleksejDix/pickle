<template>
  <div class="week-view">
    <div class="week-header">
      <div class="time-gutter"></div>
      <div class="days-header">
        <div
          v-for="day in days"
          :key="day.raw.value.toISOString()"
          class="day-header"
          :class="{ 'is-today': day.isNow.value }"
        >
          <div class="day-name">{{ getDayName(day) }}</div>
          <div class="day-date" :class="{ 'is-today': day.isNow.value }">
            {{ day.number.value }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="week-body">
      <div class="time-labels">
        <div v-for="hour in 24" :key="hour" class="time-label">
          {{ formatHour(hour - 1) }}
        </div>
      </div>
      
      <div class="days-grid">
        <div
          v-for="day in days"
          :key="day.raw.value.toISOString()"
          class="day-column"
        >
          <div class="hours-grid">
            <div
              v-for="hour in 24"
              :key="hour"
              class="hour-slot"
              :class="{ 'is-current': isCurrentHour(day, hour - 1) }"
            >
              <div class="hour-content"></div>
            </div>
          </div>
          
          <div
            v-if="day.isNow.value"
            class="current-time-indicator"
            :style="{ top: currentTimePosition + 'px' }"
          >
            <div class="time-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { TemporalCore, TimeUnit } from 'usetemporal';
import { useWeek } from 'usetemporal';

const props = defineProps<{
  temporal: TemporalCore;
  initialWeek?: TimeUnit;
}>();

const week = props.initialWeek ? props.initialWeek : useWeek(props.temporal);
const days = computed(() => props.temporal.divide(week, 'day'));

const currentTime = ref(new Date());
let intervalId: number;

onMounted(() => {
  intervalId = window.setInterval(() => {
    currentTime.value = new Date();
  }, 60000); // Update every minute
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const currentTimePosition = computed(() => {
  const hours = currentTime.value.getHours();
  const minutes = currentTime.value.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / (24 * 60)) * (24 * 60); // 60px per hour
});

function getDayName(day: TimeUnit) {
  const date = day.raw.value;
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function isCurrentHour(day: TimeUnit, hour: number) {
  if (!day.isNow.value) return false;
  return currentTime.value.getHours() === hour;
}
</script>

<style scoped>
.week-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.week-header {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.time-gutter {
  width: 60px;
  flex-shrink: 0;
}

.days-header {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-header {
  text-align: center;
  padding: 15px 0;
  border-left: 1px solid #e0e0e0;
}

.day-header:first-child {
  border-left: none;
}

.day-name {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.day-date {
  font-size: 20px;
  font-weight: 400;
  color: #333;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto;
}

.day-date.is-today {
  background-color: #007aff;
  color: white;
  font-weight: 500;
}

.week-body {
  flex: 1;
  display: flex;
  overflow-y: auto;
  position: relative;
}

.time-labels {
  width: 60px;
  flex-shrink: 0;
  padding-top: 0;
}

.time-label {
  height: 60px;
  padding-right: 10px;
  text-align: right;
  font-size: 11px;
  color: #666;
  line-height: 1;
  position: relative;
  top: -8px;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
}

.day-column {
  border-left: 1px solid #e0e0e0;
  position: relative;
}

.day-column:first-child {
  border-left: none;
}

.hours-grid {
  position: relative;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.hour-slot:hover {
  background-color: #f5f5f5;
}

.hour-slot.is-current {
  background-color: #fff3e0;
}

.hour-content {
  height: 100%;
  padding: 2px 4px;
  font-size: 11px;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
}

.time-line {
  height: 2px;
  background-color: #ff3b30;
  position: relative;
}

.time-line::before {
  content: '';
  position: absolute;
  left: -6px;
  top: -4px;
  width: 10px;
  height: 10px;
  background-color: #ff3b30;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .time-gutter, .time-labels {
    width: 50px;
  }
  
  .day-name {
    font-size: 11px;
  }
  
  .day-date {
    font-size: 16px;
    width: 30px;
    height: 30px;
  }
}
</style>