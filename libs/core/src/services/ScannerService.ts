/**
 * ScannerService - Handles ROM discovery and library scanning
 */

import { v4 as uuidv4 } from 'uuid';
import type { Platform } from '../models/Platform';
import type { DatabaseAdapter } from '@emuz/database';
import type {
  IScannerService,
  ScanOptions,
  ScanProgress,
  ScanStatus,
  RomDirectory,
} from './types';
import { toDate, toOptionalDate } from '../utils/db';

/**
 * Database row types
 */
interface RomDirectoryRow {
  id: string;
  path: string;
  platform_id: string | null;
  recursive: number;
  enabled: number;
  last_scanned: number | null;
  created_at: number;
}

/**
 * Extension → platform ID map (synchronous lookup)
 */
const EXTENSION_PLATFORM_MAP: Record<string, string> = {
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
  '.iso': 'gc',
  '.wbfs': 'wii',
  '.wad': 'wii',
  '.xci': 'switch',
  '.nsp': 'switch',
  '.bin': 'ps1',
  '.cue': 'ps1',
  '.pbp': 'psp',
  '.cso': 'psp',
  '.sms': 'sms',
  '.gg': 'gg',
  '.md': 'genesis',
  '.gen': 'genesis',
  '.smd': 'genesis',
  '.32x': '32x',
  '.cdi': 'dreamcast',
  '.gdi': 'dreamcast',
  '.chd': 'dreamcast',
  '.a26': 'atari2600',
  '.a78': 'atari7800',
  '.lnx': 'lynx',
  '.jag': 'jaguar',
  '.pce': 'pce',
  '.neo': 'neogeo',
  '.zip': 'arcade',
  '.rom': 'generic',
};

/**
 * Convert database row to RomDirectory model
 */
function rowToRomDirectory(row: RomDirectoryRow): RomDirectory {
  return {
    id: row.id,
    path: row.path,
    platformId: row.platform_id ?? undefined,
    recursive: Boolean(row.recursive),
    enabled: Boolean(row.enabled),
    lastScanned: toOptionalDate(row.last_scanned),
    createdAt: toDate(row.created_at),
  };
}

/**
 * Compute a SHA-256 hex digest using the Web Crypto API.
 * Available in browsers (Web Crypto) and Node.js 16+ (globalThis.crypto).
 */
async function sha256Hex(data: ArrayBuffer | Uint8Array | Buffer): Promise<string> {
  // Normalise to ArrayBuffer
  let buf: ArrayBuffer;
  if (data instanceof ArrayBuffer) {
    buf = data;
  } else {
    // Buffer / Uint8Array — extract the underlying ArrayBuffer slice
    const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
    buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  }

  const hashBuf = await globalThis.crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * ScannerService implementation
 */
export class ScannerService implements IScannerService {
  private cancelled = false;
  private isScanning = false;
  private currentDirectory: string | undefined;
  private filesScanned = 0;
  private gamesFound = 0;

  constructor(
    private readonly db: DatabaseAdapter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly fs: any
  ) {}

  /**
   * Add a new ROM directory
   */
  async addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory> {
    // Check for duplicates FIRST (before exists check)
    const existing = await this.db.query<{ path: string }>(
      'SELECT path FROM scan_directories WHERE path = ?',
      [path]
    );

    if (existing && existing.length > 0) {
      throw new Error('Directory already exists');
    }

    // Validate directory exists (only if exists() explicitly returns false)
    if (this.fs.exists) {
      const pathExists = await this.fs.exists(path);
      if (pathExists === false) {
        throw new Error(`Directory does not exist: ${path}`);
      }
    }

    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      `INSERT INTO scan_directories (id, path, platform_id, recursive, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        path,
        options?.platformId ?? null,
        options?.recursive !== false ? 1 : 0,
        1, // enabled by default
        now,
      ]
    );

    return {
      id,
      path,
      platformId: options?.platformId,
      recursive: options?.recursive !== false,
      enabled: true,
      createdAt: new Date(now * 1000),
    };
  }

  /**
   * Remove a ROM directory, optionally removing associated games
   */
  async removeDirectory(path: string, options?: { removeGames?: boolean }): Promise<void> {
    if (options?.removeGames) {
      await this.db.execute(
        'DELETE FROM games WHERE file_path LIKE ?',
        [`${path}%`]
      );
    }

    await this.db.execute('DELETE FROM scan_directories WHERE path = ?', [path]);
  }

  /**
   * Get all ROM directories
   */
  async getDirectories(): Promise<RomDirectory[]> {
    const rows = await this.db.query<RomDirectoryRow>(
      'SELECT * FROM scan_directories ORDER BY path ASC'
    );
    return rows.map(rowToRomDirectory);
  }

  /**
   * Update a ROM directory
   */
  async updateDirectory(id: string, data: Partial<RomDirectory>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.path !== undefined) {
      updates.push('path = ?');
      params.push(data.path);
    }
    if (data.platformId !== undefined) {
      updates.push('platform_id = ?');
      params.push(data.platformId ?? null);
    }
    if (data.recursive !== undefined) {
      updates.push('recursive = ?');
      params.push(data.recursive ? 1 : 0);
    }
    if (data.enabled !== undefined) {
      updates.push('enabled = ?');
      params.push(data.enabled ? 1 : 0);
    }

    if (updates.length === 0) return;
    params.push(id);

    await this.db.execute(
      `UPDATE scan_directories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Detect platform by file extension (synchronous)
   */
  detectPlatformByExtension(ext: string): string | null {
    const normalized = ext.toLowerCase();
    return EXTENSION_PLATFORM_MAP[normalized] ?? null;
  }

  /**
   * Detect platform from file path (async, DB-backed)
   */
  async detectPlatform(filePath: string): Promise<Platform | null> {
    const ext = this.getFileExtension(filePath);
    const platformId = this.detectPlatformByExtension(ext);

    if (!platformId) return null;

    // Return a minimal Platform object
    return {
      id: platformId,
      name: platformId.toUpperCase(),
      romExtensions: [ext.replace('.', '')],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Scan a directory and yield progress updates.
   */
  async *scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress> {
    yield* this.scanDirectoryWithOptions(path, options);
  }

  /**
   * Scan a specific directory for ROMs (legacy method)
   */
  async *scanDirectory(path: string): AsyncGenerator<ScanProgress> {
    yield* this.scanDirectoryWithOptions(path);
  }

  /**
   * Internal scan implementation — yields one progress item per processed file.
   */
  private async *scanDirectoryWithOptions(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress> {
    this.cancelled = false;
    this.isScanning = true;
    this.currentDirectory = path;
    this.filesScanned = 0;
    this.gamesFound = 0;

    const errors: string[] = [];

    try {
      // Read directory entries
      let entries: Array<{ name: string; path: string; isDirectory: boolean }> = [];
      if (this.fs.readDir) {
        const readResult = await this.fs.readDir(path);
        entries = readResult ?? [];
      } else if (this.fs.list) {
        const listing = await this.fs.list(path);
        entries = listing?.entries ?? [];
      }

      // Collect ROM files; handle recursive subdirectory scan
      const romFiles: Array<{ name: string; path: string }> = [];
      for (const entry of entries) {
        if (entry.isDirectory && options?.recursive) {
          // Recursively scan subdirectory then return
          for await (const subProgress of this.scanDirectoryWithOptions(entry.path, options)) {
            yield subProgress;
          }
          return;
        } else if (!entry.isDirectory) {
          const ext = this.getFileExtension(entry.name);
          const platformId = options?.platformId ?? this.detectPlatformByExtension(ext);
          if (platformId) {
            romFiles.push({ name: entry.name, path: entry.path });
          }
        }
      }

      const filesFound = romFiles.length;

      for (let i = 0; i < romFiles.length; i++) {
        if (this.cancelled) break;

        const file = romFiles[i];

        // Check if we should skip already-scanned files
        if (options?.skipExisting) {
          const existingRows = await this.db.query<{ file_path: string }>(
            'SELECT file_path FROM games WHERE file_path = ?',
            [file.path]
          );
          if (existingRows && existingRows.length > 0) {
            // Skip this file — do NOT yield
            this.filesScanned++;
            continue;
          }
        }

        // Get file stats
        let fileSize = 0;
        if (this.fs.stat) {
          try {
            const stats = await this.fs.stat(file.path);
            fileSize = stats?.size ?? 0;
          } catch {
            // ignore stat errors
          }
        }

        // Determine platform
        const ext = this.getFileExtension(file.name);
        const platformId = options?.platformId ?? this.detectPlatformByExtension(ext) ?? 'unknown';
        const title = this.extractTitleFromFileName(file.name);

        // Insert game into database
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);
        await this.db.execute(
          `INSERT INTO games (id, platform_id, title, file_path, file_name, file_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, platformId, title, file.path, file.name, fileSize, now, now]
        );

        this.filesScanned++;
        this.gamesFound++;

        yield {
          phase: 'identifying',
          currentPath: file.path,
          fileName: file.name,
          progress: Math.round(((i + 1) / filesFound) * 100),
          filesFound,
          filesProcessed: i + 1,
          gamesAdded: i + 1,
          gamesUpdated: 0,
          errors,
        };
      }
    } catch (error) {
      yield {
        phase: 'error',
        currentPath: path,
        fileName: undefined,
        progress: 0,
        filesFound: 0,
        filesProcessed: 0,
        gamesAdded: 0,
        gamesUpdated: 0,
        errors: [`Scan failed: ${error instanceof Error ? error.message : String(error)}`],
      };
    } finally {
      this.isScanning = false;
      this.currentDirectory = undefined;
    }
  }

  /**
   * Scan all enabled directories
   */
  async *scanAllDirectories(): AsyncGenerator<ScanProgress> {
    const directories = await this.getDirectories();
    const enabledDirs = directories.filter((d) => d.enabled);

    for (const dir of enabledDirs) {
      if (this.cancelled) break;
      yield* this.scanDirectory(dir.path);
    }
  }

  /**
   * Cancel the current scan
   */
  cancelScan(): void {
    this.cancelled = true;
  }

  /**
   * Get current scan status (synchronous)
   */
  getScanStatus(): ScanStatus {
    return {
      isScanning: this.isScanning,
      currentDirectory: this.currentDirectory,
      filesScanned: this.filesScanned,
      gamesFound: this.gamesFound,
    };
  }

  /**
   * Calculate SHA-256 hash of a file using Web Crypto API (browser + Node.js 16+)
   */
  async calculateHash(filePath: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;

    if (this.fs.readFile) {
      data = await this.fs.readFile(filePath);
    } else if (this.fs.readBinary) {
      data = await this.fs.readBinary(filePath);
    } else {
      throw new Error('No file reading method available');
    }

    return sha256Hex(data);
  }

  /**
   * Get file extension from path (includes the dot, lowercased)
   */
  private getFileExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
  }

  /**
   * Extract game title from file name
   */
  private extractTitleFromFileName(fileName: string): string {
    let title = fileName.replace(/\.[^/.]+$/, '');

    title = title
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s*\[[^\]]*\]/g, '')
      .trim();

    return title || fileName;
  }
}

/**
 * Create a new ScannerService instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createScannerService(db: DatabaseAdapter, fs: any): IScannerService {
  return new ScannerService(db, fs);
}
