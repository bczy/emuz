# EmuZ - Technical Implementation Plan

> *Inspired by Daijishou - Cross-platform emulator frontend*

## Feature: 001-emuz-core
## Created: 2026-01-04
## Status: Clarified

---

## Branding & Theme

| Element | Value |
|---------|-------|
| **Name** | EmuZ |
| **Slogan** | "Yet another emulators and ROMs management front-end" |
| **Primary Color** | #10B981 (Emerald Green) |
| **Secondary Color** | #059669 (Dark Green) |
| **Background** | #0F172A (Slate 900) |
| **Accent** | #34D399 (Light Green) |

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Language | TypeScript | 5.7+ | Type-safe development |
| Runtime | Node.js | 22 LTS | JavaScript runtime |
| Mobile Framework | React Native | 0.76+ | iOS & Android apps (Bare Workflow) |
| Desktop Framework | Electron | 33+ | macOS, Linux, Windows |
| UI Library | React | 19+ | Shared components |
| Styling | NativeWind | 4.x | Tailwind CSS for React Native |
| State Management | Zustand | 5.0+ | Lightweight, performant state |
| Database | SQLite | 3.x | Local data storage |
| Monorepo Tool | Nx | 20.x | Monorepo management, caching, generators |
| Package Manager | pnpm | 9.x | Fast, efficient dependencies (node-linker=hoisted) |
| License | GPL-3.0 | - | Open source copyleft |

### Nx Plugins

| Plugin | Purpose |
|--------|---------|
| @nx/react-native | React Native app support |
| @nx/react | React components for desktop |
| @nx/js | Shared TypeScript libraries |
| @nx/vite | Vite bundling for Electron renderer |
| @nx/eslint | Linting configuration |
| nx-electron (community) | Electron app support |

### React Native Specific

| Package | Purpose |
|---------|---------|
| nativewind | Tailwind CSS styling |
| react-native-sqlite-storage | SQLite for mobile |
| react-native-fs | File system access |
| react-native-fast-image | Optimized image loading |
| react-native-gesture-handler | Touch interactions |
| react-native-reanimated | Smooth animations |
| @react-navigation/native | Navigation |

### Testing Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit & integration tests |
| @testing-library/react-native | React Native component testing |
| Detox | E2E mobile testing (iOS/Android) |
| Playwright | E2E desktop testing (Electron) |

### CI/CD

| Tool | Purpose |
|------|---------|
| GitHub Actions | Automated builds on PR/push |
| GitHub Releases | Metadata database hosting |

### Electron Specific

| Package | Purpose |
|---------|---------|
| better-sqlite3 | SQLite for desktop |
| electron-store | Preferences storage |
| electron-builder | App packaging |
| electron-updater | Auto-updates |

### Shared Packages

| Package | Purpose |
|---------|---------|
| @tanstack/react-query | Data fetching & caching |
| zod | Schema validation |
| date-fns | Date manipulation |
| fuse.js | Fuzzy search |
| react-native-web | Share RN components on web/desktop |
| react-native-document-picker | SAF file picker (Android) |
| react-i18next | Internationalization |
| i18next | i18n core library |

### Mobile Platform-Specific

| Package | Platform | Purpose |
|---------|----------|---------|
| react-native-saf-x | Android | Storage Access Framework |
| expo-linking | Both | URL schemes for launching |
| expo-file-system | Both | File operations |

### Minimum OS Versions

| Platform | Minimum Version | Notes |
|----------|-----------------|-------|
| iOS | 15.0+ | ~95% device coverage |
| Android | API 28 (9.0 Pie)+ | ~95% device coverage |
| macOS | 12.0 (Monterey)+ | Intel & Apple Silicon |
| Windows | 10 (21H2)+ | x64 only |
| Linux | Ubuntu 22.04 LTS+ | x64, AppImage/Flatpak |

---

## Emulator Launch Strategy

### Android - Intent System
```typescript
// RetroArch intent
Linking.openURL('retroarch://run?rom=' + encodeURIComponent(romPath));

// Generic intent via native module
NativeModules.EmulatorLauncher.launch({
  package: 'com.retroarch',
  action: 'android.intent.action.VIEW',
  data: romPath,
  extras: { LIBRETRO: corePath }
});
```

### iOS - URL Schemes
```typescript
// RetroArch
Linking.openURL('retroarch://run?rom=' + romPath);

// Delta (popular iOS emulator)
Linking.openURL('delta://game/' + romPath);

// Provenance
Linking.openURL('provenance://play?file=' + romPath);
```

### Desktop - Process Spawn
```typescript
// Direct execution
import { spawn } from 'child_process';

spawn(emulatorPath, ['-L', corePath, romPath], {
  detached: true,
  stdio: 'ignore'
});
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EmuZ Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Mobile App    │  │   Desktop App   │  │   (Future Web)  │  │
│  │  React Native   │  │    Electron     │  │    React SPA    │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │           │
│           └──────────┬─────────┴─────────────────────┘           │
│                      │                                           │
│           ┌──────────▼──────────┐                                │
│           │    packages/ui      │  Shared UI Components          │
│           └──────────┬──────────┘                                │
│                      │                                           │
│           ┌──────────▼──────────┐                                │
│           │   packages/core     │  Business Logic                │
│           └──────────┬──────────┘                                │
│                      │                                           │
│  ┌───────────────────┼───────────────────┐                      │
│  │                   │                   │                      │
│  ▼                   ▼                   ▼                      │
│ ┌─────────┐    ┌─────────────┐    ┌──────────────┐              │
│ │emulators│    │  database   │    │   platform   │              │
│ │ package │    │   package   │    │   adapters   │              │
│ └─────────┘    └─────────────┘    └──────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
emuz/
├── apps/
│   ├── mobile/                      # @nx/react-native app
│   │   ├── android/                 # Android native project
│   │   ├── ios/                     # iOS native project
│   │   ├── src/
│   │   │   ├── app/                 # App entry & navigation
│   │   │   ├── screens/             # Screen components
│   │   │   ├── components/          # Mobile-specific components
│   │   │   └── services/            # Platform services
│   │   ├── app.json
│   │   ├── metro.config.js
│   │   └── project.json             # Nx project config
│   │
│   └── desktop/                     # Electron app (custom Nx setup)
│       ├── src/
│       │   ├── main/                # Electron main process
│       │   │   ├── index.ts
│       │   │   ├── ipc.ts           # IPC handlers
│       │   │   ├── menu.ts          # Native menus
│       │   │   └── updater.ts       # Auto-update logic
│       │   ├── renderer/            # Renderer process (React + Vite)
│       │   │   ├── App.tsx
│       │   │   ├── screens/
│       │   │   └── components/
│       │   └── preload/             # Preload scripts
│       ├── electron-builder.yml
│       └── project.json             # Nx project config
│
├── libs/                            # Nx libraries (shared code)
│   ├── core/                        # @emuz/core - Business logic
│   │   ├── src/
│   │   │   ├── models/              # Data models
│   │   │   │   ├── Game.ts
│   │   │   │   ├── Platform.ts
│   │   │   │   ├── Emulator.ts
│   │   │   │   ├── Widget.ts
│   │   │   │   └── Collection.ts
│   │   │   ├── services/            # Business services
│   │   │   │   ├── LibraryService.ts
│   │   │   │   ├── ScannerService.ts
│   │   │   │   ├── MetadataService.ts
│   │   │   │   ├── WidgetService.ts
│   │   │   │   └── LaunchService.ts
│   │   │   ├── stores/              # Zustand stores
│   │   │   │   ├── libraryStore.ts
│   │   │   │   ├── settingsStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   └── utils/               # Utility functions
│   │   └── project.json
│   │
│   ├── ui/                          # @emuz/ui - Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── GameCard/
│   │   │   │   ├── GameGrid/
│   │   │   │   ├── PlatformCard/
│   │   │   │   ├── SearchBar/
│   │   │   │   ├── widgets/
│   │   │   │   └── Button/
│   │   │   ├── themes/
│   │   │   │   └── tokens.ts        # NativeWind theme tokens
│   │   │   └── hooks/
│   │   └── project.json
│   │
│   ├── database/                    # @emuz/database - Data layer
│   │   ├── src/
│   │   │   ├── schema/              # Table definitions
│   │   │   ├── migrations/          # Schema migrations
│   │   │   ├── queries/             # Prepared queries
│   │   │   └── adapters/            # Platform-specific adapters
│   │   │       ├── mobile.ts        # react-native-sqlite-storage
│   │   │       └── desktop.ts       # better-sqlite3
│   │   └── project.json
│   │
│   ├── emulators/                   # @emuz/emulators - Emulator configs
│   │   ├── src/
│   │   │   ├── data/                # JSON platform definitions
│   │   │   │   ├── nintendo/
│   │   │   │   ├── sony/
│   │   │   │   ├── sega/
│   │   │   │   └── index.ts
│   │   │   ├── registry/            # Emulator definitions
│   │   │   ├── detector/            # Auto-detection
│   │   │   └── launcher/            # Launch logic per platform
│   │   └── project.json
│   │
│   ├── i18n/                        # @emuz/i18n - Internationalization
│   │   ├── src/
│   │   │   ├── index.ts             # i18n configuration
│   │   │   └── locales/
│   │   │       ├── en/              # English (default)
│   │   │       │   ├── common.json
│   │   │       │   ├── games.json
│   │   │       │   ├── settings.json
│   │   │       │   └── platforms.json
│   │   │       ├── fr/              # French
│   │   │       ├── es/              # Spanish
│   │   │       ├── de/              # German
│   │   │       ├── ja/              # Japanese
│   │   │       └── zh/              # Chinese
│   │   └── project.json
│   │
│   └── platform/                    # @emuz/platform - Platform adapters
│       ├── src/
│       │   ├── filesystem/          # File system access
│       │   │   ├── android.ts       # SAF implementation
│       │   │   ├── ios.ts           # Documents + Files
│       │   │   └── desktop.ts       # Native FS
│       │   └── launcher/            # Emulator launchers
│       │       ├── android.ts       # Intent system
│       │       ├── ios.ts           # URL schemes
│       │       └── desktop.ts       # Process spawn
│       └── project.json
│
├── .specify/                        # Spec-Kit artifacts
│   ├── memory/
│   │   └── constitution.md
│   ├── specs/
│   │   └── 001-emuz-core/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── clarifications.md
│   │       └── tasks.md
│   ├── scripts/
│   └── templates/
│
├── docs/                            # Documentation
│   ├── architecture.md
│   ├── emulator-integration.md
│   └── contributing.md
│
├── nx.json                          # Nx configuration
├── pnpm-workspace.yaml              # pnpm workspace config
├── .npmrc                           # node-linker=hoisted
├── package.json                     # Root package.json
├── tsconfig.base.json               # Shared TypeScript config
└── .gitignore
```

### Nx Commands

```bash
# Run all tests
nx run-many -t test

# Build affected projects
nx affected -t build

# Run mobile app
nx run mobile:start

# Run desktop app  
nx run desktop:serve

# Generate a new library
nx g @nx/js:lib my-lib --directory=libs/my-lib

# Visualize dependency graph
nx graph
```

---

## Database Schema

### Tables

```sql
-- Platforms (consoles/systems)
CREATE TABLE platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    manufacturer TEXT,
    generation INTEGER,
    release_year INTEGER,
    icon_path TEXT,
    color TEXT,
    rom_extensions TEXT, -- JSON array
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Games (ROMs)
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES platforms(id),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_hash TEXT, -- MD5 or CRC32
    cover_path TEXT,
    description TEXT,
    developer TEXT,
    publisher TEXT,
    release_date TEXT,
    genre TEXT,
    players INTEGER,
    rating REAL,
    favorite INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    play_time INTEGER DEFAULT 0, -- seconds
    last_played INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Emulators
CREATE TABLE emulators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    executable_path TEXT NOT NULL,
    version TEXT,
    platform_ids TEXT, -- JSON array of platform IDs
    launch_template TEXT, -- Command template
    is_default INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Collections
CREATE TABLE collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_smart INTEGER DEFAULT 0,
    smart_filter TEXT, -- JSON filter definition
    sort_order INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Game-Collection mapping
CREATE TABLE game_collections (
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    added_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (game_id, collection_id)
);

-- ROM directories
CREATE TABLE rom_directories (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    platform_id TEXT REFERENCES platforms(id),
    recursive INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 1,
    last_scanned INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes
CREATE INDEX idx_games_platform ON games(platform_id);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_favorite ON games(favorite);
CREATE INDEX idx_games_last_played ON games(last_played);
CREATE INDEX idx_game_collections_game ON game_collections(game_id);
CREATE INDEX idx_game_collections_collection ON game_collections(collection_id);
```

---

## Core Services

### LibraryService

Manages the game library, collections, and favorites.

```typescript
interface LibraryService {
  // Games
  getAllGames(): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string): Promise<Game[]>;
  searchGames(query: string): Promise<Game[]>;
  updateGame(id: string, data: Partial<Game>): Promise<void>;
  deleteGame(id: string): Promise<void>;
  
  // Collections
  getCollections(): Promise<Collection[]>;
  createCollection(data: CreateCollectionInput): Promise<Collection>;
  addToCollection(gameId: string, collectionId: string): Promise<void>;
  removeFromCollection(gameId: string, collectionId: string): Promise<void>;
  
  // Favorites
  toggleFavorite(gameId: string): Promise<void>;
  getFavorites(): Promise<Game[]>;
}
```

### ScannerService

Handles ROM discovery and library scanning.

```typescript
interface ScannerService {
  // Directory management
  addDirectory(path: string, options?: ScanOptions): Promise<void>;
  removeDirectory(path: string): Promise<void>;
  getDirectories(): Promise<RomDirectory[]>;
  
  // Scanning
  scanDirectory(path: string): AsyncGenerator<ScanProgress>;
  scanAllDirectories(): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  
  // ROM detection
  detectPlatform(filePath: string): Platform | null;
  calculateHash(filePath: string): Promise<string>;
}
```

### MetadataService

Fetches and manages game metadata.

```typescript
interface MetadataService {
  // Identification
  identifyGame(game: Game): Promise<GameMetadata | null>;
  searchMetadata(query: string, platformId?: string): Promise<GameMetadata[]>;
  
  // Artwork
  downloadCover(gameId: string, url: string): Promise<string>;
  getCoverPath(gameId: string): string;
  
  // Batch operations
  refreshMetadata(gameIds: string[]): AsyncGenerator<MetadataProgress>;
}
```

### LaunchService

Handles game launching and emulator integration.

```typescript
interface LaunchService {
  // Emulator management
  getEmulators(): Promise<Emulator[]>;
  detectEmulators(): Promise<Emulator[]>;
  addEmulator(data: CreateEmulatorInput): Promise<Emulator>;
  setDefaultEmulator(platformId: string, emulatorId: string): Promise<void>;
  
  // Launching
  launchGame(gameId: string, emulatorId?: string): Promise<void>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;
  buildLaunchCommand(game: Game, emulator: Emulator): string;
  
  // Tracking
  recordPlaySession(gameId: string, duration: number): Promise<void>;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

1. **Monorepo Setup**
   - Initialize Turborepo with pnpm
   - Configure TypeScript base config
   - Set up ESLint and Prettier
   - Create package structure

2. **Database Package**
   - Define schema with migrations
   - Implement platform adapters (mobile/desktop)
   - Create query builders
   - Add seed data for platforms

3. **Core Package - Models**
   - Define TypeScript interfaces
   - Create Zod schemas for validation
   - Implement model factories

### Phase 2: Core Services (Week 3-4)

4. **Core Package - Services**
   - Implement LibraryService
   - Implement ScannerService
   - Implement MetadataService
   - Implement LaunchService

5. **Emulators Package**
   - Create emulator registry
   - Implement auto-detection
   - Build launch templates

6. **State Management**
   - Set up Zustand stores
   - Implement persistence
   - Add React Query integration

### Phase 3: UI Components (Week 5-6)

7. **UI Package - Core Components**
   - Button, Input, Card components
   - Theme system implementation
   - Design tokens

8. **UI Package - Feature Components**
   - GameCard component
   - GameGrid with virtualization
   - SearchBar with autocomplete
   - Sidebar navigation
   - Platform selector

### Phase 4: Desktop App (Week 7-8)

9. **Electron Main Process**
   - Window management
   - IPC handlers
   - Native menus
   - File system operations

10. **Electron Renderer**
    - App shell and navigation
    - Screen implementations
    - Desktop-specific features

11. **Desktop Build & Distribution**
    - electron-builder config
    - Code signing (macOS/Windows)
    - Auto-update system

### Phase 5: Mobile App (Week 9-10)

12. **React Native Setup**
    - Project initialization
    - Native modules configuration
    - Navigation setup

13. **Mobile Screens**
    - Library screen
    - Game detail screen
    - Settings screen
    - Platform browser

14. **Mobile Build & Distribution**
    - iOS build configuration
    - Android build configuration
    - App store assets

### Phase 6: Polish & Testing (Week 11-12)

15. **Testing**
    - Unit tests for services
    - Component tests
    - E2E tests for critical flows

16. **Performance Optimization**
    - Image caching
    - Query optimization
    - Bundle size reduction

17. **Documentation**
    - API documentation
    - User guide
    - Contributing guide

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| React Native/Electron code sharing complexity | Medium | High | Clear abstraction layers, platform adapters |
| SQLite performance with large libraries | Low | Medium | Proper indexing, query optimization |
| Cross-platform emulator path handling | High | Medium | Path normalization utilities |
| App store rejection (iOS) | Medium | High | Follow guidelines, no ROM downloading |
| Metadata service rate limits | Medium | Low | Caching, local database fallback |

---

## Success Criteria

- [ ] All 5 platforms build and run successfully
- [ ] Library with 1000+ games loads in < 2 seconds
- [ ] Games launch correctly with configured emulators
- [ ] Search returns results in < 100ms
- [ ] Test coverage > 80% for core package
- [ ] No critical accessibility issues

---

## Repository & Distribution

### Repository

| Item | Value |
|------|-------|
| **Name** | emuz |
| **License** | GPL-3.0 |
| **Package Scope** | @emuz/* |

### Metadata Distribution

| Item | Value |
|------|-------|
| **Repository** | emuz-metadata |
| **Hosting** | GitHub Releases |
| **Format** | SQLite .db.gz (~50-100MB) |
| **Update Frequency** | Monthly |
| **Download URL** | `github.com/<owner>/emuz-metadata/releases/latest/download/metadata.db.gz` |

### Development Environment

| Tool | Version |
|------|---------|
| Node.js | 22 LTS |
| pnpm | 9.x |
| Xcode | 15+ (for iOS) |
| Android Studio | Latest (for Android) |
| VS Code | Recommended IDE |
- [ ] Documentation complete for all public APIs

---

## Research Notes

### React Native + Electron Code Sharing

The recommended approach is to use a monorepo with shared packages. Key considerations:

1. **Use `react-native-web`** for maximum component sharing
2. **Platform-specific files** use `.native.ts` / `.web.ts` extensions
3. **Avoid native modules** in shared packages when possible
4. **Use dependency injection** for platform services

### SQLite Considerations

- **Mobile**: `react-native-sqlite-storage` (async, promise-based)
- **Desktop**: `better-sqlite3` (sync, faster for desktop)
- **Unified interface**: Create adapter pattern to abstract differences

### Emulator Launch Commands

Common patterns:
- RetroArch: `retroarch -L <core> "<rom_path>"`
- Dolphin: `dolphin-emu -e "<rom_path>"`
- PCSX2: `pcsx2 "<rom_path>"`

Store templates in emulator registry with placeholders.
