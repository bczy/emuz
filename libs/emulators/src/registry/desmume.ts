/**
 * melonDS and DeSmuME emulator definitions
 */

import type { EmulatorDefinition } from './types';

export const melonds: EmulatorDefinition = {
  id: 'melonds',
  name: 'melonDS',
  description: 'Nintendo DS and DSi emulator',
  website: 'https://melonds.kuribo64.net/',
  platformIds: ['nds', 'dsi'],
  hostPlatforms: ['windows', 'macos', 'linux', 'android'],
  
  desktop: {
    executables: {
      windows: ['melonDS.exe'],
      macos: ['melonDS.app/Contents/MacOS/melonDS'],
      linux: ['melonDS'],
    },
    installPaths: {
      windows: [
        'C:\\Program Files\\melonDS',
        'C:\\melonDS',
      ],
      macos: [
        '/Applications/melonDS.app',
        '~/Applications/melonDS.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
        '/var/lib/flatpak/exports/bin',
      ],
    },
    commandTemplate: '{emulator} "{rom}"',
  },
  
  android: {
    packageName: 'me.magnum.melonds',
    intentAction: 'android.intent.action.VIEW',
  },
  
  iconName: 'melonds',
};

export const desmume: EmulatorDefinition = {
  id: 'desmume',
  name: 'DeSmuME',
  description: 'Nintendo DS emulator',
  website: 'https://desmume.org/',
  platformIds: ['nds'],
  hostPlatforms: ['windows', 'macos', 'linux'],
  
  desktop: {
    executables: {
      windows: ['DeSmuME.exe', 'DeSmuME-VS2019-x64-Release.exe'],
      macos: ['DeSmuME.app/Contents/MacOS/DeSmuME'],
      linux: ['desmume', 'desmume-glade', 'desmume-cli'],
    },
    installPaths: {
      windows: [
        'C:\\Program Files\\DeSmuME',
        'C:\\DeSmuME',
      ],
      macos: [
        '/Applications/DeSmuME.app',
        '~/Applications/DeSmuME.app',
      ],
      linux: [
        '/usr/bin',
        '/usr/local/bin',
      ],
    },
    commandTemplate: '{emulator} "{rom}"',
  },
  
  iconName: 'desmume',
};

export const allDsEmulators = [melonds, desmume];
