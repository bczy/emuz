/**
 * Database adapters index
 * Exports all adapters and factory functions
 */

export * from './types';
export * from './desktop';
export * from './mobile';

import { DatabaseAdapter, DatabaseConfig } from './types';
import { DesktopDatabaseAdapter, createDesktopAdapter } from './desktop';
import { MobileDatabaseAdapter, createMobileAdapter } from './mobile';

/**
 * Supported platform types
 */
export type PlatformType = 'desktop' | 'mobile' | 'auto';

/**
 * Platform detection result
 */
export interface PlatformInfo {
  type: PlatformType;
  os: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
  isNative: boolean;
}

/**
 * Detect the current platform
 * 
 * @returns Platform information
 */
export function detectPlatform(): PlatformInfo {
  // Check for React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Detect mobile OS
    // @ts-expect-error - React Native specific global
    const Platform = global.Platform || { OS: 'unknown' };
    const os = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown';
    
    return {
      type: 'mobile',
      os: os as PlatformInfo['os'],
      isNative: true,
    };
  }

  // Check for Node.js (desktop)
  if (typeof process !== 'undefined' && process.versions?.node) {
    let os: PlatformInfo['os'] = 'unknown';
    
    if (process.platform === 'win32') {
      os = 'windows';
    } else if (process.platform === 'darwin') {
      os = 'macos';
    } else if (process.platform === 'linux') {
      os = 'linux';
    }
    
    return {
      type: 'desktop',
      os,
      isNative: true,
    };
  }

  // Browser or unknown environment
  return {
    type: 'desktop',
    os: 'unknown',
    isNative: false,
  };
}

/**
 * Create a database adapter for the specified platform
 * 
 * @param config - Database configuration
 * @param platform - Target platform ('desktop', 'mobile', or 'auto' for detection)
 * @returns Database adapter instance
 * 
 * @example
 * ```typescript
 * // Auto-detect platform
 * const adapter = createDatabaseAdapter({ path: './emuz.db' });
 * 
 * // Force specific platform
 * const desktopAdapter = createDatabaseAdapter({ path: './emuz.db' }, 'desktop');
 * ```
 */
export function createDatabaseAdapter(
  config: DatabaseConfig,
  platform: PlatformType = 'auto'
): DatabaseAdapter {
  const resolvedPlatform = platform === 'auto' 
    ? detectPlatform().type 
    : platform;

  switch (resolvedPlatform) {
    case 'desktop':
      return createDesktopAdapter(config);
    case 'mobile':
      return createMobileAdapter(config);
    default:
      throw new Error(`Unsupported platform: ${resolvedPlatform}`);
  }
}

/**
 * Type guard to check if adapter is a desktop adapter
 */
export function isDesktopAdapter(adapter: DatabaseAdapter): adapter is DesktopDatabaseAdapter {
  return adapter instanceof DesktopDatabaseAdapter;
}

/**
 * Type guard to check if adapter is a mobile adapter
 */
export function isMobileAdapter(adapter: DatabaseAdapter): adapter is MobileDatabaseAdapter {
  return adapter instanceof MobileDatabaseAdapter;
}
