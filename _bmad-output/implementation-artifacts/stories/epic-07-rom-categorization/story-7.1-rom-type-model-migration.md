# Story 7.1: ROM Type — Game Model & Database Migration

**Status**: Pending
**Epic**: Epic 7 — ROM Categorization
**Estimate**: 2h
**Priority**: High
**Assignee**: Expert TypeScript

## User Story

As a developer, I want a `romType` field on the `Game` model and database schema, so that the rest of the application can store and read the ROM type for every game.

## Acceptance Criteria

- [ ] `romType: z.enum(['game', 'homebrew']).default('game')` added to `GameSchema` in `libs/core/src/models/Game.ts`
- [ ] `rom_type TEXT NOT NULL DEFAULT 'game'` column added to the `games` Drizzle table in `libs/database/src/schema/index.ts`
- [ ] Drizzle migration file generated and committed under `libs/database/drizzle/`
- [ ] Existing rows default to `'game'` (additive migration, no data loss)
- [ ] `Game` TypeScript type reflects the new field
- [ ] Unit tests: `libs/core/src/__tests__/GameModel.test.ts` — validates schema accepts `'game'`, `'homebrew'`, rejects unknown values, defaults to `'game'`

## Technical Notes

- **Architecture ref**: architecture.md §ADR-014
- **PRD ref**: US-1.5
- **Dependencies**: Story 1.7 (Drizzle ORM migration must be complete)
- **Files to modify**:
  - `libs/core/src/models/Game.ts`
  - `libs/database/src/schema/index.ts`
  - `libs/database/drizzle/` (new migration file via `pnpm nx run database:generate`)
- **TDD cycle**: write schema validation tests → red → add field → green → refactor
