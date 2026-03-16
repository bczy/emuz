/**
 * ScannerService unit tests
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { ScannerService } from '../services/ScannerService';
import type { DatabaseAdapter } from '@emuz/database';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-scan',
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
    transaction: vi.fn(<T>(fn: () => Promise<T>) => fn()),
  };
}

/**
 * Create mock file system adapter
 */
function createMockFileSystem() {
  return {
    readDir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    exists: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    copy: vi.fn(),
    move: vi.fn(),
    getDocumentsPath: vi.fn(() => '/documents'),
    getCachePath: vi.fn(() => '/cache'),
  };
}

describe('ScannerService', () => {
  let service: ScannerService;
  let mockAdapter: ReturnType<typeof createMockAdapter>;
  let mockFs: ReturnType<typeof createMockFileSystem>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockFs = createMockFileSystem();
    service = new ScannerService(mockAdapter, mockFs as any);
  });

  describe('addDirectory', () => {
    it('should add a new scan directory', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);
      mockAdapter.query.mockResolvedValueOnce([]);

      await service.addDirectory('/games/roms');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO scan_directories'),
        expect.arrayContaining(['/games/roms'])
      );
    });

    it('should not add duplicate directories', async () => {
      mockAdapter.query.mockResolvedValueOnce([{ path: '/games/roms' }]);

      await expect(service.addDirectory('/games/roms')).rejects.toThrow(
        'Directory already exists'
      );
    });

    it('should validate directory path', async () => {
      mockFs.exists.mockResolvedValueOnce(false);

      await expect(service.addDirectory('/nonexistent')).rejects.toThrow();
    });
  });

  describe('removeDirectory', () => {
    it('should remove a scan directory', async () => {
      mockAdapter.execute.mockResolvedValueOnce(undefined);

      await service.removeDirectory('/games/roms');

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM scan_directories'),
        ['/games/roms']
      );
    });

    it('should optionally remove associated games', async () => {
      mockAdapter.execute.mockResolvedValue(undefined);

      await service.removeDirectory('/games/roms', { removeGames: true });

      expect(mockAdapter.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM games'),
        expect.any(Array)
      );
    });
  });

  describe('getDirectories', () => {
    it('should return all scan directories', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        { id: '1', path: '/games/snes', platform_id: 'snes' },
        { id: '2', path: '/games/nes', platform_id: 'nes' },
      ]);

      const dirs = await service.getDirectories();

      expect(dirs).toHaveLength(2);
      expect(dirs[0].path).toBe('/games/snes');
    });
  });

  describe('detectPlatformByExtension', () => {
    it('should detect NES platform', () => {
      expect(service.detectPlatformByExtension('.nes')).toBe('nes');
      expect(service.detectPlatformByExtension('.NES')).toBe('nes');
    });

    it('should detect SNES platform', () => {
      expect(service.detectPlatformByExtension('.sfc')).toBe('snes');
      expect(service.detectPlatformByExtension('.smc')).toBe('snes');
    });

    it('should detect GBA platform', () => {
      expect(service.detectPlatformByExtension('.gba')).toBe('gba');
    });

    it('should detect GB/GBC platform', () => {
      expect(service.detectPlatformByExtension('.gb')).toBe('gb');
      expect(service.detectPlatformByExtension('.gbc')).toBe('gbc');
    });

    it('should detect N64 platform', () => {
      expect(service.detectPlatformByExtension('.n64')).toBe('n64');
      expect(service.detectPlatformByExtension('.z64')).toBe('n64');
      expect(service.detectPlatformByExtension('.v64')).toBe('n64');
    });

    it('should detect GameCube/Wii platform', () => {
      expect(service.detectPlatformByExtension('.iso')).toBe('gc'); // or wii
      expect(service.detectPlatformByExtension('.gcm')).toBe('gc');
      expect(service.detectPlatformByExtension('.wbfs')).toBe('wii');
    });

    it('should detect DS platform', () => {
      expect(service.detectPlatformByExtension('.nds')).toBe('nds');
    });

    it('should detect 3DS platform', () => {
      expect(service.detectPlatformByExtension('.3ds')).toBe('3ds');
      expect(service.detectPlatformByExtension('.cia')).toBe('3ds');
    });

    it('should detect PSP platform', () => {
      expect(service.detectPlatformByExtension('.cso')).toBe('psp');
    });

    it('should detect PS1 platform', () => {
      expect(service.detectPlatformByExtension('.bin')).toBe('ps1');
      expect(service.detectPlatformByExtension('.cue')).toBe('ps1');
    });

    it('should detect PS2 platform', () => {
      expect(service.detectPlatformByExtension('.iso')).toBe('gc'); // Ambiguous
    });

    it('should detect Genesis/Mega Drive platform', () => {
      expect(service.detectPlatformByExtension('.md')).toBe('genesis');
      expect(service.detectPlatformByExtension('.gen')).toBe('genesis');
      expect(service.detectPlatformByExtension('.smd')).toBe('genesis');
    });

    it('should return null for unknown extensions', () => {
      expect(service.detectPlatformByExtension('.xyz')).toBeNull();
      expect(service.detectPlatformByExtension('.txt')).toBeNull();
    });
  });

  describe('scan', () => {
    it('should scan directory for ROMs', async () => {
      mockFs.readDir.mockResolvedValueOnce([
        { name: 'game1.nes', path: '/games/game1.nes', isDirectory: false },
        { name: 'game2.nes', path: '/games/game2.nes', isDirectory: false },
      ]);
      mockFs.stat.mockResolvedValue({ size: 1024, mtime: new Date() });
      mockAdapter.query.mockResolvedValue([]);
      mockAdapter.execute.mockResolvedValue(undefined);

      const results: string[] = [];
      for await (const progress of service.scan('/games', { platformId: 'nes' })) {
        results.push(progress.fileName);
      }

      expect(results).toHaveLength(2);
      expect(results).toContain('game1.nes');
    });

    it('should recursively scan subdirectories', async () => {
      mockFs.readDir
        .mockResolvedValueOnce([
          { name: 'subdir', path: '/games/subdir', isDirectory: true },
        ])
        .mockResolvedValueOnce([
          { name: 'game.nes', path: '/games/subdir/game.nes', isDirectory: false },
        ]);
      mockFs.stat.mockResolvedValue({ size: 1024, mtime: new Date() });
      mockAdapter.query.mockResolvedValue([]);
      mockAdapter.execute.mockResolvedValue(undefined);

      const results: string[] = [];
      for await (const progress of service.scan('/games', { recursive: true })) {
        results.push(progress.fileName);
      }

      expect(mockFs.readDir).toHaveBeenCalledTimes(2);
    });

    it('should skip already scanned files', async () => {
      mockFs.readDir.mockResolvedValueOnce([
        { name: 'game.nes', path: '/games/game.nes', isDirectory: false },
      ]);
      mockAdapter.query.mockResolvedValueOnce([
        { file_path: '/games/game.nes' },
      ]);

      const results: string[] = [];
      for await (const progress of service.scan('/games', { skipExisting: true })) {
        results.push(progress.fileName);
      }

      expect(results).toHaveLength(0);
    });

    it('should report progress', async () => {
      mockFs.readDir.mockResolvedValueOnce([
        { name: 'game1.nes', path: '/games/game1.nes', isDirectory: false },
        { name: 'game2.nes', path: '/games/game2.nes', isDirectory: false },
      ]);
      mockFs.stat.mockResolvedValue({ size: 1024, mtime: new Date() });
      mockAdapter.query.mockResolvedValue([]);
      mockAdapter.execute.mockResolvedValue(undefined);

      const progressUpdates: number[] = [];
      for await (const progress of service.scan('/games')) {
        progressUpdates.push(progress.progress);
      }

      expect(progressUpdates).toContain(50);
      expect(progressUpdates).toContain(100);
    });
  });

  describe('calculateHash', () => {
    it('should calculate file hash', async () => {
      const mockFileBuffer = Buffer.from('test file content');
      mockFs.readFile.mockResolvedValueOnce(mockFileBuffer);

      const hash = await service.calculateHash('/games/test.nes');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 hex string
    });

    it('should return consistent hash for same content', async () => {
      const mockFileBuffer = Buffer.from('test file content');
      mockFs.readFile.mockResolvedValue(mockFileBuffer);

      const hash1 = await service.calculateHash('/games/test1.nes');
      const hash2 = await service.calculateHash('/games/test2.nes');

      expect(hash1).toBe(hash2);
    });
  });

  describe('cancelScan', () => {
    it('should cancel ongoing scan', async () => {
      let cancelled = false;
      const scanPromise = (async () => {
        for await (const _ of service.scan('/games')) {
          if (cancelled) break;
        }
      })();

      service.cancelScan();
      cancelled = true;

      await expect(scanPromise).resolves.not.toThrow();
    });
  });

  describe('getScanStatus', () => {
    it('should return current scan status', () => {
      const status = service.getScanStatus();

      expect(status).toHaveProperty('isScanning');
      expect(status).toHaveProperty('currentDirectory');
      expect(status).toHaveProperty('filesScanned');
      expect(status).toHaveProperty('gamesFound');
    });
  });
});
