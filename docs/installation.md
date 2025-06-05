# Installation

Get useTemporal installed and running in your Vue 3 project.

## System Requirements

- **Vue 3.3+** (Composition API)
- **Node.js 16+**
- **TypeScript 4.5+** (recommended)

## Package Manager Installation

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

## CDN Installation

For quick prototyping or non-bundled environments:

```html
<!-- Via unpkg -->
<script src="https://unpkg.com/usetemporal@latest/dist/usetemporal.umd.js"></script>

<!-- Via jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/usetemporal@latest/dist/usetemporal.umd.js"></script>
```

## Verification

Test your installation with this simple snippet:

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

console.log("Current month:", month.name);
console.log("Installation successful! 🎉");
</script>

<template>
  <div>
    <h1>{{ month.name }}</h1>
    <p>useTemporal is working!</p>
  </div>
</template>
```

## TypeScript Setup

For the best experience, add type support to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*", "node_modules/usetemporal/dist/*.d.ts"]
}
```

## Build Tool Configuration

### Vite

No configuration needed! useTemporal works out of the box with Vite.

### Webpack

Add to your webpack config if you encounter issues:

```javascript
module.exports = {
  resolve: {
    alias: {
      usetemporal: path.resolve(
        __dirname,
        "node_modules/usetemporal/dist/index.js"
      ),
    },
  },
};
```

### Nuxt 3

useTemporal works seamlessly with Nuxt 3:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    // ... other modules
  ],
  css: [
    // Add any useTemporal-specific styles if needed
  ],
});
```

## Framework Integration

### Vue 3 + Vite

The recommended setup for modern Vue development:

```bash
npm create vue@latest my-app
cd my-app
npm install
npm install usetemporal
```

### Vue 3 + Nuxt

For server-side rendering and full-stack applications:

```bash
npx nuxi@latest init my-app
cd my-app
npm install usetemporal
```

## Bundle Size

useTemporal is designed to be lightweight:

- **Core bundle**: ~8KB gzipped
- **Tree-shakeable**: Import only what you use
- **Zero dependencies**: No external dependencies

```javascript
// Import only what you need
import { usePickle, useMonth } from "usetemporal";

// Not the entire library
import * as useTemporal from "usetemporal"; // ❌ Avoid this
```

## Development vs Production

### Development

- Full error messages and warnings
- Development-friendly debugging
- Source maps included

### Production

- Minified and optimized
- Dead code elimination
- Gzip compression friendly

## Common Issues

### Module Resolution Errors

If you see import errors, ensure your bundler can resolve ES modules:

```json
// package.json
{
  "type": "module"
}
```

### TypeScript Errors

Make sure you have the latest TypeScript version:

```bash
npm install -D typescript@latest
```

### Vue Version Compatibility

useTemporal requires Vue 3.3+ for proper Composition API support:

```bash
npm install vue@^3.3.0
```

## Next Steps

✅ **Installation complete!**

Continue with:

- **[Getting Started](/getting-started)** - Build your first component
- **[Examples](/examples/)** - See it in action
- **[API Reference](/composables/use-pickle)** - Explore the full API

## Need Help?

- 📖 [Documentation](/)
- 💬 [Discord Community](https://discord.gg/usetemporal)
- 🐛 [GitHub Issues](https://github.com/your-username/usetemporal/issues)
- 📧 [Email Support](mailto:support@usetemporal.dev)
