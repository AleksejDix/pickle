# API Reference

Complete reference for all useTemporal composables, types, and interfaces.

## Core Composables

The fundamental building blocks of useTemporal's hierarchical time system.

### [usePickle](/composables/use-pickle)

The central time coordination hub that manages reactive date state and provides the revolutionary `divide()` pattern.

```typescript
const pickle = usePickle({ date: new Date() });
```

### Time Unit Composables

All time units share the same consistent interface and work seamlessly together:

- **[useYear](/composables/use-year)** - Year-level time operations
- **[useMonth](/composables/use-month)** - Month-level time operations
- **[useWeek](/composables/use-week)** - Week-level time operations
- **[useDay](/composables/use-day)** - Day-level time operations
- **[useHour](/composables/use-hour)** - Hour-level time operations
- **[useMinute](/composables/use-minute)** - Minute-level time operations

## Quick Reference

### Common Patterns

```typescript
// Basic setup
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Navigation
month.past(); // Previous month
month.future(); // Next month

// Properties
month.raw; // Raw Date object
month.name; // "January 2024"
month.number; // 1 (for January)
month.isNow; // Boolean - contains current time
month.timespan; // { start: Date, end: Date }

// Division
const days = pickle.divide(month, "day"); // Array of day units
const hours = pickle.divide(day, "hour"); // Array of hour units
```

### Time Unit Interface

Every time unit implements this consistent interface:

```typescript
interface TimeUnit {
  // Core properties
  raw: Ref<Date>;
  name: ComputedRef<string>;
  number: ComputedRef<number>;
  isNow: ComputedRef<boolean>;
  timespan: ComputedRef<{ start: Date; end: Date }>;

  // Navigation methods
  past(): void;
  future(): void;

  // Utility methods
  isSame(date: Date): boolean;
  contains(date: Date): boolean;
}
```

## Type Definitions

### [TimeUnit](/types/time-unit)

The core interface implemented by all time units, ensuring consistent behavior across all scales.

### [PickleCore](/types/pickle-core)

The central interface for time management, including the `divide()` method and reactive state.

### [Timespan](/types/timespan)

Represents time boundaries with start and end dates, duration calculations, and overlap detection.

## Examples by Use Case

### Basic Date Selection

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = computed(() => pickle.divide(month, "day"));

const selectedDate = ref(new Date());
</script>

<template>
  <div class="date-picker">
    <div class="month-nav">
      <button @click="month.past()">‹</button>
      <h2>{{ month.name }}</h2>
      <button @click="month.future()">›</button>
    </div>

    <div class="days-grid">
      <button
        v-for="day in days"
        :key="day.raw.value.getTime()"
        @click="selectedDate = day.raw.value"
        :class="{
          today: day.isNow,
          selected: day.isSame(selectedDate),
        }"
      >
        {{ day.number }}
      </button>
    </div>
  </div>
</template>
```

### Multi-Scale Navigation

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// All units stay synchronized automatically
const navigateYear = () => year.future();
const navigateMonth = () => month.future();
const navigateDay = () => day.future();
</script>

<template>
  <div class="multi-scale-nav">
    <button @click="navigateYear">{{ year.name }} ›</button>
    <button @click="navigateMonth">{{ month.name }} ›</button>
    <button @click="navigateDay">{{ day.name }} ›</button>
  </div>
</template>
```

### Custom Time Ranges

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Get different subdivisions
const quarters = computed(() => pickle.divide(year, "quarter"));
const months = computed(() => pickle.divide(year, "month"));
const weeks = computed(() => pickle.divide(year, "week"));

// Filter for business logic
const workingDays = computed(() => {
  const allDays = pickle.divide(year, "day");
  return allDays.filter((day) => !day.isWeekend);
});
</script>
```

## Performance Considerations

### Lazy Loading

```typescript
// Only compute when needed
const months = computed(() => {
  if (!showMonths.value) return [];
  return pickle.divide(year, "month");
});
```

### Caching Results

```typescript
// Cache expensive computations
const cachedDays = computed(() => {
  const key = `${month.raw.value.getFullYear()}-${month.raw.value.getMonth()}`;
  if (!cache.has(key)) {
    cache.set(key, pickle.divide(month, "day"));
  }
  return cache.get(key);
});
```

## Migration Guides

### From Date-fns

```typescript
// Before (date-fns)
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const start = startOfMonth(new Date());
const end = endOfMonth(new Date());
const days = eachDayOfInterval({ start, end });

// After (useTemporal)
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = pickle.divide(month, "day");
```

### From Moment.js

```typescript
// Before (Moment.js)
import moment from "moment";

const month = moment();
const days = [];
for (let i = 1; i <= month.daysInMonth(); i++) {
  days.push(moment().date(i));
}

// After (useTemporal)
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = pickle.divide(month, "day");
```

## Next Steps

- **[Getting Started](/getting-started)** - Quick introduction
- **[Examples](/examples/)** - Real-world implementations
- **[Core Concepts](/concepts/hierarchical-units)** - Understand the architecture

## API Support

- **TypeScript**: Full type safety and IntelliSense
- **Vue 3.3+**: Composition API and reactivity
- **Tree Shaking**: Import only what you need
- **SSR**: Server-side rendering compatible
