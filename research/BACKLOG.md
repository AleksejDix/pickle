# Feature Backlog

## Completed ✅

1. **Navigation API** - `next()`, `previous()`, `go(n)` methods
2. **International Week Support** - `weekStartsOn` configuration
3. **StableMonth Unit** - 6-week calendar grid
4. **Universal Contains Method** - Check if dates/units fall within boundaries

## High Priority 🔴

1. **Unified Time Navigation** - [RFC-012](./RFC/012-unified-time-navigation.md)
   - Combines zoom navigation with period operations
   - Single mental model for all time manipulation
   - Includes: [RFC-011](./RFC/011-zoom-navigation.md) + [RFC-008](./RFC/008-time-ranges.md)
2. **Basic Utility Functions** - [RFC-002](./RFC/002-utility-functions.md)
   - Common checks: isWeekend, isToday, isPast, isFuture
   - Reduce repetitive date operations

## Medium Priority 🟡

1. **Type-Safe Unit Constants** - [RFC-003](./RFC/003-type-constants.md)
   - Export UNITS constant for type safety
   - Prevent typos in unit names
   - Better IDE support

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

1. **Advanced Comparison Utilities** - [RFC-010](./RFC/010-comparison-utils.md)
   - `isBetween()`, `diff()`, `closest()`
   - Complex date comparisons

## Not for Core (Separate Packages or Userland)

1. **Calendar Grid Generation** - [RFC-001](./RFC/001-calendar-grid.md)
   - Too opinionated for core
   - Should be `@usetemporal/calendar` package

2. **Relative Time Utilities** - [RFC-009](./RFC/009-relative-time.md)
   - Locale-dependent formatting
   - Should use `Intl.RelativeTimeFormat`
   - Better in userland or i18n library

## Notes

- All features are non-breaking additions
- Focus on reducing boilerplate and improving DX
- Maintain tree-shakable architecture
- Date formatting remains in userland
- UI-specific utilities belong in separate packages
