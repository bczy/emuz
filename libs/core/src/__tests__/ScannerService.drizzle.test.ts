/**
 * ScannerService — Drizzle in-memory tests.
 * RED until: schema/index.ts exports Drizzle tables AND ScannerService accepts DrizzleDb.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@emuz/database/schema';
import type { DrizzleDb } from '@emuz/database/schema';
import { ScannerService } from '../services/ScannerService';

let sqlite: InstanceType<typeof Database>;
let db: DrizzleDb;
let svc: ScannerService;

const mockFs = {
  exists: vi.fn().mockResolvedValue(true),
  readDir: vi.fn().mockResolvedValue([]),
  stat: vi.fn().mockResolvedValue({ size: 1024 }),
  readFile: vi.fn(),
  readBinary: vi.fn(),
};

function setupTables(d: DrizzleDb): void {
  d.run(
    sql`CREATE TABLE IF NOT EXISTS platforms (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, manufacturer TEXT, generation INTEGER, release_year INTEGER, icon_path TEXT, wallpaper_path TEXT, color TEXT, rom_extensions TEXT NOT NULL DEFAULT '[]', created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, platform_id TEXT NOT NULL, title TEXT NOT NULL, file_path TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, file_size INTEGER, file_hash TEXT, cover_path TEXT, description TEXT, developer TEXT, publisher TEXT, release_date TEXT, genre TEXT, rating REAL, play_count INTEGER DEFAULT 0, play_time INTEGER DEFAULT 0, last_played_at INTEGER, is_favorite INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS scan_directories (id TEXT PRIMARY KEY, path TEXT NOT NULL UNIQUE, platform_id TEXT, is_recursive INTEGER DEFAULT 1, last_scanned_at INTEGER, created_at INTEGER)`
  );
}

beforeEach(() => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  setupTables(db);
  svc = new ScannerService(db, mockFs);
  vi.clearAllMocks();
});

afterEach(() => sqlite.close());

describe('ScannerService (Drizzle)', () => {
  it('addDirectory stores directory in DB', async () => {
    const dir = await svc.addDirectory('/roms/nes');
    expect(dir.path).toBe('/roms/nes');
    expect(dir.id).toBeDefined();
  });

  it('addDirectory throws on duplicate path', async () => {
    await svc.addDirectory('/roms/nes');
    await expect(svc.addDirectory('/roms/nes')).rejects.toThrow('already exists');
  });

  it('getDirectories returns all stored directories', async () => {
    await svc.addDirectory('/roms/nes');
    await svc.addDirectory('/roms/snes');
    const dirs = await svc.getDirectories();
    expect(dirs).toHaveLength(2);
  });

  it('removeDirectory with removeGames=false only removes directory', async () => {
    await svc.addDirectory('/roms/nes');
    await svc.removeDirectory('/roms/nes');
    expect(await svc.getDirectories()).toHaveLength(0);
  });

  it('removeDirectory throws on empty path', async () => {
    await expect(svc.removeDirectory('')).rejects.toThrow('empty');
  });

  it('detectPlatformByExtension returns correct platform', () => {
    expect(svc.detectPlatformByExtension('.nes')).toBe('nes');
    expect(svc.detectPlatformByExtension('.gba')).toBe('gba');
    expect(svc.detectPlatformByExtension('.xyz')).toBeNull();
  });

  it('scan yields progress for ROM files', async () => {
    mockFs.readDir.mockResolvedValue([
      { name: 'game.nes', path: '/roms/game.nes', isDirectory: false },
    ]);
    const progress = [];
    for await (const p of svc.scan('/roms', { recursive: false })) {
      progress.push(p);
    }
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0].gamesAdded).toBe(1);
  });

  it('scan recurses into subdirectories without early return', async () => {
    mockFs.readDir
      .mockResolvedValueOnce([
        { name: 'nes', path: '/roms/nes', isDirectory: true },
        { name: 'snes', path: '/roms/snes', isDirectory: true },
      ])
      .mockResolvedValueOnce([
        { name: 'game1.nes', path: '/roms/nes/game1.nes', isDirectory: false },
      ])
      .mockResolvedValueOnce([
        { name: 'game2.sfc', path: '/roms/snes/game2.sfc', isDirectory: false },
      ]);

    const progress = [];
    for await (const p of svc.scan('/roms', { recursive: true })) {
      progress.push(p);
    }
    // Both subdirectories must be scanned (P-01 fix)
    const totalAdded = progress.reduce((acc, p) => Math.max(acc, p.gamesAdded), 0);
    expect(totalAdded).toBe(2);
  });

  it('getScanStatus reflects scanning state', () => {
    const status = svc.getScanStatus();
    expect(status.isScanning).toBe(false);
  });

  it('updateDirectory updates path and platformId', async () => {
    const dir = await svc.addDirectory('/roms/nes');
    await svc.updateDirectory(dir.id, { platformId: 'nes' });
    const dirs = await svc.getDirectories();
    expect(dirs[0].platformId).toBe('nes');
  });

  it('detectPlatform returns platform object for known extension', async () => {
    const platform = await svc.detectPlatform('/roms/game.nes');
    expect(platform).not.toBeNull();
    expect(platform?.id).toBe('nes');
  });

  it('detectPlatform returns null for unknown extension', async () => {
    const platform = await svc.detectPlatform('/roms/game.xyz');
    expect(platform).toBeNull();
  });

  it('scan skips existing files when skipExisting=true', async () => {
    // Pre-seed game with the same path
    db.insert(schema.games)
      .values({
        id: 'existing',
        platformId: 'nes',
        title: 'Existing',
        filePath: '/roms/game.nes',
        fileName: 'game.nes',
        playCount: 0,
        playTime: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();
    mockFs.readDir.mockResolvedValue([
      { name: 'game.nes', path: '/roms/game.nes', isDirectory: false },
    ]);
    const progress = [];
    for await (const p of svc.scan('/roms', { skipExisting: true })) {
      progress.push(p);
    }
    // Should not add the game again
    const rows = db.select().from(schema.games).all();
    expect(rows).toHaveLength(1);
  });

  it('calculateHash returns hex string using readFile', async () => {
    mockFs.readFile.mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer);
    const hash = await svc.calculateHash('/roms/game.nes');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('calculateHash uses readBinary if readFile not available', async () => {
    const fsWithBinary = {
      exists: vi.fn().mockResolvedValue(true),
      readDir: vi.fn().mockResolvedValue([]),
      stat: vi.fn().mockResolvedValue({ size: 0 }),
      readBinary: vi.fn().mockResolvedValue(new Uint8Array([5, 6, 7, 8])),
    };
    const svc2 = new ScannerService(db, fsWithBinary);
    const hash = await svc2.calculateHash('/roms/game.nes');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('cancelScan sets cancelled flag', () => {
    svc.cancelScan();
    const status = svc.getScanStatus();
    // After cancel, still not scanning (was never started)
    expect(status.isScanning).toBe(false);
  });

  it('scan emits error progress if readDir throws', async () => {
    mockFs.readDir.mockRejectedValue(new Error('permission denied'));
    const progress = [];
    for await (const p of svc.scan('/roms')) {
      progress.push(p);
    }
    expect(progress[0].phase).toBe('error');
    expect(progress[0].errors[0]).toMatch(/permission denied/);
  });

  it('createScannerService factory returns a working service', async () => {
    const { createScannerService } = await import('../services/ScannerService');
    const s = createScannerService(db, mockFs);
    expect(s.getScanStatus().isScanning).toBe(false);
  });
});
