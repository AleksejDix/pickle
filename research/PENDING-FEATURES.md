# Pending Features

## Overview

This document tracks features that are approved but not yet implemented, based on the API Decision Matrix scoring.

## 📋 High Priority Features (Score > 60/70)

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

### Phase 1: Type Constants (1 day)

- Simple constants object
- TypeScript const assertion
- Update all examples

### Phase 2: Utility Functions (2 days)

- Implement goto, select, today
- Consider additional utilities based on usage
- Comprehensive test coverage

### Phase 3: Standalone Divide (2 days)

- Extract divide logic
- Create convenience wrappers
- Update documentation

## Notes

All pending features:

- Follow Vue.js philosophy (small, focused functions)
- Are tree-shakable
- Are non-breaking additions
- Have high scores (>60/70) in the decision matrix
