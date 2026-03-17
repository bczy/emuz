/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [react(), nxViteTsPaths()],
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/desktop',
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/renderer/**/*.{ts,tsx}'],
      exclude: ['src/renderer/main.tsx', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@': resolve(__dirname, 'src'),
      '@emuz/core': resolve(__dirname, '../../libs/core/src'),
      '@emuz/database': resolve(__dirname, '../../libs/database/src'),
      '@emuz/emulators': resolve(__dirname, '../../libs/emulators/src'),
      '@emuz/i18n': resolve(__dirname, '../../libs/i18n/src'),
      '@emuz/platform': resolve(__dirname, '../../libs/platform/src'),
      '@emuz/ui': resolve(__dirname, '../../libs/ui/src'),
    },
  },
});
