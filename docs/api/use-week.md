# useWeek()

Creates a reactive week time unit that provides week-level operations and information.

## Syntax

```typescript
useWeek(temporal: Temporal, date?: Date): TimeUnit
```

## Parameters

- **temporal** `Temporal` - The temporal instance created by `createTemporal()`
- **date** `Date` _(optional)_ - Initial date. Defaults to current date if not provided

## Returns

`TimeUnit` - A reactive week unit with the following properties:

```typescript
interface TimeUnit {
  name: Ref<string>; // Week identifier (e.g., "Week 12")
  number: Ref<number>; // Week number of the year (1-53)
  start: Ref<Date>; // Start of week (Sunday 00:00:00)
  end: Ref<Date>; // End of week (Saturday 23:59:59)

  past(): void; // Navigate to previous week
  future(): void; // Navigate to next week
  now(): void; // Navigate to current week
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, useWeek } from "usetemporal";

const temporal = createTemporal();
const week = useWeek(temporal);

console.log(week.name.value); // "Week 12"
console.log(week.number.value); // 12
console.log(week.start.value); // Date: Sunday at 00:00:00
console.log(week.end.value); // Date: Saturday at 23:59:59
```

### Navigation

```typescript
const week = useWeek(temporal);

// Navigate through weeks
week.future(); // Move to next week
console.log(week.name.value); // "Week 13"

week.past(); // Move to previous week
week.past(); // Move back another week
console.log(week.name.value); // "Week 11"

week.now(); // Return to current week
```

### Week Divisions

```typescript
const week = useWeek(temporal);

// Divide week into days
const days = temporal.divide(week, "day");
console.log(days.length); // Always 7

days.forEach((day) => {
  console.log(day.name.value); // "Sunday", "Monday", etc.
});

// Get all hours in the week
const hours = temporal.divide(week, "hour");
console.log(hours.length); // 168 (7 * 24)
```

### Cross-Year Navigation

```typescript
// Start at the end of year
const temporal = createTemporal();
const week = useWeek(temporal, new Date("2024-12-30"));

console.log(week.number.value); // 53 (or 1, depending on week calculation)

week.future(); // Navigate to next week
// Automatically handles year transition
```

## Use Cases

### Weekly Planner

```typescript
function WeeklyPlanner() {
  const temporal = createTemporal();
  const week = useWeek(temporal);
  const days = temporal.divide(week, "day");

  const weekData = computed(() => {
    return days.map((day) => ({
      name: day.name.value,
      date: day.number.value,
      isWeekend:
        day.start.value.getDay() === 0 || day.start.value.getDay() === 6,
      tasks: [], // Add your task logic here
    }));
  });

  return {
    weekNumber: week.number,
    weekDays: weekData,
    previousWeek: () => week.past(),
    nextWeek: () => week.future(),
    currentWeek: () => week.now(),
  };
}
```

### Week View Calendar

```typescript
function WeekViewCalendar() {
  const temporal = createTemporal();
  const week = useWeek(temporal);
  const month = useMonth(temporal);
  const year = useYear(temporal);

  const weekDays = computed(() => {
    const days = temporal.divide(week, "day");
    return days.map((day) => {
      const hours = temporal.divide(day, "hour");
      return {
        dayName: day.name.value,
        dayNumber: day.number.value,
        monthName: new Date(day.start.value).toLocaleDateString("en", {
          month: "short",
        }),
        businessHours: hours.slice(9, 17), // 9 AM to 5 PM
      };
    });
  });

  return {
    weekNumber: week.number,
    monthYear: computed(() => `${month.name.value} ${year.number.value}`),
    weekDays,
    navigate: {
      previousWeek: () => week.past(),
      nextWeek: () => week.future(),
      today: () => week.now(),
    },
  };
}
```

### Work Week Calculator

```typescript
function WorkWeekCalculator() {
  const temporal = createTemporal();
  const week = useWeek(temporal);

  const workDays = computed(() => {
    const days = temporal.divide(week, "day");
    // Monday through Friday (days 1-5)
    return days.filter((day) => {
      const dayOfWeek = day.start.value.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    });
  });

  const workHours = computed(() => {
    let totalHours = 0;
    workDays.value.forEach((day) => {
      const hours = temporal.divide(day, "hour");
      // Count hours from 9 AM to 5 PM
      totalHours += hours.slice(9, 17).length;
    });
    return totalHours;
  });

  return {
    weekNumber: week.number,
    workDays: computed(() => workDays.value.length),
    workHours,
    isCurrentWeek: computed(() => {
      const now = new Date();
      return now >= week.start.value && now <= week.end.value;
    }),
  };
}
```

## Integration Examples

### Vue 3

```vue
<template>
  <div class="week-view">
    <header>
      <button @click="week.past()">←</button>
      <h2>{{ week.name.value }} - {{ year.number.value }}</h2>
      <button @click="week.future()">→</button>
      <button @click="week.now()">Today</button>
    </header>

    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.start.value"
        :class="{ weekend: isWeekend(day) }"
      >
        <h3>{{ day.name.value }}</h3>
        <p>{{ formatDate(day.start.value) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createTemporal, useWeek, useYear } from "usetemporal";

const temporal = createTemporal();
const week = useWeek(temporal);
const year = useYear(temporal);
const days = temporal.divide(week, "day");

const isWeekend = (day) => {
  const dayNum = day.start.value.getDay();
  return dayNum === 0 || dayNum === 6;
};

const formatDate = (date) => {
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
};
</script>
```

### React

```jsx
import { useState, useEffect } from "react";
import { createTemporal, useWeek } from "usetemporal";

function WeekNavigator() {
  const [temporal] = useState(() => createTemporal());
  const [week] = useState(() => useWeek(temporal));
  const [weekData, setWeekData] = useState({
    name: week.name.value,
    number: week.number.value,
    start: week.start.value,
    end: week.end.value,
  });

  useEffect(() => {
    const subscriptions = [
      week.name.subscribe((name) => setWeekData((prev) => ({ ...prev, name }))),
      week.number.subscribe((number) =>
        setWeekData((prev) => ({ ...prev, number }))
      ),
      week.start.subscribe((start) =>
        setWeekData((prev) => ({ ...prev, start }))
      ),
      week.end.subscribe((end) => setWeekData((prev) => ({ ...prev, end }))),
    ];

    return () => subscriptions.forEach((unsub) => unsub());
  }, [week]);

  const formatDateRange = () => {
    const start = weekData.start.toLocaleDateString();
    const end = weekData.end.toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div>
      <h2>{weekData.name}</h2>
      <p>{formatDateRange()}</p>
      <button onClick={() => week.past()}>Previous Week</button>
      <button onClick={() => week.future()}>Next Week</button>
      <button onClick={() => week.now()}>Current Week</button>
    </div>
  );
}
```

## Week Configuration

Week start day varies by locale and adapter:

```typescript
// Default: Sunday as first day of week
const temporal = createTemporal();
const week = useWeek(temporal);
console.log(week.start.value.getDay()); // 0 (Sunday)

// With locale that uses Monday as first day
import { luxonAdapter } from "@usetemporal/adapter-luxon";
const temporal = createTemporal({
  adapter: luxonAdapter({ locale: "en-GB" }),
});
const week = useWeek(temporal);
// Week might start on Monday depending on adapter implementation
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import type { Temporal, TimeUnit } from "usetemporal";

const temporal: Temporal = createTemporal();
const week: TimeUnit = useWeek(temporal);

// Type-safe access
const weekName: string = week.name.value;
const weekNumber: number = week.number.value; // 1-53
const weekStart: Date = week.start.value;
const weekEnd: Date = week.end.value;

// Methods are typed
week.past(); // void
week.future(); // void
week.now(); // void
```

## Performance Notes

- Week calculations can vary based on locale and adapter
- Week numbers follow ISO 8601 standard by default
- Weeks may span month and year boundaries

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide weeks into days or hours
- [useMonth()](/api/use-month) - Month-level operations
- [useDay()](/api/use-day) - Day-level operations
