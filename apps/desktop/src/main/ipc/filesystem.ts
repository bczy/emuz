/**
 * Filesystem IPC Handlers
 * Exposes filesystem operations to the renderer process
 */

import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Register all filesystem IPC handlers
 */
export function registerFilesystemHandlers(): void {
  // Read file contents
  ipcMain.handle('fs:read', async (_event, filePath: string): Promise<string> => {
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  });
  
  // Read file as binary
  ipcMain.handle('fs:readBinary', async (_event, filePath: string): Promise<ArrayBuffer> => {
    try {
      const buffer = await fs.promises.readFile(filePath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (error) {
      throw new Error(`Failed to read binary file: ${filePath}`);
    }
  });
  
  // Write file contents
  ipcMain.handle('fs:write', async (_event, filePath: string, content: string): Promise<void> => {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${filePath}`);
    }
  });
  
  // Write binary file
  ipcMain.handle('fs:writeBinary', async (_event, filePath: string, data: ArrayBuffer): Promise<void> => {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, Buffer.from(data));
    } catch (error) {
      throw new Error(`Failed to write binary file: ${filePath}`);
    }
  });
  
  // Delete file
  ipcMain.handle('fs:delete', async (_event, filePath: string): Promise<void> => {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete file: ${filePath}`);
      }
    }
  });
  
  // Check if file/directory exists
  ipcMain.handle('fs:exists', async (_event, filePath: string): Promise<boolean> => {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  });
  
  // Get file/directory stats
  ipcMain.handle('fs:stat', async (_event, filePath: string): Promise<{
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    modifiedAt: Date;
    createdAt: Date;
  } | null> => {
    try {
      const stats = await fs.promises.stat(filePath);
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime,
      };
    } catch {
      return null;
    }
  });
  
  // Create directory
  ipcMain.handle('fs:mkdir', async (_event, dirPath: string): Promise<void> => {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  });
  
  // List directory contents
  ipcMain.handle('fs:list', async (_event, dirPath: string): Promise<{
    name: string;
    path: string;
    isFile: boolean;
    isDirectory: boolean;
  }[]> => {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      return entries.map(entry => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory(),
      }));
    } catch (error) {
      throw new Error(`Failed to list directory: ${dirPath}`);
    }
  });
  
  // Copy file
  ipcMain.handle('fs:copy', async (_event, src: string, dest: string): Promise<void> => {
    try {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.copyFile(src, dest);
    } catch (error) {
      throw new Error(`Failed to copy file from ${src} to ${dest}`);
    }
  });
  
  // Move/rename file
  ipcMain.handle('fs:move', async (_event, src: string, dest: string): Promise<void> => {
    try {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.rename(src, dest);
    } catch (error) {
      throw new Error(`Failed to move file from ${src} to ${dest}`);
    }
  });
  
  // Open folder picker dialog
  ipcMain.handle('fs:pickFolder', async (_event, options?: {
    title?: string;
    defaultPath?: string;
  }): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      title: options?.title || 'Select Folder',
      defaultPath: options?.defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths[0];
  });
  
  // Open file picker dialog
  ipcMain.handle('fs:pickFile', async (_event, options?: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
    multiSelect?: boolean;
  }): Promise<string[] | null> => {
    const result = await dialog.showOpenDialog({
      title: options?.title || 'Select File',
      defaultPath: options?.defaultPath,
      filters: options?.filters,
      properties: options?.multiSelect 
        ? ['openFile', 'multiSelections']
        : ['openFile'],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths;
  });
  
  // Save file dialog
  ipcMain.handle('fs:saveDialog', async (_event, options?: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | null> => {
    const result = await dialog.showSaveDialog({
      title: options?.title || 'Save File',
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });
    
    if (result.canceled || !result.filePath) {
      return null;
    }
    
    return result.filePath;
  });
  
  // Get app paths
  ipcMain.handle('fs:getPath', async (_event, name: 'home' | 'appData' | 'userData' | 'temp' | 'desktop' | 'documents' | 'downloads'): Promise<string> => {
    const { app } = await import('electron');
    return app.getPath(name);
  });
}
