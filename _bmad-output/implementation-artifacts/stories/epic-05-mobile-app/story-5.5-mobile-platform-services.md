# Story 5.5: Mobile Platform Services

**Status**: Done (share extension pending)
**Epic**: Epic 5 — Mobile App
**Estimate**: 4h
**Priority**: High

## User Story
As a mobile user, I want to select ROM folders from my device storage and launch games into emulators via URL schemes, so that the app integrates naturally with my device.

## Acceptance Criteria
- [x] `FileService` — document picker + external storage access
- [x] Android: SAF folder picker, persisted URI permissions
- [x] iOS: Files app import, Documents folder access
- [x] `LauncherService` — delegates to `LauncherAdapter` (URL schemes)
- [x] `StorageService` — app data directory management
- [ ] Share extension: receive ROM files shared from Files app (optional)

## Technical Notes
- **Architecture ref**: ADR-005 (platform adapters), clarification #4, #6
- **Dependencies**: Story 5.3, Story 1.5, Story 1.6
