# isWeekday

Check if a period falls on a weekday (Monday through Friday).

## Signature

```typescript
function isWeekday(period: Period): boolean
```

## Parameters

- `period` - `Period` - The period to check

## Returns

`boolean` - True if the period's reference date is Monday (1) through Friday (5)

## Description

The `isWeekday` function checks if a period's reference date falls on a weekday. It's the inverse of `isWeekend`, returning true for Monday through Friday.

## Examples

### Basic Usage

```typescript
import { isWeekday, toPeriod, createTemporal } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

// Check specific dates
const monday = toPeriod(temporal, new Date('2024-03-18'), 'day')
const wednesday = toPeriod(temporal, new Date('2024-03-20'), 'day')
const saturday = toPeriod(temporal, new Date('2024-03-16'), 'day')

console.log(isWeekday(monday))    // true
console.log(isWeekday(wednesday)) // true
console.log(isWeekday(saturday))  // false
```

### Business Day Filtering

```typescript
// Get only weekdays from a month
const month = toPeriod(temporal, new Date(), 'month')
const days = divide(temporal, month, 'day')

const weekdays = days.filter(isWeekday)
console.log(`${weekdays.length} weekdays this month`)
```

### Appointment Scheduling

```typescript
// Only show weekday slots for appointments
function getAvailableSlots(week: Period, temporal: Temporal) {
  const days = divide(temporal, week, 'day')
  
  return days
    .filter(isWeekday)
    .flatMap(day => {
      const hours = divide(temporal, day, 'hour')
      // Business hours: 9 AM to 5 PM
      return hours.filter(hour => {
        const h = hour.date.getHours()
        return h >= 9 && h < 17
      })
    })
}
```

## Common Patterns

### Business Days Calculation

```typescript
// Calculate business days between two dates
function getBusinessDays(startDate: Date, endDate: Date, temporal: Temporal) {
  const start = toPeriod(temporal, startDate, 'day')
  const end = toPeriod(temporal, endDate, 'day')
  
  let count = 0
  let current = start
  
  while (current.start <= end.start) {
    if (isWeekday(current)) {
      count++
    }
    current = next(temporal, current)
  }
  
  return count
}
```

### Workday Navigation

```typescript
// Navigate to next/previous workday
function nextWorkday(day: Period, temporal: Temporal): Period {
  let next = next(temporal, day)
  while (!isWeekday(next)) {
    next = next(temporal, next)
  }
  return next
}

function previousWorkday(day: Period, temporal: Temporal): Period {
  let prev = previous(temporal, day)
  while (!isWeekday(prev)) {
    prev = previous(temporal, prev)
  }
  return prev
}
```

### Calendar Highlighting

```typescript
// Different styling for weekdays vs weekends
function CalendarDay({ day, temporal }) {
  const classes = {
    'day': true,
    'weekday': isWeekday(day),
    'weekend': !isWeekday(day),
    'today': isToday(day, temporal),
    'past': isPast(day, temporal)
  }
  
  return (
    <div className={cn(classes)}>
      {day.date.getDate()}
    </div>
  )
}
```

## Relationship to isWeekend

The function is implemented as the logical inverse of `isWeekend`:

```typescript
export function isWeekday(period: Period): boolean {
  return !isWeekend(period)
}
```

This ensures consistency - a day is either a weekday or weekend, never both:

```typescript
const day = toPeriod(temporal, new Date(), 'day')

// Always opposite values
console.log(isWeekday(day))  // true
console.log(isWeekend(day))  // false

// Never both true or both false
console.log(isWeekday(day) && isWeekend(day))  // always false
console.log(isWeekday(day) || isWeekend(day))  // always true
```

## Business Hours Extension

```typescript
// Extended business day checking
function isBusinessHours(period: Period): boolean {
  if (!isWeekday(period)) return false
  
  const hour = period.date.getHours()
  return hour >= 9 && hour < 17 // 9 AM to 5 PM
}

// Usage
const slots = hours.filter(hour => 
  isWeekday(hour) && isBusinessHours(hour)
)
```

## Holiday Considerations

For complete business day calculation, you may need to consider holidays:

```typescript
// Business day checker with holidays
function isBusinessDay(
  period: Period, 
  holidays: Date[] = []
): boolean {
  if (!isWeekday(period)) return false
  
  // Check if it's a holiday
  const isHoliday = holidays.some(holiday => 
    isSame(temporal, 
      toPeriod(temporal, holiday, 'day'), 
      period, 
      'day'
    )
  )
  
  return !isHoliday
}
```

## Performance

Like `isWeekend`, this function is very efficient:

```typescript
// Implementation using isWeekend
export function isWeekday(period: Period): boolean {
  return !isWeekend(period)
}

// Direct implementation would be:
export function isWeekday(period: Period): boolean {
  const day = period.date.getDay()
  return day >= 1 && day <= 5
}
```

## See Also

- [isWeekend](/api/utilities/is-weekend) - Check for weekends
- [isToday](/api/utilities/is-today) - Check if period is today
- [Business Days Guide](/guide/business-days) - Working with business days