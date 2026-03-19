/**
 * Row interfaces for the flat-file storage engine.
 * Dates are native Date objects (not Unix timestamps).
 * Booleans are native booleans (not 0|1).
 * JSON arrays are native string[] (not JSON strings).
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
  rom_extensions: string[];
  created_at: Date;
  updated_at: Date;
}

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
  play_time: number;
  last_played_at: Date | null;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EmulatorRow {
  id: string;
  name: string;
  platform_ids: string[];
  executable_path: string | null;
  package_name: string | null;
  url_scheme: string | null;
  icon_path: string | null;
  command_template: string | null;
  core_path: string | null;
  is_default: boolean;
  is_installed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  cover_path: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

/** Junction record — composite key (collection_id + game_id), no standalone id. */
export interface CollectionGameRow {
  collection_id: string;
  game_id: string;
  added_at: Date;
}

export interface WidgetRow {
  id: string;
  type: string;
  title: string | null;
  size: string;
  position: number;
  config: string | null;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GenreRow {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Key-value settings store — keyed by `key`, no surrogate id. */
export interface SettingsRow {
  key: string;
  value: string;
  updated_at: Date;
}

export interface ScanDirectoryRow {
  id: string;
  path: string;
  platform_id: string | null;
  is_recursive: boolean;
  last_scanned_at: Date | null;
  created_at: Date;
}

export interface PlaySessionRow {
  id: string;
  game_id: string;
  started_at: Date;
  ended_at: Date | null;
  /** Duration in seconds */
  duration: number;
}
