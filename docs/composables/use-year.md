# useYear

The `useYear` composable provides reactive year-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

console.log(year.name); // "2024"
console.log(year.number); // 2024
console.log(year.isNow); // true if current year
```

## Properties

### `name: ComputedRef<string>`

The year as a formatted string.

```typescript
const year = useYear(pickle);
console.log(year.name); // "2024"
```

### `number: ComputedRef<number>`

The year as a number.

```typescript
const year = useYear(pickle);
console.log(year.number); // 2024
```

### `isNow: ComputedRef<boolean>`

Whether this year contains the current date.

```typescript
const year = useYear(pickle);
console.log(year.isNow); // true if current year
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the year.

```typescript
const year = useYear(pickle);
console.log(year.timespan.start); // "2024-01-01T00:00:00.000Z"
console.log(year.timespan.end); // "2025-01-01T00:00:00.000Z"
```

## Methods

### `past(): void`

Navigate to the previous year.

```typescript
const year = useYear(pickle);
year.past(); // Go to 2023 if currently 2024
```

### `future(): void`

Navigate to the next year.

```typescript
const year = useYear(pickle);
year.future(); // Go to 2025 if currently 2024
```

## Time Division

Divide years into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Get all months in the year
const months = pickle.divide(year, "month");
console.log(months.length); // 12

// Get all days in the year
const days = pickle.divide(year, "day");
console.log(days.length); // 365 or 366

// Get all weeks in the year
const weeks = pickle.divide(year, "week");
console.log(weeks.length); // ~52-53
```

## Examples

### Year Navigator

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

const months = computed(() => pickle.divide(year, "month"));
</script>

<template>
  <div class="year-navigator">
    <div class="year-header">
      <button @click="year.past()">‹ {{ year.number - 1 }}</button>
      <h1>{{ year.name }}</h1>
      <button @click="year.future()">{{ year.number + 1 }} ›</button>
    </div>

    <div class="months-grid">
      <div
        v-for="month in months"
        :key="month.number"
        class="month"
        :class="{ current: month.isNow }"
      >
        {{ month.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.month {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.month.current {
  background: #007acc;
  color: white;
}
</style>
```

### Year Summary

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

const yearStats = computed(() => {
  const months = pickle.divide(year, "month");
  const days = pickle.divide(year, "day");
  const weeks = pickle.divide(year, "week");

  return {
    months: months.length,
    days: days.length,
    weeks: weeks.length,
    isLeapYear: days.length === 366,
    duration: year.timespan.duration,
  };
});
</script>

<template>
  <div class="year-summary">
    <h2>{{ year.name }} Summary</h2>

    <div class="stats">
      <div class="stat">
        <span class="label">Months:</span>
        <span class="value">{{ yearStats.months }}</span>
      </div>

      <div class="stat">
        <span class="label">Days:</span>
        <span class="value">{{ yearStats.days }}</span>
      </div>

      <div class="stat">
        <span class="label">Weeks:</span>
        <span class="value">{{ yearStats.weeks }}</span>
      </div>

      <div class="stat">
        <span class="label">Type:</span>
        <span class="value">{{
          yearStats.isLeapYear ? "Leap Year" : "Regular Year"
        }}</span>
      </div>
    </div>
  </div>
</template>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages years
- **[useMonth](/composables/use-month)** - Divide years into months
- **[useDay](/composables/use-day)** - Divide years into days
- **[useWeek](/composables/use-week)** - Divide years into weeks
