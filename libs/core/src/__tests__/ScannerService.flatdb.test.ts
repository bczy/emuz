/**
 * ScannerService — FlatDb (flat-file storage engine) tests.
 * Mirrors ScannerService.drizzle.test.ts but uses @emuz/storage instead of Drizzle ORM.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FlatDb } from '@emuz/storage';
import { createFlatDb } from '@emuz/storage';
import type { FileIO } from '@emuz/storage';
import { ScannerService } from '../services/ScannerService';

// ---------------------------------------------------------------------------
// In-memory FileIO mock for createFlatDb
// ---------------------------------------------------------------------------
function createMemoryIO(): FileIO {
  const files = new Map<string, string>();
  return {
    files,
    async readText(p: string) {
      return files.get(p) ?? '';
    },
    async writeText(p: string, c: string) {
      files.set(p, c);
    },
    async rename(f: string, t: string) {
      const c = files.get(f);
      if (c !== undefined) {
        files.set(t, c);
        files.delete(f);
      }
    },
    async exists(p: string) {
      return files.has(p);
    },
    async mkdir(p: string) {
      files.set(p, '');
    },
    joinPath: (...parts: string[]) => parts.join('/'),
  } as unknown as FileIO;
}

// ---------------------------------------------------------------------------
// Mock filesystem adapter (used by ScannerService for ROM scanning)
// ---------------------------------------------------------------------------
const mockFs = {
  exists: vi.fn().mockResolvedValue(true),
  readDir: vi.fn().mockResolvedValue([]),
  stat: vi.fn().mockResolvedValue({ size: 1024 }),
  readFile: vi.fn(),
  readBinary: vi.fn(),
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
let db: FlatDb;
let svc: ScannerService;

beforeEach(async () => {
  db = createFlatDb('/test', createMemoryIO());
  await db.open(); // loads platform seeds (nes, snes, gba, ps1, …)
  svc = new ScannerService(db, mockFs);
  vi.clearAllMocks();
  // Re-apply default mock values after clearAllMocks()
  mockFs.exists.mockResolvedValue(true);
  mockFs.readDir.mockResolvedValue([]);
  mockFs.stat.mockResolvedValue({ size: 1024 });
});

// ---------------------------------------------------------------------------
// Tests (same cases as ScannerService.drizzle.test.ts)
// ---------------------------------------------------------------------------
describe('ScannerService (FlatDb)', () => {
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

  it('detectPlatform returns real platform name from DB, not synthetic uppercase (P-20)', async () => {
    const platform = await svc.detectPlatform('/roms/game.nes');
    expect(platform?.name).toBe('Nintendo Entertainment System');
  });

  it('detectPlatform returns null when platform is not in DB (P-20)', async () => {
    // .xci maps to 'switch' which is NOT in the seed platforms
    const platform = await svc.detectPlatform('/roms/game.xci');
    expect(platform).toBeNull();
  });

  it('scan skips games when platform is not in DB (P-20)', async () => {
    // .xci maps to 'switch' — not in seed platforms
    mockFs.readDir.mockResolvedValue([
      { name: 'game.xci', path: '/roms/game.xci', isDirectory: false },
    ]);
    const progress = [];
    for await (const p of svc.scan('/roms', { recursive: false })) {
      progress.push(p);
    }
    expect(db.games.all()).toHaveLength(0);
  });

  it('scan skips existing files when skipExisting=true', async () => {
    // Pre-seed a game with the same path directly into the store
    const now = new Date();
    db.games.insert({
      id: 'existing',
      platform_id: 'nes',
      title: 'Existing',
      file_path: '/roms/game.nes',
      file_name: 'game.nes',
      file_size: null,
      file_hash: null,
      cover_path: null,
      description: null,
      developer: null,
      publisher: null,
      release_date: null,
      genre: null,
      rating: null,
      play_count: 0,
      play_time: 0,
      last_played_at: null,
      is_favorite: false,
      created_at: now,
      updated_at: now,
    });

    mockFs.readDir.mockResolvedValue([
      { name: 'game.nes', path: '/roms/game.nes', isDirectory: false },
    ]);
    const progress = [];
    for await (const p of svc.scan('/roms', { skipExisting: true })) {
      progress.push(p);
    }
    // Should not add the game again
    expect(db.games.all()).toHaveLength(1);
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
