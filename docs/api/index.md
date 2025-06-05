# API Reference

Complete reference for all useTemporal composables and types.

## Core Composables

### usePickle(options)

The foundation composable that provides the revolutionary `divide()` pattern.

```typescript
function usePickle(options: UsePickleOptions): PickleCore;
```

**Parameters:**

- `options.date` - Date | Ref\<Date> - The working date
- `options.now` - Date | Ref\<Date> - Reference point for "current" calculations
- `options.locale` - string | Ref\<string> - Locale for date formatting (optional)

**Returns:** `PickleCore`

- `browsing` - Ref\<Date> - Current browsing date
- `picked` - Ref\<Date> - Selected/picked date
- `now` - Ref\<Date> - Reference "now" date
- `divide()` - Function to subdivide time units
- `f()` - Internationalized date formatter

**Example:**

```typescript
const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

// Divide a year into months
const months = pickle.divide(year, "month");
```

## Time Unit Composables

All time unit composables follow the same pattern and implement the `TimeUnit` interface.

### useYear(options)

```typescript
function useYear(options: UseTimeUnitOptions): TimeUnit;
```

**Returns:** Year time unit with 12-month division capability.

### useMonth(options)

```typescript
function useMonth(options: UseTimeUnitOptions): ExtendedTimeUnit;
```

**Returns:** Month time unit with day division capability.

- Additional: `weekDay` - ComputedRef\<number> - First day of month's weekday

### useWeek(options)

```typescript
function useWeek(options: UseTimeUnitOptions): ExtendedTimeUnit;
```

**Returns:** Week time unit with day division capability.

### useDay(options)

```typescript
function useDay(options: UseTimeUnitOptions): ExtendedTimeUnit;
```

**Returns:** Day time unit with hour division capability.

- Additional: `we` - ComputedRef\<boolean> - Whether day is weekend

### useHour(options)

```typescript
function useHour(options: UseTimeUnitOptions): ExtendedTimeUnit;
```

**Returns:** Hour time unit with minute division capability.

### useMinute(options)

```typescript
function useMinute(options: UseTimeUnitOptions): TimeUnit;
```

**Returns:** Minute time unit (smallest division).

## Advanced Composables

### useDatePicker(options)

Full-featured date picker functionality with event support.

```typescript
function useDatePicker(options: UseDatePickerOptions): DatePickerInstance;
```

**Parameters:**

- `options.selected` - Date | Ref\<Date> - Selected date
- `options.weekStartsOn` - number - Week start day (0 = Sunday, 1 = Monday)
- `options.events` - Event[] - Array of events to display

**Returns:** Complete date picker instance with all time units and navigation.

### useTimeBox(options)

Advanced functional time manipulation with scheduling support.

```typescript
function useTimeBox(options: TimeBoxOptions): TimeBoxInstance;
```

**Parameters:**

- `options.now` - Date | Ref\<Date> - Reference date
- `options.locale` - string | Ref\<string> - Locale for formatting

**Returns:** Functional time manipulation utilities.

## TypeScript Interfaces

### TimeUnit

Base interface for all time units:

```typescript
interface TimeUnit {
  raw: ComputedRef<Date>; // The actual Date object
  timespan: ComputedRef<TimeSpan>; // Start and end of period
  isNow: ComputedRef<boolean>; // Whether this contains "now"
  number: ComputedRef<number>; // Numeric representation
  name: ComputedRef<string>; // Human-readable name
  browsing: Ref<Date>; // Current browsing date
  future: () => void; // Navigate forward
  past: () => void; // Navigate backward
  isSame: (a: Date, b: Date) => boolean; // Compare dates
}
```

### ExtendedTimeUnit

Extended interface with additional properties:

```typescript
interface ExtendedTimeUnit extends TimeUnit {
  weekDay?: ComputedRef<number>; // Day of week (month start)
  format?: (date: Date) => number | string; // Custom formatter
  we?: ComputedRef<boolean>; // Weekend indicator (days)
}
```

### TimeSpan

Time period definition:

```typescript
interface TimeSpan {
  start: Date; // Period start
  end: Date; // Period end
}
```

### Event

Event structure for calendar integration:

```typescript
interface Event {
  title: string; // Event title
  timespan: TimeSpan; // Event duration
  data?: any; // Additional event data
}
```

### PickleCore

Core functionality returned by `usePickle`:

```typescript
interface PickleCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  divide: (interval: TimeUnit, unit: TimeUnitType) => TimeUnit[];
  f: (date: Date, options: Intl.DateTimeFormatOptions) => string;
}
```

## Time Unit Types

Supported time unit types for the `divide()` function:

```typescript
type TimeUnitType =
  | "millennium"
  | "century"
  | "decade"
  | "year"
  | "yearQuarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "hourQuarter"
  | "minute";
```

## Division Matrix

| Parent Unit  | Supported Divisions           |
| ------------ | ----------------------------- |
| `millennium` | century, decade, year         |
| `century`    | decade, year                  |
| `decade`     | year                          |
| `year`       | yearQuarter, month, week, day |
| `month`      | week, day                     |
| `week`       | day                           |
| `day`        | hour                          |
| `hour`       | hourQuarter, minute           |

## Utility Functions

### same(a, b, unit)

Compare two dates at a specific time unit granularity:

```typescript
function same(
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string
): boolean;
```

**Example:**

```typescript
import { same } from "usetemporal";

same(new Date("2024-01-15"), new Date("2024-01-20"), "month"); // true
same(new Date("2024-01-15"), new Date("2024-01-20"), "day"); // false
```

## Configuration Options

### UsePickleOptions

```typescript
interface UsePickleOptions {
  date: Date | Ref<Date>; // Working date
  now?: Date | Ref<Date>; // Reference "now" date
  locale?: string | Ref<string>; // Locale for formatting
}
```

### UseTimeUnitOptions

```typescript
interface UseTimeUnitOptions {
  now: Date | Ref<Date>; // Reference date
  browsing: Date | Ref<Date>; // Browsing date
  weekStartsOn?: number | Ref<number>; // Week start (0-6)
  events?: Event[] | Ref<Event[]>; // Events array
}
```

### UseDatePickerOptions

```typescript
interface UseDatePickerOptions {
  selected: Date | Ref<Date>; // Selected date
  weekStartsOn?: number; // Week start day
  events?: Event[]; // Events to display
}
```

## Migration from 1.x

If migrating from version 1.x, note these breaking changes:

- `usePickle` replaces the old `pickle` function
- All composables now require TypeScript-style options
- Time unit interfaces are now strongly typed
- Event structure has changed to use `timespan` instead of separate dates

For detailed migration guide, see [Migration Guide](/migration/typescript).

## Performance Notes

- All composables are **reactive** - changes propagate automatically
- The `divide()` function is **lazy** - only creates objects when accessed
- Time units are **lightweight** - minimal memory footprint
- Supports **tree-shaking** - import only what you need

## Browser Support

useTemporal supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browser support, ensure your build includes appropriate polyfills for:

- `Intl.DateTimeFormat`
- ES2020 features
