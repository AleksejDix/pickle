# The divide() Pattern

The `divide()` pattern is the revolutionary feature that sets useTemporal apart from every other date library. It enables hierarchical time subdivision with perfect synchronization between parent and child time units.

## Concept

Think of time as a tree structure where each node can be subdivided into smaller units:

```
Year
├── Month 1 (January)
│   ├── Day 1
│   ├── Day 2
│   └── ...Day 31
├── Month 2 (February)
│   ├── Day 1
│   └── ...Day 28/29
└── ...Month 12
```

## Basic Usage

```typescript
const temporal = createTemporal({ dateAdapter });
const year = useYear(temporal);

// Divide year into months
const months = temporal.divide(year, "month");
// Returns array of 12 month units

// Divide a month into days
const january = months[0];
const days = temporal.divide(january, "day");
// Returns array of 31 day units for January

// Continue dividing...
const firstDay = days[0];
const hours = temporal.divide(firstDay, "hour");
// Returns array of 24 hour units
```

## Key Features

### 1. **Infinite Subdivision**

You can keep dividing as deep as needed:

```typescript
year → months → days → hours → minutes → seconds
```

### 2. **Perfect Synchronization**

All subdivisions stay synchronized with their parent:

```typescript
const month = useMonth(temporal);
const days = temporal.divide(month, "day");

// When month changes, days automatically update
month.future(); // Move to next month
// days array now contains days of the new month
```

### 3. **Reactive Updates**

Each subdivided unit is fully reactive:

```typescript
const days = temporal.divide(month, "day");

days.forEach((day) => {
  // Each day has reactive properties
  watch(
    () => day.isNow.value,
    (isToday) => {
      if (isToday) console.log(`Day ${day.number.value} is today!`);
    }
  );
});
```

## Advanced Examples

### Calendar Grid

```typescript
const month = useMonth(temporal);
const weeks = temporal.divide(month, "week");

weeks.forEach((week) => {
  const days = temporal.divide(week, "day");
  // Render 7 days per week
});
```

### Year Overview

```typescript
const year = useYear(temporal);
const months = temporal.divide(year, "month");

const yearOverview = months.map((month) => {
  const days = temporal.divide(month, "day");
  const workDays = days.filter(
    (day) => day.weekDay.value >= 1 && day.weekDay.value <= 5
  );

  return {
    name: month.name.value,
    totalDays: days.length,
    workDays: workDays.length,
    weekends: days.length - workDays.length,
  };
});
```

### Time Picker

```typescript
const day = useDay(temporal);
const hours = temporal.divide(day, "hour");

// Create hour slots
const hourSlots = hours.map((hour) => {
  const minutes = temporal.divide(hour, "minute");

  return {
    hour: hour.number.value,
    slots: minutes.filter((m, i) => i % 15 === 0), // 00, 15, 30, 45
  };
});
```

## Performance Considerations

### Lazy Evaluation

Subdivisions are created on-demand:

```typescript
const months = temporal.divide(year, "month");
// 12 month objects created

const allDays = months.flatMap((month) => temporal.divide(month, "day"));
// 365/366 day objects created only when accessed
```

### Caching

Results are cached for performance:

```typescript
const days1 = temporal.divide(month, "day");
const days2 = temporal.divide(month, "day");
// days1 === days2 (same reference)
```

### Memory Management

Subdivisions are garbage collected when no longer referenced:

```typescript
function showMonth(month) {
  const days = temporal.divide(month, "day");
  // Use days...
} // days eligible for GC after function exits
```

## Common Patterns

### 1. **Month Calendar**

```typescript
function createMonthCalendar(temporal) {
  const month = useMonth(temporal);
  const days = temporal.divide(month, "day");

  // Group by weeks
  const weeks = [];
  let currentWeek = [];

  days.forEach((day) => {
    currentWeek.push(day);
    if (day.weekDay.value === 6 || day === days[days.length - 1]) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return weeks;
}
```

### 2. **Time Slots**

```typescript
function getAvailableSlots(temporal, duration = 30) {
  const day = useDay(temporal);
  const hours = temporal.divide(day, "hour");

  const slots = [];
  hours.forEach((hour) => {
    if (hour.number.value >= 9 && hour.number.value < 17) {
      const minutes = temporal.divide(hour, "minute");
      for (let i = 0; i < 60; i += duration) {
        slots.push({
          time: `${hour.number.value}:${i.toString().padStart(2, "0")}`,
          available: true,
        });
      }
    }
  });

  return slots;
}
```

### 3. **Hierarchical Navigation**

```typescript
function createDateNavigator(temporal) {
  const year = useYear(temporal);
  const months = temporal.divide(year, "month");

  return {
    selectMonth(index) {
      temporal.browsing.value = months[index].raw.value;
    },

    getMonthDetails(index) {
      const month = months[index];
      const days = temporal.divide(month, "day");

      return {
        name: month.name.value,
        days: days.length,
        weeks: Math.ceil(days.length / 7),
        firstDay: days[0].weekDay.value,
        lastDay: days[days.length - 1].weekDay.value,
      };
    },
  };
}
```

## Integration with Composables

The divide pattern works seamlessly with all time unit composables:

```typescript
// Start with any composable
const week = useWeek(temporal);
const days = temporal.divide(week, "day");

// Or combine multiple levels
const year = useYear(temporal);
const quarters = temporal.divide(year, "quarter");
const monthsInQ1 = temporal.divide(quarters[0], "month");
```

## Best Practices

1. **Cache subdivisions** when using them multiple times
2. **Avoid deep nesting** in hot code paths
3. **Use appropriate granularity** - don't divide to seconds if you only need hours
4. **Leverage reactivity** instead of manual updates
5. **Clean up references** to allow garbage collection

The divide() pattern is what makes useTemporal unique and powerful for building complex time-based interfaces.
