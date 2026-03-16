# Story 4.5: Desktop Build Configuration

**Status**: Done (auto-update + code signing docs pending)
**Epic**: Epic 4 — Desktop App
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want downloadable desktop builds for macOS, Linux, and Windows, so that I can install EmuZ without building from source.

## Acceptance Criteria
- [x] `electron-builder.yml` configured for macOS (DMG), Windows (NSIS), Linux (AppImage)
- [x] macOS: universal binary (Intel + Apple Silicon)
- [x] Windows: x64 installer
- [x] Linux: AppImage + Flatpak target
- [ ] Auto-update: `electron-updater` configured against GitHub Releases
- [ ] Code signing: documented process (not automated — requires certificates)

## Technical Notes
- **Architecture ref**: ADR-012 (minimum OS versions)
- **Dependencies**: Story 4.4
