# Story 2.8: GenreService Implementation

**Status**: Done
**Epic**: Epic 2 — Core Services
**Estimate**: 2h
**Priority**: Medium

## User Story

As a user, I want to browse games by genre, so that I can discover games based on my mood.

## Acceptance Criteria

- [x] `IGenreService` interface defined
- [x] `getGenres()` — distinct genres with game counts
- [x] `getGamesByGenre(genre)` — filtered game list
- [x] `assignGenre(gameId, genre)` — manual override
- [x] Genres extracted from `games.genre` field (populated by MetadataService)
- [x] Unit tests: `libs/core/src/__tests__/GenreService.test.ts`

## Technical Notes

- **Architecture ref**: architecture.md §Database Schema
- **Dependencies**: Story 2.1
- **PRD ref**: US-3.5 (genre navigation)
