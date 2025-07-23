# Research Documentation

## Overview

This folder contains research, planning, and tracking documents for the useTemporal library development.

## Current Structure

### Active Documents

- **`CURRENT-STATUS.md`** - Quick overview of completed and pending features
- **`PENDING-FEATURES.md`** - Detailed specifications for approved but unimplemented features
- **`RFC-PENDING-IMPROVEMENTS.md`** - Technical RFC for pending features
- **`COMPLETED-FEATURES-SUMMARY.md`** - Comprehensive summary of all completed features

### Folders

- **`COMPLETED/`** - User stories for successfully implemented features
- **`ARCHIVE/`** - Historical documents, analysis, and superseded RFCs

## Document Lifecycle

1. **User Story** → Created for new feature ideas
2. **RFC** → Technical proposal after approval
3. **Implementation** → Feature development
4. **COMPLETED** → User story moved here after implementation
5. **ARCHIVE** → Old analysis and decisions stored here

## Quick Status (as of 2025-01-23)

### ✅ Completed (3 features)

- Navigation API (`next()`, `previous()`, `go()`)
- International Week Support (`weekStartsOn`)
- StableMonth Unit (6-week calendar grids)

### 📋 Pending (3 features)

- Type-safe unit constants
- Utility functions (goto, select, today)
- Standalone divide function

All pending features are non-breaking additions that follow Vue.js philosophy of small, tree-shakable functions.
