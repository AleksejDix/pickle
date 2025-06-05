# TimeUnit Interface

The `TimeUnit` interface is the foundational contract that all time units in useTemporal implement. It provides a consistent API across all time scales, from millennia down to minutes.

## Interface Definition

```typescript
interface TimeUnit {
  // Core reactive properties
  raw: Ref<Date>;
  name: ComputedRef<string>;
  number: ComputedRef<number>;
  isNow: ComputedRef<boolean>;
  timespan: ComputedRef<Timespan>;

  // Navigation methods
  past(): void;
  future(): void;
}
```

## Properties

### `raw: Ref<Date>`

The underlying reactive date that represents this time unit.

```typescript
const month = useMonth(pickle);
console.log(month.raw.value); // Date object for the month
```

### `name: ComputedRef<string>`

A human-readable name for the time unit.

```typescript
const year = useYear(pickle);
console.log(year.name); // "2024"

const month = useMonth(pickle);
console.log(month.name); // "January 2024"

const day = useDay(pickle);
console.log(day.name); // "Monday, January 15, 2024"
```

### `number: ComputedRef<number>`

A numeric representation of the time unit.

```typescript
const year = useYear(pickle);
console.log(year.number); // 2024

const month = useMonth(pickle);
console.log(month.number); // 1 (January)

const day = useDay(pickle);
console.log(day.number); // 15 (day of month)

const hour = useHour(pickle);
console.log(hour.number); // 14 (2 PM in 24-hour format)
```

### `isNow: ComputedRef<boolean>`

Whether this time unit contains the current moment.

```typescript
const month = useMonth(pickle);
console.log(month.isNow); // true if current month

const day = useDay(pickle);
console.log(day.isNow); // true if today
```

### `timespan: ComputedRef<Timespan>`

The complete time range that this unit represents.

```typescript
const month = useMonth(pickle);
console.log(month.timespan.start); // First moment of the month
console.log(month.timespan.end); // First moment of next month
console.log(month.timespan.duration); // Duration in milliseconds
```

## Methods

### `past(): void`

Navigate to the previous time unit of the same scale.

```typescript
const month = useMonth(pickle);
month.past(); // Go to previous month

const year = useYear(pickle);
year.past(); // Go to previous year

const day = useDay(pickle);
day.past(); // Go to yesterday
```

### `future(): void`

Navigate to the next time unit of the same scale.

```typescript
const month = useMonth(pickle);
month.future(); // Go to next month

const hour = useHour(pickle);
hour.future(); // Go to next hour
```

## Implementation Examples

### Generic Time Unit Component

```vue
<script setup lang="ts" generic="T extends TimeUnit">
interface Props {
  timeUnit: T;
  showNavigation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: true,
});
</script>

<template>
  <div class="time-unit">
    <div class="time-unit-header">
      <button v-if="showNavigation" @click="timeUnit.past()" class="nav-button">
        ‹ Previous
      </button>

      <h2 class="time-unit-name">{{ timeUnit.name }}</h2>

      <button
        v-if="showNavigation"
        @click="timeUnit.future()"
        class="nav-button"
      >
        Next ›
      </button>
    </div>

    <div class="time-unit-info">
      <div class="info-item">
        <span class="label">Number:</span>
        <span class="value">{{ timeUnit.number }}</span>
      </div>

      <div class="info-item">
        <span class="label">Is Current:</span>
        <span class="value" :class="{ current: timeUnit.isNow }">
          {{ timeUnit.isNow ? "Yes" : "No" }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">Start:</span>
        <span class="value">{{
          timeUnit.timespan.start.toLocaleDateString()
        }}</span>
      </div>

      <div class="info-item">
        <span class="label">Duration:</span>
        <span class="value">{{
          formatDuration(timeUnit.timespan.duration)
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-unit {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.time-unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.time-unit-name {
  margin: 0;
  color: #333;
}

.nav-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.nav-button:hover {
  background: #f0f0f0;
}

.time-unit-info {
  display: grid;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: bold;
  color: #666;
}

.value.current {
  color: #007acc;
  font-weight: bold;
}
</style>
```

### Time Unit Comparison

```vue
<script setup>
const pickle1 = usePickle({ date: new Date("2024-01-15") });
const pickle2 = usePickle({ date: new Date("2024-06-15") });

const month1 = useMonth(pickle1);
const month2 = useMonth(pickle2);

const compareTimeUnits = (unit1: TimeUnit, unit2: TimeUnit) => {
  return {
    sameType: unit1.constructor === unit2.constructor,
    samePeriod: unit1.raw.value.getTime() === unit2.raw.value.getTime(),
    unit1Earlier: unit1.raw.value < unit2.raw.value,
    timeDifference: Math.abs(
      unit1.raw.value.getTime() - unit2.raw.value.getTime()
    ),
  };
};

const comparison = computed(() => compareTimeUnits(month1, month2));
</script>

<template>
  <div class="time-unit-comparison">
    <h2>Time Unit Comparison</h2>

    <div class="comparison-grid">
      <div class="unit-display">
        <h3>{{ month1.name }}</h3>
        <p>Number: {{ month1.number }}</p>
        <p>Is Now: {{ month1.isNow }}</p>
      </div>

      <div class="comparison-results">
        <div class="result-item">
          <span>Same Type:</span>
          <span>{{ comparison.sameType ? "Yes" : "No" }}</span>
        </div>

        <div class="result-item">
          <span>Same Period:</span>
          <span>{{ comparison.samePeriod ? "Yes" : "No" }}</span>
        </div>

        <div class="result-item">
          <span>Earlier:</span>
          <span
            >{{ month1.name }} is
            {{ comparison.unit1Earlier ? "earlier" : "later" }}</span
          >
        </div>

        <div class="result-item">
          <span>Difference:</span>
          <span
            >{{
              Math.ceil(comparison.timeDifference / (1000 * 60 * 60 * 24))
            }}
            days</span
          >
        </div>
      </div>

      <div class="unit-display">
        <h3>{{ month2.name }}</h3>
        <p>Number: {{ month2.number }}</p>
        <p>Is Now: {{ month2.isNow }}</p>
      </div>
    </div>
  </div>
</template>
```

### Time Unit Validator

```typescript
// Type guard to check if an object implements TimeUnit
function isTimeUnit(obj: any): obj is TimeUnit {
  return (
    obj &&
    typeof obj === "object" &&
    "raw" in obj &&
    "name" in obj &&
    "number" in obj &&
    "isNow" in obj &&
    "timespan" in obj &&
    "past" in obj &&
    "future" in obj &&
    typeof obj.past === "function" &&
    typeof obj.future === "function"
  );
}

// Usage
const month = useMonth(pickle);
if (isTimeUnit(month)) {
  console.log("Valid TimeUnit:", month.name);
}
```

### Time Unit Factory

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

function createTimeUnit(pickle: PickleCore, type: TimeUnitType): TimeUnit {
  switch (type) {
    case "millennium":
      return useMillennium(pickle);
    case "century":
      return useCentury(pickle);
    case "decade":
      return useDecade(pickle);
    case "year":
      return useYear(pickle);
    case "quarter":
      return useQuarter(pickle);
    case "month":
      return useMonth(pickle);
    case "week":
      return useWeek(pickle);
    case "day":
      return useDay(pickle);
    case "hour":
      return useHour(pickle);
    case "minute":
      return useMinute(pickle);
    default:
      throw new Error(`Unknown time unit type: ${type}`);
  }
}

// Usage
const pickle = usePickle({ date: new Date() });
const timeUnit = createTimeUnit(pickle, "month");
console.log(timeUnit.name); // "January 2024"
```

## Usage Patterns

### Reactive Time Display

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const currentUnit = ref < TimeUnit > useMonth(pickle);

const switchToYear = () => {
  currentUnit.value = useYear(pickle);
};

const switchToDay = () => {
  currentUnit.value = useDay(pickle);
};
</script>

<template>
  <div>
    <div class="scale-switcher">
      <button @click="switchToYear">Year View</button>
      <button @click="switchToDay">Day View</button>
    </div>

    <div class="current-unit">
      <h2>{{ currentUnit.name }}</h2>
      <p>{{ currentUnit.isNow ? "Current" : "Not Current" }}</p>
    </div>
  </div>
</template>
```

### Time Unit Chain Navigation

```vue
<script setup>
const pickle = usePickle({ date: new Date() });

// Create a hierarchy of time units
const timeHierarchy = computed(() => [
  useYear(pickle),
  useMonth(pickle),
  useDay(pickle),
  useHour(pickle),
  useMinute(pickle),
]);

const navigateAll = (direction: "past" | "future") => {
  timeHierarchy.value.forEach((unit) => {
    unit[direction]();
  });
};
</script>

<template>
  <div class="time-hierarchy">
    <div class="hierarchy-controls">
      <button @click="navigateAll('past')">‹ Previous All</button>
      <button @click="navigateAll('future')">Next All ›</button>
    </div>

    <div class="hierarchy-display">
      <div
        v-for="unit in timeHierarchy"
        :key="unit.name"
        class="hierarchy-level"
      >
        <span class="unit-name">{{ unit.name }}</span>
        <span class="unit-number">({{ unit.number }})</span>
        <span v-if="unit.isNow" class="current-indicator">●</span>
      </div>
    </div>
  </div>
</template>
```

## Consistency Across Scales

The TimeUnit interface ensures that all time scales behave identically:

```typescript
// These all work the same way regardless of scale
const units = [
  useMillennium(pickle),
  useCentury(pickle),
  useDecade(pickle),
  useYear(pickle),
  useQuarter(pickle),
  useMonth(pickle),
  useWeek(pickle),
  useDay(pickle),
  useHour(pickle),
  useMinute(pickle),
];

units.forEach((unit) => {
  console.log(`${unit.name}: ${unit.number}, Current: ${unit.isNow}`);

  // All support navigation
  unit.past();
  unit.future();

  // All have timespan
  console.log(`Duration: ${unit.timespan.duration}ms`);
});
```

## Related Types

- **[PickleCore](/types/pickle-core)** - Creates and manages TimeUnits
- **[Timespan](/types/timespan)** - Time range used by TimeUnit.timespan

## Related Composables

All time composables implement this interface:

- **[useMillennium](/composables/use-millennium)**
- **[useCentury](/composables/use-century)**
- **[useDecade](/composables/use-decade)**
- **[useYear](/composables/use-year)**
- **[useQuarter](/composables/use-quarter)**
- **[useMonth](/composables/use-month)**
- **[useWeek](/composables/use-week)**
- **[useDay](/composables/use-day)**
- **[useHour](/composables/use-hour)**
- **[useMinute](/composables/use-minute)**
