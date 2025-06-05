# Multi-Scale Calendar

Experience the revolutionary power of useTemporal's multi-scale time navigation. Zoom seamlessly between years, months, days, and hours with unified interactions.

## Interactive Demo

Try the multi-scale calendar below. Click the scale buttons to zoom between time levels:

<MultiScaleCalendar />

## Revolutionary Features

### 1. **Seamless Scale Switching**

Click between Year, Month, Day, and Hour views to see how the same interface works across all time scales.

### 2. **Unified Navigation**

The same "Previous" and "Next" buttons work identically whether you're navigating years, months, days, or hours.

### 3. **Interactive Zoom**

Click any subdivision to zoom into that time period and automatically switch to the next scale.

### 4. **Automatic Subdivision**

Watch how `pickle.divide()` automatically creates the correct subdivisions for each scale:

- **Year → Months**: 12 months
- **Month → Days**: 28-31 days
- **Day → Hours**: 24 hours

## How It Works

### The Core Concept

```typescript
const pickle = usePickle({ date: new Date() });
const scales = ["year", "month", "day", "hour"];
const currentScale = ref("month");

// Get the current unit based on selected scale
const currentUnit = computed(() => {
  switch (currentScale.value) {
    case "year":
      return useYear(pickle);
    case "month":
      return useMonth(pickle);
    case "day":
      return useDay(pickle);
    case "hour":
      return useHour(pickle);
  }
});
```

### The Revolutionary divide() Pattern

```typescript
// Automatically get subdivisions for any scale
const subdivisions = computed(() => {
  const next = getNextScale(currentScale.value);
  return pickle.divide(currentUnit.value, next);
});

// Examples:
// pickle.divide(year, 'month')  → 12 months
// pickle.divide(month, 'day')   → 28-31 days
// pickle.divide(day, 'hour')    → 24 hours
```

### Unified Navigation

```typescript
// Every time unit has identical interface
currentUnit.value.past(); // Previous year/month/day/hour
currentUnit.value.future(); // Next year/month/day/hour

// Same properties across all scales
currentUnit.value.name; // "2024", "January 2024", "Monday, Jan 15", "2:00 PM"
currentUnit.value.number; // 2024, 1, 15, 14
currentUnit.value.isNow; // true if current time unit
```

### Zoom Navigation

```typescript
const zoomIn = (subdivision) => {
  // Navigate to the subdivision's date
  pickle.picked.value = subdivision.raw.value;

  // Move to next scale
  const scales = ["year", "month", "day", "hour"];
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex < scales.length - 1) {
    currentScale.value = scales[currentIndex + 1];
  }
};
```

## Complete Implementation

```vue
<template>
  <div class="multi-scale-calendar">
    <!-- Scale Selector -->
    <div class="scale-selector">
      <button
        v-for="scale in scales"
        :key="scale"
        @click="currentScale = scale"
        :class="{ active: currentScale === scale }"
      >
        {{ scale.charAt(0).toUpperCase() + scale.slice(1) }}
      </button>
    </div>

    <!-- Current Unit Display -->
    <div class="current-unit">
      <h3>{{ currentUnit.name.value }}</h3>
      <p>{{ currentScale }} view</p>
    </div>

    <!-- Navigation -->
    <div class="navigation">
      <button @click="currentUnit.past()">← Previous</button>
      <button @click="goToNow">Go to Now</button>
      <button @click="currentUnit.future()">Next →</button>
    </div>

    <!-- Subdivisions Grid -->
    <div class="subdivisions-grid" :class="getGridClasses()">
      <div
        v-for="subdivision in subdivisions"
        :key="subdivision.number.value"
        @click="zoomIn(subdivision)"
        class="subdivision"
        :class="{ current: subdivision.isNow.value }"
      >
        <div class="label">{{ getSubdivisionLabel(subdivision) }}</div>
        <div class="status">{{ subdivision.isNow.value ? "Current" : "" }}</div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="info-panel">
      <div>Scale: {{ currentScale }}</div>
      <div>Subdivisions: {{ subdivisions.length }} {{ nextScale }}s</div>
      <div>Current: {{ currentUnit.isNow.value ? "Yes" : "No" }}</div>
      <div>Number: {{ currentUnit.number.value }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePickle, useYear, useMonth, useDay, useHour } from "usetemporal";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const scales = ["year", "month", "day", "hour"];
const currentScale = ref("month");

const scaleToNextScale = {
  year: "month",
  month: "day",
  day: "hour",
  hour: "minute",
};

const nextScale = computed(() => scaleToNextScale[currentScale.value]);

const currentUnit = computed(() => {
  switch (currentScale.value) {
    case "year":
      return useYear(pickle);
    case "month":
      return useMonth(pickle);
    case "day":
      return useDay(pickle);
    case "hour":
      return useHour(pickle);
  }
});

const subdivisions = computed(() => {
  const next = nextScale.value;
  if (next === "minute") return [];
  return pickle.divide(currentUnit.value, next);
});

const getGridClasses = () => {
  switch (currentScale.value) {
    case "year":
      return "grid-months";
    case "month":
      return "grid-days";
    case "day":
      return "grid-hours";
    default:
      return "grid-default";
  }
};

const getSubdivisionLabel = (subdivision) => {
  switch (currentScale.value) {
    case "year":
      return subdivision.name.value.split(" ")[0]; // "January"
    case "month":
      return subdivision.number.value.toString(); // "15"
    case "day":
      const hour = subdivision.number.value;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${ampm}`;
    default:
      return subdivision.name.value;
  }
};

const zoomIn = (subdivision) => {
  pickle.picked.value = subdivision.raw.value;
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex < scales.length - 1) {
    currentScale.value = scales[currentIndex + 1];
  }
};

const goToNow = () => {
  pickle.picked.value = new Date();
};
</script>
```

## Grid Layouts by Scale

### Year View → Months

```css
.grid-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (min-width: 768px) {
  .grid-months {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Month View → Days

```css
.grid-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
```

### Day View → Hours

```css
.grid-hours {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

@media (min-width: 768px) {
  .grid-hours {
    grid-template-columns: repeat(8, 1fr);
  }
}
```

## Key Innovations

### 1. **Fractal Time Architecture**

Every time scale works identically - learn the pattern once, use it everywhere.

### 2. **Automatic Grid Adaptation**

The UI automatically adjusts grid layouts based on the current scale and subdivision count.

### 3. **Contextual Labels**

Labels adapt to the scale:

- **Year scale**: "January", "February"
- **Month scale**: "1", "2", "3" (day numbers)
- **Day scale**: "2PM", "3PM" (hours)

### 4. **Intelligent Current Detection**

The `isNow` property automatically highlights the current time period at any scale.

## Use Cases

### 1. **Event Planning**

- **Year view**: Plan annual events
- **Month view**: Schedule monthly activities
- **Day view**: Plan daily schedule
- **Hour view**: Set appointment times

### 2. **Data Visualization**

- **Year view**: Annual trends
- **Month view**: Monthly patterns
- **Day view**: Daily analytics
- **Hour view**: Hourly metrics

### 3. **Content Management**

- **Year view**: Content archives by year
- **Month view**: Monthly content planning
- **Day view**: Daily publishing schedule
- **Hour view**: Time-sensitive content

## Performance Benefits

### Minimal Re-renders

Only the affected scale re-renders when switching views.

### Efficient Subdivision Calculation

The `divide()` pattern efficiently calculates only needed subdivisions.

### Reactive Updates

Vue's reactivity ensures UI updates only when underlying data changes.

## Next Steps

- **[Time Navigation](/examples/time-navigation)** - Advanced navigation patterns
- **[Component Patterns](/examples/component-patterns)** - Reusable multi-scale components
- **[Performance Patterns](/examples/performance-patterns)** - Optimizing large-scale calendars

<script setup>
import MultiScaleCalendar from '../.vitepress/components/MultiScaleCalendar.vue'
</script>
