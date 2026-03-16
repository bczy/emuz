/**
 * Electron Main Process Entry Point
 * Handles window creation, IPC, and app lifecycle
 */

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'path';
import { registerAllHandlers, initializeDatabase, closeDatabase } from './ipc';

// Inline replacements for @electron-toolkit/utils (avoids early app.isPackaged access)
const is = { get dev() { return !app.isPackaged; } };
const electronApp = { setAppUserModelId: (id: string) => { if (process.platform === 'win32') app.setAppUserModelId(id); } };
const optimizer = { watchWindowShortcuts: (_win: BrowserWindow) => {} };

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

/**
 * Create the main browser window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0F172A', // Slate 900
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    // Open DevTools in development to debug issues
    if (is.dev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details: Electron.HandlerDetails) => {
    shell.openExternal(details.url);
    return { action: 'deny' as const };
  });

  // Load the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Clean up on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App lifecycle handlers
 */
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.emuz.app');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_: Electron.Event, window: BrowserWindow) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize database
  initializeDatabase();

  // Register all IPC handlers
  registerAllHandlers();

  // Create window
  createWindow();

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app before quit
app.on('before-quit', () => {
  // Close database connection
  closeDatabase();
});

/**
 * IPC Handlers
 */

// Get app version
ipcMain.handle('app:version', () => {
  return app.getVersion();
});

// Get platform info
ipcMain.handle('app:platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.versions.electron,
  };
});

// Window controls
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// Open external URL
ipcMain.handle('shell:openExternal', async (_event: Electron.IpcMainInvokeEvent, url: string) => {
  await shell.openExternal(url);
});

// Show item in folder
ipcMain.handle(
  'shell:showItemInFolder',
  async (_event: Electron.IpcMainInvokeEvent, path: string) => {
    shell.showItemInFolder(path);
  }
);

export { mainWindow };
