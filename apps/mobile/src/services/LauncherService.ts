import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * Emulator launch configuration
 */
export interface EmulatorConfig {
  id: string;
  name: string;
  packageName?: string; // Android
  urlScheme?: string;   // iOS
  supportedPlatforms: string[];
}

/**
 * Launch result
 */
export interface LaunchResult {
  success: boolean;
  error?: string;
}

/**
 * Known emulators with their launch configurations
 */
const knownEmulators: EmulatorConfig[] = [
  // Multi-platform
  {
    id: 'retroarch',
    name: 'RetroArch',
    packageName: 'com.retroarch',
    urlScheme: 'retroarch',
    supportedPlatforms: ['*'],
  },
  // Nintendo
  {
    id: 'delta',
    name: 'Delta',
    urlScheme: 'delta',
    supportedPlatforms: ['nes', 'snes', 'gba', 'gbc', 'gb', 'n64', 'nds'],
  },
  {
    id: 'ppsspp',
    name: 'PPSSPP',
    packageName: 'org.ppsspp.ppsspp',
    urlScheme: 'ppsspp',
    supportedPlatforms: ['psp'],
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    packageName: 'org.dolphinemu.dolphinemu',
    supportedPlatforms: ['gc', 'wii'],
  },
  {
    id: 'citra',
    name: 'Citra',
    packageName: 'org.citra.citra_emu',
    supportedPlatforms: ['3ds'],
  },
  // Sony
  {
    id: 'duckstation',
    name: 'DuckStation',
    packageName: 'com.github.stenzek.duckstation',
    supportedPlatforms: ['ps1'],
  },
  {
    id: 'aethersx2',
    name: 'AetherSX2',
    packageName: 'xyz.aethersx2.android',
    supportedPlatforms: ['ps2'],
  },
  // Sega
  {
    id: 'genesis-plus-gx',
    name: 'Genesis Plus GX',
    supportedPlatforms: ['genesis', 'sms', 'gg', 'segacd'],
  },
  // Arcade
  {
    id: 'mame4droid',
    name: 'MAME4droid',
    packageName: 'com.seleuco.mame4droid',
    supportedPlatforms: ['arcade'],
  },
];

/**
 * LauncherService - Handles launching games in emulators
 */
export class LauncherService {
  /**
   * Get list of known emulators
   */
  getKnownEmulators(): EmulatorConfig[] {
    return knownEmulators;
  }

  /**
   * Get emulators for a specific platform
   */
  getEmulatorsForPlatform(platformId: string): EmulatorConfig[] {
    return knownEmulators.filter(
      (emu) =>
        emu.supportedPlatforms.includes('*') ||
        emu.supportedPlatforms.includes(platformId.toLowerCase())
    );
  }

  /**
   * Check if an emulator is installed
   */
  async isEmulatorInstalled(emulatorId: string): Promise<boolean> {
    const emulator = knownEmulators.find((e) => e.id === emulatorId);
    if (!emulator) return false;

    if (Platform.OS === 'android' && emulator.packageName) {
      // On Android, we can try to open an intent to check
      // This is a simplified check - real implementation would use native module
      return true; // Assume installed for now
    }

    if (Platform.OS === 'ios' && emulator.urlScheme) {
      try {
        return await Linking.canOpenURL(`${emulator.urlScheme}://`);
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Launch a game in an emulator
   */
  async launchGame(
    romPath: string,
    emulatorId: string,
    _platformId: string
  ): Promise<LaunchResult> {
    const emulator = knownEmulators.find((e) => e.id === emulatorId);
    if (!emulator) {
      return {
        success: false,
        error: `Unknown emulator: ${emulatorId}`,
      };
    }

    try {
      if (Platform.OS === 'android') {
        return await this.launchAndroid(romPath, emulator);
      } else if (Platform.OS === 'ios') {
        return await this.launchiOS(romPath, emulator);
      } else {
        return {
          success: false,
          error: `Unsupported platform: ${Platform.OS}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Launch game on Android using Intent
   */
  private async launchAndroid(
    romPath: string,
    emulator: EmulatorConfig
  ): Promise<LaunchResult> {
    if (!emulator.packageName) {
      return {
        success: false,
        error: 'Emulator has no Android package name',
      };
    }

    // For RetroArch, use URL scheme
    if (emulator.id === 'retroarch') {
      const url = `retroarch://run?rom=${encodeURIComponent(romPath)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      }
    }

    // Fallback: Try to open the app directly
    // Real implementation would use a native module for Intent launching
    const url = `intent://${encodeURIComponent(romPath)}#Intent;scheme=file;package=${emulator.packageName};end`;
    
    try {
      await Linking.openURL(url);
      return { success: true };
    } catch {
      // Try opening just the app
      await Linking.openURL(`market://details?id=${emulator.packageName}`);
      return {
        success: false,
        error: 'Could not launch game. Emulator may need to be opened manually.',
      };
    }
  }

  /**
   * Launch game on iOS using URL scheme
   */
  private async launchiOS(
    romPath: string,
    emulator: EmulatorConfig
  ): Promise<LaunchResult> {
    if (!emulator.urlScheme) {
      return {
        success: false,
        error: 'Emulator has no iOS URL scheme',
      };
    }

    let url: string;

    // Build URL based on emulator
    switch (emulator.id) {
      case 'retroarch':
        url = `retroarch://run?rom=${encodeURIComponent(romPath)}`;
        break;
      case 'delta':
        url = `delta://game/${encodeURIComponent(romPath)}`;
        break;
      case 'ppsspp':
        url = `ppsspp://play?file=${encodeURIComponent(romPath)}`;
        break;
      default:
        url = `${emulator.urlScheme}://play?file=${encodeURIComponent(romPath)}`;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      return {
        success: false,
        error: `${emulator.name} is not installed`,
      };
    }

    await Linking.openURL(url);
    return { success: true };
  }

  /**
   * Open emulator app store page
   */
  async openEmulatorStore(emulatorId: string): Promise<void> {
    const emulator = knownEmulators.find((e) => e.id === emulatorId);
    if (!emulator) return;

    if (Platform.OS === 'android' && emulator.packageName) {
      await Linking.openURL(`market://details?id=${emulator.packageName}`);
    }
    // iOS App Store links would need to be added manually
  }
}

// Singleton instance
export const launcherService = new LauncherService();
