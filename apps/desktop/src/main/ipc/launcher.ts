/**
 * Launcher IPC Handlers
 * Exposes game and emulator launch operations to the renderer process
 */

import { ipcMain, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Track running processes
const runningProcesses = new Map<string, ChildProcess>();

/**
 * Emulator executable info
 */
interface EmulatorInfo {
  id: string;
  name: string;
  executable: string;
  platforms: string[];
}

/**
 * Known emulator paths by platform
 */
const KNOWN_EMULATORS: Record<string, EmulatorInfo[]> = {
  linux: [
    { id: 'retroarch', name: 'RetroArch', executable: 'retroarch', platforms: ['nes', 'snes', 'gba', 'gb', 'gbc', 'genesis', 'n64', 'psx'] },
    { id: 'dolphin', name: 'Dolphin', executable: 'dolphin-emu', platforms: ['gc', 'wii'] },
    { id: 'pcsx2', name: 'PCSX2', executable: 'pcsx2-qt', platforms: ['ps2'] },
    { id: 'rpcs3', name: 'RPCS3', executable: 'rpcs3', platforms: ['ps3'] },
    { id: 'ppsspp', name: 'PPSSPP', executable: 'ppsspp', platforms: ['psp'] },
    { id: 'desmume', name: 'DeSmuME', executable: 'desmume', platforms: ['nds'] },
    { id: 'melonds', name: 'melonDS', executable: 'melonDS', platforms: ['nds'] },
    { id: 'citra', name: 'Citra', executable: 'citra-qt', platforms: ['3ds'] },
    { id: 'yuzu', name: 'Yuzu', executable: 'yuzu', platforms: ['switch'] },
    { id: 'ryujinx', name: 'Ryujinx', executable: 'Ryujinx', platforms: ['switch'] },
    { id: 'mame', name: 'MAME', executable: 'mame', platforms: ['arcade'] },
    { id: 'dosbox', name: 'DOSBox', executable: 'dosbox', platforms: ['dos'] },
    { id: 'scummvm', name: 'ScummVM', executable: 'scummvm', platforms: ['scummvm'] },
  ],
  darwin: [
    { id: 'retroarch', name: 'RetroArch', executable: '/Applications/RetroArch.app/Contents/MacOS/RetroArch', platforms: ['nes', 'snes', 'gba', 'gb', 'gbc', 'genesis', 'n64', 'psx'] },
    { id: 'dolphin', name: 'Dolphin', executable: '/Applications/Dolphin.app/Contents/MacOS/Dolphin', platforms: ['gc', 'wii'] },
    { id: 'openemu', name: 'OpenEmu', executable: '/Applications/OpenEmu.app/Contents/MacOS/OpenEmu', platforms: ['nes', 'snes', 'gba', 'gb', 'gbc', 'genesis', 'n64', 'psx', 'nds'] },
    { id: 'ppsspp', name: 'PPSSPP', executable: '/Applications/PPSSPP.app/Contents/MacOS/PPSSPP', platforms: ['psp'] },
  ],
  win32: [
    { id: 'retroarch', name: 'RetroArch', executable: 'retroarch.exe', platforms: ['nes', 'snes', 'gba', 'gb', 'gbc', 'genesis', 'n64', 'psx'] },
    { id: 'dolphin', name: 'Dolphin', executable: 'Dolphin.exe', platforms: ['gc', 'wii'] },
    { id: 'pcsx2', name: 'PCSX2', executable: 'pcsx2-qt.exe', platforms: ['ps2'] },
    { id: 'rpcs3', name: 'RPCS3', executable: 'rpcs3.exe', platforms: ['ps3'] },
    { id: 'ppsspp', name: 'PPSSPP', executable: 'PPSSPPWindows64.exe', platforms: ['psp'] },
    { id: 'desmume', name: 'DeSmuME', executable: 'DeSmuME.exe', platforms: ['nds'] },
    { id: 'melonds', name: 'melonDS', executable: 'melonDS.exe', platforms: ['nds'] },
    { id: 'citra', name: 'Citra', executable: 'citra-qt.exe', platforms: ['3ds'] },
    { id: 'yuzu', name: 'Yuzu', executable: 'yuzu.exe', platforms: ['switch'] },
    { id: 'ryujinx', name: 'Ryujinx', executable: 'Ryujinx.exe', platforms: ['switch'] },
    { id: 'mame', name: 'MAME', executable: 'mame64.exe', platforms: ['arcade'] },
    { id: 'dosbox', name: 'DOSBox', executable: 'dosbox.exe', platforms: ['dos'] },
  ],
};

/**
 * Check if an executable exists in PATH
 */
async function findExecutable(name: string): Promise<string | null> {
  const platform = os.platform();
  
  // If it's an absolute path, check if it exists
  if (path.isAbsolute(name)) {
    try {
      await fs.promises.access(name, fs.constants.X_OK);
      return name;
    } catch {
      return null;
    }
  }
  
  // Search in PATH
  const pathEnv = process.env.PATH || '';
  const pathSeparator = platform === 'win32' ? ';' : ':';
  const paths = pathEnv.split(pathSeparator);
  
  const extensions = platform === 'win32' 
    ? ['', '.exe', '.cmd', '.bat', '.com']
    : [''];
  
  for (const dir of paths) {
    for (const ext of extensions) {
      const fullPath = path.join(dir, name + ext);
      try {
        await fs.promises.access(fullPath, fs.constants.X_OK);
        return fullPath;
      } catch {
        // Continue searching
      }
    }
  }
  
  return null;
}

/**
 * Register all launcher IPC handlers
 */
export function registerLauncherHandlers(): void {
  // Detect installed emulators
  ipcMain.handle('launcher:detectEmulators', async (): Promise<{
    id: string;
    name: string;
    path: string;
    platforms: string[];
  }[]> => {
    const platform = os.platform() as 'linux' | 'darwin' | 'win32';
    const knownEmulators = KNOWN_EMULATORS[platform] || [];
    const detectedEmulators: { id: string; name: string; path: string; platforms: string[] }[] = [];
    
    for (const emulator of knownEmulators) {
      const execPath = await findExecutable(emulator.executable);
      if (execPath) {
        detectedEmulators.push({
          id: emulator.id,
          name: emulator.name,
          path: execPath,
          platforms: emulator.platforms,
        });
      }
    }
    
    return detectedEmulators;
  });
  
  // Launch a game with an emulator
  ipcMain.handle('launcher:launchGame', async (_event, options: {
    gameId: string;
    romPath: string;
    emulatorPath: string;
    args?: string[];
    cwd?: string;
  }): Promise<{ pid: number }> => {
    const { gameId, romPath, emulatorPath, args = [], cwd } = options;
    
    // Check if ROM exists
    try {
      await fs.promises.access(romPath);
    } catch {
      throw new Error(`ROM file not found: ${romPath}`);
    }
    
    // Check if emulator exists
    const emulatorExe = await findExecutable(emulatorPath);
    if (!emulatorExe) {
      throw new Error(`Emulator not found: ${emulatorPath}`);
    }
    
    // Build command arguments
    const cmdArgs = [...args, romPath];
    
    console.log(`Launching: ${emulatorExe} ${cmdArgs.join(' ')}`);
    
    // Spawn the emulator process
    const child = spawn(emulatorExe, cmdArgs, {
      cwd: cwd || path.dirname(romPath),
      detached: true,
      stdio: 'ignore',
    });
    
    // Unref to allow the main process to exit independently
    child.unref();
    
    // Track the process
    runningProcesses.set(gameId, child);
    
    // Clean up when process exits
    child.on('exit', () => {
      runningProcesses.delete(gameId);
    });
    
    return { pid: child.pid || 0 };
  });
  
  // Check if a game is running
  ipcMain.handle('launcher:isRunning', async (_event, gameId: string): Promise<boolean> => {
    const process = runningProcesses.get(gameId);
    if (!process) return false;
    
    // Check if process is still running
    try {
      // Sending signal 0 checks if process exists
      process.kill(0);
      return true;
    } catch {
      runningProcesses.delete(gameId);
      return false;
    }
  });
  
  // Stop a running game
  ipcMain.handle('launcher:stopGame', async (_event, gameId: string): Promise<void> => {
    const process = runningProcesses.get(gameId);
    if (process) {
      process.kill();
      runningProcesses.delete(gameId);
    }
  });
  
  // Get list of running games
  ipcMain.handle('launcher:getRunningGames', async (): Promise<string[]> => {
    return Array.from(runningProcesses.keys());
  });
  
  // Launch with custom command
  ipcMain.handle('launcher:launchCommand', async (_event, options: {
    command: string;
    args: string[];
    cwd?: string;
    env?: Record<string, string>;
  }): Promise<{ pid: number }> => {
    const { command, args, cwd, env } = options;
    
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      detached: true,
      stdio: 'ignore',
    });
    
    child.unref();
    
    return { pid: child.pid || 0 };
  });
  
  // Open file with default application
  ipcMain.handle('launcher:openFile', async (_event, filePath: string): Promise<void> => {
    await shell.openPath(filePath);
  });
  
  // Open URL in default browser
  ipcMain.handle('launcher:openUrl', async (_event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });
  
  // Show file in folder
  ipcMain.handle('launcher:showInFolder', async (_event, filePath: string): Promise<void> => {
    shell.showItemInFolder(filePath);
  });
  
  // Get platform-specific emulator command template
  ipcMain.handle('launcher:getCommandTemplate', async (_event, emulatorId: string): Promise<{
    command: string;
    args: string[];
  } | null> => {
    // Common command templates for popular emulators
    const templates: Record<string, { command: string; args: string[] }> = {
      retroarch: { command: 'retroarch', args: ['-L', '{core}', '{rom}'] },
      dolphin: { command: 'dolphin-emu', args: ['--exec={rom}'] },
      pcsx2: { command: 'pcsx2-qt', args: ['{rom}'] },
      ppsspp: { command: 'ppsspp', args: ['{rom}'] },
      desmume: { command: 'desmume', args: ['{rom}'] },
      melonds: { command: 'melonDS', args: ['{rom}'] },
      citra: { command: 'citra-qt', args: ['{rom}'] },
      mame: { command: 'mame', args: ['{rom}'] },
    };
    
    return templates[emulatorId] || null;
  });
}
