const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Find workspace root
const workspaceRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration for EmuZ mobile app
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    workspaceRoot, // Watch entire monorepo
  ],

  resolver: {
    // Make sure Metro can resolve packages from workspace root
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],

    // Resolve workspace packages
    extraNodeModules: {
      '@emuz/core': path.resolve(workspaceRoot, 'libs/core/src'),
      '@emuz/database': path.resolve(workspaceRoot, 'libs/database/src'),
      '@emuz/emulators': path.resolve(workspaceRoot, 'libs/emulators/src'),
      '@emuz/i18n': path.resolve(workspaceRoot, 'libs/i18n/src'),
      '@emuz/platform': path.resolve(workspaceRoot, 'libs/platform/src'),
      '@emuz/ui': path.resolve(workspaceRoot, 'libs/ui/src'),
    },

    // Source extensions
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'],

    // Block these packages from being loaded from workspace root
    // (forces them to use app's own node_modules)
    blockList: [
      // Block duplicate react/react-native from workspace
      new RegExp(`${workspaceRoot}/node_modules/react/.*`),
      new RegExp(`${workspaceRoot}/node_modules/react-native/.*`),
    ],
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
