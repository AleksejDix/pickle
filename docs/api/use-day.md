# useDay()

Creates a reactive day time unit that provides day-level operations and information.

## Syntax

```typescript
useDay(temporal: Temporal, date?: Date): TimeUnit
```

## Parameters

- **temporal** `Temporal` - The temporal instance created by `createTemporal()`
- **date** `Date` _(optional)_ - Initial date. Defaults to current date if not provided

## Returns

`TimeUnit` - A reactive day unit with the following properties:

```typescript
interface TimeUnit {
  name: Ref<string>; // Day name (e.g., "Monday")
  number: Ref<number>; // Day of month (1-31)
  start: Ref<Date>; // Start of day (00:00:00)
  end: Ref<Date>; // End of day (23:59:59)

  past(): void; // Navigate to previous day
  future(): void; // Navigate to next day
  now(): void; // Navigate to current day (today)
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, useDay } from "usetemporal";

const temporal = createTemporal();
const day = useDay(temporal);

console.log(day.name.value); // "Monday"
console.log(day.number.value); // 15 (day of month)
console.log(day.start.value); // Date: 2024-03-15T00:00:00
console.log(day.end.value); // Date: 2024-03-15T23:59:59
```

### Navigation

```typescript
const day = useDay(temporal);

// Navigate through days
day.future(); // Move to tomorrow
console.log(day.name.value); // "Tuesday"

day.past(); // Move to today
day.past(); // Move to yesterday
console.log(day.name.value); // "Sunday"

day.now(); // Return to current day (today)
```

### Day Divisions

```typescript
const day = useDay(temporal);

// Divide day into hours
const hours = temporal.divide(day, "hour");
console.log(hours.length); // 24

// Get business hours (9 AM - 5 PM)
const businessHours = hours.slice(9, 17);

// Divide day into minutes
const minutes = temporal.divide(day, "minute");
console.log(minutes.length); // 1440

// Create 30-minute time slots
const timeSlots = [];
for (let i = 0; i < hours.length; i++) {
  const hour = hours[i];
  const hourMinutes = temporal.divide(hour, "minute");
  timeSlots.push(hourMinutes[0]); // :00
  timeSlots.push(hourMinutes[30]); // :30
}
```

### Cross-Month Navigation

```typescript
// Start at end of month
const temporal = createTemporal();
const day = useDay(temporal, new Date("2024-03-31"));

console.log(day.number.value); // 31
console.log(day.name.value); // "Sunday"

day.future(); // Navigate to next day
console.log(day.number.value); // 1 (April 1st)
// Month automatically updates when crossing boundaries
```

## Use Cases

### Daily Agenda

```typescript
function DailyAgenda() {
  const temporal = createTemporal();
  const day = useDay(temporal);
  const month = useMonth(temporal);
  const year = useYear(temporal);

  const agenda = computed(() => {
    const hours = temporal.divide(day, "hour");

    return {
      date: `${day.name.value}, ${month.name.value} ${day.number.value}, ${year.number.value}`,
      timeSlots: hours.map((hour) => ({
        time: hour.name.value,
        hour: hour.number.value,
        isBusinessHour: hour.number.value >= 9 && hour.number.value < 17,
        isPast: hour.end.value < new Date(),
      })),
    };
  });

  return {
    agenda,
    previousDay: () => day.past(),
    nextDay: () => day.future(),
    today: () => day.now(),
  };
}
```

### Date Picker

```typescript
function DatePicker() {
  const temporal = createTemporal();
  const selectedDay = useDay(temporal);
  const displayMonth = useMonth(temporal);

  const calendarDays = computed(() => {
    const weeks = temporal.divide(displayMonth, "week");
    const days = [];

    weeks.forEach((week) => {
      const weekDays = temporal.divide(week, "day");
      days.push(...weekDays);
    });

    return days.map((day) => ({
      number: day.number.value,
      name: day.name.value,
      isCurrentMonth:
        day.start.value.getMonth() === displayMonth.number.value - 1,
      isSelected:
        day.start.value.toDateString() ===
        selectedDay.start.value.toDateString(),
      isToday: day.start.value.toDateString() === new Date().toDateString(),
    }));
  });

  const selectDay = (dayNumber: number) => {
    // Navigate to specific day in current month
    while (selectedDay.number.value !== dayNumber) {
      if (selectedDay.number.value < dayNumber) {
        selectedDay.future();
      } else {
        selectedDay.past();
      }
    }
  };

  return {
    selectedDate: selectedDay,
    calendarDays,
    selectDay,
  };
}
```

### Working Days Calculator

```typescript
function WorkingDaysCalculator() {
  const temporal = createTemporal();
  const startDay = useDay(temporal);

  const calculateWorkingDays = (numberOfDays: number) => {
    let workingDays = 0;
    const tempDay = useDay(temporal, startDay.start.value);

    for (let i = 0; i < numberOfDays; i++) {
      const dayOfWeek = tempDay.start.value.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      tempDay.future();
    }

    return workingDays;
  };

  const isWeekend = computed(() => {
    const dayOfWeek = startDay.start.value.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  });

  return {
    currentDay: startDay,
    isWeekend,
    calculateWorkingDays,
    nextWorkingDay: () => {
      do {
        startDay.future();
      } while (isWeekend.value);
    },
  };
}
```

## Integration Examples

### Vue 3

```vue
<template>
  <div class="day-view">
    <header>
      <button @click="day.past()">‹</button>
      <div>
        <h2>{{ day.name.value }}</h2>
        <p>{{ formatDate(day.start.value) }}</p>
      </div>
      <button @click="day.future()">›</button>
    </header>

    <div class="hours">
      <div
        v-for="hour in hours"
        :key="hour.start.value"
        :class="{ past: isPastHour(hour) }"
      >
        <span>{{ hour.name.value }}</span>
        <slot :hour="hour" />
      </div>
    </div>

    <button @click="day.now()">Today</button>
  </div>
</template>

<script setup>
import { createTemporal, useDay } from "usetemporal";

const temporal = createTemporal();
const day = useDay(temporal);
const hours = temporal.divide(day, "hour");

const formatDate = (date) => {
  return date.toLocaleDateString("en", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const isPastHour = (hour) => {
  return hour.end.value < new Date();
};
</script>
```

### React

```jsx
import { useState, useEffect } from "react";
import { createTemporal, useDay } from "usetemporal";

function DayScheduler() {
  const [temporal] = useState(() => createTemporal());
  const [day] = useState(() => useDay(temporal));
  const [dayInfo, setDayInfo] = useState({
    name: day.name.value,
    number: day.number.value,
    date: day.start.value,
  });

  useEffect(() => {
    const subscriptions = [
      day.name.subscribe((name) => setDayInfo((prev) => ({ ...prev, name }))),
      day.number.subscribe((number) =>
        setDayInfo((prev) => ({ ...prev, number }))
      ),
      day.start.subscribe((date) => setDayInfo((prev) => ({ ...prev, date }))),
    ];

    return () => subscriptions.forEach((unsub) => unsub());
  }, [day]);

  const hours = temporal.divide(day, "hour");

  return (
    <div>
      <h2>
        {dayInfo.name}, {dayInfo.date.toLocaleDateString()}
      </h2>
      <div>
        <button onClick={() => day.past()}>Previous</button>
        <button onClick={() => day.now()}>Today</button>
        <button onClick={() => day.future()}>Next</button>
      </div>
      <div>
        {hours.slice(8, 18).map((hour) => (
          <div key={hour.start.value.toString()}>{hour.name.value}</div>
        ))}
      </div>
    </div>
  );
}
```

## Day Utilities

```typescript
// Check if day is weekend
function isWeekend(day: TimeUnit): boolean {
  const dayOfWeek = day.start.value.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// Check if day is today
function isToday(day: TimeUnit): boolean {
  const today = new Date();
  return day.start.value.toDateString() === today.toDateString();
}

// Get day of week number (0-6)
function getDayOfWeek(day: TimeUnit): number {
  return day.start.value.getDay();
}

// Format day for display
function formatDay(day: TimeUnit): string {
  return day.start.value.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import type { Temporal, TimeUnit } from "usetemporal";

const temporal: Temporal = createTemporal();
const day: TimeUnit = useDay(temporal);

// Type-safe access
const dayName: string = day.name.value; // "Monday", "Tuesday", etc.
const dayNumber: number = day.number.value; // 1-31
const dayStart: Date = day.start.value;
const dayEnd: Date = day.end.value;

// Methods are typed
day.past(); // void
day.future(); // void
day.now(); // void
```

## Performance Notes

- Day units are lightweight and cached
- Navigation automatically handles month/year boundaries
- Time zone changes are handled by the adapter

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide days into hours or minutes
- [useWeek()](/api/use-week) - Week-level operations
- [useMonth()](/api/use-month) - Month-level operations
- [useHour()](/api/use-hour) - Hour-level operations
