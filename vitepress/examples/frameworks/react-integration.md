# React Integration Examples

Complete examples showing how to use useTemporal with React.

## Basic Setup

### Installation

```bash
npm install usetemporal react react-dom
```

### Creating a Temporal Context

```tsx
// contexts/TemporalContext.tsx
import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { createTemporal, Temporal } from 'usetemporal'

const TemporalContext = createContext<Temporal | null>(null)

interface TemporalProviderProps {
  children: ReactNode
  weekStartsOn?: number
}

export function TemporalProvider({ children, weekStartsOn = 1 }: TemporalProviderProps) {
  const temporal = useMemo(() => 
    createTemporal({ 
      date: new Date(),
      weekStartsOn 
    }), 
    [weekStartsOn]
  )
  
  return (
    <TemporalContext.Provider value={temporal}>
      {children}
    </TemporalContext.Provider>
  )
}

export function useTemporal() {
  const temporal = useContext(TemporalContext)
  if (!temporal) {
    throw new Error('useTemporal must be used within TemporalProvider')
  }
  return temporal
}
```

## Custom Hooks

Create React hooks for useTemporal functionality:

```tsx
// hooks/useTemporalPeriod.ts
import { useState, useEffect } from 'react'
import { usePeriod as useTemporalPeriod, Period, Unit } from 'usetemporal'
import { useTemporal } from '../contexts/TemporalContext'

export function usePeriod(unit: Unit) {
  const temporal = useTemporal()
  const period = useTemporalPeriod(temporal, unit)
  const [value, setValue] = useState<Period>(period.value)
  
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = period.effect(() => {
      setValue(period.value)
    })
    
    return unsubscribe
  }, [period])
  
  return value
}
```

## Calendar Component

A complete calendar component with navigation:

```tsx
import React, { useMemo, useState } from 'react'
import { createTemporal, usePeriod, divide, next, previous, isSame } from 'usetemporal'
import './Calendar.css'

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
  weekStartsOn?: number
}

export function Calendar({ value, onChange, weekStartsOn = 1 }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(value)
  
  const temporal = useMemo(() => 
    createTemporal({ 
      date: selectedDate || new Date(),
      weekStartsOn 
    }), 
    [weekStartsOn]
  )
  
  const month = usePeriod(temporal, 'month')
  
  const monthTitle = useMemo(() => 
    month.value.date.toLocaleDateString('en', { 
      month: 'long', 
      year: 'numeric' 
    }),
    [month.value]
  )
  
  const weekDays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)]
  }, [weekStartsOn])
  
  const calendarDays = useMemo(() => {
    const days = divide(temporal, month.value, 'day')
    const firstDay = days[0]
    const startPadding = (firstDay.date.getDay() - weekStartsOn + 7) % 7
    
    return [
      ...Array(startPadding).fill(null),
      ...days
    ]
  }, [temporal, month.value, weekStartsOn])
  
  const handlePreviousMonth = () => {
    temporal.browsing.value = previous(temporal, month.value)
  }
  
  const handleNextMonth = () => {
    temporal.browsing.value = next(temporal, month.value)
  }
  
  const handleDateClick = (day: Period | null) => {
    if (day) {
      setSelectedDate(day.date)
      onChange?.(day.date)
    }
  }
  
  const getDayClassName = (day: Period | null) => {
    if (!day) return 'calendar-day empty'
    
    const classes = ['calendar-day']
    
    if (isSame(temporal, day.date, new Date(), 'day')) {
      classes.push('today')
    }
    
    if (selectedDate && isSame(temporal, day.date, selectedDate, 'day')) {
      classes.push('selected')
    }
    
    if (day.date.getDay() === 0 || day.date.getDay() === 6) {
      classes.push('weekend')
    }
    
    return classes.join(' ')
  }
  
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePreviousMonth}>←</button>
        <h2>{monthTitle}</h2>
        <button onClick={handleNextMonth}>→</button>
      </div>
      
      <div className="weekdays">
        {weekDays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={getDayClassName(day)}
            onClick={() => handleDateClick(day)}
          >
            {day && <span>{day.date.getDate()}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Date Picker Component

A date picker with dropdown calendar:

```tsx
import React, { useState, useRef, useEffect } from 'react'
import { Calendar } from './Calendar'
import './DatePicker.css'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
}

export function DatePicker({ 
  value, 
  onChange, 
  format = 'MM/DD/YYYY' 
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value)
  const pickerRef = useRef<HTMLDivElement>(null)
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    
    const pad = (n: number) => String(n).padStart(2, '0')
    
    switch (format) {
      case 'MM/DD/YYYY':
        return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
      case 'DD/MM/YYYY':
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
      case 'YYYY-MM-DD':
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      default:
        return date.toLocaleDateString()
    }
  }
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
    setShowCalendar(false)
  }
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div className="date-picker" ref={pickerRef}>
      <input
        type="text"
        value={formatDate(selectedDate)}
        onClick={() => setShowCalendar(!showCalendar)}
        readOnly
        className="date-input"
      />
      
      {showCalendar && (
        <div className="calendar-dropdown">
          <Calendar
            value={selectedDate}
            onChange={handleDateSelect}
          />
        </div>
      )}
    </div>
  )
}
```

## Time Slots Component

Generate and display available time slots:

```tsx
import React, { useMemo, useState } from 'react'
import { createTemporal, usePeriod, divide } from 'usetemporal'
import './TimeSlots.css'

interface TimeSlot {
  start: Date
  end: Date
  label: string
  available: boolean
}

interface TimeSlotsProps {
  date?: Date
  slotDuration?: number // minutes
  startHour?: number
  endHour?: number
  bookedSlots?: Array<{ start: Date; end: Date }>
  onSlotSelect?: (slot: TimeSlot) => void
}

export function TimeSlots({
  date = new Date(),
  slotDuration = 30,
  startHour = 9,
  endHour = 17,
  bookedSlots = [],
  onSlotSelect
}: TimeSlotsProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  
  const temporal = useMemo(() => 
    createTemporal({ date }), [date]
  )
  
  const day = usePeriod(temporal, 'day')
  
  const timeSlots = useMemo(() => {
    const hours = divide(temporal, day.value, 'hour')
    const slots: TimeSlot[] = []
    
    hours.forEach(hour => {
      const h = hour.date.getHours()
      if (h >= startHour && h < endHour) {
        const minutes = divide(temporal, hour, 'minute')
        
        for (let i = 0; i < minutes.length; i += slotDuration) {
          if (i + slotDuration <= minutes.length) {
            const start = minutes[i].start
            const end = new Date(start.getTime() + slotDuration * 60000)
            
            // Check if slot is booked
            const isBooked = bookedSlots.some(booking => 
              (start >= booking.start && start < booking.end) ||
              (end > booking.start && end <= booking.end)
            )
            
            slots.push({
              start,
              end,
              label: start.toLocaleTimeString('en', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }),
              available: !isBooked
            })
          }
        }
      }
    })
    
    return slots
  }, [temporal, day.value, startHour, endHour, slotDuration, bookedSlots])
  
  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot)
      onSlotSelect?.(slot)
    }
  }
  
  return (
    <div className="time-slots">
      <h3>Available Times for {date.toLocaleDateString()}</h3>
      
      <div className="slots-grid">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            className={`time-slot ${
              !slot.available ? 'booked' : ''
            } ${
              selectedSlot === slot ? 'selected' : ''
            }`}
            onClick={() => handleSlotClick(slot)}
            disabled={!slot.available}
          >
            {slot.label}
          </button>
        ))}
      </div>
      
      {selectedSlot && (
        <div className="selected-info">
          Selected: {selectedSlot.label} - {
            new Date(selectedSlot.end).toLocaleTimeString('en', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          }
        </div>
      )}
    </div>
  )
}
```

## Live Clock Component

Display current time with reactive updates:

```tsx
import React, { useState, useEffect, useMemo } from 'react'
import { createTemporal, usePeriod, divide } from 'usetemporal'
import './LiveClock.css'

export function LiveClock() {
  const [now, setNow] = useState(new Date())
  
  const temporal = useMemo(() => 
    createTemporal({ 
      date: now,
      now: now
    }), 
    []
  )
  
  // Update temporal's now value when time changes
  useEffect(() => {
    temporal.now.value = { 
      type: 'now', 
      date: now, 
      start: now, 
      end: now 
    }
  }, [now, temporal])
  
  const year = usePeriod(temporal, 'year')
  const month = usePeriod(temporal, 'month')
  const week = usePeriod(temporal, 'week')
  const day = usePeriod(temporal, 'day')
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const timeString = now.toLocaleTimeString('en', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  const dateString = now.toLocaleDateString('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const weekNumber = useMemo(() => {
    const yearStart = year.value.start
    const weeksSinceStart = Math.floor(
      (week.value.start.getTime() - yearStart.getTime()) / 
      (7 * 24 * 60 * 60 * 1000)
    ) + 1
    return weeksSinceStart
  }, [year.value, week.value])
  
  const dayOfYear = useMemo(() => {
    const yearStart = year.value.start
    const daysSinceStart = Math.floor(
      (day.value.start.getTime() - yearStart.getTime()) / 
      (24 * 60 * 60 * 1000)
    ) + 1
    return daysSinceStart
  }, [year.value, day.value])
  
  const monthProgress = useMemo(() => {
    const days = divide(temporal, month.value, 'day')
    const currentDayIndex = days.findIndex(d => 
      d.date.getDate() === now.getDate()
    )
    return Math.round((currentDayIndex + 1) / days.length * 100)
  }, [temporal, month.value, now])
  
  return (
    <div className="live-clock">
      <div className="time-display">{timeString}</div>
      <div className="date-display">{dateString}</div>
      
      <div className="time-stats">
        <div className="stat">
          <span className="label">Week</span>
          <span className="value">{weekNumber}</span>
        </div>
        <div className="stat">
          <span className="label">Day of Year</span>
          <span className="value">{dayOfYear}</span>
        </div>
        <div className="stat">
          <span className="label">Month Progress</span>
          <span className="value">{monthProgress}%</span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${monthProgress}%` }}
        />
      </div>
    </div>
  )
}
```

## Year Overview Component

Display a full year with month statistics:

```tsx
import React, { useMemo } from 'react'
import { createTemporal, usePeriod, divide } from 'usetemporal'
import './YearOverview.css'

interface MonthStats {
  name: string
  days: number
  workDays: number
  weekends: number
}

export function YearOverview({ year = new Date().getFullYear() }) {
  const temporal = useMemo(() => 
    createTemporal({ date: new Date(year, 0, 1) }), 
    [year]
  )
  
  const yearPeriod = usePeriod(temporal, 'year')
  
  const monthStats = useMemo(() => {
    const months = divide(temporal, yearPeriod.value, 'month')
    
    return months.map(month => {
      const days = divide(temporal, month, 'day')
      
      const workDays = days.filter(day => {
        const dow = day.date.getDay()
        return dow >= 1 && dow <= 5
      }).length
      
      const weekends = days.filter(day => {
        const dow = day.date.getDay()
        return dow === 0 || dow === 6
      }).length
      
      return {
        name: month.date.toLocaleDateString('en', { month: 'long' }),
        days: days.length,
        workDays,
        weekends
      }
    })
  }, [temporal, yearPeriod.value])
  
  const yearStats = useMemo(() => {
    const totals = monthStats.reduce((acc, month) => ({
      days: acc.days + month.days,
      workDays: acc.workDays + month.workDays,
      weekends: acc.weekends + month.weekends
    }), { days: 0, workDays: 0, weekends: 0 })
    
    return totals
  }, [monthStats])
  
  return (
    <div className="year-overview">
      <h2>Year {year} Overview</h2>
      
      <div className="year-stats">
        <div className="stat-card">
          <h3>Total Days</h3>
          <p>{yearStats.days}</p>
        </div>
        <div className="stat-card">
          <h3>Work Days</h3>
          <p>{yearStats.workDays}</p>
        </div>
        <div className="stat-card">
          <h3>Weekend Days</h3>
          <p>{yearStats.weekends}</p>
        </div>
      </div>
      
      <div className="months-grid">
        {monthStats.map((month, index) => (
          <div key={index} className="month-card">
            <h4>{month.name}</h4>
            <div className="month-details">
              <div>Days: {month.days}</div>
              <div>Work: {month.workDays}</div>
              <div>Weekend: {month.weekends}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## See Also

- [Vue Integration Examples](/examples/frameworks/vue-integration)
- [Getting Started Guide](/guide/getting-started)
- [Core Concepts](/guide/core-concepts)
- [API Reference](/api/)