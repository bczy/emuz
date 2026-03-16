# Story 3.11: BottomTabBar Component (Mobile)

**Status**: Done (tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 2h
**Priority**: High

## User Story
As a mobile user, I want a bottom navigation bar with tabs for Home, Platforms, Genres, Search, and Settings, so that I can navigate the app with my thumb.

## Acceptance Criteria
- [x] 5 tabs: Home (🏠), Platforms (📚), Genres (🎮), Search (🔍), Settings (⚙️)
- [x] Active tab highlighted with emerald accent
- [x] Icon + label layout
- [x] Safe area insets respected (iOS notch / Android nav bar)
- [ ] Tests

## Technical Notes
- **Architecture ref**: ADR-002 (bare RN), React Navigation tab navigator
- **Dependencies**: Story 3.2
- **PRD ref**: US-4.1 (consistent cross-platform experience)
- **Desktop equivalent**: Sidebar navigation (Story 3.6)
