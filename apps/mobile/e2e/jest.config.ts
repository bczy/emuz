import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  testTimeout: 120_000,
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { allowJs: true, strict: false } }],
  },
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  verbose: true,
};

export default config;
