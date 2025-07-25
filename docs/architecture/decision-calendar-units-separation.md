# Architecture Decision: Calendar-Specific Units Separation

## Decision Date
2025-07-25

## Status
Decided

## Context

During story planning, the question arose about implementing `stableMonth` functionality - a calendar display unit that always shows 6 weeks (42 days) to prevent layout shifts in calendar grids.

The `stableMonth` type is currently defined in the core types but not implemented. Initial analysis revealed this would require:
- Special divide logic that creates overlapping periods
- Custom unit definitions with calendar-specific behavior
- Exceptions in core operations for display-oriented units

## Decision

**Calendar-specific units should NOT be implemented in the core package.** Instead, they should be implemented in a separate, optional package.

## Rationale

1. **Maintains Core Philosophy**: The core follows a "Calculus for Time" philosophy - providing only fundamental, irreducible operations. Calendar display units are composed patterns, not fundamental operations.

2. **Separation of Concerns**: 
   - Core: Time manipulation and calculation
   - Calendar package: Display-specific time units

3. **Avoids Special Cases**: Implementing stableMonth in core would require exceptions in divide() and other operations, violating the principle of consistent behavior.

4. **Clean Architecture**: Users who don't need calendar features don't pay the complexity cost.

5. **Better Extensibility**: Calendar needs vary widely (fiscal calendars, academic calendars, etc.). A separate package can evolve independently.

## Consequences

### Positive
- Core remains minimal and focused
- No special-case logic in fundamental operations
- Clear separation between calculation and display
- Optional complexity - users choose what they need
- Calendar package can include other display utilities (grid generation, week numbering, etc.)

### Negative
- Additional package to maintain
- Users need to install another package for calendar features
- Potential for confusion about where calendar logic lives

## Implementation Approach

When/if calendar units are needed:

```
packages/
├── @usetemporal/calendar-units/
│   ├── units/
│   │   ├── stableMonth.ts    # 6-week period
│   │   ├── stableYear.ts     # consistent height year view
│   │   └── calendarWeek.ts   # week-aligned periods
│   ├── utilities/
│   │   ├── gridGeneration.ts
│   │   └── weekNumbering.ts
│   └── index.ts
```

The package would:
1. Use the core's unit registry system to define new units
2. Implement custom divide behavior for these units
3. Provide calendar-specific utilities
4. Include comprehensive examples

## Alternatives Considered

1. **Implement in Core**: Rejected due to philosophy violation and complexity
2. **Document Workaround Only**: Current state, but doesn't provide first-class support
3. **Utility Functions**: Could work but doesn't integrate with divide() pattern

## References

- Current stableMonth documentation: `/vitepress/examples/stable-month-calendar.md`
- Type definitions: `/packages/core/src/types.ts` (line 33)
- Core philosophy: `CLAUDE.md` - "Calculus for Time" section