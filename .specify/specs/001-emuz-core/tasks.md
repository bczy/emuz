# EmuZ - Implementation Tasks

> _Daijishou-inspired cross-platform emulator frontend_

## Feature: 001-emuz-core

## Created: 2026-01-04

## Updated: 2026-01-04

## Status: Ready for Implementation

---

## Phase 1: Foundation

### Task 1.1: Monorepo Initialization

**Priority**: Critical | **Effort**: 2h | **Dependencies**: None

- [x] Create Nx workspace with `npx create-nx-workspace@latest emuz --preset=apps`
- [x] Configure pnpm as package manager
- [x] Create `.npmrc` with `node-linker=hoisted`
- [x] Set up `nx.json` configuration
- [x] Create `tsconfig.base.json` for shared TypeScript config
- [x] Configure ESLint with `@nx/eslint`
- [x] Configure Prettier
- [x] Add `.gitignore` entries
- [x] Create workspace structure (`apps/`, `libs/`)

**Files to create:**

- `pnpm-workspace.yaml`
- `nx.json`
- `.npmrc`
- `package.json`
- `tsconfig.base.json`
- `.eslintrc.json`
- `.prettierrc`

---

### Task 1.2: Database Package Setup

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.1

- [x] Create `libs/database/package.json`
- [x] Set up TypeScript configuration
- [x] Define database schema types
- [x] Create migration system
- [x] Implement initial migration (all tables)
- [x] Add platform seed data

**Files to create:**

- `libs/database/package.json`
- `libs/database/tsconfig.json`
- `libs/database/src/index.ts`
- `libs/database/src/schema/index.ts`
- `libs/database/src/schema/games.ts`
- `libs/database/src/schema/platforms.ts`
- `libs/database/src/schema/emulators.ts`
- `libs/database/src/schema/collections.ts`
- `libs/database/src/migrations/001_initial.ts`
- `libs/database/src/seed/platforms.ts`

---

### Task 1.3: Database Platform Adapters

**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 1.2

- [x] Create adapter interface
- [x] Implement desktop adapter (better-sqlite3)
- [x] Implement mobile adapter (react-native-sqlite-storage)
- [x] Create adapter factory
- [x] Add connection management
- [x] Write unit tests

**Files to create:**

- `libs/database/src/adapters/types.ts`
- `libs/database/src/adapters/desktop.ts`
- `libs/database/src/adapters/mobile.ts`
- `libs/database/src/adapters/index.ts`
- `libs/database/src/__tests__/adapters.test.ts`

---

### Task 1.4: Core Package - Models

**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 1.1

- [x] Create `libs/core/package.json`
- [x] Define Game model and Zod schema
- [x] Define Platform model and Zod schema (with wallpaper support)
- [x] Define Emulator model and Zod schema
- [x] Define Collection model and Zod schema
- [x] Define Widget model and Zod schema _(NEW - Daijishou)_
- [x] Define Genre model and Zod schema _(NEW - Daijishou)_
- [x] Define Settings model
- [x] Export all models

**Files to create:**

- `libs/core/package.json`
- `libs/core/tsconfig.json`
- `libs/core/src/index.ts`
- `libs/core/src/models/Game.ts`
- `libs/core/src/models/Platform.ts`
- `libs/core/src/models/Emulator.ts`
- `libs/core/src/models/Collection.ts`
- `libs/core/src/models/Widget.ts` _(NEW)_
- `libs/core/src/models/Genre.ts` _(NEW)_
- `libs/core/src/models/Settings.ts`
- `libs/core/src/models/index.ts`

### Task 1.5: Platform Package - File System Adapters _(NEW)_

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.1

- [x] Create `libs/platform/package.json`
- [x] Define file system adapter interface
- [x] Implement desktop adapter (Node.js fs)
- [x] Implement Android adapter (SAF via native module)
- [x] Implement iOS adapter (Documents + Files)
- [x] Create adapter factory with platform detection
- [ ] Write unit tests

**Files to create:**

- `libs/platform/package.json`
- `libs/platform/tsconfig.json`
- `libs/platform/src/index.ts`
- `libs/platform/src/filesystem/types.ts`
- `libs/platform/src/filesystem/desktop.ts`
- `libs/platform/src/filesystem/android.ts`
- `libs/platform/src/filesystem/ios.ts`
- `libs/platform/src/filesystem/index.ts`

### Task 1.6: Platform Package - Emulator Launchers _(NEW)_

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.5

- [x] Define launcher interface
- [x] Implement desktop launcher (process spawn)
- [x] Implement Android launcher (Intent system)
- [x] Implement iOS launcher (URL schemes)
- [x] Create launcher factory
- [x] Add URL scheme registry for iOS
- [ ] Write unit tests

**Files to create:**

- `libs/platform/src/launcher/types.ts`
- `libs/platform/src/launcher/desktop.ts`
- `libs/platform/src/launcher/android.ts`
- `libs/platform/src/launcher/ios.ts`
- `libs/platform/src/launcher/urlSchemes.ts`
- `libs/platform/src/launcher/index.ts`

---

## Phase 2: Core Services

### Task 2.1: LibraryService Implementation

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.3, Task 1.4

- [x] Create service interface
- [x] Implement getAllGames()
- [x] Implement getGameById()
- [x] Implement getGamesByPlatform()
- [x] Implement searchGames() with fuzzy search
- [x] Implement updateGame()
- [x] Implement deleteGame()
- [x] Implement collection methods
- [x] Implement favorites methods
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/LibraryService.ts`
- `libs/core/src/services/types.ts`
- `libs/core/src/__tests__/LibraryService.test.ts`

---

### Task 2.2: ScannerService Implementation

**Priority**: Critical | **Effort**: 5h | **Dependencies**: Task 2.1

- [x] Create service interface
- [x] Implement addDirectory()
- [x] Implement removeDirectory()
- [x] Implement platform detection by extension
- [x] Implement recursive file scanning
- [x] Implement hash calculation
- [x] Create async generator for progress
- [x] Handle cancellation
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/ScannerService.ts`
- `libs/core/src/utils/fileExtensions.ts`
- `libs/core/src/utils/hash.ts`
- `libs/core/src/__tests__/ScannerService.test.ts`

---

### Task 2.3: MetadataService Implementation

**Priority**: High | **Effort**: 4h | **Dependencies**: Task 2.1

- [x] Create service interface
- [x] Implement game identification (hash-based)
- [x] Implement metadata search
- [x] Implement cover download
- [x] Implement batch refresh
- [ ] Add caching layer
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/MetadataService.ts`
- `libs/core/src/services/metadata/providers/index.ts`
- `libs/core/src/__tests__/MetadataService.test.ts`

---

### Task 2.4: LaunchService Implementation

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 2.1

- [x] Create service interface
- [x] Implement getEmulators()
- [x] Implement detectEmulators() per platform
- [x] Implement addEmulator()
- [x] Implement setDefaultEmulator()
- [x] Implement launchGame()
- [x] Implement command builder
- [x] Implement play session tracking
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/LaunchService.ts`
- `libs/core/src/utils/commandBuilder.ts`
- `libs/core/src/__tests__/LaunchService.test.ts`

---

### Task 2.5: Emulators Package

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 1.1

- [x] Create `libs/emulators/package.json`
- [x] Define emulator registry interface
- [x] Add RetroArch definition
- [x] Add Dolphin definition
- [x] Add PCSX2 definition
- [x] Add DeSmuME/melonDS definition
- [x] Add mGBA definition
- [x] Implement auto-detection logic
- [ ] Write unit tests

**Files to create:**

- `libs/emulators/package.json`
- `libs/emulators/tsconfig.json`
- `libs/emulators/src/index.ts`
- `libs/emulators/src/registry/types.ts`
- `libs/emulators/src/registry/retroarch.ts`
- `libs/emulators/src/registry/dolphin.ts`
- `libs/emulators/src/registry/pcsx2.ts`
- `libs/emulators/src/registry/desmume.ts`
- `libs/emulators/src/registry/mgba.ts`
- `libs/emulators/src/registry/index.ts`
- `libs/emulators/src/detector/index.ts`

---

### Task 2.6: State Management (Zustand)

**Priority**: High | **Effort**: 4h | **Dependencies**: Task 2.1, Task 2.4

- [x] Create library store
- [x] Create settings store
- [x] Create UI store (theme, sidebar, etc.)
- [x] Create widgets store _(NEW - Daijishou)_
- [x] Implement persistence middleware
- [ ] Add React Query integration
- [x] Export store hooks

**Files to create:**

- `libs/core/src/stores/libraryStore.ts`
- `libs/core/src/stores/settingsStore.ts`
- `libs/core/src/stores/uiStore.ts`
- `libs/core/src/stores/widgetsStore.ts` _(NEW)_
- `libs/core/src/stores/index.ts`
- `libs/core/src/hooks/useLibrary.ts`
- `libs/core/src/hooks/useSettings.ts`
- `libs/core/src/hooks/useWidgets.ts` _(NEW)_

---

### Task 2.7: WidgetService Implementation _(NEW - Daijishou)_

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 2.1

- [x] Create service interface
- [x] Implement getWidgets()
- [x] Implement addWidget()
- [x] Implement removeWidget()
- [x] Implement reorderWidgets()
- [x] Implement widget data providers (recent, favorites, stats)
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/WidgetService.ts`
- `libs/core/src/services/widgets/RecentGamesProvider.ts`
- `libs/core/src/services/widgets/FavoritesProvider.ts`
- `libs/core/src/services/widgets/StatsProvider.ts`
- `libs/core/src/__tests__/WidgetService.test.ts`

---

### Task 2.8: GenreService Implementation _(NEW - Daijishou)_

**Priority**: Medium | **Effort**: 2h | **Dependencies**: Task 2.1

- [x] Create service interface
- [x] Implement getGenres()
- [x] Implement getGamesByGenre()
- [x] Implement assignGenre()
- [x] Extract genres from metadata
- [ ] Write unit tests

**Files to create:**

- `libs/core/src/services/GenreService.ts`
- `libs/core/src/__tests__/GenreService.test.ts`

---

## Phase 3: UI Components

### Task 3.1: UI Package Setup with Green Theme

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 1.1

- [x] Create `libs/ui/package.json`
- [x] Set up TypeScript configuration
- [x] Create theme system with Emerald Green palette
- [x] Define color tokens (#10B981, #0F172A, etc.)
- [x] Set up component structure
- [ ] Configure react-native-web support

**Files to create:**

- `libs/ui/package.json`
- `libs/ui/tsconfig.json`
- `libs/ui/src/index.ts`
- `libs/ui/src/themes/tokens.ts`
- `libs/ui/src/themes/dark.ts`
- `libs/ui/src/themes/light.ts`
- `libs/ui/src/themes/index.ts`

---

### Task 3.2: Core UI Components

**Priority**: High | **Effort**: 4h | **Dependencies**: Task 3.1

- [x] Button component (variants, sizes)
- [x] Input component
- [x] Card component
- [x] Badge component
- [x] Icon component wrapper
- [x] Text component (typography)
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/Button/Button.tsx`
- `libs/ui/src/components/Button/index.ts`
- `libs/ui/src/components/Input/Input.tsx`
- `libs/ui/src/components/Card/Card.tsx`
- `libs/ui/src/components/Badge/Badge.tsx`
- `libs/ui/src/components/Icon/Icon.tsx`
- `libs/ui/src/components/Text/Text.tsx`
- `libs/ui/src/components/index.ts`

---

### Task 3.3: GameCard Component

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [x] Design GameCard layout
- [x] Implement cover image with placeholder
- [x] Add platform badge
- [x] Add hover/press states
- [x] Add context menu trigger
- [x] Handle missing artwork
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/GameCard/GameCard.tsx`
- `libs/ui/src/components/GameCard/GameCard.styles.ts`
- `libs/ui/src/components/GameCard/index.ts`
- `libs/ui/src/components/GameCard/__tests__/GameCard.test.tsx`

---

### Task 3.4: GameGrid Component

**Priority**: High | **Effort**: 4h | **Dependencies**: Task 3.3

- [x] Implement responsive grid layout
- [ ] Add virtualization for performance
- [x] Handle empty state
- [x] Handle loading state
- [x] Implement infinite scroll
- [x] Add grid size options
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/GameGrid/GameGrid.tsx`
- `libs/ui/src/components/GameGrid/useVirtualization.ts`
- `libs/ui/src/components/GameGrid/index.ts`

---

### Task 3.5: SearchBar Component

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [x] Design SearchBar layout
- [x] Implement debounced input
- [x] Add clear button
- [x] Add keyboard shortcut hint
- [x] Style focus states
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/SearchBar/SearchBar.tsx`
- `libs/ui/src/components/SearchBar/index.ts`

---

### Task 3.6: Sidebar Component

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [x] Design Sidebar layout
- [x] Platform list with icons
- [x] Collections list
- [x] Game counts
- [x] Collapsible sections
- [x] Active state styling
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/Sidebar/Sidebar.tsx`
- `libs/ui/src/components/Sidebar/SidebarItem.tsx`
- `libs/ui/src/components/Sidebar/index.ts`

---

### Task 3.7: GameDetail Component

**Priority**: Medium | **Effort**: 3h | **Dependencies**: Task 3.2

- [x] Design detail view layout
- [x] Large cover image display
- [x] Metadata section
- [x] Play button
- [x] Favorites toggle
- [x] Edit metadata button
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/GameDetail/GameDetail.tsx`
- `libs/ui/src/components/GameDetail/MetadataSection.tsx`
- `libs/ui/src/components/GameDetail/index.ts`

---

### Task 3.8: Widget Components _(NEW - Daijishou)_

**Priority**: High | **Effort**: 5h | **Dependencies**: Task 3.2

- [x] Create base Widget container
- [x] Implement RecentGamesWidget
- [x] Implement FavoritesWidget
- [x] Implement StatsWidget (play time, game count)
- [x] Implement PlatformShortcutsWidget
- [ ] Make widgets draggable/reorderable
- [x] Add widget size options (small, medium, large)
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/widgets/WidgetContainer.tsx`
- `libs/ui/src/components/widgets/RecentGamesWidget.tsx`
- `libs/ui/src/components/widgets/FavoritesWidget.tsx`
- `libs/ui/src/components/widgets/StatsWidget.tsx`
- `libs/ui/src/components/widgets/PlatformShortcutsWidget.tsx`
- `libs/ui/src/components/widgets/index.ts`

---

### Task 3.9: PlatformCard with Wallpaper _(NEW - Daijishou)_

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [x] Design PlatformCard layout
- [x] Background wallpaper support
- [x] Blur/overlay options
- [x] Game count badge
- [x] Platform icon
- [x] Active/hover states
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/PlatformCard/PlatformCard.tsx`
- `libs/ui/src/components/PlatformCard/index.ts`

---

### Task 3.10: GenreList Component _(NEW - Daijishou)_

**Priority**: Medium | **Effort**: 2h | **Dependencies**: Task 3.2

- [x] Design GenreList layout
- [x] Genre item with game count
- [x] Active state styling
- [x] Horizontal scroll or grid layout
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/GenreList/GenreList.tsx`
- `libs/ui/src/components/GenreList/GenreItem.tsx`
- `libs/ui/src/components/GenreList/index.ts`

---

### Task 3.11: BottomTabBar Component _(NEW - Mobile)_

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [x] Design bottom navigation layout
- [x] Tab items: Home, Platforms, Genres, Search, Settings
- [x] Active state with green accent
- [x] Icon + label design
- [ ] Write component tests

**Files to create:**

- `libs/ui/src/components/BottomTabBar/BottomTabBar.tsx`
- `libs/ui/src/components/BottomTabBar/TabItem.tsx`
- `libs/ui/src/components/BottomTabBar/index.ts`

---

## Phase 4: Desktop Application (Electron)

### Task 4.1: Electron Project Setup

**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 3.1

- [x] Create `apps/desktop/package.json`
- [x] Set up TypeScript configuration
- [x] Configure Vite for renderer
- [x] Set up main process entry
- [x] Configure preload script
- [x] Add dev scripts

**Files to create:**

- `apps/desktop/package.json`
- `apps/desktop/tsconfig.json`
- `apps/desktop/tsconfig.node.json`
- `apps/desktop/vite.config.ts`
- `apps/desktop/electron.vite.config.ts`
- `apps/desktop/src/main/index.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/renderer/index.html`
- `apps/desktop/src/renderer/main.tsx`

---

### Task 4.2: Electron Main Process

**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 4.1

- [x] Window creation and management
- [x] IPC handlers for file system
- [x] IPC handlers for database
- [x] IPC handlers for launching
- [ ] Native menu implementation
- [ ] Tray icon (optional)
- [x] Handle app lifecycle

**Files to create:**

- `apps/desktop/src/main/window.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/filesystem.ts`
- `apps/desktop/src/main/ipc/database.ts`
- `apps/desktop/src/main/ipc/launcher.ts`
- `apps/desktop/src/main/menu.ts`

---

### Task 4.3: Desktop App Shell

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 4.1, Task 3.6

- [x] App layout with sidebar
- [x] Header with search
- [x] Router setup
- [x] Theme provider
- [x] Error boundary

**Files to create:**

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/Layout.tsx`
- `apps/desktop/src/renderer/routes.tsx`
- `apps/desktop/src/renderer/providers/ThemeProvider.tsx`
- `apps/desktop/src/renderer/components/ErrorBoundary.tsx`

---

### Task 4.4: Desktop Screens

**Priority**: High | **Effort**: 8h | **Dependencies**: Task 4.3

- [x] Home screen with widgets _(Daijishou style)_
- [x] Library screen (main grid view)
- [x] Platform screen with wallpaper
- [x] Genre screen _(NEW)_
- [x] Collection screen
- [x] Game detail screen/modal
- [x] Settings screen
- [x] First-run setup wizard

**Files to create:**

- `apps/desktop/src/renderer/screens/HomeScreen.tsx` _(NEW - widgets)_
- `apps/desktop/src/renderer/screens/LibraryScreen.tsx`
- `apps/desktop/src/renderer/screens/PlatformScreen.tsx`
- `apps/desktop/src/renderer/screens/GenreScreen.tsx` _(NEW)_
- `apps/desktop/src/renderer/screens/CollectionScreen.tsx`
- `apps/desktop/src/renderer/screens/GameDetailScreen.tsx`
- `apps/desktop/src/renderer/screens/SettingsScreen.tsx`
- `apps/desktop/src/renderer/screens/SetupWizard.tsx`

---

### Task 4.5: Desktop Build Configuration

**Priority**: High | **Effort**: 3h | **Dependencies**: Task 4.4

- [x] Configure electron-builder
- [x] macOS build settings
- [x] Windows build settings
- [x] Linux build settings
- [ ] Auto-update configuration
- [ ] Code signing setup (docs)

**Files to create:**

- `apps/desktop/electron-builder.yml`
- `apps/desktop/src/main/updater.ts`
- `apps/desktop/build/icons/` (icon assets)

---

## Phase 5: Mobile Application (React Native)

### Task 5.1: React Native Project Setup

**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 3.1

- [x] Initialize React Native project
- [x] Configure TypeScript
- [x] Set up Metro bundler for monorepo
- [x] Install native dependencies
- [x] Configure iOS project
- [x] Configure Android project

**Files to create:**

- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
- `apps/mobile/metro.config.js`
- `apps/mobile/babel.config.js`
- `apps/mobile/app.json`
- `apps/mobile/index.js`

---

### Task 5.2: React Native Navigation

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.1

- [x] Install React Navigation
- [x] Set up bottom tabs
- [x] Set up stack navigator
- [x] Configure deep linking (optional)

**Files to create:**

- `apps/mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/src/navigation/TabNavigator.tsx`
- `apps/mobile/src/navigation/types.ts`

---

### Task 5.3: Mobile App Shell

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.2

- [x] App entry point
- [x] Theme provider
- [x] Database initialization
- [x] Splash screen
- [x] Error handling

**Files to create:**

- `apps/mobile/src/App.tsx`
- `apps/mobile/src/providers/AppProviders.tsx`
- `apps/mobile/src/services/init.ts`

---

### Task 5.4: Mobile Screens

**Priority**: High | **Effort**: 8h | **Dependencies**: Task 5.3

- [x] Home screen with widgets _(Daijishou style)_
- [x] Library screen
- [x] Platform browser screen with wallpapers
- [x] Genre browser screen _(NEW)_
- [x] Collections screen
- [x] Game detail screen
- [x] Settings screen
- [x] Emulator config screen

**Files to create:**

- `apps/mobile/src/screens/HomeScreen.tsx` _(NEW - widgets)_
- `apps/mobile/src/screens/LibraryScreen.tsx`
- `apps/mobile/src/screens/PlatformsScreen.tsx`
- `apps/mobile/src/screens/GenresScreen.tsx` _(NEW)_
- `apps/mobile/src/screens/CollectionsScreen.tsx`
- `apps/mobile/src/screens/GameDetailScreen.tsx`
- `apps/mobile/src/screens/SettingsScreen.tsx`
- `apps/mobile/src/screens/EmulatorConfigScreen.tsx`

---

### Task 5.5: Mobile Platform Services

**Priority**: High | **Effort**: 4h | **Dependencies**: Task 5.3

- [x] File picker integration
- [x] Document directory access
- [x] External storage access (Android)
- [x] URL scheme launching
- [ ] Share extension (optional)

**Files to create:**

- `apps/mobile/src/services/FileService.ts`
- `apps/mobile/src/services/LauncherService.ts`
- `apps/mobile/src/services/StorageService.ts`

---

### Task 5.6: Mobile Build Configuration

**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.4

- [x] iOS build settings (Xcode)
- [x] Android build settings (Gradle)
- [x] App icons generation
- [x] Splash screen configuration
- [ ] Fastlane setup (optional)

**Files to modify:**

- `apps/mobile/ios/emuz.xcodeproj`
- `apps/mobile/android/app/build.gradle`
- `apps/mobile/ios/emuz/Images.xcassets`
- `apps/mobile/android/app/src/main/res/`

---

## Phase 6: Polish & Testing

### Task 6.1: Unit Tests

**Priority**: High | **Effort**: 4h | **Dependencies**: Phase 2

- [x] Core services tests (>80% coverage)
- [x] Database adapters tests
- [x] Emulator registry tests
- [ ] Utility function tests
- [x] Set up CI test runner

**Files to create:**

- `libs/core/src/__tests__/**/*.test.ts`
- `libs/database/src/__tests__/**/*.test.ts`
- `libs/emulators/src/__tests__/**/*.test.ts`
- `.github/workflows/test.yml`

---

### Task 6.2: Component Tests

**Priority**: Medium | **Effort**: 3h | **Dependencies**: Phase 3

- [ ] GameCard component tests
- [ ] GameGrid component tests
- [ ] SearchBar component tests
- [ ] Sidebar component tests
- [ ] Integration tests

**Files to create:**

- `libs/ui/src/components/**/__tests__/*.test.tsx`

---

### Task 6.3: E2E Tests

**Priority**: Medium | **Effort**: 4h | **Dependencies**: Phase 4, Phase 5

- [ ] Desktop E2E with Playwright
- [ ] Mobile E2E with Detox
- [ ] Critical user flows coverage

**Files to create:**

- `apps/desktop/e2e/**/*.spec.ts`
- `apps/mobile/e2e/**/*.e2e.js`

---

### Task 6.4: Performance Optimization

**Priority**: High | **Effort**: 3h | **Dependencies**: Phase 4, Phase 5

- [ ] Image caching strategy
- [ ] Database query optimization
- [ ] Bundle size analysis
- [ ] Memory profiling
- [ ] Lazy loading implementation

---

### Task 6.5: Documentation

**Priority**: Medium | **Effort**: 3h | **Dependencies**: All

- [x] Architecture documentation
- [x] API documentation
- [x] Emulator integration guide
- [x] Contributing guide
- [x] README updates

**Files to create:**

- `docs/architecture.md`
- `docs/api.md`
- `docs/emulator-integration.md`
- `docs/contributing.md`
- `README.md`

---

## Task Summary

| Phase                  | Tasks        | Total Effort |
| ---------------------- | ------------ | ------------ |
| Phase 1: Foundation    | 6 tasks      | 20h          |
| Phase 2: Core Services | 8 tasks      | 29h          |
| Phase 3: UI Components | 11 tasks     | 33h          |
| Phase 4: Desktop App   | 5 tasks      | 21h          |
| Phase 5: Mobile App    | 6 tasks      | 21h          |
| Phase 6: Polish        | 5 tasks      | 17h          |
| **Total**              | **41 tasks** | **~141h**    |

### New Tasks Added (Daijishou Features)

| Task | Feature                       | Effort |
| ---- | ----------------------------- | ------ |
| 1.5  | Platform File System Adapters | 4h     |
| 1.6  | Platform Emulator Launchers   | 4h     |
| 2.7  | WidgetService                 | 3h     |
| 2.8  | GenreService                  | 2h     |
| 3.8  | Widget Components             | 5h     |
| 3.9  | PlatformCard with Wallpaper   | 3h     |
| 3.10 | GenreList Component           | 2h     |
| 3.11 | BottomTabBar Component        | 2h     |

---

## Implementation Order (Critical Path)

```
1.1 ──→ 1.2 ──→ 1.3 ──→ 2.1 ──→ 2.2 ──→ 2.3
    │              │              │
    ├──→ 1.4 ──────┘              └──→ 2.7 (widgets)
    │                                   │
    └──→ 1.5 ──→ 1.6                   └──→ 2.8 (genres)
                  │
                  └──→ 2.4 ──→ 2.6
                                │
3.1 ──→ 3.2 ──→ 3.3 ──→ 3.4 ───┤
    │                           │
    ├──→ 3.5 ──→ 3.6 ──→ 3.7   │
    │                           │
    ├──→ 3.8 (widgets) ─────────┤
    │                           │
    ├──→ 3.9 (platform cards) ──┤
    │                           │
    ├──→ 3.10 (genres) ─────────┤
    │                           │
    └──→ 3.11 (tabs) ───────────┼──→ 4.1 ──→ 4.2 ──→ 4.3 ──→ 4.4 ──→ 4.5
                                │
                                └──→ 5.1 ──→ 5.2 ──→ 5.3 ──→ 5.4 ──→ 5.6
                                                                │
                                                                └──→ 5.5
                                │
                                └──→ 6.1 ──→ 6.2 ──→ 6.3 ──→ 6.4 ──→ 6.5
```

Parallel execution possible:

- [P] Task 1.2, 1.4, 1.5 (after 1.1)
- [P] Task 2.5, 2.6, 2.7, 2.8 (after 2.1)
- [P] Task 3.5, 3.6, 3.8, 3.9, 3.10, 3.11 (after 3.2)
- [P] Phase 4 and Phase 5 (after Phase 3)
- [P] Task 6.1 and Task 6.2

---

## Checkpoints

### Checkpoint 1: Foundation Complete

After Phase 1, verify:

- [ ] All packages build successfully
- [ ] Database migrations run
- [ ] Platform seed data loads

### Checkpoint 2: Core Services Complete

After Phase 2, verify:

- [ ] Games can be scanned and stored
- [ ] Search returns correct results
- [ ] Emulators can be detected

### Checkpoint 3: UI Components Complete

After Phase 3, verify:

- [ ] All components render correctly
- [ ] Theme switching works
- [ ] Responsive layouts work

### Checkpoint 4: Desktop App Complete

After Phase 4, verify:

- [ ] App builds for macOS, Linux, Windows
- [ ] All screens functional
- [ ] Games launch correctly

### Checkpoint 5: Mobile App Complete

After Phase 5, verify:

- [ ] App builds for iOS and Android
- [ ] All screens functional
- [ ] Platform-specific features work

### Checkpoint 6: Release Ready

After Phase 6, verify:

- [ ] Test coverage > 80%
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Performance targets met
