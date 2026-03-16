# Story 3.8: Widget Components

**Status**: Done (drag-to-reorder + tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 5h
**Priority**: High

## User Story
As a user, I want a customizable widget home screen showing recent games, favorites, and stats, so that my most important content is always one tap away.

## Acceptance Criteria
- [x] `WidgetContainer` — base with size prop (small/medium/large) and drag handle
- [x] `RecentGamesWidget` — horizontal scroll of last 10 played games
- [x] `FavoritesWidget` — grid of favorited games
- [x] `StatsWidget` — total play time, game count, top platform
- [x] `PlatformShortcutsWidget` — quick-tap platform icons
- [ ] Drag-to-reorder via `react-native-reanimated` + gesture handler
- [x] Widget size selector (small/medium/large)
- [ ] Tests: each widget renders without crashing

## Technical Notes
- **Architecture ref**: ADR-004 (widgetsStore)
- **Dependencies**: Story 3.2, Story 2.7
- **PRD ref**: US-3.1
