---
layout: home

hero:
  name: "useTemporal"
  text: "Revolutionary time library"
  tagline: "The only JavaScript time library with the divide() pattern for infinite hierarchical time subdivision"
  image:
    src: /hero-image.svg
    alt: useTemporal
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/usetemporal

features:
  - icon: 🔄
    title: Revolutionary divide() Pattern
    details: Unique hierarchical time management with infinite subdivision. Divide years into months, months into days, days into hours - all perfectly synchronized.
  - icon: 🎯
    title: Framework Agnostic
    details: Works with Vue, React, Angular, Svelte, or vanilla JavaScript. Built on @vue/reactivity for universal reactive primitives.
  - icon: 🔌
    title: Pluggable Date Adapters
    details: Choose your date library - native JS, date-fns, Luxon, or Temporal API. Auto-detection with zero-config fallback.
  - icon: 📦
    title: Zero Dependencies*
    details: Native adapter provides full functionality without external dependencies. Add adapters only when needed.
  - icon: 🌍
    title: Internationalization
    details: Full i18n support with locale-aware formatting. Works seamlessly with Intl.DateTimeFormat.
---

## Quick Example

```typescript
import { createTemporal } from "usetemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Create temporal instance
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  locale: "en-US",
});

// Divide time hierarchically
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // 12 months
const days = temporal.divide(months[5], "day"); // ~30 days in June

// Navigate through time
months[5].future(); // July
months[5].past(); // May

// Check relationships
months[5].isNow; // true if current month
```

## Why useTemporal?

### 🎯 The Only Library with divide() Pattern

No other JavaScript date library offers hierarchical time division. While others focus on parsing and formatting, useTemporal revolutionizes how you think about time relationships.

### 🚀 Modern Architecture

- **ESM-first**: 100% ES modules
- **Tree-shakeable**: Import only what you need
- **TypeScript**: Full type safety
- **Reactive**: Built-in reactivity for UI frameworks
- **Tested**: 91.6% test coverage

### 🔧 Production Ready

- Monorepo architecture with separate packages
- Comprehensive test suite
- Professional API design
- Bundle size optimized (<6KB core)

## Installation

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

:::

## License

MIT
