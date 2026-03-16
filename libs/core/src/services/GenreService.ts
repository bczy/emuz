/**
 * GenreService - Manages game genres (Daijishou-inspired)
 */

import type { Game } from '../models/Game';
import type { DatabaseAdapter } from '@emuz/database';
import type { IGenreService, PaginationOptions } from './types';
import { toDate, toOptionalDate } from '../utils/db';

/**
 * Simplified Genre shape returned by getGenres
 */
export interface GenreInfo {
  id: string;
  name: string;
  gameCount: number;
}

/**
 * Database row types
 */
interface GenreCountRow {
  genre: string | null;
  count: number;
}

interface GameRow {
  id: string;
  platform_id: string;
  title: string;
  file_path: string;
  file_name: string;
  cover_path: string | null;
  genre: string | null;
  play_count: number;
  play_time: number;
  last_played_at: number | null;
  is_favorite: number;
  created_at: number;
  updated_at: number;
}

interface GenreStatsRow {
  total_games: number;
  total_play_time: number;
  avg_rating: number | null;
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
    coverPath: row.cover_path ?? undefined,
    genre: row.genre ?? undefined,
    playCount: row.play_count,
    playTime: row.play_time,
    lastPlayedAt: toOptionalDate(row.last_played_at),
    isFavorite: Boolean(row.is_favorite),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
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

  // Check if the string is entirely uppercase or entirely lowercase
  const isAllUpper = trimmed === upper;
  const isAllLower = trimmed === lower;

  if (isAllUpper || isAllLower) {
    if (trimmed.length <= 3) {
      // Short abbreviation: uppercase all
      return upper;
    }
    // Longer: capitalize first letter, lowercase the rest
    return trimmed.charAt(0).toUpperCase() + lower.slice(1);
  }

  // Mixed case: capitalize first letter, keep rest as-is
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * GenreService implementation
 */
export class GenreService implements IGenreService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all genres with game counts (derived from the games table)
   */
  async getGenres(): Promise<GenreInfo[]> {
    const rows = await this.db.query<GenreCountRow>(
      `SELECT genre, COUNT(*) as count FROM games WHERE genre IS NOT NULL GROUP BY genre ORDER BY genre ASC`,
      []
    );

    return rows
      .filter((row) => row.genre !== null && row.genre !== '')
      .map((row) => ({
        id: (row.genre as string).toLowerCase().replace(/\s+/g, '-'),
        name: row.genre as string,
        gameCount: row.count,
      }));
  }

  /**
   * Get games by genre (direct string match)
   */
  async getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.page !== undefined
      ? (options.page - 1) * limit
      : (options?.offset ?? 0);

    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games WHERE genre = ? ORDER BY title ASC LIMIT ? OFFSET ?`,
      [genre, limit, offset]
    );

    return rows.map(rowToGame);
  }

  /**
   * Assign a genre to a game (pass null to clear)
   */
  async assignGenre(gameId: string, genreId: string | null): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET genre = ?, updated_at = ? WHERE id = ?',
      [genreId, now, gameId]
    );
  }

  /**
   * Remove genre from a game
   */
  async removeGenre(gameId: string, _genreId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET genre = NULL, updated_at = ? WHERE id = ?',
      [now, gameId]
    );
  }

  /**
   * Get statistics for a specific genre
   */
  async getGenreStats(genre: string): Promise<{
    totalGames: number;
    totalPlayTime: number;
    averageRating: number;
  }> {
    const rows = await this.db.query<GenreStatsRow>(
      `SELECT COUNT(*) as total_games, SUM(play_time) as total_play_time, AVG(rating) as avg_rating FROM games WHERE genre = ?`,
      [genre]
    );

    const row = rows[0];
    return {
      totalGames: row?.total_games ?? 0,
      totalPlayTime: row?.total_play_time ?? 0,
      averageRating: row?.avg_rating ?? 0,
    };
  }

  /**
   * Extract genre from a raw genre string.
   * Accepts a string | null. Trims, normalizes, splits on " / " to take the first part.
   */
  extractGenreFromMetadata(input: string | null): string | null {
    if (input === null || input === undefined) return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    // Split on " / " and take the first part
    const firstPart = trimmed.split(' / ')[0].trim();
    if (!firstPart) return null;

    return normalizeGenreName(firstPart);
  }
}

/**
 * Create a new GenreService instance
 */
export function createGenreService(db: DatabaseAdapter): IGenreService {
  return new GenreService(db);
}
