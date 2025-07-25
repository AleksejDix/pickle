# The divide() Pattern

The `divide()` function is the revolutionary heart of useTemporal. It enables hierarchical time management by splitting any time period into smaller units with perfect synchronization and consistency.

## Why divide() is Revolutionary

Traditional date libraries require separate logic for each time division:

```javascript
// Traditional approach - repetitive and error-prone
const daysInMonth = []
const date = new Date(year, month, 1)
while (date.getMonth() === month) {
  daysInMonth.push(new Date(date))
  date.setDate(date.getDate() + 1)
}

const weeksInMonth = []
// ... more custom logic

const hoursInDay = []
// ... even more custom logic
```

With useTemporal's `divide()`:

```typescript
// Universal approach - works for any time unit
const daysInMonth = divide(temporal, month, 'day')
const weeksInMonth = divide(temporal, month, 'week')
const hoursInDay = divide(temporal, day, 'hour')
const monthsInYear = divide(temporal, year, 'month')
```

## Core Concepts

### Hierarchical Time Management

Time naturally forms a hierarchy. The `divide()` pattern embraces this:

```
year
  └── quarter (3 months)
      └── month
          └── week* / stableMonth*
              └── day
                  └── hour
                      └── minute
                          └── second
```

### Valid Division Patterns

| From | To | Typical Result | Use Case |
|------|----|----------------|----------|
| year | month | 12 months | Year calendar view |
| year | week | 52-53 weeks | Week-based planning |
| year | day | 365-366 days | Day-of-year calculations |
| month | week | 4-6 weeks | Month calendar grid |
| month | day | 28-31 days | Standard calendar |
| week | day | 7 days | Week view |
| day | hour | 24 hours | Daily schedule |
| hour | minute | 60 minutes | Time picker |

## Common Patterns

### Calendar Grid Creation

The most common use of `divide()` is creating calendar grids:

```typescript
const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

// Group days by week for display
const weeks = computed(() => {
  const allDays = days.value
  const weekGroups = []
  
  for (let i = 0; i < allDays.length; i += 7) {
    weekGroups.push(allDays.slice(i, i + 7))
  }
  
  return weekGroups
})
```

### Progressive Division

For performance, divide progressively rather than all at once:

```typescript
// Instead of dividing year → hours directly (8760+ periods)
// Divide progressively as needed
const year = usePeriod(temporal, 'year')
const months = computed(() => divide(temporal, year.value, 'month'))

// Only divide the current month into days
const currentMonth = computed(() => 
  months.value.find(m => isSame(temporal, m, temporal.now.value, 'month'))
)
const days = computed(() => 
  currentMonth.value ? divide(temporal, currentMonth.value, 'day') : []
)
```

### Nested Division

Create complex time structures with nested divisions:

```typescript
// Year overview with months and their weeks
const yearOverview = computed(() => {
  const months = divide(temporal, year.value, 'month')
  
  return months.map(month => ({
    month,
    weeks: divide(temporal, month, 'week'),
    dayCount: divide(temporal, month, 'day').length
  }))
})
```

### Business Logic Patterns

#### Business Days Calculation

```typescript
function getBusinessDays(period: Period, temporal: Temporal): Period[] {
  const allDays = divide(temporal, period, 'day')
  return allDays.filter(day => !isWeekend(day))
}

// Usage
const monthBusinessDays = getBusinessDays(monthPeriod, temporal)
const yearBusinessDays = getBusinessDays(yearPeriod, temporal)
```

#### Time Slot Generation

```typescript
function getAvailableSlots(
  day: Period, 
  temporal: Temporal,
  slotDuration: number = 30 // minutes
): Period[] {
  const hours = divide(temporal, day, 'hour')
  const businessHours = hours.filter(hour => {
    const h = hour.date.getHours()
    return h >= 9 && h < 17 // 9 AM to 5 PM
  })
  
  // Further divide into slots if needed
  return businessHours.flatMap(hour => {
    if (slotDuration === 60) return [hour]
    
    const minutes = divide(temporal, hour, 'minute')
    const slots = []
    for (let i = 0; i < minutes.length; i += slotDuration) {
      slots.push({
        ...minutes[i],
        end: minutes[Math.min(i + slotDuration - 1, minutes.length - 1)].end
      })
    }
    return slots
  })
}
```

### Statistical Analysis

```typescript
// Analyze time distribution
function analyzeYearDistribution(year: Period, temporal: Temporal) {
  const months = divide(temporal, year, 'month')
  
  return months.map(month => {
    const days = divide(temporal, month, 'day')
    const weekendDays = days.filter(isWeekend)
    const weekdays = days.filter(isWeekday)
    
    return {
      month: month.date.toLocaleDateString('en', { month: 'long' }),
      totalDays: days.length,
      weekends: weekendDays.length,
      weekdays: weekdays.length,
      weeks: divide(temporal, month, 'week').length
    }
  })
}
```

## Performance Considerations

### Memoization

For expensive divisions, use memoization:

```typescript
import { computed } from 'vue'

// Vue automatically memoizes computed properties
const yearDays = computed(() => divide(temporal, year.value, 'day'))

// For vanilla JS, use a memoization library or Map
const divisionCache = new Map()
function memoizedDivide(period: Period, unit: Unit): Period[] {
  const key = `${period.start.toISOString()}-${period.end.toISOString()}-${unit}`
  
  if (!divisionCache.has(key)) {
    divisionCache.set(key, divide(temporal, period, unit))
  }
  
  return divisionCache.get(key)
}
```

### Lazy Loading

Only divide what's visible:

```typescript
// Calendar with lazy loading
const visibleMonth = computed(() => temporal.browsing.value)
const visibleDays = computed(() => divide(temporal, visibleMonth.value, 'day'))

// Don't pre-calculate other months until needed
```

### Safety Limits

The divide function has a built-in safety limit of 1000 periods to prevent memory issues. For larger divisions, consider:

1. Progressive loading
2. Pagination
3. Virtual scrolling
4. Server-side calculation

## Advanced Patterns

### Custom Period Division

```typescript
// Divide custom periods like sprints
const sprint = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-01-14')
)

const sprintDays = divide(temporal, sprint, 'day')
const sprintHours = divide(temporal, sprint, 'hour') // 336 hours
```

### Recursive Division

Build complex hierarchies:

```typescript
function buildTimeTree(period: Period, minUnit: Unit = 'day'): TimeNode {
  const node: TimeNode = {
    period,
    children: []
  }
  
  // Determine next smaller unit
  const nextUnit = getNextSmallerUnit(period.type)
  
  if (nextUnit && isLargerOrEqual(nextUnit, minUnit)) {
    node.children = divide(temporal, period, nextUnit)
      .map(child => buildTimeTree(child, minUnit))
  }
  
  return node
}
```

## Integration with Other Patterns

The divide pattern works seamlessly with:

- **Navigation**: Navigate through divided periods
- **Comparison**: Compare periods at different granularities  
- **Reactive Updates**: Divisions update automatically when browsing changes
- **Custom Units**: Divide custom units like fiscal quarters or academic semesters

## See Also

- [API: divide()](/api/operations/divide) - Technical reference
- [Calendar Examples](/examples/calendars/) - Real-world calendar implementations
- [Performance Guide](/guide/advanced/performance) - Optimization techniques
- [Custom Units](/guide/patterns/custom-units) - Creating custom time units