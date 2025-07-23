# divide()

The `divide()` method is the revolutionary pattern that sets useTemporal apart. It allows you to split any time unit into smaller units, creating perfectly synchronized, reactive sub-units.

## Syntax

```typescript
temporal.divide(unit: TimeUnit, division: TimeUnitType): TimeUnit[]
```

## Parameters

- **unit** `TimeUnit` - The time unit to divide (year, month, week, day, hour, minute, quarter)
- **division** `TimeUnitType` - The type of units to divide into ('year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'quarter')

## Returns

`TimeUnit[]` - An array of reactive time units representing the divisions

## Description

The `divide()` method creates an array of smaller time units from a larger one. Each returned unit is fully reactive and synchronized with the parent unit. When the parent unit changes (through navigation), all divided units update automatically.

## Examples

### Basic Division

```typescript
const temporal = createTemporal()
const year = useYear(temporal)

// Divide year into months
const months = temporal.divide(year, 'month')
console.log(months.length) // 12

// Each month is a full TimeUnit
months.forEach(month => {
  console.log(month.name.value)   // "January", "February", etc.
  console.log(month.number.value) // 1, 2, 3, ... 12
})
```

### Nested Division

```typescript
const temporal = createTemporal()
const year = useYear(temporal)

// Divide year into months
const months = temporal.divide(year, 'month')

// Divide first month into days
const januaryDays = temporal.divide(months[0], 'day')
console.log(januaryDays.length) // 31 (for January)

// Divide a day into hours
const firstDayHours = temporal.divide(januaryDays[0], 'hour')
console.log(firstDayHours.length) // 24
```

### Dynamic Updates

```typescript
const temporal = createTemporal()
const month = useMonth(temporal)

// Divide current month into days
const days = temporal.divide(month, 'day')
console.log(days.length) // 31 (if current month has 31 days)

// Navigate to February
month.past() // or month.future() depending on current month

// Days array automatically updates!
console.log(days.length) // 28 or 29 (February)
```

### Week Division

```typescript
const temporal = createTemporal()
const month = useMonth(temporal)

// Divide month into weeks
const weeks = temporal.divide(month, 'week')

// Note: Weeks may span month boundaries
weeks.forEach((week, index) => {
  console.log(`Week ${index + 1}: ${week.name.value}`)
  
  // Get days in this week
  const days = temporal.divide(week, 'day')
  console.log(`  Days: ${days.length}`) // Always 7
})
```

### Time Slots

```typescript
const temporal = createTemporal()
const day = useDay(temporal)

// Create hourly time slots
const hours = temporal.divide(day, 'hour')

// Create 30-minute slots
const timeSlots = []
hours.forEach(hour => {
  const minutes = temporal.divide(hour, 'minute')
  timeSlots.push(minutes[0])  // :00
  timeSlots.push(minutes[30]) // :30
})
```

## Valid Divisions

Not all divisions make logical sense. Here are the valid combinations:

| Parent Unit | Can Divide Into |
|-------------|-----------------|
| year        | quarter, month, week, day, hour, minute, second |
| quarter     | month, week, day, hour, minute, second |
| month       | week, day, hour, minute, second |
| week        | day, hour, minute, second |
| day         | hour, minute, second |
| hour        | minute, second |
| minute      | second |

## Reactive Behavior

All divided units are reactive and stay synchronized:

```typescript
const temporal = createTemporal()
const year = useYear(temporal)
const months = temporal.divide(year, 'month')

// Set up reactive tracking
watchEffect(() => {
  console.log(`Current year: ${year.number.value}`)
  console.log(`First month: ${months[0].name.value}`)
})

// Navigate to next year
year.future()
// Output:
// Current year: 2025
// First month: January
// (Both values update automatically)
```

## Performance Considerations

### Lazy Evaluation

Divided units are created lazily and cached:

```typescript
const temporal = createTemporal()
const year = useYear(temporal)

// Division happens here
const months = temporal.divide(year, 'month')

// Subsequent calls return cached result
const monthsAgain = temporal.divide(year, 'month')
console.log(months === monthsAgain) // true
```

### Memory Management

Be mindful when creating many divisions:

```typescript
// Good - divide only what you need
const day = useDay(temporal)
const workingHours = temporal.divide(day, 'hour').slice(9, 17)

// Avoid - creating unnecessary divisions
const year = useYear(temporal)
const allHours = temporal.divide(year, 'hour') // 8,760 hours!
```

## Use Cases

### Calendar Grid

```typescript
function createCalendarGrid(temporal) {
  const month = useMonth(temporal)
  const weeks = temporal.divide(month, 'week')
  
  return weeks.map(week => {
    const days = temporal.divide(week, 'day')
    return days.map(day => ({
      number: day.number.value,
      inCurrentMonth: day.start.value.getMonth() === month.number.value - 1
    }))
  })
}
```

### Schedule Builder

```typescript
function createDailySchedule(temporal) {
  const day = useDay(temporal)
  const hours = temporal.divide(day, 'hour')
  
  // Business hours only (9 AM - 5 PM)
  return hours.slice(9, 17).map(hour => ({
    time: hour.name.value,
    slots: temporal.divide(hour, 'minute')
      .filter((_, index) => index % 15 === 0) // 15-minute slots
  }))
}
```

### Time Range Selector

```typescript
function createTimeRanges(temporal, startHour, endHour) {
  const day = useDay(temporal)
  const hours = temporal.divide(day, 'hour')
  
  return hours
    .slice(startHour, endHour)
    .map(hour => ({
      value: hour.number.value,
      label: hour.name.value,
      minutes: temporal.divide(hour, 'minute')
        .filter((_, i) => i === 0 || i === 30) // :00 and :30 only
    }))
}
```

## TypeScript

The divide method is fully typed:

```typescript
import type { Temporal, TimeUnit } from 'usetemporal'

const temporal: Temporal = createTemporal()
const year: TimeUnit = useYear(temporal)

// TypeScript knows this returns TimeUnit[]
const months: TimeUnit[] = temporal.divide(year, 'month')

// Type-safe division types
temporal.divide(year, 'month')     // ✅ Valid
temporal.divide(year, 'invalid')   // ❌ Type error
temporal.divide(minute, 'hour')    // ❌ Logic error (caught at runtime)
```

## Error Handling

Invalid divisions throw errors:

```typescript
try {
  const minute = useMinute(temporal)
  temporal.divide(minute, 'hour') // Can't divide minute into hours
} catch (error) {
  console.error('Invalid division:', error.message)
}
```

## Best Practices

1. **Cache Divisions**: Store divided units if used multiple times
2. **Limit Scope**: Only divide the time range you need
3. **Watch Parent Changes**: Divided units update when parent changes
4. **Clean Up**: Unsubscribe from reactive watchers when done

## Related

- [Reactive Time Units](/guide/reactive-time-units) - Understanding reactive behavior
- [useYear()](/api/use-year), [useMonth()](/api/use-month), etc. - Time unit composables
- [Examples](/examples/basic-usage) - Real-world usage patterns