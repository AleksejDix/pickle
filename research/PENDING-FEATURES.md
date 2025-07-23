# Pending Features

## Overview

This document tracks features that are approved but not yet implemented, based on the API Decision Matrix scoring and usage analysis.

## 📋 High Priority Features (Based on Usage Analysis)

### NEW: Formatted Output Properties

**Problem**: Developers repeatedly format dates manually
```typescript
month.raw.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
```

**Solution**: Add formatted properties
```typescript
month.formatted.long  // "January 2024"
day.formatted.short   // "Mon, Jan 15"
```

### NEW: Calendar Grid Generation

**Problem**: Complex calendar grid logic repeated everywhere
```typescript
// 10+ lines of code to generate calendar grid
```

**Solution**: Built-in utility
```typescript
const grid = temporal.createCalendarGrid(month)
// Returns weeks with days, all metadata included
```

## 📋 Previously Approved Features (Score > 60/70)

### 1. Type-Safe Unit Constants (Score: 65/70)

**Problem**: String literals for time units are error-prone

```typescript
// Current - typos possible
temporal.divide(year, "mnth"); // Runtime error
```

**Solution**: Export type-safe constants

```typescript
// Proposed
export const units = {
  year: "year",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  millisecond: "millisecond",
} as const;

// Usage
temporal.divide(year, units.month); // Type-safe
```

**Implementation**:

- Add to `packages/core/src/constants/units.ts`
- Export from main index
- Update documentation

### 2. Utility Functions (Score: 64/70)

**Problem**: Common operations require verbose code

```typescript
// Current
temporal.browsing.value = new Date("2024-01-15");
temporal.picked.value = someDate;
temporal.browsing.value = temporal.now.value;
```

**Solution**: Simple utility functions

```typescript
// Proposed
import { goto, select, today } from "@usetemporal/core/utils";

goto(temporal, "2024-01-15"); // Navigate to date
select(temporal, someDate); // Select a date
today(temporal); // Go to today
```

**Implementation**:

- Create `packages/core/src/utils/temporal.ts`
- Functions should be tree-shakable
- Add comprehensive tests

### 3. Standalone Divide Function (Score: 63/70)

**Problem**: `temporal.divide` always included even if unused

```typescript
// Current - divide is part of temporal object
const months = temporal.divide(year, "month");
```

**Solution**: Tree-shakable function

```typescript
// Proposed
import { divide } from "@usetemporal/core/divide";

const months = divide(year, "month");

// Convenience functions
import { months, days, hours } from "@usetemporal/core/divide";
const monthsInYear = months(year);
const daysInMonth = days(month);
```

**Implementation**:

- Create `packages/core/src/divide/index.ts`
- Keep `temporal.divide` for backward compatibility
- Add convenience wrappers for common divisions

## Implementation Plan

### Phase 1: Formatted Output Properties (2 days)
- Add formatted computed property to all time units
- Support multiple format options (long, short, numeric, etc.)
- Locale support through options

### Phase 2: Calendar Grid Generation (2 days)
- Create createCalendarGrid utility
- Include all metadata (isWeekend, isToday, isCurrentMonth)
- Support for stableMonth integration

### Phase 3: Type Constants (1 day)
- Simple constants object
- TypeScript const assertion
- Update all examples

### Phase 4: Utility Functions (2 days)
- Basic utilities (isWeekend, isToday, etc.)
- Navigation helpers (goto, select, today)
- Comprehensive test coverage

### Phase 5: Standalone Divide (2 days)
- Extract divide logic
- Create convenience wrappers
- Update documentation

## Notes

Based on real usage analysis from examples:
- Formatted properties and calendar grid are the highest impact improvements
- These features would reduce component code by 50-70%
- All features are non-breaking additions
- Focus on developer experience and reducing boilerplate
