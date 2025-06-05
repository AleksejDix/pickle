# Reactive Time Management

useTemporal's reactive time management system ensures that all time units automatically stay synchronized and update when the underlying date changes. This page explains how reactivity works in the time hierarchy.

## Vue 3 Reactivity Integration

useTemporal is built on Vue 3's reactivity system, making all time units reactive by default.

### Automatic Updates

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// All units are reactive and stay in sync
console.log(year.name); // "2024"
console.log(month.name); // "January 2024"
console.log(day.name); // "Monday, January 15, 2024"

// Change the date - everything updates automatically
pickle.jumpTo(new Date("2024-06-15"));

console.log(year.name); // "2024" (same year)
console.log(month.name); // "June 2024" (updated!)
console.log(day.name); // "Saturday, June 15, 2024" (updated!)
</script>
```

### Computed Properties

All time unit properties are Vue computed properties, ensuring efficient updates:

```typescript
// These are all computed properties that update automatically
const month = useMonth(pickle);
month.name; // ComputedRef<string>
month.number; // ComputedRef<number>
month.isNow; // ComputedRef<boolean>
month.timespan; // ComputedRef<Timespan>
```

## Shared State Synchronization

Multiple time units sharing the same pickle automatically synchronize:

```vue
<script setup>
import { usePickle, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Create multiple time units from the same pickle
const month1 = useMonth(pickle);
const month2 = useMonth(pickle); // Same pickle = same state
const day = useDay(pickle);

// Navigate the month
month1.future(); // Go to next month

// All units update automatically
console.log(month1.name); // "February 2024"
console.log(month2.name); // "February 2024" (same!)
console.log(day.name); // "Thursday, February 1, 2024" (updated!)
</script>
```

## Template Reactivity

Time units work seamlessly in Vue templates:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = computed(() => pickle.divide(month, "day"));
</script>

<template>
  <div>
    <!-- Updates automatically when month changes -->
    <h1>{{ month.name }}</h1>

    <!-- Days array updates when month changes -->
    <div v-for="day in days" :key="day.raw.value.getTime()">
      {{ day.number }}
    </div>

    <!-- Navigation triggers reactive updates -->
    <button @click="month.past()">Previous Month</button>
    <button @click="month.future()">Next Month</button>
  </div>
</template>
```

## Watchers and Side Effects

Use Vue's watchers to react to time changes:

```vue
<script setup>
import { watch } from "vue";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Watch for month changes
watch(
  () => month.raw.value,
  (newDate, oldDate) => {
    console.log(`Month changed from ${oldDate} to ${newDate}`);

    // Perform side effects
    fetchMonthlyData(newDate);
    updateURL(newDate);
  }
);

// Watch for specific properties
watch(
  () => month.isNow,
  (isCurrentMonth) => {
    if (isCurrentMonth) {
      console.log("Viewing current month!");
    }
  }
);
</script>
```

## Performance Optimization

### Computed Caching

Computed properties cache results until dependencies change:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// This expensive computation is cached
const monthStatistics = computed(() => {
  const days = pickle.divide(month, "day");

  return {
    totalDays: days.length,
    weekdays: days.filter((d) => ![0, 6].includes(d.raw.value.getDay())).length,
    weekends: days.filter((d) => [0, 6].includes(d.raw.value.getDay())).length,
  };
});

// Only recalculates when month changes, not on every render
</script>
```

### Selective Reactivity

Only create reactive units you actually need:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });

// Only create what you use
const showYear = ref(false);
const showMonth = ref(true);

// Conditional reactivity
const year = computed(() => (showYear.value ? useYear(pickle) : null));
const month = computed(() => (showMonth.value ? useMonth(pickle) : null));
</script>
```

## Advanced Reactive Patterns

### Multi-Pickle Coordination

Coordinate multiple independent time contexts:

```vue
<script setup>
const startPickle = usePickle({ date: new Date("2024-01-01") });
const endPickle = usePickle({ date: new Date("2024-12-31") });

const startMonth = useMonth(startPickle);
const endMonth = useMonth(endPickle);

// Ensure end is always after start
watch(
  () => startPickle.date.value,
  (startDate) => {
    if (startDate >= endPickle.date.value) {
      endPickle.jumpTo(new Date(startDate.getTime() + 24 * 60 * 60 * 1000));
    }
  }
);
</script>
```

### Reactive Validation

Create reactive validation based on time state:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const selectedDay = useDay(pickle);

// Reactive validation
const isValidWorkday = computed(() => {
  const dayOfWeek = selectedDay.raw.value.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
});

const isBusinessHours = computed(() => {
  const hour = selectedDay.raw.value.getHours();
  return hour >= 9 && hour <= 17;
});

const canBookAppointment = computed(() => {
  return (
    isValidWorkday.value &&
    isBusinessHours.value &&
    selectedDay.raw.value > new Date()
  );
});
</script>

<template>
  <div>
    <p>Selected: {{ selectedDay.name }}</p>
    <p v-if="!isValidWorkday">⚠️ Not a business day</p>
    <p v-if="!isBusinessHours">⚠️ Outside business hours</p>
    <button :disabled="!canBookAppointment">Book Appointment</button>
  </div>
</template>
```

## Reactive Time Ranges

Create reactive date ranges:

```vue
<script setup>
const startPickle = usePickle({ date: new Date() });
const endPickle = usePickle({ date: new Date() });

const startDay = useDay(startPickle);
const endDay = useDay(endPickle);

// Reactive range calculation
const daysBetween = computed(() => {
  const start = startDay.raw.value;
  const end = endDay.raw.value;
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const isValidRange = computed(() => {
  return endDay.raw.value >= startDay.raw.value;
});
</script>
```

## Best Practices

### 1. Use Computed for Expensive Operations

```typescript
// ✅ Good - cached until dependencies change
const expensiveCalculation = computed(() => {
  const days = pickle.divide(month, "day");
  return days.map((day) => calculateComplexStats(day));
});

// ❌ Avoid - recalculates on every access
const expensiveCalculation = () => {
  const days = pickle.divide(month, "day");
  return days.map((day) => calculateComplexStats(day));
};
```

### 2. Minimize Reactive Dependencies

```typescript
// ✅ Good - only depends on what's needed
const monthName = computed(() => month.name);

// ❌ Avoid - unnecessary dependency
const monthName = computed(() => {
  const allData = { month, day, hour }; // Depends on unused data
  return allData.month.name;
});
```

### 3. Use Watchers for Side Effects

```typescript
// ✅ Good - side effects in watchers
watch(
  () => month.raw.value,
  (date) => {
    updateURL(date);
    trackAnalytics("month_changed", date);
  }
);

// ❌ Avoid - side effects in computed
const monthWithSideEffects = computed(() => {
  updateURL(month.raw.value); // Side effect!
  return month.name;
});
```

## Related Concepts

- **[Hierarchical Time Units](/concepts/hierarchical-units)** - The structure that enables reactivity
- **[Time Unit Interface](/concepts/time-unit-interface)** - Consistent reactive properties
- **[Performance Considerations](/concepts/performance)** - Optimizing reactive time applications
