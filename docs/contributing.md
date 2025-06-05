# Contributing to useTemporal

Thank you for your interest in contributing to **useTemporal**! This guide will help you get started with contributing to this revolutionary Vue 3 time composables library.

## 🎯 Getting Started

### Prerequisites

- **Node.js 18+** - For development environment
- **Vue 3.3+** - Peer dependency knowledge
- **TypeScript** - Familiarity with TypeScript development
- **Git** - Version control basics

### Development Setup

1. **Fork & Clone**

   ```bash
   git clone https://github.com/your-username/usetemporal.git
   cd usetemporal
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development**

   ```bash
   # Run tests
   npm run test

   # Start docs development
   npm run docs:dev

   # Build library
   npm run build

   # Type checking
   npm run type-check
   ```

## 🏗️ Project Structure

```
useTemporal/
├── src/
│   ├── composables/     # Core composables
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Main entry point
├── test/
│   ├── composables/    # Composable tests
│   ├── components/     # Component tests
│   └── setup.ts        # Test configuration
├── docs/               # VitePress documentation
└── examples/           # Usage examples
```

## 🎨 Code Style

### TypeScript Guidelines

- **Strict TypeScript** - All code must pass strict type checking
- **Interface-first** - Define interfaces before implementations
- **Generic types** - Use generics for reusable components
- **JSDoc comments** - Document public APIs

```typescript
/**
 * Revolutionary time unit interface
 */
interface TimeUnit {
  raw: ComputedRef<Date>;
  timespan: ComputedRef<TimeSpan>;
  isNow: ComputedRef<boolean>;
  // ... more properties
}
```

### Vue Composition API

- **Composition API only** - No Options API
- **Reactive refs** - Use `ref()` and `computed()`
- **Consistent naming** - Follow Vue composables conventions

```typescript
// ✅ Good
export function useTimeUnit(options: UseTimeUnitOptions): TimeUnit {
  const browsing = ref(options.date)
  const isNow = computed(() => /* logic */)

  return { browsing, isNow, /* ... */ }
}

// ❌ Avoid
export function timeUnit(date: Date) {
  // Options API or non-reactive approach
}
```

### Naming Conventions

- **Composables**: `useTimeUnit`, `usePickle`
- **Types**: `TimeUnit`, `PickleCore`
- **Files**: `kebab-case.ts`
- **Functions**: `camelCase`

## 🧪 Testing

### Test Requirements

- **100% new code coverage** - All new features must be tested
- **Integration tests** - Test composable interactions
- **Type tests** - Verify TypeScript interfaces

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";
import { usePickle, useYear } from "../src";

describe("useYear", () => {
  it("should provide consistent TimeUnit interface", () => {
    const pickle = usePickle({ date: new Date() });
    const year = useYear(pickle);

    // Test interface compliance
    expect(year.raw).toBeDefined();
    expect(year.isNow).toBeDefined();
    expect(typeof year.future).toBe("function");
  });
});
```

## 📝 Documentation

### Writing Documentation

- **VitePress markdown** - Use standard markdown with Vue components
- **Code examples** - Include working examples
- **TypeScript first** - Show TypeScript usage
- **Real-world scenarios** - Practical use cases

### Documentation Structure

```markdown
# Composable Name

Brief description of what it does.

## Usage

\`\`\`vue

<script setup lang="ts">
import { useComposable } from 'usetemporal'

const result = useComposable(options)
</script>

\`\`\`

## API Reference

### Parameters

### Return Value

### Examples
```

## 🔄 Pull Request Process

### Before Submitting

1. **Run all checks**

   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

2. **Update documentation** if needed
3. **Add tests** for new features
4. **Update changelog** for significant changes

### PR Guidelines

- **Clear title** - Describe what the PR does
- **Description** - Explain the motivation and approach
- **Breaking changes** - Mark any breaking changes clearly
- **Tests** - Include test results
- **Documentation** - Update docs if needed

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or clearly marked)
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Reproduction steps** with minimal example
- **Expected vs actual behavior**
- **Environment details** (Vue version, Node version, etc.)
- **Code examples** that demonstrate the issue

### Feature Requests

For new features:

- **Use case description** - Why is this needed?
- **Proposed API** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Breaking change impact** - Will this affect existing code?

## 🏆 Recognition

Contributors are recognized in:

- **README contributors section**
- **Changelog acknowledgments**
- **Documentation credits**
- **Release notes mentions**

## 📋 Types of Contributions

### 🔧 Code Contributions

- **New composables** - Additional time units or utilities
- **Bug fixes** - Resolve existing issues
- **Performance improvements** - Optimization work
- **TypeScript enhancements** - Better type safety

### 📚 Documentation

- **Guide improvements** - Better explanations
- **Example additions** - More use cases
- **API documentation** - Complete reference docs
- **Translation** - i18n documentation

### 🧪 Testing

- **Test coverage** - Increase test coverage
- **Integration tests** - Real-world usage scenarios
- **Performance tests** - Benchmark comparisons
- **Edge case tests** - Boundary condition testing

### 🎨 Design

- **Documentation design** - Better visual documentation
- **Example interfaces** - Beautiful demo components
- **Logo/branding** - Visual identity improvements

## 🤝 Community Guidelines

- **Be respectful** - Treat everyone with respect
- **Be patient** - Remember we're all learning
- **Be constructive** - Provide helpful feedback
- **Be collaborative** - Work together towards common goals

## 📞 Getting Help

- **Discussions** - GitHub Discussions for questions
- **Issues** - GitHub Issues for bugs and features
- **Discord** - Real-time chat with the community
- **Twitter** - Follow @usetemporal for updates

## 🎉 First Contribution?

New to open source? Here are some good first issues:

- **Documentation fixes** - Typos, clarity improvements
- **Test additions** - Increase test coverage
- **Example enhancements** - Better code examples
- **TypeScript improvements** - Better type definitions

Look for issues labeled `good first issue` or `help wanted`.

---

Thank you for contributing to **useTemporal**! Together we're building the future of time manipulation in Vue applications. 🚀

## 📄 License

By contributing to useTemporal, you agree that your contributions will be licensed under the [MIT License](https://opensource.org/licenses/MIT).
