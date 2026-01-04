/**
 * Emulator launchers index
 * Exports all launchers and factory functions
 */

export * from './types';
export * from './desktop';
export * from './android';
export * from './ios';
export * from './urlSchemes';

import { EmulatorLauncher, LauncherPlatform } from './types';
import { DesktopLauncher, createDesktopLauncher } from './desktop';
import { AndroidLauncher, createAndroidLauncher } from './android';
import { IOSLauncher, createIOSLauncher } from './ios';

/**
 * Platform detection for launchers
 */
export interface LauncherPlatformInfo {
  platform: LauncherPlatform;
  isNative: boolean;
}

/**
 * Detect the current platform for launcher operations
 */
export function detectLauncherPlatform(): LauncherPlatformInfo {
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
 * Create an emulator launcher for the specified platform
 * 
 * @param platform - Target platform ('desktop', 'android', 'ios', or auto-detect)
 * @returns Emulator launcher instance
 * 
 * @example
 * ```typescript
 * // Auto-detect platform
 * const launcher = createLauncher();
 * 
 * // Force specific platform
 * const desktopLauncher = createLauncher('desktop');
 * ```
 */
export function createLauncher(
  platform?: LauncherPlatform
): EmulatorLauncher {
  const resolvedPlatform = platform || detectLauncherPlatform().platform;

  switch (resolvedPlatform) {
    case 'desktop':
      return createDesktopLauncher();
    case 'android':
      return createAndroidLauncher();
    case 'ios':
      return createIOSLauncher();
    default:
      throw new Error(`Unsupported platform: ${resolvedPlatform}`);
  }
}

/**
 * Type guards for launcher types
 */
export function isDesktopLauncher(
  launcher: EmulatorLauncher
): launcher is DesktopLauncher {
  return launcher instanceof DesktopLauncher;
}

export function isAndroidLauncher(
  launcher: EmulatorLauncher
): launcher is AndroidLauncher {
  return launcher instanceof AndroidLauncher;
}

export function isIOSLauncher(
  launcher: EmulatorLauncher
): launcher is IOSLauncher {
  return launcher instanceof IOSLauncher;
}
