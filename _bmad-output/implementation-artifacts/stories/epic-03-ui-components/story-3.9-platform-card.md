# Story 3.9: PlatformCard with Wallpaper

**Status**: Done (tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want platform cards with custom wallpapers and blur overlays, so that browsing feels immersive and platform-specific.

## Acceptance Criteria
- [x] Background wallpaper image (from `platform.wallpaper_path`)
- [x] Blur/overlay options (adjustable `wallpaper_blur`)
- [x] Game count badge
- [x] Platform icon overlaid
- [x] Platform name and manufacturer text
- [x] Press/hover animation
- [ ] Tests: renders correctly with and without wallpaper

## Technical Notes
- **Architecture ref**: architecture.md §Database Schema (wallpaper fields), ADR-009
- **Dependencies**: Story 3.2
- **PRD ref**: US-3.4
