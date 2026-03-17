# Story 2.6: State Management (Zustand)

**Status**: Done
**Epic**: Epic 2 — Core Services
**Estimate**: 4h
**Priority**: High

## User Story

As a developer, I want Zustand stores with persistence for all client state, so that UI state survives app restarts and components can subscribe efficiently.

## Acceptance Criteria

- [x] `libraryStore` — selected platform, active filters, sort order
- [x] `settingsStore` — theme, language, emulator paths, grid size
- [x] `uiStore` — sidebar open/closed, active modal, loading state
- [x] `widgetsStore` — widget list, layout positions, widget configs
- [x] Persistence middleware applied to `settingsStore` and `widgetsStore`
- [x] Hooks exported: `useLibrary`, `useSettings`, `useWidgets`
- [x] React Query integration for async data (games list, metadata)

## Technical Notes

- **Architecture ref**: ADR-004 (Zustand + React Query)
- **Dependencies**: Story 2.1, Story 2.4
- **PRD ref**: US-3.1 (widgets), US-3.6 (themes)
- **Persistence**: `zustand/middleware/persist` with `AsyncStorage` on mobile, `localStorage` on desktop renderer
