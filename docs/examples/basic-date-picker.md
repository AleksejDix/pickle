# Basic Date Picker

Learn how to build a complete interactive date picker using useTemporal's hierarchical time composables.

## Interactive Demo

Try the date picker below to see useTemporal in action:

<BasicDatePicker />

## Key Features

### 1. **Month Navigation**

Navigate between months using the arrow buttons. Notice how the calendar automatically updates with the correct number of days for each month.

### 2. **Current Date Highlighting**

Today's date is automatically highlighted in blue, demonstrating the reactive `isNow` property.

### 3. **Date Selection**

Click any day to select it and see detailed information about that date.

### 4. **Automatic Synchronization**

All time units (day, week, month) stay perfectly synchronized when you navigate or select dates.

## How It Works

### The Foundation

```typescript
// Create the core pickle instance
const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

// Get the current month
const currentMonth = useMonth(pickle);
```

### The Revolutionary divide() Pattern

```typescript
// Get all days in the month using divide()
const monthDays = computed(() => pickle.divide(currentMonth, "day"));

// This returns an array of day units, each with:
// - name: "Monday, January 15, 2024"
// - number: 15
// - isNow: true/false
// - raw: Date object
// - past() and future() methods
```

### Navigation

```typescript
// Navigate months - days automatically update
currentMonth.past(); // Previous month
currentMonth.future(); // Next month

// The days array automatically recalculates!
```

### Selected Date Details

```typescript
// Create time units for the selected date
const selectedDayInfo = computed(() => {
  if (!selectedDate.value) return null;
  const dayPickle = usePickle({ date: selectedDate.value });
  return useDay(dayPickle);
});

const selectedWeekInfo = computed(() => {
  if (!selectedDate.value) return null;
  const weekPickle = usePickle({ date: selectedDate.value });
  return useWeek(weekPickle);
});
```

## Complete Implementation

Here's the full Vue component implementation:

```vue
<template>
  <div class="date-picker">
    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold">{{ currentMonth.name.value }}</h3>
      <p class="text-gray-600">
        Selected: {{ selectedDate ? formatDate(selectedDate) : "None" }}
      </p>
    </div>

    <!-- Navigation -->
    <div class="flex justify-center items-center space-x-4 mb-6">
      <button @click="currentMonth.past()" class="btn-nav">← Previous</button>
      <button @click="jumpToToday" class="btn-today">Today</button>
      <button @click="currentMonth.future()" class="btn-nav">Next →</button>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday Headers -->
      <div class="weekday-headers">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <!-- Days -->
      <div class="days-grid">
        <button
          v-for="day in calendarDays"
          :key="day.date.getTime()"
          @click="selectDate(day.date)"
          class="day-button"
          :class="getDayClasses(day)"
        >
          {{ day.date.getDate() }}
        </button>
      </div>
    </div>

    <!-- Selected Date Info -->
    <div v-if="selectedDate" class="selected-info">
      <h4>Selected Date Details</h4>
      <p><strong>Day:</strong> {{ selectedDayInfo?.name.value }}</p>
      <p><strong>Week:</strong> {{ selectedWeekInfo?.name.value }}</p>
      <p><strong>Month:</strong> {{ selectedMonthInfo?.name.value }}</p>
      <p>
        <strong>Is Today:</strong>
        {{ selectedDayInfo?.isNow.value ? "Yes" : "No" }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePickle, useMonth, useDay, useWeek } from "usetemporal";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const currentMonth = useMonth(pickle);
const selectedDate = ref(null);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get all days using the divide() pattern
const monthDays = computed(() => pickle.divide(currentMonth, "day"));

// Calendar grid with padding days
const calendarDays = computed(() => {
  // Implementation details...
  return calendarDaysArray;
});

// Methods
const selectDate = (date) => {
  selectedDate.value = date;
};

const jumpToToday = () => {
  pickle.picked.value = new Date();
  selectedDate.value = new Date();
};
</script>
```

## Key Benefits

### 1. **Automatic Updates**

When you navigate months, the days automatically update with the correct number of days for each month. No manual date calculations needed!

### 2. **Consistent Interface**

The same `past()` and `future()` methods work for years, months, days, hours, and minutes.

### 3. **Reactive by Design**

Built on Vue 3's reactivity system, so all UI updates happen automatically when the underlying time units change.

### 4. **No Date Math**

useTemporal handles all the complex date calculations. You just work with semantic time units.

## Next Steps

- **[Multi-Scale Calendar](/examples/multi-scale-calendar)** - Build a calendar that zooms between time scales
- **[Time Navigation](/examples/time-navigation)** - Learn advanced navigation patterns
- **[Component Patterns](/examples/component-patterns)** - Reusable time component architectures

<script setup>
import BasicDatePicker from '../.vitepress/components/BasicDatePicker.vue'
</script>
