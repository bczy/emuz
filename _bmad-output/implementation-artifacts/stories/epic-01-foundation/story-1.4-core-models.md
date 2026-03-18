# Story 1.4: Core Package — Models

**Status**: Done (feature-pending)
**Epic**: Epic 1 — Foundation
**Estimate**: 3h
**Priority**: Critical

## User Story

As a developer, I want Zod schemas and TypeScript types for all domain models, so that data validation is consistent throughout the application.

## Acceptance Criteria

- [x] `libs/core` package created with `@emuz/core` scope
- [x] `Game` model: Zod schema + inferred TypeScript type
- [x] `Platform` model: includes `wallpaper_path`, `wallpaper_blur` fields
- [x] `Emulator` model with `commandTemplate` field (camelCase; DB column: `command_template`)
- [ ] `Collection` model with `is_smart` and `smart_filter` (JSON) — deferred to Epic 5 (Collections UI)
- [x] `Widget` model: `type`, `position`, `size`, `config` (JSON)
- [x] `Genre` model
- [x] `Settings` model
- [x] All models exported from `libs/core/src/models/index.ts`

## Technical Notes

- **Architecture ref**: architecture.md §Core Service Interfaces
- **Dependencies**: Story 1.1
- **Constraint**: Use `interface` (not `type`) for object shapes per coding conventions
- **Constraint**: Strict mode — all fields explicitly typed
