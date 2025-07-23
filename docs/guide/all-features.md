# Complete Feature List

## Core Features

### 1. **Revolutionary divide() Pattern** ⭐
The unique feature that sets useTemporal apart - hierarchical time subdivision.

```typescript
const year = useYear(temporal)
const months = temporal.divide(year, 'month')  // 12 months
const days = temporal.divide(months[0], 'day') // Days in January
const hours = temporal.divide(days[0], 'hour') // 24 hours
```

### 2. **Framework Agnostic Architecture**
- Works with Vue, React, Angular, Svelte, and vanilla JS
- Built on `@vue/reactivity` (not the Vue framework)
- Universal reactive primitives

### 3. **Pluggable Date Adapter System**
Choose your preferred date library:

```typescript
// Zero dependencies
import { nativeAdapter } from '@usetemporal/adapter-native'

// With date-fns
import { dateFnsAdapter } from '@usetemporal/adapter-date-fns'

// With Luxon
import { luxonAdapter } from '@usetemporal/adapter-luxon'

// Future-proof Temporal API
import { temporalAdapter } from '@usetemporal/adapter-temporal'
```

### 4. **Reactive Time Units**
All time units are reactive by default:

```typescript
const month = useMonth(temporal)
month.number.value   // 1-12
month.name.value     // "January"
month.isNow.value    // true/false
month.start.value    // First moment
month.end.value      // Last moment
```

### 5. **Time Navigation**
Navigate through time with simple methods:

```typescript
month.future()  // Next month
month.past()    // Previous month

year.future()   // Next year
day.past()      // Yesterday
```

### 6. **Quarter Support**
Built-in quarter management:

```typescript
const quarter = useQuarter(temporal)
quarter.name.value    // "Q1 2024"
quarter.number.value  // 1-4

// Navigate by quarters
quarter.future()  // Next quarter
quarter.past()    // Previous quarter
```

### 7. **Internationalization (i18n)**
Full locale support:

```typescript
const temporal = createTemporal({ locale: 'fr-FR' })
temporal.f(date, { month: 'long' }) // "janvier"

// Reactive locale
const locale = ref('en-US')
createTemporal({ locale }) // Updates when locale changes
```

### 8. **Zero Dependencies Mode**
Native adapter provides full functionality without external dependencies:

```typescript
// No npm dependencies required!
import { nativeAdapter } from '@usetemporal/adapter-native'
```

## Composables

### Time Unit Composables
- `useYear()` - Year management
- `useMonth()` - Month management  
- `useWeek()` - Week management
- `useDay()` - Day management
- `useHour()` - Hour management
- `useQuarter()` - Quarter management
- `useMinute()` - Minute management
- `useSecond()` - Second management

Each composable provides:
```typescript
{
  raw: Ref<Date>,        // Original date
  start: Ref<Date>,      // Start of period
  end: Ref<Date>,        // End of period
  number: Ref<number>,   // Numeric value
  name: Ref<string>,     // Formatted name
  isNow: Ref<boolean>,   // Is current period
  timespan: Ref<{        // Period boundaries
    start: Date,
    end: Date
  }>,
  future(): void,        // Navigate forward
  past(): void,          // Navigate backward
  isSame(a, b): boolean  // Compare dates
}
```

## Utility Functions

### same()
Compare dates for same time unit:

```typescript
same(date1, date2, 'day', adapter)    // Same day?
same(date1, date2, 'month', adapter)  // Same month?
same(date1, date2, 'year', adapter)   // Same year?
```

### each()
Generate date intervals:

```typescript
each({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 0, 31),
  step: { days: 1 },
  adapter
}) // Array of 31 dates
```

## Architecture Features

### 1. **Monorepo Structure**
Clean package organization:
```
@usetemporal/core
@usetemporal/adapter-native
@usetemporal/adapter-date-fns
@usetemporal/adapter-luxon
@usetemporal/adapter-temporal
```

### 2. **100% ESM**
Modern ES modules throughout

### 3. **Tree-Shakeable**
Import only what you need:
```typescript
import { useMonth } from '@usetemporal/core/composables'
```

### 4. **TypeScript First**
Full type safety with comprehensive type definitions

### 5. **Optimized Bundle Size**
- Core + native adapter: <6KB
- Modular imports
- Zero runtime dependencies (with native adapter)

## Advanced Features

### 1. **Custom Adapter Support**
Create your own date adapter:

```typescript
class MyAdapter implements DateAdapter {
  name = 'custom'
  add(date, duration) { /* ... */ }
  subtract(date, duration) { /* ... */ }
  // ... implement interface
}
```

### 2. **Reactive Refs Support**
All options accept reactive refs:

```typescript
const date = ref(new Date())
const locale = ref('en-US')

createTemporal({ 
  date,    // Stays synchronized
  locale   // Formatting updates automatically
})
```

### 3. **Lazy Evaluation**
Subdivisions are created on-demand for performance

### 4. **Caching**
Results are cached to prevent unnecessary recomputation

### 5. **Memory Efficient**
Automatic cleanup when subdivisions are no longer referenced

## Quality Features

### 1. **Comprehensive Testing**
- 91.6% test coverage
- 250+ tests
- All adapters thoroughly tested

### 2. **Production Ready**
- Used in production applications
- Stable API
- Regular maintenance

### 3. **Developer Experience**
- Excellent TypeScript support
- Clear error messages
- Intuitive API design

### 4. **Documentation**
- Comprehensive guides
- API references
- Framework examples
- Interactive demos

## Unique Advantages

1. **Only library with divide() pattern** - No other JS library offers this
2. **True framework agnostic** - Not tied to any specific framework
3. **Flexible adapter system** - Use any date library or none
4. **Built-in quarter support** - Navigate by business quarters
5. **Reactive by default** - Perfect for modern UIs
6. **Zero dependencies possible** - Unique in date library space

## Use Cases

Perfect for:
- Calendar applications
- Date pickers
- Timeline visualizations
- Gantt charts
- Scheduling interfaces
- Time tracking apps
- Financial applications (quarters)
- International applications (i18n)
- Any application dealing with hierarchical time