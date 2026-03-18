/**
 * Drizzle schema tests — RED phase: fail until schema/index.ts is implemented.
 *
 * Verifies: column types, FK constraints, JSON round-trip for array/JSON columns.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '../schema/index';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

let sqlite: InstanceType<typeof Database>;
let db: BetterSQLite3Database<typeof schema>;

function createTables(d: BetterSQLite3Database<typeof schema>): void {
  // Create tables inline for unit tests (no migration runner needed here)
  d.run(sql`CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    manufacturer TEXT,
    generation INTEGER,
    release_year INTEGER,
    icon_path TEXT,
    wallpaper_path TEXT,
    color TEXT,
    rom_extensions TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_hash TEXT,
    cover_path TEXT,
    description TEXT,
    developer TEXT,
    publisher TEXT,
    release_date TEXT,
    genre TEXT,
    rating REAL,
    play_count INTEGER DEFAULT 0,
    play_time INTEGER DEFAULT 0,
    last_played_at INTEGER,
    is_favorite INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS emulators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platforms TEXT NOT NULL DEFAULT '[]',
    executable_path TEXT,
    package_name TEXT,
    url_scheme TEXT,
    icon_path TEXT,
    command_template TEXT,
    core_path TEXT,
    is_default INTEGER DEFAULT 0,
    is_installed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_path TEXT,
    is_system INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS collection_games (
    collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    added_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (collection_id, game_id)
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS widgets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    size TEXT DEFAULT 'medium',
    position INTEGER NOT NULL,
    config TEXT,
    is_visible INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS genres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    color TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
  d.run(sql`CREATE TABLE IF NOT EXISTS scan_directories (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    platform_id TEXT REFERENCES platforms(id) ON DELETE SET NULL,
    is_recursive INTEGER DEFAULT 1,
    last_scanned_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
}

beforeEach(() => {
  sqlite = new Database(':memory:');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  db = drizzle(sqlite, { schema });
  createTables(db);
});

afterEach(() => {
  sqlite.close();
});

describe('Drizzle schema — platforms table', () => {
  it('exports platforms table definition', () => {
    expect(schema.platforms).toBeDefined();
    expect(schema.platforms[Symbol.for('drizzle:Name')]).toBe('platforms');
  });

  it('round-trips rom_extensions as a JSON array', () => {
    const extensions = ['.nes', '.unf', '.unif'];
    db.insert(schema.platforms)
      .values({
        id: 'nes',
        name: 'Nintendo Entertainment System',
        romExtensions: extensions,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    const [row] = db
      .select()
      .from(schema.platforms)
      .where(sql`${schema.platforms.id} = ${'nes'}`)
      .all();
    expect(row.romExtensions).toEqual(extensions);
  });

  it('stores timestamps as Unix seconds and returns Date objects', () => {
    const before = new Date();
    db.insert(schema.platforms)
      .values({
        id: 'snes',
        name: 'Super Nintendo',
        romExtensions: [],
        createdAt: before,
        updatedAt: before,
      })
      .run();

    const [row] = db.select().from(schema.platforms).all();
    expect(row.createdAt).toBeInstanceOf(Date);
    // Allow ±1 second for integer truncation
    expect(Math.abs(row.createdAt.getTime() - before.getTime())).toBeLessThan(2000);
  });
});

describe('Drizzle schema — games table', () => {
  beforeEach(() => {
    db.insert(schema.platforms)
      .values({
        id: 'nes',
        name: 'NES',
        romExtensions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();
  });

  it('exports games table definition', () => {
    expect(schema.games).toBeDefined();
  });

  it('enforces NOT NULL on platform_id with FK', () => {
    const insertWithBadPlatform = () =>
      db
        .insert(schema.games)
        .values({
          id: 'g1',
          platformId: 'nonexistent',
          title: 'Test Game',
          filePath: '/roms/test.nes',
          fileName: 'test.nes',
          playCount: 0,
          playTime: 0,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

    expect(insertWithBadPlatform).toThrow();
  });

  it('stores is_favorite as boolean and round-trips correctly', () => {
    db.insert(schema.games)
      .values({
        id: 'g1',
        platformId: 'nes',
        title: 'Mega Man',
        filePath: '/roms/megaman.nes',
        fileName: 'megaman.nes',
        playCount: 0,
        playTime: 0,
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    const [row] = db.select().from(schema.games).all();
    expect(row.isFavorite).toBe(true);
  });
});

describe('Drizzle schema — emulators table', () => {
  it('exports emulators table definition', () => {
    expect(schema.emulators).toBeDefined();
  });

  it('round-trips platforms (JSON array) correctly', () => {
    const platforms = ['nes', 'snes', 'n64'];
    db.insert(schema.emulators)
      .values({
        id: 'retroarch',
        name: 'RetroArch',
        platforms,
        isDefault: false,
        isInstalled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    const [row] = db.select().from(schema.emulators).all();
    expect(row.platforms).toEqual(platforms);
    expect(row.isDefault).toBe(false);
    expect(row.isInstalled).toBe(true);
  });
});

describe('Drizzle schema — collections + collection_games', () => {
  it('exports collections and collectionGames table definitions', () => {
    expect(schema.collections).toBeDefined();
    expect(schema.collectionGames).toBeDefined();
  });

  it('composite PK on collection_games prevents duplicates', () => {
    db.insert(schema.collections)
      .values({
        id: 'col1',
        name: 'Favorites',
        isSystem: false,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    db.insert(schema.platforms)
      .values({
        id: 'nes',
        name: 'NES',
        romExtensions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    db.insert(schema.games)
      .values({
        id: 'g1',
        platformId: 'nes',
        title: 'Game',
        filePath: '/f.nes',
        fileName: 'f.nes',
        playCount: 0,
        playTime: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    db.insert(schema.collectionGames)
      .values({
        collectionId: 'col1',
        gameId: 'g1',
        addedAt: new Date(),
      })
      .run();

    const duplicate = () =>
      db
        .insert(schema.collectionGames)
        .values({
          collectionId: 'col1',
          gameId: 'g1',
          addedAt: new Date(),
        })
        .run();

    expect(duplicate).toThrow();
  });
});

describe('Drizzle schema — widgets table', () => {
  it('exports widgets table definition', () => {
    expect(schema.widgets).toBeDefined();
  });

  it('round-trips config JSON object correctly', () => {
    const config = { limit: 10, showCovers: true };
    db.insert(schema.widgets)
      .values({
        id: 'w1',
        type: 'recent_games',
        size: 'medium',
        position: 0,
        config,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    const [row] = db.select().from(schema.widgets).all();
    expect(row.config).toEqual(config);
    expect(row.isVisible).toBe(true);
  });
});

describe('Drizzle schema — genres table', () => {
  it('exports genres table definition', () => {
    expect(schema.genres).toBeDefined();
  });
});

describe('Drizzle schema — settings table', () => {
  it('exports settings table definition', () => {
    expect(schema.settings).toBeDefined();
  });
});

describe('Drizzle schema — scan_directories table', () => {
  it('exports scanDirectories table definition', () => {
    expect(schema.scanDirectories).toBeDefined();
  });
});

describe('Drizzle schema — all tables exported in schema object', () => {
  it('exports a complete schema object for drizzle() initialization', () => {
    expect(schema.platforms).toBeDefined();
    expect(schema.games).toBeDefined();
    expect(schema.emulators).toBeDefined();
    expect(schema.collections).toBeDefined();
    expect(schema.collectionGames).toBeDefined();
    expect(schema.widgets).toBeDefined();
    expect(schema.genres).toBeDefined();
    expect(schema.settings).toBeDefined();
    expect(schema.scanDirectories).toBeDefined();
  });
});
