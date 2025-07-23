# useMonth()

Creates a reactive month time unit that provides month-level operations and information.

## Syntax

```typescript
useMonth(temporal: Temporal, date?: Date): TimeUnit
```

## Parameters

- **temporal** `Temporal` - The temporal instance created by `createTemporal()`
- **date** `Date` _(optional)_ - Initial date. Defaults to current date if not provided

## Returns

`TimeUnit` - A reactive month unit with the following properties:

```typescript
interface TimeUnit {
  name: Ref<string>; // Month name (e.g., "March")
  number: Ref<number>; // Month number 1-12 (e.g., 3 for March)
  start: Ref<Date>; // First day of month, 00:00:00
  end: Ref<Date>; // Last day of month, 23:59:59

  past(): void; // Navigate to previous month
  future(): void; // Navigate to next month
  now(): void; // Navigate to current month
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, useMonth } from "usetemporal";

const temporal = createTemporal();
const month = useMonth(temporal);

console.log(month.name.value); // "March"
console.log(month.number.value); // 3
console.log(month.start.value); // Date: 2024-03-01T00:00:00
console.log(month.end.value); // Date: 2024-03-31T23:59:59
```

### Navigation

```typescript
const month = useMonth(temporal);

// Navigate through months
month.future(); // Move to April
console.log(month.name.value); // "April"

month.past(); // Move to March
month.past(); // Move to February
console.log(month.name.value); // "February"

month.now(); // Return to current month
console.log(month.name.value); // "March"
```

### Cross-Year Navigation

```typescript
const temporal = createTemporal();
const month = useMonth(temporal, new Date("2024-12-15"));

console.log(month.name.value); // "December"
console.log(month.number.value); // 12

month.future(); // Navigate to next month
console.log(month.name.value); // "January"
// Note: Year automatically updates when crossing year boundary
```

### Month Divisions

```typescript
const month = useMonth(temporal);

// Divide month into weeks
const weeks = temporal.divide(month, "week");
console.log(weeks.length); // 4-6 (depending on month)

// Divide month into days
const days = temporal.divide(month, "day");
console.log(days.length); // 28-31 (depending on month)

// Get all hours in the month
const hours = temporal.divide(month, "hour");
console.log(hours.length); // 672-744 hours
```

### Reactive Updates

```typescript
import { watchEffect } from "@vue/reactivity";

const temporal = createTemporal();
const month = useMonth(temporal);

// React to month changes
watchEffect(() => {
  console.log(`Current month: ${month.name.value}`);
  console.log(`Days in month: ${month.end.value.getDate()}`);
});

// Navigate and see reactive updates
month.future(); // Triggers watchEffect
```

## Use Cases

### Calendar Component

```typescript
function Calendar() {
  const temporal = createTemporal();
  const month = useMonth(temporal);
  const year = useYear(temporal);

  const calendarGrid = computed(() => {
    const weeks = temporal.divide(month, "week");

    return weeks.map((week) => {
      const days = temporal.divide(week, "day");
      return days.map((day) => ({
        number: day.number.value,
        isCurrentMonth: day.start.value.getMonth() === month.number.value - 1,
        isToday: isSameDay(day.start.value, new Date()),
      }));
    });
  });

  return {
    monthName: month.name,
    yearNumber: year.number,
    grid: calendarGrid,
    previousMonth: () => month.past(),
    nextMonth: () => month.future(),
    goToToday: () => month.now(),
  };
}
```

### Month Picker

```typescript
function MonthPicker() {
  const temporal = createTemporal();
  const currentMonth = useMonth(temporal);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const selectMonth = (monthIndex: number) => {
    const targetMonth = monthIndex + 1;

    while (currentMonth.number.value !== targetMonth) {
      if (currentMonth.number.value < targetMonth) {
        currentMonth.future();
      } else {
        currentMonth.past();
      }
    }
  };

  return {
    months,
    currentMonth: currentMonth.number,
    selectMonth,
  };
}
```

### Monthly Statistics

```typescript
function MonthlyStats() {
  const temporal = createTemporal();
  const month = useMonth(temporal);

  const stats = computed(() => {
    const days = temporal.divide(month, "day");
    const weeks = temporal.divide(month, "week");
    const workDays = days.filter((day) => {
      const dayOfWeek = day.start.value.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6;
    });

    return {
      totalDays: days.length,
      totalWeeks: weeks.length,
      workDays: workDays.length,
      weekendDays: days.length - workDays.length,
    };
  });

  return {
    monthName: month.name,
    stats,
    previousMonth: () => month.past(),
    nextMonth: () => month.future(),
  };
}
```

## Integration Examples

### Vue 3

```vue
<template>
  <div class="month-navigator">
    <button @click="month.past()">‹</button>
    <h2>{{ month.name.value }} {{ year.number.value }}</h2>
    <button @click="month.future()">›</button>

    <div class="month-info">
      <p>Days: {{ daysInMonth }}</p>
      <p>Weeks: {{ weeksInMonth }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { createTemporal, useMonth, useYear } from "usetemporal";

const temporal = createTemporal();
const month = useMonth(temporal);
const year = useYear(temporal);

const daysInMonth = computed(() => {
  return temporal.divide(month, "day").length;
});

const weeksInMonth = computed(() => {
  return temporal.divide(month, "week").length;
});
</script>
```

### React

```jsx
import { useState, useEffect } from "react";
import { createTemporal, useMonth } from "usetemporal";

function MonthDisplay() {
  const [temporal] = useState(() => createTemporal());
  const [month] = useState(() => useMonth(temporal));
  const [monthData, setMonthData] = useState({
    name: month.name.value,
    number: month.number.value,
  });

  useEffect(() => {
    const unsubName = month.name.subscribe((name) => {
      setMonthData((prev) => ({ ...prev, name }));
    });
    const unsubNumber = month.number.subscribe((number) => {
      setMonthData((prev) => ({ ...prev, number }));
    });

    return () => {
      unsubName();
      unsubNumber();
    };
  }, [month]);

  return (
    <div>
      <button onClick={() => month.past()}>Previous</button>
      <span>
        {monthData.name} (Month {monthData.number})
      </span>
      <button onClick={() => month.future()}>Next</button>
    </div>
  );
}
```

## Localization

Month names can be localized using date adapters:

```typescript
import { dateFnsAdapter } from "@usetemporal/adapter-date-fns";
import { fr } from "date-fns/locale";

const temporal = createTemporal({
  adapter: dateFnsAdapter({ locale: fr }),
});

const month = useMonth(temporal);
console.log(month.name.value); // "mars" (French for March)
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import type { Temporal, TimeUnit } from "usetemporal";

const temporal: Temporal = createTemporal();
const month: TimeUnit = useMonth(temporal);

// Type-safe access
const monthName: string = month.name.value;
const monthNumber: number = month.number.value; // 1-12
const monthStart: Date = month.start.value;
const monthEnd: Date = month.end.value;

// Methods are typed
month.past(); // void
month.future(); // void
month.now(); // void
```

## Performance Notes

- Month units are cached per temporal instance
- Navigation across year boundaries is handled automatically
- Month names are computed based on the adapter's locale settings

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide months into smaller units
- [useYear()](/api/use-year) - Year-level operations
- [useWeek()](/api/use-week) - Week-level operations
- [useDay()](/api/use-day) - Day-level operations
