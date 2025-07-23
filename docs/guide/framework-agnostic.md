# Framework Agnostic Design

useTemporal is designed to work seamlessly across all JavaScript frameworks and vanilla JavaScript. This guide explains how the library achieves framework independence and how to integrate it with your preferred framework.

## Core Philosophy

useTemporal uses `@vue/reactivity` as its reactivity engine, which despite its name, is a standalone reactivity system that works independently of the Vue framework. This provides:

- **Universal Reactivity**: Works in any JavaScript environment
- **Small Bundle Size**: Only includes the reactivity core (~10KB)
- **No Framework Lock-in**: Switch frameworks without changing time logic
- **TypeScript Support**: Full type safety across all frameworks

## How It Works

```typescript
// useTemporal only depends on @vue/reactivity, not Vue
import { ref, computed } from '@vue/reactivity'

// This works in React, Angular, Svelte, or vanilla JS!
const temporal = createTemporal()
const hour = useHour(temporal)

// Reactive values work everywhere
console.log(hour.name.value) // "3 PM"
```

## Framework Integration Patterns

### Vue 3

Vue 3 uses the same reactivity system, so integration is seamless:

```vue
<template>
  <div>
    <h1>{{ year.name.value }}</h1>
    <p>{{ month.name.value }} {{ day.number.value }}</p>
    <button @click="day.future()">Next Day</button>
  </div>
</template>

<script setup>
import { createTemporal, useYear, useMonth, useDay } from 'usetemporal'

const temporal = createTemporal()
const year = useYear(temporal)
const month = useMonth(temporal)
const day = useDay(temporal)
</script>
```

### React

Use hooks to bridge reactive values to React state:

```jsx
import { useState, useEffect, useMemo } from 'react'
import { createTemporal, useMonth, useDay } from 'usetemporal'

// Custom hook for useTemporal
function useTemporalTime() {
  const temporal = useMemo(() => createTemporal(), [])
  const month = useMemo(() => useMonth(temporal), [temporal])
  const day = useMemo(() => useDay(temporal), [temporal])
  
  const [monthName, setMonthName] = useState(month.name.value)
  const [dayNumber, setDayNumber] = useState(day.number.value)
  
  useEffect(() => {
    const unsubMonth = month.name.subscribe(setMonthName)
    const unsubDay = day.number.subscribe(setDayNumber)
    
    return () => {
      unsubMonth()
      unsubDay()
    }
  }, [month, day])
  
  return {
    monthName,
    dayNumber,
    nextDay: () => day.future(),
    prevDay: () => day.past()
  }
}

// Component
function Calendar() {
  const { monthName, dayNumber, nextDay, prevDay } = useTemporalTime()
  
  return (
    <div>
      <h2>{monthName} {dayNumber}</h2>
      <button onClick={prevDay}>Previous</button>
      <button onClick={nextDay}>Next</button>
    </div>
  )
}
```

### Angular

Use services and RxJS to integrate:

```typescript
import { Injectable, signal } from '@angular/core'
import { createTemporal, useYear, useMonth } from 'usetemporal'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private temporal = createTemporal()
  private year = useYear(this.temporal)
  private month = useMonth(this.temporal)
  
  // Expose as signals (Angular 16+)
  yearName = signal(this.year.name.value)
  monthName = signal(this.month.name.value)
  
  // Or as observables
  year$ = new BehaviorSubject(this.year.name.value)
  month$ = new BehaviorSubject(this.month.name.value)
  
  constructor() {
    // Keep signals/observables in sync
    this.year.name.subscribe(value => {
      this.yearName.set(value)
      this.year$.next(value)
    })
    
    this.month.name.subscribe(value => {
      this.monthName.set(value)
      this.month$.next(value)
    })
  }
  
  nextMonth() {
    this.month.future()
  }
  
  previousMonth() {
    this.month.past()
  }
}
```

### Svelte

Use stores to bridge reactivity:

```javascript
// timeStore.js
import { writable, derived } from 'svelte/store'
import { createTemporal, useDay, useHour } from 'usetemporal'

const temporal = createTemporal()
const day = useDay(temporal)
const hour = useHour(temporal)

// Create Svelte stores
export const dayName = writable(day.name.value)
export const hourName = writable(hour.name.value)

// Subscribe to changes
day.name.subscribe(value => dayName.set(value))
hour.name.subscribe(value => hourName.set(value))

// Derived store
export const greeting = derived(
  hourName,
  $hourName => {
    const hour = parseInt($hourName)
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }
)

// Actions
export const nextDay = () => day.future()
export const previousDay = () => day.past()
```

```svelte
<!-- Component.svelte -->
<script>
  import { dayName, greeting, nextDay } from './timeStore.js'
</script>

<h1>{$greeting}!</h1>
<p>Today is {$dayName}</p>
<button on:click={nextDay}>Next Day</button>
```

### Vanilla JavaScript

Direct usage without any framework:

```javascript
import { createTemporal, useMonth, useWeek } from 'usetemporal'

const temporal = createTemporal()
const month = useMonth(temporal)
const week = useWeek(temporal)

// Update DOM on changes
month.name.subscribe(value => {
  document.getElementById('month').textContent = value
})

week.number.subscribe(value => {
  document.getElementById('week').textContent = `Week ${value}`
})

// Handle events
document.getElementById('next-month').addEventListener('click', () => {
  month.future()
})

// Use in any context
class Calendar {
  constructor() {
    this.temporal = createTemporal()
    this.currentDay = useDay(this.temporal)
  }
  
  get dayName() {
    return this.currentDay.name.value
  }
  
  nextDay() {
    this.currentDay.future()
  }
}
```

## Web Components

Create framework-agnostic components:

```javascript
import { createTemporal, useMonth } from 'usetemporal'

class TimeDisplay extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    
    this.temporal = createTemporal()
    this.month = useMonth(this.temporal)
  }
  
  connectedCallback() {
    this.render()
    
    // Subscribe to changes
    this.unsubscribe = this.month.name.subscribe(() => {
      this.render()
    })
  }
  
  disconnectedCallback() {
    this.unsubscribe?.()
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }
      </style>
      <h2>${this.month.name.value}</h2>
      <button id="prev">Previous</button>
      <button id="next">Next</button>
    `
    
    this.shadowRoot.getElementById('prev').onclick = () => this.month.past()
    this.shadowRoot.getElementById('next').onclick = () => this.month.future()
  }
}

customElements.define('time-display', TimeDisplay)
```

## Server-Side Rendering (SSR)

useTemporal works perfectly with SSR:

```javascript
// Next.js example
export async function getServerSideProps() {
  const temporal = createTemporal()
  const month = useMonth(temporal)
  
  return {
    props: {
      initialMonth: month.name.value,
      initialMonthNumber: month.number.value
    }
  }
}

// Nuxt.js example
export default {
  async asyncData() {
    const temporal = createTemporal()
    const year = useYear(temporal)
    
    return {
      currentYear: year.name.value
    }
  }
}
```

## Testing

Framework-agnostic design makes testing simple:

```javascript
import { test, expect } from 'vitest'
import { createTemporal, useDay } from 'usetemporal'

test('day navigation works', () => {
  const temporal = createTemporal()
  const day = useDay(temporal)
  
  const initialDay = day.number.value
  day.future()
  
  expect(day.number.value).toBe(initialDay + 1)
})

test('reactive updates trigger', () => {
  const temporal = createTemporal()
  const hour = useHour(temporal)
  
  let updateCount = 0
  hour.name.subscribe(() => updateCount++)
  
  hour.future()
  hour.future()
  
  expect(updateCount).toBe(2)
})
```

## Best Practices

### 1. Create Once, Use Many
```javascript
// Good - single instance
const temporal = createTemporal()
export const timeService = {
  year: useYear(temporal),
  month: useMonth(temporal),
  day: useDay(temporal)
}

// Avoid - multiple instances
function Component() {
  const temporal1 = createTemporal() // Don't do this repeatedly
  const temporal2 = createTemporal() // They won't be synchronized
}
```

### 2. Framework Adapters
Create reusable adapters for your framework:

```javascript
// React adapter
export function useTemporalUnit(composable) {
  const [unit] = useState(() => composable(temporal))
  const [value, setValue] = useState(unit.name.value)
  
  useEffect(() => {
    return unit.name.subscribe(setValue)
  }, [unit])
  
  return [value, unit]
}

// Usage
const [monthName, month] = useTemporalUnit(useMonth)
```

### 3. Type Safety
Leverage TypeScript across frameworks:

```typescript
import type { TimeUnit } from 'usetemporal'

// Works in any framework
function formatTimeUnit(unit: TimeUnit): string {
  return `${unit.name.value} (${unit.number.value})`
}
```

## Performance Tips

1. **Lazy Loading**: Import only what you need
2. **Subscription Cleanup**: Always unsubscribe in cleanup
3. **Memoization**: Cache temporal instances in frameworks that recreate components
4. **Batch Updates**: Group multiple time navigations

## Migration Guide

Moving from framework-specific solutions:

```javascript
// From Moment.js
// Before: moment().format('YYYY')
// After:
const year = useYear(temporal)
console.log(year.name.value)

// From React hooks
// Before: const [date, setDate] = useState(new Date())
// After:
const day = useDay(temporal)
// day.name.value is always current

// From Angular services
// Before: dateService.currentMonth$
// After:
const month = useMonth(temporal)
// month.name is reactive
```

## Summary

useTemporal's framework-agnostic design provides:

- **One API** for all frameworks
- **Consistent behavior** across platforms
- **Easy testing** without framework setup
- **Future-proof** as frameworks evolve
- **Maximum flexibility** for your architecture

Whether you're building with Vue, React, Angular, Svelte, or vanilla JavaScript, useTemporal provides the same powerful time manipulation capabilities with a consistent, reactive API.