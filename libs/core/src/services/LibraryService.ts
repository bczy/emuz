/**
 * LibraryService - Manages the game library, collections, and favorites
 */

import { v4 as uuidv4 } from 'uuid';
import type { Game } from '../models/Game';
import type { Collection } from '../models/Collection';
import type { DatabaseAdapter } from '@emuz/database';
import type {
  ILibraryService,
  PaginationOptions,
  CreateCollectionInput,
} from './types';
import { toDate, toOptionalDate, buildUpdateQuery } from '../utils/db';

/**
 * Database row types
 */
interface GameRow {
  id: string;
  platform_id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  file_hash: string | null;
  cover_path: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  release_date: string | null;
  genre: string | null;
  rating: number | null;
  play_count: number;
  play_time: number;
  last_played_at: number | null;
  is_favorite: number;
  created_at: number;
  updated_at: number;
}

interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  cover_path: string | null;
  is_system: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

/**
 * Convert database row to Game model
 */
function rowToGame(row: GameRow): Game {
  return {
    id: row.id,
    platformId: row.platform_id,
    title: row.title,
    filePath: row.file_path,
    fileName: row.file_name,
    fileSize: row.file_size ?? undefined,
    fileHash: row.file_hash ?? undefined,
    coverPath: row.cover_path ?? undefined,
    description: row.description ?? undefined,
    developer: row.developer ?? undefined,
    publisher: row.publisher ?? undefined,
    releaseDate: row.release_date ?? undefined,
    genre: row.genre ?? undefined,
    rating: row.rating ?? undefined,
    playCount: row.play_count,
    playTime: row.play_time,
    lastPlayedAt: toOptionalDate(row.last_played_at),
    isFavorite: Boolean(row.is_favorite),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

/**
 * Convert database row to Collection model
 * Note: gameIds are loaded separately from collection_games table
 */
function rowToCollection(row: CollectionRow, gameIds: string[] = []): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    coverPath: row.cover_path ?? undefined,
    gameIds,
    isSystem: Boolean(row.is_system),
    sortOrder: row.sort_order,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

/**
 * LibraryService implementation
 */
export class LibraryService implements ILibraryService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all games with optional pagination
   */
  async getAllGames(options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.page !== undefined
      ? (options.page - 1) * limit
      : (options?.offset ?? 0);

    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games ORDER BY title ASC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map(rowToGame);
  }

  /**
   * Get a game by its ID
   */
  async getGameById(id: string): Promise<Game | null> {
    const rows = await this.db.query<GameRow>('SELECT * FROM games WHERE id = ?', [id]);

    return rows.length > 0 ? rowToGame(rows[0]) : null;
  }

  /**
   * Get games by platform ID
   */
  async getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games WHERE platform_id = ? ORDER BY title ASC LIMIT ? OFFSET ?`,
      [platformId, limit, offset]
    );

    return rows.map(rowToGame);
  }

  /**
   * Search games by query and/or filters (accepts an options object)
   */
  async searchGames(options: { query?: string; platformId?: string; genre?: string } | string): Promise<Game[]> {
    // Support legacy string call
    const opts = typeof options === 'string'
      ? { query: options }
      : options;

    const query = opts.query ?? '';
    const conditions: string[] = ['title LIKE ?'];
    const params: (string | number | boolean)[] = [`%${query}%`];

    if (opts.platformId) {
      conditions.push('platform_id = ?');
      params.push(opts.platformId);
    }

    if ((opts as { genre?: string }).genre) {
      conditions.push('genre = ?');
      params.push((opts as { genre?: string }).genre as string);
    }

    const sql = `
      SELECT * FROM games
      WHERE ${conditions.join(' AND ')}
      ORDER BY title ASC
    `;

    const rows = await this.db.query<GameRow>(sql, params);
    return rows.map(rowToGame);
  }

  /**
   * Update a game and return the updated record
   */
  async updateGame(id: string, data: Partial<Game>): Promise<Game | null> {
    const fields: Array<[string, string | number | null]> = [
      ...(data.title !== undefined ? [['title', data.title] as [string, string]] : []),
      ...(data.coverPath !== undefined ? [['cover_path', data.coverPath ?? null] as [string, string | null]] : []),
      ...(data.description !== undefined ? [['description', data.description ?? null] as [string, string | null]] : []),
      ...(data.developer !== undefined ? [['developer', data.developer ?? null] as [string, string | null]] : []),
      ...(data.publisher !== undefined ? [['publisher', data.publisher ?? null] as [string, string | null]] : []),
      ...(data.releaseDate !== undefined ? [['release_date', data.releaseDate ?? null] as [string, string | null]] : []),
      ...(data.genre !== undefined ? [['genre', data.genre ?? null] as [string, string | null]] : []),
      ...(data.rating !== undefined ? [['rating', data.rating ?? null] as [string, number | null]] : []),
      ...(data.isFavorite !== undefined ? [['is_favorite', data.isFavorite ? 1 : 0] as [string, number]] : []),
      ...(data.playCount !== undefined ? [['play_count', data.playCount] as [string, number]] : []),
      ...(data.playTime !== undefined ? [['play_time', data.playTime] as [string, number]] : []),
      ...(data.lastPlayedAt !== undefined ? [['last_played_at', data.lastPlayedAt ? Math.floor(data.lastPlayedAt.getTime() / 1000) : null] as [string, number | null]] : []),
    ];

    const query = buildUpdateQuery(fields);
    if (!query) return this.getGameById(id);

    await this.db.execute(`UPDATE games SET ${query.setClauses} WHERE id = ?`, [...query.params, id]);

    return this.getGameById(id);
  }

  /**
   * Delete a game
   */
  async deleteGame(id: string): Promise<void> {
    await this.db.execute('DELETE FROM games WHERE id = ?', [id]);
  }

  /**
   * Get total game count
   */
  async getGameCount(): Promise<number> {
    const result = await this.db.query<{ count: number }>('SELECT COUNT(*) as count FROM games');
    return result[0]?.count ?? 0;
  }

  /**
   * Get recently played games
   */
  async getRecentGames(limit = 10): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games
       WHERE last_played_at IS NOT NULL
       ORDER BY last_played_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(rowToGame);
  }

  /**
   * Alias for getRecentGames - gets recently played games
   */
  async getRecentlyPlayed(limit = 10): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games WHERE last_played_at IS NOT NULL ORDER BY last_played_at DESC LIMIT ?`,
      [limit]
    );

    return rows.map(rowToGame);
  }

  /**
   * Record a play session - updates play_count, play_time, last_played_at
   */
  async recordPlaySession(gameId: string, duration: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      'UPDATE games SET play_count = play_count + 1, play_time = play_time + ?, last_played_at = ?, updated_at = ? WHERE id = ?',
      [duration, now, now, gameId]
    );
  }

  /**
   * Get all collections
   */
  async getCollections(): Promise<Collection[]> {
    const rows = await this.db.query<CollectionRow>(
      'SELECT * FROM collections ORDER BY sort_order ASC, name ASC'
    );

    if (rows.length === 0) return [];

    // Fetch all collection-game relationships in one query, then group in memory
    const cgRows = await this.db.query<{ collection_id: string; game_id: string }>(
      'SELECT collection_id, game_id FROM collection_games'
    );
    const gameIdsByCollection = new Map<string, string[]>();
    for (const cg of cgRows) {
      const list = gameIdsByCollection.get(cg.collection_id);
      if (list) {
        list.push(cg.game_id);
      } else {
        gameIdsByCollection.set(cg.collection_id, [cg.game_id]);
      }
    }

    return rows.map((row) => rowToCollection(row, gameIdsByCollection.get(row.id) ?? []));
  }

  /**
   * Create a new collection
   */
  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    // Get max sort order
    const maxOrderResult = await this.db.query<{ max_order: number | null }>(
      'SELECT MAX(sort_order) as max_order FROM collections'
    );
    const sortOrder = (maxOrderResult[0]?.max_order ?? -1) + 1;

    await this.db.execute(
      `INSERT INTO collections (id, name, description, cover_path, is_system, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.description ?? null, data.coverPath ?? null, data.isSystem ? 1 : 0, sortOrder, now, now]
    );

    // Fetch the newly created collection
    const rows = await this.db.query<CollectionRow>(
      'SELECT * FROM collections WHERE id = ?',
      [id]
    );

    if (rows.length > 0) {
      const cgRows = await this.db.query<{ game_id: string }>(
        'SELECT game_id FROM collection_games WHERE collection_id = ?',
        [id]
      );
      return rowToCollection(rows[0], cgRows.map((r) => r.game_id));
    }

    return {
      id,
      name: data.name,
      description: data.description,
      coverPath: data.coverPath,
      gameIds: [],
      isSystem: data.isSystem ?? false,
      sortOrder,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    await this.db.execute('DELETE FROM collections WHERE id = ? AND is_system = 0', [id]);
  }

  /**
   * Add a game to a collection
   * @param collectionId - The collection ID
   * @param gameId - The game ID
   */
  async addToCollection(collectionId: string, gameId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      `INSERT OR IGNORE INTO collection_games (collection_id, game_id, added_at)
       VALUES (?, ?, ?)`,
      [collectionId, gameId, now]
    );
  }

  /**
   * Remove a game from a collection
   * @param collectionId - The collection ID
   * @param gameId - The game ID
   */
  async removeFromCollection(collectionId: string, gameId: string): Promise<void> {
    await this.db.execute(
      'DELETE FROM collection_games WHERE collection_id = ? AND game_id = ?',
      [collectionId, gameId]
    );
  }

  /**
   * Get all games in a collection
   */
  async getCollectionGames(collectionId: string): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      `SELECT g.* FROM games g
       INNER JOIN collection_games cg ON g.id = cg.game_id
       WHERE cg.collection_id = ?
       ORDER BY g.title ASC`,
      [collectionId]
    );

    return rows.map(rowToGame);
  }

  /**
   * Toggle favorite status for a game
   */
  async toggleFavorite(gameId: string): Promise<void> {
    await this.db.execute(
      `UPDATE games SET is_favorite = NOT is_favorite, updated_at = ? WHERE id = ?`,
      [Math.floor(Date.now() / 1000), gameId]
    );
  }

  /**
   * Add a game to favorites
   */
  async addToFavorites(gameId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET is_favorite = 1, updated_at = ? WHERE id = ?',
      [now, gameId]
    );
  }

  /**
   * Remove a game from favorites
   */
  async removeFromFavorites(gameId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET is_favorite = 0, updated_at = ? WHERE id = ?',
      [now, gameId]
    );
  }

  /**
   * Get all favorite games
   */
  async getFavorites(): Promise<Game[]> {
    const rows = await this.db.query<GameRow>(
      'SELECT * FROM games WHERE is_favorite = 1 ORDER BY title ASC'
    );

    return rows.map(rowToGame);
  }
}

/**
 * Create a new LibraryService instance
 */
export function createLibraryService(db: DatabaseAdapter): ILibraryService {
  return new LibraryService(db);
}
