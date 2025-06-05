# Time Navigation Patterns

**Single Responsibility:** Hierarchical time browsing with intuitive navigation patterns.

## Overview

This example demonstrates how to build consistent, intuitive navigation across different time scales using useTemporal's unified time unit interface.

## Basic Navigation

### Simple Previous/Next

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
</script>

<template>
  <div class="time-navigator">
    <button @click="month.past()" :disabled="!month.hasPast">← Previous</button>

    <span class="current-time">{{ month.name }}</span>

    <button @click="month.future()" :disabled="!month.hasFuture">Next →</button>
  </div>
</template>
```

## Multi-Level Breadcrumbs

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

const breadcrumbs = computed(() => [
  { unit: year, label: "Year" },
  { unit: month, label: "Month" },
  { unit: day, label: "Day" },
]);

const navigateToScale = (targetUnit) => {
  // All other units automatically sync
  pickle.browsing.value = targetUnit.raw.value;
};
</script>

<template>
  <nav class="breadcrumb">
    <span
      v-for="(crumb, index) in breadcrumbs"
      :key="crumb.label"
      class="breadcrumb-item"
    >
      <button
        @click="navigateToScale(crumb.unit)"
        :class="{ active: crumb.unit.isNow }"
      >
        {{ crumb.unit.name }}
      </button>
      <span v-if="index < breadcrumbs.length - 1" class="separator"> / </span>
    </span>
  </nav>
</template>
```

## Scale Switching

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

const scales = ["year", "month", "week", "day"];
const currentScale = ref("month");

const currentUnit = computed(() => {
  const unitFactories = {
    year: () => useYear(pickle),
    month: () => useMonth(pickle),
    week: () => useWeek(pickle),
    day: () => useDay(pickle),
  };

  return unitFactories[currentScale.value]();
});

const switchScale = (newScale) => {
  currentScale.value = newScale;
};
</script>

<template>
  <div class="scale-switcher">
    <!-- Scale selector -->
    <div class="scale-tabs">
      <button
        v-for="scale in scales"
        :key="scale"
        @click="switchScale(scale)"
        :class="{ active: currentScale === scale }"
      >
        {{ scale.charAt(0).toUpperCase() + scale.slice(1) }}
      </button>
    </div>

    <!-- Current time unit display -->
    <div class="current-unit">
      <button @click="currentUnit.past()">‹</button>
      <h2>{{ currentUnit.name }}</h2>
      <button @click="currentUnit.future()">›</button>
    </div>
  </div>
</template>
```

## Keyboard Navigation

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";
import { onMounted, onUnmounted } from "vue";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

const handleKeyPress = (event) => {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      month.past();
      break;
    case "ArrowRight":
      event.preventDefault();
      month.future();
      break;
    case "Home":
      event.preventDefault();
      pickle.browsing.value = new Date(); // Go to current month
      break;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
  <div class="keyboard-nav" tabindex="0">
    <p>Use arrow keys to navigate, Home to go to current month</p>
    <h2>{{ month.name }}</h2>
    <p class="hint">← Previous | Current | Next →</p>
  </div>
</template>
```

## Time Unit Synchronization

```vue
<script setup>
import { usePickle, useYear, useMonth, useWeek, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// All units automatically stay in sync
const year = useYear(pickle);
const month = useMonth(pickle);
const week = useWeek(pickle);
const day = useDay(pickle);

// Navigate any unit - others follow automatically
const jumpToNextYear = () => year.future();
const jumpToNextMonth = () => month.future();
const jumpToNextWeek = () => week.future();
const jumpToNextDay = () => day.future();
</script>

<template>
  <div class="sync-demo">
    <h3>All Units Synchronized</h3>

    <div class="unit-row">
      <button @click="jumpToNextYear">Year +</button>
      <span>{{ year.name }}</span>
    </div>

    <div class="unit-row">
      <button @click="jumpToNextMonth">Month +</button>
      <span>{{ month.name }}</span>
    </div>

    <div class="unit-row">
      <button @click="jumpToNextWeek">Week +</button>
      <span>{{ week.name }}</span>
    </div>

    <div class="unit-row">
      <button @click="jumpToNextDay">Day +</button>
      <span>{{ day.name }}</span>
    </div>

    <p class="note">
      Notice how changing any unit automatically updates all others!
    </p>
  </div>
</template>
```

## Key Features

- **Consistent Interface**: Same navigation methods across all time scales
- **Automatic Synchronization**: All time units stay in sync automatically
- **Keyboard Support**: Arrow keys, Home, and custom shortcuts
- **Breadcrumb Navigation**: Multi-level hierarchy navigation
- **Scale Transitions**: Smooth switching between time granularities
- **Boundary Awareness**: Handles past/future limits gracefully

## Best Practices

- Use the same `pickle` instance for related time navigation
- Leverage automatic synchronization instead of manual state management
- Implement keyboard shortcuts for better UX
- Provide visual feedback for current/active states
- Handle navigation boundaries (past/future limits) appropriately

<style scoped>
.time-navigator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
}

.breadcrumb-item button {
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.breadcrumb-item button.active {
  color: var(--vp-c-brand);
  font-weight: 600;
}

.scale-switcher {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.scale-tabs {
  display: flex;
  background: var(--vp-c-bg-soft);
}

.scale-tabs button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.scale-tabs button.active {
  background: var(--vp-c-brand);
  color: white;
}

.current-unit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.sync-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.unit-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.unit-row button {
  min-width: 80px;
}

.note {
  font-style: italic;
  color: var(--vp-c-text-2);
  margin-top: 1rem;
}
</style>
