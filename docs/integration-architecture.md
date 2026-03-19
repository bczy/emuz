# EmuZ — Integration Architecture

Generated: 2026-03-19 | Source: exhaustive scan of all packages

This document describes how the 8 packages in the EmuZ monorepo communicate and depend on each other.

---

## Package Dependency Graph

```
Leaf packages (no @emuz/* dependencies):
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐
│ @emuz/database │  │ @emuz/platform  │  │ @emuz/emulators  │  │  @emuz/i18n    │
└───────┬────────┘  └────────┬────────┘  └─────────┬────────┘  └───────┬────────┘
        │                    │                      │                   │
        └──────────┬─────────┘                      │                   │
                   ▼                                 │                   │
            @emuz/core                               │                   │
         (services, models,                          │                   │
          stores, hooks)                             │                   │
                   │                                 │                   │
                   ▼                                 │                   │
             @emuz/ui                                │                   │
          (components, themes)                       │                   │
                   │                                 │                   │
        ┌──────────┴──────────────────────────────────────────────────────┐
        ▼                                                                  ▼
   apps/desktop                                                      apps/mobile
 (Electron app)                                               (React Native app)
```

**Key constraint:** No lib may import from `apps/`. Libs may only import other libs further down the graph (no circular deps). Enforced by `@nx/enforce-module-boundaries` ESLint rule.

---

## Library Dependencies Detail

| Package           | Imports from                                                               | Notes                                                                   |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `@emuz/database`  | (none)                                                                     | Fully self-contained. Externals: drizzle-orm, better-sqlite3, op-sqlite |
| `@emuz/platform`  | (none)                                                                     | Self-contained. Peer dep: react-native ≥ 0.70                           |
| `@emuz/emulators` | (none)                                                                     | Zero dependencies — pure definitions                                    |
| `@emuz/i18n`      | (none)                                                                     | Self-contained. Deps: i18next, react-i18next                            |
| `@emuz/core`      | `@emuz/database` (DrizzleDb, tables), `@emuz/platform` (FileSystemAdapter) | Business logic                                                          |
| `@emuz/ui`        | `@emuz/core` (Game, Platform, Collection, Genre, Emulator, Widget types)   | Component types                                                         |
| `apps/desktop`    | all 6 libs                                                                 | Main + renderer processes                                               |
| `apps/mobile`     | all 6 libs                                                                 | React Native app                                                        |

---

## Desktop IPC Architecture

The Electron desktop app enforces a security boundary between the main process (Node.js, full access) and the renderer (browser sandbox, no Node.js).

```
┌─────────────────────────────────────────────────────────────────────┐
│  Renderer Process (React, browser sandbox)                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  React Screens → useLibraryStore / useSettingsStore          │    │
│  │  window.electron.db.* / fs.* / launcher.*                   │    │
│  └────────────────────────┬────────────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────────────┘
                           IPC
              (contextBridge, allowlisted channels)
┌───────────────────────────┼─────────────────────────────────────────┐
│  Preload Script (limited Node access)                                │
│  exposes: window.electron = { db, fs, launcher, app, window, shell }│
└───────────────────────────┼─────────────────────────────────────────┘
                           IPC
                    (ipcMain.handle)
┌───────────────────────────┼─────────────────────────────────────────┐
│  Main Process (full Node.js)                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐     │
│  │ database │  │  filesystem  │  │        launcher           │     │
│  │  .ts     │  │    .ts       │  │          .ts              │     │
│  │ (9 ch.)  │  │  (15 ch.)    │  │        (8 ch.)            │     │
│  └────┬─────┘  └──────┬───────┘  └──────────┬────────────────┘     │
│       │               │                     │                        │
│   better-sqlite3   Node.js fs         child_process.spawn           │
│   + Drizzle ORM   (validated paths)   (detached, unref)             │
└─────────────────────────────────────────────────────────────────────┘
```

### IPC Channel Reference

**Database channels** (`src/main/ipc/database.ts`)

| Channel          | Direction | Purpose                                                          |
| ---------------- | --------- | ---------------------------------------------------------------- |
| `db:init`        | invoke    | Initialize database at `~/.config/EmuZ/emuz.db`, enable WAL + FK |
| `db:query`       | invoke    | `SELECT *` → returns all rows                                    |
| `db:queryOne`    | invoke    | Returns first row or null                                        |
| `db:execute`     | invoke    | INSERT/UPDATE/DELETE → `{ changes, lastInsertRowid }`            |
| `db:transaction` | invoke    | Batch statements atomically                                      |
| `db:migrate`     | invoke    | Run versioned migrations                                         |
| `db:info`        | invoke    | `{ path, size, tables[] }`                                       |
| `db:backup`      | invoke    | Copy DB to specified path                                        |
| `db:vacuum`      | invoke    | Optimize DB file                                                 |

**Filesystem channels** (`src/main/ipc/filesystem.ts`)

| Channel          | Direction | Purpose                                                    |
| ---------------- | --------- | ---------------------------------------------------------- |
| `fs:read`        | invoke    | Read text file                                             |
| `fs:readBinary`  | invoke    | Read binary file → Uint8Array                              |
| `fs:write`       | invoke    | Write text file                                            |
| `fs:writeBinary` | invoke    | Write binary file                                          |
| `fs:delete`      | invoke    | Delete file                                                |
| `fs:exists`      | invoke    | Check existence → boolean                                  |
| `fs:stat`        | invoke    | File metadata → FileInfo                                   |
| `fs:mkdir`       | invoke    | Create directory (recursive)                               |
| `fs:list`        | invoke    | List directory entries                                     |
| `fs:pickFolder`  | invoke    | Native folder picker dialog                                |
| `fs:pickFile`    | invoke    | Native file picker dialog                                  |
| `fs:saveDialog`  | invoke    | Native save dialog                                         |
| `fs:getPath`     | invoke    | System paths: home/appData/userData/temp/desktop/downloads |
| `fs:copy`        | invoke    | Copy file                                                  |
| `fs:move`        | invoke    | Move/rename file                                           |

**Launcher channels** (`src/main/ipc/launcher.ts`)

| Channel                       | Direction | Purpose                                         |
| ----------------------------- | --------- | ----------------------------------------------- |
| `launcher:detectEmulators`    | invoke    | Scan PATH + install paths for known emulators   |
| `launcher:launchGame`         | invoke    | Spawn emulator with ROM path (detached + unref) |
| `launcher:isRunning`          | invoke    | Check if game process is alive by gameId        |
| `launcher:stopGame`           | invoke    | Kill process by gameId                          |
| `launcher:getRunningGames`    | invoke    | List currently running gameIds                  |
| `launcher:launchCommand`      | invoke    | Generic command execution                       |
| `launcher:showInFolder`       | invoke    | shell.showItemInFolder()                        |
| `launcher:getCommandTemplate` | invoke    | Emulator-specific argument template             |

**Window/App channels** (`src/main/index.ts`)

| Channel                  | Direction        | Purpose                        |
| ------------------------ | ---------------- | ------------------------------ |
| `app:version`            | invoke           | app.getVersion()               |
| `app:platform`           | invoke           | `{ platform, arch, electron }` |
| `window:minimize`        | send             | Minimize window                |
| `window:maximize`        | send             | Toggle maximize                |
| `window:close`           | send             | Close window                   |
| `window:isMaximized`     | invoke           | Boolean                        |
| `window:maximizeChange`  | event → renderer | Fired on maximize state change |
| `shell:openExternal`     | invoke           | Open URL in browser            |
| `shell:showItemInFolder` | invoke           | Reveal in Finder/Explorer      |
| `scan:progress`          | event → renderer | `{ current, total, path }`     |

---

## Mobile Integration Architecture

No IPC in mobile — direct JavaScript imports through Metro monorepo resolver.

```
RootNavigator
     │
     ▼
TabNavigator + Screens
     │                    │                    │
     ▼                    ▼                    ▼
useLibraryStore()    FileService.ts      LauncherService.ts
 (@emuz/core)      (RNFS wrapper)       (Linking URL schemes)
     │                    │                    │
     ▼                    ▼                    ▼
 LibraryService     @emuz/platform      @emuz/emulators
  (DrizzleDb)      AndroidFS / IOSFS    registry + iOS URL schemes
     │
     ▼
 op-sqlite + Drizzle
 (@emuz/database)
```

**Metro resolver config** (`apps/mobile/metro.config.js`):

- `watchFolders`: includes workspace root
- `extraNodeModules`: maps `@emuz/*` to lib source directories
- `disableHierarchicalLookup: true` (prevents duplicate React/RN modules)

---

## Data Flow

### User opens the app

```
1. App.tsx → initializeApp()
2.   → @emuz/database: createDrizzleDesktopDb() or createDrizzleMobileDb()
3.   → runMigrations(db)
4.   → @emuz/i18n: initializeI18n(language)
5.   → isFirstRun() → show SetupWizard or RootNavigator
```

### User views library

```
1. LibraryScreen mounts → useLibraryStore().games
2. If empty: useGamesQuery(libraryService) → LibraryService.getAllGames()
3.   → Drizzle: SELECT games.*, platforms.* FROM games LEFT JOIN platforms
4.   → rowToGame() converts DB row to Game domain model
5.   → Store: setGames(games)
6.   → getFilteredGames() applies active filters/sort from LibraryFilters
7.   → Renders GameGrid with filtered games
```

### User plays a game (Desktop)

```
1. GameDetailScreen: onPlay(game, emulatorId)
2. LaunchService.launchGame(game, emulatorId)
3.   → getDefaultEmulator(game.platformId)
4.   → buildLaunchCommand(game, emulator)  → replaces {exe}/{rom}/{core} placeholders
5.   → IPC: launcher:launchGame → child_process.spawn(emulatorPath, args, { detached: true })
6.   → spawn.unref() — parent process can exit independently
7.   → LaunchService.recordPlaySession(gameId, 0) — start tracking
```

### User plays a game (Mobile)

```
1. GameDetailScreen: LauncherService.launchGame(game)
2.   Platform.OS === 'android':
       → SendIntent with packageName, ROM file URI, MIME type
3.   Platform.OS === 'ios':
       → Linking.openURL('retroarch://open?rom=gameName')
4.   → If app not installed: offer App Store redirect
```

### ROM scan (Desktop)

```
1. SettingsScreen: "Scan Now" → ScannerService.scan(path)
2.   → AsyncGenerator<ScanProgress>
3.   → For each file: detectPlatformByExtension(ext) → EXTENSION_PLATFORM_MAP (53 entries)
4.   → calculateHash(filePath) → SHA-256 via Web Crypto API
5.   → extractRomInfoFromFilename() → title, region, revision
6.   → Drizzle: INSERT INTO games ON CONFLICT DO UPDATE
7.   → Yields ScanProgress: { phase, currentPath, filesFound, filesProcessed, gamesAdded }
8.   → UIStore.setScanProgress() → ScanProgressModal updates in real-time
```

---

## TypeScript Path Aliases (tsconfig.base.json)

All packages use these workspace-root path aliases:

```typescript
"@emuz/core"           → "libs/core/src/index.ts"
"@emuz/database"       → "libs/database/src/index.ts"
"@emuz/database/schema"→ "libs/database/src/schema/index.ts"
"@emuz/platform"       → "libs/platform/src/index.ts"
"@emuz/ui"             → "libs/ui/src/index.ts"
"@emuz/emulators"      → "libs/emulators/src/index.ts"
"@emuz/i18n"           → "libs/i18n/src/index.ts"
```

---

## Nx Build Order

Nx enforces `build` target runs `^build` (dependencies first). Effective order:

```
1. @emuz/database, @emuz/platform, @emuz/emulators, @emuz/i18n  (parallel)
2. @emuz/core
3. @emuz/ui
4. apps/desktop, apps/mobile  (parallel)
```

---

## Security Boundaries

| Boundary                  | Enforcement                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| Renderer → Main (Desktop) | contextBridge allowlist; no direct Node.js access from renderer      |
| File path validation      | @emuz/platform adapters validate paths; prevent `../` traversal      |
| ROM file protection       | Read-only access; never written to or distributed                    |
| No telemetry              | No network calls except opt-in metadata scraping (ScreenScraper)     |
| Module boundaries         | `@nx/enforce-module-boundaries` prevents circular or invalid imports |
