# Epic 004: Calendar Units Package - Brownfield Enhancement

## Epic Goal

Create a separate @usetemporal/calendar-units package that provides calendar-specific time units (stableMonth, stableYear) to support fixed-layout calendar displays without polluting the core library with display concerns.

## Epic Description

### Existing System Context

- Current relevant functionality: Core library provides fundamental time operations through divide(), next(), previous(), etc.
- Technology stack: TypeScript, ESM modules, Vitest testing, monorepo structure
- Integration points: Uses core's unit registry system to define custom units

### Enhancement Details

- What's being added/changed: New package with calendar-specific units that always produce fixed-size grids
- How it integrates: Leverages core's defineUnit() and custom unit registry system
- Success criteria: Calendar developers can create stable layouts without layout shifts between months/years

## Stories

1. **Story 004.01: Package Setup and Core Integration** - Create package structure, establish core dependency, implement unit registry integration
2. **Story 004.02: Implement StableMonth Unit** - Create stableMonth unit that always returns 6 weeks (42 days) with proper week alignment
3. **Story 004.03: Documentation and Examples** - Create comprehensive docs showing calendar grid generation, migration from workarounds
4. **Story 004.04: Remove StableMonth from Core** - Clean up core types and constants by removing unimplemented stableMonth references
5. **Story 004.05: Update VitePress Documentation** - Update all documentation to reflect stableMonth moving to calendar-units package

## Compatibility Requirements

- [x] Existing APIs remain unchanged
- [x] Database schema changes are backward compatible (N/A)
- [x] UI changes follow existing patterns (N/A - new package)
- [x] Performance impact is minimal

## Risk Mitigation

- **Primary Risk:** Users might expect these units in core and be confused
- **Mitigation:** Clear documentation about separation of concerns, prominent package discovery
- **Rollback Plan:** Package is additive - can be deprecated without affecting core

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Existing functionality verified through testing
- [ ] Integration points working correctly
- [ ] Documentation updated appropriately
- [ ] No regression in existing features

## Architecture Decision Reference

See `/docs/architecture/decision-calendar-units-separation.md` for the rationale behind creating this as a separate package rather than adding to core.

## Technical Notes

The package will follow the existing monorepo patterns:
- Located at `/packages/calendar-units/`
- Published as `@usetemporal/calendar-units`
- Peer dependency on `@usetemporal/core`
- Full TypeScript support with proper type exports

Calendar units will use the unit registry's defineUnit() API:
```typescript
defineUnit('stableMonth', {
  duration: { days: 42 }, // Always 6 weeks
  validate: (adapter, date) => true,
  // Custom divide logic for stable grid
});
```