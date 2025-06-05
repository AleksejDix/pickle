# Time Unit Interface

The **TimeUnit interface** is the contract that makes useTemporal's hierarchical architecture possible. Every time unit - from millennium to minute - implements this exact same interface, creating **unprecedented consistency** across all time scales.

## The Interface

```typescript
interface TimeUnit {
  // Core Properties
  raw: ComputedRef<Date>; // The actual Date object
  timespan: ComputedRef<TimeSpan>; // Start and end of period
  isNow: ComputedRef<boolean>; // Contains current time?

  // Navigation
  future: () => void; // Move forward in time
  past: () => void; // Move backward in time
  browsing: Ref<Date>; // Current browsing date

  // Display
  number: ComputedRef<number>; // Numeric representation
  name: ComputedRef<string>; // Human-readable name

  // Comparison
  isSame: (a: Date, b: Date) => boolean;
}
```

## Extended Interface

Some time units provide additional properties:

```typescript
interface ExtendedTimeUnit extends TimeUnit {
  weekDay?: ComputedRef<number>; // Day of week (for months)
  format?: (date: Date) => number | string; // Custom formatter
  we?: ComputedRef<boolean>; // Weekend indicator (for days)
}
```

## Core Properties

### `raw` - The Actual Date

Every time unit provides access to its underlying Date object:

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// All provide the same .raw property
console.log(year.raw.value); // Date object for current year
console.log(month.raw.value); // Date object for current month
console.log(day.raw.value); // Date object for current day
</script>
```

### `timespan` - Period Boundaries

Each time unit knows its exact start and end:

```typescript
interface TimeSpan {
  start: Date; // Period start (inclusive)
  end: Date; // Period end (exclusive)
}
```

```vue
<script setup>
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// Every unit has precise boundaries
console.log(year.timespan.value.start); // January 1st 00:00:00
console.log(year.timespan.value.end); // January 1st next year 00:00:00

console.log(month.timespan.value.start); // 1st of month 00:00:00
console.log(month.timespan.value.end); // 1st of next month 00:00:00

console.log(day.timespan.value.start); // Day start 00:00:00
console.log(day.timespan.value.end); // Next day 00:00:00
</script>
```

### `isNow` - Current Time Detection

Reactive detection of whether this time unit contains "now":

```vue
<script setup>
const pickle = usePickle({
  date: new Date(),
  now: new Date(),
});

const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
</script>

<template>
  <div>
    <!-- All units can detect if they contain "now" -->
    <div :class="{ current: year.isNow }">
      Year {{ year.number }} {{ year.isNow ? "(Current)" : "" }}
    </div>

    <div :class="{ current: month.isNow }">
      {{ month.name }} {{ month.isNow ? "(Current)" : "" }}
    </div>

    <div :class="{ current: day.isNow }">
      Day {{ day.number }} {{ day.isNow ? "(Today)" : "" }}
    </div>
  </div>
</template>
```

## Navigation Methods

### `future()` and `past()`

Consistent navigation across all time scales:

```vue
<script setup>
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// Identical navigation interface for all units
const navigate = () => {
  year.future(); // Next year
  month.future(); // Next month
  day.future(); // Next day

  year.past(); // Previous year
  month.past(); // Previous month
  day.past(); // Previous day
};
</script>

<template>
  <div class="navigation-example">
    <!-- Consistent navigation UI -->
    <div v-for="unit in [year, month, day]" :key="unit.name">
      <button @click="unit.past()">‹ Previous</button>
      <span>{{ unit.name }}</span>
      <button @click="unit.future()">Next ›</button>
    </div>
  </div>
</template>
```

### `browsing` - Navigation State

Shared browsing state across all time units:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);

// All units share the same browsing state
watch(year.browsing, (newDate) => {
  console.log("Year changed, month automatically follows:", newDate);
});

// Navigation synchronizes automatically
year.future(); // Month, day, etc. all update to match
</script>
```

## Display Properties

### `number` - Numeric Representation

Each time unit provides its numeric value:

```vue
<script setup>
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
const hour = useHour(pickle);
</script>

<template>
  <div class="numeric-display">
    Year: {{ year.number }}
    <!-- 2024 -->
    Month: {{ month.number }}
    <!-- 12 -->
    Day: {{ day.number }}
    <!-- 25 -->
    Hour: {{ hour.number }}
    <!-- 14 -->
  </div>
</template>
```

### `name` - Human-Readable Labels

Internationalized, human-friendly names:

```vue
<script setup>
const pickle = usePickle({
  date: new Date(),
  locale: "en-US",
});

const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
</script>

<template>
  <div class="name-display">
    {{ year.name }}
    <!-- "2024" -->
    {{ month.name }}
    <!-- "December" -->
    {{ day.name }}
    <!-- "Wednesday" -->
  </div>
</template>
```

## Comparison Method

### `isSame()` - Time Unit Comparison

Consistent comparison across all time units:

```vue
<script setup>
const selectedDate = ref(new Date());
const day = useDay(pickle);

// Compare time units at their natural granularity
function isSelected(timeUnit: TimeUnit): boolean {
  return timeUnit.isSame(selectedDate.value, timeUnit.raw.value);
}
</script>

<template>
  <button
    :class="{ selected: isSelected(day) }"
    @click="selectedDate = day.raw"
  >
    {{ day.name }}
  </button>
</template>
```

## Interface Consistency Examples

### Generic Time Navigation Component

Because all time units share the same interface, you can create generic components:

```vue
<!-- TimeNavigator.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

// Works with ANY time unit!
const props = defineProps<{
  timeUnit: TimeUnit;
  label?: string;
}>();
</script>

<template>
  <div class="time-navigator">
    <button @click="timeUnit.past()">‹</button>

    <div class="time-display">
      <h3>{{ label || "Current" }}</h3>
      <p :class="{ current: timeUnit.isNow }">
        {{ timeUnit.name }}
      </p>
    </div>

    <button @click="timeUnit.future()">›</button>
  </div>
</template>

<!-- Usage -->
<template>
  <!-- Same component works for all time units! -->
  <TimeNavigator :time-unit="year" label="Year" />
  <TimeNavigator :time-unit="month" label="Month" />
  <TimeNavigator :time-unit="day" label="Day" />
  <TimeNavigator :time-unit="hour" label="Hour" />
</template>
```

### Universal Time Display

```vue
<!-- TimeDisplay.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

const props = defineProps<{
  timeUnits: TimeUnit[];
}>();
</script>

<template>
  <div class="time-hierarchy">
    <div
      v-for="unit in timeUnits"
      :key="unit.raw.value.getTime()"
      :class="{ current: unit.isNow }"
      class="time-unit"
    >
      <strong>{{ unit.number }}</strong>
      <span>{{ unit.name }}</span>
    </div>
  </div>
</template>

<!-- Usage -->
<script setup>
// Mix and match any time units!
const timeUnits = [
  useYear(pickle),
  useMonth(pickle),
  useDay(pickle),
  useHour(pickle),
];
</script>

<template>
  <TimeDisplay :time-units="timeUnits" />
</template>
```

### Dynamic Time Selection

```vue
<script setup>
import type { TimeUnit } from 'usetemporal'

const timeUnits = ref<TimeUnit[]>([
  useYear(pickle),
  useMonth(pickle),
  useWeek(pickle),
  useDay(pickle),
  useHour(pickle),
  useMinute(pickle)
])

const selectedUnit = ref<TimeUnit>()

// Generic selection handler
function selectTimeUnit(unit: TimeUnit) {
  selectedUnit.value = unit
  // Any time unit works the same way!
}
</script>

<template>
  <div class="time-selector">
    <div
      v-for="unit in timeUnits"
      :key="unit.name.value"
      @click="selectTimeUnit(unit)"
      :class="{
        selected: selectedUnit === unit,
        current: unit.isNow,
      }"
      class="selectable-unit"
    >
      <span class="unit-number">{{ unit.number }}</span>
      <span class="unit-name">{{ unit.name }}</span>
    </div>
  </div>
</template>
```

## Extended Properties

### Weekend Detection (`we`)

Available on day time units:

```vue
<script setup>
const days = computed(() => pickle.divide(month, "day"));
</script>

<template>
  <div
    v-for="day in days"
    :key="day.raw"
    :class="{ weekend: day.we }"
    class="day-cell"
  >
    {{ day.number }}
  </div>
</template>

<style>
.day-cell.weekend {
  color: red;
}
</style>
```

### Weekday Position (`weekDay`)

Available on month time units:

```vue
<script setup>
const month = useMonth(pickle);

// Get the weekday of the first day of the month
const monthStartWeekday = month.weekDay;
</script>

<template>
  <div>
    Month starts on:
    {{
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][monthStartWeekday.value]
    }}
  </div>
</template>
```

## Interface Benefits

### 🎯 **Predictable API**

Learn the interface once, use it everywhere. No context switching between different time scales.

### 🔄 **Composable Design**

Time units can be composed, mixed, and matched because they all work the same way.

### 📐 **Mathematical Consistency**

Each unit knows its boundaries and relationships, eliminating edge cases.

### 🏗️ **Architectural Flexibility**

Build complex time interfaces by combining simple, consistent building blocks.

## Advanced Interface Usage

### Time Unit Factory

```typescript
// Create time units dynamically
function createTimeUnit(type: TimeUnitType, pickle: PickleCore): TimeUnit {
  const factories = {
    year: () => useYear(pickle),
    month: () => useMonth(pickle),
    day: () => useDay(pickle),
    hour: () => useHour(pickle),
    minute: () => useMinute(pickle),
  };

  return factories[type]();
}

// All return objects with identical interfaces
const dynamicYear = createTimeUnit("year", pickle);
const dynamicDay = createTimeUnit("day", pickle);

// Both work exactly the same way
dynamicYear.future();
dynamicDay.future();
```

### Time Unit Validation

```typescript
// Generic validation that works for any time unit
function isValidTimeUnit(unit: TimeUnit): boolean {
  return (
    unit.raw.value instanceof Date &&
    unit.timespan.value.start instanceof Date &&
    unit.timespan.value.end instanceof Date &&
    typeof unit.number.value === "number" &&
    typeof unit.name.value === "string" &&
    typeof unit.isNow.value === "boolean"
  );
}
```

### Interface Testing

```typescript
// Test that any time unit follows the interface contract
function testTimeUnitInterface(unit: TimeUnit) {
  // Test navigation
  const originalDate = unit.raw.value;
  unit.future();
  expect(unit.raw.value).not.toEqual(originalDate);
  unit.past();
  expect(unit.raw.value).toEqual(originalDate);

  // Test properties exist
  expect(unit.number.value).toBeGreaterThan(0);
  expect(unit.name.value).toBeTruthy();
  expect(typeof unit.isNow.value).toBe("boolean");
}
```

The **TimeUnit interface** is the secret sauce that makes useTemporal's hierarchical architecture work seamlessly. By ensuring every time unit follows the same contract, you get **infinite flexibility** with **zero complexity**.

This consistent interface transforms time manipulation from a chaotic collection of different APIs into a **beautiful, predictable system** where every time scale works exactly the same way! 🚀
