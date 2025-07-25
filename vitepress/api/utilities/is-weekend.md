# isWeekend

Check if a period falls on a weekend (Saturday or Sunday).

## Signature

```typescript
function isWeekend(period: Period): boolean
```

## Parameters

- `period` - `Period` - The period to check

## Returns

`boolean` - True if the period's reference date is Saturday (6) or Sunday (0)

## Description

The `isWeekend` function checks if a period's reference date falls on a weekend. It uses the JavaScript convention where Sunday is 0 and Saturday is 6.

## Examples

### Basic Usage

```typescript
import { isWeekend, toPeriod, createTemporal } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

// Check specific dates
const friday = toPeriod(temporal, new Date('2024-03-15'), 'day')
const saturday = toPeriod(temporal, new Date('2024-03-16'), 'day')
const sunday = toPeriod(temporal, new Date('2024-03-17'), 'day')

console.log(isWeekend(friday))   // false
console.log(isWeekend(saturday)) // true
console.log(isWeekend(sunday))   // true
```

### Calendar Styling

```typescript
// Style weekend days differently
function DayCell({ day }) {
  return (
    <div className={`day-cell ${isWeekend(day) ? 'weekend' : 'weekday'}`}>
      <span className="day-number">{day.date.getDate()}</span>
    </div>
  )
}

// CSS
.day-cell.weekend {
  background-color: #f0f0f0;
  color: #666;
}
```

### Filtering Business Days

```typescript
// Get only business days from a month
const month = toPeriod(temporal, new Date(), 'month')
const days = divide(temporal, month, 'day')

const businessDays = days.filter(day => !isWeekend(day))
console.log(`${businessDays.length} business days this month`)
```

## Common Patterns

### Weekend Counter

```typescript
// Count weekends in a period
function countWeekends(period: Period, temporal: Temporal): number {
  const days = divide(temporal, period, 'day')
  return days.filter(isWeekend).length
}

// Usage
const year = toPeriod(temporal, new Date(), 'year')
const weekendDays = countWeekends(year, temporal)
console.log(`${weekendDays} weekend days this year`)
```

### Combined with Other Checks

```typescript
import { isWeekend, isToday, isPast } from 'usetemporal'

function getDayStatus(day: Period, temporal: Temporal) {
  return {
    isWeekend: isWeekend(day),
    isToday: isToday(day, temporal),
    isPast: isPast(day, temporal),
    isAvailable: !isWeekend(day) && !isPast(day, temporal)
  }
}
```

### Calendar Grid Generation

```typescript
// Generate calendar grid with weekend information
function generateCalendarGrid(month: Period, temporal: Temporal) {
  const days = divide(temporal, month, 'day')
  
  return days.map(day => ({
    date: day.date,
    dayNumber: day.date.getDate(),
    isWeekend: isWeekend(day),
    isCurrentMonth: isSame(temporal, day, month, 'month')
  }))
}
```

## Cultural Considerations

The function uses the Western convention where weekends are Saturday and Sunday. Different cultures may have different weekend days:

```typescript
// Custom weekend checker for different cultures
function isWeekendCustom(period: Period, weekendDays: number[]): boolean {
  return weekendDays.includes(period.date.getDay())
}

// Examples:
// Middle East (Friday-Saturday)
const isMiddleEastWeekend = (day: Period) => 
  isWeekendCustom(day, [5, 6])

// Some banks (Sunday only)
const isBankWeekend = (day: Period) => 
  isWeekendCustom(day, [0])
```

## Performance

The function is very efficient as it only checks the day of week from the period's reference date:

```typescript
// Implementation
export function isWeekend(period: Period): boolean {
  const day = period.date.getDay()
  return day === 0 || day === 6
}
```

## Usage with Different Period Types

While typically used with day periods, `isWeekend` works with any period type by checking its reference date:

```typescript
const hourPeriod = toPeriod(temporal, new Date('2024-03-16T14:00:00'), 'hour')
console.log(isWeekend(hourPeriod)) // true (Saturday)

const monthPeriod = toPeriod(temporal, new Date('2024-03-16'), 'month')
console.log(isWeekend(monthPeriod)) // true (reference date is Saturday)
```

## See Also

- [isWeekday](/api/utilities/is-weekday) - Check for weekdays
- [isToday](/api/utilities/is-today) - Check if period is today
- [Period Type](/api/types/period) - Period interface