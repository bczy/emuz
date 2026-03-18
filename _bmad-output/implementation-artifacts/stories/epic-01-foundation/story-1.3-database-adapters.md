# Story 1.3: Database Platform Adapters

**Status**: Done
**Epic**: Epic 1 — Foundation
**Estimate**: 3h
**Priority**: Critical

## User Story

As a developer, I want a unified `DatabaseAdapter` interface with desktop (`better-sqlite3`) and mobile (`react-native-sqlite-storage`) implementations, so that core services are platform-agnostic.

## Acceptance Criteria

- [x] `DatabaseAdapter` interface defined in `libs/database/src/adapters/types.ts`
- [x] Desktop adapter (`better-sqlite3`) implemented — synchronous
- [x] Mobile adapter (`react-native-sqlite-storage`) implemented — async/promise
- [x] Adapter factory selects correct implementation at runtime
- [x] Connection management (open, close, transaction)
- [x] Unit tests for both adapters (80% coverage required)

## Technical Notes

- **Architecture ref**: ADR-003 (dual adapter pattern)
- **Dependencies**: Story 1.2
- **Key files**: `libs/database/src/adapters/types.ts`, `libs/database/src/adapters/desktop.ts`, `libs/database/src/adapters/mobile.ts`
- **Test requirement**: Mock `better-sqlite3` and `react-native-sqlite-storage` in Vitest

## Superseded By

> **Note**: This story's adapter implementations (`DesktopDatabaseAdapter` wrapping `better-sqlite3`, `MobileDatabaseAdapter` wrapping `react-native-sqlite-storage`) are superseded by **Story 1.7** (Drizzle ORM Migration). `react-native-sqlite-storage` will be replaced by `@op-engineering/op-sqlite`. The `DatabaseAdapter` interface is retained as a `@deprecated` shim during the transition period and will be removed in v1.0.
