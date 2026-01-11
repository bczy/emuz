/**
 * React Native configuration for monorepo
 * This file tells React Native CLI where to find dependencies
 */

const path = require('path');

// Path to the monorepo root
const monorepoRoot = path.resolve(__dirname, '../..');

module.exports = {
  // Project root is where package.json is
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  // Dependencies configuration for monorepo
  dependencies: {
    // Add any native module overrides here if needed
  },
  // Assets configuration
  assets: ['./src/assets'],
  // Dependency configuration
  dependency: {
    platforms: {
      ios: {},
      android: {},
    },
  },
};
