# createTemporal

The main factory function that creates a temporal instance with reactive date management capabilities.

## Syntax

```typescript
function createTemporal(options?: CreateTemporalOptions): Temporal;
```

## Parameters

### options

Type: `CreateTemporalOptions`

Configuration object with the following properties:

#### dateAdapter (required)

- Type: `DateAdapter`
- Description: The date adapter instance to use for date operations

```typescript
import { nativeAdapter } from "@usetemporal/adapter-native";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});
```

#### date

- Type: `Date | Ref<Date>`
- Default: `new Date()`
- Description: Initial date for `picked` and `browsing` values

```typescript
const temporal = createTemporal({
  dateAdapter,
  date: new Date(2024, 0, 15),
});
```

#### now

- Type: `Date | Ref<Date>`
- Default: `new Date()`
- Description: Reference time for "current" calculations

```typescript
const temporal = createTemporal({
  dateAdapter,
  now: ref(new Date()), // Updates reactively
});
```

#### locale

- Type: `string | Ref<string>`
- Default: `'en-US'`
- Description: Locale for date formatting

```typescript
const temporal = createTemporal({
  dateAdapter,
  locale: "fr-FR",
});
```

## Return Value

Returns a `Temporal` object with the following properties:

### Properties

#### picked

- Type: `Ref<Date>`
- Description: The currently selected date

```typescript
temporal.picked.value = new Date(2024, 5, 15);
```

#### now

- Type: `Ref<Date>`
- Description: The current system time reference

```typescript
console.log(temporal.now.value); // Current date/time
```

#### browsing

- Type: `Ref<Date>`
- Description: The date currently being browsed/viewed

```typescript
// Separate browsing from selection
temporal.browsing.value = new Date(2024, 11, 25);
```

#### adapter

- Type: `DateAdapter`
- Description: The date adapter instance being used

```typescript
const startOfMonth = temporal.adapter.startOf(date, "month");
```

### Methods

#### divide()

Subdivides a time unit into smaller units.

```typescript
function divide(unit: TimeUnit, into: TimeUnitType): TimeUnit[];
```

See [divide() API](/api/divide) for detailed documentation.

#### f()

Formats a date using Intl.DateTimeFormat.

```typescript
function f(date: Date, options?: Intl.DateTimeFormatOptions): string;
```

Example:

```typescript
temporal.f(new Date(), { month: "long" }); // "January"
temporal.f(new Date(), { weekday: "short" }); // "Mon"
```

## Examples

### Basic Setup

```typescript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  locale: "en-US",
});
```

### With Reactive Refs

```typescript
import { ref } from "vue";

const selectedDate = ref(new Date());
const currentLocale = ref("en-US");

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: selectedDate, // Will stay in sync
  locale: currentLocale, // Formatting updates on change
});
```

### With Different Adapters

```typescript
// date-fns adapter
import { dateFnsAdapter } from "@usetemporal/adapter-date-fns";

const temporal = createTemporal({
  dateAdapter: dateFnsAdapter,
});

// Luxon adapter
import { luxonAdapter } from "@usetemporal/adapter-luxon";

const temporal = createTemporal({
  dateAdapter: luxonAdapter,
});
```

### Framework Integration

```typescript
// Vue 3 Composition API
export function useCalendar() {
  const temporal = createTemporal({
    dateAdapter: nativeAdapter,
  });

  const month = useMonth(temporal);
  const days = temporal.divide(month, "day");

  return {
    temporal,
    month,
    days,
  };
}

// React Hook
export function useCalendar() {
  const [temporal] = useState(() =>
    createTemporal({ dateAdapter: nativeAdapter })
  );

  return temporal;
}
```

## Type Definitions

```typescript
interface CreateTemporalOptions {
  dateAdapter: DateAdapter;
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  locale?: string | Ref<string>;
}

interface Temporal {
  picked: Ref<Date>;
  now: Ref<Date>;
  browsing: Ref<Date>;
  adapter: DateAdapter;
  divide: (unit: TimeUnit, into: TimeUnitType) => TimeUnit[];
  f: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}
```

## See Also

- [divide()](/api/divide) - The revolutionary subdivision method
- [Date Adapters](/guide/date-adapters) - Available adapter options
- [Composables](/api/use-year) - Time unit composables
