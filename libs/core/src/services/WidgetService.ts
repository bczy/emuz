/**
 * WidgetService - Manages home screen widgets (Daijishou-inspired)
 *
 * Migrated to use @emuz/storage flat-file engine (FlatDb).
 * No drizzle-orm dependency — aggregations and position compaction
 * are handled with plain array operations.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Widget, WidgetType } from '../models/Widget';
import type { FlatDb, WidgetRow } from '@emuz/storage';
import type { IWidgetService } from './types';

/**
 * Convert a flat-file WidgetRow to the Widget model
 */
function rowToWidget(row: WidgetRow): Widget {
  return {
    id: row.id,
    type: row.type as WidgetType,
    title: row.title ?? undefined,
    size: row.size as Widget['size'],
    position: row.position,
    config: row.config ?? undefined,
    isVisible: row.is_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * WidgetService implementation using the @emuz/storage flat-file engine
 */
export class WidgetService implements IWidgetService {
  constructor(private readonly db: FlatDb) {}

  async getWidgets(options?: { visibleOnly?: boolean }): Promise<Widget[]> {
    const all = this.db.widgets.all().sort((a, b) => a.position - b.position);
    if (options?.visibleOnly) {
      return all.filter((w) => w.is_visible).map(rowToWidget);
    }
    return all.map(rowToWidget);
  }

  async getWidgetById(id: string): Promise<Widget | null> {
    const row = this.db.widgets.findById(id);
    return row ? rowToWidget(row) : null;
  }

  async addWidget(config: { type: WidgetType; title?: string; size?: string }): Promise<Widget> {
    const id = uuidv4();
    const now = new Date();
    const size = config.size ?? 'medium';

    const maxPos = this.db.widgets.all().reduce((m, w) => Math.max(m, w.position), -1);
    const position = maxPos + 1;

    const row: WidgetRow = {
      id,
      type: config.type,
      title: config.title ?? null,
      size,
      position,
      config: null,
      is_visible: true,
      created_at: now,
      updated_at: now,
    };

    this.db.widgets.insert(row);
    await this.db.flush();

    return rowToWidget(row);
  }

  async removeWidget(id: string): Promise<void> {
    this.db.widgets.delete(id);
    const ordered = this.db.widgets.all().sort((a, b) => a.position - b.position);
    for (let i = 0; i < ordered.length; i++) {
      this.db.widgets.update(ordered[i].id, { position: i });
    }
    await this.db.flush();
  }

  async updateWidget(id: string, data: Partial<Widget>): Promise<Widget | null> {
    const now = new Date();
    const patch: Partial<WidgetRow> = { updated_at: now };

    if (data.title !== undefined) patch.title = data.title ?? null;
    if (data.size !== undefined) patch.size = data.size;
    if (data.position !== undefined) patch.position = data.position;
    if (data.config !== undefined) patch.config = data.config ?? null;
    if (data.isVisible !== undefined) patch.is_visible = data.isVisible;

    if (Object.keys(patch).length === 1) return this.getWidgetById(id); // only updated_at

    this.db.widgets.update(id, patch);
    await this.db.flush();
    return this.getWidgetById(id);
  }

  async reorderWidgets(widgetIds: string[]): Promise<void> {
    const now = new Date();
    for (let i = 0; i < widgetIds.length; i++) {
      this.db.widgets.update(widgetIds[i], { position: i, updated_at: now });
    }
    await this.db.flush();
  }

  async getWidgetData(_id: string, type: WidgetType): Promise<unknown> {
    switch (type) {
      case 'recent_games': {
        const games = this.db.games
          .find((g) => g.last_played_at != null)
          .sort((a, b) => (b.last_played_at?.getTime() ?? 0) - (a.last_played_at?.getTime() ?? 0))
          .slice(0, 10);
        return { games };
      }

      case 'favorites': {
        const games = this.db.games.find((g) => g.is_favorite);
        return { games };
      }

      case 'stats': {
        const allGames = this.db.games.all();
        const platformIds = new Set(allGames.map((g) => g.platform_id));
        return {
          stats: {
            totalGames: allGames.length,
            totalPlatforms: platformIds.size,
            totalPlayTime: allGames.reduce((s, g) => s + g.play_time, 0),
            gamesPlayed: allGames.filter((g) => g.play_count > 0).length,
          },
        };
      }

      case 'platform_shortcuts': {
        const countByPlatform = new Map<string, number>();
        for (const g of this.db.games.all()) {
          countByPlatform.set(g.platform_id, (countByPlatform.get(g.platform_id) ?? 0) + 1);
        }
        const platforms = this.db.platforms
          .all()
          .map((p) => ({ ...p, gameCount: countByPlatform.get(p.id) ?? 0 }))
          .filter((p) => p.gameCount > 0)
          .sort((a, b) => b.gameCount - a.gameCount)
          .slice(0, 10);
        return { platforms };
      }

      case 'continue_playing': {
        const games = this.db.games
          .find((g) => g.last_played_at != null && g.play_time > 0)
          .sort((a, b) => (b.last_played_at?.getTime() ?? 0) - (a.last_played_at?.getTime() ?? 0));
        return { games };
      }

      default:
        return null;
    }
  }

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
export function createWidgetService(db: FlatDb): IWidgetService {
  return new WidgetService(db);
}
