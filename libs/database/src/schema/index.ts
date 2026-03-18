/**
 * Drizzle ORM schema definitions for all 8 EmuZ tables.
 *
 * Supersedes schema/tables.ts (raw SQL DDL strings).
 *
 * Column mode conventions:
 *   - `.json()` for JSON array / object columns (auto-serialize/deserialize)
 *   - `integer({ mode: 'boolean' })` for 0/1 boolean flags
 *   - `integer({ mode: 'timestamp' })` for Unix-seconds timestamps (returns Date)
 *
 * @see ADR-013: Drizzle ORM + op-sqlite migration
 */

import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

// ---------------------------------------------------------------------------
// platforms
// ---------------------------------------------------------------------------
export const platforms = sqliteTable('platforms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name'),
  manufacturer: text('manufacturer'),
  generation: integer('generation'),
  releaseYear: integer('release_year'),
  iconPath: text('icon_path'),
  wallpaperPath: text('wallpaper_path'),
  color: text('color'),
  // JSON array of file extensions, e.g. [".nes", ".unf"]
  romExtensions: text('rom_extensions', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// games
// ---------------------------------------------------------------------------
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  platformId: text('platform_id')
    .notNull()
    .references(() => platforms.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  fileHash: text('file_hash'),
  coverPath: text('cover_path'),
  description: text('description'),
  developer: text('developer'),
  publisher: text('publisher'),
  releaseDate: text('release_date'),
  genre: text('genre'),
  rating: real('rating'),
  playCount: integer('play_count').notNull().default(0),
  playTime: integer('play_time').notNull().default(0),
  lastPlayedAt: integer('last_played_at', { mode: 'timestamp' }),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// emulators
// ---------------------------------------------------------------------------
export const emulators = sqliteTable('emulators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  // JSON array of platform IDs this emulator supports
  platforms: text('platforms', { mode: 'json' }).$type<string[]>().notNull().default([]),
  executablePath: text('executable_path'),
  packageName: text('package_name'),
  urlScheme: text('url_scheme'),
  iconPath: text('icon_path'),
  commandTemplate: text('command_template'),
  corePath: text('core_path'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isInstalled: integer('is_installed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverPath: text('cover_path'),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// collection_games  (composite PK)
// ---------------------------------------------------------------------------
export const collectionGames = sqliteTable(
  'collection_games',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.collectionId, t.gameId] })]
);

// ---------------------------------------------------------------------------
// widgets
// ---------------------------------------------------------------------------
export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title'),
  size: text('size').notNull().default('medium'),
  position: integer('position').notNull(),
  // JSON object for widget-specific configuration
  config: text('config', { mode: 'json' }).$type<Record<string, unknown>>(),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// genres
// ---------------------------------------------------------------------------
export const genres = sqliteTable('genres', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  iconName: text('icon_name'),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// settings  (key-value store)
// ---------------------------------------------------------------------------
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// scan_directories
// ---------------------------------------------------------------------------
export const scanDirectories = sqliteTable('scan_directories', {
  id: text('id').primaryKey(),
  path: text('path').notNull().unique(),
  platformId: text('platform_id').references(() => platforms.id, { onDelete: 'set null' }),
  isRecursive: integer('is_recursive', { mode: 'boolean' }).notNull().default(true),
  lastScannedAt: integer('last_scanned_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// Bundled schema object — pass to drizzle(db, { schema }) for typed queries
// ---------------------------------------------------------------------------
export const drizzleSchema = {
  platforms,
  games,
  emulators,
  collections,
  collectionGames,
  widgets,
  genres,
  settings,
  scanDirectories,
} as const;

export type DrizzleSchema = typeof drizzleSchema;

/**
 * Typed Drizzle database instance (better-sqlite3 driver).
 *
 * Used by all core services on desktop and in tests.
 * Mobile uses OPSQLiteDatabase<DrizzleSchema> from drizzle-orm/op-sqlite,
 * which is structurally compatible for query building.
 */
export type DrizzleDb = BetterSQLite3Database<DrizzleSchema>;

// Re-export legacy schema types for transition period
export * from './types';
