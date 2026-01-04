/**
 * File system adapters index
 * Exports all file system adapters and factory functions
 */

export * from './types';
export * from './desktop';
export * from './android';
export * from './ios';

import { FileSystemAdapter, FileSystemPlatform } from './types';
import { DesktopFileSystemAdapter, createDesktopFileSystem } from './desktop';
import { AndroidFileSystemAdapter, createAndroidFileSystem } from './android';
import { IOSFileSystemAdapter, createIOSFileSystem } from './ios';

/**
 * Platform detection result for file system
 */
export interface FilePlatformInfo {
  platform: FileSystemPlatform;
  isNative: boolean;
}

/**
 * Detect the current platform for file system operations
 */
export function detectFilePlatform(): FilePlatformInfo {
  // Check for React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // @ts-expect-error - React Native specific global
    const Platform = global.Platform || { OS: 'unknown' };
    
    if (Platform.OS === 'ios') {
      return { platform: 'ios', isNative: true };
    }
    if (Platform.OS === 'android') {
      return { platform: 'android', isNative: true };
    }
  }

  // Default to desktop for Node.js/Electron
  return { platform: 'desktop', isNative: typeof process !== 'undefined' };
}

/**
 * Create a file system adapter for the specified platform
 * 
 * @param platform - Target platform ('desktop', 'android', 'ios', or auto-detect)
 * @returns File system adapter instance
 * 
 * @example
 * ```typescript
 * // Auto-detect platform
 * const fs = createFileSystemAdapter();
 * 
 * // Force specific platform
 * const desktopFs = createFileSystemAdapter('desktop');
 * ```
 */
export function createFileSystemAdapter(
  platform?: FileSystemPlatform
): FileSystemAdapter {
  const resolvedPlatform = platform || detectFilePlatform().platform;

  switch (resolvedPlatform) {
    case 'desktop':
      return createDesktopFileSystem();
    case 'android':
      return createAndroidFileSystem();
    case 'ios':
      return createIOSFileSystem();
    default:
      throw new Error(`Unsupported platform: ${resolvedPlatform}`);
  }
}

/**
 * Type guards for file system adapters
 */
export function isDesktopFileSystem(
  adapter: FileSystemAdapter
): adapter is DesktopFileSystemAdapter {
  return adapter instanceof DesktopFileSystemAdapter;
}

export function isAndroidFileSystem(
  adapter: FileSystemAdapter
): adapter is AndroidFileSystemAdapter {
  return adapter instanceof AndroidFileSystemAdapter;
}

export function isIOSFileSystem(
  adapter: FileSystemAdapter
): adapter is IOSFileSystemAdapter {
  return adapter instanceof IOSFileSystemAdapter;
}
