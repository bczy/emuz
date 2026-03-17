/**
 * WidgetService - Manages home screen widgets (Daijishou-inspired)
 */

import { v4 as uuidv4 } from 'uuid';
import type { Widget, WidgetType } from '../models/Widget';
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
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all widgets, optionally filtered to visible only
   */
  async getWidgets(options?: { visibleOnly?: boolean }): Promise<Widget[]> {
    if (options?.visibleOnly) {
      const rows = await this.db.query<WidgetRow>(
        'SELECT * FROM widgets WHERE is_visible = 1 ORDER BY position ASC',
        []
      );
      return rows.map(rowToWidget);
    }

    const rows = await this.db.query<WidgetRow>(
      'SELECT * FROM widgets ORDER BY position ASC',
      []
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
   *
   * Query order: MAX(position) query → INSERT execute → SELECT widget query
   */
  async addWidget(config: { type: WidgetType; title?: string; size?: string }): Promise<Widget> {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const size = config.size ?? 'medium';

    // Get max position
    const maxPosResult = await this.db.query<{ max_position: number | null }>(
      'SELECT MAX(position) as max_position FROM widgets'
    );
    const position = ((maxPosResult ?? [])[0]?.max_position ?? -1) + 1;

    await this.db.execute(
      `INSERT INTO widgets (id, type, title, size, position, is_visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, config.type, config.title ?? null, size, position, 1, now, now]
    );

    // Fetch the newly created widget
    const rows = await this.db.query<WidgetRow>(
      'SELECT * FROM widgets WHERE id = ?',
      [id]
    );

    if (rows && rows.length > 0) {
      return rowToWidget(rows[0]);
    }

    return {
      id,
      type: config.type,
      title: config.title,
      size: size as Widget['size'],
      position,
      isVisible: true,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  /**
   * Remove a widget and reorder remaining widgets
   */
  async removeWidget(id: string): Promise<void> {
    await this.db.execute('DELETE FROM widgets WHERE id = ?', [id]);

    // Reorder remaining widgets to fill gaps
    await this.db.execute(
      `UPDATE widgets SET position = (SELECT COUNT(*) FROM widgets w2 WHERE w2.position < widgets.position)`,
      []
    );
  }

  /**
   * Update a widget and return the updated record
   */
  async updateWidget(id: string, data: Partial<Widget>): Promise<Widget | null> {
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

    if (updates.length === 0) return this.getWidgetById(id);

    updates.push('updated_at = ?');
    params.push(Math.floor(Date.now() / 1000));
    params.push(id);

    await this.db.execute(
      `UPDATE widgets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getWidgetById(id);
  }

  /**
   * Reorder widgets atomically
   */
  async reorderWidgets(widgetIds: string[]): Promise<void> {
    await this.db.transaction(async () => {
      const now = Math.floor(Date.now() / 1000);
      for (let i = 0; i < widgetIds.length; i++) {
        await this.db.execute(
          'UPDATE widgets SET position = ?, updated_at = ? WHERE id = ?',
          [i, now, widgetIds[i]]
        );
      }
    });
  }

  /**
   * Get data for a widget by ID and type.
   * The _id parameter is part of the interface but not needed for current data providers.
   */
   
  async getWidgetData(_id: string, type: WidgetType): Promise<unknown> {
    switch (type) {
      case 'recent_games': {
        const rows = await this.db.query<{ id: string; title: string; last_played_at: number | null }>(
          `SELECT * FROM games WHERE last_played_at IS NOT NULL ORDER BY last_played_at DESC LIMIT 10`,
          []
        );
        return { games: rows };
      }

      case 'favorites': {
        const rows = await this.db.query<{ id: string; title: string; is_favorite: number }>(
          `SELECT * FROM games WHERE is_favorite = 1 ORDER BY title ASC LIMIT 10`,
          []
        );
        return { games: rows };
      }

      case 'stats': {
        const rows = await this.db.query<{
          total_games: number;
          total_platforms: number;
          total_play_time: number;
          games_played: number;
        }>(
          `SELECT
             COUNT(*) as total_games,
             COUNT(DISTINCT platform_id) as total_platforms,
             SUM(play_time) as total_play_time,
             COUNT(CASE WHEN play_count > 0 THEN 1 END) as games_played
           FROM games`,
          []
        );
        const row = rows[0];
        return {
          stats: {
            totalGames: row?.total_games ?? 0,
            totalPlatforms: row?.total_platforms ?? 0,
            totalPlayTime: row?.total_play_time ?? 0,
            gamesPlayed: row?.games_played ?? 0,
          },
        };
      }

      case 'platform_shortcuts': {
        const rows = await this.db.query<{ id: string; name: string; game_count: number }>(
          `SELECT p.id, p.name, COUNT(g.id) as game_count FROM platforms p LEFT JOIN games g ON g.platform_id = p.id GROUP BY p.id HAVING game_count > 0 ORDER BY game_count DESC LIMIT 10`,
          []
        );
        return { platforms: rows };
      }

      case 'continue_playing': {
        const rows = await this.db.query<{ id: string; title: string }>(
          `SELECT * FROM games WHERE last_played_at IS NOT NULL AND play_time > 0 ORDER BY last_played_at DESC LIMIT 5`,
          []
        );
        return { games: rows };
      }

      default:
        return null;
    }
  }

  /**
   * Get default widget configuration
   */
  getDefaultWidgets(): Array<{ type: WidgetType; title?: string; size?: string }> {
    return [
      { type: 'continue_playing', title: 'Continue Playing', size: 'large' },
      { type: 'recent_games', title: 'Recently Played', size: 'medium' },
      { type: 'favorites', title: 'Favorites', size: 'medium' },
      { type: 'stats', title: 'Library Stats', size: 'small' },
      { type: 'platform_shortcuts', title: 'Platforms', size: 'medium' },
    ];
  }
}

/**
 * Create a new WidgetService instance
 */
export function createWidgetService(db: DatabaseAdapter): IWidgetService {
  return new WidgetService(db);
}
