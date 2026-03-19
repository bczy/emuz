/**
 * LaunchService — FlatDb in-memory tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFlatDb } from '@emuz/storage';
import type { FlatDb, FileIO, EmulatorRow, GameRow } from '@emuz/storage';
import { LaunchService } from '../services/LaunchService';

// Mock UUID so IDs are predictable
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

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
function makeEmulatorRow(overrides: Partial<EmulatorRow> & { id: string }): EmulatorRow {
  return {
    id: overrides.id,
    name: `Emulator ${overrides.id}`,
    platform_ids: ['nes'],
    executable_path: '/usr/bin/retroarch',
    package_name: null,
    url_scheme: null,
    icon_path: null,
    command_template: '{executable} "{rom}"',
    core_path: null,
    is_default: false,
    is_installed: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeGameRow(overrides: Partial<GameRow> & { id: string }): GameRow {
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

function createMockLauncher() {
  return {
    launch: vi.fn().mockResolvedValue({ success: true }),
    isAvailable: vi.fn().mockReturnValue(true),
    detectEmulators: vi.fn().mockResolvedValue([]),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('LaunchService (FlatDb)', () => {
  let db: FlatDb;
  let svc: LaunchService;
  let mockLauncher: ReturnType<typeof createMockLauncher>;

  beforeEach(async () => {
    const io = createMemoryIO();
    db = createFlatDb(DATA_DIR, io);
    await db.open();
    mockLauncher = createMockLauncher();
    svc = new LaunchService(db, mockLauncher as any);
  });

  describe('addEmulator()', () => {
    it('inserts a new emulator into the store', async () => {
      const emulator = await svc.addEmulator({
        name: 'RetroArch',
        platforms: ['nes', 'snes'],
        executablePath: '/usr/bin/retroarch',
        commandTemplate: '{executable} -L {core} "{rom}"',
      });

      expect(emulator).toBeDefined();
      expect(emulator.name).toBe('RetroArch');
      expect(emulator.platforms).toEqual(['nes', 'snes']);
      expect(emulator.isDefault).toBe(false);
      expect(emulator.isInstalled).toBe(true);

      expect(db.emulators.count()).toBe(1);
    });

    it('throws when executablePath does not exist', async () => {
      mockLauncher.isAvailable.mockReturnValue(false);

      await expect(
        svc.addEmulator({
          name: 'Bad Emulator',
          platforms: ['nes'],
          executablePath: '/nonexistent/path',
        })
      ).rejects.toThrow('Emulator not found at path');
    });

    it('inserts an emulator without an executablePath', async () => {
      const emulator = await svc.addEmulator({
        name: 'iOS Delta',
        platforms: ['gba'],
      });

      expect(emulator.executablePath).toBeUndefined();
      expect(db.emulators.count()).toBe(1);
    });
  });

  describe('getEmulators()', () => {
    it('returns all emulators when no filter is provided', async () => {
      db.emulators.insert(makeEmulatorRow({ id: 'emu-1', name: 'RetroArch' }));
      db.emulators.insert(makeEmulatorRow({ id: 'emu-2', name: 'Dolphin', platform_ids: ['gc'] }));

      const emulators = await svc.getEmulators();
      expect(emulators).toHaveLength(2);
    });

    it('filters by platformId when provided', async () => {
      db.emulators.insert(makeEmulatorRow({ id: 'emu-1', platform_ids: ['nes'] }));
      db.emulators.insert(makeEmulatorRow({ id: 'emu-2', platform_ids: ['gc'] }));

      const emulators = await svc.getEmulators({ platformId: 'nes' });
      expect(emulators).toHaveLength(1);
      expect(emulators[0].id).toBe('emu-1');
    });

    it('returns emulators sorted by name', async () => {
      db.emulators.insert(makeEmulatorRow({ id: 'emu-z', name: 'Zzz' }));
      db.emulators.insert(makeEmulatorRow({ id: 'emu-a', name: 'Aaa' }));

      const emulators = await svc.getEmulators();
      expect(emulators[0].name).toBe('Aaa');
      expect(emulators[1].name).toBe('Zzz');
    });
  });

  describe('getDefaultEmulator()', () => {
    it('finds the default emulator for a platform', async () => {
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-1', platform_ids: ['nes'], is_default: true })
      );
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-2', platform_ids: ['nes'], is_default: false })
      );

      const emulator = await svc.getDefaultEmulator('nes');
      expect(emulator).toBeDefined();
      expect(emulator?.id).toBe('emu-1');
      expect(emulator?.isDefault).toBe(true);
    });

    it('returns null when no default is set', async () => {
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-1', platform_ids: ['nes'], is_default: false })
      );

      const emulator = await svc.getDefaultEmulator('nes');
      expect(emulator).toBeNull();
    });

    it('returns null when no emulators exist for the platform', async () => {
      const emulator = await svc.getDefaultEmulator('ps2');
      expect(emulator).toBeNull();
    });
  });

  describe('setDefaultEmulator()', () => {
    it('sets the target as default and unsets all other defaults for the platform', async () => {
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-1', platform_ids: ['nes'], is_default: true })
      );
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-2', platform_ids: ['nes'], is_default: false })
      );

      await svc.setDefaultEmulator('emu-2', 'nes');

      const emu1 = db.emulators.findById('emu-1');
      const emu2 = db.emulators.findById('emu-2');
      expect(emu1?.is_default).toBe(false);
      expect(emu2?.is_default).toBe(true);
    });

    it('does not affect emulators on other platforms', async () => {
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-1', platform_ids: ['nes'], is_default: true })
      );
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-gc', platform_ids: ['gc'], is_default: true })
      );
      db.emulators.insert(
        makeEmulatorRow({ id: 'emu-2', platform_ids: ['nes'], is_default: false })
      );

      await svc.setDefaultEmulator('emu-2', 'nes');

      // GC emulator should be unaffected
      const emuGc = db.emulators.findById('emu-gc');
      expect(emuGc?.is_default).toBe(true);
    });
  });

  describe('deleteEmulator()', () => {
    it('removes the emulator from the store', async () => {
      db.emulators.insert(makeEmulatorRow({ id: 'emu-1' }));
      expect(db.emulators.count()).toBe(1);

      await svc.deleteEmulator('emu-1');

      expect(db.emulators.count()).toBe(0);
      expect(db.emulators.findById('emu-1')).toBeUndefined();
    });
  });

  describe('endPlaySession()', () => {
    it('updates session with duration and endedAt', async () => {
      db.games.insert(makeGameRow({ id: 'game-1', play_time: 100, play_count: 2 }));
      db.playSessions.insert({
        id: 'session-1',
        game_id: 'game-1',
        started_at: new Date(),
        ended_at: null,
        duration: 0,
      });

      await svc.endPlaySession('session-1', 3600);

      const session = db.playSessions.findById('session-1');
      expect(session?.duration).toBe(3600);
      expect(session?.ended_at).toBeInstanceOf(Date);
    });

    it('increments game playCount and playTime', async () => {
      db.games.insert(makeGameRow({ id: 'game-1', play_time: 100, play_count: 2 }));
      db.playSessions.insert({
        id: 'session-1',
        game_id: 'game-1',
        started_at: new Date(),
        ended_at: null,
        duration: 0,
      });

      await svc.endPlaySession('session-1', 3600);

      const game = db.games.findById('game-1');
      expect(game?.play_time).toBe(3700);
      expect(game?.play_count).toBe(3);
    });

    it('does nothing when session is not found', async () => {
      // Should not throw
      await expect(svc.endPlaySession('nonexistent', 3600)).resolves.toBeUndefined();
    });
  });

  describe('getPlayHistory()', () => {
    it('returns play sessions for a game sorted newest first', async () => {
      const earlier = new Date(Date.now() - 10000);
      const later = new Date();
      db.playSessions.insert({
        id: 's1',
        game_id: 'g1',
        started_at: earlier,
        ended_at: null,
        duration: 100,
      });
      db.playSessions.insert({
        id: 's2',
        game_id: 'g1',
        started_at: later,
        ended_at: null,
        duration: 200,
      });

      const history = await svc.getPlayHistory('g1');
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('s2');
      expect(history[1].id).toBe('s1');
    });

    it('only returns sessions for the requested game', async () => {
      db.playSessions.insert({
        id: 's1',
        game_id: 'g1',
        started_at: new Date(),
        ended_at: null,
        duration: 100,
      });
      db.playSessions.insert({
        id: 's2',
        game_id: 'g2',
        started_at: new Date(),
        ended_at: null,
        duration: 200,
      });

      const history = await svc.getPlayHistory('g1');
      expect(history).toHaveLength(1);
      expect(history[0].gameId).toBe('g1');
    });

    it('respects the limit option', async () => {
      for (let i = 1; i <= 5; i++) {
        db.playSessions.insert({
          id: `s${i}`,
          game_id: 'g1',
          started_at: new Date(Date.now() + i * 1000),
          ended_at: null,
          duration: i * 10,
        });
      }

      const history = await svc.getPlayHistory('g1', { limit: 3 });
      expect(history).toHaveLength(3);
    });
  });
});
