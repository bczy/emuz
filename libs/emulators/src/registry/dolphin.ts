/**
 * Dolphin emulator definition
 */

import type { EmulatorDefinition } from './types';

export const dolphin: EmulatorDefinition = {
  id: 'dolphin',
  name: 'Dolphin',
  description: 'GameCube and Wii emulator',
  website: 'https://dolphin-emu.org/',
  platformIds: ['gc', 'wii'],
  hostPlatforms: ['windows', 'macos', 'linux', 'android'],
  
  desktop: {
    executables: {
      windows: ['Dolphin.exe'],
      macos: ['Dolphin.app/Contents/MacOS/Dolphin'],
      linux: ['dolphin-emu', 'dolphin-emu-qt'],
    },
    installPaths: {
      windows: [
        'C:\\Program Files\\Dolphin',
        'C:\\Program Files (x86)\\Dolphin',
        '%LOCALAPPDATA%\\Dolphin Emulator',
      ],
      macos: [
        '/Applications/Dolphin.app',
        '~/Applications/Dolphin.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
        '/var/lib/flatpak/exports/bin',
      ],
    },
    commandTemplate: '{emulator} -e "{rom}"',
  },
  
  android: {
    packageName: 'org.dolphinemu.dolphinemu',
    intentAction: 'android.intent.action.VIEW',
    intentType: 'application/octet-stream',
  },
  
  iconName: 'dolphin',
};

export const allDolphin = [dolphin];
