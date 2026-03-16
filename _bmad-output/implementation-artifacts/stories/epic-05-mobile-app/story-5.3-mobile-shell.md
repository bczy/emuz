# Story 5.3: Mobile App Shell

**Status**: Done
**Epic**: Epic 5 — Mobile App
**Estimate**: 2h
**Priority**: High

## User Story
As a mobile user, I want the app to initialize the database, apply the theme, and show a splash screen on launch, so that startup feels polished.

## Acceptance Criteria
- [x] App entry point (`src/App.tsx`) wraps all providers
- [x] `AppProviders`: ThemeProvider, NavigationContainer, QueryClientProvider
- [x] Database initialization on launch (`services/init.ts`)
- [x] Splash screen shown while initializing
- [x] Error boundary at app root

## Technical Notes
- **Dependencies**: Story 5.2
