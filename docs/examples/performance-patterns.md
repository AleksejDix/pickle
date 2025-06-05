# Performance Patterns

**Single Responsibility:** Optimization techniques for high-performance time interfaces and large data sets.

## Overview

While useTemporal's hierarchical architecture is inherently efficient, large-scale applications require specific optimization patterns. This page focuses on performance techniques for virtual scrolling, lazy loading, and efficient time unit management.

## Lazy Time Unit Creation

Only create time units when they're actually needed:

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// ❌ Inefficient - creates all units immediately
const allMonthsEager = computed(() => pickle.divide(year, "month"));

// ✅ Efficient - lazy creation based on visibility
const visibleRange = ref({ start: 0, end: 12 });

const visibleMonths = computed(() => {
  if (!isVisible.value) return [];

  const allMonths = pickle.divide(year, "month");
  return allMonths.slice(visibleRange.value.start, visibleRange.value.end);
});

// Only compute when component is visible
const isVisible = ref(false);
const observer = new IntersectionObserver(([entry]) => {
  isVisible.value = entry.isIntersecting;
});

onMounted(() => {
  observer.observe(containerRef.value);
});

onUnmounted(() => {
  observer.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="time-container">
    <!-- Only render visible time units -->
    <div v-for="month in visibleMonths" :key="month.raw.value.getTime()">
      {{ month.name }}
    </div>
  </div>
</template>
```

## Virtual Scrolling for Large Time Ranges

Handle thousands of time units efficiently:

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Virtual scrolling configuration
const itemHeight = 50;
const containerHeight = 400;
const visibleCount = Math.ceil(containerHeight / itemHeight);
const bufferSize = 5;

const scrollTop = ref(0);
const containerRef = ref();

// Calculate visible range
const visibleRange = computed(() => {
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop.value / itemHeight) - bufferSize
  );
  const endIndex = Math.min(
    totalItems.value,
    startIndex + visibleCount + bufferSize * 2
  );

  return { start: startIndex, end: endIndex };
});

// Generate time units for visible range only
const startYear = ref(2020);
const endYear = ref(2030);

const totalItems = computed(() => (endYear.value - startYear.value) * 12);

const visibleTimeUnits = computed(() => {
  const units = [];
  const range = visibleRange.value;

  for (let i = range.start; i < range.end; i++) {
    const year = Math.floor(i / 12) + startYear.value;
    const month = i % 12;

    const date = new Date(year, month, 1);
    const monthPickle = usePickle({ date });
    const monthUnit = useMonth(monthPickle);

    units.push({
      index: i,
      timeUnit: monthUnit,
      top: i * itemHeight,
    });
  }

  return units;
});

const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop;
};

const totalHeight = computed(() => totalItems.value * itemHeight);
</script>

<template>
  <div class="virtual-scroll-container">
    <div
      ref="containerRef"
      class="scroll-area"
      :style="{ height: containerHeight + 'px' }"
      @scroll="handleScroll"
    >
      <!-- Virtual content with total height -->
      <div class="virtual-content" :style="{ height: totalHeight + 'px' }">
        <!-- Only render visible items -->
        <div
          v-for="item in visibleTimeUnits"
          :key="item.index"
          class="virtual-item"
          :style="{
            position: 'absolute',
            top: item.top + 'px',
            height: itemHeight + 'px',
          }"
        >
          {{ item.timeUnit.name }}
        </div>
      </div>
    </div>
  </div>
</template>
```

## Efficient Caching with WeakMap

Cache expensive computations while avoiding memory leaks:

```typescript
// timeUnitCache.ts
import type { TimeUnit } from "usetemporal";

class TimeUnitCache {
  private divisionCache = new WeakMap<TimeUnit, Map<string, TimeUnit[]>>();
  private computationCache = new WeakMap<TimeUnit, Map<string, any>>();

  // Cache divide() results
  getDivision(parent: TimeUnit, childType: string): TimeUnit[] | null {
    let parentCache = this.divisionCache.get(parent);

    if (!parentCache) {
      parentCache = new Map();
      this.divisionCache.set(parent, parentCache);
    }

    return parentCache.get(childType) || null;
  }

  setDivision(parent: TimeUnit, childType: string, children: TimeUnit[]): void {
    let parentCache = this.divisionCache.get(parent);

    if (!parentCache) {
      parentCache = new Map();
      this.divisionCache.set(parent, parentCache);
    }

    parentCache.set(childType, children);
  }

  // Cache expensive computations
  getComputation(timeUnit: TimeUnit, key: string): any {
    const cache = this.computationCache.get(timeUnit);
    return cache?.get(key);
  }

  setComputation(timeUnit: TimeUnit, key: string, value: any): void {
    let cache = this.computationCache.get(timeUnit);

    if (!cache) {
      cache = new Map();
      this.computationCache.set(timeUnit, cache);
    }

    cache.set(key, value);
  }

  // Clear cache for memory management
  clear(): void {
    this.divisionCache = new WeakMap();
    this.computationCache = new WeakMap();
  }
}

// Global cache instance
export const timeUnitCache = new TimeUnitCache();

// Enhanced usePickle with caching
export const useCachedPickle = (options) => {
  const pickle = usePickle(options);

  const cachedDivide = (parent: TimeUnit, childType: string) => {
    // Check cache first
    let cached = timeUnitCache.getDivision(parent, childType);

    if (cached) {
      return cached;
    }

    // Compute and cache
    cached = pickle.divide(parent, childType);
    timeUnitCache.setDivision(parent, childType, cached);

    return cached;
  };

  return {
    ...pickle,
    divide: cachedDivide,
  };
};
```

## Debounced Time Navigation

Prevent excessive re-renders during rapid navigation:

```vue
<script setup>
import { debounce } from "lodash-es";
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Debounced navigation to prevent excessive updates
const debouncedNavigation = debounce((direction: "past" | "future") => {
  if (direction === "past") {
    month.past();
  } else {
    month.future();
  }
}, 100);

// Fast navigation for keyboard shortcuts
const handleKeyDown = (event) => {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      debouncedNavigation("past");
      break;
    case "ArrowRight":
      event.preventDefault();
      debouncedNavigation("future");
      break;
  }
};

// Batch multiple navigation calls
const navigationQueue = ref([]);
const isProcessing = ref(false);

const queueNavigation = (direction: "past" | "future") => {
  navigationQueue.value.push(direction);

  if (!isProcessing.value) {
    processNavigationQueue();
  }
};

const processNavigationQueue = async () => {
  isProcessing.value = true;

  while (navigationQueue.value.length > 0) {
    const direction = navigationQueue.value.shift();

    if (direction === "past") {
      month.past();
    } else {
      month.future();
    }

    // Small delay to prevent overwhelming the browser
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  isProcessing.value = false;
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  debouncedNavigation.cancel();
});
</script>

<template>
  <div class="debounced-navigation">
    <button @click="queueNavigation('past')" :disabled="isProcessing">
      ← Previous
    </button>

    <span>{{ month.name }}</span>

    <button @click="queueNavigation('future')" :disabled="isProcessing">
      Next →
    </button>

    <div v-if="isProcessing" class="processing-indicator">Processing...</div>
  </div>
</template>
```

## Memory-Efficient Event Handling

Handle large numbers of time-based events efficiently:

```vue
<script setup>
import { usePickle, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Event data structure optimized for performance
interface OptimizedEvent {
  id: string;
  title: string;
  startTime: number; // Unix timestamp for fast comparison
  endTime: number;
  color: string;
}

const events = ref<OptimizedEvent[]>([]);

// Spatial indexing for fast event lookups
const eventsByMonth = computed(() => {
  const index = new Map<string, OptimizedEvent[]>();

  events.value.forEach(event => {
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);

    // Index by year-month key
    const startKey = `${startDate.getFullYear()}-${startDate.getMonth()}`;
    const endKey = `${endDate.getFullYear()}-${endDate.getMonth()}`;

    // Add to all months the event spans
    let currentDate = new Date(startDate);
    currentDate.setDate(1);

    while (currentDate <= endDate) {
      const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

      if (!index.has(key)) {
        index.set(key, []);
      }

      index.get(key)!.push(event);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  });

  return index;
});

// Fast event lookup for a specific time unit
const getEventsForTimeUnit = (timeUnit: TimeUnit): OptimizedEvent[] => {
  const date = timeUnit.raw.value;
  const key = `${date.getFullYear()}-${date.getMonth()}`;

  return eventsByMonth.value.get(key) || [];
};

// Virtualized event rendering
const visibleMonths = computed(() => {
  const months = pickle.divide(year, "month");
  return months.slice(visibleRange.value.start, visibleRange.value.end);
});

const visibleRange = ref({ start: 0, end: 12 });

// Optimized event overlap detection
const hasEventOverlap = (timeUnit: TimeUnit): boolean => {
  const unitStart = timeUnit.timespan.start.getTime();
  const unitEnd = timeUnit.timespan.end.getTime();

  const monthEvents = getEventsForTimeUnit(timeUnit);

  return monthEvents.some(event =>
    event.startTime <= unitEnd && event.endTime >= unitStart
  );
};

// Efficient bulk event operations
const addEvents = (newEvents: OptimizedEvent[]) => {
  // Batch DOM updates
  nextTick(() => {
    events.value.push(...newEvents);
  });
};

const removeEvents = (eventIds: string[]) => {
  const idsSet = new Set(eventIds);
  events.value = events.value.filter(event => !idsSet.has(event.id));
};
</script>

<template>
  <div class="optimized-calendar">
    <div
      v-for="month in visibleMonths"
      :key="month.raw.value.getTime()"
      class="month-cell"
      :class="{ 'has-events': hasEventOverlap(month) }"
    >
      <span>{{ month.name }}</span>

      <!-- Only render event details for visible months -->
      <div v-if="hasEventOverlap(month)" class="event-count">
        {{ getEventsForTimeUnit(month).length }} events
      </div>
    </div>
  </div>
</template>
```

## Reactive Boundaries

Limit reactive scope to prevent unnecessary re-renders:

```vue
<script setup>
import { usePickle, useYear, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// ❌ Inefficient - everything reacts to pickle changes
const inefficientSetup = () => {
  const year = useYear(pickle);
  const month = useMonth(pickle);
  const days = computed(() => pickle.divide(month, "day"));
  const hours = computed(() =>
    days.value.flatMap((day) => pickle.divide(day, "hour"))
  );

  return { year, month, days, hours };
};

// ✅ Efficient - isolate reactive boundaries
const efficientSetup = () => {
  const year = useYear(pickle);
  const month = useMonth(pickle);

  // Only compute days when month actually changes
  const days = computed(() => {
    if (!showDays.value) return [];
    return pickle.divide(month, "day");
  });

  // Separate pickle for hour calculations
  const hourPickle = usePickle({
    date: computed(() => selectedDay.value?.raw.value || new Date()),
  });

  const hours = computed(() => {
    if (!showHours.value || !selectedDay.value) return [];
    const day = useDay(hourPickle);
    return pickle.divide(day, "hour");
  });

  return { year, month, days, hours };
};

// Control reactive boundaries with flags
const showDays = ref(false);
const showHours = ref(false);
const selectedDay = ref(null);

// Efficient scale switching
const currentScale = ref("month");

const currentUnits = computed(() => {
  switch (currentScale.value) {
    case "year":
      return [useYear(pickle)];
    case "month":
      return pickle.divide(useYear(pickle), "month");
    case "day":
      return showDays.value ? pickle.divide(useMonth(pickle), "day") : [];
    case "hour":
      return showHours.value && selectedDay.value
        ? pickle.divide(selectedDay.value, "hour")
        : [];
    default:
      return [];
  }
});

const switchScale = (newScale: string) => {
  // Reset flags to prevent unnecessary computations
  showDays.value = false;
  showHours.value = false;
  selectedDay.value = null;

  currentScale.value = newScale;

  // Enable computations for new scale
  nextTick(() => {
    if (newScale === "day") showDays.value = true;
    if (newScale === "hour") showHours.value = true;
  });
};
</script>

<template>
  <div class="reactive-boundaries">
    <!-- Scale selector -->
    <div class="scale-controls">
      <button
        v-for="scale in ['year', 'month', 'day', 'hour']"
        :key="scale"
        @click="switchScale(scale)"
        :class="{ active: currentScale === scale }"
      >
        {{ scale }}
      </button>
    </div>

    <!-- Only render current scale -->
    <div class="time-display">
      <div
        v-for="unit in currentUnits"
        :key="unit.raw.value.getTime()"
        class="time-unit"
        @click="selectedDay = unit"
      >
        {{ unit.name }}
      </div>
    </div>
  </div>
</template>
```

## Performance Monitoring

Track and optimize time unit performance:

```typescript
// performanceMonitor.ts
export class TimeUnitPerformanceMonitor {
  private metrics = new Map<string, number[]>();

  measureOperation<T>(name: string, operation: () => T): T {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(duration);

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getReport(): Record<
    string,
    { average: number; samples: number; max: number }
  > {
    const report: Record<string, any> = {};

    this.metrics.forEach((times, operation) => {
      report[operation] = {
        average: this.getAverageTime(operation),
        samples: times.length,
        max: Math.max(...times),
      };
    });

    return report;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Usage in components
const monitor = new TimeUnitPerformanceMonitor();

const optimizedDivide = (parent: TimeUnit, childType: string) => {
  return monitor.measureOperation(`divide-${childType}`, () => {
    return pickle.divide(parent, childType);
  });
};
```

## Key Performance Benefits

- **Lazy Loading**: Only create time units when needed
- **Virtual Scrolling**: Handle thousands of time units efficiently
- **Smart Caching**: Cache expensive computations with memory safety
- **Debounced Navigation**: Prevent excessive re-renders
- **Reactive Boundaries**: Limit reactive scope appropriately
- **Efficient Event Handling**: Optimize event operations and lookups

## Best Practices

- Use intersection observers for visibility-based loading
- Implement virtual scrolling for large time ranges
- Cache division results with WeakMap for memory safety
- Debounce rapid navigation to prevent excessive updates
- Isolate reactive boundaries to limit re-render scope
- Monitor performance and identify bottlenecks
- Use spatial indexing for fast event lookups
- Batch DOM updates with nextTick()

<style scoped>
.virtual-scroll-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.scroll-area {
  overflow-y: auto;
  position: relative;
}

.virtual-content {
  position: relative;
}

.virtual-item {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.debounced-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.processing-indicator {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.optimized-calendar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.month-cell {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  position: relative;
}

.month-cell.has-events {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft);
}

.event-count {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  font-size: 0.75rem;
  background: var(--vp-c-brand);
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

.reactive-boundaries {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.scale-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.scale-controls button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
}

.scale-controls button.active {
  background: var(--vp-c-brand);
  color: white;
}

.time-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-unit {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
}

.time-unit:hover {
  background: var(--vp-c-bg-soft);
}
</style>
