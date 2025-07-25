# Installation

This guide covers how to install useTemporal in your project.

## Quick Install

The fastest way to get started is to install the main package which includes the core library and native adapter:

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

```bash [bun]
bun add usetemporal
```

:::

## What's Included

The `usetemporal` package includes:
- `@usetemporal/core` - The core library with all functionality
- `@usetemporal/adapter-native` - Zero-dependency date adapter

## Modular Installation

If you need a different date adapter or want more control over bundle size:

### Core + Native Adapter (Recommended)

```bash
npm install @usetemporal/core @usetemporal/adapter-native
```

### Core + date-fns Adapter

```bash
npm install @usetemporal/core @usetemporal/adapter-date-fns date-fns
```

### Core + Luxon Adapter

```bash
npm install @usetemporal/core @usetemporal/adapter-luxon luxon
```

### Core + Temporal API Adapter

```bash
npm install @usetemporal/core @usetemporal/adapter-temporal
```

## Requirements

- **Node.js**: 16.0 or higher
- **ESM Support**: All packages are ESM-only
- **TypeScript**: 4.5+ (optional but recommended)

## Verify Installation

Create a simple test file to verify everything is working:

```typescript
import { createTemporal } from 'usetemporal'

const temporal = createTemporal()
console.log('useTemporal installed successfully!')
console.log('Current date:', temporal.now.value.date)
```

## Next Steps

- Continue to [First App](/guide/first-app) to build something
- Learn about [Core Concepts](/guide/core-concepts)
- Explore [Date Adapters](/guide/adapters)