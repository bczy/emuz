/**
 * GenreService — Drizzle in-memory tests.
 * RED until: schema exports Drizzle tables AND GenreService accepts DrizzleDb.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@emuz/database/schema';
import type { DrizzleDb } from '@emuz/database/schema';
import { GenreService } from '../services/GenreService';

let sqlite: InstanceType<typeof Database>;
let db: DrizzleDb;
let svc: GenreService;

function setupTables(d: DrizzleDb): void {
  d.run(
    sql`CREATE TABLE IF NOT EXISTS platforms (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, manufacturer TEXT, generation INTEGER, release_year INTEGER, icon_path TEXT, wallpaper_path TEXT, color TEXT, rom_extensions TEXT NOT NULL DEFAULT '[]', created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, platform_id TEXT NOT NULL, title TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT NOT NULL, file_size INTEGER, file_hash TEXT, cover_path TEXT, description TEXT, developer TEXT, publisher TEXT, release_date TEXT, genre TEXT, rating REAL, play_count INTEGER DEFAULT 0, play_time INTEGER DEFAULT 0, last_played_at INTEGER, is_favorite INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
}

function seedGame(d: DrizzleDb, id: string, genre: string | null = null): void {
  d.insert(schema.games)
    .values({
      id,
      platformId: 'nes',
      title: `Game ${id}`,
      filePath: `/f${id}.nes`,
      fileName: `f${id}.nes`,
      genre: genre ?? undefined,
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
}

beforeEach(() => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  setupTables(db);
  db.insert(schema.platforms)
    .values({
      id: 'nes',
      name: 'NES',
      romExtensions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
  svc = new GenreService(db);
});

afterEach(() => sqlite.close());

describe('GenreService (Drizzle)', () => {
  it('getGenres returns empty list when no games have genre', async () => {
    seedGame(db, 'g1', null);
    const genres = await svc.getGenres();
    expect(genres).toHaveLength(0);
  });

  it('getGenres returns genres with game counts', async () => {
    seedGame(db, 'g1', 'Action');
    seedGame(db, 'g2', 'Action');
    seedGame(db, 'g3', 'RPG');
    const genres = await svc.getGenres();
    expect(genres).toHaveLength(2);
    const action = genres.find((g) => g.name === 'Action');
    expect(action?.gameCount).toBe(2);
  });

  it('getGamesByGenre filters by genre', async () => {
    seedGame(db, 'g1', 'Action');
    seedGame(db, 'g2', 'RPG');
    const games = await svc.getGamesByGenre('Action');
    expect(games).toHaveLength(1);
  });

  it('assignGenre updates game genre', async () => {
    seedGame(db, 'g1', null);
    await svc.assignGenre('g1', 'Platformer');
    const games = await svc.getGamesByGenre('Platformer');
    expect(games).toHaveLength(1);
  });

  it('assignGenre with null clears genre', async () => {
    seedGame(db, 'g1', 'Action');
    await svc.assignGenre('g1', null);
    expect(await svc.getGenres()).toHaveLength(0);
  });

  it('getGenreStats returns correct counts', async () => {
    seedGame(db, 'g1', 'Action');
    seedGame(db, 'g2', 'Action');
    const stats = await svc.getGenreStats('Action');
    expect(stats.totalGames).toBe(2);
  });

  it('extractGenreFromMetadata normalizes genre', () => {
    expect(svc.extractGenreFromMetadata('action')).toBe('Action');
    expect(svc.extractGenreFromMetadata('rpg')).toBe('RPG');
    expect(svc.extractGenreFromMetadata('Action / Adventure')).toBe('Action');
    expect(svc.extractGenreFromMetadata(null)).toBeNull();
    expect(svc.extractGenreFromMetadata('')).toBeNull();
  });
});
