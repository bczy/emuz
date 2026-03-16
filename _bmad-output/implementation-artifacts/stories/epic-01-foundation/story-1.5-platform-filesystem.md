# Story 1.5: Platform Package — File System Adapters

**Status**: Done (tests pending)
**Epic**: Epic 1 — Foundation
**Estimate**: 4h
**Priority**: Critical

## User Story
As a developer, I want a `FilesystemAdapter` interface with Android (SAF), iOS (Documents), and desktop (Node.js fs) implementations, so that ROM scanning works correctly on every platform.

## Acceptance Criteria
- [x] `libs/platform` package created with `@emuz/platform` scope
- [x] `FilesystemAdapter` interface: `readDir`, `readFile`, `exists`, `stat`, `requestPermission`
- [x] Desktop adapter: `libs/platform/src/filesystem/desktop.ts` (Node.js fs)
- [x] Android adapter: SAF via `react-native-saf-x`, persisted URI permissions
- [x] iOS adapter: Documents folder + Files app import
- [x] Factory function selects adapter based on `Platform.OS`
- [ ] Unit tests for desktop adapter (Android/iOS require device)

## Technical Notes
- **Architecture ref**: ADR-005 (platform adapters), clarification #4 (mobile file access)
- **Dependencies**: Story 1.1
- **Constraint**: No direct `fs` usage outside `desktop.ts`
- **Constraint**: No `require('fs')` in shared `libs/` — only in this adapter
