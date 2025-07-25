# Development Documentation Guide

This guide explains the BMad-Method documentation structure for the useTemporal project.

## Documentation Structure Overview

The `/docs` folder contains all development-related documentation following BMad-Method patterns:

```
/docs/
├── prd/              # Product Requirements Documents
├── architecture/     # Technical architecture documentation
├── epics/            # Epic definitions grouping related stories
├── stories/          # User stories for implementation
├── development/      # Development guides (this folder)
├── STORIES/          # Legacy stories (to be migrated)
├── ARCHIVE/          # Archived docs (to be removed)
└── COMPLETED/        # Completed docs (to be removed)
```

The `/vitepress` folder contains user-facing documentation for the library.

## Key Distinction

- **`/docs`** = Development documentation (for contributors, AI agents)
- **`/vitepress`** = User documentation (for library users)

## Document Types

### 1. PRD (Product Requirements Document)
- Defines what needs to be built and why
- Contains requirements, epics, and story structure
- Created before major development work

### 2. Architecture Documentation
- Captures current system state (not idealized)
- Includes technical stack, patterns, and constraints
- References actual code files

### 3. Epics
- Group related user stories
- Define larger goals and integration requirements
- Track progress across multiple stories

### 4. Stories
- Actionable units of work
- Follow strict template with 9 required sections
- Contain all context needed for implementation

## Creating New Documents

### For Stories
```bash
# Use BMad commands:
/BMad:create-next-story
/BMad:brownfield-create-story
```

Example story filename: `002.01.fix-typescript-errors.md`
- `002` = Epic number
- `01` = Story number within epic
- `fix-typescript-errors` = Descriptive name

### For Epics
Create a new file in `/docs/epics/`:
```markdown
# Epic 004: [Epic Title]

## Epic Goal
[What this epic aims to achieve]

## Background
[Context and motivation]

## Stories
- 004.01: [First story title]
- 004.02: [Second story title]

## Acceptance Criteria
[How to know the epic is complete]

## Status
**Not Started** | **In Progress** | **Complete**
```

### For PRDs
```bash
/BMad:create-doc brownfield-prd-tmpl
```

### For Architecture
```bash
/BMad:document-project
```

## Story Workflow

1. **Create Story** - Draft with all required sections
2. **Add to Epic** - Link story to parent epic
3. **Approve** - Mark as ready for implementation
4. **Implement** - Developer/AI agent works on it
5. **Review** - Validate implementation
6. **Complete** - Mark as done

## For AI Agents

When working with stories:
1. Always read the complete story first
2. Check Dev Notes for technical context
3. Update story status when starting
4. Mark tasks complete as you progress
5. Fill in Dev Agent Record section

## Practical Examples

### Example: Starting a New Feature
1. Check if an epic exists for your feature area
2. If not, create one (e.g., `epic-004-performance-optimization.md`)
3. Create a story in the epic (e.g., `004.01.optimize-divide-operation.md`)
4. Follow the 9-section story template
5. Set status to "Draft" initially

### Example: Finding What to Work On
1. Check `/docs/epics/` for active epics
2. Look in `/docs/stories/` for stories with status "Draft" or "Approved"
3. Read the full story before starting
4. Update status to "InProgress" when you begin

### Example: Completing a Story
1. Mark all tasks as complete in the story
2. Fill in Dev Agent Record section
3. Update status to "Review"
4. Update the parent epic if this was the last story

## Quick Reference

| Document Type | Location | Purpose |
|--------------|----------|---------|
| PRD | `/docs/prd/` | Requirements and planning |
| Architecture | `/docs/architecture/` | Technical documentation |
| Epics | `/docs/epics/` | Feature groupings |
| Stories | `/docs/stories/` | Implementation tasks |
| User Docs | `/vitepress/` | Library usage guides |

## Getting Help

- Check README files in each folder for specific guidance
- Reference CLAUDE.md for AI agent instructions
- Use BMad commands for document creation