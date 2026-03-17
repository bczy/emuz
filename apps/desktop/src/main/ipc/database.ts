/**
 * Database IPC Handlers
 * Exposes database operations to the renderer process
 */

import { ipcMain, app } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

/**
 * Get database path
 */
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'emuz.db');
}

/**
 * Initialize the database connection
 */
export function initializeDatabase(): Database.Database {
  if (db) return db;
  
  const dbPath = getDatabasePath();
  db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  console.log('Database initialized at:', dbPath);
  
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Register all database IPC handlers
 */
export function registerDatabaseHandlers(): void {
  // Initialize database
  ipcMain.handle('db:init', async (): Promise<{ path: string }> => {
    initializeDatabase();
    return { path: getDatabasePath() };
  });
  
  // Execute a query with parameters
  ipcMain.handle('db:query', async (_event, sql: string, params?: unknown[]): Promise<unknown[]> => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(...(params || []));
  });
  
  // Execute a single query returning one row
  ipcMain.handle('db:queryOne', async (_event, sql: string, params?: unknown[]): Promise<unknown | null> => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(...(params || [])) || null;
  });
  
  // Execute an insert/update/delete statement
  ipcMain.handle('db:execute', async (_event, sql: string, params?: unknown[]): Promise<{
    changes: number;
    lastInsertRowid: number | bigint;
  }> => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.run(...(params || []));
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  });
  
  // Execute multiple statements in a transaction
  ipcMain.handle('db:transaction', async (_event, statements: { sql: string; params?: unknown[] }[]): Promise<void> => {
    const database = getDatabase();
    const transaction = database.transaction(() => {
      for (const stmt of statements) {
        database.prepare(stmt.sql).run(...(stmt.params || []));
      }
    });
    transaction();
  });
  
  // Run migrations
  ipcMain.handle('db:migrate', async (_event, migrations: { version: number; sql: string }[]): Promise<void> => {
    const database = getDatabase();
    
    // Create migrations table if it doesn't exist
    database.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    
    // Get current version
    const currentVersion = database.prepare(
      'SELECT COALESCE(MAX(version), 0) as version FROM migrations'
    ).get() as { version: number };
    
    // Sort migrations by version
    const pendingMigrations = migrations
      .filter(m => m.version > currentVersion.version)
      .sort((a, b) => a.version - b.version);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    // Run migrations in a transaction
    const runMigrations = database.transaction(() => {
      for (const migration of pendingMigrations) {
        console.log(`Running migration ${migration.version}`);
        database.exec(migration.sql);
        database.prepare('INSERT INTO migrations (version) VALUES (?)').run(migration.version);
      }
    });
    
    runMigrations();
    console.log(`Applied ${pendingMigrations.length} migrations`);
  });
  
  // Get database info
  ipcMain.handle('db:info', async (): Promise<{
    path: string;
    size: number;
    tables: string[];
  }> => {
    const database = getDatabase();
    const dbPath = getDatabasePath();
    
    // Get file size
    const fs = await import('fs');
    const stats = await fs.promises.stat(dbPath);
    
    // Get table names
    const tables = database.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as { name: string }[];
    
    return {
      path: dbPath,
      size: stats.size,
      tables: tables.map(t => t.name),
    };
  });
  
  // Backup database
  ipcMain.handle('db:backup', async (_event, backupPath: string): Promise<void> => {
    const database = getDatabase();
    await database.backup(backupPath);
    console.log('Database backed up to:', backupPath);
  });
  
  // Vacuum database
  ipcMain.handle('db:vacuum', async (): Promise<void> => {
    const database = getDatabase();
    database.exec('VACUUM');
    console.log('Database vacuumed');
  });
}
