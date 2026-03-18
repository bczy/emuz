# EmuZ — Architecture Document

**Version**: 1.0.0 | **Status**: Active | **Migrated from**: constitution.md + plan.md + clarifications.md

> _"Yet another emulators and ROMs management front-end"_ — Daijishou-inspired cross-platform emulator hub.

---

## Project Overview

EmuZ centralizes multiple gaming emulators into a single, unified interface across all major platforms (iOS, Android, macOS, Linux, Windows). Users organize ROM libraries, discover metadata, and launch games via URL schemes or direct process execution.

**Repository**: `emuz` | **License**: GPL-3.0 | **Package scope**: `@emuz/*`

---

## Core Principles

### I. Cross-Platform First

- React Native (mobile) + Electron (desktop) from a single Nx monorepo
- No platform-specific code in shared `libs/` — all divergence goes through adapters
- Platform-appropriate UX while maintaining feature parity across all 5 targets

### II. User Experience Excellence

- Any game reachable within 3 clicks/taps
- Cover art, screenshots, metadata displayed prominently (Daijishou-style)
- Game launch handoff in < 1 second
- Customizable home screen with widgets (Recent, Favorites, Stats)

### III. Test-First Development (NON-NEGOTIABLE)

- TDD cycle enforced: tests → user approval → red → green → refactor
- Minimum 80% coverage for core services
- All public APIs must have tests

### IV. Performance Targets

- App launch: < 2 seconds
- Library scan: < 5 seconds for 1000+ ROMs
- Search results: < 100ms
- Memory: < 500MB for large libraries

### V. Security & Privacy

- Zero telemetry — no data collection without explicit consent
- All data stored locally by default
- Never modify or distribute ROM files
- All file paths validated (prevent directory traversal)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       EmuZ Application                       │
├──────────────────┬──────────────────┬────────────────────────┤
│   apps/mobile    │  apps/desktop    │   (Future: web SPA)    │
│  React Native    │    Electron      │                        │
└────────┬─────────┴────────┬─────────┘                        │
         │                  │                                   │
         └────────┬──────────┘                                  │
                  │                                             │
         ┌────────▼────────┐                                    │
         │    libs/ui      │  Shared React/RN components        │
         └────────┬────────┘  (NativeWind / TailwindCSS)        │
                  │                                             │
         ┌────────▼────────┐                                    │
         │   libs/core     │  Services, Stores, Models          │
         └────────┬────────┘  (Zustand, React Query, Zod)       │
                  │                                             │
     ┌────────────┼────────────┐                               │
     ▼            ▼            ▼                               │
┌─────────┐ ┌──────────┐ ┌──────────┐                         │
│libs/emu │ │ libs/db  │ │libs/plat │                         │
│lators   │ │ database │ │ form     │                         │
└─────────┘ └──────────┘ └──────────┘                         │
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Nx 20.x Monorepo with pnpm 9.x

**Status**: Accepted | **Source**: clarification #21, #22

**Decision**: Use Nx 20.x for monorepo management with pnpm 9.x as package manager.

**Rationale**:

- Existing team experience with Nx
- Official `@nx/react-native` plugin for mobile app support
- Dependency graph visualization and affected-build optimization
- Remote caching via Nx Cloud (free for open source)
- pnpm significant disk savings; `node-linker=hoisted` required for React Native compatibility

**Configuration**:

```ini
# .npmrc
node-linker=hoisted
shamefully-hoist=true
```

**Plugins**: `@nx/react-native`, `@nx/react`, `@nx/js`, `@nx/vite`, `@nx/eslint`, `nx-electron`

---

### ADR-002: React Native Bare Workflow (no Expo)

**Status**: Accepted | **Source**: clarification #9

**Decision**: Use bare React Native workflow without Expo managed runtime.

**Rationale**:

- Full native module access (SQLite, SAF, URL schemes, deep links)
- Complete control over Gradle/Xcode configuration
- Better integration with native emulators
- No Expo limitations for deep link handling

**Implications**:

- Requires Xcode for iOS builds
- Manual native module configuration
- More flexibility for platform-specific optimizations

---

### ADR-003: SQLite with Dual Adapter Pattern

**Status**: Accepted | **Source**: plan.md §Database Schema

**Decision**: SQLite for all local storage via a unified adapter interface with two implementations.

| Platform             | Library                       | Mode          |
| -------------------- | ----------------------------- | ------------- |
| Desktop (Electron)   | `better-sqlite3`              | Synchronous   |
| Mobile (iOS/Android) | `react-native-sqlite-storage` | Async/Promise |

**Adapter interface** (`libs/database/src/adapters/types.ts`) abstracts the difference so `libs/core` services are platform-agnostic.

**Schema tables**: `platforms`, `games`, `emulators`, `collections`, `game_collections`, `rom_directories`, `settings`, `widgets`

---

### ADR-004: Zustand 5.x + React Query 5.x State Management

**Status**: Accepted | **Source**: plan.md §State Management

**Decision**: Zustand for client state (UI, preferences, widgets); React Query for async/server-derived data (library, metadata).

**Store split**:

- `libraryStore` — selected platform, active filters, sort order
- `settingsStore` — theme, language, emulator paths, preferences
- `uiStore` — sidebar state, modals, loading indicators
- `widgetsStore` — widget layout, widget configs (Daijishou home screen)

All stores use Zustand persistence middleware for local storage.

---

### ADR-005: Platform Adapters Pattern (`libs/platform`)

**Status**: Accepted | **Source**: clarification #3, plan.md §Architecture

**Decision**: All platform-specific operations (filesystem, emulator launching) are abstracted behind interfaces in `libs/platform` with per-platform implementations.

**Filesystem adapters**:

- `android.ts` — Storage Access Framework (SAF), persisted URI permissions
- `ios.ts` — Documents folder + Files app import (sandboxed)
- `desktop.ts` — Native Node.js `fs` module

**Launcher adapters**:

- `android.ts` — Android Intent system (`retroarch://`, generic Intent)
- `ios.ts` — URL schemes (`retroarch://run?rom=...`, `delta://game/...`)
- `desktop.ts` — `child_process.spawn` (detached, stdio ignored)

Factory pattern selects the correct adapter at runtime based on `Platform.OS`.

---

### ADR-006: NativeWind 4.x Styling

**Status**: Accepted | **Source**: clarification #11

**Decision**: NativeWind 4.x (Tailwind CSS for React Native) on mobile; TailwindCSS 4.x on desktop renderer.

**Color palette** (Emerald Green on Slate Dark):

```
Primary:     #10B981  (Emerald 500)
Primary-light: #34D399 (Emerald 400)
Primary-dark:  #059669 (Emerald 600)
Background:  #0F172A  (Slate 900)
Surface:     #1E293B  (Slate 800)
Surface-alt: #334155  (Slate 700)
Text:        #F8FAFC  (Slate 50)
Text-muted:  #94A3B8  (Slate 400)
Border:      #334155  (Slate 700)
Success:     #22C55E
Error:       #EF4444
```

---

### ADR-007: react-i18next Internationalization

**Status**: Accepted | **Source**: clarification #23, #24

**Decision**: `react-i18next` + `i18next`, with `@emuz/i18n` shared library.

**V1.0 languages**: English (default), French, Spanish, German, Japanese, Chinese Simplified

**Namespace split**: `common`, `games`, `settings`, `platforms`

**Rule**: All code, documentation, comments and commit messages in English. i18n only applies to UI-facing strings.

---

### ADR-008: Metadata Hybrid Strategy

**Status**: Accepted | **Source**: clarification #1, #16

**Decision**: Local pre-built SQLite database downloaded on first launch + ScreenScraper API fallback.

**Flow**:

1. First launch → download `metadata.db.gz` (~50-100MB) from GitHub Releases
2. Local lookup by ROM hash
3. On miss → ScreenScraper API scrape, cache permanently
4. Full offline mode supported (skip download option)

**Hosting**: `github.com/<owner>/emuz-metadata/releases/latest/download/metadata.db.gz`

---

### ADR-009: Emulator Configuration as Embedded JSON

**Status**: Accepted | **Source**: clarification #15

**Decision**: Platform/emulator definitions stored as JSON files in `libs/emulators/src/data/platforms/`.

**Structure per platform**:

```json
{
  "id": "nes",
  "name": "Nintendo Entertainment System",
  "extensions": [".nes", ".fds"],
  "players": [
    {
      "id": "retroarch-nestopia",
      "core": "nestopia_libretro",
      "platforms": ["android", "ios", "desktop"]
    }
  ],
  "scraper": { "screenscraper_id": 3 }
}
```

100+ platform definitions (all Daijishou platforms). Community contributions via GitHub.

---

### ADR-010: Testing Stack

**Status**: Accepted | **Source**: clarification #13

| Level       | Tool       | Scope                      |
| ----------- | ---------- | -------------------------- |
| Unit        | Vitest     | Core services, utilities   |
| Component   | RNTL       | React Native components    |
| E2E Mobile  | Detox      | iOS/Android critical flows |
| E2E Desktop | Playwright | Electron critical flows    |

Coverage threshold: 80% lines for `libs/core`.

---

### ADR-011: CI/CD with GitHub Actions

**Status**: Accepted | **Source**: clarification #14

**Pipelines**: lint+test on every PR/push; platform builds (Android, iOS, Desktop ×3 OS) after lint passes.

No automatic releases (resource conservation for v1.0).

---

### ADR-012: Minimum OS Versions

**Status**: Accepted | **Source**: clarification #12

| Platform | Minimum           | Build flag                        |
| -------- | ----------------- | --------------------------------- |
| iOS      | 15.0+             | `IPHONEOS_DEPLOYMENT_TARGET=15.0` |
| Android  | API 28 (9.0 Pie)+ | `minSdkVersion=28`                |
| macOS    | 12.0 (Monterey)+  | —                                 |
| Windows  | 10 (21H2)+        | —                                 |
| Linux    | Ubuntu 22.04 LTS+ | AppImage/Flatpak                  |

---

### ADR-013: Drizzle ORM + op-sqlite Migration

**Status**: Accepted | **Date**: 2026-03

**Context**: Stories 1.2 and 1.3 implemented raw SQL schema strings and a hand-rolled migration runner. Five core services construct SQL manually, perform snake_case↔camelCase conversions by hand, and cast to `unknown[]`. This is error-prone and untestable at the schema level.

**Decision**: Adopt Drizzle ORM for all SQLite access in `@emuz/database` and `@emuz/core`.

- **Desktop**: `drizzle-orm/better-sqlite3` (no new native dep)
- **Mobile**: Replace `react-native-sqlite-storage` with `@op-engineering/op-sqlite` + `drizzle-orm/op-sqlite`
  - `react-native-sqlite-storage` has no official Drizzle adapter and is in maintenance mode
  - `op-sqlite` uses a synchronous JSI API mirroring `better-sqlite3` — both adapters become structurally symmetric
- **Migrations**: Drizzle Kit (`drizzle-kit generate`) replaces the hand-rolled runner; versioned SQL files under `libs/database/drizzle/`
- **Schema**: `libs/database/src/schema/index.ts` using `sqliteTable`, `.json()`, `integer({ mode: 'boolean' })`, `integer({ mode: 'timestamp' })`, `.references()` with CASCADE/SET NULL
- **Transition**: `DatabaseAdapter` interface retained as a `@deprecated` shim; removed in v1.0
- **Migration bridge**: A `stamp.ts` utility records the existing schema in `__drizzle_migrations` without re-running SQL on databases already created by Story 1.2

**Trade-offs**:

- `op-sqlite` requires `pod install` + Gradle sync (one-time breaking native change for mobile)
- Drizzle does not support correlated subqueries; `WidgetService` position-reorder UPDATE stays as `db.run(sql\`…\`)` raw escape-hatch
- `drizzle-kit` config (`libs/database/drizzle.config.ts`) must be added to the project

**Files affected by Story 1.7**: `libs/database/package.json`, `libs/database/src/schema/index.ts`, `libs/database/src/adapters/desktop.ts`, `libs/database/src/adapters/mobile.ts`, `libs/database/drizzle.config.ts`, `libs/core/src/services/*.ts`

---

### ADR-014: romType as Enum on the Game Model

**Status**: Accepted | **Date**: 2026-03 | **Epic**: Epic 7 — ROM Categorization

**Context**: Users want to distinguish commercial ROMs from community-created homebrews. The current `Game` model has no field for this distinction. A filtering mechanism is needed at the model, service, and UI layers.

**Decision**: Add `romType: z.enum(['game', 'homebrew']).default('game')` to `GameSchema` in `libs/core/src/models/Game.ts` and a corresponding `text('rom_type').notNull().default('game')` column to the `games` Drizzle table.

**Why enum over boolean (`isHomebrew`)**:

- Extensible without a breaking migration: a third value (e.g. `'demo'`, `'hack'`) can be added later with an additive migration
- Semantically clearer in filter UI and i18n keys (`romType.game`, `romType.homebrew`)
- Consistent with the pattern used by `PlatformCategories` (string enum) and `SystemCollections` (string enum)

**Migration strategy**: Additive column with `DEFAULT 'game'` — zero data loss for existing libraries. All pre-existing rows receive `romType = 'game'` automatically. The Drizzle migration file is generated via `pnpm nx run database:generate`.

**Scanner heuristic**: `ScannerService` optionally infers `romType = 'homebrew'` when the ROM's source directory path contains `homebrew` (case-insensitive). This is a hint, not a guarantee; the user can always override from the game detail screen.

**Trade-offs**:

- Small overhead: one extra text column (~8 bytes per row), negligible at scale
- No fuzzy/ML classification — type assignment is either explicit (user) or heuristic (folder name); accuracy depends on the user's folder structure

**Files to modify (Epic 7)**:

- `libs/core/src/models/Game.ts` — add `romType` to `GameSchema`
- `libs/database/src/schema/index.ts` — add column to `games` table
- `libs/database/drizzle/` — new migration file
- `libs/core/src/services/LibraryService.ts` — filter support
- `libs/core/src/services/types.ts` — add `romType` to `SearchOptions`
- `libs/ui/src/components/GameCard/` — `romType` badge
- `libs/ui/src/components/Sidebar/` — filter entry
- `libs/i18n/src/locales/en/` — `romType.game`, `romType.homebrew` keys

---

## Project Structure

```
emuz/
├── apps/
│   ├── mobile/          # @emuz/mobile (private) — React Native bare
│   └── desktop/         # @emuz/desktop (private) — Electron 33+
├── libs/
│   ├── core/            # @emuz/core — models (Zod), services, stores, hooks
│   ├── database/        # @emuz/database — schema, migrations, adapters
│   ├── emulators/       # @emuz/emulators — registry, detector, JSON data
│   ├── i18n/            # @emuz/i18n — locale files, i18next config
│   ├── platform/        # @emuz/platform — filesystem + launcher adapters
│   └── ui/              # @emuz/ui — shared React/RN components, themes
├── _bmad/               # BMAD agent framework
├── _bmad-output/        # BMAD planning and implementation artifacts
│   ├── planning-artifacts/
│   │   ├── architecture.md  ← this file
│   │   └── prd.md
│   └── implementation-artifacts/
│       └── stories/
└── docs/                # architecture.md, api.md, emulator-integration.md
```

---

## Database Schema

> **Note (ADR-013)**: The canonical schema definition moved from raw SQL strings to a Drizzle ORM TypeScript schema in `libs/database/src/schema/index.ts` as part of Story 1.7. The preview below reflects the intended Drizzle representation. Run `pnpm nx run database:generate` to produce versioned SQL migration files.

```typescript
// libs/database/src/schema/index.ts  (authoritative source after Story 1.7)
import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

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
  romExtensions: text('rom_extensions', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

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
  romType: text('rom_type').notNull().default('game'), // 'game' | 'homebrew' — ADR-014
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const emulators = sqliteTable('emulators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  platformIds: text('platform_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),
  executablePath: text('executable_path'),
  packageName: text('package_name'),
  urlScheme: text('url_scheme'),
  iconPath: text('icon_path'),
  commandTemplate: text('command_template'),
  corePath: text('core_path'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isInstalled: integer('is_installed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverPath: text('cover_path'),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionGames = sqliteTable(
  'collection_games',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    addedAt: integer('added_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({ pk: primaryKey({ columns: [t.collectionId, t.gameId] }) })
);

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title'),
  size: text('size').notNull().default('medium'),
  position: integer('position').notNull(),
  config: text('config', { mode: 'json' }).$type<Record<string, unknown>>(),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const genres = sqliteTable('genres', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  iconName: text('icon_name'),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const scanDirectories = sqliteTable('scan_directories', {
  id: text('id').primaryKey(),
  path: text('path').notNull().unique(),
  platformId: text('platform_id').references(() => platforms.id, { onDelete: 'set null' }),
  isRecursive: integer('is_recursive', { mode: 'boolean' }).notNull().default(true),
  lastScannedAt: integer('last_scanned_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Indexes generated by Drizzle Kit from .references() and .unique() declarations:
// idx_games_platform_id, idx_games_title, idx_games_is_favorite,
// idx_games_last_played_at, idx_collection_games_game_id, idx_genres_slug
```

---

## Core Service Interfaces

```typescript
// libs/core/src/services/LibraryService.ts
interface LibraryService {
  getAllGames(): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string): Promise<Game[]>;
  searchGames(query: string): Promise<Game[]>;
  updateGame(id: string, data: Partial<Game>): Promise<void>;
  deleteGame(id: string): Promise<void>;
  getCollections(): Promise<Collection[]>;
  createCollection(data: CreateCollectionInput): Promise<Collection>;
  addToCollection(gameId: string, collectionId: string): Promise<void>;
  toggleFavorite(gameId: string): Promise<void>;
  getFavorites(): Promise<Game[]>;
}

// libs/core/src/services/ScannerService.ts
interface ScannerService {
  addDirectory(path: string, options?: ScanOptions): Promise<void>;
  removeDirectory(path: string): Promise<void>;
  scanDirectory(path: string): AsyncGenerator<ScanProgress>;
  scanAllDirectories(): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  detectPlatform(filePath: string): Platform | null;
  calculateHash(filePath: string): Promise<string>;
}

// libs/core/src/services/MetadataService.ts
interface MetadataService {
  identifyGame(game: Game): Promise<GameMetadata | null>;
  searchMetadata(query: string, platformId?: string): Promise<GameMetadata[]>;
  downloadCover(gameId: string, url: string): Promise<string>;
  refreshMetadata(gameIds: string[]): AsyncGenerator<MetadataProgress>;
}

// libs/core/src/services/LaunchService.ts
interface LaunchService {
  getEmulators(): Promise<Emulator[]>;
  detectEmulators(): Promise<Emulator[]>;
  addEmulator(data: CreateEmulatorInput): Promise<Emulator>;
  setDefaultEmulator(platformId: string, emulatorId: string): Promise<void>;
  launchGame(gameId: string, emulatorId?: string): Promise<void>;
  buildLaunchCommand(game: Game, emulator: Emulator): string;
  recordPlaySession(gameId: string, duration: number): Promise<void>;
}
```

---

## Implementation Phases

| Phase             | Scope                                                                          | Status                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1 — Foundation    | Monorepo, database, models, platform adapters                                  | ✅ Complete — 125 tests passing (6/6 stories done)                                                                    |
| 2 — Core Services | LibraryService, ScannerService, MetadataService, LaunchService, Zustand stores | 🔄 Mostly done — 6/8 stories complete; MetadataService caching pending (2.3); React Query + store tests pending (2.6) |
| 3 — UI Components | GameCard, GameGrid, Sidebar, Widgets, SearchBar                                | 🔄 Implementation done, render tests pending all components; virtualization pending 3.4; drag-reorder pending 3.8     |
| 4 — Desktop App   | Electron main/renderer, screens, build                                         | 🔄 Mostly done — 3/5 stories complete; native menu pending (4.2); auto-update + signing docs pending (4.5)            |
| 5 — Mobile App    | React Native screens, navigation, build                                        | 🔄 Mostly done — 4/6 stories complete; share extension pending (5.5); Fastlane optional (5.6)                         |
| 6 — Polish        | E2E tests, performance, docs                                                   | 🔄 In Progress — docs done (6.5); unit test suite in progress (6.1); E2E + perf pending (6.2–6.4)                     |

---

## Anti-Patterns to Avoid

- ❌ Platform-specific code in `libs/` (use `libs/platform` adapters)
- ❌ Direct `fs` access outside `libs/platform/src/filesystem/desktop.ts`
- ❌ Hardcoded paths or OS-specific path separators
- ❌ Synchronous file operations on the main/UI thread
- ❌ Large unused dependency imports
- ❌ Sensitive data in plain text or logs

---

## Quality Gates

Before any feature is considered done:

- [ ] Works on all 5 target platforms
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] No TypeScript strict-mode errors
- [ ] Accessibility tested (keyboard + screen reader)
- [ ] Performance benchmarked against targets
- [ ] Documentation updated

---

## Risk Register

| Risk                                | Probability | Impact | Mitigation                            |
| ----------------------------------- | ----------- | ------ | ------------------------------------- |
| RN/Electron code-sharing complexity | Medium      | High   | Strict adapter layers                 |
| SQLite perf with large libraries    | Low         | Medium | Proper indexing                       |
| Cross-platform path handling        | High        | Medium | Path normalization utilities          |
| iOS App Store rejection             | Medium      | High   | No ROM downloading; follow guidelines |
| Metadata scraper rate limits        | Medium      | Low    | Caching + local DB fallback           |
