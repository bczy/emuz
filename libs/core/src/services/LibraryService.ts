/**
 * LibraryService - Manages the game library, collections, and favorites
 *
 * Refactored to use Drizzle ORM query builder (Story 1.7 / ADR-013).
 * No raw SQL strings.
 */

import { v4 as uuidv4 } from 'uuid';
import { eq, desc, asc, like, and, isNotNull, max, count, sql } from 'drizzle-orm';
import type { Game } from '../models/Game';
import type { Collection } from '../models/Collection';
import type { DrizzleDb } from '@emuz/database/schema';
import { games, collections, collectionGames } from '@emuz/database/schema';
import type { ILibraryService, PaginationOptions, CreateCollectionInput } from './types';

type GameRow = typeof games.$inferSelect;
type CollectionRow = typeof collections.$inferSelect;

/**
 * Convert Drizzle row to Game model
 */
function rowToGame(row: GameRow): Game {
  return {
    id: row.id,
    platformId: row.platformId,
    title: row.title,
    filePath: row.filePath,
    fileName: row.fileName,
    fileSize: row.fileSize ?? undefined,
    fileHash: row.fileHash ?? undefined,
    coverPath: row.coverPath ?? undefined,
    description: row.description ?? undefined,
    developer: row.developer ?? undefined,
    publisher: row.publisher ?? undefined,
    releaseDate: row.releaseDate ?? undefined,
    genre: row.genre ?? undefined,
    rating: row.rating ?? undefined,
    playCount: row.playCount,
    playTime: row.playTime,
    lastPlayedAt: row.lastPlayedAt ?? undefined,
    isFavorite: row.isFavorite,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Convert Drizzle row to Collection model
 */
function rowToCollection(row: CollectionRow, gameIds: string[] = []): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    coverPath: row.coverPath ?? undefined,
    gameIds,
    isSystem: row.isSystem,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Escape SQL LIKE wildcards in user-supplied strings.
 */
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&');
}

/**
 * LibraryService implementation using Drizzle ORM
 */
export class LibraryService implements ILibraryService {
  constructor(private readonly db: DrizzleDb) {}

  async getAllGames(options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 20;
    const offset =
      options?.page !== undefined ? (options.page - 1) * limit : (options?.offset ?? 0);

    const rows = await this.db
      .select()
      .from(games)
      .orderBy(asc(games.title))
      .limit(limit)
      .offset(offset);

    return rows.map(rowToGame);
  }

  async getGameById(id: string): Promise<Game | null> {
    const rows = await this.db.select().from(games).where(eq(games.id, id));
    return rows.length > 0 ? rowToGame(rows[0]) : null;
  }

  async getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const rows = await this.db
      .select()
      .from(games)
      .where(eq(games.platformId, platformId))
      .orderBy(asc(games.title))
      .limit(limit)
      .offset(offset);

    return rows.map(rowToGame);
  }

  async searchGames(
    options: { query?: string; platformId?: string; genre?: string } | string
  ): Promise<Game[]> {
    const opts = typeof options === 'string' ? { query: options } : options;
    const query = escapeLike(opts.query ?? '');

    const conditions = [like(games.title, `%${query}%`)];

    if (opts.platformId) {
      conditions.push(eq(games.platformId, opts.platformId));
    }
    const genreFilter = (opts as { genre?: string }).genre;
    if (genreFilter) {
      conditions.push(eq(games.genre, genreFilter));
    }

    const rows = await this.db
      .select()
      .from(games)
      .where(and(...conditions))
      .orderBy(asc(games.title));

    return rows.map(rowToGame);
  }

  async updateGame(id: string, data: Partial<Game>): Promise<Game | null> {
    const now = new Date();
    const updates: Partial<typeof games.$inferInsert> = { updatedAt: now };

    if (data.title !== undefined) updates.title = data.title;
    if (data.coverPath !== undefined) updates.coverPath = data.coverPath ?? null;
    if (data.description !== undefined) updates.description = data.description ?? null;
    if (data.developer !== undefined) updates.developer = data.developer ?? null;
    if (data.publisher !== undefined) updates.publisher = data.publisher ?? null;
    if (data.releaseDate !== undefined) updates.releaseDate = data.releaseDate ?? null;
    if (data.genre !== undefined) updates.genre = data.genre ?? null;
    if (data.rating !== undefined) updates.rating = data.rating ?? null;
    if (data.isFavorite !== undefined) updates.isFavorite = data.isFavorite;
    if (data.playCount !== undefined) updates.playCount = data.playCount;
    if (data.playTime !== undefined) updates.playTime = data.playTime;
    if (data.lastPlayedAt !== undefined) updates.lastPlayedAt = data.lastPlayedAt ?? null;

    if (Object.keys(updates).length === 1) return this.getGameById(id); // only updatedAt

    await this.db.update(games).set(updates).where(eq(games.id, id));
    return this.getGameById(id);
  }

  async deleteGame(id: string): Promise<void> {
    await this.db.delete(games).where(eq(games.id, id));
  }

  async getGameCount(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(games);
    return result[0]?.count ?? 0;
  }

  async getRecentGames(limit = 10): Promise<Game[]> {
    const rows = await this.db
      .select()
      .from(games)
      .where(isNotNull(games.lastPlayedAt))
      .orderBy(desc(games.lastPlayedAt))
      .limit(limit);
    return rows.map(rowToGame);
  }

  async getRecentlyPlayed(limit = 10): Promise<Game[]> {
    return this.getRecentGames(limit);
  }

  async recordPlaySession(gameId: string, duration: number): Promise<void> {
    const now = new Date();
    await this.db
      .update(games)
      .set({
        playCount: sql`${games.playCount} + 1`,
        playTime: sql`${games.playTime} + ${duration}`,
        lastPlayedAt: now,
        updatedAt: now,
      })
      .where(eq(games.id, gameId));
  }

  async getCollections(): Promise<Collection[]> {
    const rows = await this.db
      .select()
      .from(collections)
      .orderBy(asc(collections.sortOrder), asc(collections.name));

    if (rows.length === 0) return [];

    const cgRows = await this.db
      .select({ collectionId: collectionGames.collectionId, gameId: collectionGames.gameId })
      .from(collectionGames);

    const gameIdsByCollection = new Map<string, string[]>();
    for (const cg of cgRows) {
      const list = gameIdsByCollection.get(cg.collectionId);
      if (list) {
        list.push(cg.gameId);
      } else {
        gameIdsByCollection.set(cg.collectionId, [cg.gameId]);
      }
    }

    return rows.map((row) => rowToCollection(row, gameIdsByCollection.get(row.id) ?? []));
  }

  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const id = uuidv4();
    const now = new Date();

    const maxOrderResult = await this.db
      .select({ maxOrder: max(collections.sortOrder) })
      .from(collections);
    const sortOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    await this.db.insert(collections).values({
      id,
      name: data.name,
      description: data.description ?? null,
      coverPath: data.coverPath ?? null,
      isSystem: data.isSystem ?? false,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    const rows = await this.db.select().from(collections).where(eq(collections.id, id));
    if (rows.length > 0) {
      const cgRows = await this.db
        .select({ gameId: collectionGames.gameId })
        .from(collectionGames)
        .where(eq(collectionGames.collectionId, id));
      return rowToCollection(
        rows[0],
        cgRows.map((r) => r.gameId)
      );
    }

    return {
      id,
      name: data.name,
      description: data.description,
      coverPath: data.coverPath,
      gameIds: [],
      isSystem: data.isSystem ?? false,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };
  }

  async deleteCollection(id: string): Promise<void> {
    await this.db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.isSystem, false)));
  }

  async addToCollection(collectionId: string, gameId: string): Promise<void> {
    const now = new Date();
    await this.db
      .insert(collectionGames)
      .values({ collectionId, gameId, addedAt: now })
      .onConflictDoNothing();
  }

  async removeFromCollection(collectionId: string, gameId: string): Promise<void> {
    await this.db
      .delete(collectionGames)
      .where(
        and(eq(collectionGames.collectionId, collectionId), eq(collectionGames.gameId, gameId))
      );
  }

  async getCollectionGames(collectionId: string): Promise<Game[]> {
    const rows = await this.db
      .select({ game: games })
      .from(games)
      .innerJoin(collectionGames, eq(games.id, collectionGames.gameId))
      .where(eq(collectionGames.collectionId, collectionId))
      .orderBy(asc(games.title));

    return rows.map((r) => rowToGame(r.game));
  }

  async toggleFavorite(gameId: string): Promise<void> {
    await this.db
      .update(games)
      .set({
        isFavorite: sql`NOT ${games.isFavorite}`,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId));
  }

  async addToFavorites(gameId: string): Promise<void> {
    await this.db
      .update(games)
      .set({ isFavorite: true, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  }

  async removeFromFavorites(gameId: string): Promise<void> {
    await this.db
      .update(games)
      .set({ isFavorite: false, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  }

  async getFavorites(): Promise<Game[]> {
    const rows = await this.db
      .select()
      .from(games)
      .where(eq(games.isFavorite, true))
      .orderBy(asc(games.title));
    return rows.map(rowToGame);
  }
}

/**
 * Create a new LibraryService instance
 */
export function createLibraryService(db: DrizzleDb): ILibraryService {
  return new LibraryService(db);
}
