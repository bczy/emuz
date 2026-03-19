/**
 * LibraryService — FlatDb in-memory tests.
 * Mirrors the original .drizzle.test.ts test cases using the @emuz/storage engine.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFlatDb, type FlatDb, type FileIO, type GameRow } from '@emuz/storage';
import { LibraryService, createLibraryService } from '../services/LibraryService';

// ---------------------------------------------------------------------------
// In-memory FileIO — no real filesystem I/O
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed the 'nes' platform with name='NES' (matches original drizzle test data). */
function seedPlatform(d: FlatDb): void {
  // The auto-seed from loadPlatformSeeds uses name='Nintendo Entertainment System'.
  // Upsert to override with the short name used in the original tests.
  d.platforms.upsert({
    id: 'nes',
    name: 'NES',
    short_name: null,
    manufacturer: null,
    generation: 3,
    release_year: 1983,
    icon_path: null,
    wallpaper_path: null,
    color: '#E60012',
    rom_extensions: ['.nes'],
    created_at: new Date(),
    updated_at: new Date(),
  });
}

function seedGame(d: FlatDb, overrides: Partial<GameRow> = {}): void {
  d.games.insert({
    id: 'g1',
    platform_id: 'nes',
    title: 'Mega Man',
    file_path: '/roms/megaman.nes',
    file_name: 'megaman.nes',
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
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

let db: FlatDb;
let svc: LibraryService;

beforeEach(async () => {
  db = createFlatDb('/test', createMemoryIO());
  await db.open();
  // db.platforms already seeded with 25 platforms by loadPlatformSeeds()
  seedPlatform(db);
  svc = new LibraryService(db);
});

afterEach(async () => {
  await db.close();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LibraryService (FlatDb)', () => {
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
    db.games.insert({
      id: 'g2',
      platform_id: 'nes',
      title: 'Contra',
      file_path: '/roms/contra.nes',
      file_name: 'contra.nes',
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
    const games = await svc.getGamesByPlatform('nes');
    expect(games).toHaveLength(2);
  });

  it('searchGames matches by title', async () => {
    seedGame(db);
    db.games.insert({
      id: 'g2',
      platform_id: 'nes',
      title: 'Contra',
      file_path: '/roms/contra.nes',
      file_name: 'contra.nes',
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
    const results = await svc.searchGames({ query: 'mega' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Mega Man');
  });

  it('searchGames with % in query only matches titles containing %', async () => {
    seedGame(db, { title: '100% Complete' });
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
    db.games.insert({
      id: 'g2',
      platform_id: 'nes',
      title: 'Contra',
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
      is_favorite: true,
      created_at: new Date(),
      updated_at: new Date(),
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
    seedGame(db, { is_favorite: true });
    await svc.removeFromFavorites('g1');
    const g = await svc.getGameById('g1');
    expect(g?.isFavorite).toBe(false);
  });

  it('createLibraryService factory returns a working service', async () => {
    const s = createLibraryService(db);
    expect(await s.getGameCount()).toBe(0);
  });

  it('getAllGames includes platformName from platform lookup (P-12)', async () => {
    seedGame(db);
    const results = await svc.getAllGames();
    expect(results[0].platformName).toBe('NES');
  });

  it('getAllGames includes platformShortName and platformManufacturer from platform lookup (P-12)', async () => {
    // Upsert platform with short_name and manufacturer
    db.platforms.upsert({
      id: 'nes',
      name: 'NES',
      short_name: 'NES',
      manufacturer: 'Nintendo',
      generation: 3,
      release_year: 1983,
      icon_path: null,
      wallpaper_path: null,
      color: '#E60012',
      rom_extensions: ['.nes'],
      created_at: new Date(),
      updated_at: new Date(),
    });
    seedGame(db);
    const results = await svc.getAllGames();
    expect(results[0].platformShortName).toBe('NES');
    expect(results[0].platformManufacturer).toBe('Nintendo');
  });

  it('getGamesByPlatform uses page parameter correctly (P-13)', async () => {
    seedGame(db);
    db.games.insert({
      id: 'g2',
      platform_id: 'nes',
      title: 'Contra',
      file_path: '/roms/contra.nes',
      file_name: 'contra.nes',
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
    db.games.insert({
      id: 'g3',
      platform_id: 'nes',
      title: 'Zelda',
      file_path: '/roms/zelda.nes',
      file_name: 'zelda.nes',
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

    const page1 = await svc.getGamesByPlatform('nes', { page: 1, limit: 2 });
    const page2 = await svc.getGamesByPlatform('nes', { page: 2, limit: 2 });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(1);
    expect(page1.map((g) => g.id)).not.toEqual(page2.map((g) => g.id));
  });
});
