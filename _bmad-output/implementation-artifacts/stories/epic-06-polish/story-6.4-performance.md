# Story 6.4: Performance Optimization

**Status**: Pending
**Epic**: Epic 6 — Polish & Testing
**Estimate**: 3h
**Priority**: High

## User Story
As a user, I want the app to load quickly and scroll smoothly even with 1000+ games, so that the experience never feels sluggish.

## Acceptance Criteria
- [ ] Image caching strategy implemented (LRU cache, lazy loading)
- [ ] GameGrid virtualization fully implemented (Story 3.4 pending item)
- [ ] Database queries profiled and indexes verified
- [ ] Bundle size analyzed; unused dependencies removed
- [ ] Memory profiled at 1000+ game library (target < 500MB)
- [ ] Library load time verified < 2 seconds (NFR-1)

## Technical Notes
- **Architecture ref**: NFR-1 (performance targets)
- **Dependencies**: Phase 4, Phase 5 complete
