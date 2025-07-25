# Business Time Calculations

Examples for working with business days, work hours, and time slots using useTemporal.

## Business Days Calculation

Calculate the number of business days in a period:

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

const businessDays = days.filter((day) => {
  const dow = day.date.getDay()
  return dow >= 1 && dow <= 5 // Monday to Friday
})

console.log(`Business days this month: ${businessDays.length}`)
```

## Work Hours Calculation

Calculate total work hours in a period:

```typescript
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

const workHours = days
  .filter(day => {
    const dow = day.date.getDay()
    return dow >= 1 && dow <= 5 // Weekdays only
  })
  .reduce((total, day) => {
    const hours = divide(temporal, day, 'hour')
    const workHours = hours.filter(hour => {
      const h = hour.date.getHours()
      return h >= 9 && h < 17 // 9 AM to 5 PM
    })
    return total + workHours.length
  }, 0)

console.log(`Total work hours: ${workHours}`)
```

## Time Slots Generation

Generate appointment slots for scheduling:

```typescript
// Generate hourly appointment slots
const day = usePeriod(temporal, 'day')
const hours = divide(temporal, day.value, 'hour')

const appointmentSlots = hours
  .filter((hour) => {
    const h = hour.date.getHours()
    return h >= 9 && h < 17 // 9 AM to 5 PM
  })
  .map((hour) => ({
    time: hour.start,
    label: hour.date.toLocaleTimeString('en', { 
      hour: 'numeric', 
      minute: '2-digit' 
    }),
    available: true // Check against booked slots
  }))
```

## Advanced Slot Generation with Duration

Create slots with custom durations:

```typescript
function generateTimeSlots(temporal, day, slotDurationMinutes = 30) {
  const hours = divide(temporal, day, 'hour')
  const slots = []
  
  hours.forEach(hour => {
    const h = hour.date.getHours()
    if (h >= 9 && h < 17) { // Business hours
      const minutes = divide(temporal, hour, 'minute')
      
      for (let i = 0; i < minutes.length; i += slotDurationMinutes) {
        if (i + slotDurationMinutes <= minutes.length) {
          const startMinute = minutes[i]
          const endMinute = minutes[i + slotDurationMinutes - 1]
          
          slots.push({
            start: startMinute.start,
            end: endMinute.end,
            label: startMinute.date.toLocaleTimeString('en', {
              hour: 'numeric',
              minute: '2-digit'
            })
          })
        }
      }
    }
  })
  
  return slots
}

// Generate 30-minute slots
const slots = generateTimeSlots(temporal, day.value, 30)
```

## Business Days Between Dates

Calculate business days between two dates:

```typescript
import { toPeriod, next } from 'usetemporal'

function getBusinessDaysBetween(temporal, startDate, endDate) {
  const businessDays = []
  let current = toPeriod(temporal, startDate, 'day')
  
  while (current.start <= endDate) {
    const dow = current.date.getDay()
    if (dow >= 1 && dow <= 5) {
      businessDays.push(current)
    }
    current = next(temporal, current)
  }
  
  return businessDays
}

const start = new Date(2024, 2, 1)
const end = new Date(2024, 2, 31)
const workDays = getBusinessDaysBetween(temporal, start, end)
console.log(`Business days in March: ${workDays.length}`)
```

## Next Business Day

Find the next business day from a given date:

```typescript
function getNextBusinessDay(temporal, fromDate) {
  let day = toPeriod(temporal, fromDate, 'day')
  
  do {
    day = next(temporal, day)
    const dow = day.date.getDay()
    if (dow >= 1 && dow <= 5) {
      return day
    }
  } while (true)
}

const today = new Date()
const nextWorkDay = getNextBusinessDay(temporal, today)
console.log(`Next business day: ${nextWorkDay.date.toDateString()}`)
```

## Work Week Overview

Get a summary of the current work week:

```typescript
const week = usePeriod(temporal, 'week')
const days = divide(temporal, week.value, 'day')

const workWeek = days
  .filter(day => {
    const dow = day.date.getDay()
    return dow >= 1 && dow <= 5
  })
  .map(day => ({
    date: day.date,
    dayName: day.date.toLocaleDateString('en', { weekday: 'long' }),
    isToday: isSame(temporal, day.date, new Date(), 'day'),
    hours: divide(temporal, day, 'hour')
      .filter(h => h.date.getHours() >= 9 && h.date.getHours() < 17)
      .length
  }))

console.log('Work week overview:', workWeek)
```

## Meeting Duration Calculator

Calculate meeting duration across time periods:

```typescript
function getMeetingDuration(temporal, startTime, endTime) {
  const startHour = toPeriod(temporal, startTime, 'hour')
  const endHour = toPeriod(temporal, endTime, 'hour')
  
  let current = startHour
  let hours = 0
  
  while (current.start < endHour.end) {
    hours++
    current = next(temporal, current)
  }
  
  // Calculate minutes for partial hours
  const startMinutes = startTime.getMinutes()
  const endMinutes = endTime.getMinutes()
  const totalMinutes = (hours * 60) - startMinutes + endMinutes
  
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes
  }
}

const meetingStart = new Date(2024, 2, 15, 14, 30) // 2:30 PM
const meetingEnd = new Date(2024, 2, 15, 16, 45)   // 4:45 PM
const duration = getMeetingDuration(temporal, meetingStart, meetingEnd)
console.log(`Meeting duration: ${duration.hours}h ${duration.minutes}m`)
```

## Availability Checker

Check availability across multiple calendars:

```typescript
interface Booking {
  start: Date
  end: Date
  title: string
}

function findAvailableSlots(temporal, day, existingBookings: Booking[], slotMinutes = 60) {
  const hours = divide(temporal, day, 'hour')
  const availableSlots = []
  
  hours.forEach(hour => {
    const h = hour.date.getHours()
    if (h >= 9 && h < 17) { // Business hours
      const slotStart = hour.start
      const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60000)
      
      // Check if slot conflicts with any booking
      const hasConflict = existingBookings.some(booking => 
        (slotStart >= booking.start && slotStart < booking.end) ||
        (slotEnd > booking.start && slotEnd <= booking.end) ||
        (slotStart <= booking.start && slotEnd >= booking.end)
      )
      
      if (!hasConflict) {
        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          label: slotStart.toLocaleTimeString('en', {
            hour: 'numeric',
            minute: '2-digit'
          })
        })
      }
    }
  })
  
  return availableSlots
}
```

## See Also

- [Calendar Examples](/examples/calendars/calendar-grid)
- [divide() API Reference](/api/operations/divide)
- [Time Management Patterns](/guide/patterns/time-management)