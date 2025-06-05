# PickleCore Interface

The `PickleCore` interface defines the central time management system in useTemporal. It's implemented by the `usePickle` composable and provides the revolutionary `divide()` pattern.

## Interface Definition

```typescript
interface PickleCore {
  // Core reactive state
  date: Ref<Date>;

  // The revolutionary divide pattern
  divide<T extends TimeUnitType>(parent: TimeUnit, childType: T): TimeUnit[];

  // Direct time unit creation
  createUnit<T extends TimeUnitType>(type: T, date?: Date): TimeUnit;

  // Time navigation
  jumpTo(date: Date): void;
  reset(): void;
}
```

## Properties

### `date: Ref<Date>`

The central reactive date that coordinates all time units.

```typescript
const pickle = usePickle({ date: new Date() });

// All time units sync to this date
console.log(pickle.date.value); // Current date

// Changing this updates all units
pickle.date.value = new Date("2024-06-15");
```

## Methods

### `divide<T>(parent: TimeUnit, childType: T): TimeUnit[]`

The core innovation of useTemporal. Divides any time unit into smaller units.

```typescript
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Divide year into months
const months = pickle.divide(year, "month");
console.log(months.length); // 12

// Divide month into days
const month = months[0];
const days = pickle.divide(month, "day");
console.log(days.length); // 28-31 depending on month

// Works at any scale
const today = useDay(pickle);
const hours = pickle.divide(today, "hour");
console.log(hours.length); // 24
```

#### Supported Division Types

```typescript
type TimeUnitType =
  | "millennium"
  | "century"
  | "decade"
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute";

// Any unit can be divided into smaller units
const year = useYear(pickle);
const quarters = pickle.divide(year, "quarter"); // ✅
const months = pickle.divide(year, "month"); // ✅
const weeks = pickle.divide(year, "week"); // ✅
const days = pickle.divide(year, "day"); // ✅

// Cannot divide into larger units
const invalidMonths = pickle.divide(day, "month"); // ❌ Error
```

### `createUnit<T>(type: T, date?: Date): TimeUnit`

Create a time unit directly without division.

```typescript
const pickle = usePickle({ date: new Date() });

// Create units for specific dates
const christmas = pickle.createUnit("day", new Date("2024-12-25"));
const januaryMonth = pickle.createUnit("month", new Date("2024-01-01"));

// Create units for current pickle date
const currentYear = pickle.createUnit("year");
```

### `jumpTo(date: Date): void`

Jump to a specific date, updating all connected time units.

```typescript
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const day = useDay(pickle);

// Jump to specific date
pickle.jumpTo(new Date("2024-07-04"));

// All units update automatically
console.log(month.name); // "July 2024"
console.log(day.name); // "Thursday, July 4, 2024"
```

### `reset(): void`

Reset to the current date.

```typescript
const pickle = usePickle({ date: new Date("2024-01-01") });

// Navigate around
pickle.jumpTo(new Date("2020-01-01"));

// Reset to now
pickle.reset();
console.log(pickle.date.value); // Current date
```

## Implementation Examples

### Basic Time Division

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Get all months in the year
const months = computed(() => pickle.divide(year, "month"));

// Get all days in current month
const currentMonth = useMonth(pickle);
const days = computed(() => pickle.divide(currentMonth, "day"));
</script>

<template>
  <div>
    <h2>{{ year.name }}</h2>

    <div class="months">
      <div v-for="month in months" :key="month.number">
        {{ month.name }}
      </div>
    </div>

    <h3>{{ currentMonth.name }}</h3>
    <div class="days">
      <div v-for="day in days" :key="day.number">
        {{ day.number }}
      </div>
    </div>
  </div>
</template>
```

### Multi-Scale Calendar

```vue
<script setup>
import { usePickle, useYear, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);

// Scale state
const currentScale = ref("month");

// Get appropriate subdivisions based on scale
const subdivisions = computed(() => {
  switch (currentScale.value) {
    case "year":
      return pickle.divide(year, "month");
    case "month":
      return pickle.divide(month, "day");
    case "day":
      const day = useDay(pickle);
      return pickle.divide(day, "hour");
    default:
      return [];
  }
});

const zoomIn = () => {
  const scales = ["year", "month", "day"];
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex < scales.length - 1) {
    currentScale.value = scales[currentIndex + 1];
  }
};

const zoomOut = () => {
  const scales = ["year", "month", "day"];
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex > 0) {
    currentScale.value = scales[currentIndex - 1];
  }
};
</script>

<template>
  <div class="multi-scale-calendar">
    <div class="controls">
      <button @click="zoomOut">Zoom Out</button>
      <span>{{ currentScale }}</span>
      <button @click="zoomIn">Zoom In</button>
    </div>

    <div class="grid">
      <div
        v-for="unit in subdivisions"
        :key="unit.raw.value.getTime()"
        class="unit"
        :class="{ current: unit.isNow }"
      >
        {{ unit.name }}
      </div>
    </div>
  </div>
</template>
```

### Custom Time Range Calculator

```vue
<script setup>
import { usePickle, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Calculate working days in a range
const calculateWorkingDays = (startDate: Date, endDate: Date) => {
  const startDay = pickle.createUnit("day", startDate);
  const endDay = pickle.createUnit("day", endDate);

  const allDays = [];
  let current = startDay;

  while (current.raw.value <= endDate) {
    allDays.push(current);
    current.future();
  }

  return allDays.filter((day) => {
    const dayOfWeek = day.raw.value.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
  });
};

const startDate = ref(new Date());
const endDate = ref(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

const workingDays = computed(() =>
  calculateWorkingDays(startDate.value, endDate.value)
);
</script>

<template>
  <div>
    <h3>Working Days Calculator</h3>

    <div>
      <label>Start Date:</label>
      <input v-model="startDate" type="date" />
    </div>

    <div>
      <label>End Date:</label>
      <input v-model="endDate" type="date" />
    </div>

    <p>Working days: {{ workingDays.length }}</p>

    <div class="working-days">
      <div v-for="day in workingDays" :key="day.raw.value.getTime()">
        {{ day.name }}
      </div>
    </div>
  </div>
</template>
```

## Performance Considerations

### Caching Divisions

```typescript
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Cache expensive divisions
const monthsCache = new Map();
const months = computed(() => {
  const key = year.raw.value.getFullYear();
  if (!monthsCache.has(key)) {
    monthsCache.set(key, pickle.divide(year, "month"));
  }
  return monthsCache.get(key);
});
```

### Lazy Loading

```typescript
// Only calculate when needed
const days = computed(() => {
  if (!showDays.value) return [];
  return pickle.divide(currentMonth, "day");
});
```

## Related Types

- **[TimeUnit](/types/time-unit)** - Interface implemented by all time units
- **[Timespan](/types/timespan)** - Time range representation

## Related Composables

- **[usePickle](/composables/use-pickle)** - Main implementation of this interface
