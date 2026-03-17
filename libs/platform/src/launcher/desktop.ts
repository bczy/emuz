/**
 * Desktop emulator launcher
 * Uses Node.js child_process to spawn emulator processes
 */

import { BaseLauncher, EmulatorLaunchConfig, LaunchOptions, LaunchResult } from './types';

type DesktopModules = {
  childProcess: typeof import('child_process');
  fs: typeof import('fs/promises');
};

/**
 * Desktop launcher using child_process
 *
 * Features:
 * - Process spawning with arguments
 * - Working directory support
 * - Environment variable injection
 * - Process ID tracking
 *
 * @example
 * ```typescript
 * const launcher = new DesktopLauncher();
 * const result = await launcher.launch({
 *   romPath: '/games/mario.nes',
 *   emulatorPath: '/usr/bin/retroarch',
 *   args: ['-L', '/cores/nestopia_libretro.so'],
 * });
 * ```
 */
export class DesktopLauncher extends BaseLauncher {
  private modules: DesktopModules | null = null;

  /**
   * Lazy-load Node.js modules
   */
  private async getModules(): Promise<DesktopModules> {
    if (this.modules) return this.modules;
    const modules: DesktopModules = {
      childProcess: await import('child_process'),
      fs: await import('fs/promises'),
    };
    this.modules = modules;
    return modules;
  }

  /**
   * Launch an emulator with a ROM
   */
  async launch(options: LaunchOptions): Promise<LaunchResult> {
    const { childProcess } = await this.getModules();

    try {
      // Check if emulator exists
      const exists = await this.fileExists(options.emulatorPath);
      if (!exists) {
        return this.notFoundResult();
      }

      // Build command arguments
      const args = options.args
        ? this.replaceArgs(options.args, options.romPath)
        : [options.romPath];

      // Spawn options
      const spawnOptions: import('child_process').SpawnOptions = {
        detached: !options.waitForExit,
        stdio: options.waitForExit ? 'inherit' : 'ignore',
        cwd: options.workingDirectory,
        env: options.env ? { ...process.env, ...options.env } : process.env,
      };

      // Spawn the emulator process
      const child = childProcess.spawn(options.emulatorPath, args, spawnOptions);

      // If not waiting, unref to allow parent to exit
      if (!options.waitForExit) {
        child.unref();
      }

      // Return success with PID
      return {
        status: 'success',
        pid: child.pid,
        metadata: {
          command: options.emulatorPath,
          args,
        },
      };
    } catch (error) {
      return this.errorResult(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Launch using a pre-configured emulator config
   */
  async launchWithConfig(config: EmulatorLaunchConfig, romPath: string): Promise<LaunchResult> {
    if (!config.desktop) {
      return this.errorResult('No desktop configuration for this emulator');
    }

    return this.launch({
      romPath,
      emulatorPath: config.desktop.executable,
      args: config.desktop.args,
      workingDirectory: config.desktop.workingDir,
    });
  }

  /**
   * Check if an emulator is installed
   */
  async isInstalled(config: EmulatorLaunchConfig): Promise<boolean> {
    if (!config.desktop) {
      return false;
    }

    return this.fileExists(config.desktop.executable);
  }

  /**
   * Check if a file exists
   */
  private async fileExists(path: string): Promise<boolean> {
    const { fs } = await this.getModules();
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a desktop launcher
 */
export function createDesktopLauncher(): DesktopLauncher {
  return new DesktopLauncher();
}
