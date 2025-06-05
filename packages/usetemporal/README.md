# useTemporal

**The only JavaScript time library with the revolutionary `divide()` pattern**

[![npm version](https://img.shields.io/npm/v/usetemporal)](https://www.npmjs.com/package/usetemporal)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-purple.svg)](#)

## 🚀 Quick Start

```bash
npm install usetemporal
```

```typescript
import { createTemporal, useYear, useMonth } from "usetemporal";

// Create temporal instance
const temporal = createTemporal({
  date: new Date(),
  locale: "en-US",
});

// Use hierarchical time units
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // 12 months

// All units have the same interface
year.past(); // Navigate to previous year
year.future(); // Navigate to next year
year.isNow; // true if current year
year.name.value; // "2024"
```

## ⚡ The Revolutionary `divide()` Pattern

Divide any time unit into smaller units with perfect synchronization:

```typescript
const temporal = createTemporal();

// Infinite subdivision possibilities
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // 12 months
const weeks = temporal.divide(month, "week"); // ~4 weeks
const days = temporal.divide(week, "day"); // 7 days
const hours = temporal.divide(day, "hour"); // 24 hours
const minutes = temporal.divide(hour, "minute"); // 60 minutes
```

## 🧩 Hierarchical Design

Every time scale uses the same consistent interface:

```typescript
// Same API for all time units
(year.past() === month.past()) === day.past();
(year.future() === month.future()) === day.future();
(year.isNow === month.isNow) === day.isNow;
```

## 📦 Package Structure

```
packages/usetemporal/src/
├── core/           # Core temporal functionality
│   ├── createTemporal.ts   # Main temporal composable
│   └── index.ts            # Core exports
├── composables/    # Time unit composables
│   ├── useYear.ts      # Year-level operations
│   ├── useMonth.ts     # Month-level operations
│   ├── useDay.ts       # Day-level operations
│   └── ...             # All time scales
├── utils/          # Utility functions
│   ├── useDatePicker.ts    # Date picker utilities
│   ├── useTimeBox.ts       # Time box utilities
│   └── each.ts             # Helper functions
└── types/          # TypeScript definitions
    ├── core.ts         # Core type definitions
    └── index.ts        # Type exports
```

## 🎯 Available Composables

### Core

- `createTemporal()` - Main temporal instance
- `useTemporal()` - Alias for createTemporal

### Time Units (Hierarchical)

- `useMillennium()` - 1000-year periods
- `useCentury()` - 100-year periods
- `useDecade()` - 10-year periods
- `useYear()` - 12-month periods
- `useYearQuarter()` - 3-month periods
- `useMonth()` - Monthly periods
- `useWeek()` - 7-day periods
- `useDay()` - 24-hour periods
- `useHour()` - 60-minute periods
- `useHourQuarter()` - 15-minute periods
- `useMinute()` - 60-second periods

### Utilities

- `useDatePicker()` - Date picker functionality
- `useTimeBox()` - Time box operations
- `useCurrentDateTime()` - Current time utilities

## 🔄 Reactive by Design

Built on Vue 3 reactivity, changes propagate automatically:

```typescript
import { watch } from "vue";

// All connected units update automatically
temporal.picked.value = new Date(2024, 5, 15);

// Watch for changes
watch(year.name, (newYear) => {
  console.log(`Year changed to: ${newYear}`);
});
```

## 🌍 Framework Agnostic

While built with Vue 3 reactivity, useTemporal works with any JavaScript framework:

```typescript
// React
import { useEffect } from "react";
import { createTemporal, useYear } from "usetemporal";

// Angular
import { Component } from "@angular/core";
import { createTemporal, useYear } from "usetemporal";

// Svelte
import { createTemporal, useYear } from "usetemporal";

// Vanilla JS
import { createTemporal, useYear } from "usetemporal";
```

## 📚 Documentation

- [API Reference](../../docs/api/)
- [Examples](../../docs/examples/)
- [Concepts](../../docs/concepts/)

## 🤝 Contributing

See the main [contributing guidelines](../../CONTRIBUTING.md) in the monorepo root.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the [useTemporal monorepo](../../) - revolutionizing time handling in JavaScript** 🕒✨
