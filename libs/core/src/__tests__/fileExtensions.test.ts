/**
 * fileExtensions utils — unit tests
 *
 * Covers: romExtensionMap, getSupportedExtensions, isSupportedExtension,
 *         getPlatformIdForExtension, calculateFileHash, extractRomInfoFromFilename
 */

import { describe, it, expect, vi } from 'vitest';
import {
  romExtensionMap,
  getSupportedExtensions,
  isSupportedExtension,
  getPlatformIdForExtension,
  calculateFileHash,
  extractRomInfoFromFilename,
  ROM_INFO_PATTERNS,
} from '../utils/fileExtensions';
import type { FileSystemAdapter } from '@emuz/platform';

// ---------------------------------------------------------------------------
// romExtensionMap
// ---------------------------------------------------------------------------

describe('romExtensionMap — known mappings', () => {
  it('.nes maps to nes', () => {
    expect(romExtensionMap['.nes']).toBe('nes');
  });

  it('.sfc maps to snes', () => {
    expect(romExtensionMap['.sfc']).toBe('snes');
  });

  it('.gb maps to gb', () => {
    expect(romExtensionMap['.gb']).toBe('gb');
  });

  it('.gba maps to gba', () => {
    expect(romExtensionMap['.gba']).toBe('gba');
  });

  it('.iso maps to psx', () => {
    expect(romExtensionMap['.iso']).toBe('psx');
  });

  it('.md maps to genesis', () => {
    expect(romExtensionMap['.md']).toBe('genesis');
  });

  it('.zip maps to arcade', () => {
    expect(romExtensionMap['.zip']).toBe('arcade');
  });

  it('.rom maps to generic', () => {
    expect(romExtensionMap['.rom']).toBe('generic');
  });
});

// ---------------------------------------------------------------------------
// getSupportedExtensions
// ---------------------------------------------------------------------------

describe('getSupportedExtensions', () => {
  it('returns an array', () => {
    expect(Array.isArray(getSupportedExtensions())).toBe(true);
  });

  it('includes .nes', () => {
    expect(getSupportedExtensions()).toContain('.nes');
  });

  it('includes .gba', () => {
    expect(getSupportedExtensions()).toContain('.gba');
  });

  it('returns all keys from romExtensionMap', () => {
    const keys = Object.keys(romExtensionMap);
    expect(getSupportedExtensions()).toEqual(keys);
  });

  it('does not contain duplicates', () => {
    const exts = getSupportedExtensions();
    expect(new Set(exts).size).toBe(exts.length);
  });
});

// ---------------------------------------------------------------------------
// isSupportedExtension
// ---------------------------------------------------------------------------

describe('isSupportedExtension', () => {
  it('returns true for .nes', () => {
    expect(isSupportedExtension('.nes')).toBe(true);
  });

  it('returns true for .gba', () => {
    expect(isSupportedExtension('.gba')).toBe(true);
  });

  it('returns false for .txt', () => {
    expect(isSupportedExtension('.txt')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSupportedExtension('')).toBe(false);
  });

  it('is case-insensitive — .NES returns true', () => {
    expect(isSupportedExtension('.NES')).toBe(true);
  });

  it('is case-insensitive — .GBA returns true', () => {
    expect(isSupportedExtension('.GBA')).toBe(true);
  });

  it('returns false for .exe', () => {
    expect(isSupportedExtension('.exe')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPlatformIdForExtension
// ---------------------------------------------------------------------------

describe('getPlatformIdForExtension', () => {
  it('returns nes for .nes', () => {
    expect(getPlatformIdForExtension('.nes')).toBe('nes');
  });

  it('returns snes for .sfc', () => {
    expect(getPlatformIdForExtension('.sfc')).toBe('snes');
  });

  it('returns null for unsupported extension', () => {
    expect(getPlatformIdForExtension('.xyz')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getPlatformIdForExtension('')).toBeNull();
  });

  it('is case-insensitive — .NES returns nes', () => {
    expect(getPlatformIdForExtension('.NES')).toBe('nes');
  });

  it('is case-insensitive — .GBA returns gba', () => {
    expect(getPlatformIdForExtension('.GBA')).toBe('gba');
  });

  it('returns arcade for .zip', () => {
    expect(getPlatformIdForExtension('.zip')).toBe('arcade');
  });

  it('returns dreamcast for .gdi', () => {
    expect(getPlatformIdForExtension('.gdi')).toBe('dreamcast');
  });
});

// ---------------------------------------------------------------------------
// calculateFileHash
// ---------------------------------------------------------------------------

describe('calculateFileHash', () => {
  function makeFsAdapter(bytes: Uint8Array): FileSystemAdapter {
    return {
      readBinary: vi.fn().mockResolvedValue(bytes.buffer),
    } as unknown as FileSystemAdapter;
  }

  it('returns an 8-character hex string for a non-empty file', async () => {
    const fs = makeFsAdapter(new Uint8Array([1, 2, 3, 4]));
    const hash = await calculateFileHash('/rom.nes', fs);
    expect(hash).toMatch(/^[0-9A-F]{8}$/);
  });

  it('returns the same hash for identical content', async () => {
    const data = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const hash1 = await calculateFileHash('/a.nes', makeFsAdapter(data));
    const hash2 = await calculateFileHash('/b.nes', makeFsAdapter(data));
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different content', async () => {
    const hash1 = await calculateFileHash('/a.nes', makeFsAdapter(new Uint8Array([1, 2, 3])));
    const hash2 = await calculateFileHash('/b.nes', makeFsAdapter(new Uint8Array([4, 5, 6])));
    expect(hash1).not.toBe(hash2);
  });

  it('returns a valid hash for an empty file', async () => {
    const fs = makeFsAdapter(new Uint8Array([]));
    const hash = await calculateFileHash('/empty.nes', fs);
    expect(hash).toMatch(/^[0-9A-F]{8}$/);
  });

  it('calls fs.readBinary with the provided path', async () => {
    const fs = makeFsAdapter(new Uint8Array([0]));
    await calculateFileHash('/path/to/rom.sfc', fs);
    expect(fs.readBinary).toHaveBeenCalledWith('/path/to/rom.sfc');
  });
});

// ---------------------------------------------------------------------------
// extractRomInfoFromFilename
// ---------------------------------------------------------------------------

describe('extractRomInfoFromFilename — title extraction', () => {
  it('extracts a plain title', () => {
    expect(extractRomInfoFromFilename('Zelda.nes').title).toBe('Zelda');
  });

  it('strips region tag from title', () => {
    const result = extractRomInfoFromFilename('Zelda (USA).nes');
    expect(result.title).toBe('Zelda');
  });

  it('strips multiple parenthetical tags', () => {
    const result = extractRomInfoFromFilename('Metroid (USA) (Rev A).nes');
    expect(result.title).toBe('Metroid');
  });

  it('uses filename as title fallback when name is only tags', () => {
    const result = extractRomInfoFromFilename('(USA).nes');
    // title will be empty after stripping, so falls back to filename
    expect(result.title).toBe('(USA).nes');
  });
});

describe('extractRomInfoFromFilename — region', () => {
  it('extracts USA region', () => {
    expect(extractRomInfoFromFilename('Game (USA).nes').region).toBe('USA');
  });

  it('extracts Japan region', () => {
    expect(extractRomInfoFromFilename('Game (Japan).nes').region).toBe('Japan');
  });

  it('extracts Europe region', () => {
    expect(extractRomInfoFromFilename('Game (Europe).nes').region).toBe('Europe');
  });

  it('extracts World region', () => {
    expect(extractRomInfoFromFilename('Game (World).sfc').region).toBe('World');
  });

  it('returns undefined when no region is present', () => {
    expect(extractRomInfoFromFilename('Game.nes').region).toBeUndefined();
  });
});

describe('extractRomInfoFromFilename — revision', () => {
  it('extracts revision', () => {
    expect(extractRomInfoFromFilename('Game (Rev A).nes').revision).toBe('A');
  });

  it('extracts numeric revision', () => {
    expect(extractRomInfoFromFilename('Game (Rev 2).nes').revision).toBe('2');
  });

  it('returns undefined when no revision is present', () => {
    expect(extractRomInfoFromFilename('Game (USA).nes').revision).toBeUndefined();
  });
});

describe('extractRomInfoFromFilename — version', () => {
  it('extracts version string', () => {
    expect(extractRomInfoFromFilename('Game (v1.2).nes').version).toBe('1.2');
  });

  it('extracts version without v prefix', () => {
    expect(extractRomInfoFromFilename('Game (1.0).nes').version).toBe('1.0');
  });

  it('returns undefined when no version is present', () => {
    expect(extractRomInfoFromFilename('Game (USA).nes').version).toBeUndefined();
  });
});

describe('extractRomInfoFromFilename — flags', () => {
  it('verified is true for [!] tag', () => {
    expect(extractRomInfoFromFilename('Game [!].nes').verified).toBe(true);
  });

  it('verified is false when no [!] tag', () => {
    expect(extractRomInfoFromFilename('Game.nes').verified).toBe(false);
  });

  it('isBad is true for [b] tag', () => {
    expect(extractRomInfoFromFilename('Game [b].nes').isBad).toBe(true);
  });

  it('isBad is true for [b1] tag', () => {
    expect(extractRomInfoFromFilename('Game [b1].nes').isBad).toBe(true);
  });

  it('isBad is false when no bad tag', () => {
    expect(extractRomInfoFromFilename('Game.nes').isBad).toBe(false);
  });
});

describe('extractRomInfoFromFilename — combined metadata', () => {
  it('correctly parses a fully-tagged filename', () => {
    const result = extractRomInfoFromFilename('Super Mario Bros (USA) (Rev A) [!].nes');
    expect(result.title).toBe('Super Mario Bros');
    expect(result.region).toBe('USA');
    expect(result.revision).toBe('A');
    expect(result.verified).toBe(true);
    expect(result.isBad).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ROM_INFO_PATTERNS
// ---------------------------------------------------------------------------

describe('ROM_INFO_PATTERNS', () => {
  it('region pattern matches USA', () => {
    expect(ROM_INFO_PATTERNS.region.test('(USA)')).toBe(true);
  });

  it('revision pattern matches (Rev B)', () => {
    expect(ROM_INFO_PATTERNS.revision.test('(Rev B)')).toBe(true);
  });

  it('verified pattern matches [!]', () => {
    expect(ROM_INFO_PATTERNS.verified.test('[!]')).toBe(true);
  });

  it('bad pattern matches [b]', () => {
    expect(ROM_INFO_PATTERNS.bad.test('[b]')).toBe(true);
  });

  it('trainer pattern matches [t1]', () => {
    expect(ROM_INFO_PATTERNS.trainer.test('[t1]')).toBe(true);
  });

  it('hack pattern matches [h1]', () => {
    expect(ROM_INFO_PATTERNS.hack.test('[h1]')).toBe(true);
  });
});
