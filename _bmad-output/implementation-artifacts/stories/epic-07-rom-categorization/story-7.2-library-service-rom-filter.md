# Story 7.2: ROM Type — LibraryService Filter & Scanner Heuristic

**Status**: Pending
**Epic**: Epic 7 — ROM Categorization
**Estimate**: 3h
**Priority**: High
**Assignee**: Expert TypeScript

## User Story

As a user, I want to filter my game library by ROM type, and have the scanner automatically suggest a type based on folder name, so that my collection is organized without manual effort.

## Acceptance Criteria

- [ ] `romType?: 'game' | 'homebrew'` added to `SearchOptions` in `libs/core/src/services/types.ts`
- [ ] `LibraryService.searchGames()` filters by `romType` when provided
- [ ] `LibraryService.updateRomType(gameId, romType)` method added to `ILibraryService` interface and implementation
- [ ] `ScannerService` infers `romType = 'homebrew'` when the source directory path contains `homebrew` (case-insensitive); defaults to `'game'` otherwise
- [ ] Unit tests: `libs/core/src/__tests__/LibraryService.test.ts` — covers filter by `'game'`, filter by `'homebrew'`, no filter (returns all)
- [ ] Unit tests: `libs/core/src/__tests__/ScannerService.test.ts` — covers heuristic detection from folder names `homebrews/`, `Homebrew/`, `roms/`

## Technical Notes

- **Architecture ref**: architecture.md §ADR-014
- **PRD ref**: US-1.5
- **Dependencies**: Story 7.1 (romType field must exist on model + schema)
- **Files to modify**:
  - `libs/core/src/services/types.ts`
  - `libs/core/src/services/LibraryService.ts`
  - `libs/core/src/services/ScannerService.ts`
- **TDD cycle**: write service tests first → red → implement filter + heuristic → green → refactor
- **Note**: `updateRomType` should be a thin wrapper around the existing Drizzle update pattern used by `assignGenre`
