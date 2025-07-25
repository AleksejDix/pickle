# Time Analysis Patterns

Learn advanced patterns for analyzing and processing time periods using split, merge, and other operations.

## Flexible Period Splitting

The `split` operation provides three powerful approaches for dividing periods:

### Split by Count

Divide any period into equal parts:

```typescript
import { createTemporal, split, createCustomPeriod } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })

// Split a quarter into 3 equal parts
const quarter = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-03-31')
)

const thirds = split(temporal, quarter, { count: 3 })
// Result: 3 custom periods of ~30 days each

// Split a day into 4 parts (6-hour chunks)
const day = toPeriod(temporal, new Date(), 'day')
const quarters = split(temporal, day, { count: 4 })
// Result: 4 custom periods of 6 hours each
```

### Split by Duration

Create chunks of specific duration:

```typescript
// Split a year into 2-month chunks
const year = toPeriod(temporal, new Date(), 'year')
const bimonthly = split(temporal, year, { 
  duration: { months: 2 } 
})
// Result: 6 periods of 2 months each

// Split a month into weekly chunks
const month = toPeriod(temporal, new Date(), 'month')
const weeks = split(temporal, month, { 
  duration: { weeks: 1 } 
})
// Result: 4-5 week periods

// Split a day into 90-minute intervals
const day = toPeriod(temporal, new Date(), 'day')
const intervals = split(temporal, day, { 
  duration: { hours: 1, minutes: 30 } 
})
// Result: 16 periods of 90 minutes each
```

## Project Planning

Split project timelines into manageable phases:

```typescript
// Split a project timeline into phases
const project = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-12-31')
)

// Equal phases
const phases = split(temporal, project, { count: 5 })
// Result: 5 equal project phases

// Sprint-based
const sprints = split(temporal, project, { 
  duration: { weeks: 2 } 
})
// Result: ~26 two-week sprints

// Quarterly milestones
const quarters = split(temporal, project, { by: 'quarter' })
```

## Data Aggregation

Process large date ranges in batches:

```typescript
// Split data range for batch processing
const dataRange = createCustomPeriod(
  new Date('2023-01-01'),
  new Date('2023-12-31')
)

// Process in monthly batches
const batches = split(temporal, dataRange, { by: 'month' })

for (const batch of batches) {
  await processDataForPeriod(batch)
}

// Or process in 10 equal chunks for parallel processing
const chunks = split(temporal, dataRange, { count: 10 })

await Promise.all(
  chunks.map(chunk => processDataForPeriod(chunk))
)
```

## Time Series Analysis

Analyze trends over different time windows:

```typescript
const yearData = createCustomPeriod(
  new Date('2023-01-01'),
  new Date('2023-12-31')
)

// Weekly analysis
const weeks = split(temporal, yearData, { duration: { weeks: 1 } })
const weeklyAverages = weeks.map(week => ({
  period: week,
  average: calculateAverage(week)
}))

// Monthly comparison
const months = split(temporal, yearData, { by: 'month' })
const monthlyGrowth = months.map((month, i) => ({
  month: month,
  growth: i > 0 ? calculateGrowth(months[i-1], month) : 0
}))

// Quarterly reports
const quarters = split(temporal, yearData, { count: 4 })
quarters.forEach((quarter, i) => {
  generateQuarterlyReport(quarter, i + 1)
})
```

## Handling Edge Cases

### Uneven Splits

When splitting by count, the last period accounts for rounding:

```typescript
const period = createCustomPeriod(
  new Date('2024-01-01'),
  new Date('2024-01-10') // 10 days
)

const parts = split(temporal, period, { count: 3 })
// parts[0]: ~3.33 days
// parts[1]: ~3.33 days  
// parts[2]: ~3.34 days (includes remainder)
```

### Duration Overflow

When splitting by duration, the last period may be shorter:

```typescript
const month = toPeriod(temporal, new Date('2024-02-01'), 'month')
const weeks = split(temporal, month, { 
  duration: { weeks: 1 } 
})
// Last week may be partial (1-3 days in February)
```

### Complex Durations

Multiple duration units are added together:

```typescript
const period = split(temporal, year, { 
  duration: { 
    months: 1, 
    weeks: 2 
  } 
})
// Each chunk is 1 month + 2 weeks (~6 weeks)
```

## Comparison: split vs divide

| Feature | `divide` | `split` |
|---------|----------|---------|
| Split by unit | ✓ | ✓ (with `by` option) |
| Split by count | ✗ | ✓ |
| Split by duration | ✗ | ✓ |
| Returns | Standard periods | Custom periods (except with `by`) |
| Use case | Calendar units | Flexible divisions |

```typescript
// These are equivalent:
divide(temporal, year, 'month')
split(temporal, year, { by: 'month' })

// But split offers more:
split(temporal, year, { count: 10 })      // 10 equal parts
split(temporal, year, { duration: { days: 30 } }) // 30-day chunks
```

## Merging Periods

Combine multiple periods into larger units:

```typescript
// Merge weeks into a month
const weeks = divide(temporal, month, 'week')
const mergedMonth = merge(temporal, weeks)

// Combine business days
const workDays = days.filter(day => !isWeekend(day))
const workPeriod = merge(temporal, workDays)
```

## Advanced Analysis Patterns

### Rolling Windows

```typescript
function rollingAverage(data: Period[], windowSize: number) {
  const results = []
  
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1)
    const merged = merge(temporal, window)
    
    results.push({
      period: merged,
      average: calculateAverage(merged)
    })
  }
  
  return results
}

// 7-day rolling average
const days = divide(temporal, month, 'day')
const rolling7Day = rollingAverage(days, 7)
```

### Period Overlap Detection

```typescript
function findOverlaps(periods: Period[]): Array<[Period, Period]> {
  const overlaps = []
  
  for (let i = 0; i < periods.length - 1; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      if (contains(temporal, periods[i], periods[j].start) ||
          contains(temporal, periods[j], periods[i].start)) {
        overlaps.push([periods[i], periods[j]])
      }
    }
  }
  
  return overlaps
}

// Check meeting conflicts
const meetings = [/* array of meeting periods */]
const conflicts = findOverlaps(meetings)
```

### Gap Analysis

```typescript
function findGaps(periods: Period[], container: Period): Period[] {
  const sorted = periods.sort((a, b) => 
    a.start.getTime() - b.start.getTime()
  )
  
  const gaps = []
  let lastEnd = container.start
  
  for (const period of sorted) {
    if (period.start > lastEnd) {
      gaps.push(createCustomPeriod(lastEnd, period.start))
    }
    lastEnd = period.end > lastEnd ? period.end : lastEnd
  }
  
  if (lastEnd < container.end) {
    gaps.push(createCustomPeriod(lastEnd, container.end))
  }
  
  return gaps
}

// Find free time slots
const meetings = [/* array of meeting periods */]
const workDay = createCustomPeriod(
  new Date('2024-01-15T09:00:00'),
  new Date('2024-01-15T17:00:00')
)
const freeSlots = findGaps(meetings, workDay)
```

## See Also

- [divide() Pattern](/guide/patterns/divide-pattern) - Core division concepts
- [Business Logic Patterns](/guide/patterns/business-logic) - Practical applications
- [split](/api/operations/split) - API reference
- [merge](/api/operations/merge) - API reference