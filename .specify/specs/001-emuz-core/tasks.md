# EmuZ - Implementation Tasks

> *Daijishou-inspired cross-platform emulator frontend*

## Feature: 001-emuz-core
## Created: 2026-01-04
## Updated: 2026-01-04
## Status: Ready for Implementation

---

## Phase 1: Foundation

### Task 1.1: Monorepo Initialization
**Priority**: Critical | **Effort**: 2h | **Dependencies**: None

- [X] Create Nx workspace with `npx create-nx-workspace@latest emuz --preset=apps`
- [X] Configure pnpm as package manager
- [X] Create `.npmrc` with `node-linker=hoisted`
- [X] Set up `nx.json` configuration
- [X] Create `tsconfig.base.json` for shared TypeScript config
- [X] Configure ESLint with `@nx/eslint`
- [X] Configure Prettier
- [X] Add `.gitignore` entries
- [X] Create workspace structure (`apps/`, `libs/`)

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

- [X] Create `libs/database/package.json`
- [X] Set up TypeScript configuration
- [X] Define database schema types
- [X] Create migration system
- [X] Implement initial migration (all tables)
- [X] Add platform seed data

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

- [X] Create adapter interface
- [X] Implement desktop adapter (better-sqlite3)
- [X] Implement mobile adapter (react-native-sqlite-storage)
- [X] Create adapter factory
- [X] Add connection management
- [X] Write unit tests

**Files to create:**
- `libs/database/src/adapters/types.ts`
- `libs/database/src/adapters/desktop.ts`
- `libs/database/src/adapters/mobile.ts`
- `libs/database/src/adapters/index.ts`
- `libs/database/src/__tests__/adapters.test.ts`

---

### Task 1.4: Core Package - Models
**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 1.1

- [X] Create `libs/core/package.json`
- [X] Define Game model and Zod schema
- [X] Define Platform model and Zod schema (with wallpaper support)
- [X] Define Emulator model and Zod schema
- [X] Define Collection model and Zod schema
- [X] Define Widget model and Zod schema *(NEW - Daijishou)*
- [X] Define Genre model and Zod schema *(NEW - Daijishou)*
- [X] Define Settings model
- [X] Export all models

**Files to create:**
- `libs/core/package.json`
- `libs/core/tsconfig.json`
- `libs/core/src/index.ts`
- `libs/core/src/models/Game.ts`
- `libs/core/src/models/Platform.ts`
- `libs/core/src/models/Emulator.ts`
- `libs/core/src/models/Collection.ts`
- `libs/core/src/models/Widget.ts` *(NEW)*
- `libs/core/src/models/Genre.ts` *(NEW)*
- `libs/core/src/models/Settings.ts`
- `libs/core/src/models/index.ts`

### Task 1.5: Platform Package - File System Adapters *(NEW)*
**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.1

- [X] Create `libs/platform/package.json`
- [X] Define file system adapter interface
- [X] Implement desktop adapter (Node.js fs)
- [X] Implement Android adapter (SAF via native module)
- [X] Implement iOS adapter (Documents + Files)
- [X] Create adapter factory with platform detection
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

### Task 1.6: Platform Package - Emulator Launchers *(NEW)*
**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 1.5

- [X] Define launcher interface
- [X] Implement desktop launcher (process spawn)
- [X] Implement Android launcher (Intent system)
- [X] Implement iOS launcher (URL schemes)
- [X] Create launcher factory
- [X] Add URL scheme registry for iOS
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

- [X] Create service interface
- [X] Implement getAllGames()
- [X] Implement getGameById()
- [X] Implement getGamesByPlatform()
- [X] Implement searchGames() with fuzzy search
- [X] Implement updateGame()
- [X] Implement deleteGame()
- [X] Implement collection methods
- [X] Implement favorites methods
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/LibraryService.ts`
- `libs/core/src/services/types.ts`
- `libs/core/src/__tests__/LibraryService.test.ts`

---

### Task 2.2: ScannerService Implementation
**Priority**: Critical | **Effort**: 5h | **Dependencies**: Task 2.1

- [X] Create service interface
- [X] Implement addDirectory()
- [X] Implement removeDirectory()
- [X] Implement platform detection by extension
- [X] Implement recursive file scanning
- [X] Implement hash calculation
- [X] Create async generator for progress
- [X] Handle cancellation
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/ScannerService.ts`
- `libs/core/src/utils/fileExtensions.ts`
- `libs/core/src/utils/hash.ts`
- `libs/core/src/__tests__/ScannerService.test.ts`

---

### Task 2.3: MetadataService Implementation
**Priority**: High | **Effort**: 4h | **Dependencies**: Task 2.1

- [X] Create service interface
- [X] Implement game identification (hash-based)
- [X] Implement metadata search
- [X] Implement cover download
- [X] Implement batch refresh
- [ ] Add caching layer
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/MetadataService.ts`
- `libs/core/src/services/metadata/providers/index.ts`
- `libs/core/src/__tests__/MetadataService.test.ts`

---

### Task 2.4: LaunchService Implementation
**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 2.1

- [X] Create service interface
- [X] Implement getEmulators()
- [X] Implement detectEmulators() per platform
- [X] Implement addEmulator()
- [X] Implement setDefaultEmulator()
- [X] Implement launchGame()
- [X] Implement command builder
- [X] Implement play session tracking
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/LaunchService.ts`
- `libs/core/src/utils/commandBuilder.ts`
- `libs/core/src/__tests__/LaunchService.test.ts`

---

### Task 2.5: Emulators Package
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 1.1

- [X] Create `libs/emulators/package.json`
- [X] Define emulator registry interface
- [X] Add RetroArch definition
- [X] Add Dolphin definition
- [X] Add PCSX2 definition
- [X] Add DeSmuME/melonDS definition
- [X] Add mGBA definition
- [X] Implement auto-detection logic
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

- [X] Create library store
- [X] Create settings store
- [X] Create UI store (theme, sidebar, etc.)
- [X] Create widgets store *(NEW - Daijishou)*
- [X] Implement persistence middleware
- [ ] Add React Query integration
- [X] Export store hooks

**Files to create:**
- `libs/core/src/stores/libraryStore.ts`
- `libs/core/src/stores/settingsStore.ts`
- `libs/core/src/stores/uiStore.ts`
- `libs/core/src/stores/widgetsStore.ts` *(NEW)*
- `libs/core/src/stores/index.ts`
- `libs/core/src/hooks/useLibrary.ts`
- `libs/core/src/hooks/useSettings.ts`
- `libs/core/src/hooks/useWidgets.ts` *(NEW)*

---

### Task 2.7: WidgetService Implementation *(NEW - Daijishou)*
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 2.1

- [X] Create service interface
- [X] Implement getWidgets()
- [X] Implement addWidget()
- [X] Implement removeWidget()
- [X] Implement reorderWidgets()
- [X] Implement widget data providers (recent, favorites, stats)
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/WidgetService.ts`
- `libs/core/src/services/widgets/RecentGamesProvider.ts`
- `libs/core/src/services/widgets/FavoritesProvider.ts`
- `libs/core/src/services/widgets/StatsProvider.ts`
- `libs/core/src/__tests__/WidgetService.test.ts`

---

### Task 2.8: GenreService Implementation *(NEW - Daijishou)*
**Priority**: Medium | **Effort**: 2h | **Dependencies**: Task 2.1

- [X] Create service interface
- [X] Implement getGenres()
- [X] Implement getGamesByGenre()
- [X] Implement assignGenre()
- [X] Extract genres from metadata
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/GenreService.ts`
- `libs/core/src/__tests__/GenreService.test.ts`

---

## Phase 3: UI Components

### Task 3.1: UI Package Setup with Green Theme
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 1.1

- [X] Create `libs/ui/package.json`
- [X] Set up TypeScript configuration
- [X] Create theme system with Emerald Green palette
- [X] Define color tokens (#10B981, #0F172A, etc.)
- [X] Set up component structure
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

- [X] Button component (variants, sizes)
- [X] Input component
- [X] Card component
- [X] Badge component
- [X] Icon component wrapper
- [X] Text component (typography)
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

- [X] Design GameCard layout
- [X] Implement cover image with placeholder
- [X] Add platform badge
- [X] Add hover/press states
- [X] Add context menu trigger
- [X] Handle missing artwork
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameCard/GameCard.tsx`
- `libs/ui/src/components/GameCard/GameCard.styles.ts`
- `libs/ui/src/components/GameCard/index.ts`
- `libs/ui/src/components/GameCard/__tests__/GameCard.test.tsx`

---

### Task 3.4: GameGrid Component
**Priority**: High | **Effort**: 4h | **Dependencies**: Task 3.3

- [X] Implement responsive grid layout
- [ ] Add virtualization for performance
- [X] Handle empty state
- [X] Handle loading state
- [X] Implement infinite scroll
- [X] Add grid size options
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameGrid/GameGrid.tsx`
- `libs/ui/src/components/GameGrid/useVirtualization.ts`
- `libs/ui/src/components/GameGrid/index.ts`

---

### Task 3.5: SearchBar Component
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [X] Design SearchBar layout
- [X] Implement debounced input
- [X] Add clear button
- [X] Add keyboard shortcut hint
- [X] Style focus states
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/SearchBar/SearchBar.tsx`
- `libs/ui/src/components/SearchBar/index.ts`

---

### Task 3.6: Sidebar Component
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [X] Design Sidebar layout
- [X] Platform list with icons
- [X] Collections list
- [X] Game counts
- [X] Collapsible sections
- [X] Active state styling
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/Sidebar/Sidebar.tsx`
- `libs/ui/src/components/Sidebar/SidebarItem.tsx`
- `libs/ui/src/components/Sidebar/index.ts`

---

### Task 3.7: GameDetail Component
**Priority**: Medium | **Effort**: 3h | **Dependencies**: Task 3.2

- [X] Design detail view layout
- [X] Large cover image display
- [X] Metadata section
- [X] Play button
- [X] Favorites toggle
- [X] Edit metadata button
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameDetail/GameDetail.tsx`
- `libs/ui/src/components/GameDetail/MetadataSection.tsx`
- `libs/ui/src/components/GameDetail/index.ts`

---

### Task 3.8: Widget Components *(NEW - Daijishou)*
**Priority**: High | **Effort**: 5h | **Dependencies**: Task 3.2

- [X] Create base Widget container
- [X] Implement RecentGamesWidget
- [X] Implement FavoritesWidget
- [X] Implement StatsWidget (play time, game count)
- [X] Implement PlatformShortcutsWidget
- [ ] Make widgets draggable/reorderable
- [X] Add widget size options (small, medium, large)
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/widgets/WidgetContainer.tsx`
- `libs/ui/src/components/widgets/RecentGamesWidget.tsx`
- `libs/ui/src/components/widgets/FavoritesWidget.tsx`
- `libs/ui/src/components/widgets/StatsWidget.tsx`
- `libs/ui/src/components/widgets/PlatformShortcutsWidget.tsx`
- `libs/ui/src/components/widgets/index.ts`

---

### Task 3.9: PlatformCard with Wallpaper *(NEW - Daijishou)*
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [X] Design PlatformCard layout
- [X] Background wallpaper support
- [X] Blur/overlay options
- [X] Game count badge
- [X] Platform icon
- [X] Active/hover states
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/PlatformCard/PlatformCard.tsx`
- `libs/ui/src/components/PlatformCard/index.ts`

---

### Task 3.10: GenreList Component *(NEW - Daijishou)*
**Priority**: Medium | **Effort**: 2h | **Dependencies**: Task 3.2

- [X] Design GenreList layout
- [X] Genre item with game count
- [X] Active state styling
- [X] Horizontal scroll or grid layout
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GenreList/GenreList.tsx`
- `libs/ui/src/components/GenreList/GenreItem.tsx`
- `libs/ui/src/components/GenreList/index.ts`

---

### Task 3.11: BottomTabBar Component *(NEW - Mobile)*
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [X] Design bottom navigation layout
- [X] Tab items: Home, Platforms, Genres, Search, Settings
- [X] Active state with green accent
- [X] Icon + label design
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/BottomTabBar/BottomTabBar.tsx`
- `libs/ui/src/components/BottomTabBar/TabItem.tsx`
- `libs/ui/src/components/BottomTabBar/index.ts`

---

## Phase 4: Desktop Application (Electron)

### Task 4.1: Electron Project Setup
**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 3.1

- [X] Create `apps/desktop/package.json`
- [X] Set up TypeScript configuration
- [X] Configure Vite for renderer
- [X] Set up main process entry
- [X] Configure preload script
- [X] Add dev scripts

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

- [X] Window creation and management
- [X] IPC handlers for file system
- [X] IPC handlers for database
- [X] IPC handlers for launching
- [ ] Native menu implementation
- [ ] Tray icon (optional)
- [X] Handle app lifecycle

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

- [X] App layout with sidebar
- [X] Header with search
- [X] Router setup
- [X] Theme provider
- [X] Error boundary

**Files to create:**
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/Layout.tsx`
- `apps/desktop/src/renderer/routes.tsx`
- `apps/desktop/src/renderer/providers/ThemeProvider.tsx`
- `apps/desktop/src/renderer/components/ErrorBoundary.tsx`

---

### Task 4.4: Desktop Screens
**Priority**: High | **Effort**: 8h | **Dependencies**: Task 4.3

- [X] Home screen with widgets *(Daijishou style)*
- [X] Library screen (main grid view)
- [X] Platform screen with wallpaper
- [X] Genre screen *(NEW)*
- [X] Collection screen
- [X] Game detail screen/modal
- [X] Settings screen
- [X] First-run setup wizard

**Files to create:**
- `apps/desktop/src/renderer/screens/HomeScreen.tsx` *(NEW - widgets)*
- `apps/desktop/src/renderer/screens/LibraryScreen.tsx`
- `apps/desktop/src/renderer/screens/PlatformScreen.tsx`
- `apps/desktop/src/renderer/screens/GenreScreen.tsx` *(NEW)*
- `apps/desktop/src/renderer/screens/CollectionScreen.tsx`
- `apps/desktop/src/renderer/screens/GameDetailScreen.tsx`
- `apps/desktop/src/renderer/screens/SettingsScreen.tsx`
- `apps/desktop/src/renderer/screens/SetupWizard.tsx`

---

### Task 4.5: Desktop Build Configuration
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 4.4

- [X] Configure electron-builder
- [X] macOS build settings
- [X] Windows build settings
- [X] Linux build settings
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

- [X] Initialize React Native project
- [X] Configure TypeScript
- [X] Set up Metro bundler for monorepo
- [X] Install native dependencies
- [X] Configure iOS project
- [X] Configure Android project

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

- [X] Install React Navigation
- [X] Set up bottom tabs
- [X] Set up stack navigator
- [X] Configure deep linking (optional)

**Files to create:**
- `apps/mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/src/navigation/TabNavigator.tsx`
- `apps/mobile/src/navigation/types.ts`

---

### Task 5.3: Mobile App Shell
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.2

- [X] App entry point
- [X] Theme provider
- [X] Database initialization
- [X] Splash screen
- [X] Error handling

**Files to create:**
- `apps/mobile/src/App.tsx`
- `apps/mobile/src/providers/AppProviders.tsx`
- `apps/mobile/src/services/init.ts`

---

### Task 5.4: Mobile Screens
**Priority**: High | **Effort**: 8h | **Dependencies**: Task 5.3

- [X] Home screen with widgets *(Daijishou style)*
- [X] Library screen
- [X] Platform browser screen with wallpapers
- [X] Genre browser screen *(NEW)*
- [X] Collections screen
- [X] Game detail screen
- [X] Settings screen
- [X] Emulator config screen

**Files to create:**
- `apps/mobile/src/screens/HomeScreen.tsx` *(NEW - widgets)*
- `apps/mobile/src/screens/LibraryScreen.tsx`
- `apps/mobile/src/screens/PlatformsScreen.tsx`
- `apps/mobile/src/screens/GenresScreen.tsx` *(NEW)*
- `apps/mobile/src/screens/CollectionsScreen.tsx`
- `apps/mobile/src/screens/GameDetailScreen.tsx`
- `apps/mobile/src/screens/SettingsScreen.tsx`
- `apps/mobile/src/screens/EmulatorConfigScreen.tsx`

---

### Task 5.5: Mobile Platform Services
**Priority**: High | **Effort**: 4h | **Dependencies**: Task 5.3

- [X] File picker integration
- [X] Document directory access
- [X] External storage access (Android)
- [X] URL scheme launching
- [ ] Share extension (optional)

**Files to create:**
- `apps/mobile/src/services/FileService.ts`
- `apps/mobile/src/services/LauncherService.ts`
- `apps/mobile/src/services/StorageService.ts`

---

### Task 5.6: Mobile Build Configuration
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.4

- [X] iOS build settings (Xcode)
- [X] Android build settings (Gradle)
- [X] App icons generation
- [X] Splash screen configuration
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

- [X] Core services tests (>80% coverage)
- [X] Database adapters tests
- [X] Emulator registry tests
- [ ] Utility function tests
- [X] Set up CI test runner

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

- [X] Architecture documentation
- [X] API documentation
- [X] Emulator integration guide
- [X] Contributing guide
- [X] README updates

**Files to create:**
- `docs/architecture.md`
- `docs/api.md`
- `docs/emulator-integration.md`
- `docs/contributing.md`
- `README.md`

---

## Task Summary

| Phase | Tasks | Total Effort |
|-------|-------|--------------|
| Phase 1: Foundation | 6 tasks | 20h |
| Phase 2: Core Services | 8 tasks | 29h |
| Phase 3: UI Components | 11 tasks | 33h |
| Phase 4: Desktop App | 5 tasks | 21h |
| Phase 5: Mobile App | 6 tasks | 21h |
| Phase 6: Polish | 5 tasks | 17h |
| **Total** | **41 tasks** | **~141h** |

### New Tasks Added (Daijishou Features)

| Task | Feature | Effort |
|------|---------|--------|
| 1.5 | Platform File System Adapters | 4h |
| 1.6 | Platform Emulator Launchers | 4h |
| 2.7 | WidgetService | 3h |
| 2.8 | GenreService | 2h |
| 3.8 | Widget Components | 5h |
| 3.9 | PlatformCard with Wallpaper | 3h |
| 3.10 | GenreList Component | 2h |
| 3.11 | BottomTabBar Component | 2h |

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
