# Unit Plugin System

The useTemporal unit plugin system allows you to define custom time units beyond the standard year, month, day, etc. This is based on the insight that units are simply "branded types" - Period objects with a type tag.

## Quick Start

```typescript
import { defineUnit, createTemporal, usePeriod } from "@usetemporal/core";

// Define a custom sprint unit (2-week periods)
defineUnit("sprint", {
  createPeriod(date, adapter) {
    const start = adapter.startOf(date, "week");
    const end = new Date(start);
    end.setDate(start.getDate() + 13); // 2 weeks
    return { start, end };
  },
  divisions: ["week", "day"],
});

// Use it like any other unit!
const temporal = createTemporal({ adapter });
const sprint = usePeriod(temporal, "sprint");
```

## Core Concepts

### Units as Branded Types

In useTemporal, a unit is just a Period object with a type string:

```typescript
interface Period {
  start: Date;    // Start of period
  end: Date;      // End of period  
  type: string;   // The "brand" (e.g., "month", "sprint", "fiscal-quarter")
  date: Date;     // Reference date
}
```

This simple design means:
- Any string can be a unit type
- Operations work on any Period regardless of type
- Zero runtime overhead (no classes or complex objects)

### Unit Definition

A unit definition provides the logic for creating periods:

```typescript
interface UnitDefinition {
  // Create a period of this unit type from any date
  createPeriod(date: Date, adapter: Adapter): {
    start: Date;
    end: Date;
  };
  
  // Optional: What units this can divide into
  divisions?: string[];
  
  // Optional: What unit multiple of these merge into
  mergesTo?: string;
  
  // Optional: Validate a period conforms to this unit
  validate?(period: Period): boolean;
}
```

## Examples

### Business Units

```typescript
// Quarter (already included in core)
defineUnit("quarter", {
  createPeriod(date, adapter) {
    return {
      start: adapter.startOf(date, "quarter"),
      end: adapter.endOf(date, "quarter"),
    };
  },
  divisions: ["month", "week", "day"],
  mergesTo: "year",
});

// Fiscal Year (starts in July)
defineUnit("fiscal-year", {
  createPeriod(date, adapter) {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Fiscal year runs July 1 - June 30
    const fiscalYear = month >= 6 ? year : year - 1;
    
    return {
      start: new Date(fiscalYear, 6, 1), // July 1
      end: new Date(fiscalYear + 1, 5, 30, 23, 59, 59, 999), // June 30
    };
  },
  divisions: ["fiscal-quarter", "month", "week", "day"],
});
```

### Academic Units

```typescript
// Academic Semester
defineUnit("semester", {
  createPeriod(date, adapter) {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Fall: Aug 15 - Dec 20
    // Spring: Jan 10 - May 15
    // Summer: May 20 - Aug 10
    
    if (month >= 7 || month === 0) {
      // Fall semester
      return {
        start: new Date(year, 7, 15),
        end: new Date(year, 11, 20, 23, 59, 59, 999),
      };
    } else if (month >= 1 && month <= 4) {
      // Spring semester
      return {
        start: new Date(year, 0, 10),
        end: new Date(year, 4, 15, 23, 59, 59, 999),
      };
    } else {
      // Summer semester
      return {
        start: new Date(year, 4, 20),
        end: new Date(year, 7, 10, 23, 59, 59, 999),
      };
    }
  },
  divisions: ["month", "week", "day"],
  mergesTo: "academic-year",
});
```

### Custom Business Periods

```typescript
// Pay Period (bi-weekly, starting on specific date)
defineUnit("pay-period", {
  createPeriod(date, adapter) {
    // Company pay periods start from Jan 1, 2024
    const epoch = new Date(2024, 0, 1);
    const daysSinceEpoch = Math.floor(
      (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)
    );
    const periodNumber = Math.floor(daysSinceEpoch / 14);
    
    const start = new Date(epoch);
    start.setDate(start.getDate() + periodNumber * 14);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 13);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  },
  divisions: ["week", "day"],
});
```

## TypeScript Support

For full type safety, extend the UnitRegistry interface:

```typescript
// In a .d.ts file or at the top of your entry point
declare module "@usetemporal/core" {
  interface UnitRegistry {
    "sprint": true;
    "fiscal-year": true;
    "fiscal-quarter": true;
    "semester": true;
    "pay-period": true;
  }
}

// Now TypeScript provides autocomplete!
const sprint = usePeriod(temporal, "sprint"); // ✓ Type-safe!
```

## Operations with Custom Units

All standard operations work with custom units:

```typescript
const sprint = usePeriod(temporal, "sprint");

// Navigate
const nextSprint = next(temporal, sprint.value);
const prevSprint = previous(temporal, sprint.value);

// Divide
const days = divide(temporal, sprint.value, "day"); // 14 days

// Compare
const isSameSprint = isSame(temporal, sprint1, sprint2);

// Create custom periods
const customPeriod = {
  start: new Date("2024-01-01"),
  end: new Date("2024-03-31"),
  type: "q1-2024",
  date: new Date("2024-01-01"),
};
```

## Best Practices

1. **Keep it Simple**: Units are just period creators, not complex objects
2. **Use Meaningful Names**: Choose descriptive unit type names
3. **Document Boundaries**: Clearly document when periods start/end
4. **Test Edge Cases**: Test month/year boundaries, leap years, etc.
5. **Consider Time Zones**: Use adapter methods when possible

## Direct Period Creation

You don't always need to register a unit. For one-off custom periods:

```typescript
const customPeriod: Period = {
  start: new Date("2024-01-01"),
  end: new Date("2024-03-31"),
  type: "q1-2024", // Any string works!
  date: new Date("2024-01-01"),
};

// Operations still work!
const weeks = divide(temporal, customPeriod, "week");
```

## Bundle Size Impact

- Unit definitions are just functions (minimal size)
- Unused units are tree-shaken
- No runtime overhead for unused units
- Core can be kept minimal with units in separate packages

## Future: Unit Packages

Coming soon - pre-built unit packages:

```typescript
// Business units
import "@usetemporal/units-business";
// Adds: fiscal-year, fiscal-quarter, business-day

// Academic units  
import "@usetemporal/units-academic";
// Adds: semester, term, academic-year

// Just import and use!
const semester = usePeriod(temporal, "semester");
```