/**
 * IPC Handlers Index
 * Registers all IPC handlers for the main process
 */

export { registerFilesystemHandlers } from './filesystem';
export { registerDatabaseHandlers, initializeDatabase, closeDatabase, getDatabase } from './database';
export { registerLauncherHandlers } from './launcher';

import { registerFilesystemHandlers } from './filesystem';
import { registerDatabaseHandlers } from './database';
import { registerLauncherHandlers } from './launcher';

/**
 * Register all IPC handlers
 */
export function registerAllHandlers(): void {
  registerFilesystemHandlers();
  registerDatabaseHandlers();
  registerLauncherHandlers();
  
  console.log('All IPC handlers registered');
}
