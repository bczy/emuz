module.exports = {
  displayName: 'mobile',
  preset: 'react-native',
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-async-storage|nativewind)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@emuz/core$': '<rootDir>/../../libs/core/src/index.ts',
    '^@emuz/database$': '<rootDir>/../../libs/database/src/index.ts',
    '^@emuz/emulators$': '<rootDir>/../../libs/emulators/src/index.ts',
    '^@emuz/i18n$': '<rootDir>/../../libs/i18n/src/index.ts',
    '^@emuz/platform$': '<rootDir>/../../libs/platform/src/index.ts',
    '^@emuz/ui$': '<rootDir>/../../libs/ui/src/index.ts',
  },
  coverageDirectory: '../../coverage/apps/mobile',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
};
