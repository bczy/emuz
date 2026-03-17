/**
 * Mobile database adapter
 * Uses react-native-sqlite-storage for SQLite operations on mobile platforms
 *
 * Note: This adapter is designed for React Native (Android/iOS)
 * The react-native-sqlite-storage package must be installed and linked
 */

import { BaseDatabaseAdapter, DatabaseConfig } from './types';

/**
 * Type definitions for react-native-sqlite-storage
 * These avoid direct imports to allow this file to be included in builds
 * where the native module is not available
 */
interface SQLiteDatabase {
  executeSql(sql: string, params?: unknown[]): Promise<[SQLiteResultSet]>;
  transaction(fn: (tx: SQLiteTransaction) => void): Promise<SQLiteTransaction>;
  close(): Promise<void>;
}

interface SQLiteTransaction {
  executeSql(
    sql: string,
    params?: unknown[],
    success?: (tx: SQLiteTransaction, results: SQLiteResultSet) => void,
    error?: (tx: SQLiteTransaction, error: Error) => boolean
  ): void;
}

interface SQLiteResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item(index: number): unknown;
    raw(): unknown[];
  };
}

/**
 * Mobile SQLite adapter using react-native-sqlite-storage
 *
 * Features:
 * - Async/Promise-based API
 * - Works on both Android and iOS
 * - Foreign key constraint enforcement
 * - Transaction support
 *
 * @example
 * ```typescript
 * const adapter = new MobileDatabaseAdapter({
 *   path: 'emuz.db',
 *   foreignKeys: true,
 * });
 * await adapter.open();
 * const games = await adapter.query<GameRow>('SELECT * FROM games');
 * await adapter.close();
 * ```
 */
export class MobileDatabaseAdapter extends BaseDatabaseAdapter {
  private db: SQLiteDatabase | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  /**
   * Open the database connection
   * Dynamically imports react-native-sqlite-storage
   */
  async open(): Promise<void> {
    if (this.connected && this.db) {
      return;
    }

    try {
      // Dynamic import for React Native
      // @ts-expect-error - react-native-sqlite-storage types not available at compile time
      const SQLite = await import('react-native-sqlite-storage');

      // Enable promise-based API
      SQLite.enablePromise(true);

      // Open database
      this.db = await SQLite.openDatabase({
        name: this.config.path,
        location: 'default',
      });

      // Enable foreign key constraints
      if (this.config.foreignKeys && this.db) {
        await this.db.executeSql('PRAGMA foreign_keys = ON');
      }

      // Note: WAL mode may not be fully supported on all mobile platforms
      // React Native SQLite typically handles this automatically

      this.connected = true;
    } catch (error) {
      throw new Error(
        `Failed to open database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.connected = false;
    }
  }

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE, CREATE, etc.)
   */
  async execute(sql: string, params?: unknown[]): Promise<void> {
    const db = this.ensureConnected();

    try {
      await db.executeSql(sql, params || []);
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
    const db = this.ensureConnected();

    try {
      const [results] = await db.executeSql(sql, params || []);
      const rows: T[] = [];

      for (let i = 0; i < results.rows.length; i++) {
        rows.push(results.rows.item(i) as T);
      }

      return rows;
    } catch (error) {
      throw new Error(
        `Failed to query: ${error instanceof Error ? error.message : String(error)}\nSQL: ${sql}`
      );
    }
  }

  /**
   * Run multiple statements in a transaction
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    this.ensureConnected();

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
  private ensureConnected(): SQLiteDatabase {
    const db = this.db;
    if (!this.connected || !db) {
      throw new Error('Database is not connected. Call open() first.');
    }
    return db;
  }
}

/**
 * Create a mobile database adapter
 */
export function createMobileAdapter(config: DatabaseConfig): MobileDatabaseAdapter {
  return new MobileDatabaseAdapter(config);
}
