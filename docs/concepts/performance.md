# Performance Considerations

This page covers performance optimization strategies for useTemporal applications, from basic reactive patterns to advanced caching and virtualization techniques.

## Core Performance Principles

### 1. Minimize Reactive Dependencies

Only create reactive dependencies for data you actually use:

```vue
<script setup>
// ✅ Good - only depends on month name
const monthName = computed(() => month.name);

// ❌ Avoid - unnecessary dependencies
const monthName = computed(() => {
  const { year, month, day, hour } = getAllTimeUnits(); // Too broad!
  return month.name;
});
</script>
```

### 2. Use Computed Properties for Expensive Operations

Cache expensive calculations with computed properties:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// ✅ Good - cached until month changes
const monthStatistics = computed(() => {
  const days = pickle.divide(month, "day");
  return {
    totalDays: days.length,
    weekdays: days.filter((day) => {
      const dayOfWeek = day.raw.value.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }).length,
    weekends: days.filter((day) => {
      const dayOfWeek = day.raw.value.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    }).length,
  };
});

// ❌ Avoid - recalculates on every access
const getMonthStatistics = () => {
  const days = pickle.divide(month, "day");
  // ... expensive calculation every time
};
</script>
```

### 3. Lazy Time Division

Only divide time units when needed:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

const showDays = ref(false);

// ✅ Good - only calculates when needed
const days = computed(() => {
  if (!showDays.value) return [];
  return pickle.divide(month, "day");
});

// ❌ Avoid - always calculates regardless of need
const days = computed(() => pickle.divide(month, "day"));
</script>

<template>
  <div>
    <button @click="showDays = !showDays">
      {{ showDays ? "Hide" : "Show" }} Days
    </button>

    <!-- Only renders when showDays is true -->
    <div v-if="showDays">
      <div v-for="day in days" :key="day.number">
        {{ day.name }}
      </div>
    </div>
  </div>
</template>
```

## Caching Strategies

### Manual Caching

Cache expensive divisions manually:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Cache for month divisions
const monthsCache = new Map();

const months = computed(() => {
  const yearKey = year.raw.value.getFullYear();

  if (!monthsCache.has(yearKey)) {
    monthsCache.set(yearKey, pickle.divide(year, "month"));
  }

  return monthsCache.get(yearKey);
});

// Clear cache when needed
const clearCache = () => {
  monthsCache.clear();
};
</script>
```

### LRU Cache for Time Divisions

Implement a Least Recently Used cache:

```vue
<script setup>
class LRUCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

const pickle = usePickle({ date: new Date() });
const divisionsCache = new LRUCache(20);

const getDaysForMonth = (month) => {
  const cacheKey = `${month.raw.value.getFullYear()}-${month.raw.value.getMonth()}`;

  let days = divisionsCache.get(cacheKey);
  if (!days) {
    days = pickle.divide(month, "day");
    divisionsCache.set(cacheKey, days);
  }

  return days;
};
</script>
```

## Virtual Scrolling

For large time ranges, implement virtual scrolling:

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Virtual scrolling state
const containerRef = ref();
const scrollTop = ref(0);
const containerHeight = ref(400);
const itemHeight = 50;
const visibleCount = computed(() =>
  Math.ceil(containerHeight.value / itemHeight)
);
const bufferCount = 5;

// All items (expensive to render all at once)
const allDays = computed(() => pickle.divide(year, "day"));

// Only render visible items + buffer
const visibleItems = computed(() => {
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop.value / itemHeight) - bufferCount
  );
  const endIndex = Math.min(
    allDays.value.length,
    startIndex + visibleCount.value + bufferCount * 2
  );

  return allDays.value.slice(startIndex, endIndex).map((day, index) => ({
    day,
    index: startIndex + index,
    top: (startIndex + index) * itemHeight,
  }));
});

const totalHeight = computed(() => allDays.value.length * itemHeight);

const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop;
};

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    :style="{ height: containerHeight + 'px', overflow: 'auto' }"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.day.raw.value.getTime()"
        class="virtual-item"
        :style="{
          position: 'absolute',
          top: item.top + 'px',
          height: itemHeight + 'px',
          width: '100%',
        }"
      >
        <div class="day-content">{{ item.day.name }} ({{ item.index }})</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-scroll-container {
  border: 1px solid #ddd;
}

.virtual-item {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid #eee;
}
</style>
```

## Debouncing and Throttling

### Debounced Navigation

Prevent excessive API calls during rapid navigation:

```vue
<script setup>
import { debounce } from "lodash-es";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Debounced side effects
const debouncedFetchData = debounce(async (date) => {
  console.log("Fetching data for:", date);
  const data = await fetchMonthData(date);
  monthData.value = data;
}, 300);

// Debounced URL updates
const debouncedUpdateURL = debounce((date) => {
  const url = new URL(window.location);
  url.searchParams.set("date", date.toISOString());
  window.history.replaceState({}, "", url);
}, 150);

watch(
  () => pickle.date.value,
  (date) => {
    debouncedFetchData(date);
    debouncedUpdateURL(date);
  }
);
</script>
```

### Throttled Scroll Updates

Throttle expensive operations during scrolling:

```vue
<script setup>
import { throttle } from "lodash-es";

const scrollPosition = ref(0);

const throttledScrollHandler = throttle((event) => {
  scrollPosition.value = event.target.scrollTop;
  // Expensive scroll-based calculations here
}, 16); // ~60fps
</script>

<template>
  <div @scroll="throttledScrollHandler">
    <!-- Scrollable content -->
  </div>
</template>
```

## Memory Management

### Cleanup Watchers

Clean up watchers to prevent memory leaks:

```vue
<script setup>
import { onUnmounted } from "vue";

const pickle = usePickle({ date: new Date() });

// Store watcher cleanup functions
const unwatchFunctions = [];

// Create watchers with cleanup
const stopWatchingDate = watch(
  () => pickle.date.value,
  (date) => {
    // Expensive side effect
    updateExternalSystem(date);
  }
);

unwatchFunctions.push(stopWatchingDate);

// Cleanup on unmount
onUnmounted(() => {
  unwatchFunctions.forEach((unwatch) => unwatch());
});
</script>
```

### Weak References for Caches

Use WeakMap for automatic garbage collection:

```vue
<script setup>
// WeakMap automatically cleans up when objects are garbage collected
const timeUnitCache = new WeakMap();

const getCachedDivision = (timeUnit, divisor) => {
  let divisions = timeUnitCache.get(timeUnit);
  if (!divisions) {
    divisions = new Map();
    timeUnitCache.set(timeUnit, divisions);
  }

  if (!divisions.has(divisor)) {
    divisions.set(divisor, pickle.divide(timeUnit, divisor));
  }

  return divisions.get(divisor);
};
</script>
```

## Bundle Size Optimization

### Tree Shaking

Import only what you need:

```typescript
// ✅ Good - tree-shakeable imports
import { usePickle, useMonth, useDay } from "usetemporal";

// ❌ Avoid - imports entire library
import * as useTemporal from "usetemporal";
```

### Lazy Loading Components

Load time components only when needed:

```vue
<script setup>
import { defineAsyncComponent } from "vue";

// Lazy load heavy components
const HeavyYearView = defineAsyncComponent(() => import("./HeavyYearView.vue"));
const HeavyMonthCalendar = defineAsyncComponent(() =>
  import("./HeavyMonthCalendar.vue")
);

const currentView = ref("month");
</script>

<template>
  <div>
    <nav>
      <button @click="currentView = 'year'">Year View</button>
      <button @click="currentView = 'month'">Month View</button>
    </nav>

    <Suspense>
      <component
        :is="currentView === 'year' ? HeavyYearView : HeavyMonthCalendar"
      />
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
</template>
```

## Performance Monitoring

### Custom Performance Hooks

Monitor performance of time operations:

```vue
<script setup>
const usePerformanceMonitor = () => {
  const timings = ref({});

  const measureTime = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    timings.value[name] = {
      duration: end - start,
      timestamp: Date.now(),
    };

    return result;
  };

  const measureAsync = async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    timings.value[name] = {
      duration: end - start,
      timestamp: Date.now(),
    };

    return result;
  };

  return { timings, measureTime, measureAsync };
};

const { timings, measureTime } = usePerformanceMonitor();
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Monitor expensive operations
const months = computed(() =>
  measureTime("divide-year-months", () => pickle.divide(year, "month"))
);

// Log performance data
watch(
  timings,
  (newTimings) => {
    Object.entries(newTimings).forEach(([name, timing]) => {
      if (timing.duration > 10) {
        // Log operations > 10ms
        console.warn(
          `Slow operation: ${name} took ${timing.duration.toFixed(2)}ms`
        );
      }
    });
  },
  { deep: true }
);
</script>
```

## Best Practices Summary

### ✅ Do

- Use computed properties for expensive calculations
- Implement lazy loading for large datasets
- Cache time divisions when appropriate
- Debounce rapid navigation and API calls
- Clean up watchers and event listeners
- Import only needed composables
- Monitor performance in development

### ❌ Avoid

- Creating unnecessary reactive dependencies
- Recalculating divisions on every render
- Keeping references to unused time units
- Importing the entire library
- Performing side effects in computed properties
- Watching entire objects when only specific properties are needed

## Related Concepts

- **[Reactive Time Management](/concepts/reactivity)** - Understanding reactive dependencies
- **[Time Synchronization](/concepts/synchronization)** - Efficient synchronization patterns
- **[Hierarchical Time Units](/concepts/hierarchical-units)** - Leveraging the hierarchy for performance
