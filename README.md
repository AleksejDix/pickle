# useTemporal

**Revolutionary time library with the unique `divide()` pattern**

```typescript
// Divide any time unit into smaller units
const months = temporal.divide(year, "month");
const days = temporal.divide(month, "day");
const hours = temporal.divide(day, "hour");
```

## 🚀 Features

- **🧩 Revolutionary divide() Pattern**: Infinitely subdivide time units with perfect synchronization
- **🌍 Framework Agnostic**: Works with Vue, React, Angular, Svelte, and vanilla JavaScript
- **⚡ Zero Dependencies**: Native adapter provides full functionality without external libraries
- **🔄 Reactive by Design**: Built on `@vue/reactivity` for automatic updates
- **🎯 TypeScript First**: Full type safety and excellent IDE support
- **📦 Tree Shakeable**: Import only what you need

## 📦 Installation

```bash
npm install usetemporal
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { createTemporal, useYear, useMonth } from 'usetemporal';

const temporal = createTemporal({
  date: new Date(),
  locale: 'en-US'
});

const year = useYear(temporal);
const months = temporal.divide(year, 'month');
```

### Vue Example

```vue
<script setup>
import { createTemporal, useYear, useMonth } from 'usetemporal';

const temporal = createTemporal();
const year = useYear(temporal);
const months = temporal.divide(year, 'month');
</script>

<template>
  <div>
    <h2>{{ year.name.value }}</h2>
    <div v-for="month in months" :key="month.key.value">
      {{ month.name.value }}
    </div>
  </div>
</template>
```

### React Example

```jsx
import { createTemporal, useYear } from 'usetemporal';
import { useEffect, useState } from 'react';

function Calendar() {
  const [temporal] = useState(() => createTemporal());
  const [year, setYear] = useState(null);
  
  useEffect(() => {
    const yearUnit = useYear(temporal);
    setYear(yearUnit);
  }, [temporal]);

  return <div>{year?.name.value}</div>;
}
```

## 🔬 Core Concepts

### The divide() Pattern

The revolutionary `divide()` method allows you to break down any time unit into its constituent parts:

```typescript
const year = useYear(temporal);
const months = temporal.divide(year, 'month');  // 12 months
const weeks = temporal.divide(months[0], 'week'); // ~4 weeks
const days = temporal.divide(weeks[0], 'day');    // 7 days
```

### Reactive Updates

All time units stay synchronized automatically:

```typescript
// Change the date
temporal.picked.value = new Date(2024, 11, 25);

// All units update automatically
console.log(year.name.value);  // "2024"
console.log(month.name.value); // "December 2024"
```

## 🔌 Date Adapters

UseTemporal supports multiple date libraries through adapters:

```typescript
// Native JavaScript Date (default, zero dependencies)
const temporal = createTemporal({ dateAdapter: 'native' });

// date-fns (requires date-fns installation)
const temporal = createTemporal({ dateAdapter: 'date-fns' });

// Luxon (requires luxon installation)
const temporal = createTemporal({ dateAdapter: 'luxon' });
```

## 📚 Examples

Check out the `examples/` directory for complete examples:

```bash
# Run the Vue example
npm run example:vue
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.