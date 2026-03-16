# Story 3.1: UI Package Setup with Green Theme

**Status**: Done (react-native-web pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 2h
**Priority**: High

## User Story
As a developer, I want the `@emuz/ui` package initialized with the emerald green / slate dark theme system, so that all components share a consistent visual language.

## Acceptance Criteria
- [x] `libs/ui` package created with `@emuz/ui` scope
- [x] Theme tokens defined: primary `#10B981`, background `#0F172A`, surface `#1E293B`
- [x] `dark.ts` and `light.ts` theme objects
- [x] Color tokens exported from `themes/index.ts`
- [x] Component directory structure established
- [ ] `react-native-web` support configured

## Technical Notes
- **Architecture ref**: ADR-006 (NativeWind), architecture.md §Color Palette
- **Dependencies**: Story 1.1
- **PRD ref**: US-3.6 (theme customization)
