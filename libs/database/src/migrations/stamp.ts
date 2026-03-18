/**
 * stamp.ts — Drizzle migration bridge (Story 1.7 / ADR-013)
 *
 * Databases created by Story 1.2 already contain all tables produced by the
 * Drizzle schema.  Calling `drizzle-kit push` or `migrate()` against them would
 * attempt to re-run the initial migration and fail with "table already exists".
 *
 * This utility instead writes a row into the `__drizzle_migrations` journal
 * table so that Drizzle considers migration `0000_fluffy_shriek` as already
 * applied — without executing any SQL.
 *
 * Usage (run once on first app launch after upgrade):
 *
 *   import { stampInitialMigration } from '@emuz/database/migrations/stamp';
 *   stampInitialMigration(db);
 *
 * It is safe to call multiple times; calling it when the migration is already
 * stamped is a no-op.
 */

import type { DrizzleDb } from '../schema/index';
import { sql } from 'drizzle-orm';

/** Name of the initial generated migration. */
const INITIAL_MIGRATION_TAG = '0000_fluffy_shriek';

/**
 * Create the Drizzle migrations journal table if it does not exist and insert
 * a row for `INITIAL_MIGRATION_TAG` if not already present.
 *
 * This allows databases bootstrapped by the legacy Story 1.2 migrations to
 * work with the Drizzle `migrate()` helper without re-executing DDL.
 */
export function stampInitialMigration(db: DrizzleDb): void {
  // Create journal table (matches Drizzle's own schema)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      hash      TEXT    NOT NULL,
      created_at INTEGER
    )
  `);

  const existing = db.all<{ hash: string }>(
    sql`SELECT hash FROM __drizzle_migrations WHERE hash = ${INITIAL_MIGRATION_TAG}`
  );

  if (existing.length === 0) {
    db.run(sql`
      INSERT INTO __drizzle_migrations (hash, created_at)
      VALUES (${INITIAL_MIGRATION_TAG}, ${Math.floor(Date.now() / 1000)})
    `);
  }
}
