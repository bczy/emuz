/**
 * WidgetService — flat-file (FlatDb) in-memory tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  FlatDb,
  CollectionStore,
  CollectionGameStore,
  WidgetRow,
  GameRow,
  PlatformRow,
  EmulatorRow,
  CollectionRow,
  GenreRow,
  SettingsRow,
  ScanDirectoryRow,
  PlaySessionRow,
} from '@emuz/storage';
import { WidgetService, createWidgetService } from '../services/WidgetService';

// ---------------------------------------------------------------------------
// Generic in-memory CollectionStore factory
// ---------------------------------------------------------------------------
function createMemoryStore<T extends { id: string }>(_name: string): CollectionStore<T> {
  const map = new Map<string, T>();

  return {
    all() {
      return Array.from(map.values());
    },
    findById(id) {
      return map.get(id);
    },
    find(pred) {
      return Array.from(map.values()).filter(pred);
    },
    findOne(pred) {
      return Array.from(map.values()).find(pred);
    },
    count(pred?) {
      return pred ? Array.from(map.values()).filter(pred).length : map.size;
    },
    insert(item) {
      if (map.has(item.id)) throw new Error(`Duplicate key: ${item.id}`);
      map.set(item.id, { ...item });
    },
    upsert(item) {
      map.set(item.id, { ...item });
    },
    update(id, patch) {
      const existing = map.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch };
      map.set(id, updated);
      return updated;
    },
    delete(id) {
      return map.delete(id);
    },
    async flush() {
      return Promise.resolve();
    },
    async load() {
      return Promise.resolve();
    },
  };
}

// Stub for CollectionGameStore (not used by WidgetService)
function createCollectionGameStoreStub(): CollectionGameStore {
  return {
    all() {
      return [];
    },
    findByCollection(_id: string) {
      return [];
    },
    findByGame(_id: string) {
      return [];
    },
    has(_cid: string, _gid: string) {
      return false;
    },
    insert(_row) {
      return;
    },
    delete(_cid: string, _gid: string) {
      return false;
    },
    deleteByCollection(_id: string) {
      return;
    },
    deleteByGame(_id: string) {
      return;
    },
    count() {
      return 0;
    },
    async flush() {
      return Promise.resolve();
    },
    async load() {
      return Promise.resolve();
    },
  };
}

// ---------------------------------------------------------------------------
// Build a FlatDb backed entirely by in-memory stores
// ---------------------------------------------------------------------------
function createMemoryDb(): FlatDb {
  const widgetStore = createMemoryStore<WidgetRow>('widgets');
  const gameStore = createMemoryStore<GameRow>('games');
  const platformStore = createMemoryStore<PlatformRow>('platforms');

  return {
    widgets: widgetStore,
    games: gameStore,
    platforms: platformStore,
    emulators: createMemoryStore<EmulatorRow>('emulators'),
    collections: createMemoryStore<CollectionRow>('collections'),
    collectionGames: createCollectionGameStoreStub(),
    genres: createMemoryStore<GenreRow>('genres'),
    settings: createMemoryStore<SettingsRow & { id: string }>(
      'settings'
    ) as unknown as CollectionStore<SettingsRow>,
    scanDirectories: createMemoryStore<ScanDirectoryRow>('scanDirectories'),
    playSessions: createMemoryStore<PlaySessionRow>('playSessions'),
    async open() {
      return Promise.resolve();
    },
    async flush() {
      return Promise.resolve();
    },
    async close() {
      return Promise.resolve();
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeGame(overrides: Partial<GameRow> & { id: string; platform_id: string }): GameRow {
  const now = new Date();
  return {
    title: 'Test Game',
    file_path: '/roms/test.gba',
    file_name: 'test.gba',
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
    ...overrides,
  };
}

function makePlatform(overrides: Partial<PlatformRow> & { id: string; name: string }): PlatformRow {
  const now = new Date();
  return {
    short_name: null,
    manufacturer: null,
    generation: null,
    release_year: null,
    icon_path: null,
    wallpaper_path: null,
    color: null,
    rom_extensions: [],
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
let db: FlatDb;
let svc: WidgetService;

beforeEach(() => {
  db = createMemoryDb();
  svc = new WidgetService(db);
});

describe('WidgetService (FlatDb)', () => {
  // --- Basic CRUD ---

  it('getWidgets returns empty list initially', async () => {
    expect(await svc.getWidgets()).toHaveLength(0);
  });

  it('addWidget creates a widget with auto-position 0', async () => {
    const w = await svc.addWidget({ type: 'recent_games' });
    expect(w.id).toBeDefined();
    expect(w.type).toBe('recent_games');
    expect(w.position).toBe(0);
  });

  it('addWidget increments position for each new widget', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    const w2 = await svc.addWidget({ type: 'favorites' });
    expect(w2.position).toBe(w1.position + 1);
  });

  it('getWidgetById returns null for unknown id', async () => {
    expect(await svc.getWidgetById('nonexistent')).toBeNull();
  });

  it('getWidgetById returns widget after add', async () => {
    const w = await svc.addWidget({ type: 'stats', title: 'Stats' });
    const found = await svc.getWidgetById(w.id);
    expect(found?.title).toBe('Stats');
  });

  it('updateWidget updates fields', async () => {
    const w = await svc.addWidget({ type: 'recent_games' });
    const updated = await svc.updateWidget(w.id, { title: 'Recent', isVisible: false });
    expect(updated?.title).toBe('Recent');
    expect(updated?.isVisible).toBe(false);
  });

  it('updateWidget with no real changes returns current widget', async () => {
    const w = await svc.addWidget({ type: 'stats' });
    const updated = await svc.updateWidget(w.id, {});
    expect(updated?.id).toBe(w.id);
  });

  // --- removeWidget ---

  it('removeWidget deletes the widget', async () => {
    const w = await svc.addWidget({ type: 'favorites' });
    await svc.removeWidget(w.id);
    expect(await svc.getWidgetById(w.id)).toBeNull();
  });

  it('removeWidget reorders remaining widgets contiguously', async () => {
    const _w1 = await svc.addWidget({ type: 'recent_games' }); // position 0
    const w2 = await svc.addWidget({ type: 'favorites' }); // position 1
    const _w3 = await svc.addWidget({ type: 'stats' }); // position 2

    await svc.removeWidget(w2.id);

    const remaining = await svc.getWidgets();
    expect(remaining).toHaveLength(2);
    expect(remaining[0].position).toBe(0);
    expect(remaining[1].position).toBe(1);
  });

  // --- reorderWidgets ---

  it('reorderWidgets assigns correct positions', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    const w2 = await svc.addWidget({ type: 'favorites' });
    await svc.reorderWidgets([w2.id, w1.id]);
    const all = await svc.getWidgets();
    expect(all.find((w) => w.id === w2.id)?.position).toBe(0);
    expect(all.find((w) => w.id === w1.id)?.position).toBe(1);
  });

  // --- getWidgets with filter ---

  it('getWidgets visibleOnly excludes hidden widgets', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    await svc.updateWidget(w1.id, { isVisible: false });
    await svc.addWidget({ type: 'favorites' });
    const visible = await svc.getWidgets({ visibleOnly: true });
    expect(visible).toHaveLength(1);
  });

  // --- getWidgetData: stats ---

  it('getWidgetData stats returns correct shape when db is empty', async () => {
    const data = (await svc.getWidgetData('any', 'stats')) as { stats: Record<string, number> };
    expect(data.stats.totalGames).toBe(0);
    expect(data.stats.totalPlatforms).toBe(0);
    expect(data.stats.totalPlayTime).toBe(0);
    expect(data.stats.gamesPlayed).toBe(0);
  });

  it('getWidgetData stats counts games and platforms correctly', async () => {
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', play_count: 1, play_time: 300 }));
    db.games.insert(makeGame({ id: 'g2', platform_id: 'p2', play_count: 0, play_time: 0 }));
    db.games.insert(makeGame({ id: 'g3', platform_id: 'p1', play_count: 5, play_time: 600 }));

    const data = (await svc.getWidgetData('any', 'stats')) as { stats: Record<string, number> };
    expect(data.stats.totalGames).toBe(3);
    expect(data.stats.totalPlatforms).toBe(2);
    expect(data.stats.totalPlayTime).toBe(900);
    expect(data.stats.gamesPlayed).toBe(2);
  });

  // --- getWidgetData: recent_games ---

  it('getWidgetData recent_games returns empty list when no games played', async () => {
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', last_played_at: null }));
    const data = (await svc.getWidgetData('any', 'recent_games')) as { games: unknown[] };
    expect(Array.isArray(data.games)).toBe(true);
    expect(data.games).toHaveLength(0);
  });

  it('getWidgetData recent_games returns up to 10 games sorted by lastPlayedAt desc', async () => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    for (let i = 0; i < 12; i++) {
      db.games.insert(
        makeGame({
          id: `g${i}`,
          platform_id: 'p1',
          last_played_at: new Date(base + i * 1000),
        })
      );
    }
    const data = (await svc.getWidgetData('any', 'recent_games')) as { games: GameRow[] };
    expect(data.games).toHaveLength(10);
    // Most recently played first
    expect(data.games[0].id).toBe('g11');
    expect(data.games[9].id).toBe('g2');
  });

  // --- getWidgetData: favorites ---

  it('getWidgetData favorites returns only favorite games', async () => {
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', is_favorite: true }));
    db.games.insert(makeGame({ id: 'g2', platform_id: 'p1', is_favorite: false }));
    db.games.insert(makeGame({ id: 'g3', platform_id: 'p1', is_favorite: true }));

    const data = (await svc.getWidgetData('any', 'favorites')) as { games: GameRow[] };
    expect(data.games).toHaveLength(2);
    expect(data.games.every((g) => g.is_favorite)).toBe(true);
  });

  it('getWidgetData favorites returns empty list when no favorites', async () => {
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', is_favorite: false }));
    const data = (await svc.getWidgetData('any', 'favorites')) as { games: unknown[] };
    expect(data.games).toHaveLength(0);
  });

  // --- getWidgetData: continue_playing ---

  it('getWidgetData continue_playing returns games with lastPlayedAt AND playTime > 0', async () => {
    const now = new Date();
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', last_played_at: now, play_time: 100 }));
    db.games.insert(makeGame({ id: 'g2', platform_id: 'p1', last_played_at: now, play_time: 0 })); // excluded
    db.games.insert(makeGame({ id: 'g3', platform_id: 'p1', last_played_at: null, play_time: 50 })); // excluded

    const data = (await svc.getWidgetData('any', 'continue_playing')) as { games: GameRow[] };
    expect(data.games).toHaveLength(1);
    expect(data.games[0].id).toBe('g1');
  });

  it('getWidgetData continue_playing sorts by lastPlayedAt desc', async () => {
    const t1 = new Date('2024-01-01T00:00:00Z');
    const t2 = new Date('2024-01-02T00:00:00Z');
    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1', last_played_at: t1, play_time: 60 }));
    db.games.insert(makeGame({ id: 'g2', platform_id: 'p1', last_played_at: t2, play_time: 120 }));

    const data = (await svc.getWidgetData('any', 'continue_playing')) as { games: GameRow[] };
    expect(data.games[0].id).toBe('g2');
    expect(data.games[1].id).toBe('g1');
  });

  // --- getWidgetData: platform_shortcuts ---

  it('getWidgetData platform_shortcuts returns platforms with games, sorted by game count desc', async () => {
    db.platforms.insert(makePlatform({ id: 'p1', name: 'GBA' }));
    db.platforms.insert(makePlatform({ id: 'p2', name: 'NES' }));
    db.platforms.insert(makePlatform({ id: 'p3', name: 'SNES' })); // no games — excluded

    db.games.insert(makeGame({ id: 'g1', platform_id: 'p1' }));
    db.games.insert(makeGame({ id: 'g2', platform_id: 'p1' }));
    db.games.insert(makeGame({ id: 'g3', platform_id: 'p2' }));

    const data = (await svc.getWidgetData('any', 'platform_shortcuts')) as {
      platforms: Array<PlatformRow & { gameCount: number }>;
    };

    expect(data.platforms).toHaveLength(2);
    expect(data.platforms[0].id).toBe('p1');
    expect(data.platforms[0].gameCount).toBe(2);
    expect(data.platforms[1].id).toBe('p2');
    expect(data.platforms[1].gameCount).toBe(1);
  });

  it('getWidgetData platform_shortcuts returns at most 10 platforms', async () => {
    for (let i = 0; i < 15; i++) {
      db.platforms.insert(makePlatform({ id: `p${i}`, name: `Platform ${i}` }));
      db.games.insert(makeGame({ id: `g${i}`, platform_id: `p${i}` }));
    }
    const data = (await svc.getWidgetData('any', 'platform_shortcuts')) as {
      platforms: unknown[];
    };
    expect(data.platforms).toHaveLength(10);
  });

  // --- getWidgetData: unknown type ---

  it('getWidgetData returns null for unknown widget type', async () => {
    const data = await svc.getWidgetData('any', 'random_picks' as never);
    expect(data).toBeNull();
  });

  // --- getDefaultWidgets ---

  it('getDefaultWidgets returns 5 defaults', () => {
    expect(svc.getDefaultWidgets()).toHaveLength(5);
  });

  // --- factory function ---

  it('createWidgetService factory returns a working service', async () => {
    const s = createWidgetService(db);
    expect(await s.getWidgets()).toHaveLength(0);
  });
});
