/**
 * PCSX2 emulator definition
 */

import type { EmulatorDefinition } from './types';

export const pcsx2: EmulatorDefinition = {
  id: 'pcsx2',
  name: 'PCSX2',
  description: 'PlayStation 2 emulator',
  website: 'https://pcsx2.net/',
  platformIds: ['ps2'],
  hostPlatforms: ['windows', 'macos', 'linux'],
  
  desktop: {
    executables: {
      windows: ['pcsx2-qt.exe', 'pcsx2.exe'],
      macos: ['PCSX2.app/Contents/MacOS/PCSX2'],
      linux: ['pcsx2-qt', 'PCSX2'],
    },
    installPaths: {
      windows: [
        'C:\\Program Files\\PCSX2',
        'C:\\Program Files (x86)\\PCSX2',
      ],
      macos: [
        '/Applications/PCSX2.app',
        '~/Applications/PCSX2.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
        '/var/lib/flatpak/exports/bin',
        '~/.local/bin',
      ],
    },
    commandTemplate: '{emulator} "{rom}"',
  },
  
  iconName: 'pcsx2',
};

export const allPcsx2 = [pcsx2];
