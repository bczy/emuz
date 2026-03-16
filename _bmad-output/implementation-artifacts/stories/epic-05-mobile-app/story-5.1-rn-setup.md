# Story 5.1: React Native Project Setup

**Status**: Done
**Epic**: Epic 5 — Mobile App
**Estimate**: 3h
**Priority**: Critical

## User Story
As a developer, I want the React Native app initialized with Metro configured for the Nx monorepo, so that `pnpm nx start mobile` works and resolves all `@emuz/*` packages.

## Acceptance Criteria
- [x] `apps/mobile` initialized as bare React Native project
- [x] TypeScript strict configuration
- [x] Metro configured with monorepo resolver for `@emuz/*` packages
- [x] Babel configured with NativeWind and Reanimated plugins
- [x] iOS project configured (`IPHONEOS_DEPLOYMENT_TARGET=15.0`)
- [x] Android project configured (`minSdkVersion=28`)

## Technical Notes
- **Architecture ref**: ADR-002 (bare workflow), ADR-012 (min OS versions)
- **Dependencies**: Story 3.1
