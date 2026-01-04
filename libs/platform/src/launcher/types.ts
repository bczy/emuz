/**
 * Emulator launcher types
 * Cross-platform emulator launching abstraction
 */

/**
 * Launch result status
 */
export type LaunchStatus = 'success' | 'error' | 'not_found' | 'not_installed';

/**
 * Launch result
 */
export interface LaunchResult {
  /**
   * Status of the launch attempt
   */
  status: LaunchStatus;

  /**
   * Error message if status is 'error'
   */
  error?: string;

  /**
   * Process ID (desktop only)
   */
  pid?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Launch options
 */
export interface LaunchOptions {
  /**
   * Path to the ROM file
   */
  romPath: string;

  /**
   * Emulator executable path (desktop) or package name (mobile)
   */
  emulatorPath: string;

  /**
   * Additional command line arguments
   */
  args?: string[];

  /**
   * Working directory for the emulator
   */
  workingDirectory?: string;

  /**
   * Environment variables
   */
  env?: Record<string, string>;

  /**
   * Whether to wait for the emulator to exit
   */
  waitForExit?: boolean;
}

/**
 * Emulator configuration for launching
 */
export interface EmulatorLaunchConfig {
  /**
   * Unique identifier for the emulator
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Platform-specific configuration
   */
  desktop?: {
    /**
     * Path to executable
     */
    executable: string;

    /**
     * Command line argument pattern
     * Use {rom} as placeholder for ROM path
     */
    args: string[];

    /**
     * Working directory
     */
    workingDir?: string;
  };

  android?: {
    /**
     * Package name (e.g., 'org.libretro.retroarch')
     */
    packageName: string;

    /**
     * Activity name for launching
     */
    activityName?: string;

    /**
     * Intent action (default: android.intent.action.VIEW)
     */
    intentAction?: string;

    /**
     * Extra intent data
     */
    extras?: Record<string, string>;
  };

  ios?: {
    /**
     * URL scheme (e.g., 'retroarch://')
     */
    urlScheme: string;

    /**
     * App Store ID for "install" prompt
     */
    appStoreId?: string;

    /**
     * Bundle identifier for checking if installed
     */
    bundleId?: string;
  };
}

/**
 * Emulator launcher interface
 */
export interface EmulatorLauncher {
  /**
   * Launch an emulator with a ROM
   */
  launch(options: LaunchOptions): Promise<LaunchResult>;

  /**
   * Launch using a pre-configured emulator config
   */
  launchWithConfig(config: EmulatorLaunchConfig, romPath: string): Promise<LaunchResult>;

  /**
   * Check if an emulator is installed/available
   */
  isInstalled(config: EmulatorLaunchConfig): Promise<boolean>;

  /**
   * Get available emulators for a platform
   */
  getAvailableEmulators?(platformId: string): Promise<EmulatorLaunchConfig[]>;
}

/**
 * Launcher platform type
 */
export type LauncherPlatform = 'desktop' | 'android' | 'ios';

/**
 * Base launcher with common utilities
 */
export abstract class BaseLauncher implements EmulatorLauncher {
  abstract launch(options: LaunchOptions): Promise<LaunchResult>;
  abstract isInstalled(config: EmulatorLaunchConfig): Promise<boolean>;

  /**
   * Launch using a pre-configured emulator config
   */
  abstract launchWithConfig(
    config: EmulatorLaunchConfig,
    romPath: string
  ): Promise<LaunchResult>;

  /**
   * Replace placeholders in arguments
   */
  protected replaceArgs(args: string[], romPath: string): string[] {
    return args.map(arg => arg.replace('{rom}', romPath));
  }

  /**
   * Create an error result
   */
  protected errorResult(message: string): LaunchResult {
    return {
      status: 'error',
      error: message,
    };
  }

  /**
   * Create a success result
   */
  protected successResult(metadata?: Record<string, unknown>): LaunchResult {
    return {
      status: 'success',
      metadata,
    };
  }

  /**
   * Create a not found result
   */
  protected notFoundResult(): LaunchResult {
    return {
      status: 'not_found',
      error: 'Emulator not found',
    };
  }

  /**
   * Create a not installed result
   */
  protected notInstalledResult(): LaunchResult {
    return {
      status: 'not_installed',
      error: 'Emulator is not installed',
    };
  }
}
