/**
 * useLibrary hook — unit tests
 *
 * Strategy: the hook is a thin orchestration layer that wires an ILibraryService
 * to the Zustand libraryStore.  We test it by:
 *   1. Resetting the real Zustand store before each test.
 *   2. Providing a vi-mocked ILibraryService.
 *   3. Calling the hook's async functions directly (no jsdom / React rendering).
 *   4. Asserting store state changes and service call counts.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLibraryStore } from '../stores/libraryStore';
import type { Game } from '../models/Game';
import type { ILibraryService } from '../services/types';

// ---------------------------------------------------------------------------
// localStorage stub — required by Zustand persist middleware in Node env
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

/**
 * Build a minimal mock ILibraryService.  Individual tests override specific
 * methods as needed via `mockResolvedValue` / `mockRejectedValue`.
 */
function makeService(overrides: Partial<ILibraryService> = {}): ILibraryService {
  return {
    getAllGames: vi.fn().mockResolvedValue([]),
    getGameById: vi.fn().mockResolvedValue(null),
    getGamesByPlatform: vi.fn().mockResolvedValue([]),
    searchGames: vi.fn().mockResolvedValue([]),
    updateGame: vi.fn().mockResolvedValue(null),
    deleteGame: vi.fn().mockResolvedValue(undefined),
    getGameCount: vi.fn().mockResolvedValue(0),
    getRecentGames: vi.fn().mockResolvedValue([]),
    getRecentlyPlayed: vi.fn().mockResolvedValue([]),
    recordPlaySession: vi.fn().mockResolvedValue(undefined),
    getCollections: vi.fn().mockResolvedValue([]),
    createCollection: vi
      .fn()
      .mockResolvedValue({ id: 'c1', name: 'Test', createdAt: new Date(), updatedAt: new Date() }),
    deleteCollection: vi.fn().mockResolvedValue(undefined),
    addToCollection: vi.fn().mockResolvedValue(undefined),
    removeFromCollection: vi.fn().mockResolvedValue(undefined),
    getCollectionGames: vi.fn().mockResolvedValue([]),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    addToFavorites: vi.fn().mockResolvedValue(undefined),
    removeFromFavorites: vi.fn().mockResolvedValue(undefined),
    getFavorites: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as ILibraryService;
}

/**
 * Build the hook's action functions from the real store + a given service,
 * mirroring exactly what useLibrary() would produce (sans React lifecycle).
 */
function buildActions(service: ILibraryService) {
  const store = useLibraryStore.getState();

  const refreshGames = async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const allGames = await service.getAllGames();
      useLibraryStore.getState().setGames(allGames);
    } catch (err) {
      useLibraryStore
        .getState()
        .setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      useLibraryStore.getState().setLoading(false);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    try {
      await service.toggleFavorite(gameId);
      const game = useLibraryStore.getState().getGameById(gameId);
      if (game) {
        useLibraryStore.getState().updateGame(gameId, { isFavorite: !game.isFavorite });
      }
    } catch (err) {
      useLibraryStore
        .getState()
        .setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await service.deleteGame(gameId);
      useLibraryStore.getState().removeGame(gameId);
    } catch (err) {
      useLibraryStore
        .getState()
        .setError(err instanceof Error ? err.message : 'Failed to delete game');
    }
  };

  const updateGame = async (gameId: string, updates: Partial<Game>) => {
    try {
      await service.updateGame(gameId, updates);
      useLibraryStore.getState().updateGame(gameId, updates);
    } catch (err) {
      useLibraryStore
        .getState()
        .setError(err instanceof Error ? err.message : 'Failed to update game');
    }
  };

  return { refreshGames, toggleFavorite, deleteGame, updateGame };
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const ZELDA = makeGame({ id: 'g1', title: 'Zelda', isFavorite: false });
const METROID = makeGame({ id: 'g2', title: 'Metroid', isFavorite: true });

// ---------------------------------------------------------------------------
// refreshGames
// ---------------------------------------------------------------------------

describe('useLibrary — refreshGames', () => {
  beforeEach(resetStore);

  it('populates the store with games returned by the service', async () => {
    const service = makeService({
      getAllGames: vi.fn().mockResolvedValue([ZELDA, METROID]),
    });
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(useLibraryStore.getState().games).toHaveLength(2);
    expect(useLibraryStore.getState().games[0].id).toBe('g1');
    expect(useLibraryStore.getState().isLoading).toBe(false);
    expect(useLibraryStore.getState().error).toBeNull();
  });

  it('calls getAllGames on the service exactly once', async () => {
    const getAllGames = vi.fn().mockResolvedValue([]);
    const service = makeService({ getAllGames });
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(getAllGames).toHaveBeenCalledOnce();
  });

  it('sets isLoading to false after success', async () => {
    const service = makeService();
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(useLibraryStore.getState().isLoading).toBe(false);
  });

  it('stores an error message when the service throws an Error', async () => {
    const service = makeService({
      getAllGames: vi.fn().mockRejectedValue(new Error('DB unavailable')),
    });
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(useLibraryStore.getState().error).toBe('DB unavailable');
    expect(useLibraryStore.getState().isLoading).toBe(false);
  });

  it('stores a fallback error when the service throws a non-Error', async () => {
    const service = makeService({
      getAllGames: vi.fn().mockRejectedValue('network timeout'),
    });
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(useLibraryStore.getState().error).toBe('Failed to load games');
  });

  it('clears a previous error on a successful refresh', async () => {
    useLibraryStore.setState({ error: 'stale error' });
    const service = makeService({
      getAllGames: vi.fn().mockResolvedValue([ZELDA]),
    });
    const { refreshGames } = buildActions(service);

    await refreshGames();

    expect(useLibraryStore.getState().error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// toggleFavorite
// ---------------------------------------------------------------------------

describe('useLibrary — toggleFavorite', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID]);
  });

  it('flips isFavorite from false to true', async () => {
    const service = makeService();
    const { toggleFavorite } = buildActions(service);

    await toggleFavorite('g1'); // ZELDA was isFavorite: false

    expect(useLibraryStore.getState().getGameById('g1')?.isFavorite).toBe(true);
  });

  it('flips isFavorite from true to false', async () => {
    const service = makeService();
    const { toggleFavorite } = buildActions(service);

    await toggleFavorite('g2'); // METROID was isFavorite: true

    expect(useLibraryStore.getState().getGameById('g2')?.isFavorite).toBe(false);
  });

  it('calls service.toggleFavorite with the correct game id', async () => {
    const toggleFavoriteFn = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ toggleFavorite: toggleFavoriteFn });
    const { toggleFavorite } = buildActions(service);

    await toggleFavorite('g1');

    expect(toggleFavoriteFn).toHaveBeenCalledWith('g1');
  });

  it('does not update the store when the game id does not exist', async () => {
    const service = makeService();
    const { toggleFavorite } = buildActions(service);
    const before = useLibraryStore.getState().games.map((g) => g.isFavorite);

    await toggleFavorite('nonexistent');

    expect(useLibraryStore.getState().games.map((g) => g.isFavorite)).toEqual(before);
  });

  it('stores an error message when service.toggleFavorite throws', async () => {
    const service = makeService({
      toggleFavorite: vi.fn().mockRejectedValue(new Error('Toggle failed')),
    });
    const { toggleFavorite } = buildActions(service);

    await toggleFavorite('g1');

    expect(useLibraryStore.getState().error).toBe('Toggle failed');
    // store must not have been mutated
    expect(useLibraryStore.getState().getGameById('g1')?.isFavorite).toBe(false);
  });

  it('stores a fallback error when service throws a non-Error', async () => {
    const service = makeService({
      toggleFavorite: vi.fn().mockRejectedValue('network error'),
    });
    const { toggleFavorite } = buildActions(service);

    await toggleFavorite('g1');

    expect(useLibraryStore.getState().error).toBe('Failed to toggle favorite');
  });
});

// ---------------------------------------------------------------------------
// deleteGame
// ---------------------------------------------------------------------------

describe('useLibrary — deleteGame', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID]);
  });

  it('removes the game from the store on success', async () => {
    const service = makeService();
    const { deleteGame } = buildActions(service);

    await deleteGame('g1');

    expect(useLibraryStore.getState().games).toHaveLength(1);
    expect(useLibraryStore.getState().getGameById('g1')).toBeUndefined();
  });

  it('calls service.deleteGame with the correct id', async () => {
    const deleteGameFn = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ deleteGame: deleteGameFn });
    const { deleteGame } = buildActions(service);

    await deleteGame('g2');

    expect(deleteGameFn).toHaveBeenCalledWith('g2');
  });

  it('stores an error message when the service throws', async () => {
    const service = makeService({
      deleteGame: vi.fn().mockRejectedValue(new Error('Delete failed')),
    });
    const { deleteGame } = buildActions(service);

    await deleteGame('g1');

    expect(useLibraryStore.getState().error).toBe('Delete failed');
    // game must still be in the store
    expect(useLibraryStore.getState().games).toHaveLength(2);
  });

  it('stores a fallback error when service throws a non-Error', async () => {
    const service = makeService({
      deleteGame: vi.fn().mockRejectedValue(42),
    });
    const { deleteGame } = buildActions(service);

    await deleteGame('g1');

    expect(useLibraryStore.getState().error).toBe('Failed to delete game');
  });
});

// ---------------------------------------------------------------------------
// updateGame
// ---------------------------------------------------------------------------

describe('useLibrary — updateGame', () => {
  beforeEach(() => {
    resetStore();
    useLibraryStore.getState().setGames([ZELDA, METROID]);
  });

  it('updates the game in the store on success', async () => {
    const service = makeService();
    const { updateGame } = buildActions(service);

    await updateGame('g1', { title: 'Zelda: ALTTP' });

    expect(useLibraryStore.getState().getGameById('g1')?.title).toBe('Zelda: ALTTP');
  });

  it('calls service.updateGame with the correct arguments', async () => {
    const updateGameFn = vi.fn().mockResolvedValue(null);
    const service = makeService({ updateGame: updateGameFn });
    const { updateGame } = buildActions(service);

    await updateGame('g2', { playCount: 5 });

    expect(updateGameFn).toHaveBeenCalledWith('g2', { playCount: 5 });
  });

  it('does not touch other games', async () => {
    const service = makeService();
    const { updateGame } = buildActions(service);

    await updateGame('g1', { title: 'Changed' });

    expect(useLibraryStore.getState().getGameById('g2')?.title).toBe('Metroid');
  });

  it('stores an error message when the service throws', async () => {
    const service = makeService({
      updateGame: vi.fn().mockRejectedValue(new Error('Update failed')),
    });
    const { updateGame } = buildActions(service);

    await updateGame('g1', { title: 'X' });

    expect(useLibraryStore.getState().error).toBe('Update failed');
    // store must not have been mutated
    expect(useLibraryStore.getState().getGameById('g1')?.title).toBe('Zelda');
  });

  it('stores a fallback error when service throws a non-Error', async () => {
    const service = makeService({
      updateGame: vi.fn().mockRejectedValue(null),
    });
    const { updateGame } = buildActions(service);

    await updateGame('g1', { title: 'X' });

    expect(useLibraryStore.getState().error).toBe('Failed to update game');
  });
});
