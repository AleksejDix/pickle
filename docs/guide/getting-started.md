# Getting Started

This guide will help you get started with useTemporal in just a few minutes.

## Installation

::: code-group

```bash [npm]
# Install the meta package (includes core + native adapter)
npm install usetemporal

# Or install specific packages
npm install @usetemporal/core @usetemporal/adapter-native
```

```bash [yarn]
yarn add usetemporal
```

```bash [pnpm]
pnpm add usetemporal
```

:::

## Basic Usage

### 1. Create a Temporal Instance

```typescript
import { createTemporal } from 'usetemporal'
import { nativeAdapter } from 'usetemporal'

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  locale: 'en-US'
})
```

### 2. Access Reactive Properties

```typescript
// Reactive date references
temporal.picked.value  // Currently selected date
temporal.now.value     // Current system time
temporal.browsing.value // Date being browsed
```

### 3. Use Time Unit Composables

```typescript
import { useYear, useMonth, useDay } from 'usetemporal'

// Create reactive time units
const year = useYear(temporal)
const month = useMonth(temporal)
const day = useDay(temporal)

// Access properties
console.log(year.number.value)   // 2024
console.log(month.name.value)    // "January"
console.log(day.weekDay.value)   // 1 (Monday)
```

### 4. Navigate Through Time

```typescript
// Navigate to next/previous periods
month.future()  // Go to next month
month.past()    // Go to previous month

// Check if current
if (month.isNow.value) {
  console.log('This is the current month')
}
```

### 5. Use the Revolutionary divide() Pattern

```typescript
// Divide any time unit into smaller units
const year = useYear(temporal)
const months = temporal.divide(year, 'month')

// Each month is a fully reactive time unit
months.forEach((month, index) => {
  console.log(`Month ${index + 1}: ${month.name.value}`)
  
  // Further divide each month into days
  const days = temporal.divide(month, 'day')
  console.log(`  Has ${days.length} days`)
})
```

## Complete Example

Here's a complete example showing a simple calendar:

```vue
<template>
  <div class="calendar">
    <div class="header">
      <button @click="month.past()">←</button>
      <h2>{{ month.name.value }}</h2>
      <button @click="month.future()">→</button>
    </div>
    
    <div class="days-grid">
      <div 
        v-for="day in days" 
        :key="day.raw.value.getTime()"
        :class="{ 
          today: day.isNow.value,
          selected: isSame(day.raw.value, temporal.picked.value)
        }"
        @click="temporal.picked.value = day.raw.value"
      >
        {{ day.number.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { createTemporal, useMonth, nativeAdapter, same } from 'usetemporal'

const temporal = createTemporal({ 
  dateAdapter: nativeAdapter 
})

const month = useMonth(temporal)
const days = temporal.divide(month, 'day')

const isSame = (a, b) => same(a, b, 'day', temporal.adapter)
</script>
```

## Framework Examples

### Vue 3

```vue
<script setup>
import { createTemporal, useMonth, nativeAdapter } from 'usetemporal'

const temporal = createTemporal({ dateAdapter: nativeAdapter })
const month = useMonth(temporal)
</script>

<template>
  <div>{{ month.name.value }}</div>
</template>
```

### React

```tsx
import { createTemporal, useMonth, nativeAdapter } from 'usetemporal'
import { useEffect, useState } from 'react'

function Calendar() {
  const [temporal] = useState(() => 
    createTemporal({ dateAdapter: nativeAdapter })
  )
  const [monthName, setMonthName] = useState('')

  useEffect(() => {
    const month = useMonth(temporal)
    // Subscribe to reactive changes
    const unsubscribe = month.name.subscribe(name => {
      setMonthName(name)
    })
    return unsubscribe
  }, [temporal])

  return <div>{monthName}</div>
}
```

### Vanilla JavaScript

```javascript
import { createTemporal, useMonth, nativeAdapter } from 'usetemporal'

const temporal = createTemporal({ dateAdapter: nativeAdapter })
const month = useMonth(temporal)

// Direct access
console.log(month.name.value)

// Watch for changes
month.name.subscribe(newName => {
  document.getElementById('month').textContent = newName
})
```

## Next Steps

- Learn about [Date Adapters](/guide/date-adapters)
- Explore the [divide() Pattern](/guide/divide-pattern)
- See [API Reference](/api/create-temporal)
- Check out [Examples](/examples/basic-usage)