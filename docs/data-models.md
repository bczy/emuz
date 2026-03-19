# EmuZ — Data Models

Generated: 2026-03-19 | Source: exhaustive scan of `libs/database/` + `libs/core/`

This document covers:

1. **Drizzle ORM schema** — 9 SQLite tables defined in `@emuz/database`
2. **Zod domain models** — TypeScript interfaces defined in `@emuz/core`

These two layers are separate: the database schema is the persistence layer, and the Zod models are the application layer. They are structurally aligned but not identical (e.g., the Zod `Game` model includes denormalized `platformName` from a JOIN; the database `games` table does not).

---

## Database Schema (Drizzle ORM)

All tables use TEXT primary keys (UUID strings), INTEGER timestamps in Unix-seconds (auto-converted to/from `Date` objects), and `INTEGER({ mode: 'boolean' })` for boolean flags (stored as 0/1).

### platforms

| Column           | Type                | Constraints            | Notes                                                    |
| ---------------- | ------------------- | ---------------------- | -------------------------------------------------------- |
| `id`             | TEXT                | PK                     | UUID                                                     |
| `name`           | TEXT                | NOT NULL               | Full name (e.g., "Super Nintendo Entertainment System")  |
| `short_name`     | TEXT                | —                      | Abbreviation (e.g., "SNES")                              |
| `manufacturer`   | TEXT                | —                      | e.g., "Nintendo"                                         |
| `generation`     | INTEGER             | —                      | Console generation number                                |
| `release_year`   | INTEGER             | —                      | e.g., 1990                                               |
| `icon_path`      | TEXT                | —                      | Local path to platform icon                              |
| `wallpaper_path` | TEXT                | —                      | Local path to hero wallpaper                             |
| `color`          | TEXT                | —                      | Hex color (e.g., "#7B5AA6")                              |
| `rom_extensions` | TEXT (JSON)         | NOT NULL, default `[]` | Array of supported extensions (e.g., `[".smc", ".sfc"]`) |
| `created_at`     | INTEGER (timestamp) | NOT NULL               |                                                          |
| `updated_at`     | INTEGER (timestamp) | NOT NULL               |                                                          |

**Indexes:** None explicit (queries on all columns)

**Seeded with:** 25 platforms covering Nintendo (8), Sony (4), Sega (6), Arcade, Atari, SNK, NEC

---

### games

| Column           | Type                | Constraints                        | Notes                              |
| ---------------- | ------------------- | ---------------------------------- | ---------------------------------- |
| `id`             | TEXT                | PK                                 | UUID                               |
| `platform_id`    | TEXT                | NOT NULL, FK→platforms(id) CASCADE |                                    |
| `title`          | TEXT                | NOT NULL                           |                                    |
| `file_path`      | TEXT                | NOT NULL                           | Absolute path to ROM file          |
| `file_name`      | TEXT                | NOT NULL                           | Filename only                      |
| `file_size`      | INTEGER             | —                                  | Bytes                              |
| `file_hash`      | TEXT                | —                                  | CRC32 or SHA-256                   |
| `cover_path`     | TEXT                | —                                  | Local path to downloaded cover art |
| `description`    | TEXT                | —                                  |                                    |
| `developer`      | TEXT                | —                                  |                                    |
| `publisher`      | TEXT                | —                                  |                                    |
| `release_date`   | TEXT                | —                                  | Free-form string                   |
| `genre`          | TEXT                | —                                  | Single genre string                |
| `rating`         | REAL                | —                                  | 0.0–5.0                            |
| `play_count`     | INTEGER             | NOT NULL, default 0                |                                    |
| `play_time`      | INTEGER             | NOT NULL, default 0                | Seconds of total play              |
| `last_played_at` | INTEGER (timestamp) | —                                  |                                    |
| `is_favorite`    | INTEGER (boolean)   | NOT NULL, default false            |                                    |
| `created_at`     | INTEGER (timestamp) | NOT NULL                           |                                    |
| `updated_at`     | INTEGER (timestamp) | NOT NULL                           |                                    |

**Indexes:** None explicit
**FK cascade:** DELETE platform → CASCADE delete games

> ⚠️ **ADR-014 Gap:** `romType: 'game' | 'homebrew'` column is approved but **not yet added** to this table.

---

### emulators

| Column             | Type                | Constraints             | Notes                                        |
| ------------------ | ------------------- | ----------------------- | -------------------------------------------- |
| `id`               | TEXT                | PK                      | UUID                                         |
| `name`             | TEXT                | NOT NULL                | e.g., "RetroArch"                            |
| `platforms`        | TEXT (JSON)         | NOT NULL, default `[]`  | Array of platform IDs this emulator supports |
| `executable_path`  | TEXT                | —                       | Desktop: path to binary                      |
| `package_name`     | TEXT                | —                       | Android: package ID (e.g., "com.retroarch")  |
| `url_scheme`       | TEXT                | —                       | iOS: URL scheme (e.g., "retroarch://")       |
| `icon_path`        | TEXT                | —                       |                                              |
| `command_template` | TEXT                | —                       | e.g., `"{exe} -L {core} "{rom}""`            |
| `core_path`        | TEXT                | —                       | RetroArch: path to .so/.dylib core           |
| `is_default`       | INTEGER (boolean)   | NOT NULL, default false |                                              |
| `is_installed`     | INTEGER (boolean)   | NOT NULL, default false |                                              |
| `created_at`       | INTEGER (timestamp) | NOT NULL                |                                              |
| `updated_at`       | INTEGER (timestamp) | NOT NULL                |                                              |

---

### collections

| Column        | Type                | Constraints             | Notes                                          |
| ------------- | ------------------- | ----------------------- | ---------------------------------------------- |
| `id`          | TEXT                | PK                      | UUID                                           |
| `name`        | TEXT                | NOT NULL                |                                                |
| `description` | TEXT                | —                       |                                                |
| `cover_path`  | TEXT                | —                       |                                                |
| `is_system`   | INTEGER (boolean)   | NOT NULL, default false | System collections: Favorites, Recently Played |
| `sort_order`  | INTEGER             | NOT NULL, default 0     | Display order                                  |
| `created_at`  | INTEGER (timestamp) | NOT NULL                |                                                |
| `updated_at`  | INTEGER (timestamp) | NOT NULL                |                                                |

---

### collection_games (junction)

| Column          | Type                | Constraints                          | Notes |
| --------------- | ------------------- | ------------------------------------ | ----- |
| `collection_id` | TEXT                | NOT NULL, FK→collections(id) CASCADE |       |
| `game_id`       | TEXT                | NOT NULL, FK→games(id) CASCADE       |       |
| `added_at`      | INTEGER (timestamp) | NOT NULL                             |       |

**Primary Key:** `(collection_id, game_id)` — composite
**Index:** `game_id` (for reverse lookup: which collections contain this game?)

---

### widgets

| Column       | Type                | Constraints                | Notes                                                                                                |
| ------------ | ------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id`         | TEXT                | PK                         | UUID                                                                                                 |
| `type`       | TEXT                | NOT NULL                   | One of: recent_games, favorites, platform_shortcuts, stats, continue_playing, random_picks, by_genre |
| `title`      | TEXT                | —                          | Custom display title                                                                                 |
| `size`       | TEXT                | NOT NULL, default 'medium' | small / medium / large / full                                                                        |
| `position`   | INTEGER             | NOT NULL                   | Display order on home screen                                                                         |
| `config`     | TEXT (JSON)         | —                          | Widget-specific config (e.g., `{ "limit": 8, "showPlatformBadge": true }`)                           |
| `is_visible` | INTEGER (boolean)   | NOT NULL, default true     |                                                                                                      |
| `created_at` | INTEGER (timestamp) | NOT NULL                   |                                                                                                      |
| `updated_at` | INTEGER (timestamp) | NOT NULL                   |                                                                                                      |

---

### genres

| Column       | Type                | Constraints      | Notes          |
| ------------ | ------------------- | ---------------- | -------------- |
| `id`         | TEXT                | PK               | UUID           |
| `name`       | TEXT                | NOT NULL         | e.g., "Action" |
| `slug`       | TEXT                | NOT NULL, UNIQUE | e.g., "action" |
| `icon_name`  | TEXT                | —                |                |
| `color`      | TEXT                | —                | Hex color      |
| `created_at` | INTEGER (timestamp) | NOT NULL         |                |
| `updated_at` | INTEGER (timestamp) | NOT NULL         |                |

**Unique index:** `genres_slug_unique` on `slug`

---

### settings (key-value store)

| Column       | Type                | Constraints | Notes                       |
| ------------ | ------------------- | ----------- | --------------------------- |
| `key`        | TEXT                | PK          | Setting key (e.g., "theme") |
| `value`      | TEXT                | NOT NULL    | JSON-serialized value       |
| `updated_at` | INTEGER (timestamp) | NOT NULL    |                             |

---

### scan_directories

| Column            | Type                | Constraints                            | Notes                   |
| ----------------- | ------------------- | -------------------------------------- | ----------------------- |
| `id`              | TEXT                | PK                                     | UUID                    |
| `path`            | TEXT                | NOT NULL, UNIQUE                       | Absolute directory path |
| `platform_id`     | TEXT                | — (nullable FK→platforms(id) SET NULL) | Optional platform scope |
| `is_recursive`    | INTEGER (boolean)   | NOT NULL, default true                 |                         |
| `last_scanned_at` | INTEGER (timestamp) | —                                      |                         |
| `created_at`      | INTEGER (timestamp) | NOT NULL                               |                         |

**Unique index:** `scan_directories_path_unique` on `path`

---

## Entity Relationships

```
platforms ──────────────────── games ──────── collection_games ──── collections
    │                            │                                        │
    └── scan_directories         └── genres (via games.genre string)      │
         (platform_id nullable)                                            │
                                                                     widgets (home screen)
                                                                     settings (KV store)
```

**Cascade rules:**

- Delete platform → DELETE all its games
- Delete collection → DELETE all its collection_games entries
- Delete game → DELETE all its collection_games entries
- Delete platform → SET NULL on scan_directories.platform_id

---

## Zod Domain Models (@emuz/core)

These are the application-layer types used throughout services, stores, and UI components. All have Zod schema + TypeScript inferred type + factory function.

### Game

Key differences from DB: camelCase field names, `platformName` / `platformShortName` / `platformManufacturer` (denormalized from JOIN), dates as `Date` objects.

```typescript
interface Game {
  id: string; // UUID
  platformId: string; // UUID → platforms.id
  title: string; // min 1 char
  filePath: string;
  fileName: string;
  fileSize?: number; // bytes, int ≥ 0
  fileHash?: string;
  coverPath?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string; // free-form
  genre?: string;
  rating?: number; // 0–5
  playCount: number; // default 0
  playTime: number; // seconds, default 0
  lastPlayedAt?: Date;
  isFavorite: boolean; // default false
  createdAt: Date;
  updatedAt: Date;
  // Denormalized (from JOIN):
  platformName?: string;
  platformShortName?: string;
  platformManufacturer?: string;
}
```

### Platform

```typescript
interface Platform {
  id: string;
  name: string; // min 1 char
  shortName?: string;
  manufacturer?: string;
  generation?: number;
  releaseYear?: number; // 1970–2100
  iconPath?: string;
  wallpaperPath?: string;
  color?: string; // #RRGGBB regex
  romExtensions: string[]; // e.g. ['.nes', '.unf']
  createdAt: Date;
  updatedAt: Date;
}
```

### Emulator

```typescript
interface Emulator {
  id: string;
  name: string;
  platforms: string[]; // platform IDs
  executablePath?: string; // desktop
  packageName?: string; // android
  urlScheme?: string; // ios
  iconPath?: string;
  commandTemplate?: string; // e.g. "{exe} -L {core} {rom}"
  corePath?: string; // retroarch core
  isDefault: boolean;
  isInstalled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection

```typescript
interface Collection {
  id: string;
  name: string;
  description?: string;
  coverPath?: string;
  gameIds: string[]; // UUIDs — loaded by service
  isSystem: boolean; // system collections are auto-managed
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Widget

```typescript
interface Widget {
  id: string;
  type:
    | 'recent_games'
    | 'favorites'
    | 'platform_shortcuts'
    | 'stats'
    | 'continue_playing'
    | 'random_picks'
    | 'by_genre';
  title?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
  config?: Record<string, unknown>;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Settings

```typescript
interface Settings {
  // Appearance
  theme: 'dark' | 'light' | 'system'; // default 'dark'
  accentColor: string; // default '#10B981'
  language: string; // default 'en'
  // Library
  gridLayout: 'compact' | 'comfortable' | 'spacious'; // default 'comfortable'
  defaultSort:
    | 'title-asc'
    | 'title-desc'
    | 'recently-added'
    | 'recently-played'
    | 'most-played'
    | 'release-date';
  showPlatformBadges: boolean; // default true
  showGameTitles: boolean; // default true
  // Scanning
  scanDirectories: string[];
  autoScanOnStartup: boolean; // default true
  skipHiddenFiles: boolean; // default true
  // Metadata
  autoFetchMetadata: boolean; // default true
  autoDownloadCovers: boolean; // default true
  preferredMetadataLanguage: string; // default 'en'
  // Emulators
  preferRetroArch: boolean; // default false
  retroArchPath?: string;
  retroArchCoresPath?: string;
  // Advanced
  enableAnalytics: boolean; // default false
  enableDebugMode: boolean; // default false
}
```

---

## Migration History

| Version     | File                                        | Description                         |
| ----------- | ------------------------------------------- | ----------------------------------- |
| 1 (legacy)  | `migrations/index.ts` `migration001Initial` | Creates all 8 tables via raw SQL    |
| 0 (Drizzle) | `drizzle/0000_fluffy_shriek.sql`            | Drizzle-generated DDL (same schema) |

**Bridge:** `stampInitialMigration(db)` — writes migration record to `__drizzle_migrations` without re-running DDL. Used when migrating from the legacy system to Drizzle (ADR-013).

**SQLite settings applied at init:**

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
```

**Database location:**

- Desktop: `~/.config/EmuZ/emuz.db` (via `app.getPath('userData')`)
- Mobile: platform documents directory
