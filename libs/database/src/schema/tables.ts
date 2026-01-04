/**
 * SQL statements for creating database tables
 */

export const CREATE_PLATFORMS_TABLE = `
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  manufacturer TEXT,
  generation INTEGER,
  release_year INTEGER,
  icon_path TEXT,
  wallpaper_path TEXT,
  color TEXT,
  rom_extensions TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
`;

export const CREATE_GAMES_TABLE = `
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_hash TEXT,
  cover_path TEXT,
  description TEXT,
  developer TEXT,
  publisher TEXT,
  release_date TEXT,
  genre TEXT,
  rating REAL,
  play_count INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  last_played_at INTEGER,
  is_favorite INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_games_platform_id ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_is_favorite ON games(is_favorite);
CREATE INDEX IF NOT EXISTS idx_games_last_played_at ON games(last_played_at);
`;

export const CREATE_EMULATORS_TABLE = `
CREATE TABLE IF NOT EXISTS emulators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform_ids TEXT NOT NULL DEFAULT '[]',
  executable_path TEXT,
  package_name TEXT,
  url_scheme TEXT,
  icon_path TEXT,
  command_template TEXT,
  core_path TEXT,
  is_default INTEGER DEFAULT 0,
  is_installed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
`;

export const CREATE_COLLECTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_path TEXT,
  is_system INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS collection_games (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  added_at INTEGER DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (collection_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_games_game_id ON collection_games(game_id);
`;

export const CREATE_WIDGETS_TABLE = `
CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  size TEXT DEFAULT 'medium',
  position INTEGER NOT NULL,
  config TEXT,
  is_visible INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
`;

export const CREATE_GENRES_TABLE = `
CREATE TABLE IF NOT EXISTS genres (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT,
  color TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);
`;

export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
`;

export const CREATE_SCAN_DIRECTORIES_TABLE = `
CREATE TABLE IF NOT EXISTS scan_directories (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE SET NULL,
  is_recursive INTEGER DEFAULT 1,
  last_scanned_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
`;

/**
 * All table creation statements in order
 */
export const ALL_TABLES = [
  CREATE_PLATFORMS_TABLE,
  CREATE_GAMES_TABLE,
  CREATE_EMULATORS_TABLE,
  CREATE_COLLECTIONS_TABLE,
  CREATE_WIDGETS_TABLE,
  CREATE_GENRES_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_SCAN_DIRECTORIES_TABLE,
];
