/**
 * WidgetService - Manages home screen widgets (Daijishou-inspired)
 *
 * Refactored to use Drizzle ORM query builder (Story 1.7 / ADR-013).
 * No raw SQL strings — except one intentional escape-hatch (see removeWidget).
 */

import { v4 as uuidv4 } from 'uuid';
import { eq, asc, max, sql, and, count, sum, isNotNull } from 'drizzle-orm';
import type { Widget, WidgetType } from '../models/Widget';
import type { DrizzleDb } from '@emuz/database/schema';
import { widgets, games, platforms } from '@emuz/database/schema';
import type { IWidgetService } from './types';

type WidgetRow = typeof widgets.$inferSelect;

/**
 * Convert Drizzle row to Widget model
 */
function rowToWidget(row: WidgetRow): Widget {
  return {
    id: row.id,
    type: row.type as WidgetType,
    title: row.title ?? undefined,
    size: row.size as Widget['size'],
    position: row.position,
    config: row.config ?? undefined,
    isVisible: row.isVisible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * WidgetService implementation using Drizzle ORM
 */
export class WidgetService implements IWidgetService {
  constructor(private readonly db: DrizzleDb) {}

  async getWidgets(options?: { visibleOnly?: boolean }): Promise<Widget[]> {
    if (options?.visibleOnly) {
      const rows = await this.db
        .select()
        .from(widgets)
        .where(eq(widgets.isVisible, true))
        .orderBy(asc(widgets.position));
      return rows.map(rowToWidget);
    }

    const rows = await this.db.select().from(widgets).orderBy(asc(widgets.position));
    return rows.map(rowToWidget);
  }

  async getWidgetById(id: string): Promise<Widget | null> {
    const rows = await this.db.select().from(widgets).where(eq(widgets.id, id));
    return rows.length > 0 ? rowToWidget(rows[0]) : null;
  }

  async addWidget(config: { type: WidgetType; title?: string; size?: string }): Promise<Widget> {
    const id = uuidv4();
    const now = new Date();
    const size = config.size ?? 'medium';

    const maxPosResult = await this.db.select({ maxPosition: max(widgets.position) }).from(widgets);
    const position = (maxPosResult[0]?.maxPosition ?? -1) + 1;

    await this.db.insert(widgets).values({
      id,
      type: config.type,
      title: config.title ?? null,
      size,
      position,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });

    const rows = await this.db.select().from(widgets).where(eq(widgets.id, id));
    if (rows.length > 0) {
      return rowToWidget(rows[0]);
    }

    return {
      id,
      type: config.type,
      title: config.title,
      size: size as Widget['size'],
      position,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async removeWidget(id: string): Promise<void> {
    await this.db.delete(widgets).where(eq(widgets.id, id));

    // drizzle-escape-hatch: correlated subquery not expressible in Drizzle query builder.
    // Reorders remaining widgets to fill gaps after deletion.
    this.db.run(
      sql`UPDATE widgets SET position = (SELECT COUNT(*) FROM widgets w2 WHERE w2.position < widgets.position)`
    );
  }

  async updateWidget(id: string, data: Partial<Widget>): Promise<Widget | null> {
    const now = new Date();
    const updates: Partial<typeof widgets.$inferInsert> = { updatedAt: now };

    if (data.title !== undefined) updates.title = data.title ?? null;
    if (data.size !== undefined) updates.size = data.size;
    if (data.position !== undefined) updates.position = data.position;
    if (data.config !== undefined) updates.config = data.config ?? null;
    if (data.isVisible !== undefined) updates.isVisible = data.isVisible;

    if (Object.keys(updates).length === 1) return this.getWidgetById(id); // only updatedAt

    await this.db.update(widgets).set(updates).where(eq(widgets.id, id));
    return this.getWidgetById(id);
  }

  async reorderWidgets(widgetIds: string[]): Promise<void> {
    const now = new Date();
    this.db.transaction((tx) => {
      for (let i = 0; i < widgetIds.length; i++) {
        tx.update(widgets)
          .set({ position: i, updatedAt: now })
          .where(eq(widgets.id, widgetIds[i]))
          .run();
      }
    });
  }

  async getWidgetData(_id: string, type: WidgetType): Promise<unknown> {
    switch (type) {
      case 'recent_games': {
        const rows = await this.db
          .select()
          .from(games)
          .where(isNotNull(games.lastPlayedAt))
          .orderBy(sql`${games.lastPlayedAt} DESC`)
          .limit(10);
        return { games: rows };
      }

      case 'favorites': {
        const rows = await this.db
          .select()
          .from(games)
          .where(eq(games.isFavorite, true))
          .orderBy(asc(games.title))
          .limit(10);
        return { games: rows };
      }

      case 'stats': {
        const rows = await this.db
          .select({
            totalGames: count(),
            totalPlatforms: count(games.platformId),
            totalPlayTime: sum(games.playTime),
          })
          .from(games);
        const playedRows = await this.db
          .select({ gamesPlayed: count() })
          .from(games)
          .where(sql`${games.playCount} > 0`);
        const platformRows = await this.db
          .selectDistinct({ platformId: games.platformId })
          .from(games);
        const row = rows[0];
        return {
          stats: {
            totalGames: row?.totalGames ?? 0,
            totalPlatforms: platformRows.length,
            totalPlayTime: Number(row?.totalPlayTime ?? 0),
            gamesPlayed: playedRows[0]?.gamesPlayed ?? 0,
          },
        };
      }

      case 'platform_shortcuts': {
        const rows = await this.db
          .select({
            id: platforms.id,
            name: platforms.name,
            gameCount: count(games.id),
          })
          .from(platforms)
          .leftJoin(games, eq(games.platformId, platforms.id))
          .groupBy(platforms.id)
          .having(sql`COUNT(${games.id}) > 0`)
          .orderBy(sql`COUNT(${games.id}) DESC`)
          .limit(10);
        return { platforms: rows };
      }

      case 'continue_playing': {
        const rows = await this.db
          .select()
          .from(games)
          .where(and(isNotNull(games.lastPlayedAt), sql`${games.playTime} > 0`))
          .orderBy(sql`${games.lastPlayedAt} DESC`)
          .limit(5);
        return { games: rows };
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
export function createWidgetService(db: DrizzleDb): IWidgetService {
  return new WidgetService(db);
}
