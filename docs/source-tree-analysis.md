# EmuZ — Source Tree Analysis

Generated: 2026-03-19 | Scan level: exhaustive

## Root Level

```
emuz/
├── apps/                    # Runnable applications
├── libs/                    # Shared libraries (consumed by apps)
├── android/                 # React Native Android project root
├── docs/                    # Documentation (this directory)
├── _bmad-output/            # AI planning artifacts (PRD, stories, architecture)
├── _bmad/                   # BMAD framework agents, skills, config
├── .claude/                 # Claude Code settings + skills
├── .github/                 # GitHub Actions workflows + templates
├── .husky/                  # Git hook scripts
├── package.json             # Root workspace manifest + scripts
├── pnpm-workspace.yaml      # Workspace package globs (apps/*, libs/*)
├── nx.json                  # Nx targets, caching, plugins
├── tsconfig.base.json       # Root TypeScript path aliases (@emuz/* → libs/*)
├── tsconfig.json            # Root TypeScript project references
├── eslint.config.cjs        # ESLint 9.x flat config (module boundaries + rules)
├── .eslintrc.json           # ESLint legacy config (compatibility)
├── .prettierrc.json         # Prettier config (singleQuote, printWidth 100)
├── .lintstagedrc.json       # lint-staged: ESLint + Prettier on staged files
├── .mcp.json                # MCP server config (Context7, Nx)
└── pnpm-lock.yaml           # Lock file (changing this busts ALL Nx caches)
```

---

## apps/desktop/ — Electron Desktop App

**Type:** desktop | **Tech:** Electron 33.x + Vite + React 18 + Zustand

```
apps/desktop/
├── src/
│   ├── main/                           # Electron main process (Node.js context)
│   │   ├── index.ts                    # ENTRY — BrowserWindow creation, lifecycle,
│   │   │                               #   window controls, IPC orchestration
│   │   └── ipc/
│   │       ├── index.ts                # Registers all IPC handlers
│   │       ├── database.ts             # 9 channels: db:init, db:query, db:queryOne,
│   │       │                           #   db:execute, db:transaction, db:migrate,
│   │       │                           #   db:info, db:backup, db:vacuum
│   │       ├── filesystem.ts           # 15 channels: fs:read/write/binary,
│   │       │                           #   fs:delete/exists/stat/mkdir/list,
│   │       │                           #   fs:pickFolder/pickFile/saveDialog,
│   │       │                           #   fs:getPath/copy/move
│   │       └── launcher.ts             # 8 channels: launcher:detectEmulators,
│   │                                   #   launcher:launchGame, launcher:isRunning,
│   │                                   #   launcher:stopGame, launcher:getRunningGames,
│   │                                   #   launcher:launchCommand, launcher:showInFolder,
│   │                                   #   launcher:getCommandTemplate
│   │
│   ├── preload/                        # Context isolation bridge
│   │   └── index.ts                    # BRIDGE — exposes window.electron = { db, fs,
│   │                                   #   launcher, app, window, shell } to renderer
│   │                                   #   IPC allowlist: ['app:ready','scan:start','scan:cancel']
│   │
│   └── renderer/                       # React SPA (browser context, no Node.js)
│       ├── index.html                  # Entry HTML — CSP, custom scrollbar CSS
│       ├── main.tsx                    # React root — createRoot(StrictMode)
│       ├── App.tsx                     # Root: ErrorBoundary → ThemeProvider → HashRouter
│       ├── Layout.tsx                  # Shell: Sidebar (Platforms/Collections) +
│       │                               #   Header (logo, SearchBar, window controls) +
│       │                               #   Content (route outlet)
│       ├── routes.tsx                  # HashRouter — 8 routes, all lazy-loaded:
│       │                               #   /, /library, /platform/:id, /genre/:id,
│       │                               #   /collection/:id, /game/:id, /settings, /setup
│       ├── components/
│       │   └── ErrorBoundary.tsx       # Class component — catches render errors,
│       │                               #   shows error details + reload/reset
│       ├── providers/
│       │   └── ThemeProvider.tsx       # CSS variable injection, system theme listener,
│       │                               #   reads useSettingsStore().theme
│       └── screens/
│           ├── index.ts                # Barrel export
│           ├── HomeScreen.tsx          # Dashboard — stats, recent, favorites, platform shortcuts
│           ├── LibraryScreen.tsx       # Game grid — filter chips, pagination, favorites toggle
│           ├── PlatformScreen.tsx      # Platform hero (wallpaper, icon, meta) + game grid
│           ├── GenreScreen.tsx         # Genre display (name, color, emoji) + game grid
│           ├── CollectionScreen.tsx    # Collection header + rename/delete + game grid
│           ├── GameDetailScreen.tsx    # Cover, metadata, play stats, emulator picker,
│           │                           #   collections menu, favorite toggle (566 lines)
│           ├── SettingsScreen.tsx      # 5 sections: General, Library (ROM dirs),
│           │                           #   Appearance (theme/card size), Emulators, About
│           └── SetupWizard.tsx         # First-run — 5 steps: welcome, directories,
│                                       #   emulators, appearance, complete
│
├── electron-builder.yml                # BUILD — app ID: com.emuz.app
│                                       #   macOS: DMG+ZIP (x64+arm64)
│                                       #   Windows: NSIS+portable (x64)
│                                       #   Linux: AppImage+deb (x64)
│                                       #   output: release/
├── electron.vite.config.ts             # Vite config for main+preload+renderer processes
│                                       #   externals: better-sqlite3, @emuz/* libs
├── vite.config.ts                      # Vite config for web-only builds + testing
├── vitest.config.ts                    # Vitest (jsdom, renderer only, no tests yet)
├── tsconfig.json                       # Extends tsconfig.base.json, paths: @/* @main/* etc.
├── package.json                        # v0.0.1, Electron 33.4.11, React 18.3.1
└── project.json                        # Nx project config (build, dev, package, typecheck)
```

**Critical entry points:**

- Main process: `src/main/index.ts`
- Preload: `src/preload/index.ts`
- Renderer: `src/renderer/main.tsx`

**IPC channel count:** 40+ channels across 6 categories (app info, window, shell, filesystem, database, launcher)

---

## apps/mobile/ — React Native Mobile App

**Type:** mobile | **Tech:** React Native 0.81.5 + Expo 54 (bare) + NativeWind 4.x

```
apps/mobile/
├── src/
│   ├── App.tsx                         # ROOT — init state machine: loading splash →
│   │                                   #   initializeApp() → isFirstRun() → RootNavigator
│   │                                   #   Wraps: global.css (NativeWind), AppProviders
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx           # createNativeStackNavigator — 9 routes:
│   │   │                               #   Main (tab), GameDetail (modal), PlatformDetail,
│   │   │                               #   GenreDetail, CollectionDetail, Settings,
│   │   │                               #   EmulatorConfig, ScanProgress (transparent modal), Setup
│   │   │                               #   Custom EmuZ theme: bg #0F172A, primary #10B981
│   │   ├── TabNavigator.tsx            # createBottomTabNavigator — 5 tabs:
│   │   │                               #   Home🏠  Platforms🎮  Library📚  Genres🏷  Collections📁
│   │   ├── types.ts                    # RootStackParamList, MainTabParamList, screen props
│   │   └── index.ts
│   │
│   ├── screens/                        # 14 screens
│   │   ├── HomeScreen.tsx              # Stats widget, recent games, favorites, quick platforms
│   │   ├── LibraryScreen.tsx           # 3-col grid + search input + sort/filter chips
│   │   ├── PlatformsScreen.tsx         # 2-col wallpaper cards + game counts
│   │   ├── GenresScreen.tsx            # List with emoji + game counts
│   │   ├── CollectionsScreen.tsx       # Collection items + create modal
│   │   ├── GameDetailScreen.tsx        # Cover + metadata grid + play button + file info
│   │   ├── PlatformDetailScreen.tsx    # Hero wallpaper + 3-col game grid
│   │   ├── GenreDetailScreen.tsx       # Genre header + 3-col game grid
│   │   ├── CollectionDetailScreen.tsx  # Collection header + 3-col grid, long-press to remove
│   │   ├── SearchScreen.tsx            # Auto-focused input + 3-col results
│   │   ├── SettingsScreen.tsx          # 5 sections: Library, Appearance, Emulators, Data, About
│   │   ├── SetupScreen.tsx             # 5-step wizard + progress dots
│   │   ├── ScanProgressScreen.tsx      # Transparent modal — progress bar, file stats
│   │   ├── EmulatorConfigScreen.tsx    # Placeholder (emulator ID display)
│   │   └── index.ts
│   │
│   ├── providers/
│   │   └── AppProviders.tsx            # Nests: GestureHandlerRootView →
│   │                                   #   SafeAreaProvider → QueryClientProvider
│   │                                   #   (staleTime: 5min, retry: 2)
│   │
│   ├── services/
│   │   ├── init.ts                     # initializeApp(), initializeDatabase() (TODO),
│   │   │                               #   initializeI18n() (TODO), isFirstRun(), completeFirstRun()
│   │   ├── FileService.ts              # RNFS wrapper: 20+ methods — read/write/delete,
│   │   │                               #   listDir, scanForROMs, pickFiles, calculateHash (MD5/SHA256)
│   │   ├── LauncherService.ts          # Known emulators config (RetroArch, Delta, PPSSPP…)
│   │   │                               #   Platform-specific: Android Intent / iOS URL scheme
│   │   ├── StorageService.ts           # AsyncStorage wrapper: first-run, settings,
│   │   │                               #   ROM folders, theme, grid columns, emulator prefs
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── global.d.ts                 # NativeWind types, .png/.jpg/.svg module declarations
│   │
│   └── global.css                      # @tailwind base/components/utilities
│
├── assets/                             # icon.png, adaptive-icon.png, splash.png
├── e2e/                                # Detox E2E tests
│   ├── jest.config.ts                  # Jest 29.7 + Detox runner, 120s timeout
│   └── smoke.test.ts                   # Launch test + tab bar visibility check
│
├── android/                            # Android native project (separate from root android/)
├── index.js                            # AppRegistry.registerComponent entry
├── app.json                            # Expo manifest: name=EmuZ, slug=emuz, v0.0.1
│                                       #   iOS: bundleId com.emuz.app, file-sharing enabled
│                                       #   Android: package com.emuz.app, storage permissions
├── babel.config.js                     # babel-preset-expo + nativewind + reanimated
├── metro.config.js                     # Monorepo resolver: watchFolders, extraNodeModules
├── tailwind.config.js                  # NativeWind preset + EmuZ color palette
├── .detoxrc.ts                         # Detox: iOS (iPhone 16), Android (Pixel_7_API_34)
├── tsconfig.json                       # Extends tsconfig.base.json, JSX react-native
└── package.json                        # RN 0.81.5, Expo 54, NativeWind 4.x
```

---

## libs/core/ — @emuz/core

**Type:** library | **Purpose:** Business logic layer — models, services, stores, hooks

```
libs/core/src/
├── index.ts                            # PUBLIC API — re-exports all below
│
├── models/                             # Zod schemas + inferred TypeScript types
│   ├── game.ts                         # GameSchema — 24 fields incl. playCount, playTime,
│   │                                   #   isFavorite, platformName (denormalized join)
│   │                                   #   NOTE: romType NOT YET in schema (ADR-014 pending)
│   ├── platform.ts                     # PlatformSchema — romExtensions[], color (#hex regex)
│   │                                   #   PlatformCategories enum (11 values)
│   ├── emulator.ts                     # EmulatorSchema — commandTemplate, corePath, platforms[]
│   │                                   #   KnownEmulators enum (12 values incl. Delta, Provenance)
│   ├── collection.ts                   # CollectionSchema — gameIds[], isSystem
│   │                                   #   SystemCollections enum (FAVORITES, RECENTLY_PLAYED, MOST_PLAYED)
│   ├── widget.ts                       # WidgetSchema — type (7 types), size (4 sizes), config JSON
│   │                                   #   3 widget config sub-schemas (RecentGames, Stats, PlatformShortcuts)
│   ├── genre.ts                        # GenreSchema — slug (kebab-case regex), gameCount
│   │                                   #   CommonGenres (16 values)
│   └── settings.ts                     # SettingsSchema — theme/layout/scan/metadata/emulator/advanced
│                                       #   getDefaultSettings() factory
│
├── services/                           # Service interfaces + implementations
│   ├── LibraryService.ts               # ILibraryService — 20+ methods: games CRUD,
│   │                                   #   collections, favorites, play tracking
│   │                                   #   Uses: DrizzleDb, LEFT JOIN games+platforms
│   ├── ScannerService.ts               # IScannerService — AsyncGenerator<ScanProgress>,
│   │                                   #   ROM detection via 53-ext EXTENSION_PLATFORM_MAP,
│   │                                   #   SHA-256 hashing via Web Crypto API
│   ├── MetadataService.ts              # IMetadataService — pluggable MetadataProvider,
│   │                                   #   in-memory caching, cover download
│   ├── LaunchService.ts                # ILaunchService — emulator CRUD, game launching,
│   │                                   #   play session tracking
│   │                                   #   ⚠️ STILL USES legacy DatabaseAdapter (not Drizzle)
│   ├── WidgetService.ts                # IWidgetService — widget CRUD, getWidgetData() dispatcher
│   │                                   #   (recent, favorites, stats, shortcuts, continue, random, genre)
│   └── GenreService.ts                 # IGenreService — group by genre, normalize names,
│                                       #   genre stats (count/playtime/rating)
│
├── stores/                             # Zustand 5.x stores (all with localStorage persist)
│   ├── libraryStore.ts                 # useLibraryStore — games[], platforms[], collections[],
│   │                                   #   filters, sort, getFilteredGames(), getGameById()
│   │                                   #   Persists: filters, sort, selectedPlatformId
│   ├── settingsStore.ts                # useSettingsStore — 30+ settings fields, resetToDefaults()
│   │                                   #   Persists: all fields. Key: 'emuz-settings'
│   ├── uiStore.ts                      # useUIStore — viewMode, modals, toasts (auto-remove 5s),
│   │                                   #   contextMenu, search, scanProgress
│   │                                   #   Persists: viewMode, sidebar. Key: 'emuz-ui'
│   └── widgetsStore.ts                 # useWidgetsStore — widgets[], widgetData Map cache,
│                                       #   reorderWidgets(), toggleVisibility(), moveWidget()
│                                       #   Default: 5 widgets (continue_playing, recent, favorites, stats, shortcuts)
│
├── hooks/                              # React hooks (consume stores + services)
│   ├── useLibrary.ts                   # useLibrary({ service, autoFetch }) — games, actions
│   ├── useSettings.ts                  # useSettings() — thin wrapper around useSettingsStore
│   ├── useWidgets.ts                   # useWidgets({ service, autoFetch }) — widgets + data cache
│   ├── queries/
│   │   ├── gameQueries.ts              # React Query: useGamesQuery, useGameQuery,
│   │   │                               #   useRecentGamesQuery, useFavoritesQuery,
│   │   │                               #   useToggleFavoriteMutation (optimistic), useUpdateGameMutation
│   │   └── metadataQueries.ts          # React Query: useMetadataSearchQuery (stale 5min),
│   │                                   #   useIdentifyGameQuery (stale Infinity), useDownloadCoverMutation
│   └── index.ts
│
├── utils/
│   ├── fileExtensions.ts               # romExtensionMap (53 entries), calculateFileHash (CRC32),
│   │                                   #   extractRomInfoFromFilename (region/revision/flags)
│   └── db.ts                           # DEPRECATED: toDate(), toOptionalDate(), buildUpdateQuery()
│
└── __tests__/                          # 14 test files
    ├── fileExtensions.test.ts
    ├── settingsStore.test.ts
    ├── libraryStore.test.ts
    ├── uiStore.test.ts
    ├── widgetsStore.test.ts
    ├── LibraryService.drizzle.test.ts
    ├── ScannerService.drizzle.test.ts
    ├── MetadataService.drizzle.test.ts
    ├── GenreService.drizzle.test.ts
    ├── WidgetService.drizzle.test.ts
    ├── LaunchService.test.ts
    ├── useLibrary.test.ts
    ├── useWidgets.test.ts
    └── gameQueryKeys.test.ts
```

---

## libs/database/ — @emuz/database

**Type:** library | **Purpose:** Database schema, Drizzle ORM adapters, migrations

```
libs/database/
├── src/
│   ├── index.ts                        # PUBLIC API — tables, DrizzleDb type, adapters,
│   │                                   #   migration functions, seed data
│   ├── schema/
│   │   └── index.ts                    # 9 Drizzle table definitions (see data-models.md)
│   │                                   #   boolean mode for flags, timestamp mode for dates
│   ├── adapters/
│   │   ├── desktop.ts                  # DesktopDatabaseAdapter (@deprecated)
│   │   │                               #   createDrizzleDesktopDb() — RECOMMENDED
│   │   │                               #   Uses: better-sqlite3 (dynamic import)
│   │   ├── mobile.ts                   # MobileDatabaseAdapter (@deprecated)
│   │   │                               #   createDrizzleMobileDb() — RECOMMENDED
│   │   │                               #   Uses: @op-engineering/op-sqlite
│   │   └── index.ts                    # createDatabaseAdapter() factory, detectPlatform()
│   ├── migrations/
│   │   └── index.ts                    # migration001Initial — creates all 8 tables (up/down)
│   │                                   #   runMigrations(), getDatabaseVersion()
│   │                                   #   stampInitialMigration() — Drizzle bridge (ADR-013)
│   ├── seed/
│   │   └── platforms.ts                # platformSeeds — 25 platform definitions
│   │                                   #   (Nintendo×8, Sony×4, Sega×6, Arcade, Atari, SNK, NEC)
│   │                                   #   getPlatformSeedSQL() — generates INSERT statements
│   └── __tests__/
│       ├── schema.test.ts              # In-memory SQLite, 12 test suites covering all tables
│       └── adapters.test.ts            # detectPlatform(), config initialization
│
├── drizzle/
│   ├── 0000_fluffy_shriek.sql          # Drizzle-generated DDL migration (all 9 tables)
│   ├── meta/
│   │   ├── _journal.json               # Migration journal (version 0)
│   │   └── 0000_snapshot.json          # Schema snapshot
│   └── __mocks__/
│       └── op-sqlite.ts                # Vitest mock for @op-engineering/op-sqlite
│                                       #   (allows tests to run without native bindings)
│
├── drizzle.config.ts                   # dialect: sqlite, schema: ./src/schema/index.ts
├── vite.config.mts                     # test: alias op-sqlite → mock
└── package.json                        # drizzle-orm ^0.45.1, better-sqlite3 ^11.8.1
```

---

## libs/emulators/ — @emuz/emulators

**Type:** library | **Purpose:** Emulator registry + platform-aware detector classes

```
libs/emulators/src/
├── index.ts                            # PUBLIC API
├── registry/
│   ├── types.ts                        # EmulatorDefinition, HostPlatform, EmulatorSearchCriteria
│   ├── index.ts                        # emulatorRegistry[], getAllEmulators(), getEmulatorById(),
│   │                                   #   searchEmulators(), getEmulatorsForPlatform(),
│   │                                   #   getEmulatorsForHost(), getRecommendedEmulator()
│   ├── retroarch.ts                    # RetroArch + 10 cores (Nestopia, FCEUmm, Snes9x, bsnes,
│   │                                   #   mGBA, Mupen64Plus, Genesis+GX, Beetle PSX, melonDS, PPSSPP)
│   ├── dolphin.ts                      # Dolphin — GameCube/Wii — Win/macOS/Linux/Android
│   ├── pcsx2.ts                        # PCSX2 — PS2 — Win/macOS/Linux only
│   ├── desmume.ts                      # DeSmuME — NDS — Win/macOS/Linux
│   └── mgba.ts                         # mGBA — GBA/GB/GBC — Win/macOS/Linux/iOS
│
├── detector/
│   └── index.ts                        # DesktopEmulatorDetector (checks install paths),
│                                       #   AndroidEmulatorDetector (package manager query),
│                                       #   IOSEmulatorDetector (URL scheme canOpen),
│                                       #   createDetector() factory
│
└── __tests__/
    └── registry.test.ts                # getAllEmulators, getById, search, platform/host filtering,
                                        #   recommendations, command templates
```

---

## libs/platform/ — @emuz/platform

**Type:** library | **Purpose:** Cross-platform filesystem + emulator launcher abstraction

```
libs/platform/src/
├── index.ts                            # PUBLIC API
├── filesystem/
│   ├── types.ts                        # FileSystemAdapter interface (14 methods),
│   │                                   #   FileInfo, DirectoryListing, ReadOptions,
│   │                                   #   WriteOptions, ScanOptions
│   ├── desktop.ts                      # DesktopFileSystemAdapter — Node.js fs/promises
│   │                                   #   XDG-aware paths on Linux, ~/Documents on macOS/Win
│   ├── android.ts                      # AndroidFileSystemAdapter — react-native-fs
│   │                                   #   PermissionsAndroid for READ/WRITE_EXTERNAL_STORAGE
│   ├── ios.ts                          # IOSFileSystemAdapter — react-native-fs
│   │                                   #   Always returns true for permissions (sandbox security)
│   ├── utils.ts                        # BaseFileSystemAdapter — scanForRoms() recursive impl
│   └── index.ts                        # createFileSystemAdapter(platform?), detectFilePlatform()
│
├── launcher/
│   ├── types.ts                        # EmulatorLauncher interface, LaunchOptions,
│   │                                   #   LaunchResult, EmulatorLaunchConfig
│   ├── desktop.ts                      # DesktopLauncher — child_process.spawn,
│   │                                   #   detached:true (parent can exit), {rom} placeholder
│   ├── android.ts                      # AndroidLauncher — Linking + react-native-send-intent
│   │                                   #   Intent with MIME type for ROM files
│   ├── ios.ts                          # IOSLauncher — Linking.openURL with URL scheme
│   │                                   #   App Store fallback via openAppStore()
│   ├── urlSchemes.ts                   # IOS_EMULATOR_SCHEMES registry (6 emulators)
│   │                                   #   generatePlistSchemes() for Info.plist
│   └── index.ts                        # createLauncher(platform?), detectLauncherPlatform()
│
└── __tests__/
    ├── filesystem.test.ts              # Factory + structural tests (minimal)
    └── launcher.test.ts                # Factory + method existence tests
```

---

## libs/ui/ — @emuz/ui

**Type:** library | **Purpose:** 18 shared React/React Native components + design system

```
libs/ui/src/
├── index.ts                            # PUBLIC API — export * from './themes' + './components'
├── themes/
│   ├── tokens.ts                       # All design tokens: colors (emerald+slate palettes),
│   │                                   #   spacing (24 steps), typography (12 sizes, 9 weights),
│   │                                   #   radius, shadows, z-index, breakpoints,
│   │                                   #   gameCardSizes, widgetSizes, iconSizes
│   ├── dark.ts                         # darkTheme — default theme. bg: #0F172A, surface: #1E293B,
│   │                                   #   text: #F8FAFC, primary: #10B981, border: #334155
│   ├── light.ts                        # lightTheme — bg: #F8FAFC, surface: #FFFFFF,
│   │                                   #   text: #0F172A, border: #E2E8F0
│   └── index.ts                        # getTheme(), isValidThemeName(), themes, ThemeName
│
├── components/
│   ├── index.ts                        # Re-exports all components
│   ├── Button/                         # 4 variants × 3 sizes, loading spinner, icon slots
│   ├── Input/                          # 6 types, error state+message, icon slots
│   ├── Card/                           # 3 variants × 4 padding levels, hover lift
│   ├── Badge/                          # 7 variants × 3 sizes, pill mode, dot mode
│   ├── Icon/                           # Wrapper + 12 built-in SVGs: Search, Play, Heart,
│   │                                   #   HeartFilled, Settings, Home, Grid, Folder,
│   │                                   #   Close, More, ChevronRight, ChevronDown
│   ├── Text/                           # 11 variants (h1-h6, body, bodySmall, caption, label, code)
│   ├── GameCard/                       # 3 sizes: 120×160, 160×220, 200×280
│   │                                   #   Cover art, platform badge, favorite toggle, play overlay
│   ├── GameGrid/                       # CSS grid, IntersectionObserver infinite scroll,
│   │                                   #   skeleton loaders, empty state
│   ├── GameDetail/                     # Full game panel: cover, metadata, emulator picker,
│   │                                   #   play/favorite/edit buttons, max-width 600px
│   ├── SearchBar/                      # Debounced (300ms default), keyboard shortcut ('/'),
│   │                                   #   3 sizes, clear button
│   ├── Sidebar/                        # Collapsible, section collapse toggles, EmuZ logo
│   ├── BottomTabBar/                   # 5 default tabs, badge support, active indicator line
│   ├── PlatformCard/                   # 3 sizes, wallpaper bg, color gradient overlay
│   │                                   #   17 platform-specific colors
│   ├── GenreList/                      # 3 layouts (list/grid/horizontal), GenreItem sub-component
│   │                                   #   12 genre-specific colors
│   └── widgets/
│       ├── WidgetContainer/            # 5 sizes, drag-and-drop, settings/remove buttons
│       ├── RecentGamesWidget/          # Recent games list, relative time format
│       ├── FavoritesWidget/            # Grid of favorite covers, play overlay
│       ├── StatsWidget/                # 3×2 stat grid: games, platforms, playtime, favorites, new, played
│       └── PlatformShortcutsWidget/    # Platform icon grid, game counts
│
└── __tests__/                          # 16 test files (one per component + themes + exports)
```

---

## libs/i18n/ — @emuz/i18n

**Type:** library | **Purpose:** react-i18next configuration + 6 locale files

```
libs/i18n/src/
├── index.ts                            # PUBLIC API — config utils + react-i18next re-exports
├── lib/
│   └── config.ts                       # supportedLanguages (6), initializeI18n(),
│                                       #   changeLanguage(), getCurrentLanguage(),
│                                       #   resources bundle, i18n singleton
│                                       #   namespaces: ['common','games','settings','platforms']
│                                       #   fallbackLng: 'en', useSuspense: true
└── locales/
    ├── en/                             # ✅ COMPLETE — 175 keys across 4 namespaces
    │   ├── common.json                 # navigation (7), actions (20), status (8), time (8), errors (4)
    │   ├── games.json                  # library, card, detail, stats, sort, filter, actions (41 keys)
    │   ├── settings.json               # 7 sections × config keys (46 keys)
    │   └── platforms.json              # categories (11), platform list (35), info (5) = 51 keys
    ├── fr/                             # ⚠️ 21% — common.json only (37 keys)
    ├── es/                             # ⚠️ 21% — common.json only (37 keys)
    ├── de/                             # ⚠️ 21% — common.json only (37 keys)
    ├── ja/                             # ⚠️ 21% — common.json only (37 keys)
    └── zh/                             # ⚠️ 21% — common.json only (37 keys)
                                        # MISSING: 570 keys × 5 languages for games/settings/platforms
```

---

## .github/ — CI/CD

```
.github/
├── workflows/
│   ├── test.yml                        # Trigger: push to main/develop + all PRs
│   │                                   # Jobs: test (ubuntu) + build-desktop (matrix: ubuntu/macos/windows)
│   │                                   # Node 22 LTS, pnpm frozen lockfile, Nx cache (pnpm-lock hash)
│   │                                   # Coverage → Codecov
│   └── release.yml                     # Trigger: v* tags
│                                       # Builds + signs desktop: CSC_LINK, APPLE_ID secrets
│                                       # Uploads: *.dmg *.exe *.AppImage *.deb *.rpm to GitHub releases
├── ISSUE_TEMPLATE/
│   ├── bug.yml
│   └── story.yml
└── pull_request_template.md
```

---

## android/ — React Native Android Project Root

```
android/
├── app/
│   ├── build.gradle                    # com.anonymous.emuzsource (⚠️ placeholder ID)
│   │                                   # Hermes enabled, New Architecture (Fabric/TurboModules)
│   │                                   # ABIs: armeabi-v7a, arm64-v8a, x86, x86_64
│   └── src/
├── settings.gradle                     # Expo autolinking, react-native-gradle-plugin
└── gradle.properties                   # Hermes=true, newArchEnabled=true, edge-to-edge
```
