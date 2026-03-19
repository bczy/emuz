/**
 * IPC Handlers Index
 * Registers all IPC handlers for the main process
 */

export { registerFilesystemHandlers } from './filesystem';
export { registerStorageHandlers, initializeFlatDb, closeFlatDb, getFlatDb } from './storage';
export { registerLauncherHandlers } from './launcher';

import { registerFilesystemHandlers } from './filesystem';
import { registerStorageHandlers } from './storage';
import { registerLauncherHandlers } from './launcher';

/**
 * Register all IPC handlers
 */
export function registerAllHandlers(): void {
  registerFilesystemHandlers();
  registerStorageHandlers();
  registerLauncherHandlers();

  console.log('All IPC handlers registered');
}
