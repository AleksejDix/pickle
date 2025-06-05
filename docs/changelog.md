# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-30

### 🎉 Initial Release

#### Added

- **Revolutionary `usePickle` composable** - Core time manipulation with `divide()` pattern
- **Hierarchical time unit composables** - `useYear`, `useMonth`, `useWeek`, `useDay`, `useHour`, `useMinute`
- **Complete TypeScript support** - Full type safety and IntelliSense
- **Comprehensive test suite** - 91% coverage with Vitest
- **Professional documentation** - VitePress-powered docs with examples
- **Modern build system** - Vite with optimized bundles

#### Core Features

- **The `divide()` Pattern** - Revolutionary fractal time subdivision
- **Consistent TimeUnit Interface** - Same API across all time scales
- **Reactive Time Navigation** - Automatic synchronization between units
- **Internationalization** - Built-in i18n with `Intl.DateTimeFormat`
- **Event Integration** - Calendar events and time-based data support
- **Zero Dependencies** - Only peer dependency on Vue 3 and date-fns

#### Examples & Components

- **Basic Date Picker** - Production-ready component
- **Multi-Scale Calendar** - Advanced year-to-minute navigation
- **Time Navigation** - Hierarchical time browsing
- **Custom Time Units** - Extensible time scale system

#### Developer Experience

- **Tree-shakable** - Import only what you need
- **SSR Compatible** - Works with Nuxt, VitePress, etc.
- **TypeScript First** - Built with TypeScript from the ground up
- **Vue 3 Optimized** - Composition API and reactive system integration

### 🔄 Migration from Pickle v0.x

If you're migrating from the original Pickle library:

1. **Package name change**: `pickle` → `usetemporal`
2. **Import changes**: `import { pickle }` → `import { usePickle }`
3. **TypeScript support**: Now included by default
4. **New composables**: Individual time unit composables available
5. **Enhanced API**: More consistent and predictable interface

### 🏗️ Architecture Notes

This release represents **5 years of evolution** from the original Pickle concept created in 2019-2020. The library was ahead of its time, anticipating Vue 3's Composition API patterns before they were finalized.

Key architectural innovations:

- **Data-first design** over UI-first approaches
- **Fractal time patterns** enabling infinite scalability
- **Mathematical precision** eliminating calendar edge cases
- **Composable architecture** for maximum flexibility

---

## 🔮 Coming Soon (v0.2.0)

### Planned Features

- **Additional Time Units** - useQuarter, useDecade, useCentury, useMillennium
- **Time Range Composables** - useTimeRange, useDateRange
- **Calendar Integration** - useCalendar with event management
- **Advanced Formatting** - Custom formatters and display options
- **Performance Optimizations** - Virtual scrolling for large time ranges
- **Plugin System** - Extensible architecture for custom time units

### Community Features

- **Vue DevTools Integration** - Inspect time state and navigation
- **Playground** - Interactive examples and experimentation
- **Templates** - Starter templates for common use cases
- **Ecosystem** - Integration guides for popular Vue libraries

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./contributing.md) for details.

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT).

---

**useTemporal** - Revolutionary Vue 3 Time Composables  
Born in 2019, Perfect in 2024 🚀
