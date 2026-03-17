# Story 1.6: Platform Package — Emulator Launchers

**Status**: Done
**Epic**: Epic 1 — Foundation
**Estimate**: 4h
**Priority**: Critical

## User Story

As a developer, I want a `LauncherAdapter` interface with Android (Intents), iOS (URL schemes), and desktop (spawn) implementations, so that game launching works on every platform.

## Acceptance Criteria

- [x] `LauncherAdapter` interface: `launch(game, emulator): Promise<void>`
- [x] Desktop launcher: `child_process.spawn` detached, stdio ignored
- [x] Android launcher: Intent system via `react-native` Linking + native module
- [x] iOS launcher: URL scheme registry (`retroarch://`, `delta://`, `provenance://`)
- [x] `urlSchemes.ts`: mapping of emulator id → iOS URL template
- [x] Factory function selects launcher based on `Platform.OS`
- [x] Unit tests for desktop launcher (mock `child_process`)

## Technical Notes

- **Architecture ref**: ADR-005, plan.md §Emulator Launch Strategy
- **Dependencies**: Story 1.5
- **iOS URL schemes**: `retroarch://run?rom={rom}&core={core}`, `delta://game/{rom}`, `provenance://play?file={rom}`
- **Android**: `com.retroarch` package intent with `ROM` and `LIBRETRO` extras
