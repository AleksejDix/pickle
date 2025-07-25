# Business Days

Patterns for working with business days, holidays, and working hours.

## Basic Business Day Calculations

```typescript
import { createTemporal, divide, next, isWeekend } from 'usetemporal'

// Check if a period is a business day
function isBusinessDay(period: Period): boolean {
  return !isWeekend(period) && !isHoliday(period.date)
}

// Get next business day
function nextBusinessDay(temporal: Temporal, period: Period): Period {
  let nextDay = next(temporal, period)
  
  while (!isBusinessDay(nextDay)) {
    nextDay = next(temporal, nextDay)
  }
  
  return nextDay
}

// Count business days in a period
function countBusinessDays(temporal: Temporal, period: Period): number {
  const days = divide(temporal, period, 'day')
  return days.filter(isBusinessDay).length
}
```

## Holiday Management

```typescript
// Holiday registry
class HolidayRegistry {
  private holidays: Map<string, string> = new Map()
  
  constructor(holidays: Array<{ date: Date, name: string }>) {
    holidays.forEach(h => {
      const key = this.dateKey(h.date)
      this.holidays.set(key, h.name)
    })
  }
  
  private dateKey(date: Date): string {
    return date.toISOString().split('T')[0]
  }
  
  isHoliday(date: Date): boolean {
    return this.holidays.has(this.dateKey(date))
  }
  
  getHolidayName(date: Date): string | null {
    return this.holidays.get(this.dateKey(date)) || null
  }
}

// US Federal holidays 2024
const federalHolidays = new HolidayRegistry([
  { date: new Date('2024-01-01'), name: "New Year's Day" },
  { date: new Date('2024-01-15'), name: "Martin Luther King Jr. Day" },
  { date: new Date('2024-02-19'), name: "Presidents Day" },
  { date: new Date('2024-05-27'), name: "Memorial Day" },
  { date: new Date('2024-06-19'), name: "Juneteenth" },
  { date: new Date('2024-07-04'), name: "Independence Day" },
  { date: new Date('2024-09-02'), name: "Labor Day" },
  { date: new Date('2024-10-14'), name: "Columbus Day" },
  { date: new Date('2024-11-11'), name: "Veterans Day" },
  { date: new Date('2024-11-28'), name: "Thanksgiving" },
  { date: new Date('2024-12-25'), name: "Christmas" }
])

function isHoliday(date: Date): boolean {
  return federalHolidays.isHoliday(date)
}
```

## Business Day Navigation

```typescript
import { createTemporal, toPeriod } from 'usetemporal'

// Navigate by business days
function addBusinessDays(
  temporal: Temporal, 
  startDate: Date, 
  days: number
): Date {
  let current = toPeriod(temporal, startDate, 'day')
  let count = 0
  
  while (count < days) {
    current = next(temporal, current)
    if (isBusinessDay(current)) {
      count++
    }
  }
  
  return current.date
}

// Get business days between dates
function getBusinessDaysBetween(
  temporal: Temporal,
  startDate: Date,
  endDate: Date
): Period[] {
  const range = createCustomPeriod(startDate, endDate)
  const allDays = divide(temporal, range, 'day')
  
  return allDays.filter(isBusinessDay)
}

// Calculate business days difference
function businessDaysDiff(
  temporal: Temporal,
  startDate: Date,
  endDate: Date
): number {
  const businessDays = getBusinessDaysBetween(temporal, startDate, endDate)
  return businessDays.length
}
```

## Working Hours

```typescript
// Define working hours
interface WorkingHours {
  start: number  // Hour in 24h format
  end: number
  timezone?: string
}

const defaultWorkingHours: WorkingHours = {
  start: 9,
  end: 17,
  timezone: 'America/New_York'
}

// Check if time is within working hours
function isWorkingHour(date: Date, hours = defaultWorkingHours): boolean {
  const hour = date.getHours()
  return hour >= hours.start && hour < hours.end
}

// Get next working hour
function nextWorkingHour(
  temporal: Temporal,
  period: Period,
  hours = defaultWorkingHours
): Period {
  let current = period
  
  // If already in working hours on business day, return current
  if (isBusinessDay(current) && isWorkingHour(current.date, hours)) {
    return current
  }
  
  // Move to next hour
  current = next(temporal, current)
  
  // Skip to next business day if needed
  while (!isBusinessDay(toPeriod(temporal, current.date, 'day'))) {
    const nextDay = nextBusinessDay(temporal, toPeriod(temporal, current.date, 'day'))
    current = toPeriod(temporal, 
      new Date(nextDay.date.setHours(hours.start)), 
      'hour'
    )
  }
  
  // Skip to working hours if needed
  while (!isWorkingHour(current.date, hours)) {
    current = next(temporal, current)
  }
  
  return current
}
```

## Business Calendar Component

```vue
<template>
  <div class="business-calendar">
    <div class="month-grid">
      <div
        v-for="day in days"
        :key="day.date.toISOString()"
        class="day"
        :class="{
          'business-day': isBusinessDay(day),
          'weekend': isWeekend(day),
          'holiday': isHoliday(day.date),
          'today': isToday(day, temporal)
        }"
      >
        <div class="day-number">{{ day.date.getDate() }}</div>
        <div v-if="isHoliday(day.date)" class="holiday-name">
          {{ getHolidayName(day.date) }}
        </div>
      </div>
    </div>
    
    <div class="stats">
      <p>Business days this month: {{ businessDayCount }}</p>
      <p>Working hours: {{ workingHoursCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { divide, isWeekend, isToday } from 'usetemporal'

const props = defineProps({
  temporal: Object,
  month: Object
})

const days = computed(() => divide(props.temporal, props.month, 'day'))

const businessDayCount = computed(() => 
  days.value.filter(isBusinessDay).length
)

const workingHoursCount = computed(() => 
  businessDayCount.value * 8 // 9-5 working hours
)

const getHolidayName = (date) => federalHolidays.getHolidayName(date)
</script>
```

## Deadline Calculations

```typescript
// Calculate deadline considering only business days
function calculateDeadline(
  temporal: Temporal,
  startDate: Date,
  businessDays: number
): Date {
  return addBusinessDays(temporal, startDate, businessDays)
}

// Check if deadline is approaching
function isDeadlineApproaching(
  temporal: Temporal,
  deadline: Date,
  warningDays: number = 3
): boolean {
  const today = new Date()
  const remainingDays = businessDaysDiff(temporal, today, deadline)
  return remainingDays <= warningDays && remainingDays >= 0
}

// Get SLA status
interface SLAConfig {
  businessDays: number
  warningThreshold: number
}

function getSLAStatus(
  temporal: Temporal,
  startDate: Date,
  sla: SLAConfig
): 'on-time' | 'warning' | 'overdue' {
  const deadline = calculateDeadline(temporal, startDate, sla.businessDays)
  const today = new Date()
  
  if (today > deadline) return 'overdue'
  if (isDeadlineApproaching(temporal, deadline, sla.warningThreshold)) return 'warning'
  return 'on-time'
}
```

## Regional Business Days

```typescript
// Different regions have different holidays
class RegionalBusinessCalendar {
  constructor(
    private temporal: Temporal,
    private region: 'US' | 'UK' | 'JP' | 'DE'
  ) {}
  
  private getHolidays(): HolidayRegistry {
    // Return region-specific holidays
    switch (this.region) {
      case 'US': return federalHolidays
      case 'UK': return ukBankHolidays
      case 'JP': return japaneseHolidays
      case 'DE': return germanHolidays
    }
  }
  
  isBusinessDay(date: Date): boolean {
    const period = toPeriod(this.temporal, date, 'day')
    const holidays = this.getHolidays()
    
    return !isWeekend(period) && !holidays.isHoliday(date)
  }
  
  getBusinessDaysInMonth(month: Period): number {
    const days = divide(this.temporal, month, 'day')
    return days.filter(d => this.isBusinessDay(d.date)).length
  }
}
```

## Usage Examples

```typescript
const temporal = createTemporal({ date: new Date() })

// Next business day
const today = toPeriod(temporal, new Date(), 'day')
const nextBizDay = nextBusinessDay(temporal, today)
console.log('Next business day:', nextBizDay.date)

// Project deadline
const projectStart = new Date('2024-03-01')
const deadline = calculateDeadline(temporal, projectStart, 10) // 10 business days
console.log('Project deadline:', deadline)

// Monthly business metrics
const month = toPeriod(temporal, new Date(), 'month')
const bizDays = countBusinessDays(temporal, month)
const workingHours = bizDays * 8
console.log(`This month: ${bizDays} business days, ${workingHours} working hours`)

// Check SLA
const ticketCreated = new Date('2024-03-15')
const slaStatus = getSLAStatus(temporal, ticketCreated, {
  businessDays: 3,
  warningThreshold: 1
})
console.log('SLA Status:', slaStatus)
```

## See Also

- [Time Slots](/examples/recipes/time-slots) - Working with time slots
- [Business Logic Patterns](/guide/patterns/business-logic) - More business patterns
- [isWeekend](/api/utilities/is-weekend) - Weekend detection
- [isWeekday](/api/utilities/is-weekday) - Weekday detection