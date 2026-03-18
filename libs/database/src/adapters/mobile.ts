/**
 * Mobile database adapter
 * Uses @op-engineering/op-sqlite + Drizzle ORM for type-safe SQLite on iOS and Android.
 *
 * @see ADR-013: Drizzle ORM + op-sqlite migration
 * @see docs/drizzle-migration.md for native rebuild instructions (pod install / Gradle sync)
 *
 * NOTE: After installing op-sqlite, the native app MUST be rebuilt:
 *   iOS:     cd apps/mobile/ios && pod install
 *   Android: Gradle sync in Android Studio or `./gradlew build`
 */

import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import type { OPSQLiteDatabase } from 'drizzle-orm/op-sqlite';
import { BaseDatabaseAdapter, DatabaseConfig } from './types';
import { drizzleSchema } from '../schema/index';
import type { DrizzleSchema } from '../schema/index';

/**
 * @deprecated Use {@link createDrizzleMobileDb} for new code.
 *
 * Legacy mobile adapter retained as a compatibility shim.
 * Previously used react-native-sqlite-storage; now superseded by op-sqlite + Drizzle.
 * This class will be removed in v1.0.
 */
export class MobileDatabaseAdapter extends BaseDatabaseAdapter {
  constructor(config: DatabaseConfig) {
    super(config);
  }

  async open(): Promise<void> {
    throw new Error(
      'MobileDatabaseAdapter is deprecated. Use createDrizzleMobileDb() from @emuz/database instead.'
    );
  }

  async close(): Promise<void> {
    this.connected = false;
  }

  async execute(_sql: string, _params?: unknown[]): Promise<void> {
    throw new Error('MobileDatabaseAdapter is deprecated.');
  }

  async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
    throw new Error('MobileDatabaseAdapter is deprecated.');
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

/**
 * Create a mobile database adapter
 * @deprecated Use {@link createDrizzleMobileDb} for new code.
 */
export function createMobileAdapter(config: DatabaseConfig): MobileDatabaseAdapter {
  return new MobileDatabaseAdapter(config);
}

/**
 * Create a typed Drizzle database instance for mobile (op-sqlite).
 *
 * Requires the native app to be rebuilt after installing @op-engineering/op-sqlite:
 *   iOS:     cd apps/mobile/ios && pod install
 *   Android: Gradle sync
 *
 * @example
 * ```typescript
 * import { createDrizzleMobileDb } from '@emuz/database';
 *
 * const db = createDrizzleMobileDb({ path: 'emuz.db' });
 * // db is OPSQLiteDatabase<DrizzleSchema>
 * ```
 */
export function createDrizzleMobileDb(config: DatabaseConfig): OPSQLiteDatabase<DrizzleSchema> {
  const sqlite = open({ name: config.path });
  return drizzle(sqlite, { schema: drizzleSchema });
}
