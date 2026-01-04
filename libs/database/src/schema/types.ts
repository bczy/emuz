/**
 * Database schema types
 * These types represent the raw database tables
 */

/**
 * Platform table schema
 */
export interface PlatformRow {
  id: string;
  name: string;
  short_name: string | null;
  manufacturer: string | null;
  generation: number | null;
  release_year: number | null;
  icon_path: string | null;
  wallpaper_path: string | null;
  color: string | null;
  rom_extensions: string; // JSON array
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Game table schema
 */
export interface GameRow {
  id: string;
  platform_id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  file_hash: string | null;
  cover_path: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  release_date: string | null;
  genre: string | null;
  rating: number | null;
  play_count: number;
  play_time: number; // in seconds
  last_played_at: number | null; // Unix timestamp
  is_favorite: number; // 0 or 1
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Emulator table schema
 */
export interface EmulatorRow {
  id: string;
  name: string;
  platform_ids: string; // JSON array
  executable_path: string | null;
  package_name: string | null;
  url_scheme: string | null;
  icon_path: string | null;
  command_template: string | null;
  core_path: string | null;
  is_default: number; // 0 or 1
  is_installed: number; // 0 or 1
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Collection table schema
 */
export interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  cover_path: string | null;
  is_system: number; // 0 or 1
  sort_order: number;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Collection games junction table
 */
export interface CollectionGameRow {
  collection_id: string;
  game_id: string;
  added_at: number; // Unix timestamp
}

/**
 * Widget table schema
 */
export interface WidgetRow {
  id: string;
  type: string;
  title: string | null;
  size: string;
  position: number;
  config: string | null; // JSON object
  is_visible: number; // 0 or 1
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Genre table schema
 */
export interface GenreRow {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Settings table schema (key-value store)
 */
export interface SettingsRow {
  key: string;
  value: string; // JSON value
  updated_at: number; // Unix timestamp
}

/**
 * Scan directory table schema
 */
export interface ScanDirectoryRow {
  id: string;
  path: string;
  platform_id: string | null;
  is_recursive: number; // 0 or 1
  last_scanned_at: number | null; // Unix timestamp
  created_at: number; // Unix timestamp
}
