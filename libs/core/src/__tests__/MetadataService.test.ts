/**
 * MetadataService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { MetadataService, type MetadataProvider } from '../services/MetadataService';
import type { DatabaseAdapter } from '@emuz/database';
import type { FileSystemAdapter } from '@emuz/platform';
import type { Game } from '../models/Game';

function createMockDb(): DatabaseAdapter & { query: Mock; execute: Mock } {
  return {
    open: vi.fn(),
    close: vi.fn(),
    isConnected: vi.fn(() => true),
    execute: vi.fn(),
    query: vi.fn().mockResolvedValue([]),
    transaction: vi.fn(<T>(fn: () => Promise<T>) => fn()),
  };
}

function createMockFs(): FileSystemAdapter & Record<string, Mock> {
  return {
    readText: vi.fn(),
    readBinary: vi.fn(),
    writeText: vi.fn(),
    writeBinary: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    exists: vi.fn().mockResolvedValue(false),
    stat: vi.fn(),
    list: vi.fn(),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rmdir: vi.fn(),
    copy: vi.fn(),
    move: vi.fn(),
    getDocumentsPath: vi.fn().mockResolvedValue('/docs'),
    getCachePath: vi.fn().mockResolvedValue('/cache'),
    scanForRoms: vi.fn(),
    requestReadPermission: vi.fn().mockResolvedValue(true),
    requestWritePermission: vi.fn().mockResolvedValue(true),
  } as unknown as FileSystemAdapter & Record<string, Mock>;
}

function createMockProvider(
  name: string,
  results: import('../models/Game').GameMetadata[] = []
): MetadataProvider {
  return {
    name,
    search: vi.fn().mockResolvedValue(results),
    getById: vi.fn().mockResolvedValue(null),
  };
}

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game-1',
    platformId: 'platform-1',
    title: 'Super Mario Bros',
    filePath: '/roms/mario.nes',
    fileName: 'mario.nes',
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('MetadataService', () => {
  let service: MetadataService;
  let db: ReturnType<typeof createMockDb>;
  let fs: ReturnType<typeof createMockFs>;

  beforeEach(() => {
    db = createMockDb();
    fs = createMockFs();
    service = new MetadataService(db, fs as unknown as FileSystemAdapter, '/covers');
    vi.clearAllMocks();
    db.query.mockResolvedValue([]);
  });

  // ─── searchMetadata ────────────────────────────────────────────────────────

  describe('searchMetadata', () => {
    it('returns empty array when no providers registered', async () => {
      const results = await service.searchMetadata('Mario');
      expect(results).toEqual([]);
    });

    it('returns merged results from all providers', async () => {
      const provider1 = createMockProvider('p1', [{ title: 'Mario', developer: 'Nintendo' }]);
      const provider2 = createMockProvider('p2', [{ title: 'Mario Bros', developer: 'Nintendo' }]);
      service.registerProvider(provider1);
      service.registerProvider(provider2);

      const results = await service.searchMetadata('Mario');
      expect(results).toHaveLength(2);
    });

    it('deduplicates results with same title+developer', async () => {
      const dupe = { title: 'Mario', developer: 'Nintendo' };
      const provider1 = createMockProvider('p1', [dupe]);
      const provider2 = createMockProvider('p2', [dupe]);
      service.registerProvider(provider1);
      service.registerProvider(provider2);

      const results = await service.searchMetadata('Mario');
      expect(results).toHaveLength(1);
    });

    it('caches results — provider is called only once for same query', async () => {
      const provider = createMockProvider('p1', [{ title: 'Mario' }]);
      service.registerProvider(provider);

      await service.searchMetadata('Mario');
      await service.searchMetadata('Mario');

      expect(provider.search).toHaveBeenCalledTimes(1);
    });

    it('uses separate cache entries per platformId', async () => {
      const provider = createMockProvider('p1', [{ title: 'Mario' }]);
      service.registerProvider(provider);

      await service.searchMetadata('Mario', 'nes');
      await service.searchMetadata('Mario', 'snes');

      expect(provider.search).toHaveBeenCalledTimes(2);
    });

    it('clears cache on clearCache()', async () => {
      const provider = createMockProvider('p1', [{ title: 'Mario' }]);
      service.registerProvider(provider);

      await service.searchMetadata('Mario');
      service.clearCache();
      await service.searchMetadata('Mario');

      expect(provider.search).toHaveBeenCalledTimes(2);
    });

    it('continues if one provider throws', async () => {
      const broken = createMockProvider('broken');
      (broken.search as Mock).mockRejectedValue(new Error('network error'));
      const good = createMockProvider('good', [{ title: 'Mario' }]);
      service.registerProvider(broken);
      service.registerProvider(good);

      const results = await service.searchMetadata('Mario');
      expect(results).toHaveLength(1);
    });
  });

  // ─── identifyGame ──────────────────────────────────────────────────────────

  describe('identifyGame', () => {
    it('returns null when no providers and no DB metadata', async () => {
      const result = await service.identifyGame(makeGame());
      expect(result).toBeNull();
    });

    it('returns DB metadata without calling providers (DB cache)', async () => {
      db.query.mockResolvedValue([
        {
          title: 'Super Mario Bros',
          description: 'Platform game',
          developer: 'Nintendo',
          publisher: null,
          release_date: null,
          genre: null,
          rating: null,
        },
      ]);

      const provider = createMockProvider('p1', [{ title: 'Mario' }]);
      service.registerProvider(provider);

      const result = await service.identifyGame(makeGame());

      expect(result?.description).toBe('Platform game');
      expect(provider.search).not.toHaveBeenCalled();
    });

    it('caches result in memory — DB queried only once per game', async () => {
      const game = makeGame();
      const provider = createMockProvider('p1', [{ title: 'Mario' }]);
      service.registerProvider(provider);

      await service.identifyGame(game);
      await service.identifyGame(game);

      // DB only queried once (first call), second uses in-memory cache
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('falls back to title search when no DB metadata', async () => {
      const provider = createMockProvider('p1', [
        { title: 'Super Mario Bros', developer: 'Nintendo' },
      ]);
      service.registerProvider(provider);

      const result = await service.identifyGame(makeGame());
      expect(result?.title).toBe('Super Mario Bros');
    });

    it('cleans title before searching (strips brackets)', async () => {
      const provider = createMockProvider('p1', []);
      service.registerProvider(provider);

      await service.identifyGame(makeGame({ title: 'Mario (USA) [!]' }));

      expect(provider.search).toHaveBeenCalledWith('Mario', 'platform-1');
    });

    it('caches null result to avoid re-fetching not-found games', async () => {
      const provider = createMockProvider('p1', []);
      service.registerProvider(provider);
      const game = makeGame();

      await service.identifyGame(game);
      await service.identifyGame(game);

      expect(provider.search).toHaveBeenCalledTimes(1);
    });
  });

  // ─── downloadCover ─────────────────────────────────────────────────────────

  describe('downloadCover', () => {
    it('downloads, writes file, and updates DB', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as unknown as Response);

      const path = await service.downloadCover('game-1', 'https://example.com/cover.jpg');

      expect(path).toBe('/covers/game-1.jpg');
      expect(fs.writeBinary).toHaveBeenCalled();
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE games SET cover_path'),
        expect.arrayContaining(['game-1'])
      );
    });

    it('throws when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      await expect(
        service.downloadCover('game-1', 'https://example.com/cover.jpg')
      ).rejects.toThrow('Failed to download cover for game game-1');
    });

    it('infers extension from URL', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as unknown as Response);

      const path = await service.downloadCover('game-1', 'https://example.com/cover.png?v=2');
      expect(path).toContain('.png');
    });
  });

  // ─── getCoverPath ──────────────────────────────────────────────────────────

  describe('getCoverPath', () => {
    it('returns path under cover cache dir', () => {
      expect(service.getCoverPath('game-42')).toBe('/covers/game-42');
    });
  });

  // ─── refreshMetadata ───────────────────────────────────────────────────────

  describe('refreshMetadata', () => {
    it('yields progress for each game and completes', async () => {
      db.query
        // getGameById → returns game row (called first in refreshMetadata)
        .mockResolvedValueOnce([
          {
            id: 'game-1',
            platform_id: 'platform-1',
            title: 'Mario',
            file_path: '/roms/mario.nes',
            file_name: 'mario.nes',
            file_hash: null,
          },
        ])
        // identifyGame → getExistingMetadata → no existing DB metadata
        .mockResolvedValueOnce([]);

      const provider = createMockProvider('p1', [{ title: 'Mario', developer: 'Nintendo' }]);
      service.registerProvider(provider);

      const updates: import('../services/types').MetadataProgress[] = [];
      for await (const update of service.refreshMetadata(['game-1'])) {
        updates.push(update);
      }

      const last = updates[updates.length - 1];
      expect(last.phase).toBe('complete');
      expect(last.gamesTotal).toBe(1);
    });

    it('counts not-found games correctly', async () => {
      db.query
        // getGameById → returns game (called first)
        .mockResolvedValueOnce([
          {
            id: 'game-1',
            platform_id: 'p1',
            title: 'Unknown',
            file_path: '/roms/x.bin',
            file_name: 'x.bin',
            file_hash: null,
          },
        ])
        // identifyGame → getExistingMetadata → no DB metadata
        .mockResolvedValueOnce([]);

      const updates: import('../services/types').MetadataProgress[] = [];
      for await (const update of service.refreshMetadata(['game-1'])) {
        updates.push(update);
      }

      const last = updates[updates.length - 1];
      expect(last.notFound).toBe(1);
      expect(last.found).toBe(0);
    });

    it('records error when game not found in DB', async () => {
      db.query.mockResolvedValue([]);

      const updates: import('../services/types').MetadataProgress[] = [];
      for await (const update of service.refreshMetadata(['missing-id'])) {
        updates.push(update);
      }

      const last = updates[updates.length - 1];
      expect(last.errors).toHaveLength(1);
      expect(last.errors[0]).toContain('missing-id');
    });
  });
});
