# Basic Examples

Simple, focused examples to get you started with useTemporal.

## Available Examples

### [Basic Usage](/examples/basic-usage)
Core functionality demonstrations including:
- Creating a temporal instance
- Working with periods
- Basic navigation
- Simple date operations

### [Calendar](/examples/calendar)
Basic calendar implementation showing:
- Month view
- Day selection
- Navigation controls

## Quick Start

```typescript
import { createTemporal, usePeriod, divide } from 'usetemporal'

// Create instance
const temporal = createTemporal({ date: new Date() })

// Get current month
const month = usePeriod(temporal, 'month')

// Divide into days
const days = divide(temporal, month.value, 'day')

// Display
days.forEach(day => {
  console.log(day.date.getDate())
})
```

## Learning Path

1. Start with [Basic Usage](/examples/basic-usage) to understand fundamentals
2. Move to [Calendar](/examples/calendar) for a practical implementation
3. Explore [Calendar Grid](/examples/calendars/calendar-grid) for advanced layouts
4. Check [Framework Examples](/examples/frameworks/) for integration

## See Also

- [Getting Started Guide](/guide/getting-started)
- [Core Concepts](/guide/core-concepts)
- [API Reference](/api/)