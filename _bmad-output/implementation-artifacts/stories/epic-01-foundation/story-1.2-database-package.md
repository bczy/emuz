# Story 1.2: Database Package Setup

**Status**: Done
**Epic**: Epic 1 — Foundation
**Estimate**: 4h
**Priority**: Critical

## User Story
As a developer, I want the `@emuz/database` package with schema, migrations, and seed data, so that all services have a stable data layer to build on.

## Acceptance Criteria
- [x] `libs/database` package created with `@emuz/database` scope
- [x] TypeScript strict configuration
- [x] Schema types defined for all tables: `platforms`, `games`, `emulators`, `collections`, `game_collections`, `rom_directories`, `settings`, `widgets`
- [x] Migration system implemented (versioned up/down)
- [x] Initial migration (`001_initial.ts`) creates all tables and indexes
- [x] Platform seed data included (100+ systems)

## Technical Notes
- **Architecture ref**: ADR-003 (SQLite schema), architecture.md §Database Schema
- **Dependencies**: Story 1.1
- **Key files**: `libs/database/src/schema/`, `libs/database/src/migrations/001_initial.ts`, `libs/database/src/seed/platforms.ts`
