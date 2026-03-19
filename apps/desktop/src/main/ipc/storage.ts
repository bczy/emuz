/**
 * Storage IPC Handlers
 * Initializes and exposes the FlatDb flat-file storage engine.
 * Replaces the legacy better-sqlite3 database.ts module.
 */

import path from 'node:path';
import { app, ipcMain } from 'electron';
import { createFlatDb, createNodeFileIO, type FlatDb } from '@emuz/storage';

let flatDb: FlatDb | null = null;

/**
 * Initialize the flat-file database.
 */
export async function initializeFlatDb(): Promise<void> {
  const dataDir = path.join(app.getPath('userData'), 'data');
  const io = createNodeFileIO();
  flatDb = createFlatDb(dataDir, io);
  await flatDb.open();
  console.log('FlatDb initialized at:', dataDir);
}

/**
 * Close the flat-file database and flush pending writes.
 */
export async function closeFlatDb(): Promise<void> {
  if (flatDb) {
    await flatDb.close();
    flatDb = null;
  }
}

/**
 * Get the initialized FlatDb instance.
 * Throws if called before initializeFlatDb().
 */
export function getFlatDb(): FlatDb {
  if (!flatDb) {
    throw new Error('FlatDb not initialized. Call initializeFlatDb() first.');
  }
  return flatDb;
}

/**
 * Register minimal IPC handlers for diagnostics / settings screen.
 * Services are called directly in the main process — not via raw storage IPC.
 */
export function registerStorageHandlers(): void {
  ipcMain.handle('storage:info', () => ({
    type: 'flatfile',
    dataDir: path.join(app.getPath('userData'), 'data'),
  }));
}
