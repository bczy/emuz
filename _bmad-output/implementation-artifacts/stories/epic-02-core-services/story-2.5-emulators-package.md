# Story 2.5: Emulators Package

**Status**: Done (tests pending)
**Epic**: Epic 2 — Core Services
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want common emulators automatically detected and pre-configured, so that I don't have to manually set up every emulator.

## Acceptance Criteria
- [x] `libs/emulators` package created with `@emuz/emulators` scope
- [x] `EmulatorDefinition` interface in `registry/types.ts`
- [x] RetroArch definition (all cores, all platforms)
- [x] Dolphin definition (GameCube, Wii)
- [x] PCSX2 definition (PS2)
- [x] DeSmuME/melonDS definitions (DS)
- [x] mGBA definition (GBA)
- [x] Auto-detector: scans common install paths per OS
- [ ] Unit tests for registry and detector

## Technical Notes
- **Architecture ref**: ADR-009 (embedded JSON platform/emulator configs)
- **Dependencies**: Story 1.1
- **PRD ref**: US-2.1
- **JSON structure**: `libs/emulators/src/data/platforms/` — one file per system
