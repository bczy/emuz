/**
 * WidgetService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { WidgetService } from '../services/WidgetService';
import type { DatabaseAdapter } from '@emuz/database';
import type { WidgetType } from '../models/Widget';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'mock-widget-uuid',
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
    transaction: vi.fn(<T>(fn: () => Promise<T>) => fn()),
  };
}

/**
 * Create a mock widget row
 */
function createMockWidgetRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'widget-1',
    type: 'recent_games',
    title: 'Recently Played',
    size: 'medium',
    position: 0,
    config: '{}',
    is_visible: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('WidgetService', () => {
  let service: WidgetService;
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    service = new WidgetService(mockAdapter);
  });

  describe('getWidgets', () => {
    it('should return all widgets ordered by position', async () => {
      const mockRows = [
        createMockWidgetRow({ id: 'widget-1', position: 0 }),
        createMockWidgetRow({ id: 'widget-2', position: 1, type: 'favorites' }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const widgets = await service.getWidgets();

      expect(widgets).toHaveLength(2);
      expect(widgets[0].id).toBe('widget-1');
      expect(widgets[0].position).toBe(0);
      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY position'),
        expect.any(Array)
      );
    });

    it('should filter visible widgets only', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.getWidgets({ visibleOnly: true });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('is_visible = 1'),
        expect.any(Array)
      );
    });

    it('should return empty array when no widgets', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const widgets = await service.getWidgets();

      expect(widgets).toHaveLength(0);
    });
  });

  describe('addWidget', () => {
    it('should create a new widget', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockWidgetRow({ id: 'mock-widget-uuid' }),
      ]);

      const widget = await service.addWidget({
        type: 'recent_games' as WidgetType,
        title: 'Recently Played',
        size: 'medium',
      });

      expect(widget).toBeDefined();
      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO widgets'),
        expect.any(Array)
      );
    });

    it('should assign correct position for new widget', async () => {
      mockAdapter.query.mockResolvedValueOnce([{ max_position: 3 }]);
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockWidgetRow({ position: 4 }),
      ]);

      await service.addWidget({
        type: 'stats' as WidgetType,
        title: 'Statistics',
        size: 'small',
      });

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([4]) // New position should be max + 1
      );
    });
  });

  describe('removeWidget', () => {
    it('should delete a widget', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.removeWidget('widget-1');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM widgets'),
        ['widget-1']
      );
    });

    it('should reorder remaining widgets', async () => {
      mockAdapter.execute
        .mockResolvedValueOnce(undefined) // delete
        .mockResolvedValueOnce(undefined); // reorder

      await service.removeWidget('widget-1');

      expect(mockAdapter.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('reorderWidgets', () => {
    it('should update widget positions', async () => {
      const newOrder = ['widget-3', 'widget-1', 'widget-2'];
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.reorderWidgets(newOrder);

      expect(mockAdapter.execute).toHaveBeenCalledTimes(3);
      expect(mockAdapter.execute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE widgets SET position'),
        expect.arrayContaining([0, 'widget-3'])
      );
    });

    it('should use transaction for atomic updates', async () => {
      const newOrder = ['widget-1', 'widget-2'];

      await service.reorderWidgets(newOrder);

      expect(mockAdapter.transaction).toHaveBeenCalled();
    });
  });

  describe('updateWidget', () => {
    it('should update widget properties', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockWidgetRow({ title: 'Updated Title' }),
      ]);

      const widget = await service.updateWidget('widget-1', {
        title: 'Updated Title',
      });

      expect(widget?.title).toBe('Updated Title');
      expect(mockAdapter.execute).toHaveBeenCalled();
    });

    it('should update widget visibility', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockWidgetRow({ is_visible: 0 }),
      ]);

      await service.updateWidget('widget-1', { isVisible: false });

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_visible'),
        expect.any(Array)
      );
    });
  });

  describe('getWidgetData', () => {
    describe('recent_games widget', () => {
      it('should return recently played games', async () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Recent Game',
            last_played_at: Date.now() / 1000,
          },
        ];
        mockAdapter.query.mockResolvedValueOnce(mockGames);

        const data = await service.getWidgetData('widget-1', 'recent_games');

        expect(data.games).toHaveLength(1);
        expect(mockAdapter.query).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY last_played_at DESC'),
          expect.any(Array)
        );
      });
    });

    describe('favorites widget', () => {
      it('should return favorite games', async () => {
        const mockGames = [
          { id: 'game-1', title: 'Favorite Game', is_favorite: 1 },
        ];
        mockAdapter.query.mockResolvedValueOnce(mockGames);

        const data = await service.getWidgetData('widget-1', 'favorites');

        expect(data.games).toHaveLength(1);
        expect(mockAdapter.query).toHaveBeenCalledWith(
          expect.stringContaining('is_favorite = 1'),
          expect.any(Array)
        );
      });
    });

    describe('stats widget', () => {
      it('should return library statistics', async () => {
        mockAdapter.query.mockResolvedValueOnce([
          {
            total_games: 150,
            total_platforms: 8,
            total_play_time: 86400,
            games_played: 50,
          },
        ]);

        const data = await service.getWidgetData('widget-1', 'stats');

        expect(data.stats).toEqual({
          totalGames: 150,
          totalPlatforms: 8,
          totalPlayTime: 86400,
          gamesPlayed: 50,
        });
      });
    });

    describe('platform_shortcuts widget', () => {
      it('should return platforms with game counts', async () => {
        const mockPlatforms = [
          { id: 'snes', name: 'SNES', game_count: 25 },
          { id: 'nes', name: 'NES', game_count: 15 },
        ];
        mockAdapter.query.mockResolvedValueOnce(mockPlatforms);

        const data = await service.getWidgetData('widget-1', 'platform_shortcuts');

        expect(data.platforms).toHaveLength(2);
      });
    });
  });

  describe('getDefaultWidgets', () => {
    it('should return default widget configuration', () => {
      const defaults = service.getDefaultWidgets();

      expect(defaults).toBeInstanceOf(Array);
      expect(defaults.length).toBeGreaterThan(0);
      expect(defaults[0]).toHaveProperty('type');
      expect(defaults[0]).toHaveProperty('title');
      expect(defaults[0]).toHaveProperty('size');
    });

    it('should include all standard widget types', () => {
      const defaults = service.getDefaultWidgets();
      const types = defaults.map((w) => w.type);

      expect(types).toContain('recent_games');
      expect(types).toContain('favorites');
      expect(types).toContain('stats');
    });
  });
});
