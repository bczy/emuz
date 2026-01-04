/**
 * Desktop database adapter
 * Uses better-sqlite3 for synchronous SQLite operations
 * 
 * Note: better-sqlite3 is a native module that must be installed
 * on desktop platforms (macOS, Linux, Windows)
 */

import { BaseDatabaseAdapter, DatabaseConfig } from './types';

/**
 * Type definition for better-sqlite3 database instance
 * This avoids importing the module directly, allowing
 * this file to be imported on platforms where better-sqlite3
 * is not available (the actual usage will be conditional)
 */
interface BetterSqlite3Database {
  exec(sql: string): void;
  prepare(sql: string): BetterSqlite3Statement;
  transaction<T>(fn: () => T): () => T;
  close(): void;
  pragma(pragma: string, options?: { simple?: boolean }): unknown;
}

interface BetterSqlite3Statement {
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  bind(...params: unknown[]): BetterSqlite3Statement;
}

/**
 * Desktop SQLite adapter using better-sqlite3
 * 
 * Features:
 * - Synchronous API (wrapped in async for interface compatibility)
 * - Write-ahead logging (WAL) support
 * - Foreign key constraint enforcement
 * - Transaction support
 * 
 * @example
 * ```typescript
 * const adapter = new DesktopDatabaseAdapter({
 *   path: './emuz.db',
 *   wal: true,
 *   foreignKeys: true,
 * });
 * await adapter.open();
 * const games = await adapter.query<GameRow>('SELECT * FROM games');
 * await adapter.close();
 * ```
 */
export class DesktopDatabaseAdapter extends BaseDatabaseAdapter {
  private db: BetterSqlite3Database | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  /**
   * Open the database connection
   * Dynamically imports better-sqlite3 to allow conditional usage
   */
  async open(): Promise<void> {
    if (this.connected && this.db) {
      return;
    }

    try {
      // Dynamic import to avoid bundling issues on non-desktop platforms
      const Database = await import('better-sqlite3').then(m => m.default);
      this.db = new Database(this.config.path) as BetterSqlite3Database;

      // Enable WAL mode for better concurrency
      if (this.config.wal) {
        this.db.pragma('journal_mode = WAL');
      }

      // Enable foreign key constraints
      if (this.config.foreignKeys) {
        this.db.pragma('foreign_keys = ON');
      }

      this.connected = true;
    } catch (error) {
      throw new Error(
        `Failed to open database at ${this.config.path}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.connected = false;
    }
  }

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE, CREATE, etc.)
   */
  async execute(sql: string, params?: unknown[]): Promise<void> {
    this.ensureConnected();

    try {
      if (params && params.length > 0) {
        const stmt = this.db!.prepare(sql);
        stmt.run(...params);
      } else {
        this.db!.exec(sql);
      }
    } catch (error) {
      throw new Error(
        `Failed to execute SQL: ${error instanceof Error ? error.message : String(error)}\nSQL: ${sql}`
      );
    }
  }

  /**
   * Execute a SQL query and return all results
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    this.ensureConnected();

    try {
      const stmt = this.db!.prepare(sql);
      const results = params && params.length > 0 
        ? stmt.all(...params) 
        : stmt.all();
      return results as T[];
    } catch (error) {
      throw new Error(
        `Failed to query: ${error instanceof Error ? error.message : String(error)}\nSQL: ${sql}`
      );
    }
  }

  /**
   * Execute a SQL query and return a single result
   */
  override async queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
    this.ensureConnected();

    try {
      const stmt = this.db!.prepare(sql);
      const result = params && params.length > 0 
        ? stmt.get(...params) 
        : stmt.get();
      return (result as T) || null;
    } catch (error) {
      throw new Error(
        `Failed to query: ${error instanceof Error ? error.message : String(error)}\nSQL: ${sql}`
      );
    }
  }

  /**
   * Run multiple statements in a transaction
   * better-sqlite3 transactions are synchronous but we wrap them async
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    this.ensureConnected();

    // better-sqlite3 uses synchronous transactions
    // We need to handle async operations within the transaction
    await this.execute('BEGIN TRANSACTION');
    
    try {
      const result = await fn();
      await this.execute('COMMIT');
      return result;
    } catch (error) {
      await this.execute('ROLLBACK');
      throw error;
    }
  }

  /**
   * Ensure the database is connected before operations
   */
  private ensureConnected(): void {
    if (!this.connected || !this.db) {
      throw new Error('Database is not connected. Call open() first.');
    }
  }
}

/**
 * Create a desktop database adapter
 */
export function createDesktopAdapter(config: DatabaseConfig): DesktopDatabaseAdapter {
  return new DesktopDatabaseAdapter(config);
}
