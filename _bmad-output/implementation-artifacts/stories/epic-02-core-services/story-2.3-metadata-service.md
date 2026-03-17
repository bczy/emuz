# Story 2.3: MetadataService Implementation

**Status**: Done
**Epic**: Epic 2 — Core Services
**Estimate**: 4h
**Priority**: High

## User Story

As a user, I want my games automatically identified with cover art and metadata, so that my library looks great without manual effort.

## Acceptance Criteria

- [x] `IMetadataService` interface defined
- [x] `identifyGame(game)` — matches by hash against local DB, falls back to ScreenScraper
- [x] `searchMetadata(query, platformId?)` — search by title
- [x] `downloadCover(gameId, url)` — downloads and caches artwork locally
- [x] `getCoverPath(gameId)` — returns local cover path
- [x] `refreshMetadata(gameIds)` — batch async generator with progress
- [x] Caching layer: once scraped, never re-fetch
- [x] Unit tests: `libs/core/src/__tests__/MetadataService.test.ts`

## Technical Notes

- **Architecture ref**: ADR-008 (hybrid metadata)
- **Dependencies**: Story 2.1
- **PRD ref**: US-1.2
- **Metadata source**: `libs/database/src/metadata/` (pre-built local DB downloaded on first launch)
- **Online fallback**: ScreenScraper API (rate-limited; always cache result)
