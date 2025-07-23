# RFC-009: Relative Time Utilities

**Status: NOT FOR CORE - Should be a separate package or userland**

## Summary

Human-friendly relative time descriptions like "Today", "Tomorrow", "Next week" are too opinionated and locale-specific for core.

## Motivation

Applications often need to show relative time:

```typescript
// Current manual implementation
const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
if (diffDays === 0) return "Today";
if (diffDays === 1) return "Tomorrow";
if (diffDays === -1) return "Yesterday";
// ... complex logic for weeks, months
```

## Detailed Design

### API

```typescript
interface RelativeTime {
  // Simple descriptions
  simple(): string; // "Today", "Tomorrow", "Next Monday"

  // Relative from now
  fromNow(): string; // "in 2 days", "3 hours ago"

  // Calendar style
  calendar(): string; // "Today at 2:30 PM", "Tomorrow", "Monday at 3:00 PM"

  // Distance
  distance(): string; // "2 days", "3 weeks", "1 year"
}

// Add to TimeUnit
interface TimeUnit {
  // ... existing
  relative: RelativeTime;
}

// Usage
day.relative.simple(); // "Tomorrow"
hour.relative.fromNow(); // "in 3 hours"
week.relative.calendar(); // "Next week"
```

### Customization

```typescript
// Configure relative time options
temporal.configureRelative({
  locale: "en-US",
  formats: {
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    thisWeek: "This {{weekday}}",
    nextWeek: "Next {{weekday}}",
    lastWeek: "Last {{weekday}}",
  },
});
```

## Implementation

```typescript
class RelativeTimeImpl implements RelativeTime {
  constructor(
    private unit: TimeUnit,
    private temporal: Temporal
  ) {}

  simple(): string {
    const diff =
      this.unit.raw.value.getTime() - this.temporal.now.value.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";

    if (days > 1 && days <= 7) {
      return `Next ${this.unit.raw.value.toLocaleDateString("en-US", { weekday: "long" })}`;
    }

    // ... more logic
  }

  fromNow(): string {
    // Implementation using Intl.RelativeTimeFormat
  }
}
```

## Benefits

- Consistent relative time across apps
- Locale-aware formatting
- Reduces boilerplate
- Familiar API (similar to moment.js)

## Drawbacks

- Locale complexity
- Opinionated about formats
- May need frequent updates for "now"

## Alternatives

1. Use Intl.RelativeTimeFormat directly
2. Separate relative time library
3. Keep in userland

## Migration Path

This would be a separate optional package or left to userland.

## Decision

**This feature is too opinionated for the core library.** Relative time formatting:

- Is highly locale-dependent
- Requires translation strings
- Has many formatting preferences
- Should use browser's `Intl.RelativeTimeFormat` API

Users should implement this themselves or use a dedicated i18n library.
