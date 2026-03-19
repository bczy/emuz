import { describe, it, expect, beforeEach } from 'vitest';
import { createFlatDb } from '../FlatDb';
import type { FileIO, FlatDb } from '../types.js';

// ---------------------------------------------------------------------------
// In-memory FileIO mock (same helper as Collection tests)
// ---------------------------------------------------------------------------
function createMemoryIO(): FileIO & { files: Map<string, string> } {
  const files = new Map<string, string>();
  return {
    files,
    async readText(p: string) {
      return files.get(p) ?? '';
    },
    async writeText(p: string, c: string) {
      files.set(p, c);
    },
    async rename(from: string, to: string) {
      const c = files.get(from);
      if (c !== undefined) {
        files.set(to, c);
        files.delete(from);
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

const DATA_DIR = '/data/emuz';

describe('FlatDb', () => {
  let io: ReturnType<typeof createMemoryIO>;
  let db: FlatDb;

  beforeEach(async () => {
    io = createMemoryIO();
    db = createFlatDb(DATA_DIR, io);
  });

  // 1. open() creates the data directory
  it('open() creates the data directory via io.mkdir', async () => {
    let mkdirCalled = false;
    const trackingIo: FileIO & { files: Map<string, string> } = {
      ...io,
      mkdir: async () => {
        mkdirCalled = true;
      },
    };
    const db2 = createFlatDb(DATA_DIR, trackingIo);
    await db2.open();
    expect(mkdirCalled).toBe(true);
  });

  // 2. open() seeds 25 platforms when platforms store is empty
  it('open() seeds 25 platforms when platforms store is empty', async () => {
    await db.open();
    expect(db.platforms.count()).toBe(25);
  });

  // 3. open() does NOT re-seed if platforms already exist
  it('open() does NOT re-seed if platforms already exist', async () => {
    await db.open();
    // Insert extra platform to test count stability
    db.platforms.insert({
      id: 'custom',
      name: 'Custom Platform',
      short_name: null,
      manufacturer: null,
      generation: null,
      release_year: null,
      icon_path: null,
      wallpaper_path: null,
      color: null,
      rom_extensions: [],
      created_at: new Date(),
      updated_at: new Date(),
    });
    await db.flush();

    // Re-open with same io (data already persisted)
    const db2 = createFlatDb(DATA_DIR, io);
    await db2.open();
    // Should still be 26 (25 seeded + 1 custom) — not 25 again
    expect(db2.platforms.count()).toBe(26);
  });

  // 4. After open(), all 10 stores are accessible and functional
  it('after open(), all 10 stores are accessible', async () => {
    await db.open();
    expect(db.platforms).toBeDefined();
    expect(db.games).toBeDefined();
    expect(db.emulators).toBeDefined();
    expect(db.collections).toBeDefined();
    expect(db.collectionGames).toBeDefined();
    expect(db.widgets).toBeDefined();
    expect(db.genres).toBeDefined();
    expect(db.settings).toBeDefined();
    expect(db.scanDirectories).toBeDefined();
    expect(db.playSessions).toBeDefined();

    // Each store should be functional
    db.games.insert({
      id: 'game-1',
      platform_id: 'nes',
      title: 'Test Game',
      file_path: '/roms/test.nes',
      file_name: 'test.nes',
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
    });
    expect(db.games.count()).toBe(1);
  });

  // 5. flush() persists mutations across instances
  it('flush() persists mutations so a new instance can read them', async () => {
    await db.open();
    db.games.insert({
      id: 'persistent-game',
      platform_id: 'snes',
      title: 'Persistent',
      file_path: '/roms/p.sfc',
      file_name: 'p.sfc',
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
    });
    await db.flush();

    const db2 = createFlatDb(DATA_DIR, io);
    await db2.open();
    expect(db2.games.findById('persistent-game')?.title).toBe('Persistent');
  });

  // 6. collectionGames.insert() prevents duplicate (collectionId, gameId) pairs
  it('collectionGames.insert() prevents duplicate pairs', async () => {
    await db.open();
    const row = { collection_id: 'col-1', game_id: 'game-1', added_at: new Date() };
    db.collectionGames.insert(row);
    expect(() => db.collectionGames.insert(row)).toThrow();
  });

  // 7. collectionGames.findByCollection() returns only matching rows
  it('collectionGames.findByCollection() returns only matching rows', async () => {
    await db.open();
    db.collectionGames.insert({ collection_id: 'col-A', game_id: 'g1', added_at: new Date() });
    db.collectionGames.insert({ collection_id: 'col-A', game_id: 'g2', added_at: new Date() });
    db.collectionGames.insert({ collection_id: 'col-B', game_id: 'g3', added_at: new Date() });

    const result = db.collectionGames.findByCollection('col-A');
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.collection_id === 'col-A')).toBe(true);
  });

  // 8. collectionGames.deleteByCollection() removes all rows for that collection
  it('collectionGames.deleteByCollection() removes all rows for the collection', async () => {
    await db.open();
    db.collectionGames.insert({ collection_id: 'col-X', game_id: 'g1', added_at: new Date() });
    db.collectionGames.insert({ collection_id: 'col-X', game_id: 'g2', added_at: new Date() });
    db.collectionGames.insert({ collection_id: 'col-Y', game_id: 'g3', added_at: new Date() });

    db.collectionGames.deleteByCollection('col-X');
    expect(db.collectionGames.findByCollection('col-X')).toHaveLength(0);
    // col-Y should be unaffected
    expect(db.collectionGames.findByCollection('col-Y')).toHaveLength(1);
  });

  // 9. close() flushes before releasing
  it('close() flushes mutations before releasing', async () => {
    await db.open();
    db.games.insert({
      id: 'close-game',
      platform_id: 'gb',
      title: 'Close Test',
      file_path: '/roms/close.gb',
      file_name: 'close.gb',
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
    });
    await db.close();

    // A new instance should see the flushed data
    const db2 = createFlatDb(DATA_DIR, io);
    await db2.open();
    expect(db2.games.findById('close-game')?.title).toBe('Close Test');
  });
});
