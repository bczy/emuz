/**
 * MetadataService — Drizzle in-memory tests.
 * RED until: schema exports Drizzle tables AND MetadataService accepts DrizzleDb.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@emuz/database/schema';
import type { DrizzleDb } from '@emuz/database/schema';
import { MetadataService } from '../services/MetadataService';
import type { MetadataProvider } from '../services/MetadataService';

let sqlite: InstanceType<typeof Database>;
let db: DrizzleDb;
let svc: MetadataService;

const mockFs = {
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeBinary: vi.fn().mockResolvedValue(undefined),
};

function setupTables(d: DrizzleDb): void {
  d.run(
    sql`CREATE TABLE IF NOT EXISTS platforms (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, manufacturer TEXT, generation INTEGER, release_year INTEGER, icon_path TEXT, wallpaper_path TEXT, color TEXT, rom_extensions TEXT NOT NULL DEFAULT '[]', created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, platform_id TEXT NOT NULL, title TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT NOT NULL, file_size INTEGER, file_hash TEXT, cover_path TEXT, description TEXT, developer TEXT, publisher TEXT, release_date TEXT, genre TEXT, rating REAL, play_count INTEGER DEFAULT 0, play_time INTEGER DEFAULT 0, last_played_at INTEGER, is_favorite INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
}

function seedGame(d: DrizzleDb): void {
  d.insert(schema.platforms)
    .values({
      id: 'nes',
      name: 'NES',
      romExtensions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
  d.insert(schema.games)
    .values({
      id: 'g1',
      platformId: 'nes',
      title: 'Mega Man',
      filePath: '/f.nes',
      fileName: 'f.nes',
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
  svc = new MetadataService(db, mockFs as any);
  vi.clearAllMocks();
});

afterEach(() => sqlite.close());

describe('MetadataService (Drizzle)', () => {
  it('searchMetadata returns empty without providers', async () => {
    const results = await svc.searchMetadata('Mega Man');
    expect(results).toHaveLength(0);
  });

  it('searchMetadata returns results from provider', async () => {
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man', developer: 'Capcom' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);
    const results = await svc.searchMetadata('Mega Man');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Mega Man');
  });

  it('searchMetadata caches results', async () => {
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);
    await svc.searchMetadata('Mega Man');
    await svc.searchMetadata('Mega Man');
    expect(mockProvider.search).toHaveBeenCalledTimes(1);
  });

  it('identifyGame returns null if no metadata found', async () => {
    seedGame(db);
    const game = {
      id: 'g1',
      platformId: 'nes',
      title: 'Unknown ROM',
      filePath: '/f.nes',
      fileName: 'f.nes',
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await svc.identifyGame(game);
    expect(result).toBeNull();
  });

  it('identifyGame returns cached DB metadata', async () => {
    seedGame(db);
    db.update(schema.games).set({ description: 'Classic action game' }).run();
    const game = {
      id: 'g1',
      platformId: 'nes',
      title: 'Mega Man',
      filePath: '/f.nes',
      fileName: 'f.nes',
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await svc.identifyGame(game);
    expect(result?.description).toBe('Classic action game');
  });

  it('clearCache resets in-memory caches', async () => {
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);
    await svc.searchMetadata('Mega Man');
    svc.clearCache();
    await svc.searchMetadata('Mega Man');
    expect(mockProvider.search).toHaveBeenCalledTimes(2);
  });

  it('continues if a provider throws', async () => {
    const brokenProvider: MetadataProvider = {
      name: 'broken',
      search: vi.fn().mockRejectedValue(new Error('network error')),
      getById: vi.fn(),
    };
    const goodProvider: MetadataProvider = {
      name: 'good',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(brokenProvider);
    svc.registerProvider(goodProvider);
    const results = await svc.searchMetadata('Mega Man');
    expect(results).toHaveLength(1);
  });

  it('getCoverPath returns expected path', () => {
    const path = svc.getCoverPath('game-1');
    expect(path).toContain('game-1');
  });

  it('downloadCover writes file and updates DB cover path', async () => {
    seedGame(db);
    const fakeBuffer = new ArrayBuffer(8);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(fakeBuffer),
    });
    vi.stubGlobal('fetch', mockFetch);

    const coverPath = await svc.downloadCover('g1', 'https://example.com/cover.png');
    expect(mockFs.writeBinary).toHaveBeenCalledWith(
      expect.stringContaining('g1'),
      expect.any(Uint8Array)
    );
    expect(coverPath).toContain('g1');

    vi.unstubAllGlobals();
  });

  it('downloadCover throws if fetch fails', async () => {
    seedGame(db);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(svc.downloadCover('g1', 'https://example.com/cover.png')).rejects.toThrow(
      'Failed to download cover'
    );
    vi.unstubAllGlobals();
  });

  it('refreshMetadata generator processes games and yields progress', async () => {
    seedGame(db);
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man', description: 'Action' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);

    const progress = [];
    for await (const p of svc.refreshMetadata(['g1'])) {
      progress.push(p);
    }
    const last = progress[progress.length - 1];
    expect(last.phase).toBe('complete');
    expect(last.gamesProcessed).toBe(1);
    expect(last.found).toBe(1);
  });

  it('refreshMetadata handles unknown gameId gracefully', async () => {
    const progress = [];
    for await (const p of svc.refreshMetadata(['nonexistent'])) {
      progress.push(p);
    }
    const last = progress[progress.length - 1];
    expect(last.errors.length).toBeGreaterThan(0);
  });

  it('identifyGame uses provider when no DB metadata', async () => {
    seedGame(db);
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man', developer: 'Capcom' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);
    const game = {
      id: 'g1',
      platformId: 'nes',
      title: 'Mega Man (USA)',
      filePath: '/f.nes',
      fileName: 'f.nes',
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await svc.identifyGame(game);
    expect(result?.developer).toBe('Capcom');
  });
});
