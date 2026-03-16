# Story 5.6: Mobile Build Configuration

**Status**: Done (Fastlane optional)
**Epic**: Epic 5 — Mobile App
**Estimate**: 2h
**Priority**: High

## User Story
As a developer, I want reproducible iOS and Android builds, so that CI can produce installable artifacts on every PR merge.

## Acceptance Criteria
- [x] iOS: Xcode build settings aligned with `IPHONEOS_DEPLOYMENT_TARGET=15.0`
- [x] Android: `build.gradle` with `minSdkVersion=28`, `targetSdkVersion=34`
- [x] App icons generated for all sizes (iOS + Android)
- [x] Splash screen configured
- [ ] Fastlane lanes for TestFlight + Play Store (optional, post-v1.0)

## Technical Notes
- **Architecture ref**: ADR-012 (min OS versions)
- **Dependencies**: Story 5.4
