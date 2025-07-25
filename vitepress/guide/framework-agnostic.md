# Framework Agnostic Design

useTemporal is built to work with any JavaScript framework or vanilla JavaScript. Here's how it achieves framework independence while still providing reactive features.

## Core Architecture

### Not Vue, Just Reactivity

While useTemporal uses `@vue/reactivity`, it does **not** depend on the Vue framework:

```json
{
  "dependencies": {
    "@vue/reactivity": "^3.4.0"  // Only the reactivity system
  }
}
```

The `@vue/reactivity` package is:
- **Standalone** - Can be used without Vue framework
- **Lightweight** - Only 12KB gzipped
- **Tree-shakeable** - Only imports what you use
- **Battle-tested** - Powers Vue 3's reactivity

### Pure JavaScript Core

All core functionality is pure JavaScript:

```typescript
// No framework-specific imports
import { ref, computed } from '@vue/reactivity'

export function createTemporal(options) {
  // Pure JavaScript implementation
  const browsing = ref(createPeriod(/*...*/))
  const now = ref(createPeriod(/*...*/))
  
  return {
    browsing,
    now,
    adapter: options.adapter,
    // ...
  }
}
```

## Using with Different Frameworks

### Vanilla JavaScript

Works directly without any framework:

```javascript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create instance
const temporal = createTemporal({ date: new Date() })

// Use reactive periods
const month = usePeriod(temporal, 'month')

// Watch for changes
month.watch((newMonth) => {
  console.log('Month changed:', newMonth)
  updateUI(newMonth)
})

// Navigate
document.getElementById('next').onclick = () => {
  temporal.browsing.value = next(temporal, month.value)
}
```

### React

Integrate with React's state system:

```jsx
import { useState, useEffect, useSyncExternalStore } from 'react'
import { createTemporal, usePeriod } from 'usetemporal'

// Create adapter hook
function useTemporalValue(getValue) {
  return useSyncExternalStore(
    (callback) => getValue().watch(callback),
    () => getValue().value
  )
}

// Use in component
function Calendar() {
  const [temporal] = useState(() => 
    createTemporal({ date: new Date() })
  )
  
  const month = useTemporalValue(() => 
    usePeriod(temporal, 'month')
  )
  
  return (
    <div>
      <h2>{month.date.toLocaleDateString()}</h2>
      <button onClick={() => {
        temporal.browsing.value = next(temporal, month)
      }}>
        Next Month
      </button>
    </div>
  )
}
```

### Angular

Use with Angular's change detection:

```typescript
import { Component, NgZone } from '@angular/core'
import { createTemporal, usePeriod, divide } from 'usetemporal'

@Component({
  selector: 'app-calendar',
  template: `
    <div>
      <h2>{{ monthName }}</h2>
      <button (click)="nextMonth()">Next</button>
      <div *ngFor="let day of days">
        {{ day.date.getDate() }}
      </div>
    </div>
  `
})
export class CalendarComponent {
  temporal = createTemporal({ date: new Date() })
  month = usePeriod(this.temporal, 'month')
  monthName = ''
  days = []
  
  constructor(private ngZone: NgZone) {
    // Subscribe to changes
    this.month.watch((newMonth) => {
      this.ngZone.run(() => {
        this.monthName = newMonth.date.toLocaleDateString('en', { month: 'long' })
        this.days = divide(this.temporal, newMonth, 'day')
      })
    })
  }
  
  nextMonth() {
    this.temporal.browsing.value = next(this.temporal, this.month.value)
  }
}
```

### Svelte

Create Svelte stores from temporal:

```javascript
// temporal-store.js
import { writable } from 'svelte/store'
import { createTemporal, usePeriod } from 'usetemporal'

export function createTemporalStore() {
  const temporal = createTemporal({ date: new Date() })
  
  // Create custom store
  const { subscribe, set } = writable({
    month: usePeriod(temporal, 'month').value,
    temporal
  })
  
  // Watch for changes
  temporal.browsing.watch(() => {
    set({
      month: usePeriod(temporal, 'month').value,
      temporal
    })
  })
  
  return {
    subscribe,
    next: () => temporal.browsing.value = next(temporal, temporal.browsing.value),
    previous: () => temporal.browsing.value = previous(temporal, temporal.browsing.value)
  }
}
```

```svelte
<!-- Calendar.svelte -->
<script>
  import { createTemporalStore } from './temporal-store'
  import { divide } from 'usetemporal'
  
  const temporal = createTemporalStore()
  
  $: days = divide($temporal.temporal, $temporal.month, 'day')
</script>

<div>
  <h2>{$temporal.month.date.toLocaleDateString('en', { month: 'long' })}</h2>
  <button on:click={temporal.previous}>Previous</button>
  <button on:click={temporal.next}>Next</button>
  
  {#each days as day}
    <div>{day.date.getDate()}</div>
  {/each}
</div>
```

## Building Framework Adapters

Create reusable adapters for any framework:

```typescript
// Generic adapter pattern
export function createFrameworkAdapter(framework) {
  return {
    createReactive(temporal) {
      // Framework-specific reactive wrapper
    },
    
    watchValue(value, callback) {
      // Framework-specific watcher
    },
    
    triggerUpdate() {
      // Framework-specific update trigger
    }
  }
}
```

### Example: Solid.js Adapter

```javascript
import { createSignal, createEffect } from 'solid-js'

export function useTemporalSolid(temporalInstance) {
  const [browsing, setBrowsing] = createSignal(temporalInstance.browsing.value)
  
  // Sync with temporal
  createEffect(() => {
    const unwatch = temporalInstance.browsing.watch((newValue) => {
      setBrowsing(newValue)
    })
    
    return unwatch
  })
  
  return {
    browsing,
    navigate: (period) => {
      temporalInstance.browsing.value = period
    }
  }
}
```

## Server-Side Rendering (SSR)

useTemporal works in SSR environments:

```javascript
// Node.js / SSR
import { createTemporal, divide } from 'usetemporal'

export async function getServerSideProps() {
  const temporal = createTemporal({ 
    date: new Date('2024-03-15') 
  })
  
  const month = usePeriod(temporal, 'month')
  const days = divide(temporal, month.value, 'day')
  
  return {
    props: {
      initialMonth: month.value,
      days: days.map(d => ({
        date: d.date.toISOString(),
        dayNumber: d.date.getDate()
      }))
    }
  }
}
```

## Web Components

Create framework-agnostic web components:

```javascript
import { createTemporal, usePeriod, next, previous } from 'usetemporal'

class TemporalCalendar extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.temporal = createTemporal({ date: new Date() })
  }
  
  connectedCallback() {
    this.month = usePeriod(this.temporal, 'month')
    
    // Watch for changes
    this.month.watch(() => this.render())
    
    this.render()
  }
  
  render() {
    const monthName = this.month.value.date.toLocaleDateString('en', { 
      month: 'long', 
      year: 'numeric' 
    })
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui;
        }
      </style>
      <div>
        <h2>${monthName}</h2>
        <button id="prev">Previous</button>
        <button id="next">Next</button>
      </div>
    `
    
    this.shadowRoot.getElementById('prev').onclick = () => {
      this.temporal.browsing.value = previous(this.temporal, this.month.value)
    }
    
    this.shadowRoot.getElementById('next').onclick = () => {
      this.temporal.browsing.value = next(this.temporal, this.month.value)
    }
  }
}

customElements.define('temporal-calendar', TemporalCalendar)
```

## Benefits of Framework Agnostic Design

1. **Future Proof** - Works with frameworks that don't exist yet
2. **Smaller Bundle** - No framework overhead
3. **Flexibility** - Use the same code across projects
4. **Learning Once** - Same API everywhere
5. **Performance** - No framework abstraction layers

## See Also

- [Reactive Time Units](/guide/reactive-time-units) - How reactivity works
- [Vue Integration](/examples/frameworks/vue-integration) - Vue examples
- [React Integration](/examples/frameworks/react-integration) - React examples
- [Installation](/guide/installation) - Setup instructions