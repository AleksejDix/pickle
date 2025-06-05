# GitHub Contribution Chart

Build a pixel-perfect GitHub-style contribution chart using useTemporal's divide() pattern. This example demonstrates how to create complex, data-rich time visualizations with minimal code.

## Interactive Demo

Try the contribution chart below. Navigate between years and click on days to see the power of unified time management:

<GitHubChart />

## Why This Example Matters

### Real-World Recognition

GitHub's contribution chart is instantly recognizable to millions of developers. By recreating it with useTemporal, we demonstrate how the divide() pattern handles complex, real-world time visualization requirements.

### Complex Made Simple

Traditional approaches require:

- Manual date calculations for grid layout
- Complex logic for leap years and month boundaries
- Separate handling for different calendar views
- Manual DOM updates for data changes

useTemporal reduces this to:

```typescript
const yearDays = pickle.divide(year, "day"); // 365/366 days, perfectly organized
```

## Key Features Demonstrated

### 1. **Perfect Year Grid**

The contribution chart requires exactly the right number of days laid out in a proper weekly grid. useTemporal handles this automatically:

```typescript
// Get all days for any year
const yearDays = computed(() => pickle.divide(currentYear, "day"));

// Automatically handles:
// - Leap years (366 days)
// - Regular years (365 days)
// - Proper date boundaries
// - No off-by-one errors
```

### 2. **Seamless Year Navigation**

Navigate between years with consistent behavior:

```typescript
// Navigate years - everything updates automatically
currentYear.past(); // Previous year
currentYear.future(); // Next year

// All 365/366 squares regenerate instantly
// All data bindings update reactively
```

### 3. **Intelligent Grid Layout**

The chart automatically creates the correct weekly grid structure:

```typescript
// Create proper calendar grid
const gridDays = computed(() => {
  const days = yearDays.value;
  const firstDay = days[0].raw.value;

  // Start from first Sunday (proper grid alignment)
  const startOfGrid = new Date(firstDay);
  startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());

  // Fill complete weeks
  const gridDays = [];
  const current = new Date(startOfGrid);

  while (current <= endOfGrid) {
    gridDays.push({
      date: new Date(current),
      contributions: generateContributions(current),
    });
    current.setDate(current.getDate() + 1);
  }

  return gridDays;
});
```

### 4. **Dynamic Data Binding**

Each day square is reactive to data changes:

```typescript
// Each day automatically updates when data changes
const daySquare = {
  date: day.raw.value,
  contributions: contributionData.get(day.raw.value),
  isCurrentYear:
    day.raw.value.getFullYear() === currentYear.raw.value.getFullYear(),
};
```

## Complete Implementation

### Core Setup

```typescript
import { ref, computed } from "vue";
import { usePickle, useYear } from "usetemporal";

// Create the time foundation
const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const currentYear = useYear(pickle);
const selectedDay = ref(null);
```

### The Revolutionary divide() Pattern

```typescript
// Get all days in the year using divide()
const yearDays = computed(() => pickle.divide(currentYear, "day"));
const yearMonths = computed(() => pickle.divide(currentYear, "month"));

// This gives you:
// - Exactly 365 or 366 days (automatic leap year handling)
// - 12 months with correct boundaries
// - Perfect date precision
// - Automatic reactive updates
```

### Grid Generation

```typescript
const gridDays = computed(() => {
  const days = yearDays.value;
  if (!days.length) return [];

  // Create proper weekly grid starting from Sunday
  const firstDay = days[0].raw.value;
  const startOfGrid = new Date(firstDay);
  startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());

  const lastDay = days[days.length - 1].raw.value;
  const endOfGrid = new Date(lastDay);
  endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay()));

  const gridDays = [];
  const current = new Date(startOfGrid);

  while (current <= endOfGrid) {
    const date = new Date(current);
    const isCurrentYear = date.getFullYear() === firstDay.getFullYear();

    gridDays.push({
      date,
      contributions: isCurrentYear ? generateContributions(date) : 0,
      isCurrentYear,
    });

    current.setDate(current.getDate() + 1);
  }

  return gridDays;
});
```

### Realistic Data Generation

```typescript
const generateContributions = (date) => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Simulate realistic coding patterns
  const weekdayChance = 0.7;
  const weekendChance = 0.3;
  const baseChance = isWeekend ? weekendChance : weekdayChance;

  // Project months with higher activity
  const month = date.getMonth();
  const projectMonths = [2, 5, 9]; // March, June, October
  const multiplier = projectMonths.includes(month) ? 1.5 : 1;

  const random = Math.random() * multiplier;

  if (random < 0.4) return 0; // No activity
  if (random < 0.6) return Math.floor(Math.random() * 3) + 1; // Light activity
  if (random < 0.8) return Math.floor(Math.random() * 6) + 4; // Medium activity
  if (random < 0.95) return Math.floor(Math.random() * 10) + 7; // High activity
  return Math.floor(Math.random() * 15) + 15; // Very high activity
};
```

### Vue Template

```vue
<template>
  <div class="github-chart">
    <!-- Year Navigation -->
    <div class="year-nav">
      <button @click="currentYear.past()">
        ← {{ currentYear.raw.value.getFullYear() - 1 }}
      </button>

      <div class="year-info">
        <h3>{{ currentYear.name.value }}</h3>
        <p>{{ yearDays.length }} days tracked</p>
      </div>

      <button @click="currentYear.future()">
        {{ currentYear.raw.value.getFullYear() + 1 }} →
      </button>
    </div>

    <!-- Month Labels -->
    <div class="month-labels">
      <div v-for="month in yearMonths" :key="month.number.value">
        {{ month.name.value.slice(0, 3) }}
      </div>
    </div>

    <!-- Contribution Grid -->
    <div class="contribution-grid">
      <div class="weekday-labels">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div class="days-grid">
        <div
          v-for="day in gridDays"
          :key="day.date.getTime()"
          @click="selectDay(day)"
          class="day-square"
          :class="getContributionClass(day.contributions)"
          :title="getTooltip(day)"
        ></div>
      </div>
    </div>

    <!-- Selected Day Info -->
    <div v-if="selectedDay" class="selected-info">
      <h4>{{ formatDate(selectedDay.date) }}</h4>
      <p>{{ selectedDay.contributions }} contributions</p>
    </div>
  </div>
</template>
```

### CSS Grid Layout

```css
.contribution-grid {
  display: flex;
  gap: 8px;
}

.weekday-labels {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 2px;
}

.days-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 2px;
  flex: 1;
}

.day-square {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Contribution levels matching GitHub */
.contrib-0 {
  background-color: #ebedf0;
}
.contrib-1 {
  background-color: #9be9a8;
}
.contrib-2 {
  background-color: #40c463;
}
.contrib-3 {
  background-color: #30a14e;
}
.contrib-4 {
  background-color: #216e39;
}
```

## Key Benefits

### 1. **Minimal Code, Maximum Functionality**

Traditional calendar implementations require hundreds of lines of date calculation logic. With useTemporal:

```typescript
// This single line gives you 365/366 perfect days
const yearDays = pickle.divide(year, "day");
```

### 2. **Automatic Leap Year Handling**

```typescript
// 2024 (leap year)
const days2024 = pickle.divide(year2024, "day");
console.log(days2024.length); // 366

// 2023 (regular year)
const days2023 = pickle.divide(year2023, "day");
console.log(days2023.length); // 365
```

### 3. **Perfect Date Boundaries**

```typescript
// Each day knows its exact timespan
const firstDay = yearDays[0];
console.log(firstDay.timespan.value);
// { start: '2024-01-01T00:00:00.000Z', end: '2024-01-02T00:00:00.000Z' }

const lastDay = yearDays[yearDays.length - 1];
console.log(lastDay.timespan.value);
// { start: '2024-12-31T00:00:00.000Z', end: '2025-01-01T00:00:00.000Z' }
```

### 4. **Reactive Data Updates**

```typescript
// All squares update automatically when year changes
currentYear.future();

// Vue's reactivity ensures:
// - Grid recreates with new year's days
// - All data bindings update
// - UI re-renders only changed elements
// - No manual DOM manipulation needed
```

## Advanced Patterns

### Custom Time Periods

```typescript
// Show contributions for last 6 months instead of full year
const currentMonth = useMonth(pickle);
const last6Months = Array.from({ length: 6 }, (_, i) => {
  const month = useMonth(pickle);
  // Go back i months
  for (let j = 0; j < i; j++) month.past();
  return pickle.divide(month, "day");
}).flat();
```

### Data Aggregation

```typescript
// Weekly totals
const weeks = pickle.divide(year, "week");
const weeklyTotals = weeks.map((week) => {
  const weekDays = pickle.divide(week, "day");
  return weekDays.reduce((sum, day) => sum + getContributions(day), 0);
});
```

### Performance Optimization

```typescript
// Lazy load contribution data
const contributions = computed(() => {
  if (!showContributions.value) return new Map();

  return yearDays.value.reduce((map, day) => {
    map.set(day.raw.value.toDateString(), generateContributions(day.raw.value));
    return map;
  }, new Map());
});
```

## Use Cases Beyond GitHub

### 1. **Habit Tracking**

```typescript
const habitData = yearDays.value.map((day) => ({
  date: day.raw.value,
  exercised: getHabitData(day, "exercise"),
  meditated: getHabitData(day, "meditation"),
  read: getHabitData(day, "reading"),
}));
```

### 2. **Sales Analytics**

```typescript
const salesChart = yearDays.value.map((day) => ({
  date: day.raw.value,
  revenue: getSalesData(day),
  orders: getOrderCount(day),
  conversion: getConversionRate(day),
}));
```

### 3. **Content Publishing**

```typescript
const publishingChart = yearDays.value.map((day) => ({
  date: day.raw.value,
  articles: getPublishedContent(day, "article"),
  videos: getPublishedContent(day, "video"),
  posts: getPublishedContent(day, "social"),
}));
```

## Conclusion

The GitHub contribution chart example showcases useTemporal's revolutionary approach to time-based data visualization:

- **Single Pattern**: `pickle.divide(year, 'day')` creates 365/366 perfect time units
- **Zero Configuration**: Automatic leap year handling, perfect boundaries, no setup
- **Reactive by Design**: Changes propagate automatically throughout the entire interface
- **Infinite Flexibility**: Same pattern works for any time-based visualization

This is the power of hierarchical time composables - complex applications become simple, maintainable, and incredibly powerful!

<script setup>
import GitHubChart from '../.vitepress/components/GitHubChart.vue'
</script>
