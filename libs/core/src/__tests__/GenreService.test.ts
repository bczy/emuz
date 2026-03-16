/**
 * GenreService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { GenreService } from '../services/GenreService';
import type { DatabaseAdapter } from '@emuz/database';

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
    transaction: vi.fn(<T>(fn: () => Promise<T>) => fn()),
  };
}

/**
 * Create mock game row for genre queries
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
    cover_path: null,
    description: null,
    developer: null,
    publisher: null,
    release_date: null,
    genre: 'Action',
    rating: null,
    play_count: 0,
    play_time: 0,
    last_played_at: null,
    is_favorite: 0,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('GenreService', () => {
  let service: GenreService;
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    service = new GenreService(mockAdapter);
  });

  describe('getGenres', () => {
    it('should return all unique genres with counts', async () => {
      const mockGenres = [
        { genre: 'Action', count: 15 },
        { genre: 'RPG', count: 10 },
        { genre: 'Puzzle', count: 5 },
      ];
      mockAdapter.query.mockResolvedValueOnce(mockGenres);

      const genres = await service.getGenres();

      expect(genres).toHaveLength(3);
      expect(genres[0]).toEqual({
        id: 'action',
        name: 'Action',
        gameCount: 15,
      });
      expect(genres[1]).toEqual({
        id: 'rpg',
        name: 'RPG',
        gameCount: 10,
      });
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT genre'),
        expect.any(Array)
      );
    });

    it('should filter out null genres', async () => {
      const mockGenres = [
        { genre: 'Action', count: 15 },
        { genre: null, count: 3 },
      ];
      mockAdapter.query.mockResolvedValueOnce(mockGenres);

      const genres = await service.getGenres();

      expect(genres).toHaveLength(1);
      expect(genres[0].name).toBe('Action');
    });

    it('should return empty array when no genres', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const genres = await service.getGenres();

      expect(genres).toHaveLength(0);
    });
  });

  describe('getGamesByGenre', () => {
    it('should return games filtered by genre', async () => {
      const mockRows = [
        createMockGameRow({ id: 'game-1', title: 'Action Game 1', genre: 'Action' }),
        createMockGameRow({ id: 'game-2', title: 'Action Game 2', genre: 'Action' }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const games = await service.getGamesByGenre('Action');

      expect(games).toHaveLength(2);
      expect(games[0].genre).toBe('Action');
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE genre = ?'),
        expect.arrayContaining(['Action'])
      );
    });

    it('should return empty array for unknown genre', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const games = await service.getGamesByGenre('Unknown');

      expect(games).toHaveLength(0);
    });

    it('should handle pagination', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.getGamesByGenre('Action', { page: 2, limit: 10 });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Action', 10, 10]) // limit 10, offset 10
      );
    });
  });

  describe('assignGenre', () => {
    it('should update game genre', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.assignGenre('game-1', 'RPG');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE games SET genre = ?'),
        expect.arrayContaining(['RPG', 'game-1'])
      );
    });

    it('should allow clearing genre with null', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.assignGenre('game-1', null);

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null, 'game-1'])
      );
    });
  });

  describe('getGenreStats', () => {
    it('should return statistics for a genre', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        {
          total_games: 25,
          total_play_time: 36000,
          avg_rating: 4.2,
        },
      ]);

      const stats = await service.getGenreStats('Action');

      expect(stats).toEqual({
        totalGames: 25,
        totalPlayTime: 36000,
        averageRating: 4.2,
      });
    });

    it('should return zero stats for empty genre', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        {
          total_games: 0,
          total_play_time: 0,
          avg_rating: null,
        },
      ]);

      const stats = await service.getGenreStats('Unknown');

      expect(stats).toEqual({
        totalGames: 0,
        totalPlayTime: 0,
        averageRating: 0,
      });
    });
  });

  describe('extractGenreFromMetadata', () => {
    it('should extract common genres', () => {
      expect(service.extractGenreFromMetadata('Action RPG')).toBe('Action RPG');
      expect(service.extractGenreFromMetadata('Platform')).toBe('Platform');
      expect(service.extractGenreFromMetadata('Puzzle / Strategy')).toBe('Puzzle');
    });

    it('should handle empty metadata', () => {
      expect(service.extractGenreFromMetadata('')).toBeNull();
      expect(service.extractGenreFromMetadata(null as unknown as string)).toBeNull();
    });

    it('should normalize genre names', () => {
      expect(service.extractGenreFromMetadata('action')).toBe('Action');
      expect(service.extractGenreFromMetadata('PLATFORMER')).toBe('Platformer');
      expect(service.extractGenreFromMetadata('  rpg  ')).toBe('RPG');
    });
  });
});
