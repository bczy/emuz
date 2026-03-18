# EmuZ API Reference

This document describes the public API for EmuZ libraries.

## @emuz/core

### Models

All models are defined with Zod schemas in `libs/core/src/models`. The inferred TypeScript types are exported alongside their schemas.

#### Game

```typescript
interface Game {
  id: string; // UUID
  platformId: string; // UUID ref to Platform
  title: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  fileHash?: string;
  coverPath?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genre?: string;
  rating?: number; // 0–5
  playCount: number;
  playTime: number; // in seconds
  lastPlayedAt?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// External metadata (from scrapers)
interface GameMetadata {
  title?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genre?: string;
  coverUrl?: string; // URL (not a local path)
  rating?: number; // 0–5
}
```

#### Platform

```typescript
interface Platform {
  id: string;
  name: string;
  shortName?: string;
  manufacturer?: string;
  generation?: number;
  releaseYear?: number;
  color?: string;
  iconPath?: string;
  wallpaperPath?: string;
  fileExtensions: string[];
  sortOrder: number;
}
```

#### Emulator

```typescript
interface Emulator {
  id: string;
  name: string;
  platforms: string[]; // platform IDs
  executablePath?: string; // desktop
  packageName?: string; // Android
  urlScheme?: string; // iOS
  iconPath?: string;
  commandTemplate?: string;
  corePath?: string; // RetroArch cores
  isDefault: boolean;
  isInstalled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Collection

```typescript
interface Collection {
  id: string;
  name: string;
  description?: string;
  coverPath?: string;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Widget

```typescript
type WidgetType = 'recent_games' | 'favorites' | 'stats' | 'platform_shortcuts' | 'collection';

type WidgetSize = 'small' | 'medium' | 'large';

interface Widget {
  id: string;
  type: WidgetType;
  title?: string;
  size: WidgetSize;
  position: number;
  config?: Record<string, unknown>;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Genre

```typescript
interface Genre {
  id: string; // UUID
  name: string;
  slug: string; // lowercase kebab, e.g. 'action-rpg'
  iconName?: string;
  color?: string; // hex color, e.g. '#10B981'
  gameCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Services

All service interfaces live in `libs/core/src/services/types.ts`. Concrete implementations accept a `DrizzleDb` instance from `@emuz/database`.

#### Shared Option Types

```typescript
interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
}

interface SearchOptions extends PaginationOptions {
  query?: string;
  platformId?: string;
  genreId?: string;
  genre?: string;
  favorite?: boolean;
}

interface ScanStatus {
  isScanning: boolean;
  currentDirectory?: string;
  filesScanned: number;
  gamesFound: number;
}

interface ScanProgress {
  phase: 'scanning' | 'identifying' | 'complete' | 'error';
  currentPath?: string;
  fileName?: string;
  progress?: number;
  filesFound: number;
  filesProcessed: number;
  gamesAdded: number;
  gamesUpdated: number;
  errors: string[];
}

interface RomDirectory {
  id: string;
  path: string;
  platformId?: string;
  recursive: boolean;
  enabled: boolean;
  lastScanned?: Date;
  createdAt: Date;
}

interface MetadataProgress {
  phase: 'searching' | 'downloading' | 'complete' | 'error';
  gameId: string;
  gamesProcessed: number;
  gamesTotal: number;
  found: number;
  notFound: number;
  errors: string[];
}

interface PlaySession {
  id: string;
  gameId: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
}

interface CreateCollectionInput {
  name: string;
  description?: string;
  coverPath?: string;
  isSystem?: boolean;
}

interface CreateEmulatorInput {
  name: string;
  platforms: string[];
  executablePath?: string;
  packageName?: string;
  urlScheme?: string;
  iconPath?: string;
  commandTemplate?: string;
  corePath?: string;
}
```

#### LibraryService

```typescript
interface ILibraryService {
  // Games
  getAllGames(options?: PaginationOptions): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]>;
  searchGames(
    options: SearchOptions | string | { query?: string; platformId?: string; genre?: string }
  ): Promise<Game[]>;
  updateGame(id: string, data: Partial<Game>): Promise<Game | null>;
  deleteGame(id: string): Promise<void>;
  getGameCount(): Promise<number>;
  getRecentGames(limit?: number): Promise<Game[]>;
  getRecentlyPlayed(limit?: number): Promise<Game[]>;
  recordPlaySession(gameId: string, duration: number): Promise<void>;

  // Collections
  getCollections(): Promise<Collection[]>;
  createCollection(data: CreateCollectionInput): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  addToCollection(collectionId: string, gameId: string): Promise<void>;
  removeFromCollection(collectionId: string, gameId: string): Promise<void>;
  getCollectionGames(collectionId: string): Promise<Game[]>;

  // Favorites
  toggleFavorite(gameId: string): Promise<void>;
  addToFavorites(gameId: string): Promise<void>;
  removeFromFavorites(gameId: string): Promise<void>;
  getFavorites(): Promise<Game[]>;
}
```

#### ScannerService

```typescript
interface IScannerService {
  // Directory management
  addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory>;
  removeDirectory(path: string, options?: { removeGames?: boolean }): Promise<void>;
  getDirectories(): Promise<RomDirectory[]>;
  updateDirectory(id: string, data: Partial<RomDirectory>): Promise<void>;

  // Scanning
  scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress>;
  scanDirectory(path: string): AsyncGenerator<ScanProgress>;
  scanAllDirectories(): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  getScanStatus(): ScanStatus;

  // ROM detection
  detectPlatform(filePath: string): Promise<Platform | null>;
  detectPlatformByExtension(ext: string): string | null;
  calculateHash(filePath: string): Promise<string>;
}

interface ScanOptions {
  recursive?: boolean;
  platformId?: string;
  includeHidden?: boolean;
  skipExisting?: boolean;
}
```

#### MetadataService

```typescript
interface IMetadataService {
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

#### LaunchService

```typescript
interface ILaunchService {
  // Emulator management
  getEmulators(options?: { platformId?: string }): Promise<Emulator[]>;
  getEmulatorById(id: string): Promise<Emulator | null>;
  detectEmulators(): Promise<Array<{ name: string; path: string }>>;
  addEmulator(data: CreateEmulatorInput): Promise<Emulator>;
  updateEmulator(id: string, data: Partial<Emulator>): Promise<void>;
  deleteEmulator(id: string): Promise<void>;
  setDefaultEmulator(emulatorId: string, platformId: string): Promise<void>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;

  // Launching
  launchGame(game: Game, emulatorId?: string): Promise<{ success: boolean }>;
  buildCommand(emulator: Emulator, vars: { romPath: string; core?: string }): string;
  buildLaunchCommand(game: Game, emulator: Emulator): string;

  // Tracking
  recordPlaySession(gameId: string, duration: number): Promise<void>;
  endPlaySession(sessionId: string, duration: number): Promise<void>;
  getPlayHistory(gameId: string, options?: { limit?: number }): Promise<PlaySession[]>;
}
```

#### WidgetService

```typescript
interface IWidgetService {
  getWidgets(options?: { visibleOnly?: boolean }): Promise<Widget[]>;
  getWidgetById(id: string): Promise<Widget | null>;
  addWidget(config: { type: Widget['type']; title?: string; size?: string }): Promise<Widget>;
  removeWidget(id: string): Promise<void>;
  updateWidget(id: string, data: Partial<Widget>): Promise<Widget | null>;
  reorderWidgets(widgetIds: string[]): Promise<void>;
  getWidgetData(id: string, type: Widget['type']): Promise<unknown>;
  getDefaultWidgets(): Array<{ type: Widget['type']; title?: string; size?: string }>;
}
```

#### GenreService

```typescript
interface IGenreService {
  getGenres(): Promise<Array<{ id: string; name: string; gameCount: number }>>;
  getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]>;
  assignGenre(gameId: string, genreId: string | null): Promise<void>;
  removeGenre(gameId: string, genreId: string): Promise<void>;
  extractGenreFromMetadata(input: string | null): string | null;
  getGenreStats(genre: string): Promise<{
    totalGames: number;
    totalPlayTime: number;
    averageRating: number;
  }>;
}
```

#### PlatformService

```typescript
interface IPlatformService {
  getPlatforms(): Promise<Platform[]>;
  getPlatformById(id: string): Promise<Platform | null>;
  getPlatformByExtension(extension: string): Promise<Platform | null>;
  getGameCountByPlatform(platformId: string): Promise<number>;
}
```

---

### Stores (Zustand)

#### useLibraryStore

```typescript
interface LibraryState {
  games: Game[];
  platforms: Platform[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGames: () => Promise<void>;
  fetchPlatforms: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  setGames: (games: Game[]) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  removeGame: (id: string) => void;
}
```

#### useSettingsStore

```typescript
interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  language: string;
  gridColumns: number;
  showHiddenFiles: boolean;
  scanDirectories: string[];

  // Actions
  setTheme: (theme: SettingsState['theme']) => void;
  setLanguage: (language: string) => void;
  setGridColumns: (columns: number) => void;
  setScanDirectories: (dirs: string[]) => void;
}
```

#### useUIStore

```typescript
interface UIState {
  sidebarOpen: boolean;
  currentView: 'grid' | 'list';
  sortBy: 'title' | 'lastPlayed' | 'platform' | 'rating';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  selectedPlatform: string | null;
  selectedGenre: string | null;

  // Actions
  toggleSidebar: () => void;
  setView: (view: UIState['currentView']) => void;
  setSort: (by: UIState['sortBy'], order: UIState['sortOrder']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlatform: (platformId: string | null) => void;
}
```

---

## @emuz/database

### Drizzle Schema (current)

The canonical database API. Import from `@emuz/database/schema`:

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'; // desktop
import { drizzle } from 'drizzle-orm/op-sqlite'; // mobile
import { drizzleSchema, type DrizzleDb } from '@emuz/database';

// Desktop
const sqlite = new Database('/path/to/emuz.db');
const db: DrizzleDb = drizzle(sqlite, { schema: drizzleSchema });

// Query example
const games = await db.select().from(drizzleSchema.games).all();
```

Exported tables: `platforms`, `games`, `emulators`, `collections`, `collectionGames`, `widgets`, `genres`, `settings`, `scanDirectories`.

### DatabaseAdapter (deprecated)

> **Deprecated** — retained as a compatibility shim during the transition to Drizzle ORM (Story 1.7 / ADR-013). Will be removed in v1.0. Use `DrizzleDb` instead.

```typescript
interface DatabaseAdapter {
  open(): Promise<void>;
  close(): Promise<void>;
  isConnected(): boolean;
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  transaction(fn: () => Promise<unknown>): Promise<unknown>;
}
```

---

## @emuz/emulators

### Registry Functions

```typescript
import {
  getAllEmulators,
  getEmulatorById,
  searchEmulators,
  getEmulatorsByPlatform,
  getEmulatorsByHostPlatform,
  getRecommendedEmulator,
} from '@emuz/emulators';

// Get all emulator definitions
const emulators = getAllEmulators();

// Get specific emulator
const retroarch = getEmulatorById('retroarch');

// Search with criteria
const gbaEmulators = searchEmulators({
  platformId: 'gba',
  hostPlatform: 'linux',
});

// Get recommended for platform
const recommended = getRecommendedEmulator('nes', 'windows');
```

### EmulatorDefinition

```typescript
interface EmulatorDefinition {
  id: string;
  name: string;
  description?: string;
  website?: string;
  platformIds: string[];
  hostPlatforms: HostPlatform[];
  commandTemplate?: string;
  defaultPaths?: Record<HostPlatform, string[]>;
  androidPackages?: string[];
  iosUrlScheme?: string;
  isRetroarchCore?: boolean;
  corePath?: string;
}

type HostPlatform = 'windows' | 'macos' | 'linux' | 'android' | 'ios';
```

---

## @emuz/platform

### FileSystemAdapter

```typescript
interface FileSystemAdapter {
  readText(path: string, options?: ReadOptions): Promise<string>;
  readBinary(path: string): Promise<Uint8Array>;
  writeText(path: string, content: string, options?: WriteOptions): Promise<void>;
  writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileInfo>;
  list(path: string): Promise<DirectoryListing>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  rmdir(path: string, recursive?: boolean): Promise<void>;
  copy(source: string, destination: string): Promise<void>;
  move(source: string, destination: string): Promise<void>;
  scanForRoms(path: string, options?: ScanOptions): Promise<FileInfo[]>;
  getDocumentsPath(): Promise<string>;
  getCachePath(): Promise<string>;
  requestReadPermission?(path: string): Promise<boolean>; // mobile only
  requestWritePermission?(path: string): Promise<boolean>; // mobile only
}

interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedAt: Date;
  createdAt?: Date;
  extension?: string;
  mimeType?: string;
}

interface DirectoryListing {
  path: string;
  entries: FileInfo[];
  hasMore?: boolean;
}

interface ScanOptions {
  extensions?: string[]; // e.g. ['nes', 'smc', 'gba']
  recursive?: boolean;
  maxDepth?: number;
  limit?: number;
}
```

### EmulatorLauncher

```typescript
interface EmulatorLauncher {
  launch(options: LaunchOptions): Promise<LaunchResult>;
  launchWithConfig(config: EmulatorLaunchConfig, romPath: string): Promise<LaunchResult>;
  isInstalled(config: EmulatorLaunchConfig): Promise<boolean>;
  getAvailableEmulators?(platformId: string): Promise<EmulatorLaunchConfig[]>;
}

type LaunchStatus = 'success' | 'error' | 'not_found' | 'not_installed';

interface LaunchResult {
  status: LaunchStatus;
  error?: string;
  pid?: number; // desktop only
  metadata?: Record<string, unknown>;
}

interface LaunchOptions {
  romPath: string;
  emulatorPath: string;
  args?: string[];
  workingDirectory?: string;
  env?: Record<string, string>;
  waitForExit?: boolean;
}
```

---

## @emuz/ui

### Components

#### Button

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

<Button variant="primary" size="md" onClick={handleClick}>
  Play Game
</Button>;
```

#### GameCard

```tsx
interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
  onLongPress?: (game: Game) => void;
  showPlatformBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

<GameCard game={game} onPress={handleGamePress} showPlatformBadge />;
```

#### GameGrid

```tsx
interface GameGridProps {
  games: Game[];
  columns?: number;
  loading?: boolean;
  emptyMessage?: string;
  onGamePress?: (game: Game) => void;
  onLoadMore?: () => void;
}

<GameGrid games={games} columns={4} onGamePress={handleGamePress} />;
```

#### SearchBar

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search games..." />;
```

#### Sidebar

```tsx
interface SidebarProps {
  platforms: Platform[];
  collections: Collection[];
  selectedPlatform?: string;
  selectedCollection?: string;
  onPlatformSelect: (platformId: string) => void;
  onCollectionSelect: (collectionId: string) => void;
}
```

### Theme Tokens

```typescript
const theme = {
  colors: {
    primary: {
      DEFAULT: '#10B981',
      dark: '#059669',
      light: '#34D399',
    },
    background: {
      DEFAULT: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    status: {
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
};
```

---

## @emuz/i18n

### Usage

```tsx
import { useTranslation, I18nProvider } from '@emuz/i18n';

// Wrap app in provider
<I18nProvider>
  <App />
</I18nProvider>;

// Use in components
function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button onClick={() => i18n.changeLanguage('es')}>Español</button>
    </div>
  );
}
```

### Available Namespaces

- `common`: Common strings (app name, buttons, etc.)
- `games`: Game-related strings
- `platforms`: Platform names and descriptions
- `settings`: Settings labels and descriptions
