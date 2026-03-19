/**
 * GenreService - Manages game genres (Daijishou-inspired)
 *
 * Migrated to use the @emuz/storage flat-file engine (FlatDb).
 * No raw SQL strings, no Drizzle ORM.
 */

import type { Game } from '../models/Game';
import type { FlatDb } from '@emuz/storage';
import type { GameRow } from '@emuz/storage';
import type { IGenreService, PaginationOptions } from './types';

/**
 * Simplified Genre shape returned by getGenres
 */
export interface GenreInfo {
  id: string;
  name: string;
  gameCount: number;
}

/**
 * Convert a FlatDb GameRow to Game model
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
    lastPlayedAt: row.last_played_at ?? undefined,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
 * GenreService implementation using the @emuz/storage FlatDb engine
 */
export class GenreService implements IGenreService {
  constructor(private readonly db: FlatDb) {}

  async getGenres(): Promise<GenreInfo[]> {
    // Count games per genre
    const genreCount = new Map<string, number>();
    for (const g of this.db.games.all()) {
      if (g.genre) {
        genreCount.set(g.genre, (genreCount.get(g.genre) ?? 0) + 1);
      }
    }

    // Load genre records from the genres store, merge with counts
    return this.db.genres
      .all()
      .map((genre) => ({
        id: genre.id,
        name: genre.name,
        gameCount: genreCount.get(genre.name) ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset =
      options?.page !== undefined ? (options.page - 1) * limit : (options?.offset ?? 0);

    const matching = this.db.games
      .find((g) => g.genre === genre)
      .sort((a, b) => a.title.localeCompare(b.title));

    return matching.slice(offset, offset + limit).map(rowToGame);
  }

  async assignGenre(gameId: string, genreId: string | null): Promise<void> {
    this.db.games.update(gameId, { genre: genreId, updated_at: new Date() });
    await this.db.flush();
  }

  async removeGenre(gameId: string, _genreId: string): Promise<void> {
    this.db.games.update(gameId, { genre: null, updated_at: new Date() });
    await this.db.flush();
  }

  async getGenreStats(genre: string): Promise<{
    totalGames: number;
    totalPlayTime: number;
    averageRating: number;
  }> {
    const matching = this.db.games.find((g) => g.genre === genre);
    const rated = matching.filter((g) => g.rating != null);

    return {
      totalGames: matching.length,
      totalPlayTime: matching.reduce((s, g) => s + g.play_time, 0),
      averageRating:
        rated.length > 0 ? rated.reduce((s, g) => s + (g.rating ?? 0), 0) / rated.length : 0,
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
export function createGenreService(db: FlatDb): IGenreService {
  return new GenreService(db);
}
