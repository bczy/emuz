# Story 2.4: LaunchService Implementation

**Status**: Done (tests pending)
**Epic**: Epic 2 — Core Services
**Estimate**: 4h
**Priority**: Critical

## User Story
As a user, I want to launch any game with one tap, with my play session automatically tracked, so that I never have to leave EmuZ to start playing.

## Acceptance Criteria
- [x] `ILaunchService` interface defined
- [x] `getEmulators()` — lists configured emulators
- [x] `detectEmulators()` — auto-detects installed emulators per platform
- [x] `addEmulator(data)` — manually registers emulator
- [x] `setDefaultEmulator(platformId, emulatorId)` — persists default
- [x] `launchGame(gameId, emulatorId?)` — delegates to `LauncherAdapter`
- [x] `buildLaunchCommand(game, emulator)` — resolves template placeholders
- [x] `recordPlaySession(gameId, duration)` — updates `play_count`, `play_time`, `last_played`
- [ ] Unit tests: `libs/core/src/__tests__/LaunchService.test.ts`

## Technical Notes
- **Architecture ref**: ADR-005 (launcher adapters), architecture.md §Core Service Interfaces
- **Dependencies**: Story 2.1, Story 1.6
- **PRD ref**: US-2.1, US-2.2
- **Performance**: Handoff to emulator in < 1s (NFR-1)
- **Command builder**: Template placeholders `{rom}`, `{core}`, `{args}`
