# useTemporal - Revolutionary Time Library

**The only JavaScript time library with the revolutionary `divide()` pattern**

```typescript
// Divide any time unit into smaller units
const months = temporal.divide(year, "month");
const days = temporal.divide(month, "day");
const hours = temporal.divide(day, "hour");
```

## 🏗️ Monorepo Structure

This repository is organized as a monorepo with clear separation between the library and demo application:

```
├── packages/
│   ├── usetemporal/          # 📚 Core Library Package
│   │   ├── src/
│   │   │   ├── use/          # Composables (useYear, useMonth, etc.)
│   │   │   ├── types/        # TypeScript definitions
│   │   │   └── index.ts      # Main export
│   │   ├── package.json      # Library dependencies
│   │   └── vite.config.ts    # Library build config
│   │
│   └── demo/                 # 🎨 Demo Application
│       ├── src/
│       │   ├── components/   # Vue components
│       │   ├── App.vue       # Demo application
│       │   └── main.ts       # Demo entry point
│       ├── package.json      # Demo dependencies
│       └── vite.config.ts    # Demo build config
│
├── research/                 # 📋 Strategic Planning
│   ├── RFC-001-Date-Adapter-Plugin-System.md
│   ├── RFC-002-API-Naming-Conventions.md
│   ├── RFC-003-Bundle-Optimization-Tree-Shaking.md
│   ├── RFC-004-Framework-Agnostic-Architecture.md
│   ├── RFC-005-Reactive-Core-Architecture.md
│   └── STRATEGY-SUMMARY.md
│
└── package.json              # Monorepo workspace config
```

## 🚀 Quick Start

### Development

```bash
# Install dependencies for all packages
npm install

# Start the demo application
npm run dev
# Opens http://localhost:8080

# Build the library
npm run build:lib

# Build the demo
npm run build:demo

# Build everything
npm run build
```

### Using the Library

```bash
# Install the library (when published)
npm install usetemporal
```

```typescript
// Vue 3 Composition API
import { usePickle, useYear, useMonth } from "usetemporal";

const temporal = usePickle({
  date: new Date(),
  locale: "en-US",
});

const year = useYear(temporal);
const months = temporal.divide(year, "month");
```

## 🎯 v2.0 Roadmap

We're currently implementing a **massive transformation** to make useTemporal the universal standard for time handling in JavaScript:

### **🏗️ Five Pillar Strategy**

1. **📦 Date Adapter Plugin System** - Zero dependencies, support all date libraries
2. **🎨 Professional API Naming** - `usePickle()` → `createTemporal()`
3. **⚡ Bundle Optimization** - 69% size reduction (15KB → 4.7KB)
4. **🌍 Framework-Agnostic** - Vue, React, Angular, Svelte, Vanilla JS
5. **🚀 Modern Reactive Core** - Functional architecture with `@vue/reactivity`

### **📊 Impact**

- **5x Market Expansion**: 1M → 5M+ developers
- **69% Bundle Reduction**: 15KB → 4.7KB
- **Universal Compatibility**: All JavaScript frameworks
- **Zero Breaking Changes**: Existing Vue users unaffected

## 🔬 Revolutionary Features

### **🧩 Hierarchical Design**

Every time scale uses the same consistent interface:

```typescript
// Same API for all time units
(year.past() === month.past()) === day.past();
(year.future() === month.future()) === day.future();
(year.isNow === month.isNow) === day.isNow;
```

### **⚡ divide() Pattern**

Divide any time unit into smaller units with perfect synchronization:

```typescript
const temporal = usePickle();

// Infinite subdivision possibilities
const year = useYear(temporal);
const months = temporal.divide(year, "month"); // 12 months
const weeks = temporal.divide(month, "week"); // ~4 weeks
const days = temporal.divide(week, "day"); // 7 days
const hours = temporal.divide(day, "hour"); // 24 hours
const minutes = temporal.divide(hour, "minute"); // 60 minutes
```

### **🔄 Reactive by Design**

Built on Vue 3 reactivity. Changes propagate automatically:

```typescript
// All connected units update automatically
temporal.picked.value = new Date(2024, 5, 15);

// Year, month, day, hour all reflect the change
console.log(year.name.value); // "2024"
console.log(month.name.value); // "June 2024"
console.log(day.name.value); // "Saturday, June 15, 2024"
```

## 🎨 Demo Application

The demo application showcases all features with interactive examples:

- **🚀 Basic Demo**: Time navigation across scales
- **🌳 Hierarchy**: See how all units stay synchronized
- **🔄 divide() Pattern**: Visualize time subdivision
- **📅 GitHub Chart**: Real-world calendar implementation

Visit the demo at `http://localhost:8080` after running `npm run dev`.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory and at our documentation site (coming soon).

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and check out our RFC documents in the `research/` directory for strategic context.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Ready to revolutionize time handling in JavaScript?** 🕒✨
