# Story 1.7: Drizzle ORM Migration

**Status**: Pending
**Epic**: Epic 1 — Foundation
**Estimate**: 6h
**Priority**: High

## User Story

As a developer, I want `@emuz/database` to use Drizzle ORM for all SQLite access, so that schema definitions are type-safe, migrations are generated from schema diffs, and services no longer construct raw SQL strings.

## Acceptance Criteria

> **TDD order**: test ACs (1–2) must be written and go RED before any implementation.

- [ ] Unit tests written for Drizzle schema: column types, FK constraints, JSON round-trip for `rom_extensions`/`platform_ids`/`config` using `drizzle(new Database(':memory:'))` — tests must go RED before implementation
- [ ] Service query tests written against in-memory Drizzle DB for all 5 services (`LibraryService`, `MetadataService`, `ScannerService`, `GenreService`, `WidgetService`) — RED before implementation
- [ ] `drizzle-orm` and `drizzle-kit` added to `libs/database/package.json`; `react-native-sqlite-storage` removed; `@op-engineering/op-sqlite ^8.x` added
- [ ] `libs/database/drizzle.config.ts` created (`dialect: 'sqlite'`, `out: './drizzle'`, `schema: './src/schema/index.ts'`)
- [ ] `libs/database/src/schema/index.ts` — full Drizzle table definitions for all 8 tables (replaces `schema/tables.ts`); all column types applied: `.json()` for array/JSON columns, `integer({ mode: 'boolean' })` for boolean flags, `integer({ mode: 'timestamp' })` for timestamps, `.references()` with CASCADE/SET NULL, composite PK on `collection_games`
- [ ] `pnpm nx run database:generate` produces initial SQL migration file under `libs/database/drizzle/`
- [ ] Desktop adapter (`libs/database/src/adapters/desktop.ts`) wraps `better-sqlite3` instance in `drizzle()`, exports typed `BetterSQLite3Database<Schema>`
- [ ] Mobile adapter (`libs/database/src/adapters/mobile.ts`) uses `op-sqlite` `open()` and wraps in `drizzle()`, exports `OPSQLiteDatabase<Schema>`
- [ ] `DatabaseAdapter` interface in `libs/database/src/adapters/types.ts` marked `@deprecated` with JSDoc pointing to Drizzle instance (retained as shim for transition)
- [ ] `libs/core/src/services/LibraryService.ts` refactored to Drizzle query builder — no raw SQL strings
- [ ] `libs/core/src/services/MetadataService.ts` refactored to Drizzle query builder
- [ ] `libs/core/src/services/ScannerService.ts` refactored to Drizzle query builder
- [ ] `libs/core/src/services/GenreService.ts` refactored to Drizzle query builder (GROUP BY via `.groupBy()`)
- [ ] `libs/core/src/services/WidgetService.ts` refactored to Drizzle query builder; the self-referential position-reorder `UPDATE widgets SET position = (SELECT COUNT(*) FROM widgets w2 WHERE w2.position < widgets.position)` is retained as `db.run(sql\`…\`)`with a`// drizzle-escape-hatch` comment
- [ ] `toDate`, `toOptionalDate`, `buildUpdateQuery` in `libs/core/src/utils/db.ts` marked `@deprecated` (retained during transition, removed in v1.0)
- [ ] `libs/database/src/migrations/stamp.ts` utility written — records initial migration in `__drizzle_migrations` without executing SQL, for databases already created by Story 1.2
- [ ] All tests green at 80%+ coverage (`pnpm nx test core` and `pnpm nx test database` pass)
- [ ] `docs/drizzle-migration.md` created with mobile native rebuild instructions (`pod install`, Gradle sync)

## Technical Notes

- **Architecture ref**: ADR-013 (Drizzle ORM + op-sqlite), ADR-003 (dual adapter pattern — retained)
- **Supersedes**: Story 1.2 (raw SQL schema + hand-rolled migration runner), Story 1.3 (adapter implementations)
- **Dependencies**: Story 1.2, Story 1.3 must be `Done` (they are)
- **Blocks**: Story 6.1 (#38), Story 6.2 (#39), Story 6.3 (#40), Story 6.4 (#41) depend on this story being complete before finalising tests, in-memory DB setup, E2E, and performance profiling
- **PRD ref**: NFR-3 (maintainability), NFR-6 (80% test coverage)
- **Key files**:
  - `libs/database/src/schema/index.ts` — new canonical schema (see architecture.md §Database Schema for preview)
  - `libs/database/src/adapters/desktop.ts` — Drizzle wrapper over better-sqlite3
  - `libs/database/src/adapters/mobile.ts` — op-sqlite + Drizzle wrapper
  - `libs/database/drizzle.config.ts` — Drizzle Kit config
  - `libs/database/src/migrations/stamp.ts` — migration bridge
  - `libs/core/src/services/*.ts` — all 5 services refactored
- **op-sqlite note**: Requires `pod install` (iOS) and Gradle sync (Android) after install. This is a breaking native change — mobile app must be rebuilt, not just reloaded.
- **Drizzle Kit migration bootstrap**: The existing `_migrations` tracking table from Story 1.2 is incompatible with Drizzle Kit's `__drizzle_migrations`. The `stamp.ts` utility must be run once on existing databases to record migration 0001 as already applied without re-executing SQL.
- **Escape-hatch pattern**: `WidgetService` position reorder uses a correlated subquery with no Drizzle equivalent. Keep as `db.run(sql\`…\`)`and document with`// drizzle-escape-hatch: correlated subquery not expressible in Drizzle query builder`.
