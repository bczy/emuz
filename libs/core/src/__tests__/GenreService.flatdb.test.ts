/**
 * GenreService — FlatDb in-memory tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFlatDb } from '@emuz/storage';
import type { FlatDb, FileIO, GameRow, GenreRow } from '@emuz/storage';
import { GenreService } from '../services/GenreService';

// ---------------------------------------------------------------------------
// In-memory FileIO mock
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

const DATA_DIR = '/data/emuz';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeGame(overrides: Partial<GameRow> & { id: string }): GameRow {
  return {
    id: overrides.id,
    platform_id: 'nes',
    title: `Game ${overrides.id}`,
    file_path: `/roms/${overrides.id}.nes`,
    file_name: `${overrides.id}.nes`,
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
  };
}

function makeGenre(name: string): GenreRow {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    icon_name: null,
    color: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GenreService (FlatDb)', () => {
  let db: FlatDb;
  let svc: GenreService;

  beforeEach(async () => {
    const io = createMemoryIO();
    db = createFlatDb(DATA_DIR, io);
    await db.open();
    svc = new GenreService(db);
  });

  describe('getGenres()', () => {
    it('returns empty list when genres store is empty', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action' }));
      const genres = await svc.getGenres();
      expect(genres).toHaveLength(0);
    });

    it('returns genres sorted by name with correct game counts', async () => {
      db.genres.insert(makeGenre('Action'));
      db.genres.insert(makeGenre('RPG'));
      db.games.insert(makeGame({ id: 'g1', genre: 'Action' }));
      db.games.insert(makeGame({ id: 'g2', genre: 'Action' }));
      db.games.insert(makeGame({ id: 'g3', genre: 'RPG' }));

      const genres = await svc.getGenres();
      expect(genres).toHaveLength(2);

      const action = genres.find((g) => g.name === 'Action');
      expect(action?.gameCount).toBe(2);

      const rpg = genres.find((g) => g.name === 'RPG');
      expect(rpg?.gameCount).toBe(1);
    });

    it('returns zero gameCount for genres with no matching games', async () => {
      db.genres.insert(makeGenre('Puzzle'));
      const genres = await svc.getGenres();
      expect(genres).toHaveLength(1);
      expect(genres[0].gameCount).toBe(0);
    });

    it('results are sorted alphabetically', async () => {
      db.genres.insert(makeGenre('RPG'));
      db.genres.insert(makeGenre('Action'));
      db.genres.insert(makeGenre('Puzzle'));
      const genres = await svc.getGenres();
      expect(genres.map((g) => g.name)).toEqual(['Action', 'Puzzle', 'RPG']);
    });
  });

  describe('getGamesByGenre()', () => {
    it('returns only games matching the genre', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action' }));
      db.games.insert(makeGame({ id: 'g2', genre: 'RPG' }));
      db.games.insert(makeGame({ id: 'g3', genre: 'Action' }));

      const games = await svc.getGamesByGenre('Action');
      expect(games).toHaveLength(2);
      expect(games.every((g) => g.genre === 'Action')).toBe(true);
    });

    it('returns empty array for genre with no games', async () => {
      const games = await svc.getGamesByGenre('Unknown');
      expect(games).toHaveLength(0);
    });

    it('respects pagination limit and offset', async () => {
      for (let i = 1; i <= 5; i++) {
        db.games.insert(makeGame({ id: `g${i}`, genre: 'Action', title: `Game ${i}` }));
      }
      const page1 = await svc.getGamesByGenre('Action', { limit: 2, offset: 0 });
      const page2 = await svc.getGamesByGenre('Action', { limit: 2, offset: 2 });
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
    });
  });

  describe('getGenreStats()', () => {
    it('returns correct totalGames count', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action' }));
      db.games.insert(makeGame({ id: 'g2', genre: 'Action' }));
      db.games.insert(makeGame({ id: 'g3', genre: 'RPG' }));

      const stats = await svc.getGenreStats('Action');
      expect(stats.totalGames).toBe(2);
    });

    it('sums playTime correctly', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action', play_time: 100 }));
      db.games.insert(makeGame({ id: 'g2', genre: 'Action', play_time: 200 }));

      const stats = await svc.getGenreStats('Action');
      expect(stats.totalPlayTime).toBe(300);
    });

    it('computes averageRating correctly', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action', rating: 4 }));
      db.games.insert(makeGame({ id: 'g2', genre: 'Action', rating: 2 }));

      const stats = await svc.getGenreStats('Action');
      expect(stats.averageRating).toBe(3);
    });

    it('returns averageRating of 0 when no games have ratings', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action', rating: null }));

      const stats = await svc.getGenreStats('Action');
      expect(stats.averageRating).toBe(0);
    });

    it('returns zeros for genre with no games', async () => {
      const stats = await svc.getGenreStats('Nonexistent');
      expect(stats.totalGames).toBe(0);
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.averageRating).toBe(0);
    });
  });

  describe('assignGenre()', () => {
    it('sets the genre field on a game', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: null }));

      await svc.assignGenre('g1', 'Platformer');

      const games = await svc.getGamesByGenre('Platformer');
      expect(games).toHaveLength(1);
      expect(games[0].genre).toBe('Platformer');
    });

    it('clears the genre when passed null', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'Action' }));

      await svc.assignGenre('g1', null);

      const games = await svc.getGamesByGenre('Action');
      expect(games).toHaveLength(0);
    });
  });

  describe('removeGenre()', () => {
    it('clears the genre field on a game', async () => {
      db.games.insert(makeGame({ id: 'g1', genre: 'RPG' }));

      await svc.removeGenre('g1', 'RPG');

      const games = await svc.getGamesByGenre('RPG');
      expect(games).toHaveLength(0);
    });
  });
});
