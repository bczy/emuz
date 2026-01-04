/**
 * ROM file extension mappings to platform IDs
 */

import type { FileSystemAdapter } from '@emuz/platform';

/**
 * Map of file extensions to platform IDs
 */
export const romExtensionMap: Record<string, string> = {
  // Nintendo
  '.nes': 'nes',
  '.unf': 'nes',
  '.unif': 'nes',
  '.fds': 'fds',
  '.sfc': 'snes',
  '.smc': 'snes',
  '.fig': 'snes',
  '.swc': 'snes',
  '.n64': 'n64',
  '.v64': 'n64',
  '.z64': 'n64',
  '.gb': 'gb',
  '.gbc': 'gbc',
  '.gba': 'gba',
  '.nds': 'nds',
  '.3ds': '3ds',
  '.cia': '3ds',
  '.gcm': 'gc',
  '.gcz': 'gc',
  '.rvz': 'gc',
  '.wbfs': 'wii',
  '.wad': 'wii',
  '.xci': 'switch',
  '.nsp': 'switch',
  
  // Sony
  '.bin': 'psx', // Note: bin can also be other formats
  '.cue': 'psx',
  '.iso': 'psx', // Can be PS1, PS2, PSP
  '.pbp': 'psp',
  '.cso': 'psp',
  
  // Sega
  '.sms': 'sms',
  '.gg': 'gg',
  '.md': 'genesis',
  '.gen': 'genesis',
  '.smd': 'genesis',
  '.32x': '32x',
  '.cdi': 'dreamcast',
  '.gdi': 'dreamcast',
  '.chd': 'dreamcast', // Can be various systems
  
  // Atari
  '.a26': 'atari2600',
  '.a78': 'atari7800',
  '.lnx': 'lynx',
  '.jag': 'jaguar',
  
  // NEC
  '.pce': 'pce',
  
  // SNK
  '.neo': 'neogeo',
  
  // Arcade
  '.zip': 'arcade', // MAME ROMs typically
  
  // Other
  '.rom': 'generic',
};

/**
 * Get all supported ROM extensions
 */
export function getSupportedExtensions(): string[] {
  return Object.keys(romExtensionMap);
}

/**
 * Check if a file extension is a supported ROM format
 */
export function isSupportedExtension(extension: string): boolean {
  return extension.toLowerCase() in romExtensionMap;
}

/**
 * Get platform ID for a file extension
 */
export function getPlatformIdForExtension(extension: string): string | null {
  return romExtensionMap[extension.toLowerCase()] ?? null;
}

/**
 * Calculate a hash for a ROM file (CRC32 or MD5)
 * 
 * For large files, we use a partial hash (first 16MB) for performance
 */
export async function calculateFileHash(
  filePath: string,
  fs: FileSystemAdapter
): Promise<string> {
  const MAX_HASH_SIZE = 16 * 1024 * 1024; // 16MB
  
  // Read file content
  const content = await fs.readBinary(filePath);
  const data = new Uint8Array(content);
  
  // Use a subset for large files
  const hashData = data.length > MAX_HASH_SIZE 
    ? data.slice(0, MAX_HASH_SIZE) 
    : data;
  
  // Calculate CRC32
  return crc32(hashData).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * CRC32 lookup table
 */
const CRC32_TABLE = new Uint32Array(256);

// Initialize CRC32 table
(function initCrc32Table() {
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    CRC32_TABLE[i] = c >>> 0;
  }
})();

/**
 * Calculate CRC32 checksum
 */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Common ROM info patterns to extract from filenames
 */
export const ROM_INFO_PATTERNS = {
  region: /\((USA|Europe|Japan|World|En|Ja|Fr|De|Es|It|Nl|Pt|Sv|No|Da|Fi|Ko|Zh)\)/i,
  revision: /\(Rev\s*([A-Z0-9]+)\)/i,
  version: /\(v?([\d.]+)\)/i,
  verified: /\[!\]/,
  bad: /\[b\d*\]/i,
  trainer: /\[t\d*\]/i,
  hack: /\[h\d*\]/i,
  translation: /\[T[+-]?\w+\]/i,
};

/**
 * Extract metadata from ROM filename
 */
export function extractRomInfoFromFilename(filename: string): {
  title: string;
  region?: string;
  revision?: string;
  version?: string;
  verified: boolean;
  isBad: boolean;
} {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, '');
  
  // Extract region
  const regionMatch = name.match(ROM_INFO_PATTERNS.region);
  const region = regionMatch?.[1];
  
  // Extract revision
  const revMatch = name.match(ROM_INFO_PATTERNS.revision);
  const revision = revMatch?.[1];
  
  // Extract version
  const versionMatch = name.match(ROM_INFO_PATTERNS.version);
  const version = versionMatch?.[1];
  
  // Check flags
  const verified = ROM_INFO_PATTERNS.verified.test(name);
  const isBad = ROM_INFO_PATTERNS.bad.test(name);
  
  // Clean up title
  const title = name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .trim();
  
  return {
    title: title || filename,
    region,
    revision,
    version,
    verified,
    isBad,
  };
}
