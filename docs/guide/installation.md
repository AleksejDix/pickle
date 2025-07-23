# Installation

## Package Options

useTemporal is available as both a meta-package and individual packages for maximum flexibility.

### Option 1: Meta Package (Recommended)

The easiest way to get started is with the meta package that includes core + native adapter:

::: code-group

```bash [npm]
npm install usetemporal
```

```bash [yarn]
yarn add usetemporal
```

```bash [pnpm]
pnpm add usetemporal
```

:::

This gives you:
- ✅ Core functionality (`@usetemporal/core`)
- ✅ Native adapter (`@usetemporal/adapter-native`)
- ✅ Zero external dependencies
- ✅ Full TypeScript support

### Option 2: Individual Packages

For more control over your dependencies:

::: code-group

```bash [npm]
# Core (required)
npm install @usetemporal/core

# Choose your adapter(s)
npm install @usetemporal/adapter-native      # Zero deps
npm install @usetemporal/adapter-date-fns    # Requires date-fns
npm install @usetemporal/adapter-luxon       # Requires luxon
npm install @usetemporal/adapter-temporal    # For Temporal API
```

```bash [yarn]
# Core (required)
yarn add @usetemporal/core

# Choose your adapter(s)
yarn add @usetemporal/adapter-native
yarn add @usetemporal/adapter-date-fns
yarn add @usetemporal/adapter-luxon
yarn add @usetemporal/adapter-temporal
```

:::

## Adapter Dependencies

Each adapter has different dependency requirements:

| Adapter | External Dependencies | Bundle Size |
|---------|---------------------|-------------|
| `@usetemporal/adapter-native` | None | ~2KB |
| `@usetemporal/adapter-date-fns` | date-fns | ~4KB + date-fns |
| `@usetemporal/adapter-luxon` | luxon | ~3KB + luxon |
| `@usetemporal/adapter-temporal` | @js-temporal/polyfill | ~3KB + polyfill |

## Module Formats

All packages are distributed as:
- **ESM** (ES Modules) - Primary format
- **TypeScript** definitions included
- **Source maps** for debugging

## Requirements

- **Node.js**: 16.0.0 or higher
- **Browsers**: All modern browsers supporting:
  - ES2020 features
  - Proxy API
  - Intl.DateTimeFormat

## CDN Usage

For quick prototyping, you can use a CDN:

```html
<script type="module">
  import { createTemporal, nativeAdapter } from 'https://unpkg.com/usetemporal/dist/index.js'
  
  const temporal = createTemporal({ 
    dateAdapter: nativeAdapter 
  })
</script>
```

## TypeScript Configuration

useTemporal is written in TypeScript and includes all type definitions. No additional @types packages needed!

For best experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## Verify Installation

After installation, verify everything works:

```typescript
import { createTemporal, nativeAdapter } from 'usetemporal'

const temporal = createTemporal({ 
  dateAdapter: nativeAdapter 
})

console.log('Current date:', temporal.now.value)
console.log('useTemporal installed successfully! 🎉')
```

## Next Steps

- [Getting Started](/guide/getting-started) - Basic usage guide
- [Date Adapters](/guide/date-adapters) - Choose your adapter
- [Examples](/examples/basic-usage) - See it in action