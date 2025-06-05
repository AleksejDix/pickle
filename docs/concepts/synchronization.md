# Time Synchronization

Time synchronization in useTemporal ensures that all time units sharing the same pickle stay perfectly aligned. This page explains how synchronization works and patterns for managing multiple time contexts.

## Automatic Synchronization

All time units created from the same pickle automatically synchronize when any unit navigates or when the pickle's date changes.

### Single Pickle Synchronization

```vue
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// All units share the same time context
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// Navigate any unit - all others update automatically
month.future(); // Go to next month

console.log(year.name); // May change if crossing year boundary
console.log(month.name); // "February 2024" (navigated)
console.log(day.name); // "Thursday, February 1, 2024" (updated)
</script>
```

### Cross-Component Synchronization

Time units synchronize across different components:

```vue
<!-- Parent Component -->
<script setup>
import { provide, usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });
provide("timeContext", pickle);
</script>

<template>
  <div>
    <YearNavigator />
    <MonthCalendar />
    <DaySchedule />
  </div>
</template>
```

```vue
<!-- YearNavigator.vue -->
<script setup>
import { inject, useYear } from "usetemporal";

const pickle = inject("timeContext");
const year = useYear(pickle);
</script>

<template>
  <div>
    <button @click="year.past()">{{ year.number - 1 }}</button>
    <span>{{ year.name }}</span>
    <button @click="year.future()">{{ year.number + 1 }}</button>
  </div>
</template>
```

```vue
<!-- MonthCalendar.vue -->
<script setup>
import { inject, useMonth } from "usetemporal";

const pickle = inject("timeContext");
const month = useMonth(pickle);
const days = computed(() => pickle.divide(month, "day"));
</script>

<template>
  <div>
    <h2>{{ month.name }}</h2>
    <!-- Calendar automatically updates when year navigator changes -->
    <div v-for="day in days" :key="day.number">
      {{ day.number }}
    </div>
  </div>
</template>
```

## Multi-Pickle Coordination

Manage multiple independent time contexts that can optionally synchronize:

### Independent Time Contexts

```vue
<script setup>
const leftPickle = usePickle({ date: new Date("2024-01-01") });
const rightPickle = usePickle({ date: new Date("2024-06-01") });

const leftMonth = useMonth(leftPickle);
const rightMonth = useMonth(rightPickle);

// These operate independently
leftMonth.future(); // Only affects left side
rightMonth.past(); // Only affects right side
</script>

<template>
  <div class="dual-calendar">
    <div class="left-calendar">
      <h2>{{ leftMonth.name }}</h2>
      <!-- Left calendar content -->
    </div>

    <div class="right-calendar">
      <h2>{{ rightMonth.name }}</h2>
      <!-- Right calendar content -->
    </div>
  </div>
</template>
```

### Coordinated Multi-Pickle

Synchronize multiple pickles with custom logic:

```vue
<script setup>
const startPickle = usePickle({ date: new Date() });
const endPickle = usePickle({ date: new Date() });

const startMonth = useMonth(startPickle);
const endMonth = useMonth(endPickle);

// Ensure end is always after start
watch(
  () => startPickle.date.value,
  (startDate) => {
    if (startDate >= endPickle.date.value) {
      // Auto-adjust end to be one month after start
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      endPickle.jumpTo(newEndDate);
    }
  }
);

// Ensure start is always before end
watch(
  () => endPickle.date.value,
  (endDate) => {
    if (endDate <= startPickle.date.value) {
      // Auto-adjust start to be one month before end
      const newStartDate = new Date(endDate);
      newStartDate.setMonth(newStartDate.getMonth() - 1);
      startPickle.jumpTo(newStartDate);
    }
  }
);
</script>

<template>
  <div class="date-range-picker">
    <div class="start-date">
      <h3>Start Date</h3>
      <MonthCalendar :pickle="startPickle" />
    </div>

    <div class="end-date">
      <h3>End Date</h3>
      <MonthCalendar :pickle="endPickle" />
    </div>
  </div>
</template>
```

## Synchronization Patterns

### Master-Detail Synchronization

One time unit controls others:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });

// Master: Controls the overall context
const masterYear = useYear(pickle);

// Details: Automatically follow the master
const months = computed(() => pickle.divide(masterYear, "month"));
const currentMonth = useMonth(pickle);
const days = computed(() => pickle.divide(currentMonth, "day"));

// Master navigation affects all details
const navigateToMonth = (month) => {
  pickle.jumpTo(month.raw.value);
};
</script>

<template>
  <div class="master-detail">
    <!-- Master: Year overview -->
    <div class="master">
      <h2>{{ masterYear.name }}</h2>
      <div class="months-grid">
        <button
          v-for="month in months"
          :key="month.number"
          @click="navigateToMonth(month)"
          :class="{ active: month.isSame(currentMonth.raw.value) }"
        >
          {{ month.name }}
        </button>
      </div>
    </div>

    <!-- Detail: Month calendar -->
    <div class="detail">
      <h3>{{ currentMonth.name }}</h3>
      <div class="days-grid">
        <div v-for="day in days" :key="day.number">
          {{ day.number }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### Synchronized Navigation

Keep multiple views in sync during navigation:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });

const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// Synchronized navigation functions
const goToToday = () => {
  pickle.jumpTo(new Date());
};

const goToSpecificDate = (date) => {
  pickle.jumpTo(date);
};

// Breadcrumb navigation
const goToYear = () => {
  // Stay in same year, go to first day
  const yearStart = new Date(year.raw.value.getFullYear(), 0, 1);
  pickle.jumpTo(yearStart);
};

const goToMonth = () => {
  // Stay in same month, go to first day
  const monthStart = new Date(
    month.raw.value.getFullYear(),
    month.raw.value.getMonth(),
    1
  );
  pickle.jumpTo(monthStart);
};
</script>

<template>
  <div class="synchronized-nav">
    <!-- Breadcrumb navigation -->
    <nav class="breadcrumb">
      <button @click="goToYear">{{ year.name }}</button>
      <span> / </span>
      <button @click="goToMonth">{{ month.name }}</button>
      <span> / </span>
      <span>{{ day.name }}</span>
    </nav>

    <!-- Quick navigation -->
    <div class="quick-nav">
      <button @click="goToToday">Today</button>
      <button @click="day.past()">Yesterday</button>
      <button @click="day.future()">Tomorrow</button>
    </div>

    <!-- All views stay synchronized -->
    <YearView :pickle="pickle" />
    <MonthView :pickle="pickle" />
    <DayView :pickle="pickle" />
  </div>
</template>
```

## Advanced Synchronization

### Debounced Synchronization

Prevent excessive updates during rapid navigation:

```vue
<script setup>
import { debounce } from "lodash-es";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Debounced side effect
const debouncedUpdate = debounce((date) => {
  console.log("Updating external systems for:", date);
  updateURL(date);
  fetchData(date);
}, 300);

watch(
  () => pickle.date.value,
  (date) => debouncedUpdate(date)
);
</script>
```

### Selective Synchronization

Control which units synchronize:

```vue
<script setup>
const mainPickle = usePickle({ date: new Date() });
const independentPickle = usePickle({ date: new Date() });

const mainMonth = useMonth(mainPickle);
const independentMonth = useMonth(independentPickle);

// Only sync when user explicitly requests it
const syncMode = ref(false);

watch(
  () => mainPickle.date.value,
  (date) => {
    if (syncMode.value) {
      independentPickle.jumpTo(date);
    }
  }
);
</script>

<template>
  <div>
    <label>
      <input v-model="syncMode" type="checkbox" />
      Sync calendars
    </label>

    <div class="calendars">
      <MonthCalendar :pickle="mainPickle" title="Main Calendar" />
      <MonthCalendar :pickle="independentPickle" title="Independent Calendar" />
    </div>
  </div>
</template>
```

### Time Zone Synchronization

Coordinate time across different time zones:

```vue
<script setup>
const utcPickle = usePickle({ date: new Date() });
const localPickle = usePickle({ date: new Date() });

const utcDay = useDay(utcPickle);
const localDay = useDay(localPickle);

// Keep local time synchronized with UTC
watch(
  () => utcPickle.date.value,
  (utcDate) => {
    // Convert UTC to local time
    const localDate = new Date(utcDate.toLocaleString());
    localPickle.jumpTo(localDate);
  }
);

// Keep UTC synchronized with local time
watch(
  () => localPickle.date.value,
  (localDate) => {
    // Convert local to UTC
    const utcDate = new Date(localDate.toISOString());
    utcPickle.jumpTo(utcDate);
  }
);
</script>

<template>
  <div class="timezone-sync">
    <div class="timezone">
      <h3>UTC Time</h3>
      <p>{{ utcDay.name }}</p>
      <button @click="utcDay.future()">Next Day (UTC)</button>
    </div>

    <div class="timezone">
      <h3>Local Time</h3>
      <p>{{ localDay.name }}</p>
      <button @click="localDay.future()">Next Day (Local)</button>
    </div>
  </div>
</template>
```

## Performance Considerations

### Minimize Unnecessary Updates

```vue
<script setup>
// ✅ Good - only watches what's needed
watch(
  () => month.number,
  (monthNumber) => {
    // Only runs when month actually changes
    updateMonthlyStats(monthNumber);
  }
);

// ❌ Avoid - watches entire date object
watch(
  () => pickle.date.value,
  (date) => {
    // Runs on any date change, even within same month
    updateMonthlyStats(date.getMonth());
  }
);
</script>
```

### Batch Updates

```vue
<script setup>
// ✅ Good - batch multiple updates
const updateDateRange = (startDate, endDate) => {
  startPickle.jumpTo(startDate);
  endPickle.jumpTo(endDate);
  // Both updates happen in same reactive cycle
};

// ❌ Avoid - separate updates cause multiple re-renders
const updateDateRange = (startDate, endDate) => {
  startPickle.jumpTo(startDate);
  // Re-render happens here
  setTimeout(() => {
    endPickle.jumpTo(endDate);
    // Another re-render happens here
  }, 0);
};
</script>
```

## Related Concepts

- **[Reactive Time Management](/concepts/reactivity)** - How synchronization is implemented
- **[Hierarchical Time Units](/concepts/hierarchical-units)** - The foundation for synchronization
- **[Performance Considerations](/concepts/performance)** - Optimizing synchronized applications
