# Navigation Patterns

Learn how to navigate through time periods using useTemporal's navigation functions: `next`, `previous`, and `go`.

## Core Navigation Functions

### next() - Move Forward

Navigate to the immediately following period:

```typescript
const tomorrow = next(temporal, today)
const nextMonth = next(temporal, currentMonth)
const nextYear = next(temporal, currentYear)
```

### previous() - Move Backward

Navigate to the immediately preceding period:

```typescript
const yesterday = previous(temporal, today)
const lastMonth = previous(temporal, currentMonth)
const lastYear = previous(temporal, currentYear)
```

### go() - Jump Multiple Steps

Navigate multiple periods in either direction:

```typescript
const nextWeek = go(temporal, today, 7)        // 7 days forward
const lastWeek = go(temporal, today, -7)       // 7 days backward
const quarterAhead = go(temporal, month, 3)    // 3 months forward
```

## Common Navigation Patterns

### Calendar Navigation Controls

```typescript
function CalendarControls({ temporal }) {
  const period = temporal.browsing
  
  const handlePrevious = () => {
    temporal.browsing.value = previous(temporal, period.value)
  }
  
  const handleNext = () => {
    temporal.browsing.value = next(temporal, period.value)
  }
  
  const handleToday = () => {
    temporal.browsing.value = toPeriod(
      temporal, 
      temporal.now.value.date, 
      period.value.type
    )
  }
  
  return (
    <div className="calendar-controls">
      <button onClick={handlePrevious}>Previous</button>
      <button onClick={handleToday}>Today</button>
      <button onClick={handleNext}>Next</button>
    </div>
  )
}
```

### Keyboard Navigation

```typescript
function useKeyboardNavigation(temporal: Temporal) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const current = temporal.browsing.value
      
      switch(e.key) {
        case 'ArrowLeft':
          temporal.browsing.value = previous(temporal, current)
          break
        case 'ArrowRight':
          temporal.browsing.value = next(temporal, current)
          break
        case 'ArrowUp':
          // Navigate to larger unit
          if (current.type === 'day') {
            temporal.browsing.value = toPeriod(temporal, current.date, 'week')
          } else if (current.type === 'week') {
            temporal.browsing.value = toPeriod(temporal, current.date, 'month')
          }
          break
        case 'ArrowDown':
          // Navigate to smaller unit
          if (current.type === 'month') {
            temporal.browsing.value = toPeriod(temporal, current.date, 'week')
          } else if (current.type === 'week') {
            temporal.browsing.value = toPeriod(temporal, current.date, 'day')
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [temporal])
}
```

### Date Range Generation

Generate sequences of periods for various use cases:

```typescript
// Generate next N periods
function getNextPeriods(
  start: Period, 
  count: number, 
  temporal: Temporal
): Period[] {
  const periods = [start]
  let current = start
  
  for (let i = 1; i < count; i++) {
    current = next(temporal, current)
    periods.push(current)
  }
  
  return periods
}

// Generate periods between dates
function getPeriodsBetween(
  start: Date,
  end: Date,
  unit: Unit,
  temporal: Temporal
): Period[] {
  const periods = []
  let current = toPeriod(temporal, start, unit)
  const endPeriod = toPeriod(temporal, end, unit)
  
  while (current.start <= endPeriod.start) {
    periods.push(current)
    current = next(temporal, current)
  }
  
  return periods
}
```

### Infinite Scroll Calendar

```typescript
function InfiniteCalendar({ temporal }) {
  const [months, setMonths] = useState<Period[]>([])
  const [centerMonth, setCenterMonth] = useState(temporal.browsing.value)
  
  // Load months around center
  useEffect(() => {
    const before = []
    const after = []
    let current = centerMonth
    
    // Load 3 months before
    for (let i = 0; i < 3; i++) {
      current = previous(temporal, current)
      before.unshift(current)
    }
    
    // Load 3 months after
    current = centerMonth
    for (let i = 0; i < 3; i++) {
      current = next(temporal, current)
      after.push(current)
    }
    
    setMonths([...before, centerMonth, ...after])
  }, [centerMonth, temporal])
  
  // Handle scroll to load more
  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      const firstMonth = months[0]
      const prevMonth = previous(temporal, firstMonth)
      setMonths([prevMonth, ...months.slice(0, -1)])
    } else {
      const lastMonth = months[months.length - 1]
      const nextMonth = next(temporal, lastMonth)
      setMonths([...months.slice(1), nextMonth])
    }
  }
  
  return (
    <div onScroll={handleScroll}>
      {months.map(month => (
        <MonthView key={month.date.toISOString()} month={month} />
      ))}
    </div>
  )
}
```

## Advanced Navigation

### Custom Period Navigation

Navigation works seamlessly with custom periods:

```typescript
const sprint = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-01-14')
)

// Next sprint (same duration)
const nextSprint = next(temporal, sprint)
// Results in: Jan 15 - Jan 28 (14 days)

// Navigate multiple sprints
const futureSprint = go(temporal, sprint, 5)
// Results in: 5 sprints ahead
```

### Boundary-Aware Navigation

Handle special cases like month boundaries:

```typescript
// Navigate months while preserving day
function navigateMonth(
  current: Date, 
  direction: 1 | -1,
  temporal: Temporal
): Date {
  const currentDay = current.getDate()
  const targetMonth = go(
    temporal, 
    toPeriod(temporal, current, 'month'), 
    direction
  )
  
  // Try to preserve the day
  const targetDate = new Date(targetMonth.date)
  targetDate.setDate(currentDay)
  
  // Handle month overflow (e.g., Jan 31 -> Feb 31)
  if (targetDate.getMonth() !== targetMonth.date.getMonth()) {
    // Use last day of month instead
    targetDate.setDate(0)
  }
  
  return targetDate
}
```

### Unit-Switching Navigation

Navigate while changing time units:

```typescript
function SmartNavigation({ temporal }) {
  const switchToUnit = (unit: Unit) => {
    const current = temporal.browsing.value
    temporal.browsing.value = toPeriod(temporal, current.date, unit)
  }
  
  const zoomIn = () => {
    const current = temporal.browsing.value
    const mapping: Record<Unit, Unit> = {
      'year': 'month',
      'month': 'week',
      'week': 'day',
      'day': 'hour'
    }
    
    const nextUnit = mapping[current.type]
    if (nextUnit) {
      switchToUnit(nextUnit)
    }
  }
  
  const zoomOut = () => {
    const current = temporal.browsing.value
    const mapping: Record<Unit, Unit> = {
      'hour': 'day',
      'day': 'week',
      'week': 'month',
      'month': 'year'
    }
    
    const nextUnit = mapping[current.type]
    if (nextUnit) {
      switchToUnit(nextUnit)
    }
  }
  
  return (
    <div>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={zoomIn}>Zoom In</button>
    </div>
  )
}
```

## Performance Tips

### Batch Navigation

When navigating multiple periods, batch operations:

```typescript
// Instead of multiple reactive updates
const periods = []
let current = start
for (let i = 0; i < 100; i++) {
  current = next(temporal, current)
  periods.push(current)
  temporal.browsing.value = current // Triggers update each time
}

// Batch the navigation
const periods = []
let current = start
for (let i = 0; i < 100; i++) {
  current = next(temporal, current)
  periods.push(current)
}
temporal.browsing.value = current // Single update
```

### Preload Adjacent Periods

For smooth navigation, preload adjacent periods:

```typescript
const usePreloadedNavigation = (temporal: Temporal) => {
  const current = computed(() => temporal.browsing.value)
  
  const preloaded = computed(() => ({
    prev: previous(temporal, current.value),
    current: current.value,
    next: next(temporal, current.value)
  }))
  
  const navigateNext = () => {
    temporal.browsing.value = preloaded.value.next
  }
  
  const navigatePrev = () => {
    temporal.browsing.value = preloaded.value.prev
  }
  
  return { navigateNext, navigatePrev, preloaded }
}
```

## See Also

- [API: next()](/api/operations/next) - Next function reference
- [API: previous()](/api/operations/previous) - Previous function reference
- [API: go()](/api/operations/go) - Go function reference
- [Calendar Examples](/examples/calendars/) - Navigation in practice
- [Keyboard Shortcuts](/guide/integrations/keyboard-shortcuts) - Keyboard navigation