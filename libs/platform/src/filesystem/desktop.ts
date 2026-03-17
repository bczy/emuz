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

type DesktopModules = {
  fs: typeof import('fs/promises');
  path: typeof import('path');
  os: typeof import('os');
};

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
  private modules: DesktopModules | null = null;

  /**
   * Lazy-load Node.js modules
   */
  private async getModules(): Promise<DesktopModules> {
    if (this.modules) return this.modules;
    const modules: DesktopModules = {
      fs: await import('fs/promises'),
      path: await import('path'),
      os: await import('os'),
    };
    this.modules = modules;
    return modules;
  }

  async readText(path: string, options?: ReadOptions): Promise<string> {
    const { fs } = await this.getModules();
    return fs.readFile(path, { encoding: options?.encoding || 'utf-8' });
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const { fs } = await this.getModules();
    const buffer = await fs.readFile(path);
    return new Uint8Array(buffer);
  }

  async writeText(path: string, content: string, options?: WriteOptions): Promise<void> {
    const { fs, path: pathModule } = await this.getModules();

    if (options?.recursive) {
      const dir = pathModule.dirname(path);
      await fs.mkdir(dir, { recursive: true });
    }

    if (options?.append) {
      await fs.appendFile(path, content, { encoding: options?.encoding || 'utf-8' });
    } else {
      await fs.writeFile(path, content, { encoding: options?.encoding || 'utf-8' });
    }
  }

  async writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void> {
    const { fs, path: pathModule } = await this.getModules();

    if (options?.recursive) {
      const dir = pathModule.dirname(path);
      await fs.mkdir(dir, { recursive: true });
    }

    if (options?.append) {
      await fs.appendFile(path, content);
    } else {
      await fs.writeFile(path, content);
    }
  }

  async delete(path: string): Promise<void> {
    const { fs } = await this.getModules();
    await fs.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    const { fs } = await this.getModules();
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async stat(path: string): Promise<FileInfo> {
    const { fs, path: pathModule } = await this.getModules();
    const stats = await fs.stat(path);
    const name = pathModule.basename(path);

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
    const { fs, path: pathModule } = await this.getModules();
    const entries: FileInfo[] = [];
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = pathModule.join(dirPath, dirent.name);

      try {
        const stats = await fs.stat(fullPath);
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
    const { fs } = await this.getModules();
    await fs.mkdir(path, { recursive: recursive ?? false });
  }

  async rmdir(path: string, recursive?: boolean): Promise<void> {
    const { fs } = await this.getModules();
    await fs.rm(path, { recursive: recursive ?? false, force: true });
  }

  async copy(source: string, destination: string): Promise<void> {
    const { fs } = await this.getModules();
    await fs.copyFile(source, destination);
  }

  async move(source: string, destination: string): Promise<void> {
    const { fs } = await this.getModules();
    await fs.rename(source, destination);
  }

  async getDocumentsPath(): Promise<string> {
    const { os, path: pathModule } = await this.getModules();
    const home = os.homedir();

    switch (process.platform) {
      case 'darwin':
        return pathModule.join(home, 'Documents', 'EmuZ');
      case 'win32':
        return pathModule.join(home, 'Documents', 'EmuZ');
      default: {
        // Linux and others follow XDG
        const xdgData = process.env['XDG_DATA_HOME'] || pathModule.join(home, '.local', 'share');
        return pathModule.join(xdgData, 'emuz');
      }
    }
  }

  async getCachePath(): Promise<string> {
    const { os, path: pathModule } = await this.getModules();
    const home = os.homedir();

    switch (process.platform) {
      case 'darwin':
        return pathModule.join(home, 'Library', 'Caches', 'EmuZ');
      case 'win32': {
        const appData = process.env['LOCALAPPDATA'] || pathModule.join(home, 'AppData', 'Local');
        return pathModule.join(appData, 'EmuZ', 'Cache');
      }
      default: {
        // Linux and others follow XDG
        const xdgCache = process.env['XDG_CACHE_HOME'] || pathModule.join(home, '.cache');
        return pathModule.join(xdgCache, 'emuz');
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
