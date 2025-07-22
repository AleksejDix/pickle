# CRITICAL BUG: Composables Using date-fns Instead of Adapters

## Issue

All composables (useYear, useMonth, useWeek, useDay, useHour) are directly importing and using date-fns functions instead of using the adapter pattern. This completely breaks the library's core architecture.

## Impact

1. **Breaks "Zero Dependencies" Promise**: The library cannot work without date-fns, despite claiming to be zero-dependency with the native adapter
2. **Adapter Pattern Violated**: Users cannot use different date libraries (luxon, temporal-api) because composables hardcode date-fns
3. **Architecture Inconsistency**: The divide() function passes an adapter to composables, but they ignore it and use date-fns

## Current Implementation (WRONG)

```typescript
// useMonth.ts
import { startOfMonth, endOfMonth, add, sub } from "date-fns";

const start = computed(() => startOfMonth(browsing.value));
const end = computed(() => endOfMonth(browsing.value));

const future = () => {
  browsing.value = add(browsing.value, { months: 1 });
};
```

## Correct Implementation (Using Adapter)

```typescript
// useMonth.ts - NO date-fns import!

const adapter = options.adapter;
if (!adapter) {
  throw new Error("Adapter is required for useMonth composable");
}

const start = computed(() => adapter.startOf(browsing.value, "month"));
const end = computed(() => adapter.endOf(browsing.value, "month"));

const future = () => {
  browsing.value = adapter.add(browsing.value, { months: 1 });
};
```

## Files That Need Fixing

- src/composables/useYear.ts
- src/composables/useMonth.ts
- src/composables/useWeek.ts
- src/composables/useDay.ts
- src/composables/useHour.ts

## Why This Happened

The composables were likely written before the adapter pattern was fully implemented, and were never updated to use it.

## Fix Priority

**CRITICAL** - This bug makes the entire adapter system useless and forces all users to install date-fns.