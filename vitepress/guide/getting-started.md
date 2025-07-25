# Getting Started

Welcome to useTemporal! This guide provides a quick overview to get you up and running.

## What is useTemporal?

useTemporal is a revolutionary time library featuring the unique `divide()` pattern for hierarchical time management. It's framework-agnostic, reactive, and has zero dependencies.

## Quick Start Path

Follow these steps to get started:

1. **[Install](/guide/installation)** - Add useTemporal to your project
2. **[Core Concepts](/guide/core-concepts)** - Understand the basics
3. **[First App](/guide/first-app)** - Build something simple
4. **[Examples](/examples/)** - See complete implementations

## Key Features

✨ **Revolutionary divide() Pattern**
```typescript
const months = divide(temporal, year, 'month')
const days = divide(temporal, month, 'day')
```

🎯 **Framework Agnostic**
- Works with Vue, React, Angular, Svelte, and vanilla JS

⚡ **Zero Dependencies**
- Native adapter requires no external libraries

🔄 **Reactive by Design**
- Built on `@vue/reactivity` for automatic updates

## Basic Example

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create temporal instance
const temporal = createTemporal()

// Get reactive month
const month = usePeriod(temporal, 'month')

// Divide into days
const days = divide(temporal, month.value, 'day')

// Navigate
temporal.browsing.value = next(temporal, month.value)
```

## Learn More

### Concepts & Patterns
- [Core Concepts](/guide/core-concepts) - Periods, reactivity, and operations
- [divide() Pattern](/guide/divide-pattern) - Our revolutionary approach
- [Operations](/guide/operations) - Navigation, comparison, and more

### Practical Guides
- [Date Adapters](/guide/adapters) - Support for different date libraries
- [TypeScript](/guide/typescript) - Full type safety
- [Performance](/guide/performance) - Optimization tips

### Reference
- [API Reference](/api/) - Complete API documentation
- [Examples](/examples/) - Real-world implementations

## Ready to Start?

→ [Install useTemporal](/guide/installation) and build your first time-based interface!