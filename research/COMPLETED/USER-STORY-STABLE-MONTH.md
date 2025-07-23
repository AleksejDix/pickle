# User Story: StableMonth - 6-Week Calendar Grid

## Story

**As a** developer building calendar UIs  
**I want** a stableMonth unit that always represents 6 weeks  
**So that** I can easily create consistent calendar grids like Apple Calendar

## Current Problem

```typescript
// Building a calendar grid is complex
function buildCalendarGrid(month: TimeUnit) {
  const days = temporal.divide(month, "day"); // 28-31 days

  // Now I need to:
  // 1. Figure out what day of week the month starts
  // 2. Add padding days from previous month
  // 3. Add padding days from next month
  // 4. Ensure I have exactly 42 days (6 weeks)
  // ... lots of complex logic
}

// Can't divide months by weeks
temporal.divide(month, "week"); // Runtime error - doesn't make sense
```

## The Problem Explained

Calendar applications need two different concepts of "month":

1. **Calendar Month**: The logical month (Feb 1-29) for date calculations
2. **Display Month**: A 6-week grid (42 days) for consistent UI

Currently, developers have to manually calculate the padding days from previous/next months to create a stable grid.

## Proposed Solution

```typescript
import { periods } from "@usetemporal/core";

// Regular month - calendar boundaries
const month = periods.month(temporal);
const monthDays = temporal.divide(month, "day"); // 28-31 days

// Stable month - always 6 weeks for UI
const stableMonth = periods.stableMonth(temporal);
const gridDays = temporal.divide(stableMonth, "day"); // Always 42 days
const gridWeeks = temporal.divide(stableMonth, "week"); // Always 6 weeks

// Easy to differentiate current month days from padding days
gridDays.forEach((day) => {
  if (month.contains(day)) {
    // Current month day - full opacity
  } else {
    // Previous/next month day - reduced opacity
  }
});
```

## Implementation Details

```typescript
// StableMonth would:
// 1. Start at the beginning of the week containing the 1st of the month
// 2. End after exactly 6 weeks (42 days)
// 3. Have the same month number as the regular month
// 4. Respect the configured weekStartsOn setting

// Example for February 2024 (weekStartsOn: 0 - Sunday):
// - Regular month: Feb 1 (Thu) - Feb 29 (Thu)
// - Stable month: Jan 28 (Sun) - Mar 9 (Sat)

// Example for February 2024 (weekStartsOn: 1 - Monday):
// - Regular month: Feb 1 (Thu) - Feb 29 (Thu)
// - Stable month: Jan 29 (Mon) - Mar 10 (Sun)
```

## Benefits

1. **Simplifies Calendar UIs**
   - No manual padding calculation
   - Consistent 6-week grid
   - Works like Apple Calendar

2. **Clean API**
   - Just another time unit
   - Works with existing divide() function
   - Can be divided by weeks (makes sense!)

3. **Clear Mental Model**
   - `month` = for business logic
   - `stableMonth` = for UI display

## Acceptance Criteria

- [ ] Create stableMonth period using createPeriod factory
- [ ] Always returns 42 days when divided by day
- [ ] Always returns 6 weeks when divided by week
- [ ] Starts on the first day of the week (respects weekStartsOn)
- [ ] Has same month number as regular month
- [ ] Add contains() method to check if a day belongs to the actual month
- [ ] Tests verify the 6-week behavior
- [ ] Documentation explains the use case

## Example: Building a Calendar

```typescript
function CalendarMonth({ temporal }) {
  const stableMonth = periods.stableMonth(temporal)
  const month = periods.month(temporal)
  const weeks = temporal.divide(stableMonth, 'week')

  return (
    <div className="calendar-grid">
      {weeks.map(week => (
        <div className="week">
          {temporal.divide(week, 'day').map(day => (
            <div className={month.contains(day) ? 'current' : 'other'}>
              {day.number.value}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

## Technical Notes

- Depends on weekStartsOn configuration (see USER-STORY-WEEK-START.md)
- No breaking changes to existing APIs
- Solves a real problem every calendar developer faces

## Dependencies

This story depends on:

- Configurable Week Start Day (USER-STORY-WEEK-START.md) - must be implemented first
