# Operations

All operations in useTemporal are pure functions that work with Period objects.

## Navigation Operations

Move through time periods:

### next()

Move to the next period of the same type:

```typescript
import { next } from 'usetemporal'

const month = usePeriod(temporal, 'month')
const nextMonth = next(temporal, month.value)

// Update browsing to navigate
temporal.browsing.value = nextMonth
```

### previous()

Move to the previous period:

```typescript
import { previous } from 'usetemporal'

const prevMonth = previous(temporal, month.value)
```

### go()

Navigate by multiple steps:

```typescript
import { go } from 'usetemporal'

// Move forward 3 months
const future = go(temporal, month.value, 3)

// Move backward 2 months
const past = go(temporal, month.value, -2)
```

## Comparison Operations

### contains()

Check if a date or period is within another period:

```typescript
import { contains } from 'usetemporal'

const month = usePeriod(temporal, 'month')
const today = new Date()

if (contains(month.value, today)) {
  console.log('Today is in this month')
}

// Also works with periods
const day = usePeriod(temporal, 'day')
if (contains(month.value, day.value)) {
  console.log('Day is within month')
}
```

### isSame()

Check if two dates fall within the same period:

```typescript
import { isSame } from 'usetemporal'

const date1 = new Date('2024-01-15')
const date2 = new Date('2024-01-20')

console.log(isSame(temporal, date1, date2, 'day'))   // false
console.log(isSame(temporal, date1, date2, 'month')) // true
console.log(isSame(temporal, date1, date2, 'year'))  // true
```

## Division Operations

### divide()

The signature operation - divide any period into smaller units:

```typescript
import { divide } from 'usetemporal'

const year = usePeriod(temporal, 'year')
const months = divide(temporal, year.value, 'month')     // 12 periods

const month = months[0]
const days = divide(temporal, month, 'day')              // 28-31 periods

const day = days[0]  
const hours = divide(temporal, day, 'hour')              // 24 periods
```

## Zooming Operations

Navigate between hierarchy levels using composition:

### Zoom Pattern (v2.0+)

The zoom operations have been removed in v2.0.0. Use these patterns instead:

**Zoom In Pattern:**
```typescript
import { divide, contains } from 'usetemporal'

const year = usePeriod(temporal, 'year')

// Get all months in the year
const months = divide(temporal, year.value, 'month')

// Find March (3rd month, 0-indexed)
const march = months[2]

// Or find the month containing a specific date
const targetMonth = months.find(m => contains(m, someDate)) || months[0]
```

**Zoom Out Pattern:**
```typescript
import { createPeriod, toPeriod } from 'usetemporal'

const day = usePeriod(temporal, 'day')

// Zoom out to the containing month
const month = createPeriod(temporal, day.value.date, 'month')

// Zoom out to the containing year
const year = toPeriod(temporal, day.value.date, 'year')
```

**Direct Navigation Pattern:**
```typescript
import { createPeriod } from 'usetemporal'

const hour = usePeriod(temporal, 'hour')

// Navigate from hour to its year
const year = createPeriod(temporal, hour.value.date, 'year')

// Navigate from hour to its month
const month = createPeriod(temporal, hour.value.date, 'month')
```

## Advanced Operations

### split()

Split a period into custom segments:

```typescript
import { split } from 'usetemporal'

const month = usePeriod(temporal, 'month')

// Split into 3 equal parts
const thirds = split(temporal, month.value, { count: 3 })

// Split by duration
const biweekly = split(temporal, month.value, { 
  duration: { weeks: 2 } 
})
```

### merge()

Combine adjacent periods:

```typescript
import { merge } from 'usetemporal'

const week1 = usePeriod(temporal, 'week')
const week2 = next(temporal, week1.value)

const fortnight = merge(temporal, [week1.value, week2.value])
```

## Creating Periods

### toPeriod()

Create a period from any date:

```typescript
import { toPeriod } from 'usetemporal'

const someDate = new Date('2024-06-15')
const june = toPeriod(temporal, someDate, 'month')
const year2024 = toPeriod(temporal, someDate, 'year')
```

## Best Practices

1. **Operations are pure** - They don't modify inputs
2. **Chain operations** - Combine for complex navigation
3. **Use proper unit** - Match the unit to your use case
4. **Cache results** - Operations can be memoized

## Next Steps

- See [API Reference](/api/) for detailed signatures
- Check [Examples](/examples/) for real usage
- Learn about [Performance](/guide/performance) optimization