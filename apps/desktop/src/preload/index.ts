/**
 * Preload Script
 * Exposes safe APIs to the renderer process via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';

// Exposed electron APIs
const electronAPI = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Shell operations
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  showItemInFolder: (path: string) => ipcRenderer.invoke('shell:showItemInFolder', path),
  openFile: (path: string) => ipcRenderer.invoke('launcher:openFile', path),
  openUrl: (url: string) => ipcRenderer.invoke('launcher:openUrl', url),

  // File system operations
  fs: {
    read: (path: string) => ipcRenderer.invoke('fs:read', path),
    readBinary: (path: string) => ipcRenderer.invoke('fs:readBinary', path),
    write: (path: string, content: string) => ipcRenderer.invoke('fs:write', path, content),
    writeBinary: (path: string, data: ArrayBuffer) => ipcRenderer.invoke('fs:writeBinary', path, data),
    delete: (path: string) => ipcRenderer.invoke('fs:delete', path),
    exists: (path: string) => ipcRenderer.invoke('fs:exists', path),
    stat: (path: string) => ipcRenderer.invoke('fs:stat', path),
    mkdir: (path: string) => ipcRenderer.invoke('fs:mkdir', path),
    list: (path: string) => ipcRenderer.invoke('fs:list', path),
    copy: (src: string, dest: string) => ipcRenderer.invoke('fs:copy', src, dest),
    move: (src: string, dest: string) => ipcRenderer.invoke('fs:move', src, dest),
    pickFolder: (options?: { title?: string; defaultPath?: string }) => 
      ipcRenderer.invoke('fs:pickFolder', options),
    pickFile: (options?: { title?: string; defaultPath?: string; filters?: { name: string; extensions: string[] }[]; multiSelect?: boolean }) =>
      ipcRenderer.invoke('fs:pickFile', options),
    saveDialog: (options?: { title?: string; defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('fs:saveDialog', options),
    getPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'desktop' | 'documents' | 'downloads') =>
      ipcRenderer.invoke('fs:getPath', name),
  },

  // Database operations
  db: {
    init: () => ipcRenderer.invoke('db:init'),
    query: <T>(sql: string, params?: unknown[]) => ipcRenderer.invoke('db:query', sql, params) as Promise<T[]>,
    queryOne: <T>(sql: string, params?: unknown[]) => ipcRenderer.invoke('db:queryOne', sql, params) as Promise<T | null>,
    execute: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:execute', sql, params),
    transaction: (statements: { sql: string; params?: unknown[] }[]) =>
      ipcRenderer.invoke('db:transaction', statements),
    migrate: (migrations: { version: number; sql: string }[]) =>
      ipcRenderer.invoke('db:migrate', migrations),
    info: () => ipcRenderer.invoke('db:info'),
    backup: (backupPath: string) => ipcRenderer.invoke('db:backup', backupPath),
    vacuum: () => ipcRenderer.invoke('db:vacuum'),
  },

  // Launcher operations
  launcher: {
    detectEmulators: () => ipcRenderer.invoke('launcher:detectEmulators'),
    launchGame: (options: { gameId: string; romPath: string; emulatorPath: string; args?: string[]; cwd?: string }) =>
      ipcRenderer.invoke('launcher:launchGame', options),
    isRunning: (gameId: string) => ipcRenderer.invoke('launcher:isRunning', gameId),
    stopGame: (gameId: string) => ipcRenderer.invoke('launcher:stopGame', gameId),
    getRunningGames: () => ipcRenderer.invoke('launcher:getRunningGames'),
    launchCommand: (options: { command: string; args: string[]; cwd?: string; env?: Record<string, string> }) =>
      ipcRenderer.invoke('launcher:launchCommand', options),
    showInFolder: (path: string) => ipcRenderer.invoke('launcher:showInFolder', path),
    getCommandTemplate: (emulatorId: string) => ipcRenderer.invoke('launcher:getCommandTemplate', emulatorId),
  },

  // Events
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_: unknown, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window:maximizeChange', handler);
    return () => ipcRenderer.removeListener('window:maximizeChange', handler);
  },

  onScanProgress: (callback: (progress: { current: number; total: number; path: string }) => void) => {
    const handler = (_: unknown, progress: { current: number; total: number; path: string }) => callback(progress);
    ipcRenderer.on('scan:progress', handler);
    return () => ipcRenderer.removeListener('scan:progress', handler);
  },
};

// Type definitions for the exposed API
export type ElectronAPI = typeof electronAPI;

// Expose the API to the renderer
contextBridge.exposeInMainWorld('electron', electronAPI);

// Also expose a simple ipc for custom events
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: unknown[]) => {
    const validChannels = ['app:ready', 'scan:start', 'scan:cancel'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['scan:progress', 'scan:complete', 'scan:error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args));
    }
  },
});
