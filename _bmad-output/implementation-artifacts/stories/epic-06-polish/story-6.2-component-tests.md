# Story 6.2: Component Tests

**Status**: Pending
**Epic**: Epic 6 — Polish & Testing
**Estimate**: 3h
**Priority**: Medium

## User Story
As a developer, I want component tests for critical UI components, so that visual regressions and interaction bugs are caught before they reach users.

## Acceptance Criteria
- [ ] `GameCard` — renders with/without cover art, favorite state
- [ ] `GameGrid` — renders empty state, loading state, list of games
- [ ] `SearchBar` — debounce fires correctly, clear button works
- [ ] `Sidebar` — renders platform list, active state
- [ ] Integration test: SearchBar + GameGrid filter interaction

## Technical Notes
- **Architecture ref**: ADR-010 (RNTL for components)
- **Dependencies**: Phase 3 complete
