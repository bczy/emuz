/**
 * iOS emulator launcher
 * Uses URL schemes to launch emulator apps
 */

import {
  BaseLauncher,
  EmulatorLaunchConfig,
  LaunchOptions,
  LaunchResult,
} from './types';

/**
 * Type definitions for React Native Linking module
 */
interface LinkingModule {
  openURL(url: string): Promise<void>;
  canOpenURL(url: string): Promise<boolean>;
}

/**
 * iOS launcher using URL schemes
 * 
 * Features:
 * - URL scheme-based app launching
 * - App installation checking via canOpenURL
 * - App Store redirect for missing apps
 * - Deep link parameter passing
 * 
 * iOS Limitations:
 * - Cannot directly pass file paths due to sandbox
 * - Must use app groups or document providers for file sharing
 * - URL schemes must be whitelisted in Info.plist (LSApplicationQueriesSchemes)
 * 
 * @example
 * ```typescript
 * const launcher = new IOSLauncher();
 * const result = await launcher.launchWithConfig(deltaConfig, 'mario.nes');
 * ```
 */
export class IOSLauncher extends BaseLauncher {
  private linking: LinkingModule | null = null;

  /**
   * Lazy-load React Native Linking module
   */
  private async ensureModules(): Promise<void> {
    if (!this.linking) {
      // @ts-expect-error - React Native module
      const { Linking } = await import('react-native');
      this.linking = Linking;
    }
  }

  /**
   * Launch an emulator with a ROM
   * On iOS, emulatorPath should be the URL scheme
   */
  async launch(options: LaunchOptions): Promise<LaunchResult> {
    await this.ensureModules();

    try {
      // On iOS, we use URL schemes
      // The emulatorPath should be the URL scheme (e.g., 'retroarch://')
      const urlScheme = options.emulatorPath;

      // Check if the URL scheme can be opened
      const canOpen = await this.linking!.canOpenURL(urlScheme);
      if (!canOpen) {
        return this.notInstalledResult();
      }

      // Build URL with ROM path as parameter
      // Note: The actual ROM loading depends on app-specific implementation
      // Many iOS emulators require the ROM to be imported into their Documents
      const romName = options.romPath.split('/').pop() || '';
      const url = `${urlScheme}open?rom=${encodeURIComponent(romName)}`;

      await this.linking!.openURL(url);

      return this.successResult({ urlScheme, romName });
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
    if (!config.ios) {
      return this.errorResult('No iOS configuration for this emulator');
    }

    await this.ensureModules();

    try {
      // Check if the app is installed
      const installed = await this.isInstalled(config);
      if (!installed) {
        // Optionally open App Store
        if (config.ios.appStoreId) {
          const appStoreUrl = `https://apps.apple.com/app/id${config.ios.appStoreId}`;
          await this.linking!.openURL(appStoreUrl);
          return {
            status: 'not_installed',
            error: 'Opening App Store to install emulator',
            metadata: { appStoreUrl },
          };
        }
        return this.notInstalledResult();
      }

      // Build URL with ROM information
      const romName = romPath.split('/').pop() || '';
      const url = `${config.ios.urlScheme}open?rom=${encodeURIComponent(romName)}`;

      await this.linking!.openURL(url);

      return this.successResult({
        urlScheme: config.ios.urlScheme,
        romName,
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
    if (!config.ios) {
      return false;
    }

    await this.ensureModules();

    try {
      // canOpenURL requires the scheme to be in LSApplicationQueriesSchemes
      return await this.linking!.canOpenURL(config.ios.urlScheme);
    } catch {
      return false;
    }
  }

  /**
   * Open the App Store page for an emulator
   */
  async openAppStore(appStoreId: string): Promise<LaunchResult> {
    await this.ensureModules();

    try {
      const url = `https://apps.apple.com/app/id${appStoreId}`;
      await this.linking!.openURL(url);
      return this.successResult({ appStoreUrl: url });
    } catch (error) {
      return this.errorResult(
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

/**
 * Create an iOS launcher
 */
export function createIOSLauncher(): IOSLauncher {
  return new IOSLauncher();
}
