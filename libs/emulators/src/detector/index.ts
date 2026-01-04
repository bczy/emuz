/**
 * Emulator auto-detection
 */

import type { EmulatorDefinition, HostPlatform, DetectedEmulator } from '../registry/types';
import { emulatorRegistry, getEmulatorsForHost } from '../registry';

/**
 * File system interface for detection
 */
export interface DetectorFileSystem {
  exists(path: string): Promise<boolean>;
  isExecutable(path: string): Promise<boolean>;
  expandPath(path: string): string;
}

/**
 * Package manager interface for mobile detection
 */
export interface DetectorPackageManager {
  isInstalled(packageName: string): Promise<boolean>;
  getInstalledPackages(): Promise<string[]>;
}

/**
 * URL scheme checker for iOS
 */
export interface DetectorUrlSchemeChecker {
  canOpen(urlScheme: string): Promise<boolean>;
}

/**
 * Desktop emulator detector
 */
export class DesktopEmulatorDetector {
  constructor(
    private readonly fs: DetectorFileSystem,
    private readonly hostPlatform: HostPlatform
  ) {}

  /**
   * Detect all installed emulators
   */
  async detectAll(): Promise<DetectedEmulator[]> {
    const emulators = getEmulatorsForHost(this.hostPlatform);
    const detected: DetectedEmulator[] = [];

    for (const emulator of emulators) {
      const result = await this.detectEmulator(emulator);
      if (result) {
        detected.push(result);
      }
    }

    return detected;
  }

  /**
   * Detect a specific emulator
   */
  async detectEmulator(emulator: EmulatorDefinition): Promise<DetectedEmulator | null> {
    if (!emulator.desktop) return null;

    // Only check desktop platforms
    if (this.hostPlatform !== 'windows' && this.hostPlatform !== 'macos' && this.hostPlatform !== 'linux') {
      return null;
    }

    const executables = emulator.desktop.executables[this.hostPlatform] ?? [];
    const installPaths = emulator.desktop.installPaths?.[this.hostPlatform] ?? [];

    // Check standard paths
    for (const installPath of installPaths) {
      const expandedPath = this.fs.expandPath(installPath);
      
      for (const executable of executables) {
        const fullPath = `${expandedPath}/${executable}`;
        
        if (await this.fs.exists(fullPath) && await this.fs.isExecutable(fullPath)) {
          return {
            definition: emulator,
            executablePath: fullPath,
            isInstalled: true,
          };
        }
      }
    }

    // Check if executable is in PATH
    for (const executable of executables) {
      // Strip any path components for PATH check - would be used for which/where command
      // const baseName = executable.split('/').pop() ?? executable;
      
      // This would be done via which/where command in real implementation
      // For now, just return null if not found in standard paths
    }

    return null;
  }

  /**
   * Detect emulators for a specific platform
   */
  async detectForPlatform(platformId: string): Promise<DetectedEmulator[]> {
    const emulators = emulatorRegistry.filter(
      (e) => e.platformIds.includes(platformId) && e.hostPlatforms.includes(this.hostPlatform)
    );

    const detected: DetectedEmulator[] = [];

    for (const emulator of emulators) {
      const result = await this.detectEmulator(emulator);
      if (result) {
        detected.push(result);
      }
    }

    return detected;
  }
}

/**
 * Android emulator detector
 */
export class AndroidEmulatorDetector {
  constructor(private readonly packageManager: DetectorPackageManager) {}

  /**
   * Detect all installed emulator apps
   */
  async detectAll(): Promise<DetectedEmulator[]> {
    const emulators = getEmulatorsForHost('android');
    const installedPackages = await this.packageManager.getInstalledPackages();
    const detected: DetectedEmulator[] = [];

    for (const emulator of emulators) {
      if (emulator.android?.packageName) {
        const isInstalled = installedPackages.includes(emulator.android.packageName);
        
        if (isInstalled) {
          detected.push({
            definition: emulator,
            packageName: emulator.android.packageName,
            isInstalled: true,
          });
        }
      }
    }

    return detected;
  }
}

/**
 * iOS emulator detector
 */
export class IOSEmulatorDetector {
  constructor(private readonly urlChecker: DetectorUrlSchemeChecker) {}

  /**
   * Detect all installed emulator apps via URL schemes
   */
  async detectAll(): Promise<DetectedEmulator[]> {
    const emulators = getEmulatorsForHost('ios');
    const detected: DetectedEmulator[] = [];

    for (const emulator of emulators) {
      if (emulator.ios?.urlScheme) {
        const canOpen = await this.urlChecker.canOpen(`${emulator.ios.urlScheme}://`);
        
        if (canOpen) {
          detected.push({
            definition: emulator,
            urlScheme: emulator.ios.urlScheme,
            isInstalled: true,
          });
        }
      }
    }

    return detected;
  }
}

/**
 * Create a detector for the current platform
 */
export function createDetector(
  hostPlatform: HostPlatform,
  options: {
    fs?: DetectorFileSystem;
    packageManager?: DetectorPackageManager;
    urlChecker?: DetectorUrlSchemeChecker;
  }
): DesktopEmulatorDetector | AndroidEmulatorDetector | IOSEmulatorDetector {
  switch (hostPlatform) {
    case 'windows':
    case 'macos':
    case 'linux':
      if (!options.fs) {
        throw new Error('File system interface required for desktop detection');
      }
      return new DesktopEmulatorDetector(options.fs, hostPlatform);
    
    case 'android':
      if (!options.packageManager) {
        throw new Error('Package manager interface required for Android detection');
      }
      return new AndroidEmulatorDetector(options.packageManager);
    
    case 'ios':
      if (!options.urlChecker) {
        throw new Error('URL scheme checker required for iOS detection');
      }
      return new IOSEmulatorDetector(options.urlChecker);
    
    default:
      throw new Error(`Unsupported host platform: ${hostPlatform}`);
  }
}
