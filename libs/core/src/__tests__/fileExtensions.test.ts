import { describe, it, expect, vi } from 'vitest';
import {
  romExtensionMap,
  getSupportedExtensions,
  isSupportedExtension,
  getPlatformIdForExtension,
  calculateFileHash,
  ROM_INFO_PATTERNS,
  extractRomInfoFromFilename,
} from '../utils/fileExtensions';

describe('romExtensionMap', () => {
  it('maps .nes to nes', () => {
    expect(romExtensionMap['.nes']).toBe('nes');
  });

  it('maps .sfc and .smc to snes', () => {
    expect(romExtensionMap['.sfc']).toBe('snes');
    expect(romExtensionMap['.smc']).toBe('snes');
  });

  it('maps .gba to gba', () => {
    expect(romExtensionMap['.gba']).toBe('gba');
  });

  it('maps .iso to psx', () => {
    expect(romExtensionMap['.iso']).toBe('psx');
  });
});

describe('getSupportedExtensions', () => {
  it('returns an array of all supported extensions', () => {
    const exts = getSupportedExtensions();
    expect(Array.isArray(exts)).toBe(true);
    expect(exts.length).toBeGreaterThan(0);
    expect(exts).toContain('.nes');
    expect(exts).toContain('.gba');
    expect(exts).toContain('.iso');
  });

  it('every entry starts with a dot', () => {
    for (const ext of getSupportedExtensions()) {
      expect(ext.startsWith('.')).toBe(true);
    }
  });
});

describe('isSupportedExtension', () => {
  it('returns true for known extensions', () => {
    expect(isSupportedExtension('.nes')).toBe(true);
    expect(isSupportedExtension('.gba')).toBe(true);
    expect(isSupportedExtension('.zip')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isSupportedExtension('.NES')).toBe(true);
    expect(isSupportedExtension('.GBA')).toBe(true);
    expect(isSupportedExtension('.Sfc')).toBe(true);
  });

  it('returns false for unsupported extensions', () => {
    expect(isSupportedExtension('.mp3')).toBe(false);
    expect(isSupportedExtension('.txt')).toBe(false);
    expect(isSupportedExtension('.exe')).toBe(false);
    expect(isSupportedExtension('')).toBe(false);
  });
});

describe('getPlatformIdForExtension', () => {
  it('returns the platform ID for known extensions', () => {
    expect(getPlatformIdForExtension('.nes')).toBe('nes');
    expect(getPlatformIdForExtension('.gba')).toBe('gba');
    expect(getPlatformIdForExtension('.n64')).toBe('n64');
  });

  it('is case-insensitive', () => {
    expect(getPlatformIdForExtension('.NES')).toBe('nes');
    expect(getPlatformIdForExtension('.GBA')).toBe('gba');
  });

  it('returns null for unknown extensions', () => {
    expect(getPlatformIdForExtension('.mp3')).toBeNull();
    expect(getPlatformIdForExtension('.doc')).toBeNull();
    expect(getPlatformIdForExtension('')).toBeNull();
  });
});

describe('calculateFileHash', () => {
  it('returns an 8-char uppercase hex CRC32 string', async () => {
    const mockFs = {
      readBinary: vi.fn().mockResolvedValue(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]).buffer),
    } as any;

    const hash = await calculateFileHash('/test.rom', mockFs);
    expect(hash).toMatch(/^[0-9A-F]{8}$/);
    expect(mockFs.readBinary).toHaveBeenCalledWith('/test.rom');
  });

  it('produces consistent hashes for the same data', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const mockFs = {
      readBinary: vi.fn().mockResolvedValue(data.buffer),
    } as any;

    const hash1 = await calculateFileHash('/a.rom', mockFs);
    const hash2 = await calculateFileHash('/b.rom', mockFs);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different data', async () => {
    const fs1 = {
      readBinary: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    } as any;
    const fs2 = {
      readBinary: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6]).buffer),
    } as any;

    const hash1 = await calculateFileHash('/a.rom', fs1);
    const hash2 = await calculateFileHash('/b.rom', fs2);
    expect(hash1).not.toBe(hash2);
  });

  it('handles empty data', async () => {
    const mockFs = {
      readBinary: vi.fn().mockResolvedValue(new Uint8Array(0).buffer),
    } as any;

    const hash = await calculateFileHash('/empty.rom', mockFs);
    expect(hash).toMatch(/^[0-9A-F]{8}$/);
  });

  it('truncates large files to 16MB for hashing', async () => {
    const largeData = new Uint8Array(20 * 1024 * 1024); // 20MB
    largeData.fill(0xab);
    const mockFs = {
      readBinary: vi.fn().mockResolvedValue(largeData.buffer),
    } as any;

    const hash = await calculateFileHash('/large.rom', mockFs);
    expect(hash).toMatch(/^[0-9A-F]{8}$/);

    // Hash of 16MB truncated data should differ from full 20MB
    const smallData = new Uint8Array(16 * 1024 * 1024);
    smallData.fill(0xab);
    const mockFs2 = {
      readBinary: vi.fn().mockResolvedValue(smallData.buffer),
    } as any;
    const hash2 = await calculateFileHash('/small.rom', mockFs2);
    expect(hash).toBe(hash2);
  });
});

describe('ROM_INFO_PATTERNS', () => {
  it('matches region codes', () => {
    expect(ROM_INFO_PATTERNS.region.test('(USA)')).toBe(true);
    expect(ROM_INFO_PATTERNS.region.test('(Japan)')).toBe(true);
    expect(ROM_INFO_PATTERNS.region.test('(Europe)')).toBe(true);
    expect(ROM_INFO_PATTERNS.region.test('(World)')).toBe(true);
  });

  it('matches revisions', () => {
    expect(ROM_INFO_PATTERNS.revision.test('(Rev A)')).toBe(true);
    expect(ROM_INFO_PATTERNS.revision.test('(Rev 2)')).toBe(true);
  });

  it('matches version numbers', () => {
    expect(ROM_INFO_PATTERNS.version.test('(v1.0)')).toBe(true);
    expect(ROM_INFO_PATTERNS.version.test('(1.2)')).toBe(true);
  });

  it('matches verified flag', () => {
    expect(ROM_INFO_PATTERNS.verified.test('[!]')).toBe(true);
  });

  it('matches bad dump flag', () => {
    expect(ROM_INFO_PATTERNS.bad.test('[b]')).toBe(true);
    expect(ROM_INFO_PATTERNS.bad.test('[b1]')).toBe(true);
  });

  it('matches trainer flag', () => {
    expect(ROM_INFO_PATTERNS.trainer.test('[t]')).toBe(true);
    expect(ROM_INFO_PATTERNS.trainer.test('[t1]')).toBe(true);
  });

  it('matches hack flag', () => {
    expect(ROM_INFO_PATTERNS.hack.test('[h]')).toBe(true);
    expect(ROM_INFO_PATTERNS.hack.test('[h1]')).toBe(true);
  });

  it('matches translation flag', () => {
    expect(ROM_INFO_PATTERNS.translation.test('[T+Eng]')).toBe(true);
    expect(ROM_INFO_PATTERNS.translation.test('[T-Fre]')).toBe(true);
  });
});

describe('extractRomInfoFromFilename', () => {
  it('extracts a clean title from a simple filename', () => {
    const info = extractRomInfoFromFilename('Super Mario Bros.nes');
    expect(info.title).toBe('Super Mario Bros');
    expect(info.region).toBeUndefined();
    expect(info.verified).toBe(false);
    expect(info.isBad).toBe(false);
  });

  it('extracts region from filename', () => {
    const info = extractRomInfoFromFilename('Zelda (USA).sfc');
    expect(info.title).toBe('Zelda');
    expect(info.region).toBe('USA');
  });

  it('extracts revision from filename', () => {
    const info = extractRomInfoFromFilename('Game (Rev A).nes');
    expect(info.title).toBe('Game');
    expect(info.revision).toBe('A');
  });

  it('extracts version from filename', () => {
    const info = extractRomInfoFromFilename('App (v1.2).gba');
    expect(info.title).toBe('App');
    expect(info.version).toBe('1.2');
  });

  it('detects verified ROMs', () => {
    const info = extractRomInfoFromFilename('Game (USA) [!].nes');
    expect(info.verified).toBe(true);
    expect(info.isBad).toBe(false);
  });

  it('detects bad dumps', () => {
    const info = extractRomInfoFromFilename('Game [b1].nes');
    expect(info.isBad).toBe(true);
    expect(info.verified).toBe(false);
  });

  it('handles complex filenames with multiple metadata', () => {
    const info = extractRomInfoFromFilename('Super Mario World (USA) (Rev A) [!].sfc');
    expect(info.title).toBe('Super Mario World');
    expect(info.region).toBe('USA');
    expect(info.revision).toBe('A');
    expect(info.verified).toBe(true);
    expect(info.isBad).toBe(false);
  });

  it('falls back to full filename if title would be empty', () => {
    const info = extractRomInfoFromFilename('(USA).nes');
    expect(info.title).toBe('(USA).nes');
  });

  it('handles filenames without extensions', () => {
    const info = extractRomInfoFromFilename('My Game (Japan)');
    expect(info.title).toBe('My Game');
    expect(info.region).toBe('Japan');
  });
});
