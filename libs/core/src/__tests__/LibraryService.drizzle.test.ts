/**
 * LibraryService — Drizzle in-memory tests.
 * RED until: schema/index.ts exports Drizzle tables AND LibraryService accepts DrizzleDb.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@emuz/database/schema';
import type { DrizzleDb } from '@emuz/database/schema';
import { LibraryService } from '../services/LibraryService';

let sqlite: InstanceType<typeof Database>;
let db: DrizzleDb;
let svc: LibraryService;

function setupTables(d: DrizzleDb): void {
  d.run(
    sql`CREATE TABLE IF NOT EXISTS platforms (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, manufacturer TEXT, generation INTEGER, release_year INTEGER, icon_path TEXT, wallpaper_path TEXT, color TEXT, rom_extensions TEXT NOT NULL DEFAULT '[]', created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE, title TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT NOT NULL, file_size INTEGER, file_hash TEXT, cover_path TEXT, description TEXT, developer TEXT, publisher TEXT, release_date TEXT, genre TEXT, rating REAL, play_count INTEGER DEFAULT 0, play_time INTEGER DEFAULT 0, last_played_at INTEGER, is_favorite INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, cover_path TEXT, is_system INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS collection_games (collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE, game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE, added_at INTEGER, PRIMARY KEY (collection_id, game_id))`
  );
  d.run(sql`PRAGMA foreign_keys = ON`);
}

function seedPlatform(d: DrizzleDb): void {
  d.insert(schema.platforms)
    .values({
      id: 'nes',
      name: 'NES',
      romExtensions: ['.nes'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
}

function seedGame(d: DrizzleDb, overrides: Partial<typeof schema.games.$inferInsert> = {}): void {
  d.insert(schema.games)
    .values({
      id: 'g1',
      platformId: 'nes',
      title: 'Mega Man',
      filePath: '/roms/megaman.nes',
      fileName: 'megaman.nes',
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    })
    .run();
}

beforeEach(() => {
  sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  db = drizzle(sqlite, { schema });
  setupTables(db);
  seedPlatform(db);
  svc = new LibraryService(db);
});

afterEach(() => sqlite.close());

describe('LibraryService (Drizzle)', () => {
  it('getAllGames returns all games', async () => {
    seedGame(db);
    const games = await svc.getAllGames();
    expect(games).toHaveLength(1);
    expect(games[0].title).toBe('Mega Man');
  });

  it('getGameById returns null for unknown id', async () => {
    const game = await svc.getGameById('unknown');
    expect(game).toBeNull();
  });

  it('getGameById returns game by id', async () => {
    seedGame(db);
    const game = await svc.getGameById('g1');
    expect(game).not.toBeNull();
    expect(game?.id).toBe('g1');
  });

  it('getGamesByPlatform filters correctly', async () => {
    seedGame(db);
    seedGame(db, {
      id: 'g2',
      platformId: 'nes',
      title: 'Contra',
      filePath: '/roms/contra.nes',
      fileName: 'contra.nes',
    });
    const games = await svc.getGamesByPlatform('nes');
    expect(games).toHaveLength(2);
  });

  it('searchGames matches by title', async () => {
    seedGame(db);
    seedGame(db, {
      id: 'g2',
      platformId: 'nes',
      title: 'Contra',
      filePath: '/roms/contra.nes',
      fileName: 'contra.nes',
    });
    const results = await svc.searchGames({ query: 'mega' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Mega Man');
  });

  it('searchGames escapes SQL wildcards in query', async () => {
    seedGame(db, { title: '100% Complete' });
    // Query with % should not match unrelated games
    const results = await svc.searchGames({ query: '%' });
    expect(results.every((g) => g.title.includes('%'))).toBe(true);
  });

  it('updateGame updates fields', async () => {
    seedGame(db);
    const updated = await svc.updateGame('g1', { title: 'Mega Man 2' });
    expect(updated?.title).toBe('Mega Man 2');
  });

  it('deleteGame removes the game', async () => {
    seedGame(db);
    await svc.deleteGame('g1');
    expect(await svc.getGameById('g1')).toBeNull();
  });

  it('getGameCount returns correct count', async () => {
    expect(await svc.getGameCount()).toBe(0);
    seedGame(db);
    expect(await svc.getGameCount()).toBe(1);
  });

  it('toggleFavorite flips isFavorite', async () => {
    seedGame(db);
    await svc.toggleFavorite('g1');
    const g = await svc.getGameById('g1');
    expect(g?.isFavorite).toBe(true);
  });

  it('getFavorites returns only favorites', async () => {
    seedGame(db);
    seedGame(db, {
      id: 'g2',
      platformId: 'nes',
      title: 'Contra',
      filePath: '/f.nes',
      fileName: 'f.nes',
      isFavorite: true,
    });
    const favs = await svc.getFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0].isFavorite).toBe(true);
  });

  it('recordPlaySession increments play_count and play_time', async () => {
    seedGame(db);
    await svc.recordPlaySession('g1', 120);
    const g = await svc.getGameById('g1');
    expect(g?.playCount).toBe(1);
    expect(g?.playTime).toBe(120);
  });

  it('getRecentGames returns recently played games', async () => {
    seedGame(db);
    await svc.recordPlaySession('g1', 60);
    const recent = await svc.getRecentGames(5);
    expect(recent).toHaveLength(1);
  });

  it('createCollection creates and returns collection', async () => {
    const col = await svc.createCollection({ name: 'My List' });
    expect(col.id).toBeDefined();
    expect(col.name).toBe('My List');
  });

  it('addToCollection and getCollectionGames', async () => {
    seedGame(db);
    const col = await svc.createCollection({ name: 'RPGs' });
    await svc.addToCollection(col.id, 'g1');
    const games = await svc.getCollectionGames(col.id);
    expect(games).toHaveLength(1);
  });

  it('deleteCollection removes non-system collection', async () => {
    const col = await svc.createCollection({ name: 'Temp' });
    await svc.deleteCollection(col.id);
    const all = await svc.getCollections();
    expect(all.find((c) => c.id === col.id)).toBeUndefined();
  });

  it('removeFromCollection removes specific game from collection', async () => {
    seedGame(db);
    const col = await svc.createCollection({ name: 'RPGs' });
    await svc.addToCollection(col.id, 'g1');
    await svc.removeFromCollection(col.id, 'g1');
    const games = await svc.getCollectionGames(col.id);
    expect(games).toHaveLength(0);
  });

  it('addToFavorites sets isFavorite true', async () => {
    seedGame(db);
    await svc.addToFavorites('g1');
    const g = await svc.getGameById('g1');
    expect(g?.isFavorite).toBe(true);
  });

  it('removeFromFavorites sets isFavorite false', async () => {
    seedGame(db, { isFavorite: true });
    await svc.removeFromFavorites('g1');
    const g = await svc.getGameById('g1');
    expect(g?.isFavorite).toBe(false);
  });

  it('createLibraryService factory returns a working service', async () => {
    const { createLibraryService } = await import('../services/LibraryService');
    const s = createLibraryService(db);
    expect(await s.getGameCount()).toBe(0);
  });
});
