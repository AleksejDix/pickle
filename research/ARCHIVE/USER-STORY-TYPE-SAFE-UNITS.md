# User Story: Type-Safe Unit Constants

## Story

**As a** developer using useTemporal  
**I want** type-safe constants for time units  
**So that** I get better autocomplete and avoid typos when using string literals

## Current Problem

```typescript
// Current - prone to typos and no autocomplete
temporal.divide(year, "month"); // What if I type 'months' by mistake?
temporal.divide(month, "day"); // No IntelliSense help

// Easy to make mistakes
temporal.divide(year, "mnth"); // Runtime error - typo
temporal.divide(year, "Month"); // Runtime error - case sensitive
```

## Proposed Solution

```typescript
// Import type-safe constants
import { units } from "@usetemporal/core";

// Use with full IntelliSense support
temporal.divide(year, units.month); // Autocomplete shows all options
temporal.divide(month, units.day); // Type-safe, no typos possible

// TypeScript catches errors at compile time
temporal.divide(year, units.mnth); // TS Error: Property 'mnth' does not exist
temporal.divide(year, "month"); // Still works for backward compatibility
```

## Implementation Details

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

// Type for the units
export type UnitConstant = (typeof units)[keyof typeof units];
```

## Benefits

1. **Better Developer Experience**
   - IntelliSense autocomplete when typing `units.`
   - No more typos in unit names
   - Self-documenting code

2. **Zero Runtime Overhead**
   - Just string constants
   - Tree-shakable if not used
   - No performance impact

3. **Backward Compatible**
   - String literals still work
   - Optional enhancement
   - No breaking changes

## Acceptance Criteria

- [ ] Units constant object is created and exported
- [ ] All current time unit types are included
- [ ] TypeScript provides autocomplete for units
- [ ] String literals still work (backward compatible)
- [ ] Tests verify both constant and string usage
- [ ] Documentation updated with examples

## Example Usage

```typescript
import { createTemporal, periods, units } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

const temporal = createTemporal({ dateAdapter: nativeAdapter });
const year = periods.year(temporal);

// Both approaches work
const months1 = temporal.divide(year, "month"); // String literal
const months2 = temporal.divide(year, units.month); // Type constant

// Better for dynamic usage
const timeUnit = someCondition ? units.day : units.hour;
const divisions = temporal.divide(period, timeUnit);
```

## Size

This is a small, focused change that:

- Adds one constants file
- Updates one export
- Requires minimal testing
- Can be completed in one session
