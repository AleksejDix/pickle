# The divide() Pattern

The `divide()` pattern is the **revolutionary core innovation** of useTemporal. It enables fractal-like time subdivision where any time unit can be divided into smaller units with perfect consistency.

## Interactive Demo

See the divide pattern in action with this synchronized time hierarchy:

<TimeHierarchy />

## What Makes divide() Revolutionary

### 1. **Unified Subdivision**

One method works for every time scale:

```typescript
// All of these use the exact same pattern
const months = pickle.divide(year, "month"); // 12 months
const days = pickle.divide(month, "day"); // 28-31 days
const hours = pickle.divide(day, "hour"); // 24 hours
const minutes = pickle.divide(hour, "minute"); // 60 minutes
```

### 2. **Automatic Synchronization**

When you change any time unit, all subdivisions update automatically:

```typescript
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const months = pickle.divide(year, "month");

// Navigate to next year
year.future();

// The months array automatically updates to the new year!
console.log(months[0].name); // "January 2025" (if next year is 2025)
```

### 3. **Fractal Time Structure**

Each subdivision follows the same pattern recursively:

```typescript
// Start with a year
const year = useYear(pickle);

// Divide into months
const months = pickle.divide(year, "month");

// Each month can be divided into days
const daysOfFirstMonth = pickle.divide(months[0], "day");

// Each day can be divided into hours
const hoursOfFirstDay = pickle.divide(daysOfFirstMonth[0], "hour");

// And so on...infinitely!
```

## Core Implementation

### The Foundation

```typescript
interface PickleCore {
  divide<TUnit extends TimeUnit, TChild extends TimeUnit>(
    unit: TUnit,
    childType: "year" | "month" | "day" | "hour" | "minute"
  ): TChild[];
}
```

### How It Works Internally

```typescript
// Simplified implementation concept
function divide(unit: TimeUnit, childType: string): TimeUnit[] {
  const subdivisions = [];
  const { start, end } = unit.timespan.value;

  // Generate all child units within the parent's timespan
  let current = start;
  while (current < end) {
    const childUnit = createTimeUnit(current, childType);
    subdivisions.push(childUnit);
    current = getNextPeriod(current, childType);
  }

  return subdivisions;
}
```

## Real-World Examples

### Calendar Navigation

```typescript
const pickle = usePickle({ date: new Date() });

// Year level
const currentYear = useYear(pickle);
const yearMonths = pickle.divide(currentYear, "month");

// Month level
const currentMonth = useMonth(pickle);
const monthDays = pickle.divide(currentMonth, "day");

// Day level
const currentDay = useDay(pickle);
const dayHours = pickle.divide(currentDay, "hour");
```

### Event Scheduling

```typescript
// Find available time slots in a day
const day = useDay(pickle);
const hours = pickle.divide(day, "hour");

const availableSlots = hours.filter((hour) => {
  // Check if hour conflicts with existing events
  return !hasConflictingEvents(hour.timespan.value);
});
```

### Business Applications

```typescript
// Fiscal year breakdown
const fiscalYear = useYear(pickle);
const quarters = pickle.divide(fiscalYear, "quarter");

quarters.forEach((quarter, index) => {
  const months = pickle.divide(quarter, "month");
  console.log(`Q${index + 1}: ${months.map((m) => m.name.value).join(", ")}`);
});
```

## Advanced Patterns

### Conditional Subdivision

```typescript
// Only divide if needed for performance
const subdivisions = computed(() => {
  if (showDetails.value) {
    return pickle.divide(currentUnit.value, nextScale.value);
  }
  return [];
});
```

### Multi-Level Navigation

```typescript
// Navigate through multiple levels
const navigateToDate = (targetDate: Date) => {
  pickle.picked.value = targetDate;

  // All subdivisions automatically update
  const newYear = useYear(pickle);
  const newMonths = pickle.divide(newYear, "month");
  const newDays = pickle.divide(currentMonth, "day");
};
```

### Recursive Time Exploration

```typescript
// Explore time hierarchy recursively
function exploreTimeHierarchy(unit: TimeUnit, depth = 0): void {
  console.log(`${"  ".repeat(depth)}${unit.name.value}`);

  if (depth < 3) {
    // Limit recursion
    const children = pickle.divide(unit, getNextScale(unit.type));
    children.forEach((child) => exploreTimeHierarchy(child, depth + 1));
  }
}

// Usage
const year = useYear(pickle);
exploreTimeHierarchy(year);
// Output:
// 2024
//   January 2024
//     January 1, 2024
//       1:00 AM
//     January 2, 2024
//       1:00 AM
//   February 2024
//     ...
```

## Why This Changes Everything

### Traditional Approach (Problematic)

```typescript
// Separate APIs for each scale
const years = getYears();
const months = getMonthsForYear(year);
const days = getDaysForMonth(month);
const hours = getHoursForDay(day);

// Each needs different handling
if (scale === "year") handleYears();
else if (scale === "month") handleMonths();
else if (scale === "day") handleDays();
// ... complexity grows exponentially
```

### useTemporal Approach (Revolutionary)

```typescript
// One unified pattern for all scales
const subdivisions = pickle.divide(currentUnit, nextScale);

// Same handling regardless of scale
subdivisions.forEach((unit) => {
  // Identical interface for all time units
  console.log(unit.name.value);
  console.log(unit.isNow.value);
  unit.past(); // Works for years, months, days, hours...
});
```

## Performance Benefits

### Lazy Evaluation

```typescript
// Subdivisions are computed only when needed
const days = computed(() => pickle.divide(month, "day"));
// Only recalculates when month changes
```

### Efficient Caching

```typescript
// Automatically cached by Vue's reactivity
const cachedDivision = useMemo(
  () => pickle.divide(unit, childType),
  [unit, childType]
);
```

### Minimal Re-computation

```typescript
// Only affected subdivisions update
month.future(); // Only month's days recalculate, not year's months
```

## Mathematical Precision

### Exact Boundaries

```typescript
// Each subdivision knows its exact timespan
const months = pickle.divide(year, "month");
console.log(months[0].timespan.value);
// { start: '2024-01-01T00:00:00', end: '2024-02-01T00:00:00' }
```

### No Off-by-One Errors

```typescript
// Boundaries are mathematically precise
const days = pickle.divide(month, "day");
const lastDay = days[days.length - 1];
console.log(lastDay.timespan.value.end); // Exactly start of next month
```

### Leap Year Handling

```typescript
// Automatically handles calendar complexities
const febDays = pickle.divide(februaryOf2024, "day");
console.log(febDays.length); // 29 (leap year)

const febDays2023 = pickle.divide(februaryOf2023, "day");
console.log(febDays2023.length); // 28 (regular year)
```

## Conclusion

The `divide()` pattern represents a **paradigm shift** in how we think about time in applications:

- **From separate APIs to unified patterns**
- **From complex conditionals to simple recursion**
- **From manual calculations to automatic precision**
- **From rigid structures to infinite flexibility**

This is why useTemporal is revolutionary - it takes the complex, error-prone world of time handling and makes it **simple, predictable, and infinitely scalable**.

Try the demo above to experience how natural time navigation becomes when every scale follows the same beautiful pattern! 🚀

<script setup>
import TimeHierarchy from '../.vitepress/components/TimeHierarchy.vue'
</script>
