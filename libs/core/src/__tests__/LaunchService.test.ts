/**
 * LaunchService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { LaunchService } from '../LaunchService';
import type { DatabaseAdapter } from '@emuz/database';
import type { Emulator } from '../../models/Emulator';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-launch',
}));

/**
 * Create a mock database adapter
 */
function createMockAdapter(): DatabaseAdapter & {
  query: Mock;
  execute: Mock;
} {
  return {
    open: vi.fn(),
    close: vi.fn(),
    isConnected: vi.fn(() => true),
    execute: vi.fn(),
    query: vi.fn(),
    transaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  };
}

/**
 * Create a mock launcher
 */
function createMockLauncher() {
  return {
    launch: vi.fn(),
    isAvailable: vi.fn(() => true),
    detectEmulators: vi.fn(),
  };
}

/**
 * Create mock emulator row
 */
function createMockEmulatorRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'emulator-1',
    name: 'RetroArch',
    executable_path: '/usr/bin/retroarch',
    platforms: '["nes","snes","gba"]',
    is_default: 0,
    command_template: '{executable} -L {core} "{rom}"',
    config: '{}',
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('LaunchService', () => {
  let service: LaunchService;
  let mockAdapter: ReturnType<typeof createMockAdapter>;
  let mockLauncher: ReturnType<typeof createMockLauncher>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockLauncher = createMockLauncher();
    service = new LaunchService(mockAdapter, mockLauncher as any);
  });

  describe('getEmulators', () => {
    it('should return all configured emulators', async () => {
      const mockRows = [
        createMockEmulatorRow({ id: 'emu-1', name: 'RetroArch' }),
        createMockEmulatorRow({ id: 'emu-2', name: 'Dolphin' }),
      ];
      mockAdapter.query.mockResolvedValueOnce(mockRows);

      const emulators = await service.getEmulators();

      expect(emulators).toHaveLength(2);
      expect(emulators[0].name).toBe('RetroArch');
    });

    it('should filter emulators by platform', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        createMockEmulatorRow({ platforms: '["nes"]' }),
      ]);

      const emulators = await service.getEmulators({ platformId: 'nes' });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('platforms'),
        expect.any(Array)
      );
    });
  });

  describe('detectEmulators', () => {
    it('should detect installed emulators', async () => {
      mockLauncher.detectEmulators.mockResolvedValueOnce([
        { name: 'RetroArch', path: '/usr/bin/retroarch' },
        { name: 'Dolphin', path: '/usr/bin/dolphin-emu' },
      ]);

      const detected = await service.detectEmulators();

      expect(detected).toHaveLength(2);
      expect(mockLauncher.detectEmulators).toHaveBeenCalled();
    });

    it('should return empty array if no emulators found', async () => {
      mockLauncher.detectEmulators.mockResolvedValueOnce([]);

      const detected = await service.detectEmulators();

      expect(detected).toHaveLength(0);
    });
  });

  describe('addEmulator', () => {
    it('should add a new emulator', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([
        createMockEmulatorRow({ id: 'mock-uuid-launch' }),
      ]);

      const emulator = await service.addEmulator({
        name: 'Custom Emulator',
        executablePath: '/path/to/emulator',
        platforms: ['nes', 'snes'],
        commandTemplate: '{executable} "{rom}"',
      });

      expect(emulator).toBeDefined();
      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO emulators'),
        expect.any(Array)
      );
    });

    it('should validate emulator path exists', async () => {
      mockLauncher.isAvailable.mockReturnValueOnce(false);

      await expect(
        service.addEmulator({
          name: 'Invalid Emulator',
          executablePath: '/nonexistent/path',
          platforms: ['nes'],
          commandTemplate: '{executable} "{rom}"',
        })
      ).rejects.toThrow();
    });
  });

  describe('setDefaultEmulator', () => {
    it('should set emulator as default for platform', async () => {
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.setDefaultEmulator('emulator-1', 'nes');

      // Should clear existing default first
      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_default = 0'),
        expect.any(Array)
      );
      // Then set new default
      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_default = 1'),
        expect.any(Array)
      );
    });
  });

  describe('getDefaultEmulator', () => {
    it('should return default emulator for platform', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        createMockEmulatorRow({ is_default: 1, platforms: '["nes"]' }),
      ]);

      const emulator = await service.getDefaultEmulator('nes');

      expect(emulator).toBeDefined();
      expect(emulator?.isDefault).toBe(true);
    });

    it('should return null if no default set', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      const emulator = await service.getDefaultEmulator('nes');

      expect(emulator).toBeNull();
    });
  });

  describe('launchGame', () => {
    const mockGame = {
      id: 'game-1',
      platformId: 'nes',
      title: 'Test Game',
      filePath: '/games/test.nes',
      fileName: 'test.nes',
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should launch game with default emulator', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        createMockEmulatorRow({ is_default: 1 }),
      ]);
      mockLauncher.launch.mockResolvedValueOnce({ success: true });

      const result = await service.launchGame(mockGame);

      expect(result.success).toBe(true);
      expect(mockLauncher.launch).toHaveBeenCalled();
    });

    it('should launch game with specified emulator', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        createMockEmulatorRow({ id: 'specific-emu' }),
      ]);
      mockLauncher.launch.mockResolvedValueOnce({ success: true });

      await service.launchGame(mockGame, 'specific-emu');

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        ['specific-emu']
      );
    });

    it('should throw error if no emulator available', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await expect(service.launchGame(mockGame)).rejects.toThrow(
        'No emulator available'
      );
    });

    it('should record play session start', async () => {
      mockAdapter.query.mockResolvedValueOnce([createMockEmulatorRow()]);
      mockLauncher.launch.mockResolvedValueOnce({ success: true });
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.launchGame(mockGame);

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('play_sessions'),
        expect.any(Array)
      );
    });
  });

  describe('buildCommand', () => {
    it('should build command from template', () => {
      const emulator: Emulator = {
        id: 'emu-1',
        name: 'RetroArch',
        executablePath: '/usr/bin/retroarch',
        platforms: ['nes'],
        commandTemplate: '{executable} -L {core} "{rom}"',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const command = service.buildCommand(emulator, {
        romPath: '/games/test.nes',
        core: '/cores/nestopia.so',
      });

      expect(command).toBe('/usr/bin/retroarch -L /cores/nestopia.so "/games/test.nes"');
    });

    it('should handle missing template variables', () => {
      const emulator: Emulator = {
        id: 'emu-1',
        name: 'Simple Emulator',
        executablePath: '/usr/bin/emu',
        platforms: ['nes'],
        commandTemplate: '{executable} "{rom}"',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const command = service.buildCommand(emulator, {
        romPath: '/games/test.nes',
      });

      expect(command).toBe('/usr/bin/emu "/games/test.nes"');
    });
  });

  describe('endPlaySession', () => {
    it('should record play session end', async () => {
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.endPlaySession('session-1', 3600);

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE play_sessions'),
        expect.arrayContaining([3600, 'session-1'])
      );
    });

    it('should update game play time', async () => {
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.endPlaySession('session-1', 3600);

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE games SET play_time'),
        expect.any(Array)
      );
    });
  });

  describe('getPlayHistory', () => {
    it('should return play history for game', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        {
          id: 'session-1',
          game_id: 'game-1',
          started_at: Date.now() / 1000,
          ended_at: Date.now() / 1000 + 3600,
          duration: 3600,
        },
      ]);

      const history = await service.getPlayHistory('game-1');

      expect(history).toHaveLength(1);
      expect(history[0].duration).toBe(3600);
    });

    it('should limit history results', async () => {
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.getPlayHistory('game-1', { limit: 10 });

      expect(mockAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.arrayContaining([10])
      );
    });
  });
});
