# useTemporal

**Revolutionary time library with the unique `divide()` pattern**

```typescript
// Divide any time unit into smaller units
const months = divide(temporal, year, 'month')
const days = divide(temporal, month, 'day')
const hours = divide(temporal, day, 'hour')
```

## 🚀 Features

- **🧩 Revolutionary divide() Pattern**: Infinitely subdivide time units with perfect synchronization
- **🌍 Framework Agnostic**: Works with Vue, React, Angular, Svelte, and vanilla JavaScript
- **⚡ Zero Dependencies**: Native adapter provides full functionality without external libraries
- **🔄 Reactive by Design**: Built on `@vue/reactivity` for automatic updates
- **🎯 TypeScript First**: Full type safety and excellent IDE support
- **📦 Tree Shakeable**: Import only what you need

## 📦 Installation

```bash
npm install usetemporal
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

// Create temporal instance with adapter
const temporal = createTemporal({
  adapter: createNativeAdapter(),
  weekStartsOn: 1 // Monday
})

// Create reactive periods
const year = usePeriod(temporal, 'year')
const month = usePeriod(temporal, 'month')

// Use the revolutionary divide() pattern
const months = divide(temporal, year.value, 'month')
const days = divide(temporal, month.value, 'day')
```

### Vue Example

```vue
<template>
  <div>
    <h2>{{ monthLabel }}</h2>
    <div v-for="day in days" :key="day.date.toISOString()">
      {{ day.date.getDate() }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

const temporal = createTemporal({
  adapter: createNativeAdapter()
})

const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

const monthLabel = computed(() => 
  month.value.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })
)
</script>
```

### React Example

```tsx
import { useMemo } from 'react'
import { createTemporal, usePeriod, divide } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

function Calendar() {
  const temporal = useMemo(() => createTemporal({
    adapter: createNativeAdapter()
  }), [])
  
  const month = usePeriod(temporal, 'month')
  const days = useMemo(() => 
    divide(temporal, month.value, 'day'),
    [month.value]
  )
  
  return (
    <div>
      <h2>
        {month.value.date.toLocaleDateString('en', { 
          month: 'long', 
          year: 'numeric' 
        })}
      </h2>
      {days.map(day => (
        <div key={day.date.toISOString()}>
          {day.date.getDate()}
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Core API

### Factory Function

```typescript
import { createTemporal } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

const temporal = createTemporal({
  adapter: createNativeAdapter(), // Required
  date: new Date(),              // Initial browsing date
  weekStartsOn: 1                // 0 = Sunday, 1 = Monday
})
```

### Period Composable

```typescript
// Create reactive periods that update with navigation
const year = usePeriod(temporal, 'year')
const month = usePeriod(temporal, 'month')
const day = usePeriod(temporal, 'day')

// Period structure
interface Period {
  type: Unit    // 'year' | 'month' | 'week' | 'day' | etc.
  date: Date    // Representative date
  start: Date   // Period start
  end: Date     // Period end (exclusive)
}
```

### Operations

All operations are pure functions:

```typescript
import { 
  divide,    // Subdivide periods
  next,      // Get next period
  previous,  // Get previous period
  go,        // Navigate by steps
  contains,  // Check containment
  isSame,    // Compare periods
  zoomIn,    // Zoom into smaller unit
  zoomOut,   // Zoom to larger unit
} from 'usetemporal'

// Examples
const months = divide(temporal, year.value, 'month')
const nextMonth = next(temporal, month.value)
const isInMonth = contains(month.value, new Date())
```

## 📚 Documentation

Visit our [documentation site](https://usetemporal.dev) for:

- [Getting Started Guide](https://usetemporal.dev/guide/getting-started)
- [The divide() Pattern](https://usetemporal.dev/guide/divide-pattern)
- [API Reference](https://usetemporal.dev/api/)
- [Examples](https://usetemporal.dev/examples/)

## 🔌 Date Adapters

Choose your preferred date library:

```bash
# Native JavaScript Date (included by default)
npm install usetemporal

# With date-fns
npm install @usetemporal/adapter-date-fns date-fns

# With Luxon
npm install @usetemporal/adapter-luxon luxon

# With Temporal API (future)
npm install @usetemporal/adapter-temporal
```

## 🎯 Why useTemporal?

Traditional date libraries require manual calculation for time subdivisions:

```javascript
// Traditional approach 😢
const year = 2024
const months = []
for (let i = 0; i < 12; i++) {
  const start = new Date(year, i, 1)
  const end = new Date(year, i + 1, 0)
  months.push({ start, end })
}
```

With useTemporal's divide() pattern:

```typescript
// useTemporal approach 🎉
const year = usePeriod(temporal, 'year')
const months = divide(temporal, year.value, 'month')
// That's it! Full reactivity included!
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [useTemporal Contributors](https://github.com/your-username/usetemporal/graphs/contributors)