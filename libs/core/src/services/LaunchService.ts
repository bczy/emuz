/**
 * LaunchService - Handles game launching and emulator integration
 */

import { v4 as uuidv4 } from 'uuid';
import type { Game } from '../models/Game';
import type { Emulator } from '../models/Emulator';
import type { DatabaseAdapter } from '@emuz/database';
import type { ILaunchService, CreateEmulatorInput, PlaySession } from './types';
import { toDate, buildUpdateQuery } from '../utils/db';

/**
 * Database row types
 */
interface EmulatorRow {
  id: string;
  name: string;
  /** JSON-encoded array of platform IDs - stored as `platforms` in the DB rows from tests */
  platforms: string;
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

interface PlaySessionRow {
  id: string;
  game_id: string;
  started_at: number;
  ended_at: number | null;
  duration: number;
}

/**
 * Convert database row to Emulator model
 */
function rowToEmulator(row: EmulatorRow): Emulator {
  return {
    id: row.id,
    name: row.name,
    platforms: (() => {
      try {
        const parsed = JSON.parse(row.platforms);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    })(),
    executablePath: row.executable_path ?? undefined,
    packageName: row.package_name ?? undefined,
    urlScheme: row.url_scheme ?? undefined,
    iconPath: row.icon_path ?? undefined,
    commandTemplate: row.command_template ?? undefined,
    corePath: row.core_path ?? undefined,
    isDefault: Boolean(row.is_default),
    isInstalled: Boolean(row.is_installed),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

/**
 * Convert database row to PlaySession model
 */
function rowToPlaySession(row: PlaySessionRow): PlaySession {
  return {
    id: row.id,
    gameId: row.game_id,
    startedAt: new Date(row.started_at * 1000),
    endedAt: row.ended_at ? new Date(row.ended_at * 1000) : undefined,
    duration: row.duration,
  };
}

/**
 * Launcher interface (subset used by this service)
 */
interface LauncherInterface {
  launch(config: {
    romPath: string;
    emulatorPath: string;
    args?: string[];
  }): Promise<{ success: boolean }>;
  isAvailable(path: string): boolean;
  detectEmulators(): Promise<Array<{ name: string; path: string }>>;
}

/**
 * LaunchService implementation
 */
export class LaunchService implements ILaunchService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly launcher: LauncherInterface
  ) {}

  /**
   * Get all emulators, optionally filtered by platform
   */
  async getEmulators(options?: { platformId?: string }): Promise<Emulator[]> {
    if (options?.platformId) {
      const rows = await this.db.query<EmulatorRow>(
        `SELECT * FROM emulators WHERE platforms LIKE ? ORDER BY name ASC`,
        [`%"${options.platformId}"%`]
      );
      return rows.map(rowToEmulator);
    }

    const rows = await this.db.query<EmulatorRow>('SELECT * FROM emulators ORDER BY name ASC');
    return rows.map(rowToEmulator);
  }

  /**
   * Get an emulator by ID
   */
  async getEmulatorById(id: string): Promise<Emulator | null> {
    const rows = await this.db.query<EmulatorRow>('SELECT * FROM emulators WHERE id = ?', [id]);
    return rows.length > 0 ? rowToEmulator(rows[0]) : null;
  }

  /**
   * Detect installed emulators on the system
   */
  async detectEmulators(): Promise<Array<{ name: string; path: string }>> {
    return this.launcher.detectEmulators();
  }

  /**
   * Add a new emulator
   */
  async addEmulator(data: CreateEmulatorInput): Promise<Emulator> {
    // Validate that the emulator path exists
    if (data.executablePath && !this.launcher.isAvailable(data.executablePath)) {
      throw new Error(`Emulator not found at path: ${data.executablePath}`);
    }

    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const platforms = data.platforms;

    await this.db.execute(
      `INSERT INTO emulators (id, name, platforms, executable_path, package_name, url_scheme, icon_path, command_template, core_path, is_default, is_installed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        JSON.stringify(platforms),
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

    // Fetch the newly created emulator from DB
    const rows = await this.db.query<EmulatorRow>('SELECT * FROM emulators WHERE id = ?', [id]);

    if (rows.length > 0) {
      return rowToEmulator(rows[0]);
    }

    return {
      id,
      name: data.name,
      platforms,
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
    const fields: Array<[string, string | number | null]> = [
      ...(data.name !== undefined ? [['name', data.name] as [string, string]] : []),
      ...(data.platforms !== undefined
        ? [['platforms', JSON.stringify(data.platforms)] as [string, string]]
        : []),
      ...(data.executablePath !== undefined
        ? [['executable_path', data.executablePath ?? null] as [string, string | null]]
        : []),
      ...(data.packageName !== undefined
        ? [['package_name', data.packageName ?? null] as [string, string | null]]
        : []),
      ...(data.urlScheme !== undefined
        ? [['url_scheme', data.urlScheme ?? null] as [string, string | null]]
        : []),
      ...(data.commandTemplate !== undefined
        ? [['command_template', data.commandTemplate ?? null] as [string, string | null]]
        : []),
      ...(data.corePath !== undefined
        ? [['core_path', data.corePath ?? null] as [string, string | null]]
        : []),
    ];

    const query = buildUpdateQuery(fields);
    if (!query) return;

    await this.db.execute(`UPDATE emulators SET ${query.setClauses} WHERE id = ?`, [
      ...query.params,
      id,
    ]);
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
  async setDefaultEmulator(emulatorId: string, platformId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    await this.db.transaction(async () => {
      // Unset all defaults for this platform in one query
      await this.db.execute(
        `UPDATE emulators SET is_default = 0, updated_at = ? WHERE platforms LIKE ?`,
        [now, `%"${platformId}"%`]
      );
      // Set the new default
      await this.db.execute('UPDATE emulators SET is_default = 1, updated_at = ? WHERE id = ?', [
        now,
        emulatorId,
      ]);
    });
  }

  /**
   * Get the default emulator for a platform
   */
  async getDefaultEmulator(platformId: string): Promise<Emulator | null> {
    const rows = await this.db.query<EmulatorRow>(
      `SELECT * FROM emulators WHERE platforms LIKE ? AND is_default = 1 LIMIT 1`,
      [`%"${platformId}"%`]
    );

    if (rows.length > 0) {
      return rowToEmulator(rows[0]);
    }

    return null;
  }

  /**
   * Launch a game with the specified or default emulator
   */
  async launchGame(game: Game, emulatorId?: string): Promise<{ success: boolean }> {
    let emulator: Emulator | null = null;

    if (emulatorId) {
      const rows = await this.db.query<EmulatorRow>('SELECT * FROM emulators WHERE id = ?', [
        emulatorId,
      ]);
      emulator = rows.length > 0 ? rowToEmulator(rows[0]) : null;
    } else {
      emulator = await this.getDefaultEmulator(game.platformId);
    }

    if (!emulator) {
      throw new Error('No emulator available');
    }

    // Build launch config
    const launchConfig = {
      romPath: game.filePath,
      emulatorPath: emulator.executablePath ?? '',
      args: emulator.commandTemplate
        ? this.parseCommandTemplate(emulator.commandTemplate, game.filePath, emulator.corePath)
        : undefined,
    };

    const result = await this.launcher.launch(launchConfig);

    // Record play session start
    const sessionId = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    await this.db.execute(
      `INSERT INTO play_sessions (id, game_id, started_at, duration) VALUES (?, ?, ?, ?)`,
      [sessionId, game.id, now, 0]
    );

    return result;
  }

  /**
   * Build the launch command string for a game and emulator
   * (legacy method kept for compatibility)
   */
  buildLaunchCommand(game: Game, emulator: Emulator): string {
    return this.buildCommand(emulator, { romPath: game.filePath, core: emulator.corePath });
  }

  /**
   * Build the launch command from a template
   */
  buildCommand(emulator: Emulator, vars: { romPath: string; core?: string }): string {
    const template = emulator.commandTemplate ?? '{executable} "{rom}"';

    let cmd = template
      .replace('{executable}', emulator.executablePath ?? '')
      .replace('{rom}', vars.romPath);

    if (vars.core !== undefined) {
      cmd = cmd.replace('{core}', vars.core);
    } else {
      cmd = cmd.replace('{core}', '');
    }

    return cmd;
  }

  /**
   * Parse command template into arguments array
   */
  private parseCommandTemplate(template: string, romPath: string, corePath?: string): string[] {
    const processed = template
      .replace('{rom}', romPath)
      .replace('{core}', corePath ?? '')
      .replace('{executable}', '');

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
   * Record a play session (updates game stats)
   */
  async recordPlaySession(gameId: string, duration: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    await this.db.execute(
      'UPDATE games SET play_time = play_time + ?, last_played_at = ?, updated_at = ? WHERE id = ?',
      [duration, now, now, gameId]
    );
  }

  /**
   * End a play session and update game play time
   */
  async endPlaySession(sessionId: string, duration: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    // Update the session record
    await this.db.execute('UPDATE play_sessions SET ended_at = ?, duration = ? WHERE id = ?', [
      now,
      duration,
      sessionId,
    ]);

    // Update game play time
    await this.db.execute(
      `UPDATE games SET play_time = play_time + ? WHERE id = (SELECT game_id FROM play_sessions WHERE id = ?)`,
      [duration, sessionId]
    );
  }

  /**
   * Get play history for a game
   */
  async getPlayHistory(gameId: string, options?: { limit?: number }): Promise<PlaySession[]> {
    const limit = options?.limit ?? 50;

    const rows = await this.db.query<PlaySessionRow>(
      `SELECT * FROM play_sessions WHERE game_id = ? ORDER BY started_at DESC LIMIT ?`,
      [gameId, limit]
    );

    return rows.map(rowToPlaySession);
  }
}

/**
 * Create a new LaunchService instance
 */
export function createLaunchService(
  db: DatabaseAdapter,
  launcher: LauncherInterface
): ILaunchService {
  return new LaunchService(db, launcher);
}
