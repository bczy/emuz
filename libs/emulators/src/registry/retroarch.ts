/**
 * RetroArch emulator and core definitions
 */

import type { EmulatorDefinition } from './types';

/**
 * RetroArch main application
 */
export const retroarch: EmulatorDefinition = {
  id: 'retroarch',
  name: 'RetroArch',
  description: 'Multi-system emulator frontend using libretro cores',
  website: 'https://www.retroarch.com/',
  platformIds: ['nes', 'fds', 'snes', 'gb', 'gbc', 'gba', 'n64', 'genesis', 'sms', 'gg', '32x', 'scd', 'psx', 'nds', 'psp'],
  hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
  
  desktop: {
    executables: {
      windows: ['retroarch.exe'],
      macos: ['RetroArch.app/Contents/MacOS/RetroArch', 'retroarch'],
      linux: ['retroarch'],
    },
    installPaths: {
      windows: [
        'C:\\RetroArch-Win64',
        'C:\\RetroArch',
        'C:\\Program Files\\RetroArch',
        '%APPDATA%\\RetroArch',
      ],
      macos: [
        '/Applications/RetroArch.app',
        '~/Applications/RetroArch.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
        '~/.local/bin',
        '/var/lib/flatpak/exports/bin',
      ],
    },
    commandTemplate: '{emulator} -L {core} "{rom}"',
  },
  
  android: {
    packageName: 'com.retroarch',
    intentAction: 'android.intent.action.MAIN',
  },
  
  ios: {
    urlScheme: 'retroarch',
    appStoreId: '6499539433',
  },
  
  iconName: 'retroarch',
};

/**
 * RetroArch cores for various platforms
 */
export const retroarchCores: EmulatorDefinition[] = [
  // NES
  {
    id: 'retroarch-nestopia',
    name: 'Nestopia UE',
    description: 'Accurate NES/Famicom emulator',
    website: 'https://github.com/libretro/nestopia',
    platformIds: ['nes', 'fds'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'nestopia',
      coreFile: {
        windows: 'nestopia_libretro.dll',
        macos: 'nestopia_libretro.dylib',
        linux: 'nestopia_libretro.so',
        android: 'nestopia_libretro_android.so',
        ios: 'nestopia_libretro_ios.dylib',
      },
    },
  },
  {
    id: 'retroarch-fceumm',
    name: 'FCEUmm',
    description: 'NES/Famicom emulator with mappers',
    website: 'https://github.com/libretro/libretro-fceumm',
    platformIds: ['nes', 'fds'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'fceumm',
      coreFile: {
        windows: 'fceumm_libretro.dll',
        macos: 'fceumm_libretro.dylib',
        linux: 'fceumm_libretro.so',
        android: 'fceumm_libretro_android.so',
        ios: 'fceumm_libretro_ios.dylib',
      },
    },
  },
  
  // SNES
  {
    id: 'retroarch-snes9x',
    name: 'Snes9x',
    description: 'Popular SNES emulator',
    website: 'https://github.com/libretro/snes9x',
    platformIds: ['snes'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'snes9x',
      coreFile: {
        windows: 'snes9x_libretro.dll',
        macos: 'snes9x_libretro.dylib',
        linux: 'snes9x_libretro.so',
        android: 'snes9x_libretro_android.so',
        ios: 'snes9x_libretro_ios.dylib',
      },
    },
  },
  {
    id: 'retroarch-bsnes',
    name: 'bsnes',
    description: 'Cycle-accurate SNES emulator',
    website: 'https://github.com/libretro/bsnes-libretro',
    platformIds: ['snes'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'bsnes',
      coreFile: {
        windows: 'bsnes_libretro.dll',
        macos: 'bsnes_libretro.dylib',
        linux: 'bsnes_libretro.so',
        android: 'bsnes_libretro_android.so',
        ios: 'bsnes_libretro_ios.dylib',
      },
    },
  },
  
  // Game Boy / GBC / GBA
  {
    id: 'retroarch-mgba',
    name: 'mGBA',
    description: 'GBA/GB/GBC emulator',
    website: 'https://github.com/libretro/mgba',
    platformIds: ['gba', 'gb', 'gbc'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'mgba',
      coreFile: {
        windows: 'mgba_libretro.dll',
        macos: 'mgba_libretro.dylib',
        linux: 'mgba_libretro.so',
        android: 'mgba_libretro_android.so',
        ios: 'mgba_libretro_ios.dylib',
      },
    },
  },
  
  // N64
  {
    id: 'retroarch-mupen64plus',
    name: 'Mupen64Plus-Next',
    description: 'Nintendo 64 emulator',
    website: 'https://github.com/libretro/mupen64plus-libretro-nx',
    platformIds: ['n64'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'mupen64plus_next',
      coreFile: {
        windows: 'mupen64plus_next_libretro.dll',
        macos: 'mupen64plus_next_libretro.dylib',
        linux: 'mupen64plus_next_libretro.so',
        android: 'mupen64plus_next_libretro_android.so',
      },
    },
  },
  
  // Sega Genesis/Mega Drive
  {
    id: 'retroarch-genesis-plus-gx',
    name: 'Genesis Plus GX',
    description: 'Sega Genesis/Mega Drive emulator',
    website: 'https://github.com/libretro/Genesis-Plus-GX',
    platformIds: ['genesis', 'sms', 'gg', '32x', 'scd'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'genesis_plus_gx',
      coreFile: {
        windows: 'genesis_plus_gx_libretro.dll',
        macos: 'genesis_plus_gx_libretro.dylib',
        linux: 'genesis_plus_gx_libretro.so',
        android: 'genesis_plus_gx_libretro_android.so',
        ios: 'genesis_plus_gx_libretro_ios.dylib',
      },
    },
  },
  
  // PlayStation
  {
    id: 'retroarch-beetle-psx',
    name: 'Beetle PSX HW',
    description: 'PlayStation emulator with hardware rendering',
    website: 'https://github.com/libretro/beetle-psx-libretro',
    platformIds: ['psx'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'beetle_psx_hw',
      coreFile: {
        windows: 'mednafen_psx_hw_libretro.dll',
        macos: 'mednafen_psx_hw_libretro.dylib',
        linux: 'mednafen_psx_hw_libretro.so',
        android: 'mednafen_psx_hw_libretro_android.so',
      },
    },
  },
  
  // Nintendo DS
  {
    id: 'retroarch-melonds',
    name: 'melonDS',
    description: 'Nintendo DS emulator',
    website: 'https://github.com/libretro/melonDS',
    platformIds: ['nds'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'melonds',
      coreFile: {
        windows: 'melonds_libretro.dll',
        macos: 'melonds_libretro.dylib',
        linux: 'melonds_libretro.so',
        android: 'melonds_libretro_android.so',
      },
    },
  },
  
  // PSP
  {
    id: 'retroarch-ppsspp',
    name: 'PPSSPP',
    description: 'PlayStation Portable emulator',
    website: 'https://github.com/libretro/ppsspp',
    platformIds: ['psp'],
    hostPlatforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isRetroarchCore: true,
    retroarchCore: {
      coreName: 'ppsspp',
      coreFile: {
        windows: 'ppsspp_libretro.dll',
        macos: 'ppsspp_libretro.dylib',
        linux: 'ppsspp_libretro.so',
        android: 'ppsspp_libretro_android.so',
        ios: 'ppsspp_libretro_ios.dylib',
      },
    },
  },
];

/**
 * All RetroArch related definitions
 */
export const allRetroarch = [retroarch, ...retroarchCores];
