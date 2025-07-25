# Troubleshooting Guide

This guide helps you resolve common issues when working with useTemporal. Each section includes symptoms, causes, and solutions.

## Installation Issues

### Module Resolution Errors

**Symptom:**

```
Cannot find module '@usetemporal/core' or its corresponding type declarations.
```

**Cause:** Package not installed or incorrect import path.

**Solution:**

```bash
# Ensure packages are installed
npm install @usetemporal/core @usetemporal/adapter-native

# For TypeScript projects
npm install -D @types/node
```

**Verify installation:**

```javascript
// Correct import
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// NOT this (common mistake)
import { createTemporal } from "usetemporal"; // Wrong!
```

### ESM/CommonJS Conflicts

**Symptom:**

```
SyntaxError: Cannot use import statement outside a module
```

**Cause:** useTemporal is ESM-only, but your project is using CommonJS.

**Solution:**

1. **Update package.json:**

```json
{
  "type": "module"
}
```

2. **Or use dynamic imports:**

```javascript
// For CommonJS environments
async function setupTemporal() {
  const { createTemporal } = await import("@usetemporal/core");
  const { nativeAdapter } = await import("@usetemporal/adapter-native");

  return createTemporal({ dateAdapter: nativeAdapter });
}
```

3. **For Vite/webpack projects, configure build tool:**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ["@usetemporal/core", "@vue/reactivity"],
  },
};
```

## Runtime Errors

### Missing Date Adapter

**Symptom:**

```
Error: A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages.
```

**Cause:** No date adapter provided to createTemporal.

**Solution:**

```javascript
// ❌ Wrong
const temporal = createTemporal(); // No adapter!

// ✅ Correct
import { nativeAdapter } from "@usetemporal/adapter-native";
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
});
```

### Invalid Date Errors

**Symptom:**

```
TypeError: Cannot read properties of undefined (reading 'getFullYear')
Invalid Date
```

**Cause:** Passing invalid date to temporal.

**Solution:**

```javascript
// Check dates before using
function safePeriod(temporal, date) {
  if (!date || isNaN(date.getTime())) {
    console.warn("Invalid date provided:", date);
    date = new Date(); // Fallback to current date
  }

  return temporal.periods.day(temporal, { date });
}

// Validate user input
const userDate = new Date(userInput);
if (isNaN(userDate.getTime())) {
  throw new Error("Invalid date format");
}
```

### Timezone Offset Issues

**Symptom:**

```
Day shows as previous/next day
Hour is off by timezone offset
```

**Cause:** JavaScript Date uses local timezone.

**Solution:**

```javascript
// Be explicit about timezone handling
const date = new Date("2024-03-14T00:00:00.000Z"); // UTC
const localDate = new Date(2024, 2, 14); // Local timezone

// Use adapter that handles timezones
import { luxonAdapter } from "@usetemporal/adapter-luxon";
const temporal = createTemporal({
  dateAdapter: luxonAdapter,
  timeZone: "America/New_York", // Future feature
});
```

## Reactivity Issues

### Changes Not Updating

**Symptom:**

- UI doesn't update when navigating dates
- Reactive properties seem frozen

**Cause:** Not using reactive references correctly.

**Solution:**

```javascript
// ❌ Wrong - breaks reactivity
let month = temporal.periods.month(temporal);
month = month.future(); // Creates new object, loses reactivity

// ✅ Correct - maintain reactivity
import { ref } from "@vue/reactivity";

const currentDate = ref(new Date());
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  date: currentDate, // Pass reactive ref
});

// Update the ref to trigger reactivity
currentDate.value = new Date(2024, 3, 1);
```

### Memory Leaks with Watchers

**Symptom:**

- Memory usage increases over time
- Performance degrades

**Cause:** Not cleaning up watchers.

**Solution:**

```javascript
// Vue 3
import { watch, onUnmounted } from "vue";

const stopWatcher = watch(
  () => month.number,
  (newMonth) => {
    console.log("Month changed:", newMonth);
  }
);

// Clean up
onUnmounted(() => {
  stopWatcher();
});

// React
import { useEffect } from "react";

useEffect(() => {
  const unwatch = watch(
    () => month.number,
    (newMonth) => {
      console.log("Month changed:", newMonth);
    }
  );

  return () => unwatch();
}, []);
```

## Divide Pattern Issues

### Unexpected Number of Units

**Symptom:**

```javascript
const days = temporal.divide(month, "day");
console.log(days.length); // Expected 31, got 35
```

**Cause:** Month period might include partial weeks.

**Solution:**

```javascript
// For calendar displays, use stableMonth
const stableMonth = temporal.periods.stableMonth(temporal);
const days = temporal.divide(stableMonth, "day");
console.log(days.length); // Always 42

// For exact month days
const month = temporal.periods.month(temporal);
const monthDays = temporal
  .divide(month, "day")
  .filter((day) => day.month === month.number);
```

### Performance Issues with Large Divides

**Symptom:**

- Browser freezes
- "Maximum call stack exceeded"

**Cause:** Dividing large time periods into small units.

**Solution:**

```javascript
// ❌ Avoid
const year = temporal.periods.year(temporal);
const minutes = temporal.divide(year, "minute"); // 525,600 objects!

// ✅ Better approach
function* generateMinutes(year) {
  const months = temporal.divide(year, "month");
  for (const month of months) {
    const days = temporal.divide(month, "day");
    for (const day of days) {
      const hours = temporal.divide(day, "hour");
      for (const hour of hours) {
        const minutes = temporal.divide(hour, "minute");
        yield* minutes;
      }
    }
  }
}

// Use generator for large datasets
for (const minute of generateMinutes(year)) {
  if (shouldProcess(minute)) {
    processMinute(minute);
  }
}
```

## Browser Compatibility

### Proxy Not Supported

**Symptom:**

```
TypeError: Proxy is not defined
```

**Cause:** Old browser without Proxy support.

**Solution:**

```javascript
// Check browser support
if (typeof Proxy === "undefined") {
  console.error("Your browser does not support Proxy. Please upgrade.");
  // Load polyfill or show upgrade message
}

// Or use feature detection
const isProxySupported = typeof Proxy !== "undefined";
if (!isProxySupported) {
  // Fallback to non-reactive date handling
}
```

### Intl API Issues

**Symptom:**

- Month/day names showing as numbers
- Incorrect locale formatting

**Cause:** Limited Intl support in browser.

**Solution:**

```javascript
// Check Intl support
const intlSupported = typeof Intl !== "undefined" && Intl.DateTimeFormat;

// Provide fallbacks
const monthNames = intlSupported
  ? undefined
  : ["January", "February" /* ... */];

// Use polyfill if needed
import "@formatjs/intl-datetimeformat/polyfill";
```

## Configuration Issues

### Week Start Day Not Working

**Symptom:**

- Weeks still start on wrong day
- Calendar layout incorrect

**Cause:** Configuration not applied to adapter.

**Solution:**

```javascript
// Ensure configuration is passed to adapter
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

// Verify in divide operations
const week = temporal.periods.week(temporal);
const days = temporal.divide(week, "day");
console.log(days[0].dayOfWeek); // Should be 1 (Monday)
```

### Locale Not Applying

**Symptom:**

- Month names in English despite locale setting
- Date formats not localized

**Cause:** Adapter doesn't support locale or incorrect configuration.

**Solution:**

```javascript
// Use adapter that supports locales
import { luxonAdapter } from "@usetemporal/adapter-luxon";

const temporal = createTemporal({
  dateAdapter: luxonAdapter,
  locale: "fr-FR", // French
});

// Or format manually
const formatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
});
const monthName = formatter.format(month.start);
```

## Common Mistakes

### 1. Mutating Date Objects

**Problem:**

```javascript
const date = temporal.now;
date.setMonth(date.getMonth() + 1); // Mutates!
```

**Solution:**

```javascript
// Create new dates
const nextMonth = new Date(date);
nextMonth.setMonth(date.getMonth() + 1);

// Or use temporal navigation
const currentMonth = temporal.periods.month(temporal);
const nextMonth = currentMonth.future();
```

### 2. Comparing Time Units Incorrectly

**Problem:**

```javascript
const day1 = temporal.periods.day(temporal);
const day2 = temporal.periods.day(temporal);
console.log(day1 === day2); // false!
```

**Solution:**

```javascript
// Compare by value
const isSameDay = day1.start.getTime() === day2.start.getTime();

// Or use adapter comparison
const isSame = adapter.isSame(day1.start, day2.start, "day");
```

### 3. Assuming Month Numbers

**Problem:**

```javascript
// Expecting JavaScript's 0-indexed months
if (month.number === 0) {
  // Never true!
  console.log("January");
}
```

**Solution:**

```javascript
// useTemporal uses 1-12 for months
if (month.number === 1) {
  console.log("January");
}
```

## Debugging Tips

### 1. Enable Verbose Logging

```javascript
// Debug temporal instance
function debugTemporal(temporal) {
  console.log("Current date:", temporal.now);
  console.log("Configuration:", {
    adapter: temporal.adapter?.name,
    weekStartsOn: temporal.weekStartsOn,
  });
}

// Debug time unit
function debugTimeUnit(unit) {
  console.log("Time Unit Debug:", {
    type: unit._type,
    start: unit.start,
    end: unit.end,
    isNow: unit.isNow,
    number: unit.number,
  });
}
```

### 2. Validate Divide Results

```javascript
function validateDivide(parent, children, expectedCount) {
  console.assert(
    children.length === expectedCount,
    `Expected ${expectedCount} units, got ${children.length}`
  );

  // Check continuity
  for (let i = 1; i < children.length; i++) {
    const prevEnd = children[i - 1].end.getTime();
    const currentStart = children[i].start.getTime();

    console.assert(
      Math.abs(prevEnd - currentStart) < 1000,
      `Gap between units at index ${i}`
    );
  }
}
```

### 3. Use Browser DevTools

```javascript
// Add temporal to window for debugging
if (process.env.NODE_ENV === "development") {
  window.__temporal = temporal;
  window.__debugTimeUnit = (unit) => {
    console.table({
      start: unit.start.toISOString(),
      end: unit.end.toISOString(),
      isNow: unit.isNow,
      isPast: unit.isPast,
      isFuture: unit.isFuture,
    });
  };
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the Examples**: Review the [examples](/examples/basic-usage) for working code
2. **API Reference**: Consult the [API documentation](/api/create-temporal)
3. **GitHub Issues**: Search or create an issue on [GitHub](https://github.com/yourusername/usetemporal)
4. **Community**: Join our Discord/Slack for community support

When reporting issues, please include:

- useTemporal version
- Date adapter being used
- Browser/Node version
- Minimal reproduction code
- Error messages and stack traces

Remember: Most issues are related to timezone handling, incorrect imports, or misunderstanding the 1-indexed months. Check these first!
