# Basic Usage Examples

## Simple Calendar

```typescript
import { createTemporal, useMonth, nativeAdapter } from "usetemporal";

// Create temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});

// Get current month
const month = useMonth(temporal);

// Divide month into days
const days = temporal.divide(month, "day");

// Display calendar
console.log(`${month.name.value} ${month.raw.value.getFullYear()}`);
days.forEach((day) => {
  console.log(`Day ${day.number.value}: ${day.name.value}`);
});
```

## Date Navigation

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const month = useMonth(temporal);

// Navigate through months
month.future(); // Next month
month.past(); // Previous month

// Check if current month
if (month.isNow.value) {
  console.log("This is the current month");
}
```

## Year Overview

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = useYear(temporal);

// Get all months in the year
const months = temporal.divide(year, "month");

// Create year summary
months.forEach((month) => {
  const days = temporal.divide(month, "day");
  console.log(`${month.name.value}: ${days.length} days`);
});
```

## Week View

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const week = useWeek(temporal);

// Get all days in the week
const days = temporal.divide(week, "day");

// Display week
console.log(`Week starting ${week.start.value.toDateString()}`);
days.forEach((day) => {
  console.log(`  ${day.name.value} - ${day.isNow.value ? "TODAY" : ""}`);
});
```

## Time Picker

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const day = useDay(temporal);

// Get all hours in the day
const hours = temporal.divide(day, "hour");

// Create time slots (every 30 minutes)
const timeSlots = [];
hours.forEach((hour) => {
  timeSlots.push(`${hour.number.value}:00`);
  timeSlots.push(`${hour.number.value}:30`);
});
```

## Minute-Level Precision

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const minute = useMinute(temporal);

console.log(minute.name.value); // "3:45 PM"
console.log(minute.number.value); // 45

// Navigate by minutes
minute.future(); // Next minute
minute.past(); // Previous minute

// Get all minutes in an hour
const hour = useHour(temporal);
const minutes = temporal.divide(hour, "minute"); // 60 minutes
```

## Second-Level Precision

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
const second = useSecond(temporal);

console.log(second.name.value); // "3:45:30 PM"
console.log(second.number.value); // 30

// Navigate by seconds
second.future(); // Next second
second.past(); // Previous second

// Perfect for stopwatches or precise timing
const minute = useMinute(temporal);
const seconds = temporal.divide(minute, "second"); // 60 seconds
```

## Quarterly Calendar

```typescript
// Create temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});

const quarter = useQuarter(temporal);
console.log(`Current Quarter: ${quarter.name.value}`);

// Navigate quarters
quarter.future(); // Next quarter
quarter.past(); // Previous quarter

// Get all quarters in a year
const year = useYear(temporal);
const quarters = temporal.divide(year, "quarter");
```

## Multi-Language Support

```typescript
import { ref } from "vue";

// Reactive locale
const locale = ref("en-US");

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  locale, // Will update when locale changes
});

const month = useMonth(temporal);

// Display in current locale
console.log(month.name.value); // "January"

// Change locale
locale.value = "fr-FR";
console.log(month.name.value); // "janvier"
```

## Date Comparison

```typescript
import { same } from "usetemporal";

const temporal = createTemporal({ dateAdapter: nativeAdapter });

const date1 = new Date(2024, 0, 15);
const date2 = new Date(2024, 0, 15);
const date3 = new Date(2024, 0, 16);

// Check if same day
if (same(date1, date2, "day", temporal.adapter)) {
  console.log("Same day!");
}

// Check if same month
if (same(date1, date3, "month", temporal.adapter)) {
  console.log("Same month!");
}
```

## Generate Date Ranges

```typescript
import { each } from "usetemporal";

const temporal = createTemporal({ dateAdapter: nativeAdapter });

// Generate all days in January
const january = each({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 0, 31),
  step: { days: 1 },
  adapter: temporal.adapter,
});

// Generate every Monday in 2024
const year2024 = each({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 11, 31),
  step: { weeks: 1 },
  adapter: temporal.adapter,
}).filter((date) => date.getDay() === 1);
```

## Reactive Calendar Component

```vue
<template>
  <div class="calendar">
    <header>
      <button @click="month.past()">←</button>
      <h2>{{ month.name.value }} {{ year.number.value }}</h2>
      <button @click="month.future()">→</button>
    </header>

    <div class="weekdays">
      <div v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>

    <div class="days">
      <div
        v-for="day in paddedDays"
        :key="day?.raw.value?.getTime() || Math.random()"
        :class="{
          today: day?.isNow.value,
          selected: day && isSameDay(day.raw.value, temporal.picked.value),
          'other-month': !day,
        }"
        @click="day && selectDate(day.raw.value)"
      >
        {{ day?.number.value || "" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  createTemporal,
  useYear,
  useMonth,
  nativeAdapter,
  same,
} from "usetemporal";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});

const year = useYear(temporal);
const month = useMonth(temporal);
const days = computed(() => temporal.divide(month, "day"));

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Pad days for calendar grid
const paddedDays = computed(() => {
  const firstDay = days.value[0];
  const startPadding = firstDay.weekDay.value;

  const padded = [];
  for (let i = 0; i < startPadding; i++) {
    padded.push(null);
  }

  return [...padded, ...days.value];
});

const isSameDay = (a, b) => same(a, b, "day", temporal.adapter);

const selectDate = (date) => {
  temporal.picked.value = date;
};
</script>
```

These examples demonstrate the core features of useTemporal including the revolutionary divide() pattern, reactive time units, and framework-agnostic design.
