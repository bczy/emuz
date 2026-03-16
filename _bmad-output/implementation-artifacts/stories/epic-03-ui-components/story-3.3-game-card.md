# Story 3.3: GameCard Component

**Status**: Done (tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want each game displayed as a card with cover art and platform badge, so that I can identify games at a glance.

## Acceptance Criteria
- [x] Cover image displayed with aspect ratio preserved
- [x] Placeholder shown when cover art is missing
- [x] Platform badge overlay (bottom-left)
- [x] Hover/press state with scale animation
- [x] Context menu trigger (long press mobile / right-click desktop)
- [x] Favorite indicator when `game.favorite === 1`
- [ ] Tests: renders correctly with and without cover art

## Technical Notes
- **Architecture ref**: prd.md §US-3.2 (grid view)
- **Dependencies**: Story 3.2
- **PRD ref**: US-3.2
- **Performance**: Images load asynchronously; use `react-native-fast-image` or `Image` with caching
