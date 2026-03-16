# Story 2.7: WidgetService Implementation

**Status**: Done (tests pending)
**Epic**: Epic 2 — Core Services
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want my home screen widgets to show live data (recent games, favorites, stats), so that I can jump back into gaming quickly.

## Acceptance Criteria
- [x] `IWidgetService` interface defined
- [x] `getWidgets()` — returns ordered widget list
- [x] `addWidget(type, config)` — adds new widget
- [x] `removeWidget(id)` — removes widget
- [x] `reorderWidgets(ids)` — saves new position order
- [x] `RecentGamesProvider` — last 10 played games
- [x] `FavoritesProvider` — favorited games
- [x] `StatsProvider` — total play time, game count, platform breakdown
- [ ] Unit tests: `libs/core/src/__tests__/WidgetService.test.ts`

## Technical Notes
- **Architecture ref**: architecture.md §Database Schema (`widgets` table)
- **Dependencies**: Story 2.1
- **PRD ref**: US-3.1 (widget home screen)
