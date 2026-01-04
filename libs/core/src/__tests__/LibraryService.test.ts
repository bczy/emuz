/**
 * LibraryService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { LibraryService } from '../LibraryService';
import type { DatabaseAdapter } from '@emuz/database';
import type { Game } from '../../models/Game';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234',
}));

/**
 * Create a mock database adapter
 */
function createMockAdapter(): DatabaseAdapter & {
  query: Mock;
  execute: Mock;
} {
  return {
    open: vi.fn(),
    close: vi.fn(),
    isConnected: vi.fn(() => true),
    execute: vi.fn(),
    query: vi.fn(),
    transaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  };
}

/**
 * Create a mock game row (database format)
 */
function createMockGameRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'game-1',
    platform_id: 'platform-1',
    title: 'Test Game',
    file_path: '/games/test.rom',
    file_name: 'test.rom',
    file_size: 1024,
    file_hash: 'abc123',
    cover_path: '/covers/test.jpg',
    description: 'A test game',
    developer: 'Test Dev',
    publisher: 'Test Publisher',
    release_date: '2024-01-01',
    genre: 'Action',
    rating: 4.5,
    play_count: 10,
    play_time: 3600,
    last_played_at: Math.floor(Date.now() / 1000),
    is_favorite: 0,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('LibraryService', () => {
  let service: LibraryService;
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    service = new LibraryService(mockAdapter);
  });

  describe('getAllGames', () => {
    it('should return all games with pagination', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', title: 'Game 1' }),
        createMockGameRow({ id: 'game-2', title: 'Game 2' }),
      ];

      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const games = await service.getAllGames({ page: 1, limit: 10 });

      expect(games).toHaveLength(2);
      expect(games[0].id).toBe('game-1');
      expect(games[0].title).toBe('Game 1');
      expect(games[1].id).toBe('game-2');
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining([10, 0])
      );
    });

    it('should handle empty results', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const games = await service.getAllGames();

      expect(games).toHaveLength(0);
    });

    it('should apply default pagination', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.getAllGames();

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20, 0]) // Default limit 20, offset 0
      );
    });
  });

  describe('getGameById', () => {
    it('should return a game by ID', async () => {
      const mockRow = createMockGameRow({ id: 'game-123' });
      mockAdapter.query.mockResolvedValueOnce([mockRow]);

      const game = await service.getGameById('game-123');

      expect(game).toBeDefined();
      expect(game?.id).toBe('game-123');
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        ['game-123']
      );
    });

    it('should return null for non-existent game', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const game = await service.getGameById('non-existent');

      expect(game).toBeNull();
    });
  });

  describe('getGamesByPlatform', () => {
    it('should return games filtered by platform', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', platform_id: 'snes' }),
        createMockGameRow({ id: 'game-2', platform_id: 'snes' }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const games = await service.getGamesByPlatform('snes');

      expect(games).toHaveLength(2);
      expect(games[0].platformId).toBe('snes');
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE platform_id = ?'),
        expect.arrayContaining(['snes'])
      );
    });
  });

  describe('searchGames', () => {
    it('should search games by title', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', title: 'Mario Kart' }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const games = await service.searchGames({ query: 'Mario' });

      expect(games).toHaveLength(1);
      expect(games[0].title).toBe('Mario Kart');
    });

    it('should search games by platform', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.searchGames({ query: '', platformId: 'nes' });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('platform_id = ?'),
        expect.arrayContaining(['nes'])
      );
    });

    it('should search games by genre', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.searchGames({ query: '', genre: 'RPG' });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('genre = ?'),
        expect.arrayContaining(['RPG'])
      );
    });
  });

  describe('updateGame', () => {
    it('should update game fields', async () => {
      const updates: Partial<Game> = {
        title: 'Updated Title',
        description: 'New description',
      };

      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockGameRow({ id: 'game-1', title: 'Updated Title' }),
      ]);

      const game = await service.updateGame('game-1', updates);

      expect(mockAdapter.execute).toHaveBeenCalled();
      expect(game?.title).toBe('Updated Title');
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.deleteGame('game-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM games'),
        ['game-1']
      );
    });
  });

  describe('favorites', () => {
    it('should add game to favorites', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.addToFavorites('game-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_favorite = 1'),
        expect.arrayContaining(['game-1'])
      );
    });

    it('should remove game from favorites', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.removeFromFavorites('game-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_favorite = 0'),
        expect.arrayContaining(['game-1'])
      );
    });

    it('should get all favorites', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', is_favorite: 1 }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const favorites = await service.getFavorites();

      expect(favorites).toHaveLength(1);
      expect(favorites[0].isFavorite).toBe(true);
    });
  });

  describe('collections', () => {
    const mockCollectionRow = {
      id: 'collection-1',
      name: 'My Collection',
      description: 'A test collection',
      cover_path: null,
      is_system: 0,
      sort_order: 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    it('should get all collections', async () => {
      mockAdapter.query
        .mockResolvedValueOnce([mockCollectionRow])
        .mockResolvedValueOnce([{ game_id: 'game-1' }]);

      const collections = await service.getCollections();

      expect(collections).toHaveLength(1);
      expect(collections[0].name).toBe('My Collection');
    });

    it('should create a collection', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query
        .mockResolvedValueOnce([{ ...mockCollectionRow, id: 'mock-uuid-1234' }])
        .mockResolvedValueOnce([]);

      const collection = await service.createCollection({
        name: 'New Collection',
        description: 'Description',
      });

      expect(collection).toBeDefined();
      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO collections'),
        expect.any(Array)
      );
    });

    it('should add game to collection', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.addToCollection('collection-1', 'game-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.arrayContaining(['collection-1', 'game-1'])
      );
    });

    it('should remove game from collection', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.removeFromCollection('collection-1', 'game-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        expect.arrayContaining(['collection-1', 'game-1'])
      );
    });

    it('should delete a collection', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.deleteCollection('collection-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM collections'),
        ['collection-1']
      );
    });
  });

  describe('play tracking', () => {
    it('should record play session', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.recordPlaySession('game-1', 3600);

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('play_count = play_count + 1'),
        expect.arrayContaining([3600, 'game-1'])
      );
    });

    it('should get recently played games', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', last_played_at: Date.now() / 1000 }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const games = await service.getRecentlyPlayed(5);

      expect(games).toHaveLength(1);
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY last_played_at DESC'),
        [5]
      );
    });
  });
});
