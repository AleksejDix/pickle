# Epic Documentation

This folder contains epic definitions that group related user stories.

## Purpose

Epics represent larger bodies of work that deliver significant value. They:
- Group related user stories
- Define overall goals and success criteria
- Track progress across multiple stories
- Provide context for story implementation

## Structure

Epic files follow the naming convention: `epic-{number}-{descriptive-name}.md`

Example: `epic-001-bmad-documentation.md`

## Creating a New Epic

Epics are typically created as part of a PRD, but can also be created independently:
1. Use sequential numbering (001, 002, etc.)
2. Include clear acceptance criteria
3. List all related stories
4. Define integration requirements

## Epic Contents

Each epic should include:
- **Epic Goal** - What value it delivers
- **Background** - Why this epic exists
- **Stories** - List of stories that implement the epic
- **Acceptance Criteria** - How to know the epic is complete
- **Dependencies** - Other epics or external factors

## Relationship to Stories

- Stories in `/docs/stories/` reference their parent epic
- Story numbering: `{epic-number}.{story-number}` (e.g., 001.01)
- All stories in an epic should be completed for epic closure