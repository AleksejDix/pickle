# Time Slots

Patterns for managing appointment slots, schedules, and time-based reservations.

## Basic Time Slot Generation

```typescript
import { createTemporal, split, createCustomPeriod } from 'usetemporal'

// Generate time slots for a period
function generateTimeSlots(
  temporal: Temporal,
  period: Period,
  slotDuration: { hours?: number; minutes?: number }
): Period[] {
  return split(temporal, period, { duration: slotDuration })
}

// Create appointment slots for a day
const temporal = createTemporal({ date: new Date() })
const workDay = createCustomPeriod(
  new Date('2024-03-15T09:00:00'),
  new Date('2024-03-15T17:00:00')
)

// Generate 30-minute slots
const slots = generateTimeSlots(temporal, workDay, { minutes: 30 })
// Result: 16 thirty-minute slots from 9:00 to 17:00
```

## Availability Management

```typescript
interface TimeSlot {
  period: Period
  available: boolean
  bookedBy?: string
  type?: 'regular' | 'break' | 'blocked'
}

class ScheduleManager {
  private slots: Map<string, TimeSlot> = new Map()
  
  constructor(private temporal: Temporal) {}
  
  // Generate slots with availability
  generateDaySchedule(
    date: Date,
    config: {
      start: number  // Hour
      end: number
      slotMinutes: number
      breaks?: Array<{ start: number; end: number }>
    }
  ): TimeSlot[] {
    const dayStart = new Date(date)
    dayStart.setHours(config.start, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(config.end, 0, 0, 0)
    
    const workPeriod = createCustomPeriod(dayStart, dayEnd)
    const periods = split(this.temporal, workPeriod, { 
      duration: { minutes: config.slotMinutes } 
    })
    
    return periods.map(period => {
      const slot: TimeSlot = {
        period,
        available: true,
        type: 'regular'
      }
      
      // Mark break times as unavailable
      if (config.breaks) {
        const hour = period.date.getHours()
        const isBreak = config.breaks.some(
          b => hour >= b.start && hour < b.end
        )
        if (isBreak) {
          slot.available = false
          slot.type = 'break'
        }
      }
      
      this.slots.set(this.getSlotKey(period), slot)
      return slot
    })
  }
  
  private getSlotKey(period: Period): string {
    return period.start.toISOString()
  }
  
  // Book a slot
  bookSlot(period: Period, customerName: string): boolean {
    const key = this.getSlotKey(period)
    const slot = this.slots.get(key)
    
    if (!slot || !slot.available) {
      return false
    }
    
    slot.available = false
    slot.bookedBy = customerName
    return true
  }
  
  // Get available slots
  getAvailableSlots(date: Date): TimeSlot[] {
    const daySlots = Array.from(this.slots.values()).filter(slot => {
      const slotDate = slot.period.date
      return slotDate.toDateString() === date.toDateString() && 
             slot.available
    })
    
    return daySlots
  }
}
```

## Recurring Schedules

```typescript
// Define recurring availability
interface RecurringSchedule {
  dayOfWeek: number  // 0-6 (Sunday-Saturday)
  slots: Array<{
    start: string  // "HH:mm"
    end: string
    type?: string
  }>
}

class RecurringScheduleManager {
  constructor(
    private temporal: Temporal,
    private schedule: RecurringSchedule[]
  ) {}
  
  // Generate slots for a week
  generateWeekSchedule(weekPeriod: Period): TimeSlot[] {
    const days = divide(this.temporal, weekPeriod, 'day')
    const allSlots: TimeSlot[] = []
    
    days.forEach(day => {
      const dayOfWeek = day.date.getDay()
      const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek)
      
      if (daySchedule) {
        daySchedule.slots.forEach(slotConfig => {
          const start = this.parseTime(day.date, slotConfig.start)
          const end = this.parseTime(day.date, slotConfig.end)
          const period = createCustomPeriod(start, end)
          
          allSlots.push({
            period,
            available: true,
            type: slotConfig.type || 'regular'
          })
        })
      }
    })
    
    return allSlots
  }
  
  private parseTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
  }
}

// Example: Doctor's office hours
const doctorSchedule: RecurringSchedule[] = [
  {
    dayOfWeek: 1, // Monday
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" }
    ]
  },
  {
    dayOfWeek: 2, // Tuesday
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" }
    ]
  },
  // ... other days
]
```

## Time Slot UI Component

```vue
<template>
  <div class="time-slot-picker">
    <h3>Select a time slot for {{ formatDate(selectedDate) }}</h3>
    
    <div class="slots-grid">
      <div
        v-for="slot in slots"
        :key="slot.period.start.toISOString()"
        class="slot"
        :class="{
          'available': slot.available,
          'booked': !slot.available && slot.type === 'regular',
          'break': slot.type === 'break',
          'selected': isSelected(slot)
        }"
        @click="selectSlot(slot)"
      >
        <div class="slot-time">
          {{ formatTime(slot.period.start) }}
        </div>
        <div v-if="!slot.available" class="slot-status">
          {{ slot.bookedBy ? 'Booked' : 'Unavailable' }}
        </div>
      </div>
    </div>
    
    <button 
      v-if="selectedSlot"
      @click="confirmBooking"
      class="confirm-button"
    >
      Book {{ formatTime(selectedSlot.period.start) }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  temporal: Object,
  selectedDate: Date,
  scheduleManager: Object
})

const emit = defineEmits(['slot-booked'])

const selectedSlot = ref(null)
const slots = ref([])

// Load slots when date changes
watch(() => props.selectedDate, (date) => {
  if (date) {
    slots.value = props.scheduleManager.generateDaySchedule(date, {
      start: 9,
      end: 17,
      slotMinutes: 30,
      breaks: [{ start: 12, end: 13 }]
    })
  }
}, { immediate: true })

const formatDate = (date) => {
  return date.toLocaleDateString('en', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('en', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })
}

const isSelected = (slot) => {
  return selectedSlot.value?.period.start.getTime() === 
         slot.period.start.getTime()
}

const selectSlot = (slot) => {
  if (slot.available) {
    selectedSlot.value = slot
  }
}

const confirmBooking = () => {
  if (selectedSlot.value) {
    emit('slot-booked', selectedSlot.value)
  }
}
</script>

<style scoped>
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
}

.slot {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.slot.available {
  background: white;
}

.slot.available:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.slot.booked {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.slot.break {
  background: #fafafa;
  border-style: dashed;
  cursor: not-allowed;
}

.slot.selected {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}
</style>
```

## Conflict Detection

```typescript
// Check for scheduling conflicts
function hasConflict(
  existingSlots: TimeSlot[],
  newSlot: Period
): boolean {
  return existingSlots.some(slot => {
    if (slot.available) return false
    
    const existingStart = slot.period.start.getTime()
    const existingEnd = slot.period.end.getTime()
    const newStart = newSlot.start.getTime()
    const newEnd = newSlot.end.getTime()
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart)
  })
}

// Merge adjacent slots
function mergeAdjacentSlots(
  temporal: Temporal,
  slots: TimeSlot[]
): TimeSlot[] {
  if (slots.length <= 1) return slots
  
  const sorted = slots.sort((a, b) => 
    a.period.start.getTime() - b.period.start.getTime()
  )
  
  const merged: TimeSlot[] = []
  let current = sorted[0]
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    
    // Check if adjacent and same availability
    if (current.period.end.getTime() === next.period.start.getTime() &&
        current.available === next.available) {
      // Merge
      current = {
        period: createCustomPeriod(current.period.start, next.period.end),
        available: current.available,
        type: current.type
      }
    } else {
      merged.push(current)
      current = next
    }
  }
  
  merged.push(current)
  return merged
}
```

## Service-Based Scheduling

```typescript
interface Service {
  id: string
  name: string
  duration: number  // minutes
  buffer?: number   // buffer time after service
}

class ServiceScheduler {
  constructor(
    private temporal: Temporal,
    private services: Service[]
  ) {}
  
  // Find available slots for a service
  findAvailableSlots(
    date: Date,
    serviceId: string,
    existingBookings: TimeSlot[]
  ): Period[] {
    const service = this.services.find(s => s.id === serviceId)
    if (!service) return []
    
    const totalDuration = service.duration + (service.buffer || 0)
    
    // Get business hours
    const dayStart = new Date(date)
    dayStart.setHours(9, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(17, 0, 0, 0)
    
    const availableSlots: Period[] = []
    let currentTime = dayStart
    
    while (currentTime < dayEnd) {
      const slotEnd = new Date(currentTime)
      slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration)
      
      if (slotEnd <= dayEnd) {
        const potentialSlot = createCustomPeriod(currentTime, slotEnd)
        
        if (!hasConflict(existingBookings, potentialSlot)) {
          availableSlots.push(potentialSlot)
        }
      }
      
      // Move to next potential start time
      currentTime = new Date(currentTime)
      currentTime.setMinutes(currentTime.getMinutes() + 15) // 15-min increments
    }
    
    return availableSlots
  }
}

// Example services
const salonServices: Service[] = [
  { id: 'haircut', name: 'Haircut', duration: 30, buffer: 5 },
  { id: 'color', name: 'Hair Color', duration: 120, buffer: 15 },
  { id: 'style', name: 'Styling', duration: 45, buffer: 5 }
]
```

## Calendar Integration

```typescript
// Sync slots with calendar events
async function syncWithCalendar(
  slots: TimeSlot[],
  calendarApi: any
): Promise<void> {
  const bookedSlots = slots.filter(s => !s.available && s.bookedBy)
  
  for (const slot of bookedSlots) {
    await calendarApi.createEvent({
      title: `Appointment: ${slot.bookedBy}`,
      start: slot.period.start,
      end: slot.period.end,
      status: 'confirmed'
    })
  }
}

// Export to iCal format
function exportToICal(slots: TimeSlot[]): string {
  const events = slots
    .filter(s => !s.available && s.bookedBy)
    .map(slot => {
      const start = formatICalDate(slot.period.start)
      const end = formatICalDate(slot.period.end)
      
      return `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:Appointment - ${slot.bookedBy}
STATUS:CONFIRMED
END:VEVENT`
    })
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//Appointments//EN
${events.join('\n')}
END:VCALENDAR`
}

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}
```

## Usage Example

```typescript
const temporal = createTemporal({ date: new Date() })
const scheduler = new ScheduleManager(temporal)

// Generate schedule for today
const today = new Date()
const todaySlots = scheduler.generateDaySchedule(today, {
  start: 9,
  end: 17,
  slotMinutes: 30,
  breaks: [
    { start: 12, end: 13 }  // Lunch break
  ]
})

// Book a slot
const nineAM = todaySlots.find(s => 
  s.period.date.getHours() === 9 && 
  s.period.date.getMinutes() === 0
)

if (nineAM) {
  const booked = scheduler.bookSlot(nineAM.period, 'John Doe')
  console.log('Booking successful:', booked)
}

// Check availability
const available = scheduler.getAvailableSlots(today)
console.log(`${available.length} slots available today`)

// Service-based booking
const serviceScheduler = new ServiceScheduler(temporal, salonServices)
const hairCutSlots = serviceScheduler.findAvailableSlots(
  today,
  'haircut',
  todaySlots
)
console.log(`${hairCutSlots.length} slots available for haircut`)
```

## See Also

- [Business Days](/examples/recipes/business-days) - Working with business days
- [Time Analysis Patterns](/guide/patterns/time-analysis) - Advanced time analysis
- [split](/api/operations/split) - Split operation for creating slots
- [Business Logic Patterns](/guide/patterns/business-logic) - More scheduling patterns