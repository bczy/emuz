/**
 * iOS URL schemes registry
 * Known URL schemes for popular emulators on iOS
 */

import { EmulatorLaunchConfig } from './types';

/**
 * Known iOS emulator URL schemes
 *
 * Note: These URL schemes need to be added to your app's
 * Info.plist under LSApplicationQueriesSchemes
 *
 * @example
 * ```xml
 * <key>LSApplicationQueriesSchemes</key>
 * <array>
 *   <string>retroarch</string>
 *   <string>delta</string>
 *   <string>provenance</string>
 * </array>
 * ```
 */
export const IOS_EMULATOR_SCHEMES: Record<string, EmulatorLaunchConfig> = {
  // RetroArch - Multi-platform emulator
  retroarch: {
    id: 'retroarch',
    name: 'RetroArch',
    ios: {
      urlScheme: 'retroarch://',
      bundleId: 'com.libretro.RetroArch',
      appStoreId: '6499539433',
    },
    android: {
      packageName: 'com.retroarch',
      intentAction: 'android.intent.action.VIEW',
    },
    desktop: {
      executable: '/usr/bin/retroarch',
      args: ['{rom}'],
    },
  },

  // Delta - Nintendo emulator for iOS
  delta: {
    id: 'delta',
    name: 'Delta',
    ios: {
      urlScheme: 'delta://',
      bundleId: 'com.rileytestut.Delta',
      appStoreId: '1048524688',
    },
  },

  // Provenance - Multi-system emulator
  provenance: {
    id: 'provenance',
    name: 'Provenance',
    ios: {
      urlScheme: 'provenance://',
      bundleId: 'org.provenance-emu.provenance',
    },
  },

  // PPSSPP - PSP emulator
  ppsspp: {
    id: 'ppsspp',
    name: 'PPSSPP',
    ios: {
      urlScheme: 'ppsspp://',
      bundleId: 'org.ppsspp.ppsspp',
      appStoreId: '6496972903',
    },
    android: {
      packageName: 'org.ppsspp.ppsspp',
      intentAction: 'android.intent.action.VIEW',
    },
    desktop: {
      executable: 'PPSSPPSDL',
      args: ['{rom}'],
    },
  },

  // DolphiniOS - GameCube/Wii emulator
  dolphin: {
    id: 'dolphin',
    name: 'DolphiniOS',
    ios: {
      urlScheme: 'dolphin://',
      bundleId: 'me.oatmealdome.dolphinios',
    },
    android: {
      packageName: 'org.dolphinemu.dolphinemu',
      intentAction: 'android.intent.action.VIEW',
    },
    desktop: {
      executable: 'dolphin-emu',
      args: ['-e', '{rom}'],
    },
  },

  // Citra - Nintendo 3DS emulator
  citra: {
    id: 'citra',
    name: 'Citra',
    ios: {
      urlScheme: 'citra://',
      bundleId: 'org.citra-emu.citra',
    },
    android: {
      packageName: 'org.citra.citra_emu',
      intentAction: 'android.intent.action.VIEW',
    },
    desktop: {
      executable: 'citra',
      args: ['{rom}'],
    },
  },
};

/**
 * Get all known iOS URL schemes
 */
export function getIOSUrlSchemes(): string[] {
  return Object.values(IOS_EMULATOR_SCHEMES).flatMap((config) =>
    config.ios?.urlScheme ? [config.ios.urlScheme.replace('://', '')] : []
  );
}

/**
 * Get emulator config by URL scheme
 */
export function getEmulatorByScheme(scheme: string): EmulatorLaunchConfig | undefined {
  const normalizedScheme = scheme.replace('://', '').toLowerCase();
  return IOS_EMULATOR_SCHEMES[normalizedScheme];
}

/**
 * Get emulator config by ID
 */
export function getEmulatorById(id: string): EmulatorLaunchConfig | undefined {
  return IOS_EMULATOR_SCHEMES[id];
}

/**
 * Get all registered emulator configs
 */
export function getAllEmulatorConfigs(): EmulatorLaunchConfig[] {
  return Object.values(IOS_EMULATOR_SCHEMES);
}

/**
 * Generate Info.plist LSApplicationQueriesSchemes array
 * Use this output in your iOS app's Info.plist
 */
export function generatePlistSchemes(): string {
  const schemes = getIOSUrlSchemes();
  const items = schemes.map((scheme) => `    <string>${scheme}</string>`).join('\n');

  return `<key>LSApplicationQueriesSchemes</key>
<array>
${items}
</array>`;
}
