# RFC 003: Bundle Optimization & Tree-Shaking

- **Start Date:** 2024-12-21
- **Author:** useTemporal Team
- **Status:** Draft
- **Type:** Performance Enhancement
- **Related:** RFC-001 (Date Adapter), RFC-002 (API Naming)

## Summary

Optimize useTemporal for minimal bundle size through aggressive tree-shaking, modular architecture, and smart code splitting. Target: **3KB core, 15KB full bundle**.

## Current State Analysis

### Bundle Size Issues

```typescript
// Current problematic imports
import { usePickle, useYear, useMonth, useDay } from "usetemporal";
// ↑ Imports everything, even unused composables

// With date-fns dependency:
// ~60KB total (date-fns 45KB + useTemporal 15KB)
```

### Tree-Shaking Problems

1. **Monolithic exports** - importing one composable pulls in everything
2. **Date-fns dependency** - Always bundled even for simple use cases
3. **Heavy locale data** - Formatting strings for all locales
4. **Utility functions** - Helper methods always included

## Optimization Strategy

### 1. Micro-Package Architecture

#### Core Packages (Tree-Shakable)

```typescript
// @usetemporal/core - 3KB
export { createTemporal } from "./createTemporal";
export { divide } from "./divide";

// @usetemporal/composables - 5KB
export { useYear } from "./useYear";
export { useMonth } from "./useMonth";
export { useDay } from "./useDay";
export { useHour } from "./useHour";

// @usetemporal/utils - 2KB
export { formatters } from "./formatters";
export { validators } from "./validators";

// @usetemporal/adapters - 0KB (adapter packages separate)
// Users only install what they need
```

#### Individual Composable Exports

```typescript
// Perfect tree-shaking - import only what you use
import { createTemporal } from "@usetemporal/core";
import { useYear } from "@usetemporal/year"; // 1KB only
import { useMonth } from "@usetemporal/month"; // 1KB only

// Result: 5KB total instead of 15KB
```

### 2. Lazy-Loaded Features

#### Smart Imports

```typescript
// Core functionality - always available
const temporal = createTemporal();

// Advanced features - lazy loaded
const advanced = await import("@usetemporal/advanced");
const timeline = advanced.useTimeline(temporal);

// Formatters - only when needed
const formatters = await import("@usetemporal/formatters");
const formatted = formatters.format(date, "YYYY-MM-DD");
```

#### Dynamic Adapter Loading

```typescript
// Adapters loaded on demand
const temporal = createTemporal({
  adapter: () => import("@usetemporal/temporal-adapter"),
});

// Or detect and auto-load
const temporal = createTemporal({
  adapter: "auto", // Loads best available adapter
});
```

### 3. Minimal Core Implementation

#### Ultra-Light Core (3KB)

```typescript
// @usetemporal/core/src/createTemporal.ts
export function createTemporal(options = {}) {
  const picked = ref(options.date || new Date());
  const now = ref(options.now || new Date());

  return {
    picked,
    now,
    divide: (unit, subdivision) => divide(picked.value, unit, subdivision),
  };
}

// @usetemporal/core/src/divide.ts
export function divide(date, unit, subdivision) {
  // Minimal native implementation
  // No external dependencies
  // ~50 lines of pure logic
}
```

#### Essential Composables Only

```typescript
// Each composable is 200-300 bytes
// @usetemporal/year/index.ts
export function useYear(temporal) {
  // Minimal implementation using only native Date APIs
  // No date-fns, no heavy dependencies
}
```

### 4. Optional Enhancement Layers

#### Layer 1: Core (3KB)

```typescript
import { createTemporal } from "@usetemporal/core";
const temporal = createTemporal();
const divisions = temporal.divide(new Date(), "year", "month");
```

#### Layer 2: Composables (+5KB = 8KB total)

```typescript
import { useYear } from "@usetemporal/year";
const year = useYear(temporal);
```

#### Layer 3: Formatters (+2KB = 10KB total)

```typescript
import { format } from "@usetemporal/format";
const formatted = format(date, "YYYY-MM-DD");
```

#### Layer 4: Advanced Features (+5KB = 15KB total)

```typescript
import { useTimeline, useRecurrence } from "@usetemporal/advanced";
```

### 5. Build Optimizations

#### ESM-First Strategy

```json
// package.json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./core": {
      "import": "./dist/core.mjs",
      "require": "./dist/core.cjs"
    },
    "./year": {
      "import": "./dist/year.mjs",
      "require": "./dist/year.cjs"
    }
  },
  "sideEffects": false // ← Critical for tree-shaking
}
```

#### Individual File Exports

```typescript
// Enable perfect tree-shaking
// usetemporal/year
export { useYear } from "./src/useYear";

// usetemporal/month
export { useMonth } from "./src/useMonth";

// Users import exactly what they need
import { useYear } from "usetemporal/year";
import { useMonth } from "usetemporal/month";
```

## Implementation Examples

### Ultra-Minimal Usage (3KB)

```typescript
import { createTemporal } from "@usetemporal/core";

const temporal = createTemporal();
const months = temporal.divide(new Date(), "year", "month");
// 3KB bundle - native Date APIs only
```

### Balanced Usage (8KB)

```typescript
import { createTemporal } from "@usetemporal/core";
import { useYear, useMonth } from "@usetemporal/composables";

const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, "month");
// 8KB bundle - core + essential composables
```

### Full-Featured (15KB)

```typescript
import { createTemporal } from "@usetemporal/core";
import { useYear, useMonth, useDay } from "@usetemporal/composables";
import { format } from "@usetemporal/format";
import { nativeAdapter } from "@usetemporal/native-adapter";

const temporal = createTemporal({ adapter: nativeAdapter });
const year = useYear(temporal);
const formatted = format(year.raw.value, "YYYY");
// 15KB bundle - comprehensive features
```

### Enterprise Usage (30KB with date-fns)

```typescript
import { createTemporal } from "@usetemporal/core";
import { dateFnsAdapter } from "@usetemporal/date-fns-adapter";
import { useTimeline } from "@usetemporal/advanced";

const temporal = createTemporal({ adapter: dateFnsAdapter });
const timeline = useTimeline(temporal);
// 30KB - full power with date-fns
```

## Target Bundle Sizes

### Size Goals

```
Core only:           3KB  (createTemporal + divide)
+ Basic composables: 8KB  (useYear, useMonth, useDay)
+ Formatters:       10KB  (basic formatting)
+ Advanced:         15KB  (timelines, recurrence)
+ date-fns adapter: 60KB  (full compatibility)
+ All features:     25KB  (everything except date-fns)
```

### Current vs. Target

```
Current (monolithic): ~15KB minimum
Target (modular):      ~3KB minimum
Improvement:           5x smaller for basic usage
```

## Technical Implementation

### 1. Package Structure

```
packages/
├── core/           # 3KB - createTemporal + divide
├── year/           # 1KB - useYear composable
├── month/          # 1KB - useMonth composable
├── day/            # 1KB - useDay composable
├── hour/           # 1KB - useHour composable
├── format/         # 2KB - formatting utilities
├── native-adapter/ # 2KB - zero-dependency adapter
├── date-fns-adapter/ # 45KB - date-fns compatibility
└── advanced/       # 5KB - timelines, recurrence
```

### 2. Build Configuration

```typescript
// rollup.config.js
export default [
  // Individual packages
  {
    input: "packages/core/src/index.ts",
    output: { file: "dist/core.mjs", format: "es" },
    external: ["vue"],
  },
  {
    input: "packages/year/src/index.ts",
    output: { file: "dist/year.mjs", format: "es" },
    external: ["vue", "@usetemporal/core"],
  },
  // ... repeat for each package
];
```

### 3. Import Strategies

```typescript
// Strategy 1: Granular imports (best tree-shaking)
import { createTemporal } from "@usetemporal/core";
import { useYear } from "@usetemporal/year";

// Strategy 2: Grouped imports (convenience)
import { createTemporal, useYear } from "@usetemporal/essentials";

// Strategy 3: Everything (existing behavior)
import { createTemporal, useYear, useMonth } from "usetemporal";
```

## Migration Strategy

### Phase 1: Non-Breaking Addition

```typescript
// Add new modular exports alongside existing ones
// Both work simultaneously:

// New way (optimal)
import { createTemporal } from "@usetemporal/core";

// Old way (still works)
import { usePickle } from "usetemporal";
```

### Phase 2: Documentation Update

- Update all examples to use modular imports
- Show bundle size comparisons
- Provide migration guide

### Phase 3: Deprecation (v3.0)

- Deprecate monolithic imports
- Keep modular as primary recommendation

## Success Metrics

### Bundle Size Targets

- [ ] Core: 3KB or less
- [ ] Essential: 8KB or less
- [ ] Full-featured: 15KB or less
- [ ] Tree-shaking efficiency: 90%+

### Developer Experience

- [ ] Import clarity: developers understand what they're importing
- [ ] Build warnings: notify about unused imports
- [ ] Documentation: clear size implications

### Performance

- [ ] Runtime overhead: <1ms for initialization
- [ ] Memory usage: <100KB for full feature set
- [ ] Tree-shaking: eliminates 90%+ of unused code

## Conclusion

This optimization strategy will make useTemporal:

1. **3KB minimum** - Smallest possible entry point
2. **Pay-as-you-go** - Only bundle what you use
3. **Perfect tree-shaking** - Dead code elimination
4. **Framework-agnostic** - Works anywhere JavaScript runs
5. **Future-proof** - Modular architecture scales

The result: useTemporal becomes the **most efficient time library** in the JavaScript ecosystem while maintaining its revolutionary `divide()` pattern.

---

**Target: Make useTemporal smaller than any competing time library while offering more innovative features.**
