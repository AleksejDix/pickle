# Calendar Examples

Complete calendar implementations using useTemporal's divide() pattern.

## Available Examples

### [Calendar Grid](/examples/calendars/calendar-grid)
Various calendar grid implementations including:
- Basic calendar grid with padding
- Vue calendar component
- React calendar component
- Mini calendar for date pickers
- Calendar with events
- Week headers and navigation

## Key Features Demonstrated

### Grid Layout
- Proper week alignment
- Month padding with previous/next days
- Responsive grid layouts
- Day highlighting (today, selected, weekend)

### Navigation
- Previous/Next month navigation
- Year and month selection
- Keyboard navigation support

### Customization
- Week start configuration (Sunday/Monday)
- Custom styling for different day types
- Event display and management
- Tooltip integration

## Common Patterns

### Basic Month Grid
```typescript
const month = usePeriod(temporal, 'month')
const days = divide(temporal, month.value, 'day')

// Add week padding
const firstDay = days[0]
const startPadding = (firstDay.date.getDay() + 6) % 7
const calendarGrid = [
  ...Array(startPadding).fill(null),
  ...days
]
```

### Day Classification
```typescript
const getDayType = (day) => ({
  isToday: isSame(temporal, day.date, new Date(), 'day'),
  isWeekend: [0, 6].includes(day.date.getDay()),
  isCurrentMonth: isSame(temporal, day.date, month.value.date, 'month')
})
```

## Integration Examples

- **Vue**: Full calendar component with reactive updates
- **React**: Calendar with hooks and state management
- **Vanilla JS**: Pure JavaScript implementation

## See Also

- [Stable Month Calendar](/examples/stable-month-calendar)
- [divide() Pattern Guide](/guide/divide-pattern)
- [Date Picker Examples](/examples/frameworks/vue-integration#date-picker-component)