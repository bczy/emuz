/**
 * Android emulator launcher
 * Uses React Native Linking and Intent system
 */

import {
  BaseLauncher,
  EmulatorLaunchConfig,
  LaunchOptions,
  LaunchResult,
} from './types';

/**
 * Type definitions for React Native modules
 */
interface LinkingModule {
  openURL(url: string): Promise<void>;
  canOpenURL(url: string): Promise<boolean>;
}

interface SendIntentModule {
  sendActivity(options: {
    action: string;
    data?: string;
    type?: string;
    packageName?: string;
    componentName?: string;
    extras?: Array<{ key: string; value: string | number | boolean }>;
  }): Promise<void>;
  isAppInstalled(packageName: string): Promise<boolean>;
  openApp(packageName: string): Promise<void>;
  openAppWithData(packageName: string, data: string, mimeType: string): Promise<void>;
}

/**
 * Android launcher using Intent system
 * 
 * Features:
 * - Intent-based app launching
 * - Package installation checking
 * - ROM file passing via Intent extras or data URI
 * - Deep link support
 * 
 * @example
 * ```typescript
 * const launcher = new AndroidLauncher();
 * const result = await launcher.launchWithConfig(retroArchConfig, '/sdcard/ROMs/mario.nes');
 * ```
 */
export class AndroidLauncher extends BaseLauncher {
  private linking: LinkingModule | null = null;
  private sendIntent: SendIntentModule | null = null;

  /**
   * Lazy-load React Native modules
   */
  private async ensureModules(): Promise<void> {
    if (!this.linking) {
      const { Linking } = await import('react-native');
      this.linking = Linking;

      try {
        // react-native-send-intent is optional but provides better control
        // @ts-expect-error - Optional native module
        this.sendIntent = await import('react-native-send-intent');
      } catch {
        // SendIntent not available, will use Linking fallback
        this.sendIntent = null;
      }
    }
  }

  /**
   * Launch an emulator with a ROM
   * Uses the emulatorPath as package name on Android
   */
  async launch(options: LaunchOptions): Promise<LaunchResult> {
    await this.ensureModules();

    try {
      // On Android, emulatorPath is the package name
      const packageName = options.emulatorPath;

      if (this.sendIntent) {
        // Use SendIntent for better control
        await this.sendIntent.openAppWithData(
          packageName,
          `file://${options.romPath}`,
          this.getMimeType(options.romPath)
        );
      } else {
        // Fallback to Linking with file:// URI
        const uri = `file://${options.romPath}`;
        await this.linking!.openURL(uri);
      }

      return this.successResult({ packageName });
    } catch (error) {
      return this.errorResult(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Launch using a pre-configured emulator config
   */
  async launchWithConfig(
    config: EmulatorLaunchConfig,
    romPath: string
  ): Promise<LaunchResult> {
    if (!config.android) {
      return this.errorResult('No Android configuration for this emulator');
    }

    await this.ensureModules();

    try {
      // Check if the app is installed
      const installed = await this.isInstalled(config);
      if (!installed) {
        return this.notInstalledResult();
      }

      if (this.sendIntent) {
        // Build Intent extras
        const extras = config.android.extras
          ? Object.entries(config.android.extras).map(([key, value]) => ({
              key,
              value,
            }))
          : [];

        // Add ROM path as extra
        extras.push({ key: 'ROM', value: romPath });

        // Send Intent
        await this.sendIntent.sendActivity({
          action: config.android.intentAction || 'android.intent.action.VIEW',
          data: `file://${romPath}`,
          type: this.getMimeType(romPath),
          packageName: config.android.packageName,
          componentName: config.android.activityName,
          extras,
        });
      } else {
        // Fallback to opening the ROM file
        // Android will show app chooser
        const uri = `file://${romPath}`;
        await this.linking!.openURL(uri);
      }

      return this.successResult({
        packageName: config.android.packageName,
        activity: config.android.activityName,
      });
    } catch (error) {
      return this.errorResult(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Check if an emulator is installed
   */
  async isInstalled(config: EmulatorLaunchConfig): Promise<boolean> {
    if (!config.android) {
      return false;
    }

    await this.ensureModules();

    if (this.sendIntent) {
      try {
        return await this.sendIntent.isAppInstalled(config.android.packageName);
      } catch {
        return false;
      }
    }

    // Fallback: try to check if the package URL can be opened
    // This is less reliable but works without native module
    try {
      const url = `market://details?id=${config.android.packageName}`;
      return await this.linking!.canOpenURL(url);
    } catch {
      return false;
    }
  }

  /**
   * Get MIME type for a ROM file
   */
  private getMimeType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    
    // Map ROM extensions to MIME types
    const mimeTypes: Record<string, string> = {
      nes: 'application/x-nes-rom',
      smc: 'application/x-smc-rom',
      sfc: 'application/x-snes-rom',
      gba: 'application/x-gba-rom',
      gbc: 'application/x-gbc-rom',
      gb: 'application/x-gameboy-rom',
      n64: 'application/x-n64-rom',
      z64: 'application/x-n64-rom',
      nds: 'application/x-nintendo-ds-rom',
      psx: 'application/x-playstation-rom',
      iso: 'application/x-iso9660-image',
      bin: 'application/octet-stream',
      cue: 'application/x-cue',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

/**
 * Create an Android launcher
 */
export function createAndroidLauncher(): AndroidLauncher {
  return new AndroidLauncher();
}
