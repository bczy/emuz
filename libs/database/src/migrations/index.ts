import { ALL_TABLES } from '../schema/tables';
import type { DatabaseAdapter } from '../adapters/types';

/**
 * Migration interface
 */
export interface Migration {
  version: number;
  name: string;
  up: (db: DatabaseAdapter) => Promise<void>;
  down?: (db: DatabaseAdapter) => Promise<void>;
}

/**
 * Initial migration - creates all tables
 */
export const migration001Initial: Migration = {
  version: 1,
  name: 'initial',
  up: async (db: DatabaseAdapter) => {
    for (const sql of ALL_TABLES) {
      await db.execute(sql);
    }
  },
  down: async (db: DatabaseAdapter) => {
    // Drop tables in reverse order
    const tables = [
      'scan_directories',
      'settings',
      'genres',
      'widgets',
      'collection_games',
      'collections',
      'emulators',
      'games',
      'platforms',
    ];
    for (const table of tables) {
      await db.execute(`DROP TABLE IF EXISTS ${table}`);
    }
  },
};

/**
 * All migrations in order
 */
export const migrations: Migration[] = [migration001Initial];

/**
 * Get current database version
 */
export async function getDatabaseVersion(db: DatabaseAdapter): Promise<number> {
  try {
    // Create migrations table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    const result = await db.query<{ version: number }>(
      'SELECT MAX(version) as version FROM _migrations'
    );
    return result[0]?.version || 0;
  } catch {
    return 0;
  }
}

/**
 * Run pending migrations
 */
export async function runMigrations(db: DatabaseAdapter): Promise<void> {
  const currentVersion = await getDatabaseVersion(db);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      await migration.up(db);
      await db.execute('INSERT INTO _migrations (version, name) VALUES (?, ?)', [
        migration.version,
        migration.name,
      ]);
    }
  }
}
