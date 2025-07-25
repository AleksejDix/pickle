# User Stories

This folder contains user stories following the BMad-Method story template.

## Purpose

Stories are actionable units of work that:
- Deliver specific user value
- Can be completed by a developer (human or AI agent)
- Include all context needed for implementation
- Are tracked from draft through completion

## Current Stories

### Epic 002: Technical Debt Resolution
- **002.01.fix-typescript-errors.md** - Fix TypeScript compilation errors blocking v2.0.0

### Epic 003: API Improvements and Minimalism
- **003.01.implement-units-constant.md** - Create UNITS constant object for better DX
- **003.02.test-units-constant.md** - Comprehensive testing for UNITS constant
- **003.03.document-units-api.md** - Document the UNITS API
- **003.04.update-exports.md** - Update package exports for UNITS
- **003.05.api-consistency.md** - Fix parameter ordering inconsistencies
- **003.06.api-minimalism.md** - Evaluate removing non-fundamental operations

## Story Template Sections

All stories MUST include these sections:
1. **Status** - Draft/Approved/InProgress/Review/Done
2. **Story** - As a/I want/So that format
3. **Acceptance Criteria** - Numbered list of requirements
4. **Tasks/Subtasks** - Checkbox list of implementation steps
5. **Dev Notes** - Technical context, architecture references
6. **Testing** - Test requirements and validation steps
7. **Change Log** - Version history of the story
8. **Dev Agent Record** - Filled by implementing agent
9. **QA Results** - QA validation results

## Story Lifecycle

1. **Draft** - Initial creation, may be incomplete
2. **Approved** - Ready for implementation
3. **InProgress** - Developer/agent is working on it
4. **Review** - Implementation complete, awaiting review
5. **Done** - Fully implemented and validated

## For AI Agents

Stories contain all necessary context in Dev Notes. Agents should:
- Read the entire story before starting
- Update status when beginning work
- Fill in Dev Agent Record section
- Mark tasks complete as they progress

## Creating New Stories

Use the BMad story template:
- `/BMad:create-next-story` - Creates the next story in sequence
- `/BMad:brownfield-create-story` - For enhancement stories

Story naming convention: `{epic-number}.{story-number}.{descriptive-name}.md`