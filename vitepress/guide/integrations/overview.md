# Framework Integration Overview

useTemporal is designed to work seamlessly with any JavaScript framework. While it uses `@vue/reactivity` for its reactive core, this doesn't mean it's Vue-specific - the reactivity package is framework-agnostic and can be used anywhere.

## Supported Frameworks

### Vue 3
Native integration with Vue's reactivity system. Works out of the box with computed properties, watchers, and template rendering.

[View Vue Examples →](/examples/frameworks/vue-integration)

### React
Full support through hooks and context API. Includes custom hooks for reactive updates.

[View React Examples →](/examples/frameworks/react-integration)

### Angular
Works with Angular's change detection through observables and signals.

### Svelte
Compatible with Svelte stores and reactive statements.

### Vanilla JavaScript
No framework? No problem. Works perfectly with plain JavaScript.

## Core Principles

### 1. Framework Agnostic Core
The core library has zero framework dependencies. It only uses `@vue/reactivity` which is a standalone package.

```typescript
// Works in any environment
import { createTemporal, usePeriod, divide } from 'usetemporal'

const temporal = createTemporal({ date: new Date() })
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')
```

### 2. Reactive by Design
Built on reactive primitives that can be adapted to any framework's reactivity system.

### 3. Tree-Shakeable
Import only what you need. Unused features are automatically removed from your bundle.

## Integration Patterns

### Provider Pattern
Most frameworks benefit from a provider pattern to share the temporal instance:

```typescript
// Create once at app level
const temporal = createTemporal({ date: new Date() })

// Share via framework's context/provide system
```

### Hook/Composable Pattern
Create framework-specific wrappers for better developer experience:

```typescript
// Vue composable
export function useTemporal() {
  return inject('temporal')
}

// React hook
export function useTemporal() {
  return useContext(TemporalContext)
}
```

## Best Practices

1. **Single Instance**: Create one temporal instance per app (or per independent time context)
2. **Provide at Root**: Make temporal available to all components via context/provide
3. **Wrap for DX**: Create framework-specific wrappers for better type inference
4. **Lazy Load**: Load adapters only when needed to optimize bundle size

## Quick Start by Framework

### Vue 3
```bash
npm install usetemporal vue
```

### React
```bash
npm install usetemporal react react-dom
```

### Angular
```bash
npm install usetemporal @angular/core
```

### Svelte
```bash
npm install usetemporal svelte
```

## See Also

- [Vue Integration Guide](/examples/frameworks/vue-integration)
- [React Integration Guide](/examples/frameworks/react-integration)
- [Core Concepts](/guide/core-concepts)
- [Getting Started](/guide/getting-started)