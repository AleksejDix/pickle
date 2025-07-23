# User Story: Type-Safe Unit Constants with Hierarchy Validation

## Story

**As a** developer using useTemporal  
**I want** type-safe constants that respect time hierarchy  
**So that** I can only divide time units by smaller units and get compile-time validation

## Current Problem

```typescript
// Current - allows nonsensical divisions
temporal.divide(week, "month"); // Runtime error - can't divide week by month
temporal.divide(day, "year"); // Runtime error - can't divide day by year
temporal.divide(hour, "week"); // Runtime error - meaningless operation

// Also prone to typos
temporal.divide(year, "mnth"); // Runtime error - typo
temporal.divide(year, "Month"); // Runtime error - case sensitive
```

## Time Hierarchy Rules

Time units follow a natural hierarchy, but with important distinctions:

### Logical Time Hierarchy

```
year
  ├── quarter (exactly 3 calendar months)
  ├── month (calendar month: 28-31 days)
  └── week (exactly 7 days)
      └── day (exactly 24 hours)
          └── hour (exactly 60 minutes)
              └── minute (exactly 60 seconds)
                  └── second
```

### The Month Problem

**Calendar Month** (what we currently have):

- Variable length: 28-31 days
- Aligned with calendar boundaries
- February 2024 = Feb 1-29
- March 2024 = Mar 1-31

**Display Month** (what calendar UIs need):

- Fixed 6-week grid (42 days)
- Shows partial previous/next months
- February 2024 display = Jan 28 - Mar 9
- Consistent height in calendar views

### Valid Divisions

**Mathematically stable divisions:**

- year → quarter, week, day, hour, minute, second
- quarter → week, day, hour, minute, second
- week → day, hour, minute, second
- day → hour, minute, second
- hour → minute, second
- minute → second

**Calendar-aligned divisions (tricky):**

- year → month (12 months, but varying days)
- quarter → month (3 months, but varying days)
- month → day (28-31 days, depends on month)

**Invalid/Nonsensical divisions:**

- month → week (months don't contain whole weeks)
- week → month (weeks span month boundaries)
- day → month/year (smaller can't divide larger)

## Proposed Solution

### Option 1: Simple Constants (Minimal Change)

```typescript
// Import type-safe constants
import { units } from "@usetemporal/core";

// Use with full IntelliSense support
temporal.divide(year, units.month); // ✅ Valid
temporal.divide(month, units.day); // ✅ Valid
temporal.divide(week, units.month); // ❌ Still runtime error (not ideal)
```

### Option 2: Hierarchy-Aware Types (Better DX)

```typescript
// Import hierarchy-aware divide function
import { divide, units } from "@usetemporal/core";

// TypeScript prevents invalid divisions at compile time!
divide(year, units.month); // ✅ Valid - returns 12 months
divide(month, units.day); // ✅ Valid - returns 28-31 days
divide(week, units.day); // ✅ Valid - returns exactly 7 days
divide(month, units.week); // ❌ TS Error: Cannot divide 'month' by 'week'
divide(week, units.month); // ❌ TS Error: Cannot divide 'week' by 'month'
```

### Option 3: New StableMonth Unit (Cleanest Solution)

```typescript
// Introduce a new time unit for calendar displays
import { periods, units } from "@usetemporal/core";

// Regular month - calendar boundaries
const month = periods.month(temporal);
const days = temporal.divide(month, units.day); // 28-31 days

// Stable month - always 6 weeks for UI
const stableMonth = periods.stableMonth(temporal);
const displayDays = temporal.divide(stableMonth, units.day); // Always 42 days

// StableMonth automatically includes:
// - Some days from previous month (to start on Sunday)
// - All days from current month
// - Some days from next month (to complete 6 weeks)
```

## Implementation Details

### Option 1: Simple Constants (Quick Win)

```typescript
// packages/core/src/constants/units.ts
export const units = {
  year: "year",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  quarter: "quarter",
} as const;
```

### Option 2: Type-Safe Hierarchy (Recommended)

```typescript
// packages/core/src/types/hierarchy.ts
type ValidDivisions = {
  year: "quarter" | "month" | "day" | "hour" | "minute" | "second";
  quarter: "month" | "day" | "hour" | "minute" | "second";
  month: "day" | "hour" | "minute" | "second"; // No week!
  week: "day" | "hour" | "minute" | "second";
  day: "hour" | "minute" | "second";
  hour: "minute" | "second";
  minute: "second";
  second: never;
};
```

### Option 3: StableMonth Implementation (Recommended)

```typescript
// packages/core/src/composables/periods.ts
export const periods = {
  // ... existing periods
  month: createPeriod("month", (date) => date.getMonth() + 1),

  // New stable month for calendar UIs
  stableMonth: createPeriod(
    "stableMonth",
    (date, adapter) => {
      // Returns same number as regular month
      return date.getMonth() + 1;
    },
    {
      // Custom start: beginning of first week containing this month
      customStart: (date, adapter) => {
        const firstOfMonth = adapter.startOf(date, "month");
        return adapter.startOf(firstOfMonth, "week");
      },
      // Custom end: end of last week containing this month
      customEnd: (date, adapter) => {
        const lastOfMonth = adapter.endOf(date, "month");
        const endOfLastWeek = adapter.endOf(lastOfMonth, "week");
        // Ensure we have exactly 6 weeks (42 days)
        const start = adapter.startOf(adapter.startOf(date, "month"), "week");
        const weeksSoFar = Math.ceil(
          (endOfLastWeek.getTime() - start.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
        if (weeksSoFar < 6) {
          // Add more weeks to get to 6
          return adapter.add(endOfLastWeek, { weeks: 6 - weeksSoFar });
        }
        return endOfLastWeek;
      },
    }
  ),
};

// Type hierarchy includes stableMonth
type ValidDivisions = {
  // ... other units
  month: "day" | "hour" | "minute" | "second";
  stableMonth: "week" | "day" | "hour" | "minute" | "second"; // Can divide by week!
  // ... other units
};
```

## Benefits

### Option 1 Benefits:

1. **Simple Implementation** - Just constants, no complex types
2. **Backward Compatible** - No changes to existing APIs
3. **Better than strings** - At least prevents typos

### Option 2 Benefits:

1. **Compile-Time Safety** - Invalid divisions caught by TypeScript
2. **Self-Documenting** - IDE shows what divisions are valid
3. **Prevents Logic Errors** - Can't accidentally divide day by year
4. **Educational** - Teaches users about time hierarchy

## Real-World Impact

```typescript
// Current: Confusion and manual work
function buildCalendarGrid(month: TimeUnit) {
  const days = temporal.divide(month, "day"); // 28-31 days
  // Developer has to manually calculate padding days
  // Complex logic to get to 42 days for the grid
}

// With StableMonth: Crystal clear
function buildCalendarGrid(temporal: TemporalCore) {
  // Use stableMonth for UI - always 42 days, perfect grid
  const stableMonth = periods.stableMonth(temporal);
  const displayDays = temporal.divide(stableMonth, units.day); // Always 42 days

  // Can even divide by weeks!
  const weeks = temporal.divide(stableMonth, units.week); // Always 6 weeks

  // For business logic, use regular month
  const month = periods.month(temporal);
  const actualDays = temporal.divide(month, units.day); // 28-31 days

  // Easy to style different days
  displayDays.forEach((day) => {
    if (month.contains(day)) {
      // Current month day - full opacity
    } else {
      // Previous/next month day - reduced opacity
    }
  });
}
```

### Clean API Separation

```typescript
// Calendar display (what users see)
const ui = {
  month: periods.stableMonth(temporal), // 6-week grid
  days: temporal.divide(ui.month, units.day), // 42 days
  weeks: temporal.divide(ui.month, units.week), // 6 weeks
};

// Business logic (calculations)
const logic = {
  month: periods.month(temporal), // Calendar month
  days: temporal.divide(logic.month, units.day), // 28-31 days
  // weeks: temporal.divide(logic.month, units.week), // ❌ Error - correct!
};
```

## Acceptance Criteria

### For Option 1 (Simple Constants):

- [ ] Units constant object is created and exported
- [ ] All time unit types are included
- [ ] TypeScript provides autocomplete for units
- [ ] String literals still work (backward compatible)

### For Option 2 (Type-Safe Hierarchy):

- [ ] ValidDivisions type captures time hierarchy rules
- [ ] New divide() function enforces hierarchy at compile time
- [ ] Invalid divisions show clear TypeScript errors
- [ ] Runtime validation still exists as fallback
- [ ] Documentation explains the hierarchy

## Decision Needed

**Question**: Which option should we implement?

**Recommendation**: Implement Option 3 with `stableMonth` because:

1. **Clean Separation**: `month` vs `stableMonth` is crystal clear
2. **No API Complexity**: Just another time unit, works with existing APIs
3. **Solves Real Problem**: Every calendar app needs this 6-week grid
4. **Type Safe**: `stableMonth` can be divided by weeks, `month` cannot
5. **Intuitive**: Developers instantly understand the difference

The beauty of `stableMonth` as a separate unit:

- **month**: Calendar month (Feb 1-29) for date logic
- **stableMonth**: 6-week grid (Jan 28 - Mar 9) for UI display

This is much cleaner than having `divideForDisplay()` functions or other workarounds. It treats the display grid as what it really is - a different time unit with different properties.

## Technical Considerations

### Challenge: TimeUnit doesn't currently have a 'kind' property

```typescript
// Current TimeUnit interface has no way to know its type
interface TimeUnit {
  raw: ComputedRef<Date>;
  start: ComputedRef<Date>;
  // ... but no 'kind' or 'type' property
}
```

### Solution: Add kind property during creation

```typescript
// In createPeriod factory
return {
  ...existingProperties,
  kind: unitKind, // Add this to identify the unit type
};
```

This would be a non-breaking addition that enables type-safe divide.
