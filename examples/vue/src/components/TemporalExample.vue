<template>
  <div class="temporal-example">
    <h2>useTemporal Example</h2>

    <div class="adapter-selection">
      <label>Select Adapter:</label>
      <select v-model="selectedAdapter" @change="changeAdapter">
        <option value="native">Native (Zero Dependencies)</option>
        <option value="date-fns">date-fns</option>
        <option value="luxon">Luxon</option>
      </select>
    </div>

    <div class="current-time">
      <h3>Current Time</h3>
      <p>{{ formatDate(temporal.now.value) }}</p>
      <p>Adapter: {{ temporal.adapter.name }}</p>
    </div>

    <div class="year-info">
      <h3>Year Information</h3>
      <p>Year: {{ year.number.value }}</p>
      <p>Is Current Year: {{ year.isNow.value }}</p>
      <div class="navigation">
        <button @click="year.past()">Previous Year</button>
        <button @click="year.future()">Next Year</button>
      </div>
    </div>

    <div class="months-grid">
      <h3>Months in {{ year.number.value }}</h3>
      <div class="months">
        <div
          v-for="month in months"
          :key="month.number.value"
          class="month"
          :class="{ current: month.isNow.value }"
        >
          {{ month.name.value }}
        </div>
      </div>
    </div>

    <div class="selected-month" v-if="selectedMonth">
      <h3>Days in {{ selectedMonth.name.value }}</h3>
      <div class="days">
        <div
          v-for="day in days"
          :key="day.raw.value.toISOString()"
          class="day"
          :class="{ current: day.isNow.value, weekend: day.we?.value }"
        >
          {{ day.number.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  createTemporal,
  periods,
  type TemporalCore,
  type TimeUnit,
} from 'usetemporal'
import { DateFnsAdapter } from '@usetemporal/adapter-date-fns'
import { LuxonAdapter } from '@usetemporal/adapter-luxon'

// Selected adapter
const selectedAdapter = ref('native')

// Create temporal instance
const temporal = ref<TemporalCore>(createTemporal())

// Create composables
const year = periods.year(temporal.value)
const months = computed(() => temporal.value.divide(year, 'month'))
const selectedMonth = ref<TimeUnit | null>(months.value[new Date().getMonth()])
const days = computed(() =>
  selectedMonth.value ? temporal.value.divide(selectedMonth.value, 'day') : [],
)

// Change adapter
function changeAdapter() {
  let adapter
  switch (selectedAdapter.value) {
    case 'date-fns':
      adapter = new DateFnsAdapter()
      break
    case 'luxon':
      adapter = new LuxonAdapter()
      break
    default:
      adapter = undefined // Will use native adapter
  }

  temporal.value = createTemporal({ dateAdapter: adapter })
}

// Format date for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

</script>

<style scoped>
.temporal-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.adapter-selection {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.adapter-selection label {
  margin-right: 10px;
  font-weight: bold;
}

.current-time {
  margin-bottom: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
}

.year-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f3e5f5;
  border-radius: 8px;
}

.navigation {
  margin-top: 10px;
}

.navigation button {
  margin-right: 10px;
  padding: 5px 15px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.navigation button:hover {
  background: #f0f0f0;
}

.months-grid {
  margin-bottom: 20px;
}

.months {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.month {
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.month:hover {
  background: #f0f0f0;
}

.month.current {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.selected-month {
  margin-top: 20px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.day {
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.day.current {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.day.weekend {
  background: #ffebee;
}

.day.weekend.current {
  background: #1976d2;
}
</style>
