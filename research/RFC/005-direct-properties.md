# RFC-005: Direct Property Access

## Summary

Add direct properties to time units for common operations, avoiding repetitive `.raw.value` access.

## Motivation

Accessing basic properties requires verbose syntax:

```typescript
// Current verbose patterns
day.raw.value.getDay()      // Day of week
day.raw.value.getDate()     // Day of month  
month.raw.value.getMonth()  // Month number
year.raw.value.getFullYear() // Year

// Checking properties
if (day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6) {
  // Weekend
}
```

## Detailed Design

### API

```typescript
interface DayUnit extends TimeUnit {
  weekday: number;      // 0-6
  weekdayName: string;  // "Monday"
  date: number;         // 1-31
  dayOfYear: number;    // 1-366
}

interface MonthUnit extends TimeUnit {
  month: number;        // 0-11
  monthName: string;    // "January"
  daysInMonth: number;  // 28-31
  quarter: number;      // 1-4
}

interface YearUnit extends TimeUnit {
  year: number;         // 2024
  isLeapYear: boolean;  // true/false
}

interface WeekUnit extends TimeUnit {
  weekNumber: number;   // 1-53
}

interface HourUnit extends TimeUnit {
  hour: number;         // 0-23
  hour12: number;       // 1-12
  isPM: boolean;        // true/false
}
```

### Usage Examples

```typescript
// Before
if (day.raw.value.getDay() === 0 || day.raw.value.getDay() === 6) {
  console.log("Weekend");
}

// After  
if (day.weekday === 0 || day.weekday === 6) {
  console.log("Weekend");
}

// Direct access to common properties
console.log(`${month.monthName} has ${month.daysInMonth} days`);
console.log(`Day ${day.dayOfYear} of ${year.year}`);

if (year.isLeapYear) {
  console.log("Leap year!");
}
```

## Implementation

```typescript
// In createPeriod.ts
const directProperties = computed(() => {
  const date = raw.value;

  switch (kind) {
    case "day":
      return {
        weekday: date.getDay(),
        weekdayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.getDate(),
        dayOfYear: Math.floor(
          (date - new Date(date.getFullYear(), 0, 0)) / 86400000
        ),
      };
      
    case "month":
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return {
        month: date.getMonth(),
        monthName: date.toLocaleDateString("en-US", { month: "long" }),
        daysInMonth: lastDay.getDate(),
        quarter: Math.floor(date.getMonth() / 3) + 1,
      };
      
    case "year":
      const year = date.getFullYear();
      return {
        year,
        isLeapYear: (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0),
      };
      
    default:
      return {};
  }
});

return {
  // ... existing properties
  ...toRefs(directProperties.value),
};
```

## Benefits

- Cleaner, more readable code
- Better TypeScript inference
- Reduces verbosity significantly
- Computed only when accessed
- Discoverable through autocomplete

## Drawbacks

- Increases API surface area
- May encourage avoiding raw Date access
- Properties are English-centric (weekdayName, monthName)
- Adds ~500 bytes per time unit type

## Alternatives

1. Keep using `.raw.value` (status quo)
2. Add getter methods instead: `day.getWeekday()`
3. Create separate utility functions
4. Use Proxy for dynamic properties

## Migration Path

No breaking changes. This is purely additive:

```typescript
// Both work
day.raw.value.getDay()  // Old way
day.weekday             // New way
```