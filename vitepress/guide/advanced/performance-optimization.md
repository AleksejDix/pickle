# Performance Optimization

Best practices for optimizing useTemporal applications for maximum performance.

## Progressive Division Strategy

The divide() function is powerful but can create many objects if used carelessly. Follow these patterns for optimal performance:

### ❌ Inefficient: Creating Too Many Objects

```typescript
// Don't create all subdivisions at once
const year = usePeriod(temporal, 'year')
const allSeconds = year.value
  |> (y) => divide(temporal, y, 'month')
  |> (months) => months.flatMap(m => divide(temporal, m, 'day'))
  |> (days) => days.flatMap(d => divide(temporal, d, 'hour'))
  |> (hours) => hours.flatMap(h => divide(temporal, h, 'minute'))
  |> (minutes) => minutes.flatMap(m => divide(temporal, m, 'second'))
// This creates 31,536,000+ objects!
```

### ✅ Efficient: Divide Only What You Need

```typescript
// Better: Divide progressively based on view requirements
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

// Only divide specific days when needed
if (needHourlyView) {
  const todayHours = divide(temporal, days[14], 'hour')
}
```

## Memoization Strategies

### Using Computed Values

Results are automatically memoized when using reactive computed values:

```typescript
import { computed } from '@vue/reactivity'

// Results are cached until dependencies change
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

// days.value is only recalculated when month changes
```

### Manual Memoization for Non-Reactive Code

```typescript
// Cache expensive calculations
const cache = new Map()

function getCachedDivision(temporal, period, unit) {
  const key = `${period.start.toISOString()}-${unit}`
  
  if (!cache.has(key)) {
    cache.set(key, divide(temporal, period, unit))
  }
  
  return cache.get(key)
}
```

## Lazy Loading Patterns

### On-Demand Division

Load time divisions only when the user needs them:

```typescript
// Calendar component with lazy month loading
const visibleMonths = ref(new Set())

function loadMonth(monthPeriod) {
  const monthKey = monthPeriod.start.toISOString()
  
  if (!visibleMonths.value.has(monthKey)) {
    const days = divide(temporal, monthPeriod, 'day')
    visibleMonths.value.add(monthKey)
    // Store days for rendering
  }
}
```

### Viewport-Based Loading

For large time ranges, only load what's visible:

```typescript
// Year view with viewport detection
function YearCalendar() {
  const [visibleMonths, setVisibleMonths] = useState(new Set())
  
  const handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const monthIndex = entry.target.dataset.month
        loadMonthData(monthIndex)
      }
    })
  }
  
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection)
    // Observe month containers
    return () => observer.disconnect()
  }, [])
}
```

## Bundle Size Optimization

### Tree Shaking

Import only what you need:

```typescript
// ❌ Imports everything
import * as useTemporal from 'usetemporal'

// ✅ Imports only needed functions
import { createTemporal, usePeriod, divide } from 'usetemporal'
```

### Adapter Selection

Choose the right adapter for your needs:

```typescript
// Smallest bundle: Native adapter (0 dependencies)
import { createTemporal } from 'usetemporal'

// Larger bundle: External library adapters
import { createTemporal } from '@usetemporal/core'
import { createLuxonAdapter } from '@usetemporal/adapter-luxon'
```

## Memory Management

### Cleanup Unused Periods

```typescript
// Vue example with proper cleanup
onUnmounted(() => {
  // Clear any cached data
  periodCache.clear()
  
  // Stop any reactive effects
  stopWatching()
})
```

### Limit Stored History

```typescript
// Keep only recent calculations
const MAX_CACHE_SIZE = 100
const recentCalculations = new Map()

function addToCache(key, value) {
  if (recentCalculations.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = recentCalculations.keys().next().value
    recentCalculations.delete(firstKey)
  }
  
  recentCalculations.set(key, value)
}
```

## Reactive Performance

### Batch Updates

Group multiple temporal updates:

```typescript
// ❌ Multiple reactive updates
temporal.browsing.value = nextMonth
selectedDay.value = firstDayOfMonth
highlightedWeek.value = firstWeek

// ✅ Batch updates
import { batch } from '@vue/reactivity'

batch(() => {
  temporal.browsing.value = nextMonth
  selectedDay.value = firstDayOfMonth
  highlightedWeek.value = firstWeek
})
```

### Debounce Expensive Operations

```typescript
import { debounce } from 'lodash-es'

const debouncedCalculation = debounce((temporal, period) => {
  // Expensive calculation
  const analysis = analyzeTimeRange(temporal, period)
  updateUI(analysis)
}, 300)

// In reactive effect
watchEffect(() => {
  debouncedCalculation(temporal, month.value)
})
```

## Rendering Optimization

### Virtual Scrolling for Large Ranges

```typescript
// Render only visible time periods
function VirtualCalendar({ years }) {
  const rowHeight = 300 // Height of month row
  const visibleRows = 4 // Number of visible months
  
  return (
    <VirtualList
      height={rowHeight * visibleRows}
      itemCount={years * 12}
      itemSize={rowHeight}
      renderItem={({ index, style }) => (
        <div style={style}>
          <MonthCalendar monthIndex={index} />
        </div>
      )}
    />
  )
}
```

### Minimize Re-renders

```typescript
// React: Use memo for expensive components
const DayCell = React.memo(({ day, isSelected, onSelect }) => {
  return (
    <div 
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(day)}
    >
      {day.date.getDate()}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.day.date.getTime() === nextProps.day.date.getTime() &&
         prevProps.isSelected === nextProps.isSelected
})
```

## Benchmarking

### Measure Performance

```typescript
function measureDividePerformance() {
  const temporal = createTemporal({ date: new Date() })
  const year = usePeriod(temporal, 'year')
  
  console.time('divide-year-to-days')
  const months = divide(temporal, year.value, 'month')
  const allDays = months.flatMap(m => divide(temporal, m, 'day'))
  console.timeEnd('divide-year-to-days')
  
  console.log(`Created ${allDays.length} day objects`)
}
```

### Profile Memory Usage

```typescript
if (typeof performance !== 'undefined' && performance.memory) {
  const before = performance.memory.usedJSHeapSize
  
  // Perform operations
  const periods = generateManyPeriods()
  
  const after = performance.memory.usedJSHeapSize
  console.log(`Memory used: ${(after - before) / 1024 / 1024} MB`)
}
```

## Best Practices Summary

1. **Divide Progressively**: Only create the time divisions you need
2. **Use Memoization**: Cache expensive calculations
3. **Lazy Load**: Load data on-demand, especially for large date ranges
4. **Optimize Bundle**: Import only what you need
5. **Manage Memory**: Clean up unused data and limit cache sizes
6. **Batch Updates**: Group reactive updates together
7. **Virtual Rendering**: Use virtual scrolling for large lists
8. **Profile Performance**: Measure and optimize bottlenecks

## See Also

- [Core Concepts](/guide/core-concepts)
- [divide() Pattern Guide](/guide/divide-pattern)
- [Performance Guide](/guide/performance)