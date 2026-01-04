/**
 * ScannerService - Handles ROM discovery and library scanning
 */

import { v4 as uuidv4 } from 'uuid';
import type { Platform } from '../models/Platform';
import type { DatabaseAdapter } from '@emuz/database';
import type { FileSystemAdapter } from '@emuz/platform';
import type {
  IScannerService,
  ScanOptions,
  ScanProgress,
  RomDirectory,
} from './types';
import { romExtensionMap, calculateFileHash } from '../utils/fileExtensions';

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

interface PlatformRow {
  id: string;
  name: string;
  short_name: string | null;
  manufacturer: string | null;
  generation: number | null;
  release_year: number | null;
  icon_path: string | null;
  wallpaper_path: string | null;
  color: string | null;
  rom_extensions: string;
  created_at: number;
  updated_at: number;
}

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
    lastScanned: row.last_scanned ? new Date(row.last_scanned * 1000) : undefined,
    createdAt: new Date(row.created_at * 1000),
  };
}

/**
 * ScannerService implementation
 */
export class ScannerService implements IScannerService {
  private cancelled = false;
  private platformCache: Map<string, Platform> = new Map();
  private extensionToPlatformCache: Map<string, Platform | null> = new Map();

  constructor(
    private readonly db: DatabaseAdapter,
    private readonly fs: FileSystemAdapter
  ) {}

  /**
   * Add a new ROM directory
   */
  async addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory> {
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
   * Remove a ROM directory
   */
  async removeDirectory(path: string): Promise<void> {
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
   * Scan a specific directory for ROMs
   */
  async *scanDirectory(path: string): AsyncGenerator<ScanProgress> {
    this.cancelled = false;
    await this.loadPlatformCache();

    const progress: ScanProgress = {
      phase: 'scanning',
      currentPath: path,
      filesFound: 0,
      filesProcessed: 0,
      gamesAdded: 0,
      gamesUpdated: 0,
      errors: [],
    };

    yield { ...progress };

    try {
      const files = await this.collectRomFiles(path, true);
      progress.filesFound = files.length;
      progress.phase = 'identifying';
      yield { ...progress };

      for (const filePath of files) {
        if (this.cancelled) {
          progress.phase = 'complete';
          yield { ...progress };
          return;
        }

        progress.currentPath = filePath;

        try {
          const result = await this.processRomFile(filePath);
          if (result === 'added') {
            progress.gamesAdded++;
          } else if (result === 'updated') {
            progress.gamesUpdated++;
          }
        } catch (error) {
          progress.errors.push(
            `Failed to process ${filePath}: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        progress.filesProcessed++;
        yield { ...progress };
      }

      // Update last scanned timestamp
      const now = Math.floor(Date.now() / 1000);
      await this.db.execute(
        'UPDATE scan_directories SET last_scanned = ? WHERE path = ?',
        [now, path]
      );

      progress.phase = 'complete';
      progress.currentPath = undefined;
      yield { ...progress };
    } catch (error) {
      progress.phase = 'error';
      progress.errors.push(
        `Scan failed: ${error instanceof Error ? error.message : String(error)}`
      );
      yield { ...progress };
    }
  }

  /**
   * Scan all enabled directories
   */
  async *scanAllDirectories(): AsyncGenerator<ScanProgress> {
    const directories = await this.getDirectories();
    const enabledDirs = directories.filter((d) => d.enabled);

    const totalProgress: ScanProgress = {
      phase: 'scanning',
      filesFound: 0,
      filesProcessed: 0,
      gamesAdded: 0,
      gamesUpdated: 0,
      errors: [],
    };

    for (const dir of enabledDirs) {
      if (this.cancelled) break;

      for await (const progress of this.scanDirectory(dir.path)) {
        totalProgress.currentPath = progress.currentPath;
        totalProgress.filesFound = progress.filesFound;
        totalProgress.filesProcessed = progress.filesProcessed;
        totalProgress.gamesAdded += progress.gamesAdded;
        totalProgress.gamesUpdated += progress.gamesUpdated;
        totalProgress.errors.push(...progress.errors);
        
        yield { ...totalProgress };
      }
    }

    totalProgress.phase = 'complete';
    yield { ...totalProgress };
  }

  /**
   * Cancel the current scan
   */
  cancelScan(): void {
    this.cancelled = true;
  }

  /**
   * Detect platform from file path based on extension
   */
  async detectPlatform(filePath: string): Promise<Platform | null> {
    const extension = this.getFileExtension(filePath);
    
    if (this.extensionToPlatformCache.has(extension)) {
      return this.extensionToPlatformCache.get(extension) ?? null;
    }

    // Check built-in extension map first
    const platformId = romExtensionMap[extension];
    if (platformId) {
      const platform = this.platformCache.get(platformId);
      if (platform) {
        this.extensionToPlatformCache.set(extension, platform);
        return platform;
      }
    }

    // Fallback: query database for platform with this extension
    const rows = await this.db.query<PlatformRow>(
      `SELECT * FROM platforms WHERE rom_extensions LIKE ?`,
      [`%"${extension}"%`]
    );

    if (rows.length > 0) {
      const platform = this.rowToPlatform(rows[0]);
      this.extensionToPlatformCache.set(extension, platform);
      return platform;
    }

    this.extensionToPlatformCache.set(extension, null);
    return null;
  }

  /**
   * Calculate hash of a file
   */
  async calculateHash(filePath: string): Promise<string> {
    return calculateFileHash(filePath, this.fs);
  }

  /**
   * Load platform cache from database
   */
  private async loadPlatformCache(): Promise<void> {
    if (this.platformCache.size > 0) return;

    const rows = await this.db.query<PlatformRow>('SELECT * FROM platforms');
    for (const row of rows) {
      const platform = this.rowToPlatform(row);
      this.platformCache.set(platform.id, platform);
    }
  }

  /**
   * Convert database row to Platform model
   */
  private rowToPlatform(row: PlatformRow): Platform {
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
      romExtensions: JSON.parse(row.rom_extensions) as string[],
      createdAt: new Date(row.created_at * 1000),
      updatedAt: new Date(row.updated_at * 1000),
    };
  }

  /**
   * Collect all ROM files from a directory
   */
  private async collectRomFiles(path: string, recursive: boolean): Promise<string[]> {
    const files: string[] = [];
    const listing = await this.fs.list(path);

    for (const entry of listing.entries) {
      const fullPath = `${path}/${entry.name}`;

      if (entry.isDirectory && recursive) {
        const subFiles = await this.collectRomFiles(fullPath, true);
        files.push(...subFiles);
      } else if (!entry.isDirectory) {
        const extension = this.getFileExtension(entry.name);
        if (this.isRomExtension(extension)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Process a single ROM file
   */
  private async processRomFile(filePath: string): Promise<'added' | 'updated' | 'skipped'> {
    const platform = await this.detectPlatform(filePath);
    if (!platform) return 'skipped';

    const fileName = filePath.split('/').pop() ?? filePath;
    const stats = await this.fs.stat(filePath);

    // Check if game already exists by file path
    const existing = await this.db.query<{ id: string }>(
      'SELECT id FROM games WHERE file_path = ?',
      [filePath]
    );

    const now = Math.floor(Date.now() / 1000);

    if (existing.length > 0) {
      // Update existing game
      await this.db.execute(
        `UPDATE games SET file_size = ?, updated_at = ? WHERE id = ?`,
        [stats.size, now, existing[0].id]
      );
      return 'updated';
    }

    // Add new game
    const id = uuidv4();
    const title = this.extractTitleFromFileName(fileName);

    await this.db.execute(
      `INSERT INTO games (id, platform_id, title, file_path, file_name, file_size, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, platform.id, title, filePath, fileName, stats.size, now, now]
    );

    return 'added';
  }

  /**
   * Get file extension from path
   */
  private getFileExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
  }

  /**
   * Check if extension is a known ROM extension
   */
  private isRomExtension(extension: string): boolean {
    return extension in romExtensionMap;
  }

  /**
   * Extract game title from file name
   */
  private extractTitleFromFileName(fileName: string): string {
    // Remove extension
    let title = fileName.replace(/\.[^/.]+$/, '');

    // Remove common patterns like (USA), [!], (Europe), etc.
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
export function createScannerService(
  db: DatabaseAdapter,
  fs: FileSystemAdapter
): IScannerService {
  return new ScannerService(db, fs);
}
