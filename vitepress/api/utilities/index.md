# Utilities

Utility functions for common date-related checks and operations.

## Date Check Utilities

### [isWeekend](/api/utilities/is-weekend)
Check if a period falls on a weekend (Saturday or Sunday).

```typescript
function isWeekend(period: Period): boolean

// Example
if (isWeekend(dayPeriod)) {
  console.log('It\'s the weekend!')
}
```

### [isWeekday](/api/utilities/is-weekday)
Check if a period falls on a weekday (Monday through Friday).

```typescript
function isWeekday(period: Period): boolean

// Example
const businessDays = days.filter(day => isWeekday(day))
```

### [isToday](/api/utilities/is-today)
Check if a period represents today.

```typescript
function isToday(period: Period, temporal: Temporal): boolean

// Example
if (isToday(dayPeriod, temporal)) {
  element.classList.add('today')
}
```

## Coming Soon

More utility functions are planned:

- `isPast(period, temporal)` - Check if period is in the past
- `isFuture(period, temporal)` - Check if period is in the future
- `isYesterday(period, temporal)` - Check if period was yesterday
- `isTomorrow(period, temporal)` - Check if period is tomorrow
- `isThisWeek(period, temporal)` - Check if period is in current week
- `isThisMonth(period, temporal)` - Check if period is in current month
- `isThisYear(period, temporal)` - Check if period is in current year

## Usage Example

```typescript
import { isWeekend, isWeekday, isToday } from 'usetemporal'

// In a calendar component
function getDayClasses(day: Period, temporal: Temporal) {
  return {
    'weekend': isWeekend(day),
    'weekday': isWeekday(day),
    'today': isToday(day, temporal),
  }
}
```