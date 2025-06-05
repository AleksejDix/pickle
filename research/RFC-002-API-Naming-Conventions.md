# RFC 002: API Naming Conventions

- **Start Date:** 2024-12-21
- **Author:** useTemporal Team
- **Status:** Draft
- **Type:** Breaking Change
- **Related:** RFC-001 (Date Adapter Plugin System)

## Summary

Propose a comprehensive API naming strategy that aligns with Vue ecosystem conventions, improves clarity, and positions useTemporal as a professional time handling library.

## Motivation

### Current Naming Issues

1. **`usePickle()` is Confusing**

   - New users don't understand what "pickle" means in time context
   - Doesn't align with library name "useTemporal"
   - Sounds informal for professional applications

2. **Inconsistent with Vue Ecosystem**

   - Vue uses `createApp()`, Vue Router uses `createRouter()`
   - Our factory function should follow `create*` pattern

3. **Branding Misalignment**
   - Library: "useTemporal"
   - Main function: "usePickle" ← Disconnect

## Proposed Changes

### 1. Main Factory Function

```typescript
// Current
const pickle = usePickle(options);

// Proposed
const temporal = createTemporal(options);
```

**Rationale:**

- Aligns with Vue ecosystem (`createApp`, `createRouter`)
- Matches library branding
- More descriptive and professional
- Follows factory function convention

### 2. Time Unit Composables

**Option A: Keep Current (Recommended)**

```typescript
// Keep these - they're Vue composable patterns
const year = useYear(temporal);
const month = useMonth(temporal);
const day = useDay(temporal);
const hour = useHour(temporal);
```

**Option B: Rename for Consistency**

```typescript
// Alternative - more verbose but consistent
const year = createYear(temporal);
const month = createMonth(temporal);
const day = createDay(temporal);
const hour = createHour(temporal);
```

**Recommendation:** Keep `use*` for time units since they're true Vue composables.

### 3. Core Properties & Methods

```typescript
// Current naming (keep these)
temporal.picked.value    // ✅ Clear
temporal.now.value       // ✅ Clear
temporal.divide()        // ✅ Revolutionary and clear

// Consider renaming these internal properties
temporal.browsing  →  temporal.current   // More intuitive
temporal.raw       →  temporal.date      // More explicit
```

### 4. Core Method Naming: divide() vs split()

**Current:**

```typescript
temporal.divide(year, "month"); // → 12 months
temporal.divide(month, "day"); // → 28-31 days
temporal.divide(day, "hour"); // → 24 hours
```

**Alternative:**

```typescript
temporal.split(year, "month"); // → 12 months
temporal.split(month, "day"); // → 28-31 days
temporal.split(day, "hour"); // → 24 hours
```

#### Analysis: divide() vs split()

**Arguments for split():**

- More familiar to developers (string.split(), array operations)
- Shorter and more casual
- Common in UI contexts (split view, split screen)
- Intuitive for "breaking apart" time periods

**Arguments for divide() (Recommended):**

- Mathematically precise - we're dividing time into equal units
- Less overloaded term (split has many meanings in programming)
- More professional/formal tone matching library positioning
- Conceptually accurate - division creates equal parts
- Already established in current API

**Recommendation:** Keep `divide()` - it's more precise and professional for the mathematical operation being performed.

## Complete API Example

### Before (Current)

```typescript
import { usePickle, useYear, useMonth } from "usetemporal";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
});

const year = useYear(pickle);
const months = pickle.divide(year, "month");

console.log(year.name.value); // "2024"
console.log(pickle.picked.value); // Current date
```

### After (Proposed)

```typescript
import { createTemporal, useYear, useMonth } from "usetemporal";

const temporal = createTemporal({
  date: new Date(),
  now: new Date(),
});

const year = useYear(temporal);
const months = temporal.divide(year, "month");

console.log(year.name.value); // "2024"
console.log(temporal.current.value); // Current date (renamed from picked)
```

## Migration Strategy

### 1. Gradual Deprecation (Recommended)

```typescript
// Phase 1: Support both names
export function usePickle(options) {
  console.warn("usePickle() is deprecated. Use createTemporal() instead.");
  return createTemporal(options);
}

export function createTemporal(options) {
  // New implementation
}

// Phase 2: Remove deprecated functions after 2-3 major versions
```

### 2. Automatic Migration Tool

```bash
# CLI tool to help users migrate
npx usetemporal-migrate
# Automatically updates:
# - usePickle → createTemporal
# - pickle → temporal (variable names)
# - Updates import statements
```

### 3. Documentation Strategy

```typescript
// Update all examples to new naming
// Provide migration guide
// Update TypeScript definitions
// Add migration warnings
```

## Alternative Naming Schemes

### Option 1: "Time" Prefix (Conservative)

```typescript
createTime(); // vs createTemporal()
useTimeYear(); // vs useYear()
useTimeMonth(); // vs useMonth()
```

**Verdict:** Too verbose, "temporal" is more precise.

### Option 2: "Chrono" Theme (Creative)

```typescript
createChrono(); // vs createTemporal()
useChronoYear(); // vs useYear()
```

**Verdict:** Less familiar, harder to remember.

### Option 3: Pure Descriptive (Explicit)

```typescript
createTimeManager(); // vs createTemporal()
createTimeNavigator(); // vs createTemporal()
```

**Verdict:** Too long, less elegant.

## Impact Analysis

### Breaking Changes

- `usePickle()` → `createTemporal()`
- Potentially `pickle.picked` → `temporal.current`

### Non-Breaking

- All `use*` composables stay the same
- All core methods (`divide()`, etc.) stay the same
- All time unit properties stay the same

### Benefits

1. **Professional Perception**: More serious library
2. **Vue Ecosystem Integration**: Following established patterns
3. **Improved Discovery**: Clearer naming aids adoption
4. **Better Documentation**: Easier to explain and teach

### Risks

1. **Migration Friction**: Existing users need to update
2. **Community Confusion**: Temporary period with mixed naming
3. **Documentation Debt**: Need to update all examples

## Recommendations

### Phase 1: Primary Function Rename ✅

```typescript
usePickle() → createTemporal()
```

**Impact:** Medium breaking change, high value return

### Phase 2: Property Consistency (Optional) 🤔

```typescript
temporal.picked → temporal.current
temporal.browsing → temporal.current
```

**Impact:** Low breaking change, modest value

### Phase 3: Keep Composables As-Is ✅

```typescript
useYear(), useMonth(), useDay(); // Keep these
```

**Impact:** No breaking change, maintains Vue patterns

## Implementation Plan

### Week 1: Core Rename

- [ ] Implement `createTemporal()` function
- [ ] Add deprecation warning to `usePickle()`
- [ ] Update TypeScript definitions
- [ ] Update internal usage

### Week 2: Documentation

- [ ] Update all examples to use `createTemporal()`
- [ ] Create migration guide
- [ ] Update README and getting started docs
- [ ] Add migration warnings to old examples

### Week 3: Tooling

- [ ] Create migration CLI tool
- [ ] Add ESLint rule for deprecated usage
- [ ] Update IDE snippets and autocomplete

### Week 4: Community

- [ ] Announce changes with migration timeline
- [ ] Gather community feedback
- [ ] Address concerns and edge cases

## Success Metrics

### Adoption Metrics

- Percentage of users migrating to new naming
- Community feedback sentiment
- New user onboarding improvement

### Technical Metrics

- Documentation clarity improvements
- Reduction in naming-related confusion issues
- Time to first successful implementation for new users

## Conclusion

Renaming `usePickle()` to `createTemporal()` represents a strategic move toward:

1. **Professional Positioning**: More serious, enterprise-ready perception
2. **Vue Ecosystem Integration**: Following established patterns
3. **Improved Developer Experience**: Clearer, more intuitive naming
4. **Long-term Sustainability**: Better foundation for growth

The benefits significantly outweigh the migration costs, especially if handled with proper deprecation warnings and tooling support.

---

**Recommendation: Implement Phase 1 (usePickle → createTemporal) alongside RFC-001 (Date Adapter System) as part of a major version release.**
