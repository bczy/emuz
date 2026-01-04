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

- [ ] Create Nx workspace with `npx create-nx-workspace@latest emuz --preset=apps`
- [ ] Configure pnpm as package manager
- [ ] Create `.npmrc` with `node-linker=hoisted`
- [ ] Set up `nx.json` configuration
- [ ] Create `tsconfig.base.json` for shared TypeScript config
- [ ] Configure ESLint with `@nx/eslint`
- [ ] Configure Prettier
- [ ] Add `.gitignore` entries
- [ ] Create workspace structure (`apps/`, `libs/`)

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

- [ ] Create `libs/database/package.json`
- [ ] Set up TypeScript configuration
- [ ] Define database schema types
- [ ] Create migration system
- [ ] Implement initial migration (all tables)
- [ ] Add platform seed data

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

- [ ] Create adapter interface
- [ ] Implement desktop adapter (better-sqlite3)
- [ ] Implement mobile adapter (react-native-sqlite-storage)
- [ ] Create adapter factory
- [ ] Add connection management
- [ ] Write unit tests

**Files to create:**
- `libs/database/src/adapters/types.ts`
- `libs/database/src/adapters/desktop.ts`
- `libs/database/src/adapters/mobile.ts`
- `libs/database/src/adapters/index.ts`
- `libs/database/src/__tests__/adapters.test.ts`

---

### Task 1.4: Core Package - Models
**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 1.1

- [ ] Create `libs/core/package.json`
- [ ] Define Game model and Zod schema
- [ ] Define Platform model and Zod schema (with wallpaper support)
- [ ] Define Emulator model and Zod schema
- [ ] Define Collection model and Zod schema
- [ ] Define Widget model and Zod schema *(NEW - Daijishou)*
- [ ] Define Genre model and Zod schema *(NEW - Daijishou)*
- [ ] Define Settings model
- [ ] Export all models

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

- [ ] Create `libs/platform/package.json`
- [ ] Define file system adapter interface
- [ ] Implement desktop adapter (Node.js fs)
- [ ] Implement Android adapter (SAF via native module)
- [ ] Implement iOS adapter (Documents + Files)
- [ ] Create adapter factory with platform detection
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

- [ ] Define launcher interface
- [ ] Implement desktop launcher (process spawn)
- [ ] Implement Android launcher (Intent system)
- [ ] Implement iOS launcher (URL schemes)
- [ ] Create launcher factory
- [ ] Add URL scheme registry for iOS
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

- [ ] Create service interface
- [ ] Implement getAllGames()
- [ ] Implement getGameById()
- [ ] Implement getGamesByPlatform()
- [ ] Implement searchGames() with fuzzy search
- [ ] Implement updateGame()
- [ ] Implement deleteGame()
- [ ] Implement collection methods
- [ ] Implement favorites methods
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/LibraryService.ts`
- `libs/core/src/services/types.ts`
- `libs/core/src/__tests__/LibraryService.test.ts`

---

### Task 2.2: ScannerService Implementation
**Priority**: Critical | **Effort**: 5h | **Dependencies**: Task 2.1

- [ ] Create service interface
- [ ] Implement addDirectory()
- [ ] Implement removeDirectory()
- [ ] Implement platform detection by extension
- [ ] Implement recursive file scanning
- [ ] Implement hash calculation
- [ ] Create async generator for progress
- [ ] Handle cancellation
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/ScannerService.ts`
- `libs/core/src/utils/fileExtensions.ts`
- `libs/core/src/utils/hash.ts`
- `libs/core/src/__tests__/ScannerService.test.ts`

---

### Task 2.3: MetadataService Implementation
**Priority**: High | **Effort**: 4h | **Dependencies**: Task 2.1

- [ ] Create service interface
- [ ] Implement game identification (hash-based)
- [ ] Implement metadata search
- [ ] Implement cover download
- [ ] Implement batch refresh
- [ ] Add caching layer
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/MetadataService.ts`
- `libs/core/src/services/metadata/providers/index.ts`
- `libs/core/src/__tests__/MetadataService.test.ts`

---

### Task 2.4: LaunchService Implementation
**Priority**: Critical | **Effort**: 4h | **Dependencies**: Task 2.1

- [ ] Create service interface
- [ ] Implement getEmulators()
- [ ] Implement detectEmulators() per platform
- [ ] Implement addEmulator()
- [ ] Implement setDefaultEmulator()
- [ ] Implement launchGame()
- [ ] Implement command builder
- [ ] Implement play session tracking
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/LaunchService.ts`
- `libs/core/src/utils/commandBuilder.ts`
- `libs/core/src/__tests__/LaunchService.test.ts`

---

### Task 2.5: Emulators Package
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 1.1

- [ ] Create `libs/emulators/package.json`
- [ ] Define emulator registry interface
- [ ] Add RetroArch definition
- [ ] Add Dolphin definition
- [ ] Add PCSX2 definition
- [ ] Add DeSmuME/melonDS definition
- [ ] Add mGBA definition
- [ ] Implement auto-detection logic
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

- [ ] Create library store
- [ ] Create settings store
- [ ] Create UI store (theme, sidebar, etc.)
- [ ] Create widgets store *(NEW - Daijishou)*
- [ ] Implement persistence middleware
- [ ] Add React Query integration
- [ ] Export store hooks

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

- [ ] Create service interface
- [ ] Implement getWidgets()
- [ ] Implement addWidget()
- [ ] Implement removeWidget()
- [ ] Implement reorderWidgets()
- [ ] Implement widget data providers (recent, favorites, stats)
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

- [ ] Create service interface
- [ ] Implement getGenres()
- [ ] Implement getGamesByGenre()
- [ ] Implement assignGenre()
- [ ] Extract genres from metadata
- [ ] Write unit tests

**Files to create:**
- `libs/core/src/services/GenreService.ts`
- `libs/core/src/__tests__/GenreService.test.ts`

---

## Phase 3: UI Components

### Task 3.1: UI Package Setup with Green Theme
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 1.1

- [ ] Create `libs/ui/package.json`
- [ ] Set up TypeScript configuration
- [ ] Create theme system with Emerald Green palette
- [ ] Define color tokens (#10B981, #0F172A, etc.)
- [ ] Set up component structure
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

- [ ] Button component (variants, sizes)
- [ ] Input component
- [ ] Card component
- [ ] Badge component
- [ ] Icon component wrapper
- [ ] Text component (typography)
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

- [ ] Design GameCard layout
- [ ] Implement cover image with placeholder
- [ ] Add platform badge
- [ ] Add hover/press states
- [ ] Add context menu trigger
- [ ] Handle missing artwork
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameCard/GameCard.tsx`
- `libs/ui/src/components/GameCard/GameCard.styles.ts`
- `libs/ui/src/components/GameCard/index.ts`
- `libs/ui/src/components/GameCard/__tests__/GameCard.test.tsx`

---

### Task 3.4: GameGrid Component
**Priority**: High | **Effort**: 4h | **Dependencies**: Task 3.3

- [ ] Implement responsive grid layout
- [ ] Add virtualization for performance
- [ ] Handle empty state
- [ ] Handle loading state
- [ ] Implement infinite scroll
- [ ] Add grid size options
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameGrid/GameGrid.tsx`
- `libs/ui/src/components/GameGrid/useVirtualization.ts`
- `libs/ui/src/components/GameGrid/index.ts`

---

### Task 3.5: SearchBar Component
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [ ] Design SearchBar layout
- [ ] Implement debounced input
- [ ] Add clear button
- [ ] Add keyboard shortcut hint
- [ ] Style focus states
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/SearchBar/SearchBar.tsx`
- `libs/ui/src/components/SearchBar/index.ts`

---

### Task 3.6: Sidebar Component
**Priority**: High | **Effort**: 3h | **Dependencies**: Task 3.2

- [ ] Design Sidebar layout
- [ ] Platform list with icons
- [ ] Collections list
- [ ] Game counts
- [ ] Collapsible sections
- [ ] Active state styling
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/Sidebar/Sidebar.tsx`
- `libs/ui/src/components/Sidebar/SidebarItem.tsx`
- `libs/ui/src/components/Sidebar/index.ts`

---

### Task 3.7: GameDetail Component
**Priority**: Medium | **Effort**: 3h | **Dependencies**: Task 3.2

- [ ] Design detail view layout
- [ ] Large cover image display
- [ ] Metadata section
- [ ] Play button
- [ ] Favorites toggle
- [ ] Edit metadata button
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GameDetail/GameDetail.tsx`
- `libs/ui/src/components/GameDetail/MetadataSection.tsx`
- `libs/ui/src/components/GameDetail/index.ts`

---

### Task 3.8: Widget Components *(NEW - Daijishou)*
**Priority**: High | **Effort**: 5h | **Dependencies**: Task 3.2

- [ ] Create base Widget container
- [ ] Implement RecentGamesWidget
- [ ] Implement FavoritesWidget
- [ ] Implement StatsWidget (play time, game count)
- [ ] Implement PlatformShortcutsWidget
- [ ] Make widgets draggable/reorderable
- [ ] Add widget size options (small, medium, large)
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

- [ ] Design PlatformCard layout
- [ ] Background wallpaper support
- [ ] Blur/overlay options
- [ ] Game count badge
- [ ] Platform icon
- [ ] Active/hover states
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/PlatformCard/PlatformCard.tsx`
- `libs/ui/src/components/PlatformCard/index.ts`

---

### Task 3.10: GenreList Component *(NEW - Daijishou)*
**Priority**: Medium | **Effort**: 2h | **Dependencies**: Task 3.2

- [ ] Design GenreList layout
- [ ] Genre item with game count
- [ ] Active state styling
- [ ] Horizontal scroll or grid layout
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/GenreList/GenreList.tsx`
- `libs/ui/src/components/GenreList/GenreItem.tsx`
- `libs/ui/src/components/GenreList/index.ts`

---

### Task 3.11: BottomTabBar Component *(NEW - Mobile)*
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 3.2

- [ ] Design bottom navigation layout
- [ ] Tab items: Home, Platforms, Genres, Search, Settings
- [ ] Active state with green accent
- [ ] Icon + label design
- [ ] Write component tests

**Files to create:**
- `libs/ui/src/components/BottomTabBar/BottomTabBar.tsx`
- `libs/ui/src/components/BottomTabBar/TabItem.tsx`
- `libs/ui/src/components/BottomTabBar/index.ts`

---

## Phase 4: Desktop Application (Electron)

### Task 4.1: Electron Project Setup
**Priority**: Critical | **Effort**: 3h | **Dependencies**: Task 3.1

- [ ] Create `apps/desktop/package.json`
- [ ] Set up TypeScript configuration
- [ ] Configure Vite for renderer
- [ ] Set up main process entry
- [ ] Configure preload script
- [ ] Add dev scripts

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

- [ ] Window creation and management
- [ ] IPC handlers for file system
- [ ] IPC handlers for database
- [ ] IPC handlers for launching
- [ ] Native menu implementation
- [ ] Tray icon (optional)
- [ ] Handle app lifecycle

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

- [ ] App layout with sidebar
- [ ] Header with search
- [ ] Router setup
- [ ] Theme provider
- [ ] Error boundary

**Files to create:**
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/Layout.tsx`
- `apps/desktop/src/renderer/routes.tsx`
- `apps/desktop/src/renderer/providers/ThemeProvider.tsx`
- `apps/desktop/src/renderer/components/ErrorBoundary.tsx`

---

### Task 4.4: Desktop Screens
**Priority**: High | **Effort**: 8h | **Dependencies**: Task 4.3

- [ ] Home screen with widgets *(Daijishou style)*
- [ ] Library screen (main grid view)
- [ ] Platform screen with wallpaper
- [ ] Genre screen *(NEW)*
- [ ] Collection screen
- [ ] Game detail screen/modal
- [ ] Settings screen
- [ ] First-run setup wizard

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

- [ ] Configure electron-builder
- [ ] macOS build settings
- [ ] Windows build settings
- [ ] Linux build settings
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

- [ ] Initialize React Native project
- [ ] Configure TypeScript
- [ ] Set up Metro bundler for monorepo
- [ ] Install native dependencies
- [ ] Configure iOS project
- [ ] Configure Android project

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

- [ ] Install React Navigation
- [ ] Set up bottom tabs
- [ ] Set up stack navigator
- [ ] Configure deep linking (optional)

**Files to create:**
- `apps/mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/src/navigation/TabNavigator.tsx`
- `apps/mobile/src/navigation/types.ts`

---

### Task 5.3: Mobile App Shell
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.2

- [ ] App entry point
- [ ] Theme provider
- [ ] Database initialization
- [ ] Splash screen
- [ ] Error handling

**Files to create:**
- `apps/mobile/src/App.tsx`
- `apps/mobile/src/providers/AppProviders.tsx`
- `apps/mobile/src/services/init.ts`

---

### Task 5.4: Mobile Screens
**Priority**: High | **Effort**: 8h | **Dependencies**: Task 5.3

- [ ] Home screen with widgets *(Daijishou style)*
- [ ] Library screen
- [ ] Platform browser screen with wallpapers
- [ ] Genre browser screen *(NEW)*
- [ ] Collections screen
- [ ] Game detail screen
- [ ] Settings screen
- [ ] Emulator config screen

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

- [ ] File picker integration
- [ ] Document directory access
- [ ] External storage access (Android)
- [ ] URL scheme launching
- [ ] Share extension (optional)

**Files to create:**
- `apps/mobile/src/services/FileService.ts`
- `apps/mobile/src/services/LauncherService.ts`
- `apps/mobile/src/services/StorageService.ts`

---

### Task 5.6: Mobile Build Configuration
**Priority**: High | **Effort**: 2h | **Dependencies**: Task 5.4

- [ ] iOS build settings (Xcode)
- [ ] Android build settings (Gradle)
- [ ] App icons generation
- [ ] Splash screen configuration
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

- [ ] Core services tests (>80% coverage)
- [ ] Database adapters tests
- [ ] Emulator registry tests
- [ ] Utility function tests
- [ ] Set up CI test runner

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

- [ ] Architecture documentation
- [ ] API documentation
- [ ] Emulator integration guide
- [ ] Contributing guide
- [ ] README updates

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
