# usePickle (Core)

The **`usePickle`** composable is the foundational building block of useTemporal. It provides the revolutionary `divide()` pattern and serves as the central coordination point for all time units.

## Overview

```typescript
function usePickle(options: UsePickleOptions): PickleCore;
```

**usePickle** creates a reactive time manipulation core that:

- 🎯 Provides the innovative `divide()` pattern
- 🔄 Coordinates all time units reactively
- 🌍 Handles internationalization and formatting
- 📐 Maintains consistent time unit relationships

## Basic Usage

```vue
<script setup lang="ts">
import { usePickle } from "usetemporal";

// Create the core pickle instance
const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});
</script>
```

## Parameters

### UsePickleOptions

```typescript
interface UsePickleOptions {
  date: Date | Ref<Date>; // Working date
  now?: Date | Ref<Date>; // Reference "now" date
  locale?: string | Ref<string>; // Locale for formatting
}
```

#### `date` (required)

The primary date you're working with. Can be reactive.

```typescript
import { ref } from "vue";

// Static date
const pickle = usePickle({ date: new Date() });

// Reactive date
const currentDate = ref(new Date());
const pickle = usePickle({ date: currentDate });
```

#### `now` (optional)

Reference date for "current" calculations. Defaults to `new Date()`.

```typescript
// Custom "now" for testing or simulation
const pickle = usePickle({
  date: new Date("2024-06-15"),
  now: new Date("2024-06-15"), // This date is considered "now"
});
```

#### `locale` (optional)

Locale string for internationalized formatting. Defaults to `'en'`.

```typescript
// Different locales
const pickle = usePickle({
  date: new Date(),
  locale: "es-ES", // Spanish formatting
});
```

## Return Value

### PickleCore

```typescript
interface PickleCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  divide: (interval: TimeUnit, unit: TimeUnitType) => TimeUnit[];
  f: (date: Date, options: Intl.DateTimeFormatOptions) => string;
}
```

#### `browsing`

Current date being browsed/viewed. Changes as you navigate.

```typescript
const pickle = usePickle({ date: new Date() });

// Navigate browsing date
pickle.browsing.value = new Date("2025-01-01");
```

#### `picked`

Selected/picked date. Usually set by user interaction.

```typescript
// Set picked date
pickle.picked.value = new Date("2024-12-25");
```

#### `now`

Reference "now" date for calculations.

```typescript
// Check if browsing date is "now"
const isCurrentlyBrowsingNow = computed(() =>
  isSameDay(pickle.browsing.value, pickle.now.value)
);
```

#### `divide()` - The Revolutionary Function

Subdivides any time unit into smaller units.

```typescript
// Divide a year into months
const months = pickle.divide(year, "month");

// Divide a month into days
const days = pickle.divide(month, "day");

// Divide a day into hours
const hours = pickle.divide(day, "hour");
```

#### `f()` - Internationalized Formatter

Formats dates according to the pickle's locale.

```typescript
// Format with current locale
const formatted = pickle.f(new Date(), {
  dateStyle: "medium",
  timeStyle: "short",
});
```

## The divide() Function

The heart of useTemporal's innovation:

```typescript
divide(interval: TimeUnit, unit: TimeUnitType): TimeUnit[]
```

### Supported Divisions

| Parent Unit | Can Divide Into               |
| ----------- | ----------------------------- |
| millennium  | century, decade, year         |
| century     | decade, year                  |
| decade      | year                          |
| year        | yearQuarter, month, week, day |
| month       | week, day                     |
| week        | day                           |
| day         | hour                          |
| hour        | hourQuarter, minute           |

### Examples

```vue
<script setup>
import { usePickle, useYear, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);

// Revolutionary divide pattern
const months = pickle.divide(year, "month"); // 12 months
const days = pickle.divide(month, "day"); // ~30 days
const weeks = pickle.divide(month, "week"); // ~4 weeks
const yearDays = pickle.divide(year, "day"); // 365 days
</script>

<template>
  <div>
    <!-- Show months in current year -->
    <div v-for="m in months" :key="m.raw">{{ m.name }} ({{ m.number }})</div>

    <!-- Show days in current month -->
    <div v-for="d in days" :key="d.raw">Day {{ d.number }}</div>
  </div>
</template>
```

## Reactive Patterns

### Synchronized Navigation

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// All units automatically sync
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// When one changes, others follow
const navigate = () => {
  year.future(); // Move to next year
  // month and day automatically update to stay in sync
};
</script>
```

### Cross-Component Communication

```vue
<script setup>
import { provide } from "vue";
import { usePickle } from "usetemporal";

// Provide pickle to child components
const pickle = usePickle({ date: new Date() });
provide("pickle", pickle);
</script>

<!-- Child components can inject and use the same pickle -->
<template>
  <YearNavigator />
  <MonthCalendar />
  <DatePicker />
</template>
```

## Advanced Usage

### Dynamic Locale Switching

```vue
<script setup>
import { ref } from "vue";
import { usePickle } from "usetemporal";

const locale = ref("en-US");
const pickle = usePickle({
  date: new Date(),
  locale,
});

// Change locale dynamically
const switchLocale = (newLocale) => {
  locale.value = newLocale;
  // All formatting automatically updates
};
</script>

<template>
  <div>
    <button @click="switchLocale('en-US')">English</button>
    <button @click="switchLocale('es-ES')">Español</button>
    <button @click="switchLocale('fr-FR')">Français</button>

    <!-- Automatically formatted based on current locale -->
    <p>{{ pickle.f(new Date(), { dateStyle: "full" }) }}</p>
  </div>
</template>
```

### Time Travel Simulation

```vue
<script setup>
import { ref } from "vue";
import { usePickle } from "usetemporal";

const simulatedNow = ref(new Date());
const pickle = usePickle({
  date: new Date(),
  now: simulatedNow,
});

// Simulate different "now" times
const timeTravel = (date) => {
  simulatedNow.value = date;
  // All "isNow" calculations update immediately
};
</script>
```

### Multi-Pickle Coordination

```vue
<script setup>
import { usePickle } from "usetemporal";

// Different time contexts
const userPickle = usePickle({
  date: new Date(),
  locale: "en-US",
});

const businessPickle = usePickle({
  date: new Date(),
  locale: "en-GB",
});

// Coordinate between pickles
watch(userPickle.picked, (date) => {
  businessPickle.browsing.value = date;
});
</script>
```

## Performance Considerations

### Lazy Division Creation

```typescript
// Divisions are lazy - created only when accessed
const days = pickle.divide(year, "day"); // Doesn't create 365 objects yet

// Objects created on demand
const firstDay = days[0]; // Creates day 0
const middleDay = days[182]; // Creates day 182
```

### Reactive Efficiency

```typescript
// Reactive updates are optimized
const months = pickle.divide(year, "month");

// When year changes, only visible months recalculate
year.future(); // Efficient reactive update
```

### Memory Management

```typescript
// Pickle instances are lightweight
const pickle1 = usePickle({ date: new Date() });
const pickle2 = usePickle({ date: new Date() });

// Each pickle maintains minimal state
// Time units share computed logic efficiently
```

## Best Practices

### ✅ Do's

- **Single pickle per time context** - Use one pickle for related time operations
- **Reactive dates** - Use `ref()` for dates that change
- **Consistent locale** - Set locale once at pickle creation
- **Division caching** - Store division results in computed properties

```typescript
// Good: Single pickle, reactive date
const selectedDate = ref(new Date());
const pickle = usePickle({ date: selectedDate });

// Good: Cached divisions
const months = computed(() => pickle.divide(year, "month"));
```

### ❌ Don'ts

- **Multiple pickles for same context** - Creates unnecessary complexity
- **Manual date calculations** - Use pickle's methods instead
- **Frequent locale changes** - Can impact performance
- **Deep division nesting** - Keep reasonable division depth

```typescript
// Avoid: Multiple pickles for same timeline
const pickle1 = usePickle({ date: userDate });
const pickle2 = usePickle({ date: userDate }); // Unnecessary

// Avoid: Manual calculations
const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
// Better: Use time unit navigation
month.future();
```

## Integration with Other Libraries

### Date-fns Integration

```typescript
import { addDays, format } from "date-fns";

const pickle = usePickle({ date: new Date() });

// Combine pickle with date-fns when needed
const futureDate = addDays(pickle.browsing.value, 7);
const formatted = format(futureDate, "yyyy-MM-dd");
```

### Vue Router Integration

```typescript
import { watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const pickle = usePickle({ date: new Date() });

// Sync pickle with URL
watch(pickle.browsing, (date) => {
  router.push(`/calendar/${format(date, "yyyy-MM-dd")}`);
});
```

**usePickle** is the foundation that makes all useTemporal magic possible. It transforms traditional date manipulation into a reactive, hierarchical, infinitely flexible system. Master this composable, and you'll unlock the full power of temporal thinking! 🚀
