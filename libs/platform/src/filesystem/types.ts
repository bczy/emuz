/**
 * File system adapter types
 * Cross-platform file system abstraction
 */

/**
 * File metadata
 */
export interface FileInfo {
  /**
   * File name without path
   */
  name: string;

  /**
   * Full path to the file
   */
  path: string;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * Whether this is a directory
   */
  isDirectory: boolean;

  /**
   * Last modification time
   */
  modifiedAt: Date;

  /**
   * Creation time (may not be available on all platforms)
   */
  createdAt?: Date;

  /**
   * File extension (without dot)
   */
  extension?: string;

  /**
   * MIME type (if known)
   */
  mimeType?: string;
}

/**
 * Directory listing result
 */
export interface DirectoryListing {
  /**
   * Current directory path
   */
  path: string;

  /**
   * Files and directories in the listing
   */
  entries: FileInfo[];

  /**
   * Whether there are more entries (for pagination)
   */
  hasMore?: boolean;
}

/**
 * Read options
 */
export interface ReadOptions {
  /**
   * Encoding for text files (default: 'utf-8')
   */
  encoding?: BufferEncoding;
}

/**
 * Write options
 */
export interface WriteOptions {
  /**
   * Encoding for text files (default: 'utf-8')
   */
  encoding?: BufferEncoding;

  /**
   * Create parent directories if they don't exist
   */
  recursive?: boolean;

  /**
   * Append to existing file instead of overwriting
   */
  append?: boolean;
}

/**
 * Scan options for ROM directory scanning
 */
export interface ScanOptions {
  /**
   * File extensions to include (e.g., ['nes', 'smc', 'gba'])
   */
  extensions?: string[];

  /**
   * Whether to scan subdirectories recursively
   */
  recursive?: boolean;

  /**
   * Maximum depth for recursive scanning
   */
  maxDepth?: number;

  /**
   * Maximum number of files to return
   */
  limit?: number;
}

/**
 * File system adapter interface
 * Provides unified file system access across platforms
 */
export interface FileSystemAdapter {
  /**
   * Read file contents as text
   */
  readText(path: string, options?: ReadOptions): Promise<string>;

  /**
   * Read file contents as binary
   */
  readBinary(path: string): Promise<Uint8Array>;

  /**
   * Write text to a file
   */
  writeText(path: string, content: string, options?: WriteOptions): Promise<void>;

  /**
   * Write binary data to a file
   */
  writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void>;

  /**
   * Delete a file
   */
  delete(path: string): Promise<void>;

  /**
   * Check if a file or directory exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file information
   */
  stat(path: string): Promise<FileInfo>;

  /**
   * List directory contents
   */
  list(path: string): Promise<DirectoryListing>;

  /**
   * Create a directory
   */
  mkdir(path: string, recursive?: boolean): Promise<void>;

  /**
   * Delete a directory
   */
  rmdir(path: string, recursive?: boolean): Promise<void>;

  /**
   * Copy a file
   */
  copy(source: string, destination: string): Promise<void>;

  /**
   * Move/rename a file
   */
  move(source: string, destination: string): Promise<void>;

  /**
   * Scan for ROM files in a directory
   */
  scanForRoms(path: string, options?: ScanOptions): Promise<FileInfo[]>;

  /**
   * Get the platform-specific documents/data directory
   */
  getDocumentsPath(): Promise<string>;

  /**
   * Get the platform-specific cache directory
   */
  getCachePath(): Promise<string>;

  /**
   * Request read permission for a path (mobile platforms)
   */
  requestReadPermission?(path: string): Promise<boolean>;

  /**
   * Request write permission for a path (mobile platforms)
   */
  requestWritePermission?(path: string): Promise<boolean>;
}

/**
 * Platform type for file system adapters
 */
export type FileSystemPlatform = 'desktop' | 'android' | 'ios';

/**
 * Base implementation with common utilities
 */
export abstract class BaseFileSystemAdapter implements FileSystemAdapter {
  abstract readText(path: string, options?: ReadOptions): Promise<string>;
  abstract readBinary(path: string): Promise<Uint8Array>;
  abstract writeText(path: string, content: string, options?: WriteOptions): Promise<void>;
  abstract writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void>;
  abstract delete(path: string): Promise<void>;
  abstract exists(path: string): Promise<boolean>;
  abstract stat(path: string): Promise<FileInfo>;
  abstract list(path: string): Promise<DirectoryListing>;
  abstract mkdir(path: string, recursive?: boolean): Promise<void>;
  abstract rmdir(path: string, recursive?: boolean): Promise<void>;
  abstract copy(source: string, destination: string): Promise<void>;
  abstract move(source: string, destination: string): Promise<void>;
  abstract getDocumentsPath(): Promise<string>;
  abstract getCachePath(): Promise<string>;

  /**
   * Default ROM scanning implementation
   */
  async scanForRoms(path: string, options?: ScanOptions): Promise<FileInfo[]> {
    const results: FileInfo[] = [];
    const extensions = options?.extensions?.map(e => e.toLowerCase()) || [];
    const recursive = options?.recursive ?? true;
    const maxDepth = options?.maxDepth ?? 5;
    const limit = options?.limit ?? 10000;

    await this.scanDirectory(path, results, extensions, recursive, maxDepth, 0, limit);
    return results;
  }

  /**
   * Recursive directory scanner helper
   */
  protected async scanDirectory(
    dirPath: string,
    results: FileInfo[],
    extensions: string[],
    recursive: boolean,
    maxDepth: number,
    currentDepth: number,
    limit: number
  ): Promise<void> {
    if (currentDepth >= maxDepth || results.length >= limit) {
      return;
    }

    try {
      const listing = await this.list(dirPath);

      for (const entry of listing.entries) {
        if (results.length >= limit) break;

        if (entry.isDirectory && recursive) {
          await this.scanDirectory(
            entry.path,
            results,
            extensions,
            recursive,
            maxDepth,
            currentDepth + 1,
            limit
          );
        } else if (!entry.isDirectory) {
          const ext = entry.extension?.toLowerCase() || '';
          if (extensions.length === 0 || extensions.includes(ext)) {
            results.push(entry);
          }
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }

  /**
   * Extract extension from filename
   */
  protected getExtension(filename: string): string | undefined {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot > 0 && lastDot < filename.length - 1) {
      return filename.substring(lastDot + 1);
    }
    return undefined;
  }
}
