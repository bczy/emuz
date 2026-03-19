/**
 * LibraryService - Manages the game library, collections, and favorites
 *
 * Migrated from Drizzle ORM to @emuz/storage flat-file engine (Story 8.9).
 */

import { v4 as uuidv4 } from 'uuid';
import type { Game } from '../models/Game';
import type { Collection } from '../models/Collection';
import type { FlatDb } from '@emuz/storage';
import type { GameRow, PlatformRow, CollectionRow } from '@emuz/storage';
import type { ILibraryService, PaginationOptions, CreateCollectionInput } from './types';

/**
 * Convert a GameRow (snake_case) + optional PlatformRow to the Game model.
 */
function rowToGame(row: GameRow, platform?: PlatformRow): Game {
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
    lastPlayedAt: row.last_played_at ?? undefined,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    platformName: platform?.name ?? undefined,
    platformShortName: platform?.short_name ?? undefined,
    platformManufacturer: platform?.manufacturer ?? undefined,
  };
}

/**
 * Convert a CollectionRow (snake_case) to the Collection model.
 */
function rowToCollection(row: CollectionRow, gameIds: string[] = []): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    coverPath: row.cover_path ?? undefined,
    gameIds,
    isSystem: row.is_system,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * LibraryService implementation using the @emuz/storage flat-file engine.
 */
export class LibraryService implements ILibraryService {
  constructor(private readonly db: FlatDb) {}

  async getAllGames(options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 20;
    const offset =
      options?.page !== undefined ? (options.page - 1) * limit : (options?.offset ?? 0);

    const all = this.db.games
      .all()
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(offset, offset + limit);

    return all.map((row) => rowToGame(row, this.db.platforms.findById(row.platform_id)));
  }

  async getGameById(id: string): Promise<Game | null> {
    const row = this.db.games.findById(id);
    if (!row) return null;
    return rowToGame(row, this.db.platforms.findById(row.platform_id));
  }

  async getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset =
      options?.page !== undefined ? (options.page - 1) * limit : (options?.offset ?? 0);

    const rows = this.db.games
      .find((g) => g.platform_id === platformId)
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(offset, offset + limit);

    return rows.map((row) => rowToGame(row, this.db.platforms.findById(row.platform_id)));
  }

  async searchGames(
    options: { query?: string; platformId?: string; genre?: string } | string
  ): Promise<Game[]> {
    const opts = typeof options === 'string' ? { query: options } : options;
    const q = (opts.query ?? '').toLowerCase();

    const rows = this.db.games
      .find((g) => {
        if (!g.title.toLowerCase().includes(q)) return false;
        if (opts.platformId && g.platform_id !== opts.platformId) return false;
        const genreFilter = (opts as { genre?: string }).genre;
        if (genreFilter && g.genre !== genreFilter) return false;
        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return rows.map((row) => rowToGame(row));
  }

  async updateGame(id: string, data: Partial<Game>): Promise<Game | null> {
    const now = new Date();
    const patch: Partial<GameRow> = { updated_at: now };

    if (data.title !== undefined) patch.title = data.title;
    if (data.coverPath !== undefined) patch.cover_path = data.coverPath ?? null;
    if (data.description !== undefined) patch.description = data.description ?? null;
    if (data.developer !== undefined) patch.developer = data.developer ?? null;
    if (data.publisher !== undefined) patch.publisher = data.publisher ?? null;
    if (data.releaseDate !== undefined) patch.release_date = data.releaseDate ?? null;
    if (data.genre !== undefined) patch.genre = data.genre ?? null;
    if (data.rating !== undefined) patch.rating = data.rating ?? null;
    if (data.isFavorite !== undefined) patch.is_favorite = data.isFavorite;
    if (data.playCount !== undefined) patch.play_count = data.playCount;
    if (data.playTime !== undefined) patch.play_time = data.playTime;
    if (data.lastPlayedAt !== undefined) patch.last_played_at = data.lastPlayedAt ?? null;

    if (Object.keys(patch).length === 1) return this.getGameById(id); // only updated_at

    this.db.games.update(id, patch);
    await this.db.flush();
    return this.getGameById(id);
  }

  async deleteGame(id: string): Promise<void> {
    this.db.games.delete(id);
    await this.db.flush();
  }

  async getGameCount(): Promise<number> {
    return this.db.games.count();
  }

  async getRecentGames(limit = 10): Promise<Game[]> {
    return this.db.games
      .find((g) => g.last_played_at != null)
      .sort((a, b) => (b.last_played_at?.getTime() ?? 0) - (a.last_played_at?.getTime() ?? 0))
      .slice(0, limit)
      .map((row) => rowToGame(row));
  }

  async getRecentlyPlayed(limit = 10): Promise<Game[]> {
    return this.getRecentGames(limit);
  }

  async recordPlaySession(gameId: string, duration: number): Promise<void> {
    const now = new Date();
    const game = this.db.games.findById(gameId);
    if (game) {
      this.db.games.update(gameId, {
        play_count: game.play_count + 1,
        play_time: game.play_time + duration,
        last_played_at: now,
        updated_at: now,
      });
      await this.db.flush();
    }
  }

  async getCollections(): Promise<Collection[]> {
    const rows = this.db.collections
      .all()
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

    if (rows.length === 0) return [];

    const cgRows = this.db.collectionGames.all();
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

  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const id = uuidv4();
    const now = new Date();

    const maxOrder = this.db.collections.all().reduce((m, c) => Math.max(m, c.sort_order), -1);
    const sortOrder = maxOrder + 1;

    const newRow: CollectionRow = {
      id,
      name: data.name,
      description: data.description ?? null,
      cover_path: data.coverPath ?? null,
      is_system: data.isSystem ?? false,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    };

    this.db.collections.insert(newRow);
    await this.db.flush();

    const cgRows = this.db.collectionGames.findByCollection(id);
    return rowToCollection(
      newRow,
      cgRows.map((r) => r.game_id)
    );
  }

  async deleteCollection(id: string): Promise<void> {
    const row = this.db.collections.findById(id);
    if (row && !row.is_system) {
      this.db.collections.delete(id);
      await this.db.flush();
    }
  }

  async addToCollection(collectionId: string, gameId: string): Promise<void> {
    if (!this.db.collectionGames.has(collectionId, gameId)) {
      this.db.collectionGames.insert({
        collection_id: collectionId,
        game_id: gameId,
        added_at: new Date(),
      });
      await this.db.flush();
    }
  }

  async removeFromCollection(collectionId: string, gameId: string): Promise<void> {
    this.db.collectionGames.delete(collectionId, gameId);
    await this.db.flush();
  }

  async getCollectionGames(collectionId: string): Promise<Game[]> {
    const cgRows = this.db.collectionGames.findByCollection(collectionId);
    const gameIds = new Set(cgRows.map((r) => r.game_id));

    return this.db.games
      .find((g) => gameIds.has(g.id))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((row) => rowToGame(row));
  }

  async toggleFavorite(gameId: string): Promise<void> {
    const game = this.db.games.findById(gameId);
    if (game) {
      this.db.games.update(gameId, {
        is_favorite: !game.is_favorite,
        updated_at: new Date(),
      });
      await this.db.flush();
    }
  }

  async addToFavorites(gameId: string): Promise<void> {
    const game = this.db.games.findById(gameId);
    if (game) {
      this.db.games.update(gameId, { is_favorite: true, updated_at: new Date() });
      await this.db.flush();
    }
  }

  async removeFromFavorites(gameId: string): Promise<void> {
    const game = this.db.games.findById(gameId);
    if (game) {
      this.db.games.update(gameId, { is_favorite: false, updated_at: new Date() });
      await this.db.flush();
    }
  }

  async getFavorites(): Promise<Game[]> {
    return this.db.games
      .find((g) => g.is_favorite)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((row) => rowToGame(row));
  }
}

/**
 * Create a new LibraryService instance
 */
export function createLibraryService(db: FlatDb): ILibraryService {
  return new LibraryService(db);
}
