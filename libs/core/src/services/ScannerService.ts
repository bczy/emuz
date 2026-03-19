/**
 * ScannerService - Handles ROM discovery and library scanning
 *
 * Migrated to use @emuz/storage flat-file engine (FlatDb) instead of Drizzle ORM.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Platform } from '../models/Platform';
import type { FlatDb } from '@emuz/storage';
import type { PlatformRow, ScanDirectoryRow } from '@emuz/storage';
import type { IScannerService, ScanOptions, ScanProgress, ScanStatus, RomDirectory } from './types';

function rowToPlatform(row: PlatformRow): Platform {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    manufacturer: row.manufacturer ?? undefined,
    generation: row.generation ?? undefined,
    releaseYear: row.release_year ?? undefined,
    iconPath: row.icon_path ?? undefined,
    wallpaperPath: row.wallpaper_path ?? undefined,
    color: row.color ?? undefined,
    romExtensions: row.rom_extensions ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert ScanDirectoryRow to RomDirectory model
 */
function rowToRomDirectory(row: ScanDirectoryRow): RomDirectory {
  return {
    id: row.id,
    path: row.path,
    platformId: row.platform_id ?? undefined,
    recursive: row.is_recursive,
    enabled: true, // scan_directories are enabled by default
    lastScanned: row.last_scanned_at ?? undefined,
    createdAt: row.created_at,
  };
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
 * Compute a SHA-256 hex digest using the Web Crypto API.
 */
async function sha256Hex(data: ArrayBuffer | Uint8Array | Buffer): Promise<string> {
  let buf: ArrayBuffer;
  if (data instanceof ArrayBuffer) {
    buf = data;
  } else {
    const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
    buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  }

  const hashBuf = await globalThis.crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * ScannerService implementation using @emuz/storage FlatDb
 */
export class ScannerService implements IScannerService {
  private cancelled = false;
  private isScanning = false;
  private currentDirectory: string | undefined;
  private filesScanned = 0;
  private gamesFound = 0;

  constructor(
    private readonly db: FlatDb,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly fs: any
  ) {}

  async addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory> {
    const existing = this.db.scanDirectories.findOne((d) => d.path === path);
    if (existing) {
      throw new Error('Directory already exists');
    }

    if (this.fs.exists) {
      const pathExists = await this.fs.exists(path);
      if (pathExists === false) {
        throw new Error(`Directory does not exist: ${path}`);
      }
    }

    const id = uuidv4();
    const now = new Date();

    this.db.scanDirectories.insert({
      id,
      path,
      platform_id: options?.platformId ?? null,
      is_recursive: options?.recursive !== false,
      last_scanned_at: null,
      created_at: now,
    });
    await this.db.flush();

    return {
      id,
      path,
      platformId: options?.platformId,
      recursive: options?.recursive !== false,
      enabled: true,
      createdAt: now,
    };
  }

  async removeDirectory(path: string, options?: { removeGames?: boolean }): Promise<void> {
    if (!path) throw new Error('Path must not be empty');

    if (options?.removeGames) {
      const toDelete = this.db.games.find((g) => g.file_path.startsWith(path));
      for (const g of toDelete) {
        this.db.games.delete(g.id);
      }
    }

    const dir = this.db.scanDirectories.findOne((d) => d.path === path);
    if (dir) {
      this.db.scanDirectories.delete(dir.id);
      await this.db.flush();
    }
  }

  async getDirectories(): Promise<RomDirectory[]> {
    const rows = this.db.scanDirectories.all();
    rows.sort((a, b) => a.path.localeCompare(b.path));
    return rows.map(rowToRomDirectory);
  }

  async updateDirectory(id: string, data: Partial<RomDirectory>): Promise<void> {
    const patch: Partial<ScanDirectoryRow> = {};

    if (data.path !== undefined) patch.path = data.path;
    if (data.platformId !== undefined) patch.platform_id = data.platformId ?? null;
    if (data.recursive !== undefined) patch.is_recursive = data.recursive;

    if (Object.keys(patch).length === 0) return;

    this.db.scanDirectories.update(id, patch);
    await this.db.flush();
  }

  detectPlatformByExtension(ext: string): string | null {
    const normalized = ext.toLowerCase();
    return EXTENSION_PLATFORM_MAP[normalized] ?? null;
  }

  async detectPlatform(filePath: string): Promise<Platform | null> {
    const platformId = this.detectPlatformByExtension(this.getFileExtension(filePath));
    if (!platformId) return null;

    const row = this.db.platforms.findById(platformId);
    return row ? rowToPlatform(row) : null;
  }

  async *scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress> {
    yield* this.scanDirectoryWithOptions(path, options);
  }

  async *scanDirectory(path: string): AsyncGenerator<ScanProgress> {
    yield* this.scanDirectoryWithOptions(path);
  }

  private async *scanDirectoryWithOptions(
    path: string,
    options?: ScanOptions,
    _isRoot = true
  ): AsyncGenerator<ScanProgress> {
    if (_isRoot) {
      this.cancelled = false;
      this.isScanning = true;
      this.currentDirectory = path;
      this.filesScanned = 0;
      this.gamesFound = 0;
    }

    const errors: string[] = [];

    try {
      let entries: Array<{ name: string; path: string; isDirectory: boolean }> = [];
      if (this.fs.readDir) {
        const readResult = await this.fs.readDir(path);
        entries = readResult ?? [];
      } else if (this.fs.list) {
        const listing = await this.fs.list(path);
        entries = listing?.entries ?? [];
      }

      const romFiles: Array<{ name: string; path: string }> = [];
      for (const entry of entries) {
        if (entry.isDirectory && options?.recursive) {
          // Recursively scan subdirectory — no early return after this
          for await (const subProgress of this.scanDirectoryWithOptions(
            entry.path,
            options,
            false
          )) {
            yield subProgress;
          }
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

        if (options?.skipExisting) {
          const existingGame = this.db.games.findOne((g) => g.file_path === file.path);
          if (existingGame) {
            this.filesScanned++;
            continue;
          }
        }

        let fileSize = 0;
        if (this.fs.stat) {
          try {
            const stats = await this.fs.stat(file.path);
            fileSize = stats?.size ?? 0;
          } catch {
            // ignore stat errors
          }
        }

        const ext = this.getFileExtension(file.name);
        const rawPlatformId = options?.platformId ?? this.detectPlatformByExtension(ext);
        if (!rawPlatformId) {
          this.filesScanned++;
          continue;
        }

        // Verify platform exists in DB to avoid orphaned records
        const platformRow = this.db.platforms.findById(rawPlatformId);
        if (!platformRow) {
          this.filesScanned++;
          continue;
        }

        const platformId = platformRow.id;
        const title = this.extractTitleFromFileName(file.name);

        const id = uuidv4();
        const now = new Date();
        this.db.games.insert({
          id,
          platform_id: platformId,
          title,
          file_path: file.path,
          file_name: file.name,
          file_size: fileSize,
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
        });
        await this.db.flush();

        this.filesScanned++;
        this.gamesFound++;

        yield {
          phase: 'identifying',
          currentPath: file.path,
          fileName: file.name,
          progress: Math.round(((i + 1) / filesFound) * 100),
          filesFound,
          filesProcessed: i + 1,
          gamesAdded: this.gamesFound,
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
      if (_isRoot) {
        this.isScanning = false;
        this.currentDirectory = undefined;
      }
    }
  }

  async *scanAllDirectories(): AsyncGenerator<ScanProgress> {
    const directories = await this.getDirectories();
    const enabledDirs = directories.filter((d) => d.enabled);

    for (const dir of enabledDirs) {
      if (this.cancelled) break;
      yield* this.scanDirectory(dir.path);
    }
  }

  cancelScan(): void {
    this.cancelled = true;
  }

  getScanStatus(): ScanStatus {
    return {
      isScanning: this.isScanning,
      currentDirectory: this.currentDirectory,
      filesScanned: this.filesScanned,
      gamesFound: this.gamesFound,
    };
  }

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

  private getFileExtension(path: string): string {
    const parts = path.split('.');
    if (parts.length <= 1) return '';
    const ext = parts.pop();
    return ext !== undefined ? `.${ext.toLowerCase()}` : '';
  }

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
export function createScannerService(db: FlatDb, fs: any): IScannerService {
  return new ScannerService(db, fs);
}
