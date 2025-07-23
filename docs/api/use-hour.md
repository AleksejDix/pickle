# useHour()

Creates a reactive hour time unit that provides hour-level operations and information.

## Syntax

```typescript
useHour(temporal: Temporal, date?: Date): TimeUnit
```

## Parameters

- **temporal** `Temporal` - The temporal instance created by `createTemporal()`
- **date** `Date` *(optional)* - Initial date. Defaults to current date if not provided

## Returns

`TimeUnit` - A reactive hour unit with the following properties:

```typescript
interface TimeUnit {
  name: Ref<string>      // Hour in 12-hour format (e.g., "3 PM")
  number: Ref<number>    // Hour in 24-hour format (0-23)
  start: Ref<Date>       // Start of hour (XX:00:00)
  end: Ref<Date>         // End of hour (XX:59:59)
  
  past(): void           // Navigate to previous hour
  future(): void         // Navigate to next hour  
  now(): void           // Navigate to current hour
}
```

## Examples

### Basic Usage

```typescript
import { createTemporal, useHour } from 'usetemporal'

const temporal = createTemporal()
const hour = useHour(temporal)

console.log(hour.name.value)   // "3 PM"
console.log(hour.number.value) // 15 (3 PM in 24-hour format)
console.log(hour.start.value)  // Date: 2024-03-15T15:00:00
console.log(hour.end.value)    // Date: 2024-03-15T15:59:59
```

### Navigation

```typescript
const hour = useHour(temporal)

// Navigate through hours
hour.future()  // Move to next hour
console.log(hour.name.value) // "4 PM"

hour.past()    // Move to previous hour
hour.past()    // Move back another hour
console.log(hour.name.value) // "2 PM"

hour.now()     // Return to current hour
```

### Hour Divisions

```typescript
const hour = useHour(temporal)

// Divide hour into minutes
const minutes = temporal.divide(hour, 'minute')
console.log(minutes.length) // 60

// Create 15-minute intervals
const quarters = minutes.filter((_, index) => index % 15 === 0)
quarters.forEach(minute => {
  console.log(minute.name.value) // "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM"
})

// Divide hour into seconds
const seconds = temporal.divide(hour, 'second')
console.log(seconds.length) // 3600
```

### Cross-Day Navigation

```typescript
// Start at end of day
const temporal = createTemporal()
const hour = useHour(temporal, new Date('2024-03-15T23:30:00'))

console.log(hour.name.value)   // "11 PM"
console.log(hour.number.value) // 23

hour.future() // Navigate to next hour
console.log(hour.name.value)   // "12 AM"
console.log(hour.number.value) // 0
// Day automatically updates when crossing midnight
```

## Use Cases

### Time Picker

```typescript
function TimePicker() {
  const temporal = createTemporal()
  const selectedHour = useHour(temporal)
  const selectedMinute = useMinute(temporal)
  
  const hours = computed(() => {
    const day = useDay(temporal)
    return temporal.divide(day, 'hour').map(hour => ({
      value: hour.number.value,
      label: hour.name.value,
      isPM: hour.number.value >= 12
    }))
  })
  
  const minutes = computed(() => {
    return temporal.divide(selectedHour, 'minute')
      .filter((_, index) => index % 5 === 0) // 5-minute intervals
      .map(minute => ({
        value: minute.number.value,
        label: minute.number.value.toString().padStart(2, '0')
      }))
  })
  
  const setTime = (hour: number, minute: number) => {
    // Navigate to specific hour
    while (selectedHour.number.value !== hour) {
      if (selectedHour.number.value < hour) {
        selectedHour.future()
      } else {
        selectedHour.past()
      }
    }
    
    // Then set minute within that hour
    const hourMinutes = temporal.divide(selectedHour, 'minute')
    selectedMinute = hourMinutes[minute]
  }
  
  return {
    hours,
    minutes,
    selectedTime: computed(() => 
      `${selectedHour.name.value}:${selectedMinute.number.value.toString().padStart(2, '0')}`
    ),
    setTime
  }
}
```

### Hourly Schedule

```typescript
function HourlySchedule() {
  const temporal = createTemporal()
  const day = useDay(temporal)
  
  const schedule = computed(() => {
    const hours = temporal.divide(day, 'hour')
    
    return hours.map(hour => ({
      time: hour.name.value,
      hour24: hour.number.value,
      isBusinessHour: hour.number.value >= 9 && hour.number.value < 17,
      isPast: hour.end.value < new Date(),
      isCurrent: new Date() >= hour.start.value && new Date() <= hour.end.value,
      slots: temporal.divide(hour, 'minute')
        .filter((_, i) => i % 30 === 0) // 30-minute slots
        .map(slot => ({
          time: `${hour.number.value}:${slot.number.value.toString().padStart(2, '0')}`,
          available: true // Add your availability logic
        }))
    }))
  })
  
  return {
    date: computed(() => day.start.value.toLocaleDateString()),
    schedule,
    previousDay: () => day.past(),
    nextDay: () => day.future()
  }
}
```

### Time Zone Display

```typescript
function TimeZoneDisplay() {
  const temporal = createTemporal()
  const localHour = useHour(temporal)
  
  // Different time zones (example with luxon adapter)
  const timeZones = [
    { name: 'Local', offset: 0 },
    { name: 'New York', offset: -5 },
    { name: 'London', offset: 0 },
    { name: 'Tokyo', offset: 9 }
  ]
  
  const worldTimes = computed(() => {
    return timeZones.map(tz => {
      const tzHour = (localHour.number.value + tz.offset + 24) % 24
      const isPM = tzHour >= 12
      const displayHour = tzHour === 0 ? 12 : (tzHour > 12 ? tzHour - 12 : tzHour)
      
      return {
        zone: tz.name,
        time: `${displayHour} ${isPM ? 'PM' : 'AM'}`,
        hour24: tzHour,
        isBusinessHour: tzHour >= 9 && tzHour < 17
      }
    })
  })
  
  return {
    localTime: localHour.name,
    worldTimes,
    refresh: () => localHour.now()
  }
}
```

## Integration Examples

### Vue 3

```vue
<template>
  <div class="hour-selector">
    <h3>Select Time</h3>
    <div class="time-display">
      {{ hour.name.value }}:{{ minute.toString().padStart(2, '0') }}
    </div>
    
    <div class="controls">
      <button @click="hour.past()">-1h</button>
      <button @click="adjustMinutes(-15)">-15m</button>
      <button @click="adjustMinutes(15)">+15m</button>
      <button @click="hour.future()">+1h</button>
    </div>
    
    <button @click="setCurrentTime()">Now</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createTemporal, useHour, useMinute } from 'usetemporal'

const temporal = createTemporal()
const hour = useHour(temporal)
const currentMinute = useMinute(temporal)
const minute = ref(currentMinute.number.value)

const adjustMinutes = (amount) => {
  minute.value = (minute.value + amount + 60) % 60
  if (minute.value < 0 && amount < 0) {
    hour.past()
  } else if (minute.value === 0 && amount > 0) {
    hour.future()
  }
}

const setCurrentTime = () => {
  hour.now()
  minute.value = new Date().getMinutes()
}
</script>
```

### React

```jsx
import { useState, useEffect } from 'react'
import { createTemporal, useHour } from 'usetemporal'

function HourlyTimeline() {
  const [temporal] = useState(() => createTemporal())
  const [currentHour] = useState(() => useHour(temporal))
  const [hourData, setHourData] = useState({
    name: currentHour.name.value,
    number: currentHour.number.value
  })
  
  useEffect(() => {
    const subscriptions = [
      currentHour.name.subscribe(name => 
        setHourData(prev => ({ ...prev, name }))),
      currentHour.number.subscribe(number => 
        setHourData(prev => ({ ...prev, number })))
    ]
    
    return () => subscriptions.forEach(unsub => unsub())
  }, [currentHour])
  
  // Get surrounding hours
  const getTimelineHours = () => {
    const hours = []
    const tempHour = useHour(temporal, currentHour.start.value)
    
    // Get 2 hours before
    tempHour.past()
    tempHour.past()
    
    // Collect 5 hours total
    for (let i = 0; i < 5; i++) {
      hours.push({
        name: tempHour.name.value,
        number: tempHour.number.value,
        isCurrent: tempHour.number.value === hourData.number
      })
      tempHour.future()
    }
    
    return hours
  }
  
  return (
    <div>
      <h2>Hourly Timeline</h2>
      <div className="timeline">
        {getTimelineHours().map((hour, index) => (
          <div 
            key={index}
            className={hour.isCurrent ? 'current' : ''}
          >
            {hour.name}
          </div>
        ))}
      </div>
      <button onClick={() => currentHour.now()}>Current Hour</button>
    </div>
  )
}
```

## Format Options

Hour formatting varies by adapter and locale:

```typescript
// Default format (12-hour with AM/PM)
const hour = useHour(temporal)
console.log(hour.name.value) // "3 PM"

// Access 24-hour format
console.log(hour.number.value) // 15

// Custom formatting with adapters
import { luxonAdapter } from '@usetemporal/adapter-luxon'
const temporal = createTemporal({
  adapter: luxonAdapter({ 
    hour12: false // Use 24-hour format
  })
})
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import type { Temporal, TimeUnit } from 'usetemporal'

const temporal: Temporal = createTemporal()
const hour: TimeUnit = useHour(temporal)

// Type-safe access
const hourName: string = hour.name.value    // "3 PM", "12 AM", etc.
const hourNumber: number = hour.number.value // 0-23
const hourStart: Date = hour.start.value
const hourEnd: Date = hour.end.value

// Methods are typed
hour.past()    // void
hour.future()  // void
hour.now()     // void
```

## Performance Notes

- Hour units are lightweight and efficient
- Navigation handles day boundaries automatically
- Time formatting is cached for performance

## Related

- [createTemporal()](/api/create-temporal) - Create temporal instance
- [divide()](/api/divide) - Divide hours into minutes or seconds
- [useDay()](/api/use-day) - Day-level operations
- [useMinute()](/api/use-minute) - Minute-level operations
- [useSecond()](/api/use-second) - Second-level operations