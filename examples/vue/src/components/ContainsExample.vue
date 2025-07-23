<template>
  <div class="contains-example">
    <h2>Contains Method Example</h2>

    <div class="demo-section">
      <h3>Year Contains Check</h3>
      <p>Current Year: {{ year.formatted.long }}</p>
      <div class="contains-checks">
        <div class="check-item" :class="{ contains: year.contains(month) }">
          ✓ Contains current month ({{ month.formatted.long }})
        </div>
        <div class="check-item" :class="{ contains: year.contains(day) }">
          ✓ Contains current day ({{ day.formatted.long }})
        </div>
        <div class="check-item" :class="{ 'not-contains': !year.contains(nextYearMonth) }">
          ✗ Does not contain next year's January
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Month Contains Check</h3>
      <p>Current Month: {{ month.formatted.long }}</p>
      <div class="contains-checks">
        <div class="check-item" :class="{ contains: month.contains(day) }">
          ✓ Contains current day ({{ day.number.value }})
        </div>
        <div class="check-item" :class="{ contains: month.contains(firstDay) }">
          ✓ Contains first day of month
        </div>
        <div class="check-item" :class="{ contains: month.contains(lastDay) }">
          ✓ Contains last day of month
        </div>
        <div class="check-item" :class="{ 'not-contains': !month.contains(nextMonthDay) }">
          ✗ Does not contain next month's first day
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Week Contains Check</h3>
      <p>
        Current Week: {{ week.start.value.toLocaleDateString() }} -
        {{ week.end.value.toLocaleDateString() }}
      </p>
      <div class="contains-checks">
        <div
          v-for="d in weekDays"
          :key="d.raw.value.toISOString()"
          class="check-item"
          :class="{ contains: week.contains(d), today: d.isNow.value }"
        >
          {{ d.raw.value.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) }}
          {{ week.contains(d) ? '✓' : '✗' }}
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Calendar Grid with Contains</h3>
      <div class="calendar-grid">
        <div
          v-for="week in calendarWeeks"
          :key="week[0].raw.value.toISOString()"
          class="calendar-week"
        >
          <div
            v-for="day in week"
            :key="day.raw.value.toISOString()"
            class="calendar-day"
            :class="{
              'in-month': month.contains(day),
              'out-month': !month.contains(day),
              today: day.isNow.value,
              weekend: day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6,
            }"
          >
            {{ day.number.value }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Filtering Events with Contains</h3>
      <div class="event-filters">
        <button @click="filterBy = 'month'" :class="{ active: filterBy === 'month' }">
          This Month
        </button>
        <button @click="filterBy = 'week'" :class="{ active: filterBy === 'week' }">
          This Week
        </button>
        <button @click="filterBy = 'day'" :class="{ active: filterBy === 'day' }">Today</button>
      </div>
      <div class="events-list">
        <div v-for="event in filteredEvents" :key="event.id" class="event-item">
          <span class="event-date">{{ event.date.toLocaleDateString() }}</span>
          <span class="event-title">{{ event.title }}</span>
        </div>
        <div v-if="filteredEvents.length === 0" class="no-events">
          No events for selected period
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createTemporal } from '@usetemporal/core'
import { periods } from '@usetemporal/core'
import { nativeAdapter } from '@usetemporal/adapter-native'

// Create temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
})

// Create time units
const year = periods.year({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
})

const month = periods.month({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
})

const week = periods.week({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
})

const day = periods.day({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
})

// Create test dates
const nextYearMonth = periods.month({
  now: temporal.now,
  browsing: ref(new Date(new Date().getFullYear() + 1, 0, 1)),
  adapter: temporal.adapter,
})

const firstDay = periods.day({
  now: temporal.now,
  browsing: ref(new Date(month.start.value)),
  adapter: temporal.adapter,
})

const lastDay = periods.day({
  now: temporal.now,
  browsing: ref(new Date(month.end.value)),
  adapter: temporal.adapter,
})

const nextMonthDay = periods.day({
  now: temporal.now,
  browsing: ref(temporal.adapter.add(month.end.value, { days: 1 })),
  adapter: temporal.adapter,
})

// Create week days for demonstration
const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = temporal.adapter.add(week.start.value, { days: i })
    days.push(
      periods.day({
        now: temporal.now,
        browsing: ref(date),
        adapter: temporal.adapter,
      }),
    )
  }
  return days
})

// Create calendar grid
const stableMonth = periods.stableMonth({
  now: temporal.now,
  browsing: month.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
})

const calendarWeeks = computed(() => {
  const weeks = temporal.divide(stableMonth, 'week')
  return weeks.map((week) => temporal.divide(week, 'day'))
})

// Sample events for filtering
const events = ref([
  { id: 1, date: new Date(), title: "Today's Meeting" },
  { id: 2, date: temporal.adapter.add(new Date(), { days: 2 }), title: 'Team Standup' },
  { id: 3, date: temporal.adapter.add(new Date(), { days: 7 }), title: 'Next Week Planning' },
  { id: 4, date: temporal.adapter.add(new Date(), { days: -3 }), title: 'Past Event' },
  { id: 5, date: temporal.adapter.add(new Date(), { days: 15 }), title: 'Future Workshop' },
])

const filterBy = ref<'month' | 'week' | 'day'>('month')

const filteredEvents = computed(() => {
  const period = filterBy.value === 'month' ? month : filterBy.value === 'week' ? week : day

  return events.value.filter((event) => period.contains(event.date))
})
</script>

<style scoped>
.contains-example {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 3rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.contains-checks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.check-item {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: white;
  border: 1px solid #e0e0e0;
}

.check-item.contains {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.check-item.not-contains {
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.check-item.today {
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 4px;
  margin-top: 1rem;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day.in-month {
  background: white;
  color: #333;
}

.calendar-day.out-month {
  background: #f5f5f5;
  color: #999;
}

.calendar-day.today {
  background: #2196f3;
  color: white;
  font-weight: bold;
}

.calendar-day.weekend {
  color: #f44336;
}

.calendar-day.weekend.out-month {
  color: #ffcdd2;
}

.event-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.event-filters button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-filters button.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}

.event-date {
  color: #666;
  font-size: 0.9rem;
}

.event-title {
  font-weight: 500;
}

.no-events {
  padding: 1rem;
  text-align: center;
  color: #999;
  font-style: italic;
}
</style>
