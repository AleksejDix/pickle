# Getting Started

This guide will help you get started with useTemporal in just a few minutes.

## Installation

::: code-group

```bash [npm]
# Install the meta package (includes core + native adapter)
npm install usetemporal

# Or install specific packages
npm install @usetemporal/core @usetemporal/adapter-native
```

```bash [yarn]
yarn add usetemporal
```

```bash [pnpm]
pnpm add usetemporal
```

:::

## Basic Usage

### 1. Create a Temporal Instance

```typescript
import { createTemporal } from "usetemporal";
import { nativeAdapter } from "usetemporal";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // 0 = Sunday, 1 = Monday (default), ..., 6 = Saturday
});
```

### 2. Access Reactive Properties

```typescript
// Reactive date references
temporal.picked.value; // Currently selected date
temporal.now.value; // Current system time
temporal.browsing.value; // Date being browsed
```

### 3. Use Time Unit Periods

```typescript
import { periods } from "usetemporal";

// Create reactive time units
const year = periods.year({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});
const month = periods.month({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});
const day = periods.day({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});

// Access properties
console.log(year.number.value); // 2024
console.log(month.name.value); // "January"
console.log(day.weekDay.value); // 1 (Monday)
```

### 4. Navigate Through Time

```typescript
// Navigate to next/previous periods
month.next(); // Go to next month
month.previous(); // Go to previous month
month.go(3); // Go forward 3 months
month.go(-2); // Go back 2 months

// Check if current
if (month.isNow.value) {
  console.log("This is the current month");
}
```

### 5. Use the Revolutionary divide() Pattern

```typescript
// Divide any time unit into smaller units
const year = periods.year({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});
const months = temporal.divide(year, "month");

// Each month is a fully reactive time unit
months.forEach((month, index) => {
  console.log(`Month ${index + 1}: ${month.name.value}`);

  // Further divide each month into days
  const days = temporal.divide(month, "day");
  console.log(`  Has ${days.length} days`);
});
```

## Complete Example

Here's a complete example showing a simple calendar:

```vue
<template>
  <div class="calendar">
    <div class="header">
      <button @click="month.previous()">←</button>
      <h2>{{ month.name.value }}</h2>
      <button @click="month.next()">→</button>
    </div>

    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.raw.value.getTime()"
        :class="{
          today: day.isNow.value,
          selected: isSame(day.raw.value, temporal.picked.value),
        }"
        @click="temporal.picked.value = day.raw.value"
      >
        {{ day.number.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { createTemporal, periods, nativeAdapter, same } from "usetemporal";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Start week on Monday
});

const month = periods.month({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});
const days = temporal.divide(month, "day");

const isSame = (a, b) => same(a, b, "day", temporal.adapter);
</script>
```

## Framework Examples

### Vue 3

```vue
<script setup>
import { createTemporal, periods, nativeAdapter } from "usetemporal";

const temporal = createTemporal({ dateAdapter: nativeAdapter });
const month = periods.month({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});
</script>

<template>
  <div>{{ month.name.value }}</div>
</template>
```

### React

```tsx
import { createTemporal, periods, nativeAdapter } from "usetemporal";
import { useEffect, useState } from "react";

function Calendar() {
  const [temporal] = useState(() =>
    createTemporal({ dateAdapter: nativeAdapter })
  );
  const [monthName, setMonthName] = useState("");

  useEffect(() => {
    const month = periods.month({
      now: temporal.now,
      browsing: temporal.browsing,
      adapter: temporal.adapter,
    });
    // Subscribe to reactive changes
    const unsubscribe = month.name.subscribe((name) => {
      setMonthName(name);
    });
    return unsubscribe;
  }, [temporal]);

  return <div>{monthName}</div>;
}
```

### Vanilla JavaScript

```javascript
import { createTemporal, periods, nativeAdapter } from "usetemporal";

const temporal = createTemporal({ dateAdapter: nativeAdapter });
const month = periods.month({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
});

// Direct access
console.log(month.name.value);

// Watch for changes
month.name.subscribe((newName) => {
  document.getElementById("month").textContent = newName;
});
```

## Next Steps

- Learn about [Date Adapters](/guide/date-adapters)
- Explore the [divide() Pattern](/guide/divide-pattern)
- See [API Reference](/api/create-temporal)
- Check out [Examples](/examples/basic-usage)
