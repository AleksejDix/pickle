# Feature Backlog

## Completed ✅

1. **Navigation API** - `next()`, `previous()`, `go(n)` methods
2. **International Week Support** - `weekStartsOn` configuration
3. **StableMonth Unit** - 6-week calendar grid
4. **Universal Contains Method** - Check if dates/units fall within boundaries

## High Priority 🔴

1. **Calendar Grid Generation** - [RFC-001](./RFC/001-calendar-grid.md)
   - Eliminate complex calendar logic
   - Reduce boilerplate by ~40%

2. **Basic Utility Functions** - [RFC-002](./RFC/002-utility-functions.md)
   - Common checks: isWeekend, isToday, isPast, isFuture
   - Reduce repetitive date operations

## Medium Priority 🟡

1. **Type-Safe Unit Constants** - [RFC-003](./RFC/003-type-constants.md)
   - Prevent runtime errors from typos
   - Better TypeScript support

2. **Simplified StableMonth API** - [RFC-004](./RFC/004-stable-month-api.md)
   - `temporal.stableMonth(month)` shorthand
   - `month.toStableMonth()` method

3. **Direct Property Access** - [RFC-005](./RFC/005-direct-properties.md)
   - `day.weekday` instead of `day.raw.value.getDay()`
   - Convenience properties for common operations

4. **Navigation Utilities** - [RFC-006](./RFC/006-navigation-utils.md)
   - `goto()`, `select()`, `today()` functions
   - Simplify common navigation patterns

5. **Standalone Divide Function** - [RFC-007](./RFC/007-standalone-divide.md)
   - Tree-shakable divide functionality
   - Convenience wrappers like `months()`, `days()`

## Low Priority 🟢

1. **Time Range Support** - [RFC-008](./RFC/008-time-ranges.md)
   - First-class range objects
   - Range operations (contains, overlaps, merge)

2. **Relative Time Utilities** - [RFC-009](./RFC/009-relative-time.md)
   - "Today", "Tomorrow", "Next week" descriptions
   - Human-friendly time differences

3. **Advanced Comparison Utilities** - [RFC-010](./RFC/010-comparison-utils.md)
   - `isBetween()`, `diff()`, `closest()`
   - Complex date comparisons

## Notes

- All features are non-breaking additions
- Focus on reducing boilerplate and improving DX
- Maintain tree-shakable architecture
- Date formatting remains in userland