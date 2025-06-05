# RFC 001: Date Adapter Plugin System

- **Start Date:** 2024-12-21
- **Author:** useTemporal Team
- **Status:** Draft
- **Type:** Major Feature

## Summary

Introduce a plugin architecture for date manipulation in useTemporal, allowing users to choose between different date libraries (Temporal API, date-fns, Luxon, native) while maintaining the same revolutionary `divide()` pattern and fractal time unit interface.

## Motivation

### Current State

useTemporal currently has a hard dependency on date-fns, which:

- Increases bundle size (~60KB)
- Locks users into a specific date library ecosystem
- Creates potential friction for adoption
- Will become outdated when the native Temporal API lands in browsers

### Problems to Solve

1. **Bundle Size Concerns**: Developers want minimal dependencies for simple use cases
2. **Library Lock-in**: Teams already using Luxon/other libraries face double dependencies
3. **Future-Proofing**: Temporal API will eventually make date-fns unnecessary
4. **Flexibility**: Different projects have different date handling requirements

### Opportunity

The core innovation of useTemporal is the `divide()` pattern and fractal time units, not date manipulation itself. By abstracting date operations, we can:

- Maintain our revolutionary API
- Support any underlying date library
- Reduce barriers to adoption
- Future-proof for Temporal API

## Detailed Design

### Core Architecture

#### 1. Date Adapter Interface

```typescript
interface DateAdapter {
  // Basic arithmetic
  add(date: Date, amount: number, unit: TimeUnit): Date;
  subtract(date: Date, amount: number, unit: TimeUnit): Date;

  // Boundary calculations
  startOf(date: Date, unit: TimeUnit): Date;
  endOf(date: Date, unit: TimeUnit): Date;

  // Comparisons
  isSame(a: Date, b: Date, unit: TimeUnit): boolean;
  isBefore(a: Date, b: Date): boolean;
  isAfter(a: Date, b: Date): boolean;

  // Formatting
  format(date: Date, pattern: string, locale?: string): string;

  // Utilities
  getDaysInMonth(date: Date): number;
  getWeeksInMonth(date: Date): number;
  isLeapYear(date: Date): boolean;
  isWeekend(date: Date): boolean;

  // Timezone handling (optional)
  toTimezone?(date: Date, timezone: string): Date;
}

type TimeUnit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";
```

#### 2. Plugin Registration System

```typescript
// Core useTemporal with adapter support
export function usePickle(options: UsePickleOptions = {}) {
  const adapter = options.adapter || getDefaultAdapter();

  return {
    picked: ref(options.date || new Date()),
    now: ref(options.now || new Date()),
    locale: options.locale || "en-US",
    adapter,

    // Core methods use adapter internally
    divide(unit: TimeUnit, subdivision: TimeUnit) {
      return createDivisions(this.picked.value, unit, subdivision, adapter);
    },
  };
}

interface UsePickleOptions {
  date?: Date;
  now?: Date;
  locale?: string;
  adapter?: DateAdapter;
}
```

### 3. Adapter Implementations

#### Native Adapter (Zero Dependencies)

```typescript
// @usetemporal/native-adapter
export const nativeAdapter: DateAdapter = {
  add(date: Date, amount: number, unit: TimeUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case "year":
        result.setFullYear(result.getFullYear() + amount);
        return result;
      case "month":
        result.setMonth(result.getMonth() + amount);
        return result;
      case "day":
        result.setDate(result.getDate() + amount);
        return result;
      case "hour":
        result.setHours(result.getHours() + amount);
        return result;
      // ... other units
    }
  },

  startOf(date: Date, unit: TimeUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case "day":
        result.setHours(0, 0, 0, 0);
        return result;
      case "month":
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        return result;
      // ... other units
    }
  },

  format(date: Date, pattern: string, locale = "en-US"): string {
    // Basic formatting using Intl API
    if (pattern === "YYYY") return date.getFullYear().toString();
    if (pattern === "MMMM")
      return date.toLocaleDateString(locale, { month: "long" });
    // ... basic patterns only

    return date.toLocaleDateString(locale);
  },

  // ... other methods with basic implementations
};
```

#### Date-fns Adapter

```typescript
// @usetemporal/date-fns-adapter
import {
  add,
  sub,
  startOfDay,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfMonth,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  format,
  getDaysInMonth,
  isLeapYear,
  isWeekend,
} from "date-fns";

export const dateFnsAdapter: DateAdapter = {
  add: (date, amount, unit) => add(date, { [unit]: amount }),
  subtract: (date, amount, unit) => sub(date, { [unit]: amount }),

  startOf(date: Date, unit: TimeUnit): Date {
    switch (unit) {
      case "day":
        return startOfDay(date);
      case "month":
        return startOfMonth(date);
      case "year":
        return startOfYear(date);
      // ... other units
    }
  },

  format: (date, pattern, locale) => format(date, pattern, { locale }),
  getDaysInMonth,
  isLeapYear,
  isWeekend,
  // ... full date-fns power
};
```

#### Temporal Adapter (Future-Ready)

```typescript
// @usetemporal/temporal-adapter
import { Temporal } from "@js-temporal/polyfill";

export const temporalAdapter: DateAdapter = {
  add(date: Date, amount: number, unit: TimeUnit): Date {
    const plainDate = Temporal.PlainDateTime.from(date.toISOString());
    const duration = { [unit]: amount };
    return plainDate
      .add(duration)
      .toZonedDateTime(Temporal.Now.timeZone())
      .toDate();
  },

  startOf(date: Date, unit: TimeUnit): Date {
    const plainDate = Temporal.PlainDateTime.from(date.toISOString());

    switch (unit) {
      case "day":
        return plainDate
          .toPlainDate()
          .toZonedDateTime(Temporal.Now.timeZone())
          .toDate();
      case "month":
        return plainDate
          .with({ day: 1 })
          .toPlainDate()
          .toZonedDateTime(Temporal.Now.timeZone())
          .toDate();
      // ... cleaner than date-fns!
    }
  },

  format(date: Date, pattern: string, locale = "en-US"): string {
    const temporal = Temporal.PlainDateTime.from(date.toISOString());
    // Use Temporal's superior formatting
    return temporal.toLocaleString(locale, {
      /* pattern-based options */
    });
  },

  // ... leverage Temporal's superior API
};
```

### 4. Auto-Detection & Fallbacks

```typescript
function getDefaultAdapter(): DateAdapter {
  // Try Temporal first (future-proof)
  if (typeof Temporal !== "undefined") {
    return createTemporalAdapter();
  }

  // Try date-fns if available
  try {
    const dateFns = require("date-fns");
    return createDateFnsAdapter(dateFns);
  } catch {}

  // Fall back to native
  return nativeAdapter;
}
```

## Benefits

### 1. **Zero Breaking Changes**

Existing useTemporal code continues to work unchanged:

```typescript
// This keeps working exactly as before
const pickle = usePickle();
const days = pickle.divide(month, "day");
```

### 2. **Bundle Size Flexibility**

```typescript
// Minimal bundle (+3KB)
import { nativeAdapter } from "@usetemporal/native-adapter";
const pickle = usePickle({ adapter: nativeAdapter });

// Full-featured (+60KB)
import { dateFnsAdapter } from "@usetemporal/date-fns-adapter";
const pickle = usePickle({ adapter: dateFnsAdapter });
```

### 3. **Future-Proof**

```typescript
// Ready for Temporal API (when it lands)
import { temporalAdapter } from "@usetemporal/temporal-adapter";
const pickle = usePickle({ adapter: temporalAdapter });
```

### 4. **Ecosystem Integration**

```typescript
// Works with existing Luxon codebases
import { luxonAdapter } from "@usetemporal/luxon-adapter";
const pickle = usePickle({ adapter: luxonAdapter });
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)

- [ ] Define `DateAdapter` interface
- [ ] Modify `usePickle` to accept adapter parameter
- [ ] Create adapter integration points in existing composables
- [ ] Implement native adapter with basic functionality
- [ ] Update internal code to use adapter pattern

### Phase 2: Official Adapters (Week 3-4)

- [ ] Create `@usetemporal/date-fns-adapter` package
- [ ] Create `@usetemporal/temporal-adapter` package
- [ ] Create `@usetemporal/luxon-adapter` package
- [ ] Implement auto-detection fallback system
- [ ] Update TypeScript definitions

### Phase 3: Testing & Documentation (Week 5-6)

- [ ] Comprehensive test suite for each adapter
- [ ] Performance benchmarks comparing adapters
- [ ] Migration guide from current API
- [ ] Adapter development guide for community
- [ ] Update all examples to showcase adapter flexibility

### Phase 4: Community & Polish (Week 7-8)

- [ ] Community feedback integration
- [ ] Performance optimizations
- [ ] Edge case handling
- [ ] Stability improvements
- [ ] Release preparation

## Migration Strategy

### For Existing Users

```typescript
// Before (still works)
const pickle = usePickle();

// After (explicit, same behavior)
import { dateFnsAdapter } from "@usetemporal/date-fns-adapter";
const pickle = usePickle({ adapter: dateFnsAdapter });
```

### For New Users

```typescript
// Start simple
const pickle = usePickle(); // Uses best available adapter

// Grow into complexity as needed
import { dateFnsAdapter } from "@usetemporal/date-fns-adapter";
const pickle = usePickle({ adapter: dateFnsAdapter });
```

## Considerations & Risks

### Technical Risks

1. **Adapter Inconsistencies**: Different libraries handle edge cases differently
2. **Performance Variations**: Some adapters may be slower than others
3. **Feature Gaps**: Native adapter won't support all date-fns features initially

### Mitigation Strategies

1. **Comprehensive Test Suite**: Test all adapters against same test cases
2. **Performance Benchmarks**: Document performance characteristics
3. **Feature Documentation**: Clear feature matrix for each adapter
4. **Gradual Rollout**: Start with basic operations, expand over time

### Ecosystem Impact

- **Positive**: Broader adoption, future-proof architecture
- **Neutral**: Existing users unaffected
- **Minimal Risk**: No breaking changes in core API

## Success Metrics

### Adoption Metrics

- Number of downloads for different adapter packages
- Community feedback and issue reports
- Migration success rate for existing users

### Technical Metrics

- Bundle size reductions achieved
- Performance comparisons across adapters
- Test coverage across all adapters

### Ecosystem Health

- Community contributions to new adapters
- Integration with other Vue ecosystem libraries
- Long-term maintenance sustainability

## Conclusion

The date adapter plugin system represents a strategic evolution of useTemporal that:

1. **Preserves** the revolutionary `divide()` pattern that makes useTemporal special
2. **Eliminates** adoption barriers related to bundle size and library preferences
3. **Future-proofs** the library for the coming Temporal API
4. **Expands** the potential user base across different JavaScript ecosystems

This change positions useTemporal to become the standard time handling interface for JavaScript applications, regardless of underlying date library preference.

---

**Next Steps:**

1. Community review and feedback on this RFC
2. Technical review of the proposed interfaces
3. Proof of concept implementation
4. Formal implementation planning
