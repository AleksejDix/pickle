# Performance Optimization Guide

This guide helps you optimize useTemporal applications for maximum performance. Learn how to minimize reactivity overhead, cache computations, and handle large-scale date operations efficiently.

## Understanding useTemporal Performance

### Reactivity Overhead

useTemporal uses Vue's reactivity system, which provides automatic updates but has a small overhead:

```javascript
// Each access triggers reactivity tracking
const month = temporal.periods.month(temporal);
console.log(month.number); // Tracked access
console.log(month.name); // Another tracked access
console.log(month.days); // Another tracked access
```

**Optimization**: Batch property access:

```javascript
// Better: Single reactive access
const monthData = month.period.value;
const { start, end } = monthData;

// Or destructure what you need once
const { number, name, days } = month;
```

### Divide Operation Performance

The `divide()` operation creates multiple time unit instances:

```javascript
// This creates 365/366 day instances
const year = temporal.periods.year(temporal);
const days = temporal.divide(year, "day");
```

**Performance characteristics**:

- Year → Days: ~365 instances
- Year → Hours: ~8,760 instances
- Year → Minutes: ~525,600 instances

## Optimization Strategies

### 1. Cache Temporal Instances

Don't create multiple temporal instances unnecessarily:

```javascript
// ❌ Bad: Creating new instance in every render
function CalendarComponent() {
  const temporal = createTemporal({ dateAdapter: nativeAdapter });
  // ...
}

// ✅ Good: Create once and reuse
const temporal = createTemporal({ dateAdapter: nativeAdapter });

function CalendarComponent() {
  // Use the shared instance
  const month = temporal.periods.month(temporal);
  // ...
}

// ✅ Better: Use context/provide in frameworks
// Vue example
const app = createApp(App);
app.provide("temporal", temporal);

// React example
const TemporalContext = React.createContext(temporal);
```

### 2. Memoize Expensive Operations

Cache results of expensive divide operations:

```javascript
// ❌ Bad: Recalculating on every access
function getDaysInMonth() {
  const month = temporal.periods.month(temporal);
  return temporal.divide(month, "day");
}

// ✅ Good: Memoize the result
const dayCache = new Map();

function getDaysInMonth(monthKey) {
  if (!dayCache.has(monthKey)) {
    const month = temporal.periods.month(temporal);
    dayCache.set(monthKey, temporal.divide(month, "day"));
  }
  return dayCache.get(monthKey);
}

// ✅ Better: Use computed/memo in frameworks
// Vue
const days = computed(() => {
  const month = temporal.periods.month(temporal);
  return temporal.divide(month, "day");
});

// React
const days = useMemo(() => {
  const month = temporal.periods.month(temporal);
  return temporal.divide(month, "day");
}, [monthNumber]);
```

### 3. Lazy Loading Pattern

Don't compute all time units upfront:

```javascript
// ❌ Bad: Computing everything immediately
class CalendarView {
  constructor(temporal) {
    this.year = temporal.periods.year(temporal);
    this.months = temporal.divide(this.year, "month");
    this.weeks = temporal.divide(this.year, "week");
    this.days = temporal.divide(this.year, "day");
    // Expensive and might not use all of these
  }
}

// ✅ Good: Lazy computation
class CalendarView {
  constructor(temporal) {
    this.temporal = temporal;
    this._months = null;
    this._weeks = null;
    this._days = null;
  }

  get months() {
    if (!this._months) {
      const year = this.temporal.periods.year(this.temporal);
      this._months = this.temporal.divide(year, "month");
    }
    return this._months;
  }

  // Similar getters for weeks and days
}
```

### 4. Pagination for Large Date Ranges

When working with large date ranges, paginate:

```javascript
// ❌ Bad: Loading years of data
function loadMultiYearCalendar(startYear, endYear) {
  const allDays = [];
  for (let year = startYear; year <= endYear; year++) {
    const yearPeriod = temporal.periods.year(temporal, {
      date: new Date(year, 0, 1),
    });
    const days = temporal.divide(yearPeriod, "day");
    allDays.push(...days);
  }
  return allDays; // Could be thousands of objects
}

// ✅ Good: Load visible range only
function loadVisibleDays(centerDate, windowSize = 42) {
  const start = new Date(centerDate);
  start.setDate(start.getDate() - windowSize / 2);

  const days = [];
  for (let i = 0; i < windowSize; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const day = temporal.periods.day(temporal, { date });
    days.push(day);
  }
  return days;
}
```

### 5. Avoid Reactive Watchers for Heavy Computation

Be careful with reactive watchers on frequently changing values:

```javascript
// ❌ Bad: Heavy computation in watcher
watch(
  () => temporal.now,
  () => {
    // This runs every time 'now' updates
    const year = temporal.periods.year(temporal);
    const allDays = temporal.divide(year, "day");
    const allHours = allDays.flatMap((day) => temporal.divide(day, "hour"));
    // Very expensive!
  }
);

// ✅ Good: Debounce or throttle updates
import { debounce } from "lodash-es";

const updateCalendar = debounce(() => {
  const year = temporal.periods.year(temporal);
  const allDays = temporal.divide(year, "day");
  // Expensive operation runs less frequently
}, 1000);

watch(() => temporal.now, updateCalendar);

// ✅ Better: Update only what's needed
watch(
  () => temporal.now,
  () => {
    // Just update the current day highlight
    const today = temporal.periods.day(temporal);
    updateDayHighlight(today);
  }
);
```

### 6. Use StableMonth for Calendar UIs

StableMonth is optimized for calendar grids:

```javascript
// ❌ Bad: Complex logic to fill calendar grid
function getCalendarDays(month) {
  const days = temporal.divide(month, "day");
  const firstDay = days[0];
  const firstDayOfWeek = firstDay.dayOfWeek;

  // Add previous month days
  const previousDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    previousDays.push(firstDay.past(i + 1));
  }

  // Add next month days
  const totalDays = days.length + previousDays.length;
  const nextDays = [];
  const lastDay = days[days.length - 1];
  for (let i = 1; totalDays + nextDays.length < 42; i++) {
    nextDays.push(lastDay.future(i));
  }

  return [...previousDays, ...days, ...nextDays];
}

// ✅ Good: Use stableMonth
function getCalendarDays() {
  const stableMonth = temporal.periods.stableMonth(temporal);
  return temporal.divide(stableMonth, "day");
  // Always returns exactly 42 days!
}
```

## Performance Benchmarks

### Typical Operation Times

Based on testing with Chrome V8:

| Operation                      | Time    | Notes                  |
| ------------------------------ | ------- | ---------------------- |
| Create temporal instance       | ~1ms    | One-time cost          |
| Access time unit (e.g., month) | <0.1ms  | Very fast              |
| Divide month into days         | ~2ms    | Creates ~30 objects    |
| Divide year into days          | ~15ms   | Creates ~365 objects   |
| Divide year into hours         | ~200ms  | Creates ~8,760 objects |
| Access reactive property       | <0.01ms | Negligible overhead    |

### Memory Usage

| Structure         | Memory | Notes                    |
| ----------------- | ------ | ------------------------ |
| Temporal instance | ~2KB   | Includes reactive system |
| Time unit object  | ~200B  | Each day, hour, etc.     |
| Year of days      | ~73KB  | 365 × 200B               |
| Year of hours     | ~1.7MB | 8,760 × 200B             |

## Best Practices

### 1. Profile First

Always profile before optimizing:

```javascript
// Browser profiling
console.time("divide-operation");
const days = temporal.divide(year, "day");
console.timeEnd("divide-operation");

// Memory profiling
if (performance.memory) {
  const before = performance.memory.usedJSHeapSize;
  const days = temporal.divide(year, "day");
  const after = performance.memory.usedJSHeapSize;
  console.log(`Memory used: ${(after - before) / 1024}KB`);
}
```

### 2. Use Development Mode Warnings

Enable development warnings to catch performance issues:

```javascript
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  // Future feature: performance warnings
  performanceWarnings: true,
});
```

### 3. Optimize for Common Cases

Focus on the most common operations:

```javascript
// Most apps need:
// - Current month view (stableMonth)
// - Navigation by month/week
// - Today highlighting

// Optimize these first!
const quickCalendar = {
  _currentMonth: null,
  _stableMonth: null,

  get currentMonth() {
    // Cache current month
    const now = temporal.now;
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

    if (this._monthKey !== monthKey) {
      this._monthKey = monthKey;
      this._currentMonth = temporal.periods.month(temporal);
      this._stableMonth = temporal.periods.stableMonth(temporal);
    }

    return this._currentMonth;
  },

  get calendarDays() {
    // Reuse stable month
    return temporal.divide(this._stableMonth, "day");
  },
};
```

### 4. Consider Virtual Scrolling

For large date ranges, use virtual scrolling:

```javascript
// Example with Vue virtual scroller
<template>
  <virtual-scroller
    :items="yearDays"
    :item-height="40"
    :buffer="10"
  >
    <template #default="{ item }">
      <DayComponent :day="item" />
    </template>
  </virtual-scroller>
</template>

<script setup>
const yearDays = computed(() => {
  // Only compute when needed
  if (!showFullYear.value) return [];

  const year = temporal.periods.year(temporal);
  return temporal.divide(year, 'day');
});
</script>
```

## Advanced Optimizations

### 1. Web Workers for Heavy Computation

Offload expensive operations to Web Workers:

```javascript
// worker.js
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  if (type === "computeYearStats") {
    const temporal = createTemporal({ dateAdapter: nativeAdapter });
    const year = temporal.periods.year(temporal, {
      date: new Date(data.year, 0, 1),
    });
    const days = temporal.divide(year, "day");

    const stats = {
      totalDays: days.length,
      weekends: days.filter((d) => d.isWeekend).length,
      weekdays: days.filter((d) => d.isWeekday).length,
    };

    self.postMessage({ type: "yearStats", data: stats });
  }
});

// main.js
const worker = new Worker("./worker.js");
worker.postMessage({ type: "computeYearStats", data: { year: 2024 } });
```

### 2. Request Animation Frame for Updates

Batch DOM updates with requestAnimationFrame:

```javascript
let pendingUpdates = new Set();

function scheduleUpdate(updateFn) {
  pendingUpdates.add(updateFn);

  if (pendingUpdates.size === 1) {
    requestAnimationFrame(() => {
      pendingUpdates.forEach((fn) => fn());
      pendingUpdates.clear();
    });
  }
}

// Use for calendar updates
watch(
  () => temporal.now,
  () => {
    scheduleUpdate(() => {
      updateCalendarHighlight();
    });
  }
);
```

### 3. Shared Temporal Instances

Share temporal instances across your application:

```javascript
// temporal-service.js
class TemporalService {
  constructor() {
    this._instances = new Map();
  }

  getInstance(config = {}) {
    const key = JSON.stringify(config);

    if (!this._instances.has(key)) {
      this._instances.set(key, createTemporal(config));
    }

    return this._instances.get(key);
  }
}

export const temporalService = new TemporalService();

// Use throughout app
const temporal = temporalService.getInstance({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1,
});
```

## Debugging Performance Issues

### 1. Identify Bottlenecks

```javascript
// Performance observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 16) {
      // Longer than one frame
      console.warn("Slow operation:", entry.name, entry.duration);
    }
  }
});

observer.observe({ entryTypes: ["measure"] });

// Measure operations
performance.mark("divide-start");
const days = temporal.divide(year, "day");
performance.mark("divide-end");
performance.measure("divide-operation", "divide-start", "divide-end");
```

### 2. Monitor Memory Usage

```javascript
// Memory monitoring utility
function monitorMemory() {
  if (!performance.memory) return;

  setInterval(() => {
    const used = performance.memory.usedJSHeapSize / 1048576;
    const total = performance.memory.totalJSHeapSize / 1048576;

    console.log(`Memory: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);

    if (used / total > 0.9) {
      console.warn("High memory usage detected!");
    }
  }, 5000);
}
```

## Conclusion

useTemporal is designed to be performant for typical use cases. By following these optimization strategies:

1. **Cache temporal instances** - Create once, use everywhere
2. **Memoize expensive operations** - Especially divide() results
3. **Use lazy loading** - Compute only what you need
4. **Leverage stableMonth** - For optimized calendar UIs
5. **Profile before optimizing** - Measure actual performance
6. **Consider your use case** - Most apps don't need microsecond precision

Remember: premature optimization is the root of all evil. Start with clean, readable code and optimize only where profiling shows real bottlenecks.
