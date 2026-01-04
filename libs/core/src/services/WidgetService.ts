/**
 * WidgetService - Manages home screen widgets (Daijishou-inspired)
 */

import { v4 as uuidv4 } from 'uuid';
import type { Widget, WidgetType } from '../models/Widget';
import type { Game } from '../models/Game';
import type { DatabaseAdapter } from '@emuz/database';
import type { IWidgetService } from './types';

/**
 * Database row types
 */
interface WidgetRow {
  id: string;
  type: string;
  title: string | null;
  size: string;
  position: number;
  config: string | null;
  is_visible: number;
  created_at: number;
  updated_at: number;
}

interface GameRow {
  id: string;
  platform_id: string;
  title: string;
  file_path: string;
  file_name: string;
  cover_path: string | null;
  play_count: number;
  play_time: number;
  last_played_at: number | null;
  is_favorite: number;
}

/**
 * Widget data providers
 */
export interface WidgetDataProvider<T = unknown> {
  getData(widget: Widget): Promise<T>;
}

/**
 * Convert database row to Widget model
 */
function rowToWidget(row: WidgetRow): Widget {
  return {
    id: row.id,
    type: row.type as WidgetType,
    title: row.title ?? undefined,
    size: row.size as Widget['size'],
    position: row.position,
    config: row.config ? JSON.parse(row.config) : undefined,
    isVisible: Boolean(row.is_visible),
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
  };
}

/**
 * WidgetService implementation
 */
export class WidgetService implements IWidgetService {
  private dataProviders: Map<WidgetType, WidgetDataProvider> = new Map();

  constructor(private readonly db: DatabaseAdapter) {
    // Register default data providers
    this.registerDefaultProviders();
  }

  /**
   * Register default widget data providers
   */
  private registerDefaultProviders(): void {
    // Recent games provider
    this.dataProviders.set('recent-games', {
      getData: async (widget) => {
        const limit = (widget.config as { limit?: number })?.limit ?? 10;
        return this.getRecentGames(limit);
      },
    });

    // Favorites provider
    this.dataProviders.set('favorites', {
      getData: async (widget) => {
        const limit = (widget.config as { limit?: number })?.limit ?? 10;
        return this.getFavoriteGames(limit);
      },
    });

    // Stats provider
    this.dataProviders.set('stats', {
      getData: async () => this.getStats(),
    });

    // Continue playing provider
    this.dataProviders.set('continue-playing', {
      getData: async (widget) => {
        const limit = (widget.config as { limit?: number })?.limit ?? 5;
        return this.getContinuePlayingGames(limit);
      },
    });

    // Platform shortcuts provider
    this.dataProviders.set('platform-shortcuts', {
      getData: async () => this.getPlatformShortcuts(),
    });
  }

  /**
   * Get all widgets
   */
  async getWidgets(): Promise<Widget[]> {
    const rows = await this.db.query<WidgetRow>(
      'SELECT * FROM widgets ORDER BY position ASC'
    );
    return rows.map(rowToWidget);
  }

  /**
   * Get a widget by ID
   */
  async getWidgetById(id: string): Promise<Widget | null> {
    const rows = await this.db.query<WidgetRow>(
      'SELECT * FROM widgets WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rowToWidget(rows[0]) : null;
  }

  /**
   * Add a new widget
   */
  async addWidget(type: WidgetType, position?: number): Promise<Widget> {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    // Get max position if not specified
    let widgetPosition = position;
    if (widgetPosition === undefined) {
      const maxPosResult = await this.db.query<{ max_pos: number | null }>(
        'SELECT MAX(position) as max_pos FROM widgets'
      );
      widgetPosition = (maxPosResult[0]?.max_pos ?? -1) + 1;
    }

    await this.db.execute(
      `INSERT INTO widgets (id, type, size, position, is_visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, type, 'medium', widgetPosition, 1, now, now]
    );

    return {
      id,
      type,
      size: 'medium',
      position: widgetPosition,
      isVisible: true,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  /**
   * Remove a widget
   */
  async removeWidget(id: string): Promise<void> {
    await this.db.execute('DELETE FROM widgets WHERE id = ?', [id]);
  }

  /**
   * Update a widget
   */
  async updateWidget(id: string, data: Partial<Widget>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title ?? null);
    }
    if (data.size !== undefined) {
      updates.push('size = ?');
      params.push(data.size);
    }
    if (data.position !== undefined) {
      updates.push('position = ?');
      params.push(data.position);
    }
    if (data.config !== undefined) {
      updates.push('config = ?');
      params.push(data.config ? JSON.stringify(data.config) : null);
    }
    if (data.isVisible !== undefined) {
      updates.push('is_visible = ?');
      params.push(data.isVisible ? 1 : 0);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = ?');
    params.push(Math.floor(Date.now() / 1000));
    params.push(id);

    await this.db.execute(
      `UPDATE widgets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Reorder widgets
   */
  async reorderWidgets(widgetIds: string[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < widgetIds.length; i++) {
      await this.db.execute(
        'UPDATE widgets SET position = ?, updated_at = ? WHERE id = ?',
        [i, now, widgetIds[i]]
      );
    }
  }

  /**
   * Get data for a widget
   */
  async getWidgetData(widget: Widget): Promise<unknown> {
    const provider = this.dataProviders.get(widget.type);
    if (!provider) {
      return null;
    }
    return provider.getData(widget);
  }

  /**
   * Register a custom data provider
   */
  registerDataProvider(type: WidgetType, provider: WidgetDataProvider): void {
    this.dataProviders.set(type, provider);
  }

  /**
   * Get recent games
   */
  private async getRecentGames(limit: number): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games 
       WHERE last_played_at IS NOT NULL 
       ORDER BY last_played_at DESC 
       LIMIT ?`,
      [limit]
    );
    return rows.map(this.rowToGame);
  }

  /**
   * Get favorite games
   */
  private async getFavoriteGames(limit: number): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games 
       WHERE is_favorite = 1 
       ORDER BY title ASC 
       LIMIT ?`,
      [limit]
    );
    return rows.map(this.rowToGame);
  }

  /**
   * Get games to continue playing (recently played but not finished)
   */
  private async getContinuePlayingGames(limit: number): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games 
       WHERE last_played_at IS NOT NULL AND play_time > 0
       ORDER BY last_played_at DESC 
       LIMIT ?`,
      [limit]
    );
    return rows.map(this.rowToGame);
  }

  /**
   * Get library stats
   */
  private async getStats(): Promise<{
    totalGames: number;
    totalPlayTime: number;
    totalPlatforms: number;
    favoriteCount: number;
  }> {
    const [gamesResult, playTimeResult, platformsResult, favoritesResult] = await Promise.all([
      this.db.query<{ count: number }>('SELECT COUNT(*) as count FROM games'),
      this.db.query<{ total: number }>('SELECT SUM(play_time) as total FROM games'),
      this.db.query<{ count: number }>(
        'SELECT COUNT(DISTINCT platform_id) as count FROM games'
      ),
      this.db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM games WHERE is_favorite = 1'
      ),
    ]);

    return {
      totalGames: gamesResult[0]?.count ?? 0,
      totalPlayTime: playTimeResult[0]?.total ?? 0,
      totalPlatforms: platformsResult[0]?.count ?? 0,
      favoriteCount: favoritesResult[0]?.count ?? 0,
    };
  }

  /**
   * Get platform shortcuts
   */
  private async getPlatformShortcuts(): Promise<
    Array<{ id: string; name: string; gameCount: number; iconPath?: string }>
  > {
    interface PlatformRow {
      id: string;
      name: string;
      icon_path: string | null;
      game_count: number;
    }

    const rows = await this.db.query<PlatformRow>(
      `SELECT p.id, p.name, p.icon_path,
              (SELECT COUNT(*) FROM games g WHERE g.platform_id = p.id) as game_count
       FROM platforms p
       HAVING game_count > 0
       ORDER BY game_count DESC
       LIMIT 10`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      gameCount: row.game_count,
      iconPath: row.icon_path ?? undefined,
    }));
  }

  /**
   * Convert database row to Game model
   */
  private rowToGame(row: GameRow): Game {
    return {
      id: row.id,
      platformId: row.platform_id,
      title: row.title,
      filePath: row.file_path,
      fileName: row.file_name,
      coverPath: row.cover_path ?? undefined,
      playCount: row.play_count,
      playTime: row.play_time,
      lastPlayedAt: row.last_played_at ? new Date(row.last_played_at * 1000) : undefined,
      isFavorite: Boolean(row.is_favorite),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Create a new WidgetService instance
 */
export function createWidgetService(db: DatabaseAdapter): IWidgetService {
  return new WidgetService(db);
}
