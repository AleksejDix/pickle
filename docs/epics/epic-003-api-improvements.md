# Epic 003: API Improvements and Minimalism

## Epic Goal
Improve the useTemporal API for better developer experience while maintaining the library's minimalist philosophy. Implement convenience features that don't compromise the core "Calculus for Time" approach.

## Background
Based on user feedback and analysis, several API improvements can enhance developer experience without adding bloat. These include better constants organization, consistent exports, and potential removal of redundant operations.

## Stories
- 003.01: Implement UNITS Constant Object (from 012-implement-units-constant.md)
- 003.02: Test UNITS Constant Implementation (from 013-test-units-constant.md)
- 003.03: Document UNITS API (from 014-document-units-api.md)
- 003.04: Update Package Exports (from 015-update-exports.md)
- 003.05: Ensure API Consistency (from 016-api-consistency.md)
- 003.06: API Minimalism Implementation (from 017-api-minimalism.md)

## Acceptance Criteria
1. UNITS constant object implemented and tested
2. All exports consistent across packages
3. API documentation updated
4. Tree-shaking still works effectively
5. No breaking changes for existing users
6. Bundle size remains minimal (<6KB target)

## Dependencies
- Should be done after Epic 002 (Technical Debt Resolution)

## Integration Requirements
- Maintain backward compatibility
- Ensure tree-shaking effectiveness
- Follow existing TypeScript patterns
- Update all relevant documentation

## Status
**Not Started**

## Notes
Story 017-api-minimalism-analysis.md is an analysis document, not an implementation story.