# Story 7.4: ROM Type — Test Suite

**Status**: Pending
**Epic**: Epic 7 — ROM Categorization
**Estimate**: 3h
**Priority**: High
**Assignee**: Testeur

## User Story

As a developer, I want comprehensive tests for the romType feature, so that regressions are caught early and the TDD coverage threshold (80%) is maintained.

## Acceptance Criteria

- [ ] Unit tests — `GameSchema` Zod validation:
  - [ ] Accepts `'game'` and `'homebrew'`
  - [ ] Defaults to `'game'` when field is absent
  - [ ] Rejects unknown values (e.g. `'demo'`)
- [ ] Unit tests — `LibraryService.searchGames()`:
  - [ ] `romType: 'game'` returns only commercial games
  - [ ] `romType: 'homebrew'` returns only homebrews
  - [ ] `romType` absent returns all games
- [ ] Unit tests — `LibraryService.updateRomType()`:
  - [ ] Persists the new value
  - [ ] Throws on unknown gameId
- [ ] Unit tests — `ScannerService` heuristic:
  - [ ] Infers `'homebrew'` for paths containing `homebrew` (case-insensitive)
  - [ ] Defaults to `'game'` for unrecognised paths
- [ ] Component tests — `GameCard`:
  - [ ] Renders HB badge when `romType === 'homebrew'`
  - [ ] Does not render badge when `romType === 'game'`
- [ ] Component tests — `Sidebar` type filter:
  - [ ] Clicking "Homebrews" dispatches correct store action
  - [ ] "All" clears the filter
- [ ] Coverage: `libs/core` remains ≥ 80% lines after this epic

## Technical Notes

- **Architecture ref**: architecture.md §ADR-010 (Testing Stack), §ADR-014
- **PRD ref**: US-1.5
- **Dependencies**: Stories 7.1, 7.2, 7.3 (all implementation must be complete)
- **Test files**:
  - `libs/core/src/__tests__/GameModel.test.ts`
  - `libs/core/src/__tests__/LibraryService.test.ts`
  - `libs/core/src/__tests__/ScannerService.test.ts`
  - `libs/ui/src/__tests__/GameCard.test.tsx`
  - `libs/ui/src/__tests__/Sidebar.romType.test.tsx`
- **Runner**: `pnpm nx test core --coverage` and `pnpm nx test ui`
- **Note**: Stories 7.1–7.3 each include their own minimal tests per the TDD cycle. This story adds integration-level and edge-case coverage on top.
