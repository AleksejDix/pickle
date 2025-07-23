# Research Directory

This directory contains the feature backlog and RFC (Request for Comments) documents for the useTemporal project.

## Structure

```
research/
├── BACKLOG.md        # Feature backlog with priorities
├── RFC/              # Individual RFC documents
│   ├── 001-calendar-grid.md
│   ├── 002-utility-functions.md
│   ├── 003-type-constants.md
│   └── ...
├── COMPLETED/        # Completed feature stories
└── ARCHIVE/          # Historical documents
```

## How to Use

1. **Check the Backlog** - `BACKLOG.md` shows all features with their priority and RFC links
2. **Read RFCs** - Each RFC in the `RFC/` folder details one specific improvement
3. **Completed Features** - The `COMPLETED/` folder has implemented feature stories

## RFC Format

Each RFC follows this structure:

- **Summary** - One-line description
- **Motivation** - Why this feature is needed
- **Detailed Design** - API and implementation details
- **Benefits** - What this improves
- **Drawbacks** - Potential downsides
- **Alternatives** - Other approaches considered
- **Migration Path** - How to adopt the feature

## Contributing

When proposing a new feature:

1. Add it to `BACKLOG.md` with appropriate priority
2. Create a new RFC file: `RFC/XXX-feature-name.md`
3. Follow the RFC template structure
4. Link the RFC from the backlog entry
