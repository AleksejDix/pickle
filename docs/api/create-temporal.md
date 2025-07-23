# createTemporal

The `createTemporal` function is the main entry point for creating a temporal instance. It initializes the core temporal system with your chosen date adapter and configuration options.

## Syntax

```typescript
createTemporal(options?: CreateTemporalOptions): TemporalCore
```

## Parameters

### `options` (optional)

An object containing configuration options for the temporal instance.

#### `options.dateAdapter` (required)

- **Type**: `DateAdapter`
- **Description**: The date adapter to use for date operations. Must be one of the available adapters from `@usetemporal/adapter-*` packages.

```javascript
import { nativeAdapter } from "@usetemporal/adapter-native";
import { luxonAdapter } from "@usetemporal/adapter-luxon";
import { dateFnsAdapter } from "@usetemporal/adapter-date-fns";
import { temporalAdapter } from "@usetemporal/adapter-temporal";

// Choose one adapter
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});
```

#### `options.date` (optional)

- **Type**: `Date | Ref<Date>`
- **Default**: `new Date()`
- **Description**: The initial date for browsing/picking. Can be a Date object or a Vue ref containing a Date.

```javascript
// Static date
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: new Date(2024, 2, 14), // March 14, 2024
});

// Reactive date
import { ref } from "@vue/reactivity";
const currentDate = ref(new Date());
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: currentDate,
});
```

#### `options.now` (optional)

- **Type**: `Date | Ref<Date>`
- **Default**: `new Date()`
- **Description**: The reference point for "current time". Useful for testing or creating static demos.

```javascript
// Fixed "now" for testing
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  now: new Date(2024, 2, 14, 12, 0, 0), // Fixed time
});

// Dynamic "now" that updates
const nowRef = ref(new Date());
setInterval(() => {
  nowRef.value = new Date();
}, 1000);

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  now: nowRef,
});
```

#### `options.weekStartsOn` (optional)

- **Type**: `number`
- **Default**: `1` (Monday)
- **Range**: `0-6` where 0 = Sunday, 1 = Monday, ..., 6 = Saturday
- **Description**: Configures which day of the week is considered the first day.

```javascript
// US convention: week starts on Sunday
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 0,
});

// ISO standard: week starts on Monday (default)
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1,
});

// Middle East: week starts on Saturday
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 6,
});
```

## Return Value

Returns a `TemporalCore` object with the following properties and methods:

### `browsing`

- **Type**: `Ref<Date>`
- **Description**: Reactive reference to the current browsing date. This is the date used for navigation and display.

```javascript
const temporal = createTemporal({ dateAdapter: nativeAdapter });
console.log(temporal.browsing.value); // Current date

// Navigate to a different date
temporal.browsing.value = new Date(2024, 11, 25); // Christmas 2024
```

### `picked`

- **Type**: `Ref<Date>`
- **Description**: Reactive reference to the selected/picked date. This represents the user's selection.

```javascript
const temporal = createTemporal({ dateAdapter: nativeAdapter });

// Set picked date
temporal.picked.value = new Date(2024, 2, 14);

// Watch for changes
watch(
  () => temporal.picked.value,
  (newDate) => {
    console.log("User selected:", newDate);
  }
);
```

### `now`

- **Type**: `Ref<Date>`
- **Description**: Reactive reference to the current time. Updates automatically if a reactive ref was provided.

```javascript
const temporal = createTemporal({ dateAdapter: nativeAdapter });

// Check current time
console.log(temporal.now.value);

// Use in reactive computations
const isToday = computed(() => {
  const now = temporal.now.value;
  const browsing = temporal.browsing.value;
  return adapter.isSame(now, browsing, "day");
});
```

### `adapter`

- **Type**: `DateAdapter`
- **Description**: The date adapter instance being used. Provides access to adapter-specific functionality.

```javascript
const temporal = createTemporal({ dateAdapter: nativeAdapter });

// Use adapter methods directly
const formatted = temporal.adapter.format(temporal.now.value, "YYYY-MM-DD");
const nextMonth = temporal.adapter.add(temporal.browsing.value, { months: 1 });
```

### `weekStartsOn`

- **Type**: `number`
- **Description**: The configured first day of the week (0-6).

```javascript
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 0, // Sunday
});

console.log(temporal.weekStartsOn); // 0
```

### `divide(interval, unit)`

- **Type**: `(interval: TimeUnit, unit: DivideUnit) => TimeUnit[]`
- **Description**: Divides a time unit into smaller units. See [divide() documentation](/api/divide) for details.

```javascript
const month = temporal.periods.month(temporal);
const days = temporal.divide(month, "day"); // Array of day units
```

### `periods`

- **Type**: `Periods`
- **Description**: Object containing factory functions for creating time units. See [periods documentation](/api/periods) for details.

```javascript
const year = temporal.periods.year(temporal);
const month = temporal.periods.month(temporal);
const week = temporal.periods.week(temporal);
const day = temporal.periods.day(temporal);
```

## Examples

### Basic Usage

```javascript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Create a simple temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});

// Access current time
console.log(temporal.now.value);

// Get current month
const month = temporal.periods.month(temporal);
console.log(month.name); // "March"
```

### With Vue 3

```vue
<script setup>
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";
import { provide } from "vue";

// Create and provide temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

provide("temporal", temporal);

// Use in template
const currentMonth = temporal.periods.month(temporal);
</script>

<template>
  <div>
    <h1>{{ currentMonth.name }} {{ currentMonth.year }}</h1>
  </div>
</template>
```

### With React

```jsx
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";
import { createContext, useContext } from "react";

// Create context
const TemporalContext = createContext();

// Provider component
export function TemporalProvider({ children }) {
  const temporal = createTemporal({
    dateAdapter: nativeAdapter,
    weekStartsOn: 0, // Sunday for US
  });

  return (
    <TemporalContext.Provider value={temporal}>
      {children}
    </TemporalContext.Provider>
  );
}

// Hook to use temporal
export function useTemporal() {
  return useContext(TemporalContext);
}
```

### Advanced Configuration

```javascript
import { createTemporal } from "@usetemporal/core";
import { luxonAdapter } from "@usetemporal/adapter-luxon";
import { ref } from "@vue/reactivity";

// Create a controlled temporal instance
const selectedDate = ref(new Date(2024, 2, 14));
const currentTime = ref(new Date());

// Update current time every second
setInterval(() => {
  currentTime.value = new Date();
}, 1000);

const temporal = createTemporal({
  dateAdapter: luxonAdapter,
  date: selectedDate, // Controlled selected date
  now: currentTime, // Live updating current time
  weekStartsOn: 1, // ISO week (Monday)
});

// Watch for date changes
watch(
  () => selectedDate.value,
  (newDate) => {
    console.log("Date changed to:", newDate);
  }
);
```

### Testing with Fixed Time

```javascript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Create temporal with fixed time for testing
const fixedDate = new Date(2024, 2, 14, 12, 0, 0);

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: fixedDate,
  now: fixedDate, // Both browsing and "now" are fixed
});

// All time-based calculations will use the fixed date
const today = temporal.periods.day(temporal);
console.log(today.isNow); // Always true for March 14, 2024
```

## Error Handling

The function will throw an error if no date adapter is provided:

```javascript
try {
  const temporal = createTemporal(); // Error!
} catch (error) {
  console.error(error.message);
  // "A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages."
}

// Correct usage
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { TemporalCore } from "@usetemporal/core";

// Type is inferred
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1,
});

// Explicit typing
const typedTemporal: TemporalCore = createTemporal({
  dateAdapter: nativeAdapter,
});

// With refs
import { ref, type Ref } from "@vue/reactivity";

const dateRef: Ref<Date> = ref(new Date());
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: dateRef, // Accepts Ref<Date>
});
```

### Type Definitions

```typescript
interface CreateTemporalOptions {
  dateAdapter: DateAdapter;
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  weekStartsOn?: number; // 0-6
}

interface TemporalCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  adapter: DateAdapter;
  weekStartsOn: number;
  divide: (interval: TimeUnit, unit: DivideUnit) => TimeUnit[];
  periods: Periods;
}
```

## See Also

- [divide() Method](/api/divide) - Learn about dividing time units
- [periods Object](/api/periods) - Create time unit instances
- [Date Adapters](/api/adapters) - Available date adapter options
- [Time Unit Reference](/api/time-unit-reference) - Properties and methods of time units
- [Getting Started Guide](/guide/getting-started) - Step-by-step tutorial
