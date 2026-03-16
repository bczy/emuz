# Story 6.1: Unit Tests

**Status**: In Progress
**Epic**: Epic 6 — Polish & Testing
**Estimate**: 4h
**Priority**: High

## User Story
As a developer, I want comprehensive unit tests for all core services, so that regressions are caught immediately in CI.

## Acceptance Criteria
- [x] Core services tests scaffolded (`LibraryService`, `ScannerService`, `MetadataService`, `LaunchService`, `WidgetService`, `GenreService`)
- [x] Database adapter tests
- [x] Emulator registry + detector tests
- [ ] All pending tests implemented (80% line coverage target — see individual stories)
- [ ] Utility function tests: `fileExtensions.ts`, `hash.ts`, `commandBuilder.ts`
- [x] GitHub Actions CI runs `pnpm test` on every PR

## Technical Notes
- **Architecture ref**: ADR-010 (testing stack: Vitest)
- **Dependencies**: Phase 2 complete
- **PRD ref**: NFR-6 (> 80% coverage)
- **Vitest config**: `environment: 'jsdom'`, `coverage.threshold.lines: 80`
