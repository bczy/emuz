# Story 3.5: SearchBar Component

**Status**: Done (tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 2h
**Priority**: High

## User Story
As a user, I want a search bar accessible from any screen, so that I can find any game within seconds.

## Acceptance Criteria
- [x] Debounced input (300ms) triggers `onSearch` callback
- [x] Clear button shown when input has value
- [x] Keyboard shortcut hint displayed on desktop (Ctrl+F / ⌘F)
- [x] Animated focus state with emerald border
- [ ] Tests: debounce behavior, clear action

## Technical Notes
- **Dependencies**: Story 3.2
- **PRD ref**: US-1.4 (search, < 100ms results)
