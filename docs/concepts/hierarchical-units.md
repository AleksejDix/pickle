# Hierarchical Time Units

The **hierarchical time units** architecture is what makes useTemporal fundamentally different from traditional date libraries. Instead of treating time as a flat structure, useTemporal models time as a **hierarchical tree** where each level can be independently navigated and manipulated.

## The Traditional Problem

Most date libraries treat time units as isolated functions:

```javascript
// Traditional approach - isolated functions
const year = getYear(date);
const month = getMonth(date);
const day = getDay(date);

// No relationship between these units
// Each function is independent
// No consistent interface
```

## The useTemporal Solution

useTemporal creates a **hierarchy of time composables** where each unit knows its place in the time continuum:

```typescript
// Hierarchical approach - connected composables
const pickle = usePickle({ date: new Date(), now: new Date() });

// Each unit is a full composable with consistent interface
const millennium = useMillennium(pickle); // 1000 years
const century = useCentury(pickle); // 100 years
const decade = useDecade(pickle); // 10 years
const year = useYear(pickle); // 1 year
const month = useMonth(pickle); // 1 month
const week = useWeek(pickle); // 1 week
const day = useDay(pickle); // 1 day
const hour = useHour(pickle); // 1 hour
const minute = useMinute(pickle); // 1 minute
```

## Hierarchy Visualization

```
Millennium (1000 years)
├── Century (100 years)
│   ├── Decade (10 years)
│   │   ├── Year (12 months)
│   │   │   ├── Quarter (3 months)
│   │   │   ├── Month (~30 days)
│   │   │   │   ├── Week (7 days)
│   │   │   │   │   ├── Day (24 hours)
│   │   │   │   │   │   ├── Hour (60 minutes)
│   │   │   │   │   │   │   └── Minute (60 seconds)
```

## Consistent Interface

Every time unit in the hierarchy implements the same `TimeUnit` interface:

```typescript
interface TimeUnit {
  // Core properties
  raw: ComputedRef<Date>; // The actual date
  timespan: ComputedRef<TimeSpan>; // Start and end dates
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

## Hierarchical Navigation

Navigate naturally between scales:

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date(), now: new Date() });

// All connected to the same timeline
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
</script>

<template>
  <div class="time-hierarchy">
    <!-- Year level navigation -->
    <div class="year-nav">
      <button @click="year.past()">‹ Previous Year</button>
      <h1>{{ year.name }}</h1>
      <button @click="year.future()">Next Year ›</button>
    </div>

    <!-- Month level navigation -->
    <div class="month-nav">
      <button @click="month.past()">‹ Previous Month</button>
      <h2>{{ month.name }}</h2>
      <button @click="month.future()">Next Month ›</button>
    </div>

    <!-- Day level navigation -->
    <div class="day-nav">
      <button @click="day.past()">‹ Previous Day</button>
      <h3>{{ day.name }}</h3>
      <button @click="day.future()">Next Day ›</button>
    </div>
  </div>
</template>
```

## Cross-Scale Relationships

Time units maintain relationships across scales:

```typescript
// When you change a higher unit, lower units update automatically
year.future(); // Move to next year
// month, day, hour all automatically update to match

// Lower units respect their parent boundaries
month.future(); // Move to next month within the current year
// If at December, automatically rolls to January of next year
```

## Real-World Benefits

### 🎯 **Consistent Mental Model**

Every time unit behaves the same way, making the API predictable and learnable.

### 🔄 **Automatic Synchronization**

When one unit changes, all related units update automatically.

### 📐 **Mathematical Precision**

Each unit knows its exact boundaries and relationships.

### 🏗️ **Architectural Flexibility**

Build complex time interfaces by combining simple, consistent units.

## Practical Example: Multi-Level Calendar

```vue
<script setup>
import { ref } from "vue";
import { usePickle, useYear, useMonth, useWeek, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date(), now: new Date() });
const activeLevel = ref("month"); // 'year' | 'month' | 'week' | 'day'

// All units stay synchronized automatically
const year = useYear(pickle);
const month = useMonth(pickle);
const week = useWeek(pickle);
const day = useDay(pickle);

// Get the appropriate time units for current level
const getUnits = () => {
  switch (activeLevel.value) {
    case "year":
      return pickle.divide(year, "month");
    case "month":
      return pickle.divide(month, "day");
    case "week":
      return pickle.divide(week, "day");
    case "day":
      return pickle.divide(day, "hour");
  }
};
</script>

<template>
  <div class="multi-level-calendar">
    <!-- Level selector -->
    <div class="level-selector">
      <button
        v-for="level in ['year', 'month', 'week', 'day']"
        :key="level"
        @click="activeLevel = level"
        :class="{ active: activeLevel === level }"
      >
        {{ level }}
      </button>
    </div>

    <!-- Breadcrumb navigation -->
    <div class="breadcrumb">
      <span>{{ year.name }}</span>
      <span v-if="activeLevel !== 'year'"> › {{ month.name }}</span>
      <span v-if="activeLevel === 'week'"> › Week {{ week.number }}</span>
      <span v-if="activeLevel === 'day'"> › {{ day.name }}</span>
    </div>

    <!-- Dynamic time grid -->
    <div class="time-grid">
      <div
        v-for="unit in getUnits()"
        :key="unit.raw.getTime()"
        :class="{ current: unit.isNow }"
        class="time-unit"
      >
        {{ unit.name }}
      </div>
    </div>
  </div>
</template>
```

## Advanced Patterns

### Conditional Hierarchies

```typescript
// Different hierarchies for different use cases
const businessHierarchy = computed(() => {
  if (isBusinessContext.value) {
    return {
      quarter: useYearQuarter(pickle),
      month: useMonth(pickle),
      workweek: useWeek(pickle), // Monday-Friday only
      businessDay: useDay(pickle), // Filtered for business hours
    };
  }
  return standardHierarchy.value;
});
```

### Cross-Hierarchy Communication

```typescript
// Units can communicate across hierarchies
watch(fiscalYear.raw, (newFiscalYear) => {
  // Update calendar year to match fiscal year
  calendarYear.browsing.value = newFiscalYear;
});
```

### Dynamic Hierarchy Creation

```typescript
// Create hierarchies programmatically
const createCustomHierarchy = (levels: TimeUnitType[]) => {
  return levels.reduce((hierarchy, level) => {
    hierarchy[level] = timeUnitFactories[level](pickle);
    return hierarchy;
  }, {});
};

const projectHierarchy = createCustomHierarchy([
  "year",
  "quarter",
  "month",
  "week",
]);
```

## Performance Optimization

The hierarchical approach is **performance-optimized**:

- ✅ **Lazy Evaluation** - Units created only when needed
- ✅ **Shared State** - All units share the same pickle core
- ✅ **Reactive Updates** - Changes propagate efficiently
- ✅ **Memory Efficient** - Minimal memory footprint per unit

```typescript
// This doesn't create all 1000 years immediately
const millennium = useMillennium(pickle);

// Years created on-demand when accessing divisions
const years = pickle.divide(millennium, "year"); // Lazy array
const firstYear = years[0]; // Creates year 0 only
const year500 = years[500]; // Creates year 500 only
```

The hierarchical time units architecture transforms time from a **flat structure** into a **navigable, explorable tree**. This is the foundation that enables the revolutionary `divide()` pattern and makes useTemporal uniquely powerful.

Each level of the hierarchy is a **complete, consistent composable** that can be used independently or combined with others to create sophisticated time-based interfaces. 🚀
