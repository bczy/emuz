/**
 * GenreService - Manages game genres (Daijishou-inspired)
 *
 * Refactored to use Drizzle ORM query builder (Story 1.7 / ADR-013).
 * No raw SQL strings.
 */

import { eq, asc, count, sum, avg, isNotNull } from 'drizzle-orm';
import type { Game } from '../models/Game';
import type { DrizzleDb } from '@emuz/database/schema';
import { games } from '@emuz/database/schema';
import type { IGenreService, PaginationOptions } from './types';

/**
 * Simplified Genre shape returned by getGenres
 */
export interface GenreInfo {
  id: string;
  name: string;
  gameCount: number;
}

type GameRow = typeof games.$inferSelect;

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
    coverPath: row.coverPath ?? undefined,
    genre: row.genre ?? undefined,
    playCount: row.playCount,
    playTime: row.playTime,
    lastPlayedAt: row.lastPlayedAt ?? undefined,
    isFavorite: row.isFavorite,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Normalize a raw genre string.
 *
 * Rules:
 * - Trim whitespace
 * - If the string is entirely lowercase or entirely uppercase:
 *   - If it's short (≤3 chars after trimming): uppercase all (e.g. 'rpg' → 'RPG')
 *   - Otherwise: capitalize first letter, lowercase the rest (e.g. 'PLATFORMER' → 'Platformer', 'action' → 'Action')
 * - If it's mixed case: capitalize only the first letter (e.g. 'Action RPG' → 'Action RPG')
 */
function normalizeGenreName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const upper = trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();

  const isAllUpper = trimmed === upper;
  const isAllLower = trimmed === lower;

  if (isAllUpper || isAllLower) {
    if (trimmed.length <= 3) {
      return upper;
    }
    return trimmed.charAt(0).toUpperCase() + lower.slice(1);
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * GenreService implementation using Drizzle ORM
 */
export class GenreService implements IGenreService {
  constructor(private readonly db: DrizzleDb) {}

  async getGenres(): Promise<GenreInfo[]> {
    const rows = await this.db
      .select({ genre: games.genre, count: count() })
      .from(games)
      .where(isNotNull(games.genre))
      .groupBy(games.genre)
      .orderBy(asc(games.genre));

    return rows
      .filter((row) => row.genre !== null && row.genre !== '')
      .map((row) => ({
        id: (row.genre as string).toLowerCase().replace(/\s+/g, '-'),
        name: row.genre as string,
        gameCount: row.count,
      }));
  }

  async getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset =
      options?.page !== undefined ? (options.page - 1) * limit : (options?.offset ?? 0);

    const rows = await this.db
      .select()
      .from(games)
      .where(eq(games.genre, genre))
      .orderBy(asc(games.title))
      .limit(limit)
      .offset(offset);

    return rows.map(rowToGame);
  }

  async assignGenre(gameId: string, genreId: string | null): Promise<void> {
    await this.db
      .update(games)
      .set({ genre: genreId, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  }

  async removeGenre(gameId: string, _genreId: string): Promise<void> {
    await this.db
      .update(games)
      .set({ genre: null, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  }

  async getGenreStats(genre: string): Promise<{
    totalGames: number;
    totalPlayTime: number;
    averageRating: number;
  }> {
    const rows = await this.db
      .select({
        totalGames: count(),
        totalPlayTime: sum(games.playTime),
        avgRating: avg(games.rating),
      })
      .from(games)
      .where(eq(games.genre, genre));

    const row = rows[0];
    return {
      totalGames: row?.totalGames ?? 0,
      totalPlayTime: Number(row?.totalPlayTime ?? 0),
      averageRating: Number(row?.avgRating ?? 0),
    };
  }

  extractGenreFromMetadata(input: string | null): string | null {
    if (input === null || input === undefined) return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    const firstPart = trimmed.split(' / ')[0].trim();
    if (!firstPart) return null;

    return normalizeGenreName(firstPart);
  }
}

/**
 * Create a new GenreService instance
 */
export function createGenreService(db: DrizzleDb): IGenreService {
  return new GenreService(db);
}
