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
  SearchOptions,
  CreateCollectionInput,
} from './types';

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
    lastPlayedAt: row.last_played_at ? new Date(row.last_played_at * 1000) : undefined,
    isFavorite: Boolean(row.is_favorite),
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
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
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
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
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

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
   * Search games by title with optional filters
   */
  async searchGames(query: string, options?: SearchOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const conditions: string[] = ['title LIKE ?'];
    const params: (string | number | boolean)[] = [`%${query}%`];

    if (options?.platformId) {
      conditions.push('platform_id = ?');
      params.push(options.platformId);
    }

    if (options?.favorite !== undefined) {
      conditions.push('is_favorite = ?');
      params.push(options.favorite ? 1 : 0);
    }

    params.push(limit, offset);

    const sql = `
      SELECT * FROM games 
      WHERE ${conditions.join(' AND ')} 
      ORDER BY title ASC 
      LIMIT ? OFFSET ?
    `;

    const rows = await this.db.query<GameRow>(sql, params);
    return rows.map(rowToGame);
  }

  /**
   * Update a game
   */
  async updateGame(id: string, data: Partial<Game>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.coverPath !== undefined) {
      updates.push('cover_path = ?');
      params.push(data.coverPath ?? null);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description ?? null);
    }
    if (data.developer !== undefined) {
      updates.push('developer = ?');
      params.push(data.developer ?? null);
    }
    if (data.publisher !== undefined) {
      updates.push('publisher = ?');
      params.push(data.publisher ?? null);
    }
    if (data.releaseDate !== undefined) {
      updates.push('release_date = ?');
      params.push(data.releaseDate ?? null);
    }
    if (data.genre !== undefined) {
      updates.push('genre = ?');
      params.push(data.genre ?? null);
    }
    if (data.rating !== undefined) {
      updates.push('rating = ?');
      params.push(data.rating ?? null);
    }
    if (data.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      params.push(data.isFavorite ? 1 : 0);
    }
    if (data.playCount !== undefined) {
      updates.push('play_count = ?');
      params.push(data.playCount);
    }
    if (data.playTime !== undefined) {
      updates.push('play_time = ?');
      params.push(data.playTime);
    }
    if (data.lastPlayedAt !== undefined) {
      updates.push('last_played_at = ?');
      params.push(data.lastPlayedAt ? Math.floor(data.lastPlayedAt.getTime() / 1000) : null);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = ?');
    params.push(Math.floor(Date.now() / 1000));
    params.push(id);

    await this.db.execute(`UPDATE games SET ${updates.join(', ')} WHERE id = ?`, params);
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
   * Get all collections
   */
  async getCollections(): Promise<Collection[]> {
    const rows = await this.db.query<CollectionRow>(
      'SELECT * FROM collections ORDER BY sort_order ASC, name ASC'
    );

    // Get game IDs for each collection
    const collections = await Promise.all(
      rows.map(async (row) => {
        const gameIdRows = await this.db.query<{ game_id: string }>(
          'SELECT game_id FROM collection_games WHERE collection_id = ?',
          [row.id]
        );
        const gameIds = gameIdRows.map((r) => r.game_id);
        return rowToCollection(row, gameIds);
      })
    );

    return collections;
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
   */
  async addToCollection(gameId: string, collectionId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      `INSERT OR IGNORE INTO collection_games (collection_id, game_id, added_at)
       VALUES (?, ?, ?)`,
      [collectionId, gameId, now]
    );
  }

  /**
   * Remove a game from a collection
   */
  async removeFromCollection(gameId: string, collectionId: string): Promise<void> {
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
