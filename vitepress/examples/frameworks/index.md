# Framework Integration Examples

Complete examples showing how to integrate useTemporal with popular JavaScript frameworks.

## Available Integrations

### [Vue Integration](/examples/frameworks/vue-integration)
Comprehensive Vue 3 examples including:
- Basic setup and configuration
- Composable patterns
- Calendar component
- Date picker
- Time range selector
- Reactive time display

### [React Integration](/examples/frameworks/react-integration)
Full React examples featuring:
- Context setup and providers
- Custom hooks
- Calendar component
- Date picker
- Time slots component
- Live clock
- Year overview

## Key Concepts

### Provider Pattern
All frameworks benefit from a centralized temporal instance:

```typescript
// Vue
provide('temporal', temporal)

// React
<TemporalContext.Provider value={temporal}>
```

### Reactive Integration
Each framework has its own way to handle reactivity:

```typescript
// Vue - automatic reactivity
const month = usePeriod(temporal, 'month')

// React - manual subscription
const [period, setPeriod] = useState(month.value)
useEffect(() => {
  const unsubscribe = month.effect(() => setPeriod(month.value))
  return unsubscribe
}, [])
```

### Component Patterns
- **Controlled Components**: Date pickers with v-model/value+onChange
- **Composable Logic**: Reusable time logic in hooks/composables
- **Performance**: Memoization and optimization techniques

## Framework Comparison

| Feature | Vue | React | Angular | Svelte |
|---------|-----|-------|---------|--------|
| Reactivity | Automatic | Manual | RxJS | Stores |
| Setup | Minimal | Context | Service | Store |
| Bundle Size | Small | Small | Medium | Tiny |
| Type Safety | Excellent | Excellent | Excellent | Good |

## Coming Soon

- **Angular Integration**: Services and observables
- **Svelte Integration**: Stores and reactive statements
- **Solid Integration**: Signals and effects

## Best Practices

1. **Single Source of Truth**: One temporal instance per time context
2. **Framework Idioms**: Follow each framework's conventions
3. **Type Safety**: Use TypeScript for better DX
4. **Performance**: Leverage framework-specific optimizations

## See Also

- [Framework Integration Guide](/guide/integrations/overview)
- [Getting Started](/guide/getting-started)
- [Core Concepts](/guide/core-concepts)