# useYear()

Creates a reactive year time unit that provides year-level operations and information.

## Syntax

```typescript
useYear(temporal: Temporal, date?: Date): TimeUnit
```

## Parameters

- **temporal** `Temporal` - The temporal instance created by `createTemporal()`
- **date** `Date` _(optional)_ - Initial date. Defaults to current date if not provided

## Returns

`TimeUnit` - A reactive year unit with the following properties:

```typescript
interface TimeUnit {
  name: Ref<string>; // Year as string (e.g., "2024")
  number: Ref<number>; // Year as number (e.g., 2024)
  start: Ref<Date>; // January 1st, 00:00:00
  end: Ref<Date>; // December 31st, 23:59:59

  past(): void; // Navigate to previous year
  future(): void; // Navigate to next year
  now(): void; // Navigate to current year
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, useYear } from "usetemporal";

const temporal = createTemporal();
const year = useYear(temporal);

console.log(year.name.value); // "2024"
console.log(year.number.value); // 2024
console.log(year.start.value); // Date: 2024-01-01T00:00:00
console.log(year.end.value); // Date: 2024-12-31T23:59:59
```

### Navigation

```typescript
const year = useYear(temporal);

// Navigate through years
year.future(); // Move to 2025
console.log(year.name.value); // "2025"

year.past(); // Move to 2024
year.past(); // Move to 2023
console.log(year.name.value); // "2023"

year.now(); // Return to current year
console.log(year.name.value); // "2024"
```

### With Initial Date

```typescript
// Start from a specific date
const historicalDate = new Date("1969-07-20"); // Moon landing
const year = useYear(temporal, historicalDate);

console.log(year.name.value); // "1969"
console.log(year.number.value); // 1969
```

### Reactive Updates

```typescript
import { watchEffect } from "@vue/reactivity";

const temporal = createTemporal();
const year = useYear(temporal);

// React to year changes
watchEffect(() => {
  console.log(`Current year: ${year.name.value}`);
  updateYearDisplay(year.number.value);
});

// Trigger reactive updates
year.future(); // Logs: "Current year: 2025"
```

### Year Divisions

```typescript
const year = useYear(temporal);

// Divide year into months
const months = temporal.divide(year, "month");
console.log(months.length); // 12

// Divide year into quarters
const quarters = temporal.divide(year, "quarter");
console.log(quarters.length); // 4

// Divide year into weeks
const weeks = temporal.divide(year, "week");
console.log(weeks.length); // 52 or 53

// Get all days in the year
const days = temporal.divide(year, "day");
console.log(days.length); // 365 or 366 (leap year)
```

## Use Cases

### Year Picker

```typescript
function YearPicker() {
  const temporal = createTemporal();
  const year = useYear(temporal);

  // Generate year options
  const yearOptions = computed(() => {
    const current = year.number.value;
    return Array.from({ length: 10 }, (_, i) => current - 5 + i);
  });

  return {
    currentYear: year.name,
    yearOptions,
    selectYear: (y) => {
      while (year.number.value !== y) {
        if (year.number.value < y) {
          year.future();
        } else {
          year.past();
        }
      }
    },
  };
}
```

### Annual Report

```typescript
function AnnualReport() {
  const temporal = createTemporal();
  const year = useYear(temporal);
  const months = temporal.divide(year, "month");

  const monthlyData = computed(() => {
    return months.map((month) => ({
      name: month.name.value,
      days: temporal.divide(month, "day").length,
      // ... fetch data for each month
    }));
  });

  return {
    year: year.name,
    monthlyData,
    previousYear: () => year.past(),
    nextYear: () => year.future(),
  };
}
```

### Leap Year Detection

```typescript
function isLeapYear(temporal) {
  const year = useYear(temporal);
  const days = temporal.divide(year, "day");

  return computed(() => days.length === 366);
}
```

## Integration Examples

### Vue 3

```vue
<template>
  <div class="year-selector">
    <button @click="year.past()">←</button>
    <h1>{{ year.name.value }}</h1>
    <button @click="year.future()">→</button>

    <p>{{ isLeapYear ? "Leap year" : "Regular year" }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { createTemporal, useYear } from "usetemporal";

const temporal = createTemporal();
const year = useYear(temporal);

const isLeapYear = computed(() => {
  const days = temporal.divide(year, "day");
  return days.length === 366;
});
</script>
```

### React

```jsx
import { useState, useEffect } from "react";
import { createTemporal, useYear } from "usetemporal";

function YearDisplay() {
  const [temporal] = useState(() => createTemporal());
  const [year] = useState(() => useYear(temporal));
  const [yearName, setYearName] = useState(year.name.value);

  useEffect(() => {
    const unsubscribe = year.name.subscribe(setYearName);
    return unsubscribe;
  }, [year]);

  return (
    <div>
      <button onClick={() => year.past()}>Previous</button>
      <span>{yearName}</span>
      <button onClick={() => year.future()}>Next</button>
      <button onClick={() => year.now()}>Today</button>
    </div>
  );
}
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import type { Temporal, TimeUnit } from "usetemporal";

const temporal: Temporal = createTemporal();
const year: TimeUnit = useYear(temporal);

// Type-safe access
const yearName: string = year.name.value;
const yearNumber: number = year.number.value;
const yearStart: Date = year.start.value;
const yearEnd: Date = year.end.value;

// Methods are typed
year.past(); // void
year.future(); // void
year.now(); // void
```

## Performance Notes

- Year units are cached per temporal instance
- Navigation is optimized to update all reactive properties in a single batch
- Subscriptions should be cleaned up to prevent memory leaks

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide years into smaller units
- [useMonth()](/api/use-month) - Month-level operations
- [useQuarter()](/api/use-quarter) - Quarter-level operations
