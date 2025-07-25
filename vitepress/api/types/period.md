# Period Type

The `Period` type represents a time span with a start and end date. It's the fundamental unit of time in useTemporal.

## Structure

```typescript
interface Period {
  type: Unit       // The unit type (e.g., 'month', 'day')
  date: Date       // The representative date for this period
  start: Date      // Start of the period (inclusive)
  end: Date        // End of the period (inclusive)
}
```

## Creating Periods

Periods are created through various operations:

### usePeriod()

The primary way to create a period for the current browsing date:

```typescript
import { createTemporal, usePeriod } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

const year = usePeriod(temporal, 'year')
const month = usePeriod(temporal, 'month')
const week = usePeriod(temporal, 'week')
const day = usePeriod(temporal, 'day')
const hour = usePeriod(temporal, 'hour')
```

### toPeriod()

Convert any date to a period of a specific unit:

```typescript
import { toPeriod } from 'usetemporal'

const christmas = new Date(2024, 11, 25)
const christmasWeek = toPeriod(temporal, christmas, 'week')
const christmasMonth = toPeriod(temporal, christmas, 'month')
```

### createPeriod()

Create a period with specific start and end dates:

```typescript
// Create a custom period manually
const customPeriod: Period = {
  type: 'custom',
  date: new Date(2024, 0, 1),
  start: new Date(2024, 0, 1),    // Start: Jan 1, 2024
  end: new Date(2024, 11, 31)     // End: Dec 31, 2024
}
```

### Custom Periods

Create custom periods manually:

```typescript
const vacation: Period = {
  type: 'vacation',
  date: new Date(2024, 6, 15),
  start: new Date(2024, 6, 15),   // July 15
  end: new Date(2024, 6, 22)      // July 22
}

## Period Properties

### date

The representative date for the period. For most units, this is the start date:

```typescript
const month = usePeriod(temporal, 'month')
console.log(month.value.date) // First moment of the month
```

### start

The inclusive start of the period:

```typescript
const week = usePeriod(temporal, 'week')
console.log(week.value.start) // First moment of the week
```

### end

The exclusive end of the period:

```typescript
const day = usePeriod(temporal, 'day')
console.log(day.value.end) // First moment of the next day
```

## Working with Periods

### Navigation

Navigate between periods using navigation functions:

```typescript
import { next, previous, go } from 'usetemporal'

const today = usePeriod(temporal, 'day')

// Get adjacent periods
const tomorrow = next(temporal, today.value)
const yesterday = previous(temporal, today.value)

// Jump multiple periods
const nextWeek = go(temporal, today.value, 7)
const lastMonth = go(temporal, today.value, -30)
```

### Division

Divide periods into smaller units:

```typescript
import { divide } from 'usetemporal'

const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')
const weeks = divide(temporal, month.value, 'week')

console.log(`This month has ${days.length} days`)
console.log(`This month spans ${weeks.length} weeks`)
```

### Comparison

Compare periods and check containment:

```typescript
import { contains, isSame } from 'usetemporal'

const month = usePeriod(temporal, 'month')
const today = new Date()

// Check if date is within period
if (contains(month.value, today)) {
  console.log('Today is in the current month')
}

// Check if two dates are in the same period
const date1 = new Date(2024, 5, 15)
const date2 = new Date(2024, 5, 20)
console.log(isSame(temporal, date1, date2, 'month')) // true
```

### Navigating Period Hierarchies

Navigate between different period levels using composition:

```typescript
import { divide, contains, createPeriod } from 'usetemporal'

const year = usePeriod(temporal, 'year')

// Navigate to specific month (June)
const months = divide(temporal, year.value, 'month')
const june = months[5] // 0-indexed

// Navigate from day to its containing month
const day = usePeriod(temporal, 'day')
const containingMonth = createPeriod(temporal, day.value.date, 'month')
```

## Examples

### Calendar Display

```vue
<template>
  <div class="calendar">
    <h2>{{ monthName }}</h2>
    <div class="days-grid">
      <div 
        v-for="day in days" 
        :key="day.date.toISOString()"
        :class="{ today: isToday(day.date) }"
      >
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  createTemporal, 
  usePeriod, 
  divide, 
  isToday 
} from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const monthName = computed(() => 
  month.value.date.toLocaleDateString('en', { 
    month: 'long', 
    year: 'numeric' 
  })
)
</script>
```

### Date Range Picker

```typescript
function getDateRange(temporal: Temporal, start: Date, end: Date): Period[] {
  const periods: Period[] = []
  let current = toPeriod(temporal, start, 'day')
  const endPeriod = toPeriod(temporal, end, 'day')
  
  while (current.start <= endPeriod.start) {
    periods.push(current)
    current = next(temporal, current)
  }
  
  return periods
}

// Get all days in current month
const month = usePeriod(temporal, 'month')
const monthDays = divide(temporal, month.value, 'day')

// Get business days only
const businessDays = monthDays.filter(day => isWeekday(day.date))
```

### Time Slot Generation

```typescript
function generateTimeSlots(
  temporal: Temporal, 
  day: Period, 
  slotDuration: number = 30
): { time: Date; label: string }[] {
  const hours = divide(temporal, day, 'hour')
  const slots: { time: Date; label: string }[] = []
  
  hours.forEach(hour => {
    // Add slot at start of hour
    slots.push({
      time: hour.start,
      label: hour.date.toLocaleTimeString('en', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    })
    
    // Add 30-minute slot if requested
    if (slotDuration === 30) {
      const halfHour = new Date(hour.start)
      halfHour.setMinutes(30)
      slots.push({
        time: halfHour,
        label: halfHour.toLocaleTimeString('en', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })
      })
    }
  })
  
  return slots
}
```

## TypeScript

Full type safety with TypeScript:

```typescript
import type { Temporal, Period, Unit } from 'usetemporal'

// Period type is fully typed
const month = usePeriod(temporal, 'month')
const monthPeriod: Period = month.value

// Functions accept and return typed periods
function getMonthDays(temporal: Temporal, month: Period): Period[] {
  return divide(temporal, month, 'day')
}

// Type-safe period creation
const customPeriod: Period = {
  type: 'year',
  date: new Date(2024, 0, 1),
  start: new Date(2024, 0, 1),
  end: new Date(2024, 11, 31)
}
```

## See Also

- [usePeriod](/api/use-period) - Create reactive periods
- [divide() Pattern](/api/divide) - Divide periods into smaller units
- [Navigation Operations](/api/navigation) - Navigate between periods
- [Comparison Operations](/api/comparison) - Compare periods and dates
- [Navigation Operations](/api/operations/navigation) - Navigate between periods