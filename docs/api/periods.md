# periods

The `periods` object provides factory methods for creating all time unit instances. This is the unified API for creating reactive time units in useTemporal.

## Syntax

```typescript
import { periods } from "usetemporal";

// Create time units
const year = periods.year(options);
const month = periods.month(options);
const week = periods.week(options);
const day = periods.day(options);
const hour = periods.hour(options);
const minute = periods.minute(options);
const second = periods.second(options);
const quarter = periods.quarter(options);
```

## Options

All period methods accept the same options object:

```typescript
interface PeriodOptions {
  temporal: Temporal; // Required: The temporal instance
  date?: Date; // Optional: Initial date (defaults to current date)
}
```

## Available Methods

### periods.year()

Creates a reactive year time unit.

```typescript
const year = periods.year({ temporal });
// or with initial date
const year = periods.year({ temporal, date: new Date(2023, 0, 1) });
```

See [Year Time Unit](#year-time-unit) for details.

### periods.month()

Creates a reactive month time unit.

```typescript
const month = periods.month({ temporal });
```

See [Month Time Unit](#month-time-unit) for details.

### periods.week()

Creates a reactive week time unit.

```typescript
const week = periods.week({ temporal });
```

See [Week Time Unit](#week-time-unit) for details.

### periods.day()

Creates a reactive day time unit.

```typescript
const day = periods.day({ temporal });
```

See [Day Time Unit](#day-time-unit) for details.

### periods.hour()

Creates a reactive hour time unit.

```typescript
const hour = periods.hour({ temporal });
```

See [Hour Time Unit](#hour-time-unit) for details.

### periods.minute()

Creates a reactive minute time unit.

```typescript
const minute = periods.minute({ temporal });
```

See [Minute Time Unit](#minute-time-unit) for details.

### periods.second()

Creates a reactive second time unit.

```typescript
const second = periods.second({ temporal });
```

See [Second Time Unit](#second-time-unit) for details.

### periods.quarter()

Creates a reactive quarter time unit.

```typescript
const quarter = periods.quarter({ temporal });
```

See [Quarter Time Unit](#quarter-time-unit) for details.

## Time Unit Structure

All time units created by `periods` methods share the same structure:

```typescript
interface TimeUnit {
  // Reactive properties
  name: Ref<string>; // Human-readable name
  number: Ref<number>; // Numeric value
  start: Ref<Date>; // Start of period
  end: Ref<Date>; // End of period

  // Navigation methods
  past(): void; // Go to previous period
  future(): void; // Go to next period
  now(): void; // Go to current period

  // Additional properties
  raw: Ref<Date>; // Raw date value
  isNow: Ref<boolean>; // Is current period
  weekDay?: Ref<number>; // Day of week (0-6) for day units
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, periods, nativeAdapter } from "usetemporal";

// Create temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});

// Create time units
const year = periods.year({ temporal });
const month = periods.month({ temporal });
const day = periods.day({ temporal });

// Access reactive values
console.log(year.name.value); // "2024"
console.log(month.name.value); // "March"
console.log(day.number.value); // 15
```

### Navigation

```typescript
const month = periods.month({ temporal });

// Navigate through time
month.future(); // Next month
month.past(); // Previous month
month.now(); // Current month

// Check if current
if (month.isNow.value) {
  console.log("This is the current month");
}
```

### With Initial Date

```typescript
// Start from specific date
const pastDate = new Date(2020, 5, 15);

const year = periods.year({ temporal, date: pastDate });
const month = periods.month({ temporal, date: pastDate });

console.log(year.name.value); // "2020"
console.log(month.name.value); // "June"
```

### Synchronized Time Units

When using the same temporal instance, all time units stay synchronized:

```typescript
const temporal = createTemporal({ dateAdapter: nativeAdapter });

const year = periods.year({ temporal });
const month = periods.month({ temporal });
const day = periods.day({ temporal });

// Navigate day across month boundary
day.future(); // If at end of month, month and year update automatically
```

### With divide() Pattern

The periods API works seamlessly with the divide pattern:

```typescript
const year = periods.year({ temporal });
const months = temporal.divide(year, "month");

const month = periods.month({ temporal });
const days = temporal.divide(month, "day");
```

## Time Unit Details

### Year Time Unit

```typescript
const year = periods.year({ temporal });

year.name.value; // "2024"
year.number.value; // 2024
year.start.value; // Jan 1, 2024 00:00:00
year.end.value; // Dec 31, 2024 23:59:59
```

### Month Time Unit

```typescript
const month = periods.month({ temporal });

month.name.value; // "March"
month.number.value; // 3 (1-based)
month.start.value; // Mar 1, 2024 00:00:00
month.end.value; // Mar 31, 2024 23:59:59
```

### Week Time Unit

```typescript
const week = periods.week({ temporal });

week.name.value; // "Week 12"
week.number.value; // 12 (week of year)
week.start.value; // Sunday 00:00:00
week.end.value; // Saturday 23:59:59
```

### Day Time Unit

```typescript
const day = periods.day({ temporal });

day.name.value; // "Monday"
day.number.value; // 15 (day of month)
day.weekDay.value; // 1 (0=Sunday, 6=Saturday)
day.start.value; // Mar 15, 2024 00:00:00
day.end.value; // Mar 15, 2024 23:59:59
```

### Hour Time Unit

```typescript
const hour = periods.hour({ temporal });

hour.name.value; // "3 PM"
hour.number.value; // 15 (24-hour format)
hour.start.value; // Mar 15, 2024 15:00:00
hour.end.value; // Mar 15, 2024 15:59:59
```

### Minute Time Unit

```typescript
const minute = periods.minute({ temporal });

minute.name.value; // "3:45 PM"
minute.number.value; // 45
minute.start.value; // Mar 15, 2024 15:45:00
minute.end.value; // Mar 15, 2024 15:45:59
```

### Second Time Unit

```typescript
const second = periods.second({ temporal });

second.name.value; // "3:45:30 PM"
second.number.value; // 30
second.start.value; // Mar 15, 2024 15:45:30
second.end.value; // Mar 15, 2024 15:45:30
```

### Quarter Time Unit

```typescript
const quarter = periods.quarter({ temporal });

quarter.name.value; // "Q1"
quarter.number.value; // 1 (1-4)
quarter.start.value; // Jan 1, 2024 00:00:00
quarter.end.value; // Mar 31, 2024 23:59:59
```

## TypeScript

Full type safety is provided:

```typescript
import type { Temporal, TimeUnit, PeriodOptions } from "usetemporal";

// Options are typed
const options: PeriodOptions = {
  temporal,
  date: new Date(),
};

// Return types are inferred
const year: TimeUnit = periods.year(options);
const month: TimeUnit = periods.month(options);

// All properties are typed
const yearName: string = year.name.value;
const monthNumber: number = month.number.value;
```

## Migration from Individual Imports

The `periods` API replaces individual composable imports:

```typescript
// Old API (deprecated)
import { useYear, useMonth, useDay } from "usetemporal";
const year = useYear(temporal);
const month = useMonth(temporal);

// New API
import { periods } from "usetemporal";
const year = periods.year({ temporal });
const month = periods.month({ temporal });
```

## Best Practices

1. **Use a single temporal instance** for all related time units
2. **Pass initial dates** when you need to start from a specific time
3. **Leverage reactivity** - values update automatically
4. **Clean up subscriptions** when watching reactive values
5. **Use with divide()** for hierarchical time management

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide time units into smaller units
- [Reactive Time Units](/guide/reactive-time-units) - Understanding reactivity
- [Framework Integration](/guide/framework-agnostic) - Using with frameworks
