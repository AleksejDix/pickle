# Date Adapters

useTemporal supports multiple date libraries through a simple adapter pattern.

## Available Adapters

### Native JavaScript Date (Default)

Zero dependencies, works everywhere:

```typescript
import { createTemporal } from 'usetemporal'

const temporal = createTemporal()
// Native adapter is included by default
```

### Using date-fns

For advanced date operations:

```bash
npm install @usetemporal/core @usetemporal/adapter-date-fns date-fns
```

```typescript
import { createTemporal } from '@usetemporal/core'
import { createDateFnsAdapter } from '@usetemporal/adapter-date-fns'
import { enUS } from 'date-fns/locale'

const temporal = createTemporal({
  adapter: createDateFnsAdapter({ 
    locale: enUS,
    weekStartsOn: 1
  })
})
```

### Using Luxon

For timezone support:

```bash
npm install @usetemporal/core @usetemporal/adapter-luxon luxon
```

```typescript
import { createTemporal } from '@usetemporal/core'
import { createLuxonAdapter } from '@usetemporal/adapter-luxon'

const temporal = createTemporal({
  adapter: createLuxonAdapter({
    zone: 'America/New_York',
    locale: 'en-US'
  })
})
```

### Using Temporal API

Future-proof with the upcoming Temporal API:

```bash
npm install @usetemporal/core @usetemporal/adapter-temporal
```

```typescript
import { createTemporal } from '@usetemporal/core'
import { createTemporalAdapter } from '@usetemporal/adapter-temporal'

const temporal = createTemporal({
  adapter: createTemporalAdapter()
})
```

## Choosing an Adapter

| Adapter | Bundle Size | Features | Use When |
|---------|------------|----------|----------|
| Native | 0KB | Basic date operations | You want minimal bundle size |
| date-fns | ~20KB | Extensive date utilities | You need advanced formatting/parsing |
| Luxon | ~70KB | Timezone support, i18n | You need timezone handling |
| Temporal | ~40KB | Modern API, immutable | You want future-proof code |

## Creating Custom Adapters

Implement the minimal adapter interface:

```typescript
interface Adapter {
  startOf(date: Date, unit: Unit): Date
  endOf(date: Date, unit: Unit): Date
  add(date: Date, value: number, unit: Unit): Date
  diff(start: Date, end: Date, unit: Unit): number
}
```

Example custom adapter:

```typescript
const myAdapter = {
  startOf(date, unit) {
    // Your implementation
  },
  endOf(date, unit) {
    // Your implementation
  },
  add(date, value, unit) {
    // Your implementation
  },
  diff(start, end, unit) {
    // Your implementation
  }
}

const temporal = createTemporal({ adapter: myAdapter })
```

## Next Steps

- Learn about [TypeScript Support](/guide/typescript)
- See [Performance](/guide/performance) comparisons
- Check [Migration Guide](/guide/migration) for switching adapters