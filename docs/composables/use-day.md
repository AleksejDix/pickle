# useDay

The `useDay` composable provides reactive day-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const day = useDay(pickle);

console.log(day.name); // "Monday, January 15, 2024"
console.log(day.number); // 15 (day of month)
console.log(day.isNow); // true if today
```

## Properties

### `name: ComputedRef<string>`

The day as a formatted string with weekday and date.

```typescript
const day = useDay(pickle);
console.log(day.name); // "Monday, January 15, 2024"
```

### `number: ComputedRef<number>`

The day of the month (1-31).

```typescript
const day = useDay(pickle);
console.log(day.number); // 15
```

## Time Division

Divide days into hours and minutes:

```typescript
const pickle = usePickle({ date: new Date() });
const day = useDay(pickle);

// Get all hours in the day
const hours = pickle.divide(day, "hour");
console.log(hours.length); // 24

// Get all minutes in the day
const minutes = pickle.divide(day, "minute");
console.log(minutes.length); // 1440 (24 hours * 60 minutes)
```

## Examples

### Daily Schedule

```vue
<script setup>
import { usePickle, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const day = useDay(pickle);

const hours = computed(() => pickle.divide(day, "hour"));

const schedule = ref([
  { hour: 9, task: "Daily Standup" },
  { hour: 10, task: "Code Review" },
  { hour: 14, task: "Team Meeting" },
  { hour: 16, task: "Project Planning" },
]);
</script>

<template>
  <div class="daily-schedule">
    <div class="day-header">
      <button @click="day.past()">‹ Yesterday</button>
      <h2>{{ day.name }}</h2>
      <button @click="day.future()">Tomorrow ›</button>
    </div>

    <div class="hours-list">
      <div
        v-for="hour in hours"
        :key="hour.number"
        class="hour-slot"
        :class="{ current: hour.isNow }"
      >
        <div class="hour-time">{{ hour.number }}:00</div>
        <div class="hour-content">
          <template
            v-for="item in schedule.filter((s) => s.hour === hour.number)"
          >
            <div class="task">{{ item.task }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.hours-list {
  max-height: 400px;
  overflow-y: auto;
}

.hour-slot {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0.5rem;
}

.hour-slot.current {
  background: #f0f8ff;
}

.hour-time {
  width: 80px;
  font-weight: bold;
  color: #666;
}

.hour-content {
  flex: 1;
}

.task {
  background: #007acc;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages days
- **[useMonth](/composables/use-month)** - Parent time unit
- **[useWeek](/composables/use-week)** - Parent time unit
- **[useHour](/composables/use-hour)** - Divide days into hours
- **[useMinute](/composables/use-minute)** - Divide days into minutes
