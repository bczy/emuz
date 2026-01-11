import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['better-sqlite3'],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
    },
  },
  renderer: {
    plugins: [react()],
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
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
    optimizeDeps: {
      include: ['react', 'react-dom', 'zustand', 'zustand/middleware'],
    },
  },
});
