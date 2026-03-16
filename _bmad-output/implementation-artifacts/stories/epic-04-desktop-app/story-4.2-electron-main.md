# Story 4.2: Electron Main Process

**Status**: Done (native menu pending)
**Epic**: Epic 4 — Desktop App
**Estimate**: 4h
**Priority**: Critical

## User Story
As a user, I want the desktop app to handle file system operations, database access, and game launching through a secure IPC bridge, so that the renderer stays sandboxed.

## Acceptance Criteria
- [x] Window management: create, focus, minimize, maximize, close
- [x] IPC handlers: `filesystem.*` — file reads, directory scan
- [x] IPC handlers: `database.*` — all queries proxied through main
- [x] IPC handlers: `launcher.*` — spawn emulator process
- [ ] Native menu: File, Library, View, Help
- [x] App lifecycle: quit on all windows closed (except macOS)

## Technical Notes
- **Architecture ref**: ADR-001 (IPC bridge pattern)
- **Dependencies**: Story 4.1
- **Constraint**: All `better-sqlite3` and `child_process` calls in main process only
