/**
 * mGBA standalone emulator definition
 */

import type { EmulatorDefinition } from './types';

export const mgba: EmulatorDefinition = {
  id: 'mgba',
  name: 'mGBA',
  description: 'Game Boy Advance emulator',
  website: 'https://mgba.io/',
  platformIds: ['gba', 'gb', 'gbc'],
  hostPlatforms: ['windows', 'macos', 'linux', 'ios'],
  
  desktop: {
    executables: {
      windows: ['mGBA.exe'],
      macos: ['mGBA.app/Contents/MacOS/mGBA'],
      linux: ['mgba-qt', 'mgba'],
    },
    installPaths: {
      windows: [
        'C:\\Program Files\\mGBA',
        'C:\\mGBA',
      ],
      macos: [
        '/Applications/mGBA.app',
        '~/Applications/mGBA.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
        '/var/lib/flatpak/exports/bin',
      ],
    },
    commandTemplate: '{emulator} "{rom}"',
  },
  
  ios: {
    urlScheme: 'mgba',
  },
  
  iconName: 'mgba',
};

export const allMgba = [mgba];
