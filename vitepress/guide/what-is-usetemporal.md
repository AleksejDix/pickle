# What is useTemporal?

useTemporal is a revolutionary time manipulation library for JavaScript that introduces the unique **divide() pattern** - a hierarchical approach to time management that no other library offers.

## Core Philosophy

Traditional date libraries focus on parsing, formatting, and basic arithmetic. useTemporal takes a different approach by treating time as a **hierarchical, divisible continuum**.

```typescript
// Traditional approach
const date = new Date();
const month = date.getMonth();
const year = date.getFullYear();

// useTemporal approach
const temporal = createTemporal({ 
  adapter: createNativeAdapter() 
});
const year = usePeriod(temporal, 'year');
const months = divide(temporal, year.value, 'month');
const days = divide(temporal, months[0], 'day');
```

## Key Features

### 1. **The divide() Pattern**

The revolutionary feature that sets useTemporal apart. Infinitely subdivide any time unit into smaller units with perfect synchronization.

### 2. **Framework Agnostic**

Works seamlessly with:

- Vue 3
- React
- Angular
- Svelte
- Vanilla JavaScript

### 3. **Pluggable Date Adapters**

Choose your preferred date manipulation library:

- **Native**: Zero dependencies, full functionality
- **date-fns**: Popular functional date library
- **Luxon**: Powerful internationalization
- **Temporal API**: Future-proof with TC39 proposal

### 4. **Reactive Time Units**

All time units are reactive by default, perfect for building dynamic UIs:

```typescript
const month = usePeriod(temporal, 'month');
// month.value.date, month.value.start, month.value.end are all reactive
```

### 5. **Zero Dependencies Mode**

The native adapter provides complete functionality without any external dependencies.

## Architecture

useTemporal follows a modular, monorepo architecture:

```
@usetemporal/core         # Core functionality
@usetemporal/adapter-native    # Zero-dependency adapter
@usetemporal/adapter-date-fns  # date-fns integration
@usetemporal/adapter-luxon     # Luxon integration
@usetemporal/adapter-temporal  # Temporal API integration
usetemporal              # Convenience meta-package
```

## When to Use useTemporal

useTemporal excels in applications that need:

- **Complex date navigation** (calendars, date pickers)
- **Hierarchical time visualization** (timeline views, Gantt charts)
- **Reactive time-based UIs**
- **Framework-agnostic date handling**

## Performance

- **Bundle size**: <6KB (core + native adapter)
- **Tree-shakeable**: Import only what you need
- **Lazy loading**: Adapters loaded on demand
- **Optimized**: Minimal re-computations with reactive caching

## Browser Support

Works in all modern browsers that support:

- ES2020 features
- Proxy API (for reactivity)
- Intl.DateTimeFormat (for i18n)
