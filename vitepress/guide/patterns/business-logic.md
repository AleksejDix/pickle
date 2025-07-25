# Business Logic Patterns

Common patterns for implementing business logic with useTemporal.

## Business Days

### Checking Business Days

```typescript
import { isWeekend, isWeekday } from 'usetemporal'

function isBusinessDay(period: Period, holidays: Date[] = []): boolean {
  // Not a business day if weekend
  if (isWeekend(period)) return false
  
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

### Counting Business Days

```typescript
function countBusinessDays(
  period: Period, 
  temporal: Temporal,
  holidays: Date[] = []
): number {
  const days = divide(temporal, period, 'day')
  return days.filter(day => isBusinessDay(day, holidays)).length
}

// Usage
const thisMonth = usePeriod(temporal, 'month')
const businessDays = countBusinessDays(thisMonth.value, temporal)
```

### Next Business Day

```typescript
function nextBusinessDay(
  day: Period, 
  temporal: Temporal,
  holidays: Date[] = []
): Period {
  let nextDay = next(temporal, day)
  
  while (!isBusinessDay(nextDay, holidays)) {
    nextDay = next(temporal, nextDay)
  }
  
  return nextDay
}
```

### Business Days Between Dates

```typescript
function businessDaysBetween(
  start: Date,
  end: Date,
  temporal: Temporal,
  holidays: Date[] = []
): number {
  const startDay = toPeriod(temporal, start, 'day')
  const endDay = toPeriod(temporal, end, 'day')
  
  let count = 0
  let current = startDay
  
  while (current.start <= endDay.start) {
    if (isBusinessDay(current, holidays)) {
      count++
    }
    current = next(temporal, current)
  }
  
  return count
}
```

## Time Slots

### Generate Time Slots

```typescript
function generateTimeSlots(
  day: Period,
  temporal: Temporal,
  options: {
    startHour: number
    endHour: number
    slotDuration: number // minutes
    breakStart?: number
    breakEnd?: number
  }
): Period[] {
  const hours = divide(temporal, day, 'hour')
  const slots: Period[] = []
  
  hours.forEach(hour => {
    const h = hour.date.getHours()
    
    // Skip hours outside business hours
    if (h < options.startHour || h >= options.endHour) return
    
    // Skip break hours
    if (options.breakStart && options.breakEnd && 
        h >= options.breakStart && h < options.breakEnd) return
    
    // Generate slots within the hour
    if (options.slotDuration === 60) {
      slots.push(hour)
    } else {
      const minutes = divide(temporal, hour, 'minute')
      for (let i = 0; i < 60; i += options.slotDuration) {
        const slotStart = minutes[i]
        const slotEnd = minutes[Math.min(i + options.slotDuration - 1, 59)]
        
        slots.push({
          type: 'custom',
          date: slotStart.date,
          start: slotStart.start,
          end: slotEnd.end
        })
      }
    }
  })
  
  return slots
}

// Usage
const today = usePeriod(temporal, 'day')
const slots = generateTimeSlots(today.value, temporal, {
  startHour: 9,
  endHour: 17,
  slotDuration: 30,
  breakStart: 12,
  breakEnd: 13
})
```

### Available Slots with Bookings

```typescript
interface Booking {
  start: Date
  end: Date
}

function getAvailableSlots(
  day: Period,
  temporal: Temporal,
  bookings: Booking[],
  slotDuration = 30
): Period[] {
  const allSlots = generateTimeSlots(day, temporal, {
    startHour: 9,
    endHour: 17,
    slotDuration
  })
  
  return allSlots.filter(slot => {
    // Check if slot overlaps with any booking
    const overlaps = bookings.some(booking => 
      (slot.start < booking.end && slot.end > booking.start)
    )
    return !overlaps
  })
}
```

## Recurring Events

### Generate Recurring Dates

```typescript
type RecurrencePattern = 
  | { type: 'daily', interval: number }
  | { type: 'weekly', interval: number, daysOfWeek: number[] }
  | { type: 'monthly', interval: number, dayOfMonth: number }
  | { type: 'yearly', interval: number }

function generateRecurringDates(
  start: Date,
  pattern: RecurrencePattern,
  count: number,
  temporal: Temporal
): Date[] {
  const dates: Date[] = [start]
  let current = toPeriod(temporal, start, 'day')
  
  for (let i = 1; i < count; i++) {
    switch (pattern.type) {
      case 'daily':
        current = go(temporal, current, pattern.interval)
        break
        
      case 'weekly':
        // Find next occurrence based on days of week
        do {
          current = next(temporal, current)
        } while (!pattern.daysOfWeek.includes(current.date.getDay()))
        break
        
      case 'monthly':
        // Navigate to same day next month
        const monthPeriod = toPeriod(temporal, current.date, 'month')
        const nextMonth = go(temporal, monthPeriod, pattern.interval)
        const targetDate = new Date(nextMonth.date)
        targetDate.setDate(pattern.dayOfMonth)
        current = toPeriod(temporal, targetDate, 'day')
        break
        
      case 'yearly':
        current = go(temporal, current, 365 * pattern.interval)
        break
    }
    
    dates.push(current.date)
  }
  
  return dates
}
```

## Working Hours

### Calculate Working Hours

```typescript
function calculateWorkingHours(
  period: Period,
  temporal: Temporal,
  options = {
    startHour: 9,
    endHour: 17,
    excludeWeekends: true,
    holidays: [] as Date[]
  }
): number {
  const days = divide(temporal, period, 'day')
  let totalHours = 0
  
  days.forEach(day => {
    // Skip weekends if configured
    if (options.excludeWeekends && isWeekend(day)) return
    
    // Skip holidays
    const isHoliday = options.holidays.some(holiday =>
      isSame(temporal, toPeriod(temporal, holiday, 'day'), day, 'day')
    )
    if (isHoliday) return
    
    // Add working hours for this day
    totalHours += (options.endHour - options.startHour)
  })
  
  return totalHours
}
```

### Time Until Deadline

```typescript
function timeUntilDeadline(
  deadline: Date,
  temporal: Temporal,
  options = {
    workingHoursOnly: false,
    startHour: 9,
    endHour: 17
  }
): {
  days: number
  hours: number
  minutes: number
  isOverdue: boolean
} {
  const now = temporal.now.value.date
  const diff = deadline.getTime() - now.getTime()
  
  if (!options.workingHoursOnly) {
    // Simple calculation
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
    
    return { days, hours, minutes, isOverdue: diff < 0 }
  }
  
  // Calculate working time only
  const deadlinePeriod = toPeriod(temporal, deadline, 'day')
  const todayPeriod = toPeriod(temporal, now, 'day')
  
  const workingHours = calculateWorkingHours(
    { start: now, end: deadline, type: 'custom', date: now },
    temporal,
    options
  )
  
  const days = Math.floor(workingHours / 8)
  const hours = workingHours % 8
  
  return {
    days,
    hours,
    minutes: 0,
    isOverdue: diff < 0
  }
}
```

## Fiscal Periods

### Fiscal Year Calculations

```typescript
// Define fiscal year (e.g., starts July 1)
const FISCAL_YEAR_START_MONTH = 6 // July (0-indexed)

function getFiscalYear(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // If before July, fiscal year is previous calendar year
  return month < FISCAL_YEAR_START_MONTH ? year - 1 : year
}

function getFiscalQuarter(date: Date): number {
  const month = date.getMonth()
  const fiscalMonth = (month - FISCAL_YEAR_START_MONTH + 12) % 12
  return Math.floor(fiscalMonth / 3) + 1
}

function createFiscalYearPeriod(
  year: number,
  temporal: Temporal
): Period {
  const start = new Date(year, FISCAL_YEAR_START_MONTH, 1)
  const end = new Date(year + 1, FISCAL_YEAR_START_MONTH, 0, 23, 59, 59, 999)
  
  return {
    type: 'custom',
    date: start,
    start,
    end
  }
}
```

## See Also

- [divide() Pattern](/guide/patterns/divide-pattern) - Core time division concepts
- [Navigation Patterns](/guide/patterns/navigation) - Time navigation
- [Business Days Recipe](/examples/recipes/business-days) - Complete implementation
- [Time Slots Recipe](/examples/recipes/time-slots) - Scheduling example