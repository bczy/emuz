import { Platform } from 'react-native';
import * as RNFS from 'react-native-fs';
import { pick, types } from '@react-native-documents/picker';

/**
 * File information
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedTime?: Date;
}

/**
 * File picker options
 */
export interface FilePickerOptions {
  type?: 'folder' | 'file' | 'multiple';
  extensions?: string[];
  title?: string;
}

/**
 * FileService - Cross-platform file operations for mobile
 */
export class FileService {
  /**
   * Get the app's document directory
   */
  getDocumentsPath(): string {
    return RNFS.DocumentDirectoryPath;
  }

  /**
   * Get the app's cache directory
   */
  getCachePath(): string {
    return RNFS.CachesDirectoryPath;
  }

  /**
   * Get external storage path (Android only)
   */
  getExternalStoragePath(): string | null {
    if (Platform.OS === 'android' && RNFS.ExternalStorageDirectoryPath) {
      return RNFS.ExternalStorageDirectoryPath;
    }
    return null;
  }

  /**
   * Check if a file or directory exists
   */
  async exists(path: string): Promise<boolean> {
    return RNFS.exists(path);
  }

  /**
   * Read a file as text
   */
  async readFile(path: string): Promise<string> {
    return RNFS.readFile(path, 'utf8');
  }

  /**
   * Read a file as base64
   */
  async readFileBase64(path: string): Promise<string> {
    return RNFS.readFile(path, 'base64');
  }

  /**
   * Write text to a file
   */
  async writeFile(path: string, content: string): Promise<void> {
    await RNFS.writeFile(path, content, 'utf8');
  }

  /**
   * Write base64 data to a file
   */
  async writeFileBase64(path: string, content: string): Promise<void> {
    await RNFS.writeFile(path, content, 'base64');
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    if (await this.exists(path)) {
      await RNFS.unlink(path);
    }
  }

  /**
   * Create a directory
   */
  async createDirectory(path: string): Promise<void> {
    await RNFS.mkdir(path);
  }

  /**
   * List files in a directory
   */
  async listDirectory(path: string): Promise<FileInfo[]> {
    const items = await RNFS.readDir(path);
    return items.map((item) => ({
      name: item.name,
      path: item.path,
      size: Number(item.size),
      isDirectory: item.isDirectory(),
      modifiedTime: item.mtime ? new Date(item.mtime) : undefined,
    }));
  }

  /**
   * Get file information
   */
  async getFileInfo(path: string): Promise<FileInfo | null> {
    try {
      const stat = await RNFS.stat(path);
      return {
        name: path.split('/').pop() || '',
        path: stat.path,
        size: Number(stat.size),
        isDirectory: stat.isDirectory(),
        modifiedTime: stat.mtime ? new Date(stat.mtime) : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Copy a file
   */
  async copyFile(source: string, destination: string): Promise<void> {
    await RNFS.copyFile(source, destination);
  }

  /**
   * Move a file
   */
  async moveFile(source: string, destination: string): Promise<void> {
    await RNFS.moveFile(source, destination);
  }

  /**
   * Calculate file hash (MD5)
   */
  async calculateHash(path: string): Promise<string> {
    return RNFS.hash(path, 'md5');
  }

  /**
   * Calculate file hash (SHA256)
   */
  async calculateSHA256(path: string): Promise<string> {
    return RNFS.hash(path, 'sha256');
  }

  /**
   * Open document picker to select files
   */
  async pickFiles(options?: FilePickerOptions): Promise<FileInfo[]> {
    try {
      const results = await pick({
        allowMultiSelection: options?.type === 'multiple',
        type: this.getPickerType(options?.extensions),
      });

      return results.map((result) => ({
        name: result.name || 'Unknown',
        path: result.uri,
        size: result.size || 0,
        isDirectory: false,
      }));
    } catch (error) {
      if ((error as Error).message?.includes('cancelled')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Convert file extensions to document picker types
   */
  private getPickerType(extensions?: string[]): string[] {
    if (!extensions || extensions.length === 0) {
      return [types.allFiles];
    }

    // Map common ROM extensions to MIME types
    const mimeMap: Record<string, string> = {
      '.nes': 'application/octet-stream',
      '.smc': 'application/octet-stream',
      '.sfc': 'application/octet-stream',
      '.gba': 'application/octet-stream',
      '.gb': 'application/octet-stream',
      '.gbc': 'application/octet-stream',
      '.n64': 'application/octet-stream',
      '.z64': 'application/octet-stream',
      '.v64': 'application/octet-stream',
      '.nds': 'application/octet-stream',
      '.3ds': 'application/octet-stream',
      '.iso': 'application/octet-stream',
      '.cue': 'text/plain',
      '.bin': 'application/octet-stream',
      '.zip': 'application/zip',
      '.7z': 'application/x-7z-compressed',
    };

    return extensions.map((ext) => mimeMap[ext.toLowerCase()] || 'application/octet-stream');
  }

  /**
   * Recursively scan a directory for ROM files
   */
  async scanForROMs(
    directory: string,
    extensions: string[],
    onProgress?: (count: number, current: string) => void
  ): Promise<FileInfo[]> {
    const results: FileInfo[] = [];
    let count = 0;

    const scan = async (dir: string): Promise<void> => {
      try {
        const items = await this.listDirectory(dir);

        for (const item of items) {
          if (item.isDirectory) {
            await scan(item.path);
          } else {
            const ext = item.name.substring(item.name.lastIndexOf('.')).toLowerCase();
            if (extensions.includes(ext)) {
              results.push(item);
              count++;
              onProgress?.(count, item.path);
            }
          }
        }
      } catch (error) {
        console.warn(`[FileService] Error scanning ${dir}:`, error);
      }
    };

    await scan(directory);
    return results;
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    const cachePath = this.getCachePath();
    let totalSize = 0;

    const calculateSize = async (dir: string): Promise<void> => {
      try {
        const items = await this.listDirectory(dir);
        for (const item of items) {
          if (item.isDirectory) {
            await calculateSize(item.path);
          } else {
            totalSize += item.size;
          }
        }
      } catch {
        // Ignore errors
      }
    };

    await calculateSize(cachePath);
    return totalSize;
  }

  /**
   * Clear cache directory
   */
  async clearCache(): Promise<void> {
    const cachePath = this.getCachePath();
    try {
      const items = await this.listDirectory(cachePath);
      for (const item of items) {
        await RNFS.unlink(item.path);
      }
    } catch (error) {
      console.error('[FileService] Error clearing cache:', error);
    }
  }
}

// Singleton instance
export const fileService = new FileService();
