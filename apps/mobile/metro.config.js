const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find workspace root
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

/**
 * Metro configuration for EmuZ mobile app
 * https://docs.expo.dev/guides/monorepos/
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(projectRoot);

// Watch entire monorepo
config.watchFolders = [workspaceRoot];

// Make sure Metro can resolve packages from workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve workspace packages and core dependencies
config.resolver.extraNodeModules = {
  // Workspace libs
  '@emuz/core': path.resolve(workspaceRoot, 'libs/core/src'),
  '@emuz/database': path.resolve(workspaceRoot, 'libs/database/src'),
  '@emuz/emulators': path.resolve(workspaceRoot, 'libs/emulators/src'),
  '@emuz/i18n': path.resolve(workspaceRoot, 'libs/i18n/src'),
  '@emuz/platform': path.resolve(workspaceRoot, 'libs/platform/src'),
  '@emuz/ui': path.resolve(workspaceRoot, 'libs/ui/src'),
  // Core dependencies - resolve from project's node_modules
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Add source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

// Disable hierarchical lookup to avoid resolving from wrong node_modules
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
