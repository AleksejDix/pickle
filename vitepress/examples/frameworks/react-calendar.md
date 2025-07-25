# React Calendar

A complete calendar implementation using React and useTemporal.

## Full Calendar Component

```jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createTemporal, usePeriod, next, previous, toPeriod, divide, createPeriod, isSame, isToday, isWeekend } from 'usetemporal'
import CalendarHeader from './CalendarHeader'
import CalendarSidebar from './CalendarSidebar'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'

function Calendar() {
  // Initialize temporal
  const [temporal] = useState(() => 
    createTemporal({ 
      date: new Date(),
      now: { interval: 60000 } // Update "now" every minute
    })
  )
  
  // State
  const [view, setView] = useState('month')
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  
  // Get current period using custom hook
  const period = useTemporalPeriod(temporal, view)
  
  // View components map
  const viewComponents = {
    month: MonthView,
    week: WeekView,
    day: DayView
  }
  
  const ViewComponent = viewComponents[view]
  
  // Navigation handlers
  const handleNavigate = useCallback((direction) => {
    if (direction === 'next') {
      temporal.browsing.value = next(temporal, period)
    } else if (direction === 'previous') {
      temporal.browsing.value = previous(temporal, period)
    } else if (direction === 'today') {
      temporal.browsing.value = toPeriod(temporal, new Date(), view)
    }
  }, [temporal, period, view])
  
  // Date selection
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date)
    
    // Navigate to day view on selection
    if (view !== 'day') {
      temporal.browsing.value = toPeriod(temporal, date, 'day')
      setView('day')
    }
  }, [temporal, view])
  
  // Load events when period changes
  useEffect(() => {
    loadEventsForPeriod(period).then(setEvents)
  }, [period])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === 'ArrowLeft') {
        handleNavigate('previous')
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next')
      } else if (e.key === 't') {
        handleNavigate('today')
      }
    }
    
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [handleNavigate])
  
  return (
    <div className="calendar-app">
      <CalendarHeader
        period={period}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
      />
      
      <ViewComponent
        temporal={temporal}
        period={period}
        events={events}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      <CalendarSidebar
        temporal={temporal}
        selectedDate={selectedDate}
        events={events}
      />
    </div>
  )
}

// Custom hook for reactive period
function useTemporalPeriod(temporal, unit) {
  const [period, setPeriod] = useState(() => 
    usePeriod(temporal, unit).value
  )
  
  useEffect(() => {
    const unwatch = temporal.browsing.watch(() => {
      setPeriod(usePeriod(temporal, unit).value)
    })
    
    return unwatch
  }, [temporal, unit])
  
  return period
}

export default Calendar
```

## Calendar Header Component

```jsx
import React from 'react'

function CalendarHeader({ period, view, onViewChange, onNavigate }) {
  const views = ['month', 'week', 'day']
  
  const periodTitle = useMemo(() => {
    const date = period.date
    const formatters = {
      month: () => date.toLocaleDateString('en', { month: 'long', year: 'numeric' }),
      week: () => `Week of ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
      day: () => date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
    return formatters[view]()
  }, [period, view])
  
  return (
    <header className="calendar-header">
      <div className="nav-controls">
        <button onClick={() => onNavigate('today')}>Today</button>
        <button onClick={() => onNavigate('previous')}>&lt;</button>
        <button onClick={() => onNavigate('next')}>&gt;</button>
      </div>
      
      <h1 className="period-title">{periodTitle}</h1>
      
      <div className="view-controls">
        {views.map(v => (
          <button
            key={v}
            className={view === v ? 'active' : ''}
            onClick={() => onViewChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </header>
  )
}

export default CalendarHeader
```

## Month View Component

```jsx
import React, { useMemo } from 'react'
import { divide, createPeriod, isSame, isToday, isWeekend } from 'usetemporal'

function MonthView({ temporal, period, events, selectedDate, onDateSelect }) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Use stable month for consistent 6-week grid
  const stableMonth = useMemo(() => 
    createPeriod(temporal, 'stableMonth', period),
    [temporal, period]
  )
  
  const days = useMemo(() => 
    divide(temporal, stableMonth, 'day'),
    [temporal, stableMonth]
  )
  
  const getDayClasses = (day) => {
    const classes = ['day-cell']
    
    if (!isSame(temporal, day, period, 'month')) {
      classes.push('other-month')
    }
    if (isToday(day, temporal)) {
      classes.push('today')
    }
    if (isWeekend(day)) {
      classes.push('weekend')
    }
    if (selectedDate && isSame(temporal, day, toPeriod(temporal, selectedDate, 'day'), 'day')) {
      classes.push('selected')
    }
    if (getEventsForDay(day).length > 0) {
      classes.push('has-events')
    }
    
    return classes.join(' ')
  }
  
  const getEventsForDay = (day) => {
    return events.filter(event => 
      isSame(temporal,
        toPeriod(temporal, event.date, 'day'),
        day,
        'day'
      )
    )
  }
  
  return (
    <div className="month-view">
      <div className="weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="days-grid">
        {days.map(day => (
          <div
            key={day.date.toISOString()}
            className={getDayClasses(day)}
            onClick={() => onDateSelect(day.date)}
          >
            <div className="day-number">{day.date.getDate()}</div>
            <div className="day-events">
              {getEventsForDay(day).map(event => (
                <div
                  key={event.id}
                  className="event-dot"
                  style={{ backgroundColor: event.color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthView
```

## Using React Hooks

```jsx
import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react'
import { createTemporal, usePeriod, next, previous, toPeriod } from 'usetemporal'

// Custom hook for temporal reactivity
function useTemporalValue(getValue) {
  return useSyncExternalStore(
    useCallback((callback) => getValue().watch(callback), [getValue]),
    useCallback(() => getValue().value, [getValue])
  )
}

// Calendar hook
function useCalendar(initialDate = new Date()) {
  const [temporal] = useState(() => createTemporal({ date: initialDate }))
  const [view, setView] = useState('month')
  
  // Get reactive period
  const period = useTemporalValue(
    useCallback(() => usePeriod(temporal, view), [temporal, view])
  )
  
  // Navigation methods
  const navigate = useMemo(() => ({
    next: () => temporal.browsing.value = next(temporal, period),
    previous: () => temporal.browsing.value = previous(temporal, period),
    today: () => temporal.browsing.value = toPeriod(temporal, new Date(), view),
    toDate: (date) => temporal.browsing.value = toPeriod(temporal, date, view)
  }), [temporal, period, view])
  
  // Get visible periods
  const visiblePeriods = useMemo(() => {
    if (view === 'month') {
      const stable = createPeriod(temporal, 'stableMonth', period)
      return divide(temporal, stable, 'day')
    }
    return divide(temporal, period, 'day')
  }, [temporal, period, view])
  
  return {
    temporal,
    view,
    setView,
    period,
    visiblePeriods,
    navigate
  }
}

// Usage
function CalendarApp() {
  const {
    temporal,
    view,
    setView,
    period,
    visiblePeriods,
    navigate
  } = useCalendar()
  
  return (
    <div>
      <button onClick={navigate.previous}>Previous</button>
      <button onClick={navigate.today}>Today</button>
      <button onClick={navigate.next}>Next</button>
      
      <div className="calendar-grid">
        {visiblePeriods.map(day => (
          <div key={day.date.toISOString()}>
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Integration with Redux Toolkit

```javascript
// store/calendarSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { createTemporal, next, previous, toPeriod } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    view: 'month',
    selectedDate: null,
    browsingDate: temporal.browsing.value.date.toISOString(),
    events: []
  },
  reducers: {
    navigateNext(state) {
      const period = usePeriod(temporal, state.view).value
      temporal.browsing.value = next(temporal, period)
      state.browsingDate = temporal.browsing.value.date.toISOString()
    },
    
    navigatePrevious(state) {
      const period = usePeriod(temporal, state.view).value
      temporal.browsing.value = previous(temporal, period)
      state.browsingDate = temporal.browsing.value.date.toISOString()
    },
    
    navigateToday(state) {
      temporal.browsing.value = toPeriod(temporal, new Date(), state.view)
      state.browsingDate = temporal.browsing.value.date.toISOString()
    },
    
    changeView(state, action) {
      state.view = action.payload
    },
    
    selectDate(state, action) {
      state.selectedDate = action.payload
    },
    
    setEvents(state, action) {
      state.events = action.payload
    }
  }
})

export const {
  navigateNext,
  navigatePrevious,
  navigateToday,
  changeView,
  selectDate,
  setEvents
} = calendarSlice.actions

export default calendarSlice.reducer

// Selectors
export const selectCurrentPeriod = (state) => {
  return usePeriod(temporal, state.calendar.view).value
}
```

## Server Components (Next.js 13+)

```jsx
// app/calendar/page.jsx
import { createTemporal, usePeriod, divide } from 'usetemporal'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  // Server-side temporal
  const temporal = createTemporal({ date: new Date() })
  const month = usePeriod(temporal, 'month').value
  const days = divide(temporal, month, 'day')
  
  // Fetch events on server
  const events = await fetchEvents({
    start: month.start,
    end: month.end
  })
  
  // Serialize for client
  const initialData = {
    month: {
      start: month.start.toISOString(),
      end: month.end.toISOString(),
      type: month.type
    },
    days: days.map(d => ({
      date: d.date.toISOString(),
      start: d.start.toISOString(),
      end: d.end.toISOString()
    })),
    events
  }
  
  return <CalendarClient initialData={initialData} />
}
```

## See Also

- [Month Calendar](/examples/calendars/month-calendar) - Month view patterns
- [Reactive Time Units](/guide/reactive-time-units) - React integration
- [Framework Agnostic](/guide/framework-agnostic) - Core concepts
- [Vue Calendar](/examples/frameworks/vue-calendar) - Vue implementation