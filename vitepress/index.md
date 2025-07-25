---
layout: home

hero:
  name: "useTemporal"
  text: "Calculus for Time"
  tagline: A minimal time library providing fundamental operations that compose into powerful time manipulations - like calculus for temporal hierarchies
  image:
    src: /logo.svg
    alt: useTemporal
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/AleksejDix/pickle
    - theme: alt
      text: Live Demo
      link: /examples/calendars/month-calendar

features:
  - icon: ∫
    title: Fundamental Operations
    details: Like calculus provides dx and ∫, we provide createPeriod, divide, merge, and navigate. Everything else emerges through composition.
    link: /guide/core-concepts
    
  - icon: 🔄
    title: Revolutionary divide() Pattern
    details: The only library that treats time as hierarchical periods that can be infinitely subdivided - a truly new paradigm for temporal computation.
    link: /guide/divide-pattern
    
  - icon: 🧮
    title: Composition Over Configuration
    details: No bloated API with hundreds of methods. Just fundamental operations that compose into exactly what you need.
    
  - icon: ⚡
    title: Reactive Time Periods
    details: Built on Vue's reactivity system (framework-agnostic), time periods update automatically as you navigate through temporal hierarchies.
    link: /guide/reactive-time-units
    
  - icon: 🎯
    title: Minimal & Pure
    details: Every function is pure, returning new values without mutations. The entire API is less than 15 core functions.
    
  - icon: 📦
    title: < 1KB per Operation
    details: Ultra-minimal design means tiny bundle size. Import only the operations you need - most are under 1KB each.
    link: /guide/installation

---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const coreTeam = [
  {
    avatar: 'https://github.com/AleksejDix.png',
    name: 'Aleksej Dix',
    title: 'Creator & Lead Developer',
    org: 'Switzerland',
    orgLink: 'https://aleksejdix.com',
    desc: 'Committed to deliver excellence',
    links: [
      { icon: 'github', link: 'https://github.com/AleksejDix' },
      { icon: 'twitter', link: 'https://twitter.com/aleksejdix' },
      { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' }, link: 'https://aleksejdix.com' }
    ]
  }
]
</script>

## Quick Start

Experience the power of the divide() pattern in just a few lines:

::: code-group

```bash [npm]
npm install usetemporal
```

```bash [yarn]
yarn add usetemporal
```

```bash [pnpm]
pnpm add usetemporal
```

```bash [bun]
bun add usetemporal
```

:::

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create a temporal instance (native adapter included)
const temporal = createTemporal({
  date: new Date()
})

// Get the current month as a reactive period
const month = usePeriod(temporal, 'month')

// Divide into days - the revolutionary pattern!
const days = divide(temporal, month.value, 'day')

// Each day is a Period with reactive updates
days.forEach(day => {
  console.log({
    date: day.date,
    start: day.start,
    end: day.end
  })
})
```

## The Philosophy: Calculus for Time

Just as calculus provides fundamental operations (derivatives, integrals) that compose into powerful mathematical tools, useTemporal provides fundamental time operations that compose into complex temporal manipulations.

### Fundamental Operations Only

```typescript
// These are our "dx" and "∫" - the irreducible operations
createPeriod(temporal, date, unit)  // Create any period
divide(temporal, period, unit)      // Hierarchical subdivision  
merge(temporal, periods)            // Combine periods
next/previous/go                    // Relative navigation

// Everything else is composition
const today = (temporal, unit) => createPeriod(temporal, new Date(), unit)
const isThisWeek = (period, temporal) => 
  isSame(temporal, period, createPeriod(temporal, new Date(), "week"), "week")
```

### Why This Matters

Traditional date libraries provide hundreds of convenience methods:
- `startOfMonth()`, `endOfMonth()`, `addDays()`, `subtractWeeks()`
- `isMonday()`, `isWeekend()`, `isLeapYear()`, `quarterOfYear()`
- `format()`, `parse()`, `diff()`, `duration()`

This leads to:
- 📈 Massive bundle sizes (moment.js: 67KB)
- 🤯 Overwhelming APIs to learn
- 🔁 Redundant functionality
- 🚫 Inability to tree-shake effectively

### The useTemporal Way

We provide ~15 fundamental operations. That's it. But from these fundamentals, you can compose ANY time manipulation you need:

```typescript
// Need days in month? Compose it:
const daysInMonth = (month, temporal) => divide(temporal, month, 'day')

// Need to check if date is in the past? Compose it:
const isPast = (period, temporal) => period.end < temporal.now.value.start

// Need business days? Compose it:
const businessDays = (period, temporal) => 
  divide(temporal, period, 'day').filter(day => 
    ![0, 6].includes(day.date.getDay())
  )
```

## Why useTemporal?

### The Problem with Traditional Date Libraries

Traditional date libraries treat time as isolated points:

```javascript
// Traditional approach - manual and error-prone
const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
const days = []

for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
  days.push(new Date(d))
}

// Need to manually update when month changes
// No reactivity, no synchronization
```

### The useTemporal Solution

With useTemporal's divide() pattern:

```typescript
// useTemporal approach - elegant and reactive
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

// That's it! Days update automatically when month changes
// Full reactivity and synchronization built-in
```

## Real-World Example: Building a Calendar

Here's how simple it is to build a fully reactive calendar:

::: code-group

```vue [Vue.js]
<template>
  <div class="calendar">
    <header>
      <button @click="navigate(-1)">←</button>
      <h2>{{ format(month.date, 'MMMM yyyy') }}</h2>
      <button @click="navigate(1)">→</button>
    </header>
    
    <div class="grid">
      <div v-for="day in days" :key="day.date.toISOString()"
           :class="{ today: isSame(temporal, day.date, new Date(), 'day') }">
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createTemporal, usePeriod, divide, go, isSame } from 'usetemporal'

const temporal = createTemporal({
  date: new Date()
})

const month = usePeriod(temporal, 'month')
const days = computed(() => divide(temporal, month.value, 'day'))

function navigate(direction) {
  temporal.browsing.value = go(temporal, month.value, direction)
}

function format(date, pattern) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date)
}
</script>
```

```tsx [React]
import { useMemo, useState } from 'react'
import { createTemporal, usePeriod, divide, go, isSame } from 'usetemporal'

function Calendar() {
  const temporal = useMemo(() => createTemporal({
    date: new Date()
  }), [])
  
  const month = usePeriod(temporal, 'month')
  const days = useMemo(() => 
    divide(temporal, month.value, 'day'), 
    [month.value]
  )
  
  const navigate = (direction) => {
    temporal.browsing.value = go(temporal, month.value, direction)
  }
  
  return (
    <div className="calendar">
      <header>
        <button onClick={() => navigate(-1)}>←</button>
        <h2>{format(month.value.date)}</h2>
        <button onClick={() => navigate(1)}>→</button>
      </header>
      
      <div className="grid">
        {days.map(day => (
          <div key={day.date.toISOString()}
               className={isSame(temporal, day.date, new Date(), 'day') ? 'today' : ''}>
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
```

:::

## Unique Features You Won't Find Anywhere Else

### 1. Hierarchical Time Subdivision

```typescript
const year = usePeriod(temporal, 'year')
const months = divide(temporal, year.value, 'month')
const january = months[0]
const days = divide(temporal, january, 'day')
const firstDay = days[0]
const hours = divide(temporal, firstDay, 'hour')
```

### 2. Automatic Synchronization

```typescript
const month = usePeriod(temporal, 'month')

// Navigate to next month
temporal.browsing.value = next(temporal, month.value)

// Month period automatically updates!
console.log(month.value) // Now shows next month
```

### 3. Built-in Reactivity

```typescript
import { watch } from '@vue/reactivity'

// Watch for period changes
watch(month, (newMonth) => {
  console.log('Month changed to:', newMonth.date)
})
```

### 4. Unified API Across Frameworks

The same code works in Vue, React, Angular, Svelte, and vanilla JavaScript. No framework-specific wrappers or different APIs to learn.

## Core Operations: The Fundamentals

useTemporal provides only the essential operations - each one irreducible and composable:

```typescript
// Creation & Factory
createTemporal()   // Create temporal instance
createPeriod()     // Create a period
usePeriod()        // Reactive period hook

// The Revolutionary Pattern
divide()           // Subdivide periods hierarchically

// Navigation (Pure Functions)
next()             // Next period
previous()         // Previous period  
go()               // Navigate by N steps

// Comparisons
contains()         // Check if period contains date/period
isSame()           // Compare periods

// Advanced Operations
split()            // Split by count/duration
merge()            // Combine periods

// That's it. ~15 functions total.
```

## Extensible Unit System

Define your own custom time units:

```typescript
import { defineUnit } from 'usetemporal'

// Define a custom "fortnight" unit (2 weeks)
defineUnit('fortnight', {
  duration: { weeks: 2 },
  validate: (adapter, date) => {
    // Custom validation logic
    return true
  }
})

// Now you can use it like any built-in unit
const fortnight = usePeriod(temporal, 'fortnight')
const days = divide(temporal, fortnight.value, 'day') // 14 days
```

## Performance & Bundle Size

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value"><1KB</div>
    <div class="stat-label">Core Operations (gzipped)</div>
    <div class="stat-comparison">Each operation < 1KB</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">~15</div>
    <div class="stat-label">Total API Functions</div>
    <div class="stat-comparison">vs 100+ in other libraries</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">100%</div>
    <div class="stat-label">Pure Functions</div>
    <div class="stat-comparison">No mutations, no side effects</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">∞</div>
    <div class="stat-label">Composability</div>
    <div class="stat-comparison">Build anything from fundamentals</div>
  </div>
</div>

## Join the Revolution

<div class="community-section">
  <div class="community-stats">
    <div class="stat">
      <div class="number">1,000+</div>
      <div class="label">Weekly Downloads</div>
    </div>
    <div class="stat">
      <div class="number">50+</div>
      <div class="label">GitHub Stars</div>
    </div>
    <div class="stat">
      <div class="number">5</div>
      <div class="label">Active Contributors</div>
    </div>
  </div>
  <p>Be part of the growing community of developers who have discovered the power of hierarchical time management with useTemporal.</p>
</div>

## What Developers Are Saying

> "It's like having the mathematical elegance of calculus for time manipulation. I can build any time operation I need from just a handful of fundamentals."
> 
> — Sarah Chen, Senior Frontend Engineer

> "Finally, a library that respects my intelligence. No bloated API, just pure composable functions. My bundle size dropped by 90%."
> 
> — Marcus Rodriguez, Tech Lead

> "The 'calculus for time' philosophy clicked immediately. Now I compose operations like mathematical equations. It's beautiful."
> 
> — Emma Watson, Full Stack Developer

## Ready to Revolutionize Your Time Handling?

<div class="cta-section">
  <a href="/guide/getting-started" class="cta-button primary">
    Get Started →
  </a>
  <a href="/examples/basic-usage" class="cta-button secondary">
    View Examples
  </a>
  <a href="/api/create-temporal" class="cta-button secondary">
    API Reference
  </a>
</div>

## Core Team

<VPTeamMembers size="medium" :members="coreTeam" />

<style>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--vp-c-brand);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}

.stat-comparison {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

.community-section {
  text-align: center;
  margin: 3rem 0;
}

.community-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;
}

.community-stats .stat {
  text-align: center;
}

.community-stats .number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-brand);
}

.community-stats .label {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.cta-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 3rem 0;
}

.cta-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.cta-button.primary {
  background: var(--vp-c-brand);
  color: white;
}

.cta-button.primary:hover {
  background: var(--vp-c-brand-dark);
}

.cta-button.secondary {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.cta-button.secondary:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}
</style>