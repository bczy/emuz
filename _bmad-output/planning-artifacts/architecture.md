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

```sql
CREATE TABLE platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    manufacturer TEXT,
    generation INTEGER,
    release_year INTEGER,
    icon_path TEXT,
    wallpaper_path TEXT,
    wallpaper_blur INTEGER DEFAULT 0,
    color TEXT,
    rom_extensions TEXT, -- JSON array
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE games (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES platforms(id),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_hash TEXT,
    cover_path TEXT,
    description TEXT,
    developer TEXT, publisher TEXT,
    release_date TEXT, genre TEXT,
    players INTEGER, rating REAL,
    favorite INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    play_time INTEGER DEFAULT 0,
    last_played INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE emulators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    executable_path TEXT NOT NULL,
    version TEXT,
    platform_ids TEXT, -- JSON array
    launch_template TEXT,
    is_default INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT, icon TEXT, color TEXT,
    is_smart INTEGER DEFAULT 0,
    smart_filter TEXT, -- JSON
    sort_order INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE game_collections (
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    added_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (game_id, collection_id)
);

CREATE TABLE rom_directories (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    platform_id TEXT REFERENCES platforms(id),
    recursive INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 1,
    last_scanned INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE widgets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'recent', 'favorites', 'stats', 'platform', 'custom'
    position INTEGER NOT NULL,
    size TEXT DEFAULT 'medium',
    config TEXT, -- JSON
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes
CREATE INDEX idx_games_platform ON games(platform_id);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_favorite ON games(favorite);
CREATE INDEX idx_games_last_played ON games(last_played);
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

| Phase             | Scope                                                                          | Status                                                                                |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 1 — Foundation    | Monorepo, database, models, platform adapters                                  | ✅ Complete (tests pending: 1.3, 1.5, 1.6)                                            |
| 2 — Core Services | LibraryService, ScannerService, MetadataService, LaunchService, Zustand stores | ✅ Complete (tests pending all; React Query integration pending 2.6)                  |
| 3 — UI Components | GameCard, GameGrid, Sidebar, Widgets, SearchBar                                | ✅ Complete (tests pending all; virtualization pending 3.4; drag-reorder pending 3.8) |
| 4 — Desktop App   | Electron main/renderer, screens, build                                         | ✅ Complete (native menu pending 4.2; auto-update + signing pending 4.5)              |
| 5 — Mobile App    | React Native screens, navigation, build                                        | ✅ Complete (share extension pending 5.5; Fastlane optional 5.6)                      |
| 6 — Polish        | E2E tests, performance, docs                                                   | 🔄 In Progress (6.1 in progress; 6.2–6.4 pending; 6.5 done)                           |

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
