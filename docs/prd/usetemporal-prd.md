# useTemporal Documentation Refactoring Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Assessment of Enhancement Complexity

This enhancement involves restructuring the existing documentation to follow BMad-Method patterns and file structure. While it requires comprehensive changes to multiple documentation files, it can be completed systematically and does not require deep architectural changes to the codebase itself. This qualifies as a significant enhancement suitable for a full PRD.

### Existing Project Overview

#### Analysis Source
- IDE-based fresh analysis
- CLAUDE.md reference document available
- Existing documentation structure analyzed

#### Current Project State
useTemporal is a revolutionary time library (v2.0.0-alpha.1) featuring a unique `divide()` pattern for hierarchical time management. The project is organized as a monorepo with framework-agnostic architecture. The library follows a "Calculus for Time" philosophy, providing only fundamental operations that compose into complex solutions.

### Available Documentation Analysis

#### Available Documentation
- [x] Tech Stack Documentation (partial in CLAUDE.md)
- [x] Source Tree/Architecture (in CLAUDE.md)
- [x] Coding Standards (in CLAUDE.md)
- [ ] API Documentation (scattered, needs organization)
- [ ] External API Documentation
- [ ] UX/UI Guidelines (N/A for library)
- [ ] Technical Debt Documentation
- [x] Other: Development commands, testing guidelines

**Note:** While some documentation exists, it's not following BMad structure. The current `/docs` folder contains development documentation with ARCHIVE, COMPLETED, and STORIES folders, while `/vitepress` contains the user-facing VitePress documentation.

### Enhancement Scope Definition

#### Enhancement Type
- [x] Major Feature Modification (documentation restructuring)
- [x] Other: Documentation standardization and organization

#### Enhancement Description
Refactor the entire `/docs` directory to follow BMad-Method file structure and documentation patterns, ensuring all documentation files have proper structure, are correctly categorized, and follow BMad templates where applicable.

#### Impact Assessment
- [x] Moderate Impact (some existing code changes)
- Documentation files will be reorganized and reformatted, but core library code remains untouched

### Goals and Background Context

#### Goals
- Establish professional development process to prevent breaking existing functionality
- Create clear separation between user-facing docs (VitePress) and development docs (BMad)
- Provide guided process for implementing new features systematically
- Help developer regain clarity and direction in the project
- Enable AI agents to execute stories with proper context and structure
- Focus on future development rather than historical documentation

#### Background Context
The project has reached a critical point where the lack of structured process is causing confusion and risking the integrity of existing functionality. The developer is feeling lost in the current documentation chaos, with mixed content across ARCHIVE, COMPLETED, and STORIES folders. By adopting the BMad-Method documentation structure, we will establish a professional, guided process for feature development that protects existing work while enabling systematic progress.

The distinction is now clear:
- **VitePress documentation** (`/vitepress`): For end-users of the library, explaining how to use useTemporal
- **BMad documentation structure** (`/docs`): For the development team and AI agents, providing a guided process for implementing features

We will focus on organizing future stories and can archive/remove the ARCHIVE and COMPLETED folders to reduce migration effort.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| Initial Draft | 2024-12-25 | 1.0 | Created brownfield PRD for documentation refactoring | BMad Master |

## Requirements

### Functional

**FR1**: The system shall maintain clear separation between user-facing VitePress documentation and BMad development documentation, with VitePress in `/vitepress` for library usage and BMad structure in `/docs` folders.

**FR2**: All future development stories shall follow the BMad story template structure with required sections: Status, Story (As a/I want/So that), Acceptance Criteria, Tasks/Subtasks, Dev Notes, Testing, Change Log, Dev Agent Record, and QA Results.

**FR3**: A new PRD document shall be created following BMad structure to guide the documentation refactoring and future enhancements to the useTemporal library.

**FR4**: An Architecture document shall be created or updated to follow BMad patterns, focusing on the core library and adapter system as the most important components.

**FR5**: The `/docs/ARCHIVE` and `/docs/COMPLETED` folders shall be removed or relocated outside the active development documentation structure to reduce clutter and focus on future work.

**FR6**: A clear folder structure shall be established separating epics, stories, architecture docs, and PRD following BMad conventions (e.g., `/docs/epics/`, `/docs/stories/`, `/docs/architecture/`).

**FR7**: Existing stories in `/docs/STORIES/` shall be migrated to the new BMad structure with proper formatting and required sections added.

**FR8**: The CLAUDE.md file shall be preserved and potentially enhanced to reference the new BMad documentation structure for AI agent guidance.

### Non Functional

**NFR1**: Documentation changes must not affect the existing VitePress user documentation functionality or break any existing documentation links from external sources.

**NFR2**: The new structure must be intuitive enough that developers can understand where to place new documentation without extensive training.

**NFR3**: All documentation must remain in markdown format for compatibility with existing tools and version control workflows.

**NFR4**: The migration process must be reversible in case issues arise, with clear version control commits marking each major change.

**NFR5**: AI agents must be able to parse and understand the new structure without additional configuration beyond what's provided in CLAUDE.md.

### Compatibility Requirements

**CR1**: Existing VitePress documentation must remain fully functional and accessible at current URLs without any breaking changes.

**CR2**: Git history and blame information should be preserved where possible during file moves and restructuring.

**CR3**: The monorepo structure and package organization must remain unchanged - only documentation structure is affected.

**CR4**: Existing CI/CD pipelines and documentation build processes must continue to work without modification.

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: TypeScript, JavaScript
**Frameworks**: Vue reactivity (@vue/reactivity), VitePress for docs
**Database**: N/A (library project)
**Infrastructure**: npm workspaces monorepo, GitHub
**External Dependencies**: Various date adapters (date-fns, Luxon, Temporal API)

### Integration Approach

**Database Integration Strategy**: N/A - Documentation only

**API Integration Strategy**: Documentation must reference the functional API correctly:
- Single `usePeriod()` composable (no individual unit composables)
- Pure functions for all operations
- Period-centric architecture

**Frontend Integration Strategy**: VitePress documentation remains separate and untouched in `/vitepress` for end-user documentation

**Testing Integration Strategy**: Documentation examples should align with existing Vitest test patterns found in `src/__tests__/`

### Code Organization and Standards

**File Structure Approach**: 
- Development docs: `/docs/prd/`, `/docs/architecture/`, `/docs/epics/`, `/docs/stories/`
- User docs: Remain in current VitePress structure
- Remove `/docs/ARCHIVE/` and `/docs/COMPLETED/`
- Migrate `/docs/STORIES/` to `/docs/stories/`

**Naming Conventions**: 
- Stories: `{epic-number}.{story-number}.{descriptive-name}.md`
- Epics: `epic-{number}-{name}.md`
- Architecture docs: `{component}-architecture.md`

**Coding Standards**: Follow existing markdown formatting with proper headings, code blocks with language tags

**Documentation Standards**: BMad templates for all development docs, VitePress/markdown for user docs

### Deployment and Operations

**Build Process Integration**: No changes needed - documentation refactoring doesn't affect build

**Deployment Strategy**: Simple file moves via git commits, no deployment pipeline changes

**Monitoring and Logging**: N/A for documentation

**Configuration Management**: Update CLAUDE.md to reference new documentation structure

### Risk Assessment and Mitigation

**Technical Risks**: 
- Broken internal links between documents
- Git history fragmentation from file moves
- VitePress build issues if wrong files are moved

**Integration Risks**: 
- AI agents may be confused during transition period
- Developers may look in old locations for documentation

**Deployment Risks**: 
- Minimal - only documentation files affected

**Mitigation Strategies**:
- Use git mv to preserve history
- Update all internal links in a single commit
- Test VitePress build after each major change
- Create clear redirect/reference doc in old locations
- Update CLAUDE.md immediately with new structure

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic for the documentation refactoring enhancement.

**Rationale**: This documentation refactoring represents a cohesive set of related changes all serving the same goal - establishing professional development process through BMad documentation structure. While it involves multiple tasks, they are all interdependent and should be executed as a unified effort to avoid confusion and partial implementations.

## Epic 1: BMad Documentation Structure Implementation

**Epic Goal**: Transform the useTemporal project documentation from its current ad-hoc structure into a professional BMad-Method compliant system that provides clear development process, separates user and developer documentation, and enables efficient AI-agent assisted development.

**Integration Requirements**: All documentation changes must preserve existing VitePress functionality, maintain git history where possible, and provide clear migration path for existing documentation references. The new structure must integrate seamlessly with the monorepo setup and existing CLAUDE.md guidance.

### Story 1.1: Create BMad PRD and Architecture Documents

As a project maintainer,
I want to establish foundational BMad documents (PRD and Architecture),
so that all future development follows a structured, professional process.

#### Acceptance Criteria
1. PRD document created at `/docs/prd/usetemporal-prd.md` following BMad template
2. Architecture document created at `/docs/architecture/usetemporal-architecture.md` with focus on core and adapters
3. Both documents reflect actual current state (not aspirational)
4. Documents are cross-referenced and consistent
5. CLAUDE.md updated to reference these new documents

#### Integration Verification
- IV1: VitePress build still succeeds after adding new documents
- IV2: No existing documentation links are broken
- IV3: Git history preserved for any moved content

### Story 1.2: Establish BMad Folder Structure

As a project maintainer,
I want to create the BMad-compliant folder structure,
so that all documentation has a clear, designated location.

#### Acceptance Criteria
1. Create folder structure: `/docs/prd/`, `/docs/architecture/`, `/docs/epics/`, `/docs/stories/`
2. Add README.md in each folder explaining its purpose
3. Create `.gitkeep` files to ensure empty folders are tracked
4. Update `.gitignore` if needed to ensure new structure is included
5. Document the structure in a new `/docs/development/README.md`

#### Integration Verification
- IV1: Existing `/docs` VitePress content remains untouched
- IV2: New folders don't interfere with VitePress build
- IV3: Folder structure is compatible with monorepo tooling

### Story 1.3: Migrate Active Stories

As a project maintainer,
I want to migrate existing stories from `/docs/STORIES/` to BMad structure,
so that active development work follows the new professional process.

#### Acceptance Criteria
1. Each story in `/docs/STORIES/` reviewed and categorized
2. Active stories migrated to `/docs/stories/` with BMad template structure
3. Stories properly numbered according to epic association
4. Missing sections (Status, Dev Notes, etc.) added with appropriate content
5. Original `/docs/STORIES/` folder removed after migration

#### Integration Verification
- IV1: All story references in CLAUDE.md or other docs updated
- IV2: No broken internal links between stories
- IV3: Git history preserved through proper `git mv` commands

### Story 1.4: Archive Historical Documentation

As a project maintainer,
I want to cleanly archive historical documentation,
so that the active documentation is focused on future development.

#### Acceptance Criteria
1. `/docs/ARCHIVE/` and `/docs/COMPLETED/` folders removed or moved to `/docs/historical/`
2. Decision documented on whether to keep historical docs in repo or remove entirely
3. If kept, add clear README explaining these are historical only
4. Update any references to archived documents
5. Reduce repository size if documents are removed

#### Integration Verification
- IV1: No active documentation depends on archived content
- IV2: Build processes don't reference archived folders
- IV3: Repository remains in clean, working state

### Story 1.5: Update CLAUDE.md and Create Developer Guide

As a project maintainer,
I want to update AI guidance and create developer documentation,
so that both AI agents and human developers understand the new structure.

#### Acceptance Criteria
1. CLAUDE.md updated with new documentation structure and locations
2. Create `/docs/development/developer-guide.md` explaining BMad process
3. Include examples of how to create new stories, epics
4. Document the distinction between VitePress docs in `/vitepress` (users) and BMad docs in `/docs` (developers)
5. Add quick reference for where different document types belong

#### Integration Verification
- IV1: CLAUDE.md remains compatible with existing AI agent usage
- IV2: New developer guide doesn't conflict with existing contributing docs
- IV3: All documentation cross-references are accurate and working