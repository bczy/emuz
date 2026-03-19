/**
 * libraryStore — unit tests
 *
 * Tests: CRUD actions, filters, sorting, selection side-effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useLibraryStore } from '../stores/libraryStore';
import type { Game } from '../models/Game';
import type { LibrarySort } from '../stores/libraryStore';

// ---------------------------------------------------------------------------
// localStorage stub (required by Zustand persist middleware in Node env)
// ---------------------------------------------------------------------------

const localStorageStub: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  writable: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGame(overrides: Partial<Game> & Pick<Game, 'id' | 'title'>): Game {
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    platformId: 'plat-0001',
    filePath: `/roms/${overrides.id}.rom`,
    fileName: `${overrides.id}.rom`,
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function resetStore(): void {
  useLibraryStore.setState({
    games: [],
    platforms: [],
    collections: [],
    selectedGameId: null,
    selectedPlatformId: null,
    selectedCollectionId: null,
    filters: {
      platformId: undefined,
      collectionId: undefined,
      genreId: undefined,
      searchQuery: undefined,
      favoritesOnly: false,
    },
    sort: { field: 'title', order: 'asc' },
    isLoading: false,
    isRefreshing: false,
    error: null,
  });
}

const ZELDA = makeGame({
  id: 'g1',
  title: 'Zelda',
  platformId: 'plat-0001',
  isFavorite: true,
  genre: 'RPG',
});
const METROID = makeGame({
  id: 'g2',
  title: 'Metroid',
  platformId: 'plat-0001',
  isFavorite: false,
  genre: 'Action',
});
const MARIO = makeGame({
  id: 'g3',
  title: 'Mario',
  platformId: 'plat-0002',
  isFavorite: true,
  genre: 'Action',
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('libraryStore — CRUD actions', () => {
  beforeEach(resetStore);

  it('setGames replaces the games list', () => {
    useLibraryStore.getState().setGames([ZELDA, METROID]);
    expect(useLibraryStore.getState().games).toHaveLength(2);
  });

  it('addGame appends a game', () => {
    useLibraryStore.getState().setGames([ZELDA]);
    useLibraryStore.getState().addGame(MARIO);
    expect(useLibraryStore.getState().games).toHaveLength(2);
    expect(useLibraryStore.getState().games[1].id).toBe('g3');
  });

  it('updateGame patches a game by id', () => {
    useLibraryStore.getState().setGames([ZELDA]);
    useLibraryStore.getState().updateGame('g1', { title: 'Zelda: ALTTP' });
    expect(useLibraryStore.getState().games[0].title).toBe('Zelda: ALTTP');
  });

  it('updateGame does not touch other games', () => {
    useLibraryStore.getState().setGames([ZELDA, METROID]);
    useLibraryStore.getState().updateGame('g1', { title: 'Changed' });
    expect(useLibraryStore.getState().games[1].title).toBe('Metroid');
  });

  it('removeGame removes a game by id', () => {
    useLibraryStore.getState().setGames([ZELDA, METROID]);
    useLibraryStore.getState().removeGame('g1');
    expect(useLibraryStore.getState().games).toHaveLength(1);
    expect(useLibraryStore.getState().games[0].id).toBe('g2');
  });

  it('removeGame clears selectedGameId if that game was selected', () => {
    useLibraryStore.getState().setGames([ZELDA]);
    useLibraryStore.getState().selectGame('g1');
    useLibraryStore.getState().removeGame('g1');
    expect(useLibraryStore.getState().selectedGameId).toBeNull();
  });

  it('removeGame preserves selectedGameId if a different game was selected', () => {
    useLibraryStore.getState().setGames([ZELDA, METROID]);
    useLibraryStore.getState().selectGame('g2');
    useLibraryStore.getState().removeGame('g1');
    expect(useLibraryStore.getState().selectedGameId).toBe('g2');
  });
});

describe('libraryStore — selection', () => {
  beforeEach(resetStore);

  it('selectGame sets selectedGameId', () => {
    useLibraryStore.getState().selectGame('g1');
    expect(useLibraryStore.getState().selectedGameId).toBe('g1');
  });

  it('selectGame can be cleared with null', () => {
    useLibraryStore.getState().selectGame('g1');
    useLibraryStore.getState().selectGame(null);
    expect(useLibraryStore.getState().selectedGameId).toBeNull();
  });

  it('selectPlatform updates filters.platformId', () => {
    useLibraryStore.getState().selectPlatform('plat-0001');
    expect(useLibraryStore.getState().filters.platformId).toBe('plat-0001');
  });

  it('selectPlatform(null) clears filters.platformId', () => {
    useLibraryStore.getState().selectPlatform('plat-0001');
    useLibraryStore.getState().selectPlatform(null);
    expect(useLibraryStore.getState().filters.platformId).toBeUndefined();
  });
});

describe('libraryStore — filters', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID, MARIO]);
  });

  it('getFilteredGames returns all games with no filters', () => {
    expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(3);
  });

  it('filters by platformId', () => {
    useLibraryStore.getState().setFilters({ platformId: 'plat-0002' });
    const result = useLibraryStore.getState().getFilteredGames();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g3');
  });

  it('filters by favoritesOnly', () => {
    useLibraryStore.getState().setFilters({ favoritesOnly: true });
    const result = useLibraryStore.getState().getFilteredGames();
    expect(result.map((g) => g.id)).toEqual(expect.arrayContaining(['g1', 'g3']));
    expect(result).toHaveLength(2);
  });

  it('filters by searchQuery on title', () => {
    useLibraryStore.getState().setFilters({ searchQuery: 'zelda' });
    const result = useLibraryStore.getState().getFilteredGames();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g1');
  });

  it('searchQuery is case-insensitive', () => {
    useLibraryStore.getState().setFilters({ searchQuery: 'MARIO' });
    expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(1);
  });

  it('filters by genreId', () => {
    useLibraryStore.getState().setFilters({ genreId: 'Action' });
    const result = useLibraryStore.getState().getFilteredGames();
    expect(result.map((g) => g.id)).toEqual(expect.arrayContaining(['g2', 'g3']));
  });

  it('clearFilters removes all active filters', () => {
    useLibraryStore.getState().setFilters({ favoritesOnly: true, searchQuery: 'z' });
    useLibraryStore.getState().clearFilters();
    expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(3);
  });
});

describe('libraryStore — sorting', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID, MARIO]);
  });

  it('sorts by title asc by default', () => {
    const titles = useLibraryStore
      .getState()
      .getFilteredGames()
      .map((g) => g.title);
    expect(titles).toEqual(['Mario', 'Metroid', 'Zelda']);
  });

  it('sorts by title desc', () => {
    useLibraryStore.getState().setSort({ field: 'title', order: 'desc' });
    const titles = useLibraryStore
      .getState()
      .getFilteredGames()
      .map((g) => g.title);
    expect(titles).toEqual(['Zelda', 'Metroid', 'Mario']);
  });

  it('sorts by playCount asc', () => {
    useLibraryStore
      .getState()
      .setGames([
        makeGame({ id: 'a', title: 'A', playCount: 10 }),
        makeGame({ id: 'b', title: 'B', playCount: 2 }),
        makeGame({ id: 'c', title: 'C', playCount: 5 }),
      ]);
    const sort: LibrarySort = { field: 'playCount', order: 'asc' };
    useLibraryStore.getState().setSort(sort);
    const counts = useLibraryStore
      .getState()
      .getFilteredGames()
      .map((g) => g.playCount);
    expect(counts).toEqual([2, 5, 10]);
  });
});

describe('libraryStore — helpers', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID]);
  });

  it('getGameById returns correct game', () => {
    const game = useLibraryStore.getState().getGameById('g2');
    expect(game?.title).toBe('Metroid');
  });

  it('getGameById returns undefined for unknown id', () => {
    expect(useLibraryStore.getState().getGameById('unknown')).toBeUndefined();
  });
});

describe('libraryStore — loading & error', () => {
  beforeEach(resetStore);

  it('setLoading toggles isLoading', () => {
    useLibraryStore.getState().setLoading(true);
    expect(useLibraryStore.getState().isLoading).toBe(true);
    useLibraryStore.getState().setLoading(false);
    expect(useLibraryStore.getState().isLoading).toBe(false);
  });

  it('setError stores the error message', () => {
    useLibraryStore.getState().setError('Something went wrong');
    expect(useLibraryStore.getState().error).toBe('Something went wrong');
  });

  it('setError(null) clears the error', () => {
    useLibraryStore.getState().setError('err');
    useLibraryStore.getState().setError(null);
    expect(useLibraryStore.getState().error).toBeNull();
  });
});
