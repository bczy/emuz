# Story 2.1: LibraryService Implementation

**Status**: Done
**Epic**: Epic 2 — Core Services
**Estimate**: 4h
**Priority**: Critical

## User Story

As a user, I want my games, platforms, and collections persisted and queryable, so that my library is always available and searchable.

## Acceptance Criteria

- [x] `ILibraryService` interface defined in `libs/core/src/services/types.ts`
- [x] `getAllGames()` — returns all games with platform join
- [x] `getGameById(id)` — returns single game or null
- [x] `getGamesByPlatform(platformId)` — filtered list
- [x] `searchGames(query)` — SQL LIKE search with wildcard escaping; fuse.js fuzzy search deferred to Epic 6
- [x] `updateGame(id, data)` — partial update
- [x] `deleteGame(id)` — soft or hard delete
- [x] Collection CRUD: `getCollections`, `createCollection`, `addToCollection`, `removeFromCollection`
- [x] Favorites: `toggleFavorite`, `getFavorites`
- [x] Unit tests: `libs/core/src/__tests__/LibraryService.test.ts`

## Technical Notes

- **Architecture ref**: architecture.md §Core Service Interfaces
- **Dependencies**: Story 1.3, Story 1.4
- **PRD ref**: US-1.3, US-1.4
- **Test requirement**: Use in-memory SQLite for tests (avoid mocks)
