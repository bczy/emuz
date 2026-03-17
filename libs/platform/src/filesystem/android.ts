/**
 * Android file system adapter
 * Uses React Native File System (RNFS) and Storage Access Framework (SAF)
 *
 * Note: This adapter requires react-native-fs and react-native-document-picker
 * to be installed in the React Native project
 */

import {
  BaseFileSystemAdapter,
  DirectoryListing,
  FileInfo,
  ReadOptions,
  WriteOptions,
} from './types';
import { base64ToUint8Array, uint8ArrayToBase64 } from './utils';

/**
 * Type definitions for react-native-fs
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

interface RNFSModule {
  DocumentDirectoryPath: string;
  CachesDirectoryPath: string;
  ExternalStorageDirectoryPath: string;
  ExternalDirectoryPath: string;
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
 * Android file system adapter using React Native FS
 *
 * Features:
 * - Access to app documents and cache directories
 * - External storage access (with permissions)
 * - SAF integration for scoped storage
 *
 * @example
 * ```typescript
 * const adapter = new AndroidFileSystemAdapter();
 * const roms = await adapter.scanForRoms('/storage/emulated/0/ROMs', {
 *   extensions: ['nes', 'smc', 'gba'],
 *   recursive: true,
 * });
 * ```
 */
export class AndroidFileSystemAdapter extends BaseFileSystemAdapter {
  private rnfs: RNFSModule | null = null;

  /**
   * Lazy-load React Native FS module
   */
  private async getModules(): Promise<RNFSModule> {
    if (this.rnfs) return this.rnfs;
    // @ts-expect-error - react-native-fs types not available at compile time
    const rnfs = (await import('react-native-fs')) as RNFSModule;
    this.rnfs = rnfs;
    return rnfs;
  }

  async readText(path: string, options?: ReadOptions): Promise<string> {
    const rnfs = await this.getModules();
    const encoding = options?.encoding || 'utf8';
    return rnfs.readFile(path, encoding);
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const rnfs = await this.getModules();
    const base64 = await rnfs.readFile(path, 'base64');
    return base64ToUint8Array(base64);
  }

  async writeText(path: string, content: string, options?: WriteOptions): Promise<void> {
    const rnfs = await this.getModules();

    if (options?.recursive) {
      const dir = this.getDirectoryPath(path);
      await this.mkdir(dir, true);
    }

    const encoding = options?.encoding || 'utf8';

    if (options?.append) {
      await rnfs.appendFile(path, content, encoding);
    } else {
      await rnfs.writeFile(path, content, encoding);
    }
  }

  async writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void> {
    const rnfs = await this.getModules();

    if (options?.recursive) {
      const dir = this.getDirectoryPath(path);
      await this.mkdir(dir, true);
    }

    const base64 = uint8ArrayToBase64(content);

    if (options?.append) {
      await rnfs.appendFile(path, base64, 'base64');
    } else {
      await rnfs.writeFile(path, base64, 'base64');
    }
  }

  async delete(path: string): Promise<void> {
    const rnfs = await this.getModules();
    await rnfs.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    const rnfs = await this.getModules();
    return rnfs.exists(path);
  }

  async stat(path: string): Promise<FileInfo> {
    const rnfs = await this.getModules();
    const stats = await rnfs.stat(path);

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
    const rnfs = await this.getModules();
    const entries: FileInfo[] = [];
    const stats = await rnfs.readDir(dirPath);

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
    const rnfs = await this.getModules();

    if (recursive) {
      // Create parent directories one by one
      const parts = path.split('/').filter(Boolean);
      let currentPath = '/';

      for (const part of parts) {
        currentPath = `${currentPath}${part}/`;
        const exists = await this.exists(currentPath);
        if (!exists) {
          await rnfs.mkdir(currentPath);
        }
      }
    } else {
      await rnfs.mkdir(path);
    }
  }

  async rmdir(path: string, _recursive?: boolean): Promise<void> {
    const rnfs = await this.getModules();
    // RNFS unlink handles both files and directories
    await rnfs.unlink(path);
  }

  async copy(source: string, destination: string): Promise<void> {
    const rnfs = await this.getModules();
    await rnfs.copyFile(source, destination);
  }

  async move(source: string, destination: string): Promise<void> {
    const rnfs = await this.getModules();
    await rnfs.moveFile(source, destination);
  }

  async getDocumentsPath(): Promise<string> {
    const rnfs = await this.getModules();
    return rnfs.DocumentDirectoryPath;
  }

  async getCachePath(): Promise<string> {
    const rnfs = await this.getModules();
    return rnfs.CachesDirectoryPath;
  }

  /**
   * Request read permission using Android permissions
   */
  async requestReadPermission(_path: string): Promise<boolean> {
    try {
      const { PermissionsAndroid } = await import('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['READ_EXTERNAL_STORAGE'],
        {
          title: 'Storage Permission',
          message: 'EmuZ needs access to your ROM files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS['GRANTED'];
    } catch {
      return false;
    }
  }

  /**
   * Request write permission using Android permissions
   */
  async requestWritePermission(_path: string): Promise<boolean> {
    try {
      const { PermissionsAndroid } = await import('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['WRITE_EXTERNAL_STORAGE'],
        {
          title: 'Storage Permission',
          message: 'EmuZ needs access to save game data',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS['GRANTED'];
    } catch {
      return false;
    }
  }

  /**
   * Get directory path from file path
   */
  private getDirectoryPath(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '/';
  }
}

/**
 * Create an Android file system adapter
 */
export function createAndroidFileSystem(): AndroidFileSystemAdapter {
  return new AndroidFileSystemAdapter();
}
