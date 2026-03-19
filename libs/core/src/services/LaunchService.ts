/**
 * LaunchService - Handles game launching and emulator integration
 *
 * Migrated to use the @emuz/storage flat-file engine (FlatDb).
 * No raw SQL strings, no legacy DatabaseAdapter.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Game } from '../models/Game';
import type { Emulator } from '../models/Emulator';
import type { FlatDb, EmulatorRow, PlaySessionRow } from '@emuz/storage';
import type { ILaunchService, CreateEmulatorInput, PlaySession } from './types';

/**
 * Convert FlatDb EmulatorRow to Emulator model
 */
function rowToEmulator(row: EmulatorRow): Emulator {
  return {
    id: row.id,
    name: row.name,
    platforms: row.platform_ids,
    executablePath: row.executable_path ?? undefined,
    packageName: row.package_name ?? undefined,
    urlScheme: row.url_scheme ?? undefined,
    iconPath: row.icon_path ?? undefined,
    commandTemplate: row.command_template ?? undefined,
    corePath: row.core_path ?? undefined,
    isDefault: row.is_default,
    isInstalled: row.is_installed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert FlatDb PlaySessionRow to PlaySession model
 */
function rowToPlaySession(row: PlaySessionRow): PlaySession {
  return {
    id: row.id,
    gameId: row.game_id,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
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
 * LaunchService implementation using the @emuz/storage FlatDb engine
 */
export class LaunchService implements ILaunchService {
  constructor(
    private readonly db: FlatDb,
    private readonly launcher: LauncherInterface
  ) {}

  /**
   * Get all emulators, optionally filtered by platform
   */
  async getEmulators(options?: { platformId?: string }): Promise<Emulator[]> {
    const all = this.db.emulators.all();

    if (options?.platformId) {
      const { platformId } = options;
      return all
        .filter((e) => e.platform_ids.includes(platformId))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(rowToEmulator);
    }

    return all.sort((a, b) => a.name.localeCompare(b.name)).map(rowToEmulator);
  }

  /**
   * Get an emulator by ID
   */
  async getEmulatorById(id: string): Promise<Emulator | null> {
    const row = this.db.emulators.findById(id);
    return row ? rowToEmulator(row) : null;
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
    const now = new Date();

    const newRow: EmulatorRow = {
      id,
      name: data.name,
      platform_ids: data.platforms,
      executable_path: data.executablePath ?? null,
      package_name: data.packageName ?? null,
      url_scheme: data.urlScheme ?? null,
      icon_path: data.iconPath ?? null,
      command_template: data.commandTemplate ?? null,
      core_path: data.corePath ?? null,
      is_default: false,
      is_installed: true,
      created_at: now,
      updated_at: now,
    };

    this.db.emulators.insert(newRow);
    await this.db.flush();

    return rowToEmulator(newRow);
  }

  /**
   * Update an emulator
   */
  async updateEmulator(id: string, data: Partial<Emulator>): Promise<void> {
    const patch: Partial<EmulatorRow> = { updated_at: new Date() };

    if (data.name !== undefined) patch.name = data.name;
    if (data.platforms !== undefined) patch.platform_ids = data.platforms;
    if (data.executablePath !== undefined) patch.executable_path = data.executablePath ?? null;
    if (data.packageName !== undefined) patch.package_name = data.packageName ?? null;
    if (data.urlScheme !== undefined) patch.url_scheme = data.urlScheme ?? null;
    if (data.commandTemplate !== undefined) patch.command_template = data.commandTemplate ?? null;
    if (data.corePath !== undefined) patch.core_path = data.corePath ?? null;

    this.db.emulators.update(id, patch);
    await this.db.flush();
  }

  /**
   * Delete an emulator
   */
  async deleteEmulator(id: string): Promise<void> {
    this.db.emulators.delete(id);
    await this.db.flush();
  }

  /**
   * Set the default emulator for a platform
   */
  async setDefaultEmulator(emulatorId: string, platformId: string): Promise<void> {
    const now = new Date();

    // Unset all defaults for this platform
    this.db.emulators
      .find((e) => e.platform_ids.includes(platformId))
      .forEach((e) => this.db.emulators.update(e.id, { is_default: false, updated_at: now }));

    // Set the new default
    this.db.emulators.update(emulatorId, { is_default: true, updated_at: now });
    await this.db.flush();
  }

  /**
   * Get the default emulator for a platform
   */
  async getDefaultEmulator(platformId: string): Promise<Emulator | null> {
    const row = this.db.emulators.findOne(
      (e) => e.platform_ids.includes(platformId) && e.is_default
    );
    return row ? rowToEmulator(row) : null;
  }

  /**
   * Launch a game with the specified or default emulator
   */
  async launchGame(game: Game, emulatorId?: string): Promise<{ success: boolean }> {
    let emulator: Emulator | null = null;

    if (emulatorId) {
      emulator = await this.getEmulatorById(emulatorId);
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
    this.db.playSessions.insert({
      id: sessionId,
      game_id: game.id,
      started_at: new Date(),
      ended_at: null,
      duration: 0,
    });
    await this.db.flush();

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
    const game = this.db.games.findById(gameId);
    if (game) {
      this.db.games.update(gameId, {
        play_time: game.play_time + duration,
        last_played_at: new Date(),
        updated_at: new Date(),
      });
      await this.db.flush();
    }
  }

  /**
   * End a play session and update game play time
   */
  async endPlaySession(sessionId: string, duration: number): Promise<void> {
    const session = this.db.playSessions.findById(sessionId);
    if (session) {
      const game = this.db.games.findById(session.game_id);
      if (game) {
        this.db.games.update(game.id, {
          play_time: game.play_time + duration,
          play_count: game.play_count + 1,
          last_played_at: new Date(),
          updated_at: new Date(),
        });
      }
      this.db.playSessions.update(sessionId, { ended_at: new Date(), duration });
      await this.db.flush();
    }
  }

  /**
   * Get play history for a game
   */
  async getPlayHistory(gameId: string, options?: { limit?: number }): Promise<PlaySession[]> {
    const limit = options?.limit ?? 50;

    return this.db.playSessions
      .all()
      .filter((s) => s.game_id === gameId)
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())
      .slice(0, limit)
      .map(rowToPlaySession);
  }
}

/**
 * Create a new LaunchService instance
 */
export function createLaunchService(db: FlatDb, launcher: LauncherInterface): ILaunchService {
  return new LaunchService(db, launcher);
}
