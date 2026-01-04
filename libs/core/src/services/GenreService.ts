/**
 * GenreService - Manages game genres (Daijishou-inspired)
 */

import { v4 as uuidv4 } from 'uuid';
import type { Genre } from '../models/Genre';
import type { Game, GameMetadata } from '../models/Game';
import type { DatabaseAdapter } from '@emuz/database';
import type { IGenreService, PaginationOptions } from './types';
import { CommonGenres } from '../models/Genre';

/**
 * Database row types
 */
interface GenreRow {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  game_count: number;
  created_at: number;
  updated_at: number;
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

/**
 * Convert database row to Genre model
 */
function rowToGenre(row: GenreRow): Genre {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    iconName: row.icon_name ?? undefined,
    color: row.color ?? undefined,
    gameCount: row.game_count,
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
  };
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
    lastPlayedAt: row.last_played_at ? new Date(row.last_played_at * 1000) : undefined,
    isFavorite: Boolean(row.is_favorite),
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
  };
}

/**
 * GenreService implementation
 */
export class GenreService implements IGenreService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all genres with game counts
   */
  async getGenres(): Promise<Genre[]> {
    const rows = await this.db.query<GenreRow>(
      `SELECT g.*, 
              (SELECT COUNT(*) FROM games ga WHERE ga.genre = g.slug) as game_count
       FROM genres g
       ORDER BY g.name ASC`
    );
    return rows.map(rowToGenre);
  }

  /**
   * Get a genre by ID
   */
  async getGenreById(id: string): Promise<Genre | null> {
    const rows = await this.db.query<GenreRow>(
      `SELECT g.*, 
              (SELECT COUNT(*) FROM games ga WHERE ga.genre = g.slug) as game_count
       FROM genres g
       WHERE g.id = ?`,
      [id]
    );
    return rows.length > 0 ? rowToGenre(rows[0]) : null;
  }

  /**
   * Get games by genre
   */
  async getGamesByGenre(genreId: string, options?: PaginationOptions): Promise<Game[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    // First get the genre slug
    const genre = await this.getGenreById(genreId);
    if (!genre) return [];

    const rows = await this.db.query<GameRow>(
      `SELECT * FROM games 
       WHERE genre = ? 
       ORDER BY title ASC 
       LIMIT ? OFFSET ?`,
      [genre.slug, limit, offset]
    );

    return rows.map(rowToGame);
  }

  /**
   * Assign a genre to a game
   */
  async assignGenre(gameId: string, genreId: string): Promise<void> {
    const genre = await this.getGenreById(genreId);
    if (!genre) {
      throw new Error(`Genre not found: ${genreId}`);
    }

    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET genre = ?, updated_at = ? WHERE id = ?',
      [genre.slug, now, gameId]
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
   * Extract genre from game metadata
   */
  extractGenreFromMetadata(metadata: GameMetadata): string | null {
    if (!metadata.genre) return null;

    const normalizedGenre = metadata.genre.toLowerCase().trim();

    // Try to match with common genres
    for (const value of Object.values(CommonGenres)) {
      if (
        normalizedGenre.includes(value.slug) ||
        normalizedGenre.includes(value.name.toLowerCase())
      ) {
        return value.slug;
      }
    }

    // Check for compound genres (e.g., "Action-Adventure")
    for (const value of Object.values(CommonGenres)) {
      if (normalizedGenre.startsWith(value.slug) || normalizedGenre.startsWith(value.name.toLowerCase())) {
        return value.slug;
      }
    }

    return null;
  }

  /**
   * Ensure common genres exist in database
   */
  async ensureCommonGenres(): Promise<void> {
    const existingGenres = await this.db.query<{ slug: string }>(
      'SELECT slug FROM genres'
    );
    const existingSlugs = new Set(existingGenres.map((g) => g.slug));

    const now = Math.floor(Date.now() / 1000);

    for (const value of Object.values(CommonGenres)) {
      if (!existingSlugs.has(value.slug)) {
        const id = uuidv4();
        await this.db.execute(
          `INSERT INTO genres (id, name, slug, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [id, value.name, value.slug, now, now]
        );
      }
    }
  }

  /**
   * Create a new genre
   */
  async createGenre(
    name: string,
    options?: { iconName?: string; color?: string }
  ): Promise<Genre> {
    const id = uuidv4();
    const slug = this.slugify(name);
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      `INSERT INTO genres (id, name, slug, icon_name, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, options?.iconName ?? null, options?.color ?? null, now, now]
    );

    return {
      id,
      name,
      slug,
      iconName: options?.iconName,
      color: options?.color,
      gameCount: 0,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  /**
   * Convert name to slug
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

/**
 * Create a new GenreService instance
 */
export function createGenreService(db: DatabaseAdapter): IGenreService {
  return new GenreService(db);
}
