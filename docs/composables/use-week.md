# useWeek

The `useWeek` composable provides reactive week-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useWeek } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const week = useWeek(pickle);

console.log(week.name); // "Week of January 8, 2024"
console.log(week.number); // Week number in year
console.log(week.isNow); // true if current week
```

## Properties

### `name: ComputedRef<string>`

The week as a formatted string.

```typescript
const week = useWeek(pickle);
console.log(week.name); // "Week of January 8, 2024"
```

### `number: ComputedRef<number>`

The week number in the year (1-53).

```typescript
const week = useWeek(pickle);
console.log(week.number); // 2 (second week of year)
```

## Time Division

Divide weeks into days:

```typescript
const pickle = usePickle({ date: new Date() });
const week = useWeek(pickle);

// Get all days in the week
const days = pickle.divide(week, "day");
console.log(days.length); // 7

// Get all hours in the week
const hours = pickle.divide(week, "hour");
console.log(hours.length); // 168 (7 days * 24 hours)
```

## Examples

### Week Planner

```vue
<script setup>
import { usePickle, useWeek } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const week = useWeek(pickle);

const days = computed(() => pickle.divide(week, "day"));

const events = ref([
  { day: 1, time: "09:00", title: "Team Meeting" },
  { day: 3, time: "14:00", title: "Client Call" },
  { day: 5, time: "10:00", title: "Project Review" },
]);
</script>

<template>
  <div class="week-planner">
    <div class="week-header">
      <button @click="week.past()">‹ Previous Week</button>
      <h2>{{ week.name }}</h2>
      <button @click="week.future()">Next Week ›</button>
    </div>

    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.raw.value.getTime()"
        class="day-column"
        :class="{ today: day.isNow }"
      >
        <h3>{{ day.name.split(",")[0] }}</h3>
        <div class="day-content">
          <div
            v-for="event in events.filter(
              (e) => e.day === day.raw.value.getDay()
            )"
            :key="event.title"
            class="event"
          >
            <span class="time">{{ event.time }}</span>
            <span class="title">{{ event.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.day-column {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  min-height: 200px;
}

.day-column.today {
  background: #f0f8ff;
  border-color: #007acc;
}

.event {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #007acc;
  color: white;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.time {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages weeks
- **[useMonth](/composables/use-month)** - Parent time unit
- **[useDay](/composables/use-day)** - Divide weeks into days
