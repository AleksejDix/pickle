# Architecture Documentation

This folder contains technical architecture documentation following the BMad-Method format.

## Purpose

Architecture documents capture the current state of the system, including:
- Technical stack and dependencies
- System design and patterns
- Module organization
- Integration points
- Technical debt and constraints

## Structure

- Main Architecture: `usetemporal-architecture.md` - Core system architecture
- Component docs: Detailed architecture for specific components (as needed)
- Sharded docs: Large architecture documents may be split into sections

## Creating Architecture Docs

Use the BMad architecture template:
- For new projects: `/BMad:create-doc architecture-tmpl`
- For existing projects: `/BMad:create-doc brownfield-architecture-tmpl`
- Run `/BMad:document-project` for comprehensive analysis

## Key Principles

1. **Document Reality** - Capture what actually exists, not idealized designs
2. **Include Technical Debt** - Be honest about workarounds and constraints
3. **Reference Source** - Point to actual code files rather than duplicating
4. **Keep Current** - Update as the system evolves

Architecture docs are essential references for developers and AI agents working on the codebase.