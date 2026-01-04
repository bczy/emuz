/**
 * LaunchService - Handles game launching and emulator integration
 */

import { v4 as uuidv4 } from 'uuid';
import type { Game } from '../models/Game';
import type { Emulator } from '../models/Emulator';
import type { DatabaseAdapter } from '@emuz/database';
import type { EmulatorLauncher } from '@emuz/platform';
import type {
  ILaunchService,
  CreateEmulatorInput,
} from './types';

/**
 * Database row types
 */
interface EmulatorRow {
  id: string;
  name: string;
  platform_ids: string;
  executable_path: string | null;
  package_name: string | null;
  url_scheme: string | null;
  icon_path: string | null;
  command_template: string | null;
  core_path: string | null;
  is_default: number;
  is_installed: number;
  created_at: number;
  updated_at: number;
}

interface GameRow {
  id: string;
  platform_id: string;
  title: string;
  file_path: string;
  file_name: string;
  play_count: number;
  play_time: number;
  last_played_at: number | null;
}

/**
 * Convert database row to Emulator model
 */
function rowToEmulator(row: EmulatorRow): Emulator {
  return {
    id: row.id,
    name: row.name,
    platformIds: JSON.parse(row.platform_ids) as string[],
    executablePath: row.executable_path ?? undefined,
    packageName: row.package_name ?? undefined,
    urlScheme: row.url_scheme ?? undefined,
    iconPath: row.icon_path ?? undefined,
    commandTemplate: row.command_template ?? undefined,
    corePath: row.core_path ?? undefined,
    isDefault: Boolean(row.is_default),
    isInstalled: Boolean(row.is_installed),
    createdAt: new Date(row.created_at * 1000),
    updatedAt: new Date(row.updated_at * 1000),
  };
}

/**
 * LaunchService implementation
 */
export class LaunchService implements ILaunchService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly launcher: EmulatorLauncher
  ) {}

  /**
   * Get all emulators
   */
  async getEmulators(): Promise<Emulator[]> {
    const rows = await this.db.query<EmulatorRow>(
      'SELECT * FROM emulators ORDER BY name ASC'
    );
    return rows.map(rowToEmulator);
  }

  /**
   * Get an emulator by ID
   */
  async getEmulatorById(id: string): Promise<Emulator | null> {
    const rows = await this.db.query<EmulatorRow>(
      'SELECT * FROM emulators WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rowToEmulator(rows[0]) : null;
  }

  /**
   * Detect installed emulators on the system
   * Note: This method checks if known emulators from the database are installed
   * using the launcher's isInstalled method
   */
  async detectEmulators(): Promise<Emulator[]> {
    // Get all known emulators from database
    const allEmulators = await this.getEmulators();
    const installedEmulators: Emulator[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (const emulator of allEmulators) {
      // Build a config object to check installation status
      const config = {
        id: emulator.id,
        name: emulator.name,
        desktop: emulator.executablePath
          ? { executable: emulator.executablePath, args: [] }
          : undefined,
        android: emulator.packageName
          ? { packageName: emulator.packageName }
          : undefined,
        ios: emulator.urlScheme
          ? { urlScheme: emulator.urlScheme }
          : undefined,
      };

      try {
        const isInstalled = await this.launcher.isInstalled(config);
        
        if (isInstalled !== emulator.isInstalled) {
          // Update installation status in database
          await this.db.execute(
            `UPDATE emulators SET is_installed = ?, updated_at = ? WHERE id = ?`,
            [isInstalled ? 1 : 0, now, emulator.id]
          );
          emulator.isInstalled = isInstalled;
        }

        if (isInstalled) {
          installedEmulators.push(emulator);
        }
      } catch {
        // If check fails, keep existing status
        if (emulator.isInstalled) {
          installedEmulators.push(emulator);
        }
      }
    }

    return installedEmulators;
  }

  /**
   * Add a new emulator
   */
  async addEmulator(data: CreateEmulatorInput): Promise<Emulator> {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      `INSERT INTO emulators (id, name, platform_ids, executable_path, package_name, url_scheme, icon_path, command_template, core_path, is_default, is_installed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        JSON.stringify(data.platformIds),
        data.executablePath ?? null,
        data.packageName ?? null,
        data.urlScheme ?? null,
        data.iconPath ?? null,
        data.commandTemplate ?? null,
        data.corePath ?? null,
        0,
        1,
        now,
        now,
      ]
    );

    return {
      id,
      name: data.name,
      platformIds: data.platformIds,
      executablePath: data.executablePath,
      packageName: data.packageName,
      urlScheme: data.urlScheme,
      iconPath: data.iconPath,
      commandTemplate: data.commandTemplate,
      corePath: data.corePath,
      isDefault: false,
      isInstalled: true,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  /**
   * Update an emulator
   */
  async updateEmulator(id: string, data: Partial<Emulator>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.platformIds !== undefined) {
      updates.push('platform_ids = ?');
      params.push(JSON.stringify(data.platformIds));
    }
    if (data.executablePath !== undefined) {
      updates.push('executable_path = ?');
      params.push(data.executablePath ?? null);
    }
    if (data.packageName !== undefined) {
      updates.push('package_name = ?');
      params.push(data.packageName ?? null);
    }
    if (data.urlScheme !== undefined) {
      updates.push('url_scheme = ?');
      params.push(data.urlScheme ?? null);
    }
    if (data.commandTemplate !== undefined) {
      updates.push('command_template = ?');
      params.push(data.commandTemplate ?? null);
    }
    if (data.corePath !== undefined) {
      updates.push('core_path = ?');
      params.push(data.corePath ?? null);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = ?');
    params.push(Math.floor(Date.now() / 1000));
    params.push(id);

    await this.db.execute(
      `UPDATE emulators SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Delete an emulator
   */
  async deleteEmulator(id: string): Promise<void> {
    await this.db.execute('DELETE FROM emulators WHERE id = ?', [id]);
  }

  /**
   * Set the default emulator for a platform
   */
  async setDefaultEmulator(platformId: string, emulatorId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    // First, unset all defaults for this platform
    const allEmulators = await this.db.query<EmulatorRow>(
      `SELECT * FROM emulators WHERE platform_ids LIKE ?`,
      [`%"${platformId}"%`]
    );

    for (const emu of allEmulators) {
      await this.db.execute(
        'UPDATE emulators SET is_default = 0, updated_at = ? WHERE id = ?',
        [now, emu.id]
      );
    }

    // Set the new default
    await this.db.execute(
      'UPDATE emulators SET is_default = 1, updated_at = ? WHERE id = ?',
      [now, emulatorId]
    );
  }

  /**
   * Get the default emulator for a platform
   */
  async getDefaultEmulator(platformId: string): Promise<Emulator | null> {
    const rows = await this.db.query<EmulatorRow>(
      `SELECT * FROM emulators WHERE platform_ids LIKE ? AND is_default = 1 LIMIT 1`,
      [`%"${platformId}"%`]
    );

    if (rows.length > 0) {
      return rowToEmulator(rows[0]);
    }

    // Fallback to first available emulator for this platform
    const fallbackRows = await this.db.query<EmulatorRow>(
      `SELECT * FROM emulators WHERE platform_ids LIKE ? AND is_installed = 1 LIMIT 1`,
      [`%"${platformId}"%`]
    );

    return fallbackRows.length > 0 ? rowToEmulator(fallbackRows[0]) : null;
  }

  /**
   * Launch a game with the specified or default emulator
   */
  async launchGame(gameId: string, emulatorId?: string): Promise<void> {
    // Get the game
    const gameRows = await this.db.query<GameRow>(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    );

    if (gameRows.length === 0) {
      throw new Error(`Game not found: ${gameId}`);
    }

    const game = gameRows[0];

    // Get the emulator
    let emulator: Emulator | null = null;

    if (emulatorId) {
      emulator = await this.getEmulatorById(emulatorId);
    } else {
      emulator = await this.getDefaultEmulator(game.platform_id);
    }

    if (!emulator) {
      throw new Error(`No emulator found for platform: ${game.platform_id}`);
    }

    // Build and execute launch command using LaunchOptions interface
    const launchConfig = {
      romPath: game.file_path,
      emulatorPath: emulator.executablePath ?? '',
      args: emulator.commandTemplate
        ? this.parseCommandTemplate(emulator.commandTemplate, game.file_path, emulator.corePath)
        : undefined,
    };

    await this.launcher.launch(launchConfig);

    // Update play count and last played
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      'UPDATE games SET play_count = play_count + 1, last_played_at = ?, updated_at = ? WHERE id = ?',
      [now, now, gameId]
    );
  }

  /**
   * Build the launch command for a game and emulator
   */
  buildLaunchCommand(game: Game, emulator: Emulator): string {
    const template = emulator.commandTemplate ?? '{emulator} {rom}';

    return template
      .replace('{emulator}', emulator.executablePath ?? '')
      .replace('{rom}', game.filePath)
      .replace('{core}', emulator.corePath ?? '')
      .replace('{title}', game.title);
  }

  /**
   * Parse command template into arguments array
   */
  private parseCommandTemplate(
    template: string,
    romPath: string,
    corePath?: string
  ): string[] {
    const processed = template
      .replace('{rom}', romPath)
      .replace('{core}', corePath ?? '')
      .replace('{emulator}', ''); // Emulator path is passed separately

    // Split by spaces, handling quoted strings
    const args: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of processed) {
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          args.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args.filter(Boolean);
  }

  /**
   * Record a play session
   */
  async recordPlaySession(gameId: string, duration: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      'UPDATE games SET play_time = play_time + ?, last_played_at = ?, updated_at = ? WHERE id = ?',
      [duration, now, now, gameId]
    );
  }
}

/**
 * Create a new LaunchService instance
 */
export function createLaunchService(
  db: DatabaseAdapter,
  launcher: EmulatorLauncher
): ILaunchService {
  return new LaunchService(db, launcher);
}
