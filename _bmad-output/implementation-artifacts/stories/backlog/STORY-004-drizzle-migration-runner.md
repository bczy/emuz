# Story STORY-004: Versioned Drizzle Migration Runner (up/down)

**Status**: ready-for-dev
**Reserved**: supervised
**Epic**: Harness — Hardening
**Estimate**: 6h
**Priority**: Medium

**RESERVED — supervised mode only, do not implement autonomously.**

## User Story
As a developer, I want a versioned Drizzle migration runner with both `up` and `down` support in `@emuz/database`, so that schema changes can be applied and rolled back deterministically across desktop and mobile.

## Acceptance Criteria
- [ ] A migration runner exported from `libs/database/src` applies pending `up` migrations in version order against a `DrizzleDb` instance
- [ ] Each migration is versioned and recorded in a tracking table so already-applied migrations are skipped (idempotent re-run)
- [ ] A `down` path reverts the most recently applied migration (or down-to a target version) and updates the tracking table accordingly
- [ ] Running the runner on a fresh database brings the schema to the latest version; running it again is a no-op
- [ ] The runner is transport-agnostic: it accepts a `DrizzleDb` so the same logic works for better-sqlite3 (desktop) and react-native-sqlite-storage (mobile)
- [ ] Errors during a migration leave the tracking table consistent (a failed migration is not marked applied)
- [ ] Unit tests cover: fresh up, idempotent re-run, single down/rollback, and ordering of multiple migrations
- [ ] No direct synchronous filesystem access on a main thread; IO goes through existing database adapters

## Technical Notes
- **Architecture ref**: architecture.md §ADR-013 (Drizzle ORM; `DrizzleDb` from `@emuz/database`; legacy `DatabaseAdapter` deprecated)
- **PRD ref**: database migration / schema versioning
- **Dependencies**: Story 1.7 (Drizzle ORM migration) and existing `libs/database/src/migrations`
- **Key files**:
  - `libs/database/src/migrations/` (runner + version registry)
  - `libs/database/src/index.ts` (export runner)
  - `libs/database/src/__tests__/` (new runner tests)
- **TDD cycle**: write up/down/idempotency tests against an in-memory DrizzleDb → red → implement runner + tracking table → green → refactor
