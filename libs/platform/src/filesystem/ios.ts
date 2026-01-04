/**
 * iOS file system adapter
 * Uses React Native File System for file operations
 * 
 * Note: This adapter requires react-native-fs to be installed
 * and supports iOS Files app integration
 */

import {
  BaseFileSystemAdapter,
  DirectoryListing,
  FileInfo,
  ReadOptions,
  WriteOptions,
} from './types';

/**
 * Type definitions for react-native-fs (iOS specific paths)
 */
interface RNFSStatResult {
  name: string;
  path: string;
  size: number;
  mode: number;
  ctime: number;
  mtime: number;
  originalFilepath: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

interface RNFSModuleIOS {
  DocumentDirectoryPath: string;
  CachesDirectoryPath: string;
  MainBundlePath: string;
  LibraryDirectoryPath: string;
  readFile(path: string, encoding?: string): Promise<string>;
  writeFile(path: string, content: string, encoding?: string): Promise<void>;
  appendFile(path: string, content: string, encoding?: string): Promise<void>;
  unlink(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<RNFSStatResult>;
  readDir(path: string): Promise<RNFSStatResult[]>;
  mkdir(path: string): Promise<void>;
  copyFile(source: string, destination: string): Promise<void>;
  moveFile(source: string, destination: string): Promise<void>;
}

/**
 * iOS file system adapter using React Native FS
 * 
 * Features:
 * - Access to app Documents directory
 * - Files app integration (Documents folder visible in Files)
 * - iCloud Drive support via Documents
 * - App Groups for sharing between extensions
 * 
 * iOS Storage Notes:
 * - Documents: User-visible, backed up, Files app accessible
 * - Library: Hidden from user, backed up (except Caches)
 * - Caches: Not backed up, can be cleared by system
 * 
 * @example
 * ```typescript
 * const adapter = new IOSFileSystemAdapter();
 * const docs = await adapter.getDocumentsPath();
 * const roms = await adapter.scanForRoms(`${docs}/ROMs`, {
 *   extensions: ['nes', 'smc', 'gba'],
 *   recursive: true,
 * });
 * ```
 */
export class IOSFileSystemAdapter extends BaseFileSystemAdapter {
  private rnfs: RNFSModuleIOS | null = null;

  /**
   * Lazy-load React Native FS module
   */
  private async ensureModules(): Promise<void> {
    if (!this.rnfs) {
      // @ts-expect-error - react-native-fs types not available at compile time
      this.rnfs = await import('react-native-fs');
    }
  }

  async readText(path: string, options?: ReadOptions): Promise<string> {
    await this.ensureModules();
    const encoding = options?.encoding || 'utf8';
    return this.rnfs!.readFile(path, encoding);
  }

  async readBinary(path: string): Promise<Uint8Array> {
    await this.ensureModules();
    const base64 = await this.rnfs!.readFile(path, 'base64');
    return this.base64ToUint8Array(base64);
  }

  async writeText(path: string, content: string, options?: WriteOptions): Promise<void> {
    await this.ensureModules();

    if (options?.recursive) {
      const dir = this.getDirectoryPath(path);
      await this.mkdir(dir, true);
    }

    const encoding = options?.encoding || 'utf8';
    
    if (options?.append) {
      await this.rnfs!.appendFile(path, content, encoding);
    } else {
      await this.rnfs!.writeFile(path, content, encoding);
    }
  }

  async writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void> {
    await this.ensureModules();

    if (options?.recursive) {
      const dir = this.getDirectoryPath(path);
      await this.mkdir(dir, true);
    }

    const base64 = this.uint8ArrayToBase64(content);
    
    if (options?.append) {
      await this.rnfs!.appendFile(path, base64, 'base64');
    } else {
      await this.rnfs!.writeFile(path, base64, 'base64');
    }
  }

  async delete(path: string): Promise<void> {
    await this.ensureModules();
    await this.rnfs!.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    await this.ensureModules();
    return this.rnfs!.exists(path);
  }

  async stat(path: string): Promise<FileInfo> {
    await this.ensureModules();
    const stats = await this.rnfs!.stat(path);

    return {
      name: stats.name,
      path: stats.path,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      modifiedAt: new Date(stats.mtime * 1000),
      createdAt: new Date(stats.ctime * 1000),
      extension: this.getExtension(stats.name),
    };
  }

  async list(dirPath: string): Promise<DirectoryListing> {
    await this.ensureModules();
    const entries: FileInfo[] = [];
    const stats = await this.rnfs!.readDir(dirPath);

    for (const stat of stats) {
      entries.push({
        name: stat.name,
        path: stat.path,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        modifiedAt: new Date(stat.mtime * 1000),
        createdAt: new Date(stat.ctime * 1000),
        extension: this.getExtension(stat.name),
      });
    }

    return {
      path: dirPath,
      entries,
    };
  }

  async mkdir(path: string, recursive?: boolean): Promise<void> {
    await this.ensureModules();
    
    if (recursive) {
      // Create parent directories one by one
      const parts = path.split('/').filter(Boolean);
      let currentPath = '/';
      
      for (const part of parts) {
        currentPath = `${currentPath}${part}/`;
        const exists = await this.exists(currentPath);
        if (!exists) {
          await this.rnfs!.mkdir(currentPath);
        }
      }
    } else {
      await this.rnfs!.mkdir(path);
    }
  }

  async rmdir(path: string, _recursive?: boolean): Promise<void> {
    await this.ensureModules();
    await this.rnfs!.unlink(path);
  }

  async copy(source: string, destination: string): Promise<void> {
    await this.ensureModules();
    await this.rnfs!.copyFile(source, destination);
  }

  async move(source: string, destination: string): Promise<void> {
    await this.ensureModules();
    await this.rnfs!.moveFile(source, destination);
  }

  async getDocumentsPath(): Promise<string> {
    await this.ensureModules();
    // On iOS, Documents folder is visible in Files app
    return this.rnfs!.DocumentDirectoryPath;
  }

  async getCachePath(): Promise<string> {
    await this.ensureModules();
    return this.rnfs!.CachesDirectoryPath;
  }

  /**
   * Get the Library directory path
   * Library is hidden from user but backed up
   */
  async getLibraryPath(): Promise<string> {
    await this.ensureModules();
    return this.rnfs!.LibraryDirectoryPath;
  }

  /**
   * iOS doesn't require explicit permission requests for app sandbox
   * Returns true for paths within app sandbox
   */
  async requestReadPermission(path: string): Promise<boolean> {
    await this.ensureModules();
    const docsPath = await this.getDocumentsPath();
    const cachePath = await this.getCachePath();
    const libPath = await this.getLibraryPath();

    // Check if path is within app sandbox
    return (
      path.startsWith(docsPath) ||
      path.startsWith(cachePath) ||
      path.startsWith(libPath)
    );
  }

  /**
   * iOS doesn't require explicit permission requests for app sandbox
   * Returns true for paths within app sandbox
   */
  async requestWritePermission(path: string): Promise<boolean> {
    return this.requestReadPermission(path);
  }

  /**
   * Get directory path from file path
   */
  private getDirectoryPath(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '/';
  }

  /**
   * Convert Base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert Uint8Array to Base64 string
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Create an iOS file system adapter
 */
export function createIOSFileSystem(): IOSFileSystemAdapter {
  return new IOSFileSystemAdapter();
}
