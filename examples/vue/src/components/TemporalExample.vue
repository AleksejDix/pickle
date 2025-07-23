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
      <p>{{ formatDate(temporal.value.now.value) }}</p>
      <p>Adapter: {{ temporal.value.adapter.name }}</p>
    </div>

    <div class="year-info">
      <h3>Year Information</h3>
      <p>Year: {{ year.number.value }}</p>
      <p>Is Current Year: {{ year.isNow.value }}</p>
      <div class="navigation">
        <button @click="year.previous()">Previous Year</button>
        <button @click="year.next()">Next Year</button>
      </div>
    </div>

    <div class="month-grid">
      <h3>Months in {{ year.number.value }}</h3>
      <div class="months">
        <div
          v-for="month in months"
          :key="month.raw.value.toISOString()"
          class="month"
          :class="{ current: month.isNow.value, selected: isSelectedMonth(month) }"
          @click="selectMonth(month)"
        >
          {{ month.raw.value.toLocaleDateString('en-US', { month: 'short' }) }}
        </div>
      </div>
    </div>

    <div v-if="selectedMonth" class="days-grid">
      <h3>
        Days in
        {{
          selectedMonth.raw.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }}
      </h3>
      <div class="days">
        <div
          v-for="day in days"
          :key="day.raw.value.toISOString()"
          class="day"
          :class="{ current: day.isNow.value }"
        >
          {{ day.number.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createTemporal, periods, type TemporalCore, type TimeUnit } from 'usetemporal'
import { DateFnsAdapter } from '@usetemporal/adapter-date-fns'
import { LuxonAdapter } from '@usetemporal/adapter-luxon'
import { nativeAdapter } from '@usetemporal/adapter-native'

// Selected adapter
const selectedAdapter = ref('native')

// Create temporal instance
const temporal = ref<TemporalCore>(createTemporal({ dateAdapter: nativeAdapter }))

// Create composables
const year = computed(() => periods.year(temporal.value))
const months = computed(() => temporal.value.divide(year.value, 'month'))
const selectedMonth = ref<TimeUnit | null>(null)
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
      adapter = nativeAdapter
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

// Select a month
function selectMonth(month: TimeUnit) {
  selectedMonth.value = month
}

// Check if month is selected
function isSelectedMonth(month: TimeUnit): boolean {
  return selectedMonth.value?.raw.value.getMonth() === month.raw.value.getMonth()
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
}

.adapter-selection label {
  margin-right: 10px;
}

.adapter-selection select {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.current-time,
.year-info,
.month-grid,
.days-grid {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.navigation {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.navigation button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.navigation button:hover {
  background: #0056b3;
}

.months {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.month {
  padding: 15px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.month:hover {
  background: #f0f0f0;
  border-color: #007bff;
}

.month.current {
  background: #e3f2fd;
  border-color: #2196f3;
  font-weight: bold;
}

.month.selected {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  padding: 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
}

.day.current {
  background: #2196f3;
  color: white;
  font-weight: bold;
}

.day.weekend {
  background: #ffebee;
}

.day.weekend.current {
  background: #1976d2;
}
</style>
