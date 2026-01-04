/**
 * Type declarations for better-sqlite3
 * This allows the module to be dynamically imported without requiring
 * the actual package to be installed at type-check time
 */

declare module 'better-sqlite3' {
  interface Statement {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    bind(...params: unknown[]): Statement;
  }

  interface Database {
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction<T>(fn: () => T): () => T;
    close(): void;
    pragma(pragma: string, options?: { simple?: boolean }): unknown;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: Record<string, unknown>): Database;
    (filename: string, options?: Record<string, unknown>): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
  export { Database, Statement };
}
