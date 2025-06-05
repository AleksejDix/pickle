# useMonth

The `useMonth` composable provides reactive month-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

console.log(month.name); // "January 2024"
console.log(month.number); // 1 (January)
console.log(month.isNow); // true if current month
```

## Properties

### `name: ComputedRef<string>`

The month as a formatted string with year.

```typescript
const month = useMonth(pickle);
console.log(month.name); // "January 2024"
```

### `number: ComputedRef<number>`

The month number (1-12).

```typescript
const month = useMonth(pickle);
console.log(month.number); // 1 for January, 12 for December
```

### `isNow: ComputedRef<boolean>`

Whether this month contains the current date.

```typescript
const month = useMonth(pickle);
console.log(month.isNow); // true if current month
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the month.

```typescript
const month = useMonth(pickle);
console.log(month.timespan.start); // "2024-01-01T00:00:00.000Z"
console.log(month.timespan.end); // "2024-02-01T00:00:00.000Z"
```

## Methods

### `past(): void`

Navigate to the previous month.

```typescript
const month = useMonth(pickle);
month.past(); // Go to December if currently January
```

### `future(): void`

Navigate to the next month.

```typescript
const month = useMonth(pickle);
month.future(); // Go to February if currently January
```

## Time Division

Divide months into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Get all days in the month
const days = pickle.divide(month, "day");
console.log(days.length); // 28-31 depending on month

// Get all weeks that intersect with the month
const weeks = pickle.divide(month, "week");
console.log(weeks.length); // ~4-6 weeks

// Get all hours in the month
const hours = pickle.divide(month, "hour");
console.log(hours.length); // 672-744 hours
```

## Examples

### Month Calendar

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

const days = computed(() => pickle.divide(month, "day"));
const selectedDate = ref(new Date());

const selectDay = (day) => {
  selectedDate.value = day.raw.value;
};

const isSelected = (day) => {
  return day.raw.value.toDateString() === selectedDate.value.toDateString();
};
</script>

<template>
  <div class="month-calendar">
    <div class="month-header">
      <button @click="month.past()">‹</button>
      <h2>{{ month.name }}</h2>
      <button @click="month.future()">›</button>
    </div>

    <div class="calendar-grid">
      <div class="weekday-header">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      <div class="days-grid">
        <div
          v-for="day in days"
          :key="day.raw.value.getTime()"
          class="day"
          :class="{
            today: day.isNow,
            selected: isSelected(day),
          }"
          @click="selectDay(day)"
        >
          {{ day.number }}
        </div>
      </div>
    </div>

    <p>Selected: {{ selectedDate.toLocaleDateString() }}</p>
  </div>
</template>

<style scoped>
.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday-header span {
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
  border-radius: 4px;
}

.day:hover {
  background: #f0f0f0;
}

.day.today {
  background: #007acc;
  color: white;
}

.day.selected {
  background: #ff6b6b;
  color: white;
}
</style>
```

### Month Statistics

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

const monthStats = computed(() => {
  const days = pickle.divide(month, "day");
  const weekdays = days.filter((day) => {
    const dayOfWeek = day.raw.value.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  });
  const weekends = days.filter((day) => {
    const dayOfWeek = day.raw.value.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  });

  return {
    totalDays: days.length,
    weekdays: weekdays.length,
    weekends: weekends.length,
    duration: month.timespan.duration,
  };
});
</script>

<template>
  <div class="month-stats">
    <h2>{{ month.name }} Statistics</h2>

    <div class="stats-grid">
      <div class="stat">
        <h3>{{ monthStats.totalDays }}</h3>
        <p>Total Days</p>
      </div>

      <div class="stat">
        <h3>{{ monthStats.weekdays }}</h3>
        <p>Weekdays</p>
      </div>

      <div class="stat">
        <h3>{{ monthStats.weekends }}</h3>
        <p>Weekend Days</p>
      </div>

      <div class="stat">
        <h3>{{ Math.round(monthStats.duration / (1000 * 60 * 60)) }}</h3>
        <p>Total Hours</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.stat h3 {
  font-size: 2rem;
  margin: 0;
  color: #007acc;
}

.stat p {
  margin: 0.5rem 0 0 0;
  color: #666;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages months
- **[useYear](/composables/use-year)** - Parent time unit
- **[useDay](/composables/use-day)** - Divide months into days
- **[useWeek](/composables/use-week)** - Divide months into weeks

```

```
