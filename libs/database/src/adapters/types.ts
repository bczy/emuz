/**
 * @deprecated Use the Drizzle ORM instance (`DrizzleDb`) from `@emuz/database/schema` instead.
 *
 * This interface is retained as a compatibility shim during the transition to Drizzle ORM
 * (Story 1.7 / ADR-013). It will be removed in v1.0.
 *
 * Migration guide:
 *   - Desktop: `import { drizzle } from 'drizzle-orm/better-sqlite3'`
 *   - Mobile:  `import { drizzle } from 'drizzle-orm/op-sqlite'`
 *   - Both accept the schema from `@emuz/database/schema`
 */
export interface DatabaseAdapter {
  /**
   * Open the database connection
   */
  open(): Promise<void>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;

  /**
   * Execute a SQL statement (for INSERT, UPDATE, DELETE, CREATE, etc.)
   */
  execute(sql: string, params?: unknown[]): Promise<void>;

  /**
   * Execute a SQL query and return results
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute a SQL query and return a single result
   */
  queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;

  /**
   * Run multiple statements in a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction(fn: () => Promise<any>): Promise<any>;

  /**
   * Check if the database is connected
   */
  isConnected(): boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /**
   * Path to the database file
   */
  path: string;

  /**
   * Enable write-ahead logging
   */
  wal?: boolean;

  /**
   * Enable foreign key constraints
   */
  foreignKeys?: boolean;
}

/**
 * Base class for database adapters
 */
export abstract class BaseDatabaseAdapter implements DatabaseAdapter {
  protected config: DatabaseConfig;
  protected connected = false;

  constructor(config: DatabaseConfig) {
    this.config = {
      wal: true,
      foreignKeys: true,
      ...config,
    };
  }

  abstract open(): Promise<void>;
  abstract close(): Promise<void>;
  abstract execute(sql: string, params?: unknown[]): Promise<void>;
  abstract query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  async queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract transaction(fn: () => Promise<any>): Promise<any>;

  isConnected(): boolean {
    return this.connected;
  }
}
