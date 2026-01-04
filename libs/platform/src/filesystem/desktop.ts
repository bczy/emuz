/**
 * Desktop file system adapter
 * Uses Node.js fs module for file operations
 */

import {
  BaseFileSystemAdapter,
  DirectoryListing,
  FileInfo,
  ReadOptions,
  WriteOptions,
} from './types';

/**
 * Desktop file system adapter using Node.js fs module
 *
 * Features:
 * - Full POSIX file system access
 * - Recursive directory operations
 * - ROM file scanning
 *
 * @example
 * ```typescript
 * const adapter = new DesktopFileSystemAdapter();
 * const roms = await adapter.scanForRoms('/games/roms', {
 *   extensions: ['nes', 'smc', 'gba'],
 *   recursive: true,
 * });
 * ```
 */
export class DesktopFileSystemAdapter extends BaseFileSystemAdapter {
  private fs: typeof import('fs/promises') | null = null;
  private path: typeof import('path') | null = null;
  private os: typeof import('os') | null = null;

  /**
   * Lazy-load Node.js modules
   */
  private async ensureModules(): Promise<void> {
    if (!this.fs) {
      this.fs = await import('fs/promises');
      this.path = await import('path');
      this.os = await import('os');
    }
  }

  async readText(path: string, options?: ReadOptions): Promise<string> {
    await this.ensureModules();
    return this.fs!.readFile(path, { encoding: options?.encoding || 'utf-8' });
  }

  async readBinary(path: string): Promise<Uint8Array> {
    await this.ensureModules();
    const buffer = await this.fs!.readFile(path);
    return new Uint8Array(buffer);
  }

  async writeText(path: string, content: string, options?: WriteOptions): Promise<void> {
    await this.ensureModules();

    if (options?.recursive) {
      const dir = this.path!.dirname(path);
      await this.fs!.mkdir(dir, { recursive: true });
    }

    if (options?.append) {
      await this.fs!.appendFile(path, content, { encoding: options?.encoding || 'utf-8' });
    } else {
      await this.fs!.writeFile(path, content, { encoding: options?.encoding || 'utf-8' });
    }
  }

  async writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void> {
    await this.ensureModules();

    if (options?.recursive) {
      const dir = this.path!.dirname(path);
      await this.fs!.mkdir(dir, { recursive: true });
    }

    if (options?.append) {
      await this.fs!.appendFile(path, content);
    } else {
      await this.fs!.writeFile(path, content);
    }
  }

  async delete(path: string): Promise<void> {
    await this.ensureModules();
    await this.fs!.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    await this.ensureModules();
    try {
      await this.fs!.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async stat(path: string): Promise<FileInfo> {
    await this.ensureModules();
    const stats = await this.fs!.stat(path);
    const name = this.path!.basename(path);

    return {
      name,
      path,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      modifiedAt: stats.mtime,
      createdAt: stats.birthtime,
      extension: this.getExtension(name),
    };
  }

  async list(dirPath: string): Promise<DirectoryListing> {
    await this.ensureModules();
    const entries: FileInfo[] = [];
    const dirents = await this.fs!.readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = this.path!.join(dirPath, dirent.name);

      try {
        const stats = await this.fs!.stat(fullPath);
        entries.push({
          name: dirent.name,
          path: fullPath,
          size: stats.size,
          isDirectory: dirent.isDirectory(),
          modifiedAt: stats.mtime,
          createdAt: stats.birthtime,
          extension: this.getExtension(dirent.name),
        });
      } catch {
        // Skip files we can't stat
      }
    }

    return {
      path: dirPath,
      entries,
    };
  }

  async mkdir(path: string, recursive?: boolean): Promise<void> {
    await this.ensureModules();
    await this.fs!.mkdir(path, { recursive: recursive ?? false });
  }

  async rmdir(path: string, recursive?: boolean): Promise<void> {
    await this.ensureModules();
    await this.fs!.rm(path, { recursive: recursive ?? false, force: true });
  }

  async copy(source: string, destination: string): Promise<void> {
    await this.ensureModules();
    await this.fs!.copyFile(source, destination);
  }

  async move(source: string, destination: string): Promise<void> {
    await this.ensureModules();
    await this.fs!.rename(source, destination);
  }

  async getDocumentsPath(): Promise<string> {
    await this.ensureModules();
    const home = this.os!.homedir();

    switch (process.platform) {
      case 'darwin':
        return this.path!.join(home, 'Documents', 'EmuZ');
      case 'win32':
        return this.path!.join(home, 'Documents', 'EmuZ');
      default: {
        // Linux and others follow XDG
        const xdgData = process.env['XDG_DATA_HOME'] || this.path!.join(home, '.local', 'share');
        return this.path!.join(xdgData, 'emuz');
      }
    }
  }

  async getCachePath(): Promise<string> {
    await this.ensureModules();
    const home = this.os!.homedir();

    switch (process.platform) {
      case 'darwin':
        return this.path!.join(home, 'Library', 'Caches', 'EmuZ');
      case 'win32': {
        const appData = process.env['LOCALAPPDATA'] || this.path!.join(home, 'AppData', 'Local');
        return this.path!.join(appData, 'EmuZ', 'Cache');
      }
      default: {
        // Linux and others follow XDG
        const xdgCache = process.env['XDG_CACHE_HOME'] || this.path!.join(home, '.cache');
        return this.path!.join(xdgCache, 'emuz');
      }
    }
  }
}

/**
 * Create a desktop file system adapter
 */
export function createDesktopFileSystem(): DesktopFileSystemAdapter {
  return new DesktopFileSystemAdapter();
}
