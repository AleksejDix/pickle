# User Story: Configurable Week Start Day

## Story

**As a** developer building international applications  
**I want** to configure which day starts the week  
**So that** calendars display correctly for different locales and preferences

## Current Problem

```typescript
// Currently, weeks always start on Sunday (US convention)
const week = periods.week(temporal);
const days = temporal.divide(week, "day");
// First day is always Sunday, last day is always Saturday

// But many countries/cultures start weeks on Monday:
// - Most of Europe
// - ISO 8601 standard
// - Many business applications
```

## Proposed Solution

```typescript
// Configure week start when creating temporal
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
});

// Now weeks respect the configuration
const week = periods.week(temporal);
const days = temporal.divide(week, "day");
// If weekStartsOn: 1, first day is Monday, last day is Sunday

// Also affects stableMonth (future feature)
const stableMonth = periods.stableMonth(temporal);
// Grid starts on configured day of week
```

## Implementation Details

```typescript
// Add to CreateTemporalOptions
export interface CreateTemporalOptions {
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  dateAdapter?: DateAdapter;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // New option
}

// Default to 0 (Sunday) for backward compatibility
const weekStartsOn = options.weekStartsOn ?? 0;

// Pass to adapter methods that need it
adapter.startOf(date, "week", { weekStartsOn });
adapter.endOf(date, "week", { weekStartsOn });
```

## Common Configurations

```typescript
// United States, Canada, Japan
const usaTemporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 0, // Sunday
});

// Europe, ISO 8601
const europeTemporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

// Middle East (some countries)
const middleEastTemporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 6, // Saturday
});
```

## Benefits

1. **International Support**
   - Respects local conventions
   - ISO 8601 compliance possible
   - Better for global apps

2. **Flexibility**
   - User preference support
   - Business week configurations
   - Cultural sensitivity

3. **Foundation for Future Features**
   - StableMonth will use this
   - Any week-based calculations respect the setting

## Acceptance Criteria

- [x] Add weekStartsOn to CreateTemporalOptions interface
- [x] Default to 1 (Monday) as international standard
- [x] Update adapter.startOf/endOf to accept weekStartsOn option
- [x] Week period respects the configuration
- [x] All adapters support the feature
- [x] Tests cover different week start days
- [x] Documentation explains the option

## Status: ✅ COMPLETED

This feature has been implemented with the following changes:

- Default changed to Monday (1) as it's the international standard
- All adapters (native, date-fns, luxon, temporal) now support weekStartsOn
- Comprehensive tests added for all week start days (0-6)
- Documentation updated to show the new API

## Example: Calendar with Monday Start

```typescript
// European calendar starting on Monday
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

const week = periods.week(temporal);
const days = temporal.divide(week, "day");

// days[0] = Monday
// days[1] = Tuesday
// ...
// days[6] = Sunday
```

## Technical Notes

- Affects week calculations across the library
- Must be consistent throughout a temporal instance
- Adapters need to implement week start logic
- No breaking changes - defaults to current behavior
