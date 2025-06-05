# RFC 004: Framework-Agnostic Architecture

- **Start Date:** 2024-12-21
- **Author:** useTemporal Team
- **Status:** Draft
- **Type:** Major Architecture Change
- **Related:** RFC-001 (Date Adapter), RFC-002 (API Naming), RFC-003 (Bundle Optimization)

## Summary

Transform useTemporal from a Vue-specific library into a framework-agnostic time management library that works seamlessly with Vue, React, Svelte, Angular, and vanilla JavaScript while preserving the revolutionary `divide()` pattern.

## Motivation

### Current Limitations

```typescript
// Currently Vue-only
import { ref, computed } from 'vue';

export function useYear(options) {
  const browsing = ref(options.browsing);  // ← Vue-specific
  const isNow = computed(() => /* ... */); // ← Vue-specific
  // ...
}
```

### Market Opportunity

```
Framework    | Market Share | Potential Users
-------------|-------------|----------------
React        | 40%         | 2M+ developers
Vue          | 20%         | 1M+ developers (current)
Angular      | 15%         | 750K developers
Svelte       | 10%         | 500K developers
Vanilla JS   | 15%         | 750K developers
Total        | 100%        | 5M+ developers (5x expansion!)
```

### Problems to Solve

1. **Limited Adoption**: Only Vue developers can use useTemporal
2. **Ecosystem Lock-in**: Teams using React/Angular can't adopt
3. **Reactivity Coupling**: Core logic tied to Vue's reactivity system
4. **Bundle Bloat**: Vue dependency required even for simple use cases

## Architecture Strategy

### 1. Framework-Agnostic Core

#### Pure JavaScript Foundation

```typescript
// @usetemporal/core - Pure JS, no framework dependencies
export class Temporal {
  private _date: Date;
  private _now: Date;
  private _listeners: Set<Function> = new Set();

  constructor(options = {}) {
    this._date = options.date || new Date();
    this._now = options.now || new Date();
  }

  // Core functionality - no framework dependencies
  divide(unit: TimeUnit, subdivision: TimeUnit) {
    return divide(this._date, unit, subdivision);
  }

  // Framework-agnostic subscription pattern
  subscribe(listener: Function) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // Update methods that notify subscribers
  setDate(date: Date) {
    this._date = date;
    this._notify();
  }

  private _notify() {
    this._listeners.forEach((listener) => listener());
  }
}
```

#### Framework-Specific Wrappers

```typescript
// Each framework gets its own reactive wrapper
// @usetemporal/vue
// @usetemporal/react
// @usetemporal/svelte
// @usetemporal/angular
// @usetemporal/vanilla
```

### 2. Vue Integration (Current Experience Preserved)

```typescript
// @usetemporal/vue
import { ref, computed, onUnmounted } from "vue";
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const core = new Temporal(options);
  const trigger = ref(0);

  // Subscribe to core changes
  const unsubscribe = core.subscribe(() => {
    trigger.value++;
  });

  onUnmounted(() => unsubscribe());

  return {
    // Reactive Vue interface
    picked: computed({
      get: () => {
        trigger.value; // Track reactivity
        return core.getDate();
      },
      set: (date) => core.setDate(date),
    }),

    now: computed(() => {
      trigger.value;
      return core.getNow();
    }),

    // Core methods work unchanged
    divide: core.divide.bind(core),
  };
}

export function useYear(temporal) {
  const browsing = computed(() => temporal.picked.value);
  // ... existing Vue logic unchanged
}
```

### 3. React Integration

```typescript
// @usetemporal/react
import { useState, useEffect, useMemo } from "react";
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const [core] = useState(() => new Temporal(options));
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = core.subscribe(() => {
      setRevision((r) => r + 1);
    });
    return unsubscribe;
  }, [core]);

  return useMemo(
    () => ({
      picked: {
        get value() {
          return core.getDate();
        },
        set value(date) {
          core.setDate(date);
        },
      },

      now: {
        get value() {
          return core.getNow();
        },
      },

      divide: core.divide.bind(core),
    }),
    [core, revision]
  );
}

export function useYear(temporal) {
  const [browsing, setBrowsing] = useState(temporal.picked.value);

  useEffect(() => {
    setBrowsing(temporal.picked.value);
  }, [temporal.picked.value]);

  // ... React-specific implementation
  return {
    past: () => setBrowsing(/* previous year */),
    future: () => setBrowsing(/* next year */),
    // ... other methods
  };
}
```

### 4. Svelte Integration

```typescript
// @usetemporal/svelte
import { writable, derived } from "svelte/store";
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const core = new Temporal(options);
  const revision = writable(0);

  core.subscribe(() => {
    revision.update((n) => n + 1);
  });

  const picked = derived(revision, () => core.getDate());
  const now = derived(revision, () => core.getNow());

  return {
    picked: {
      subscribe: picked.subscribe,
      set: (date) => core.setDate(date),
    },

    now,
    divide: core.divide.bind(core),
  };
}

export function useYear(temporal) {
  const browsing = derived(temporal.picked, ($picked) => $picked);
  // ... Svelte-specific implementation
}
```

### 5. Angular Integration

```typescript
// @usetemporal/angular
import { Injectable, Signal, signal, computed } from "@angular/core";
import { Temporal } from "@usetemporal/core";

@Injectable()
export class TemporalService {
  private core: Temporal;
  private revision = signal(0);

  constructor(options = {}) {
    this.core = new Temporal(options);
    this.core.subscribe(() => {
      this.revision.set(this.revision() + 1);
    });
  }

  picked = computed(() => {
    this.revision(); // Track signal
    return this.core.getDate();
  });

  now = computed(() => {
    this.revision();
    return this.core.getNow();
  });

  divide = this.core.divide.bind(this.core);
}

export function useYear(temporal: TemporalService) {
  const browsing = computed(() => temporal.picked());
  // ... Angular-specific implementation
}
```

### 6. Vanilla JavaScript

```typescript
// @usetemporal/vanilla
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const core = new Temporal(options);

  return {
    // Simple getter/setter interface
    get picked() {
      return core.getDate();
    },
    set picked(date) {
      core.setDate(date);
    },

    get now() {
      return core.getNow();
    },

    divide: core.divide.bind(core),

    // Manual subscription for updates
    onChange: (callback) => core.subscribe(callback),
  };
}

export function useYear(temporal) {
  let currentYear = temporal.picked.getFullYear();

  const api = {
    get year() {
      return currentYear;
    },
    past() {
      currentYear--;
      temporal.picked = new Date(currentYear, 0, 1);
    },
    future() {
      currentYear++;
      temporal.picked = new Date(currentYear, 0, 1);
    },
  };

  // Subscribe to changes
  temporal.onChange(() => {
    currentYear = temporal.picked.getFullYear();
  });

  return api;
}
```

## Bundle Strategy

### Framework-Specific Packages

```
@usetemporal/core        # 3KB - Pure JS
@usetemporal/vue         # +2KB - Vue integration
@usetemporal/react       # +2KB - React integration
@usetemporal/svelte      # +1KB - Svelte integration
@usetemporal/angular     # +3KB - Angular integration
@usetemporal/vanilla     # +0.5KB - Vanilla wrapper
```

### Import Strategies

```typescript
// Vue developers (current experience)
import { createTemporal, useYear } from "@usetemporal/vue";

// React developers
import { createTemporal, useYear } from "@usetemporal/react";

// Svelte developers
import { createTemporal, useYear } from "@usetemporal/svelte";

// Framework-agnostic core (smallest bundle)
import { Temporal } from "@usetemporal/core";
```

## Developer Experience Examples

### Vue (Unchanged)

```vue
<script setup>
import { createTemporal, useYear } from "@usetemporal/vue";

const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, "month");
</script>

<template>
  <div>{{ year.name.value }}</div>
</template>
```

### React

```typescript
import { createTemporal, useYear } from "@usetemporal/react";

function Calendar() {
  const temporal = createTemporal();
  const year = useYear(temporal);
  const months = temporal.divide(year, "month");

  return <div>{year.name}</div>;
}
```

### Svelte

```svelte
<script>
import { createTemporal, useYear } from '@usetemporal/svelte';

const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, 'month');
</script>

<div>{$year.name}</div>
```

### Angular

```typescript
import { Component } from "@angular/core";
import { TemporalService, useYear } from "@usetemporal/angular";

@Component({
  template: "<div>{{ year.name() }}</div>",
})
export class CalendarComponent {
  temporal = new TemporalService();
  year = useYear(this.temporal);
  months = this.temporal.divide(this.year, "month");
}
```

### Vanilla JavaScript

```typescript
import { createTemporal, useYear } from "@usetemporal/vanilla";

const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, "month");

// Update UI manually or with your preferred method
temporal.onChange(() => {
  document.getElementById("year").textContent = year.year;
});
```

## Implementation Plan

### Phase 1: Core Extraction (Week 1-2)

- [ ] Extract pure JS core from current Vue implementation
- [ ] Implement subscription/notification pattern
- [ ] Create framework-agnostic `divide()` function
- [ ] Ensure zero external dependencies in core

### Phase 2: Vue Wrapper (Week 3)

- [ ] Create Vue-specific wrapper maintaining current API
- [ ] Ensure 100% backward compatibility
- [ ] Add integration tests
- [ ] Performance benchmarking

### Phase 3: React Integration (Week 4)

- [ ] Implement React hooks and patterns
- [ ] Create React-specific examples
- [ ] Add TypeScript definitions
- [ ] Performance optimization

### Phase 4: Additional Frameworks (Week 5-6)

- [ ] Svelte store integration
- [ ] Angular signals integration
- [ ] Vanilla JavaScript wrapper
- [ ] Framework comparison documentation

### Phase 5: Documentation & Examples (Week 7-8)

- [ ] Framework-specific documentation
- [ ] Migration guides for each framework
- [ ] Performance comparisons
- [ ] Real-world examples for each framework

## Migration Strategy

### Existing Vue Users (Zero Breaking Changes)

```typescript
// v1 (current) - still works
import { usePickle, useYear } from "usetemporal";

// v2 (Vue wrapper) - same experience
import { createTemporal, useYear } from "@usetemporal/vue";
```

### New Framework Users

```typescript
// Gradual adoption path
// 1. Start with core for evaluation
import { Temporal } from "@usetemporal/core";

// 2. Upgrade to framework wrapper
import { createTemporal } from "@usetemporal/react";
```

## Market Impact

### Addressable Market Expansion

```
Current:  1M Vue developers
Target:   5M+ JavaScript developers (5x growth potential)
```

### Competitive Advantage

```
Library         | Frameworks | Bundle Size | Innovation
----------------|------------|-------------|------------
date-fns        | All        | 45KB        | Traditional
Luxon           | All        | 65KB        | Traditional
moment.js       | All        | 230KB       | Legacy
useTemporal v1  | Vue only   | 15KB        | Revolutionary
useTemporal v2  | All ✅     | 3KB ✅      | Revolutionary ✅
```

## Success Metrics

### Adoption Metrics

- [ ] Downloads across all framework packages
- [ ] GitHub stars from different framework communities
- [ ] Framework-specific documentation views

### Technical Metrics

- [ ] Bundle size targets: Core 3KB, Framework wrappers +1-3KB
- [ ] Performance parity across frameworks
- [ ] API consistency scores

### Community Metrics

- [ ] Framework-specific community contributions
- [ ] Cross-framework example repositories
- [ ] Integration with framework-specific tooling

## Conclusion

Making useTemporal framework-agnostic represents the most significant opportunity for growth and adoption:

1. **5x Market Expansion** - From Vue-only to all JavaScript frameworks
2. **Revolutionary Everywhere** - Bring `divide()` pattern to entire ecosystem
3. **Bundle Efficiency** - Smallest time library for every framework
4. **Future-Proof** - Works with any current or future framework

This positions useTemporal to become the **universal standard** for time handling in JavaScript, regardless of framework choice.

---

**Vision: One revolutionary time library, every JavaScript framework.** 🌍

## Native Observable Integration Strategy

### Leveraging Cutting-Edge Web Standards

The [WICG Observable proposal](https://github.com/wicg/observable) provides a perfect foundation for our framework-agnostic architecture. Rather than building a custom subscription system, we can leverage the emerging web standard.

#### Native Observable API Preview

```typescript
// Native Observable API (proposed)
element
  .when("click")
  .filter((e) => e.target.matches(".foo"))
  .map((e) => ({ x: e.clientX, y: e.clientY }))
  .subscribe({ next: handleClickAtPoint });

// Automatic cancellation
element
  .when("mousemove")
  .takeUntil(document.when("mouseup"))
  .subscribe({ next: (e) => console.log(e) });
```

### Enhanced useTemporal Core with Native Observables

#### Future-Ready Core Implementation

```typescript
// @usetemporal/core - Enhanced with native Observable support
export class Temporal {
  private _date: Date;
  private _now: Date;
  private _observable: Observable;

  constructor(options = {}) {
    this._date = options.date || new Date();
    this._now = options.now || new Date();

    // Use native Observable when available, polyfill otherwise
    this._observable = this.createObservable();
  }

  private createObservable() {
    if (typeof Observable !== "undefined") {
      // Native Observable API
      return new Observable((subscriber) => {
        const listener = () => subscriber.next(this._date);
        this._listeners.add(listener);

        return () => this._listeners.delete(listener);
      });
    } else {
      // Polyfill for current browsers
      return this.createPolyfillObservable();
    }
  }

  // Enhanced divide() with Observable streams
  divide(unit: TimeUnit, subdivision: TimeUnit) {
    const divisions = divide(this._date, unit, subdivision);

    // Return Observable stream of time divisions
    return this._observable
      .map(() => divide(this._date, unit, subdivision))
      .startWith(divisions);
  }

  // Framework-agnostic subscription using native Observable
  subscribe(observer) {
    return this._observable.subscribe(observer);
  }

  // Reactive date updates
  setDate(date: Date) {
    this._date = date;
    // Native Observable handles notification automatically
  }
}
```

### Framework Integration with Native Observables

#### Vue Integration (Enhanced)

```typescript
// @usetemporal/vue - Enhanced with Observable support
import { ref, onUnmounted, watchEffect } from "vue";
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const core = new Temporal(options);
  const picked = ref(core.getDate());
  const now = ref(core.getNow());

  // Subscribe to native Observable stream
  const subscription = core.subscribe({
    next: (date) => {
      picked.value = date;
      now.value = new Date();
    },
  });

  onUnmounted(() => subscription.unsubscribe());

  return {
    picked,
    now,
    divide: core.divide.bind(core),

    // Expose Observable for advanced use cases
    observable: core.observable,
  };
}
```

#### React Integration (Enhanced)

```typescript
// @usetemporal/react - Enhanced with Observable support
import { useState, useEffect } from "react";
import { Temporal } from "@usetemporal/core";

export function createTemporal(options = {}) {
  const [core] = useState(() => new Temporal(options));
  const [state, setState] = useState({
    picked: core.getDate(),
    now: core.getNow(),
  });

  useEffect(() => {
    // Subscribe to native Observable
    const subscription = core.subscribe({
      next: (date) =>
        setState({
          picked: date,
          now: new Date(),
        }),
    });

    return () => subscription.unsubscribe();
  }, [core]);

  return {
    picked: { value: state.picked },
    now: { value: state.now },
    divide: core.divide.bind(core),
    observable: core.observable,
  };
}
```

### Advanced Observable Patterns

#### Time-Based Reactive Streams

```typescript
// Revolutionary time streams using native Observables
const temporal = createTemporal();

// Stream of months as user navigates
const monthStream = temporal.observable
  .map((date) => useMonth(temporal))
  .distinctUntilChanged();

// Stream of days in current month
const dayStream = monthStream
  .flatMap((month) => temporal.divide(month, "day"))
  .takeUntil(abortSignal);

// Automatic UI updates
dayStream.subscribe({
  next: (days) => updateCalendarUI(days),
});
```

#### EventTarget Integration

```typescript
// Leverage native Observable EventTarget integration
export function useTemporalEvents(element) {
  const temporal = createTemporal();

  // Navigate on keyboard events using native .when()
  element
    .when("keydown")
    .filter((e) => ["ArrowLeft", "ArrowRight"].includes(e.key))
    .map((e) => (e.key === "ArrowLeft" ? -1 : 1))
    .subscribe({
      next: (direction) => {
        if (direction > 0) temporal.future();
        else temporal.past();
      },
    });

  return temporal;
}
```

### Progressive Enhancement Strategy

#### Polyfill Integration

```typescript
// @usetemporal/core - Progressive enhancement
import { Observable } from "@usetemporal/observable-polyfill";

export class Temporal {
  constructor(options = {}) {
    // Detect native Observable support
    const ObservableImpl = globalThis.Observable || Observable;

    this._observable = new ObservableImpl((subscriber) => {
      // Implementation works with both native and polyfill
    });
  }
}
```

#### Bundle Strategy with Native Support

```typescript
// Smart bundling based on browser support
// @usetemporal/core/modern - For browsers with native Observable
// @usetemporal/core/polyfill - With Observable polyfill
// @usetemporal/core/auto - Detects and loads appropriate version

import { createTemporal } from "@usetemporal/core/auto";
// Automatically uses native Observable or polyfill
```

### Competitive Advantage

#### Standards-Based Innovation

```
Feature                 | useTemporal v2 | RxJS      | Other Libraries
------------------------|---------------|-----------|----------------
Native Observable       | ✅ Ready      | ❌ Custom | ❌ Custom
EventTarget Integration | ✅ Built-in   | ❌ Manual | ❌ Manual
AbortController Support | ✅ Native     | ❌ Manual | ❌ Manual
Bundle Size            | 3KB           | 45KB      | 15-60KB
Web Standards Aligned  | ✅ Future     | ❌ Legacy | ❌ Legacy
```

#### Future-Proof Architecture

```typescript
// Today: Works with polyfill
const temporal = createTemporal();

// Future: Automatically uses native Observable when available
// Zero code changes needed!
const temporal = createTemporal(); // Now native Observable
```
