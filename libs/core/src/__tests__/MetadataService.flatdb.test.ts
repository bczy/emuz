/**
 * MetadataService — FlatDb in-memory tests.
 * Mirrors MetadataService.drizzle.test.ts but uses the @emuz/storage flat-file engine.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFlatDb } from '@emuz/storage';
import type { FlatDb, FileIO, GameRow } from '@emuz/storage';
import { MetadataService } from '../services/MetadataService';
import type { MetadataProvider } from '../services/MetadataService';

const GAME_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

// ---------------------------------------------------------------------------
// In-memory FileIO
// ---------------------------------------------------------------------------
function createMemoryIO(): FileIO {
  const files = new Map<string, string>();
  return {
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
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BASE_GAME_ROW: GameRow = {
  id: GAME_ID,
  platform_id: 'nes',
  title: 'Mega Man',
  file_path: '/f.nes',
  file_name: 'f.nes',
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
  created_at: new Date(),
  updated_at: new Date(),
};

const mockFs = {
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeBinary: vi.fn().mockResolvedValue(undefined),
};

let db: FlatDb;
let svc: MetadataService;

beforeEach(async () => {
  db = createFlatDb('/test', createMemoryIO());
  await db.open();
  svc = new MetadataService(db, mockFs as any);
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('MetadataService (FlatDb)', () => {
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
    db.games.insert({ ...BASE_GAME_ROW });
    const game = {
      id: GAME_ID,
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
    db.games.insert({ ...BASE_GAME_ROW, description: 'Classic action game' });
    const game = {
      id: GAME_ID,
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

  it('downloadCover writes file and updates store cover path', async () => {
    db.games.insert({ ...BASE_GAME_ROW });
    const fakeBuffer = new ArrayBuffer(8);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(fakeBuffer),
    });
    vi.stubGlobal('fetch', mockFetch);

    const coverPath = await svc.downloadCover(GAME_ID, 'https://example.com/cover.png');
    expect(mockFs.writeBinary).toHaveBeenCalledWith(
      expect.stringContaining(GAME_ID),
      expect.any(Uint8Array)
    );
    expect(coverPath).toContain(GAME_ID);

    // Verify the store was updated
    const row = db.games.findById(GAME_ID);
    expect(row?.cover_path).toContain(GAME_ID);

    vi.unstubAllGlobals();
  });

  it('downloadCover throws if fetch fails', async () => {
    db.games.insert({ ...BASE_GAME_ROW });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(svc.downloadCover(GAME_ID, 'https://example.com/cover.png')).rejects.toThrow(
      'Failed to download cover'
    );
    vi.unstubAllGlobals();
  });

  it('refreshMetadata generator processes games and yields progress', async () => {
    db.games.insert({ ...BASE_GAME_ROW });
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man', description: 'Action' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);

    const progress = [];
    for await (const p of svc.refreshMetadata([GAME_ID])) {
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

  describe('path and UUID safety (P-05)', () => {
    it('throws when coverCacheDir is a relative path', () => {
      expect(() => new MetadataService(db, mockFs as any, '.emuz/covers')).toThrow(/absolute/i);
    });

    it('accepts an absolute coverCacheDir on Unix', () => {
      expect(() => new MetadataService(db, mockFs as any, '/tmp/covers')).not.toThrow();
    });

    it('rejects a gameId containing path traversal in downloadCover', async () => {
      const safeSvc = new MetadataService(db, mockFs as any, '/tmp/covers');
      await expect(
        safeSvc.downloadCover('../../etc/passwd', 'https://example.com/cover.png')
      ).rejects.toThrow(/invalid gameId/i);
    });

    it('accepts a valid UUID in downloadCover', async () => {
      db.games.insert({ ...BASE_GAME_ROW });
      const fakeBuffer = new ArrayBuffer(8);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          arrayBuffer: vi.fn().mockResolvedValue(fakeBuffer),
        })
      );
      const safeSvc = new MetadataService(db, mockFs as any, '/tmp/covers');
      await expect(
        safeSvc.downloadCover(GAME_ID, 'https://example.com/cover.png')
      ).resolves.not.toThrow();
      vi.unstubAllGlobals();
    });
  });

  it('identifyGame uses provider when no DB metadata', async () => {
    db.games.insert({ ...BASE_GAME_ROW });
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([{ title: 'Mega Man', developer: 'Capcom' }]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);
    const game = {
      id: GAME_ID,
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

  it('applyMetadata updates game fields in store', async () => {
    db.games.insert({ ...BASE_GAME_ROW });
    const mockProvider: MetadataProvider = {
      name: 'mock',
      search: vi.fn().mockResolvedValue([
        {
          title: 'Mega Man',
          description: 'Action platformer',
          developer: 'Capcom',
          genre: 'Action',
          rating: 9,
        },
      ]),
      getById: vi.fn(),
    };
    svc.registerProvider(mockProvider);

    const progress = [];
    for await (const p of svc.refreshMetadata([GAME_ID])) {
      progress.push(p);
    }

    const row = db.games.findById(GAME_ID);
    expect(row?.description).toBe('Action platformer');
    expect(row?.developer).toBe('Capcom');
    expect(row?.genre).toBe('Action');
    expect(row?.rating).toBe(9);
  });
});
