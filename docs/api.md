# EmuZ API Reference

This document describes the public API for EmuZ libraries.

## @emuz/core

### Models

#### Game

```typescript
interface Game {
  id: string;
  platformId: string;
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
  rating?: number;
  playCount: number;
  playTime: number; // in seconds
  lastPlayedAt?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Platform

```typescript
interface Platform {
  id: string;
  name: string;
  shortName: string;
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
  executablePath: string;
  platforms: string[];
  commandTemplate: string;
  config?: Record<string, unknown>;
  isDefault: boolean;
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
  gameIds: string[];
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Widget

```typescript
type WidgetType = 
  | 'recent_games' 
  | 'favorites' 
  | 'stats' 
  | 'platform_shortcuts'
  | 'collection';

type WidgetSize = 'small' | 'medium' | 'large';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
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
  id: string;
  name: string;
  gameCount: number;
}
```

### Services

#### LibraryService

```typescript
interface ILibraryService {
  // Games
  getAllGames(options?: PaginationOptions): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]>;
  searchGames(options: SearchOptions): Promise<Game[]>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | null>;
  deleteGame(id: string): Promise<void>;
  
  // Favorites
  getFavorites(options?: PaginationOptions): Promise<Game[]>;
  addToFavorites(gameId: string): Promise<void>;
  removeFromFavorites(gameId: string): Promise<void>;
  
  // Collections
  getCollections(): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | null>;
  createCollection(input: CreateCollectionInput): Promise<Collection>;
  updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null>;
  deleteCollection(id: string): Promise<void>;
  addToCollection(collectionId: string, gameId: string): Promise<void>;
  removeFromCollection(collectionId: string, gameId: string): Promise<void>;
  
  // Play Tracking
  recordPlaySession(gameId: string, duration: number): Promise<void>;
  getRecentlyPlayed(limit?: number): Promise<Game[]>;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface SearchOptions {
  query: string;
  platformId?: string;
  genre?: string;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
}
```

#### ScannerService

```typescript
interface IScannerService {
  // Directory Management
  addDirectory(path: string, options?: AddDirectoryOptions): Promise<void>;
  removeDirectory(path: string, options?: RemoveDirectoryOptions): Promise<void>;
  getDirectories(): Promise<ScanDirectory[]>;
  
  // Scanning
  scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  getScanStatus(): ScanStatus;
  
  // Utilities
  detectPlatformByExtension(extension: string): string | null;
  calculateHash(filePath: string): Promise<string>;
}

interface ScanOptions {
  platformId?: string;
  recursive?: boolean;
  skipExisting?: boolean;
}

interface ScanProgress {
  fileName: string;
  filePath: string;
  progress: number; // 0-100
  filesScanned: number;
  gamesFound: number;
  currentDirectory: string;
}
```

#### LaunchService

```typescript
interface ILaunchService {
  // Emulators
  getEmulators(options?: EmulatorFilter): Promise<Emulator[]>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;
  detectEmulators(): Promise<DetectedEmulator[]>;
  addEmulator(input: AddEmulatorInput): Promise<Emulator>;
  updateEmulator(id: string, updates: Partial<Emulator>): Promise<Emulator | null>;
  deleteEmulator(id: string): Promise<void>;
  setDefaultEmulator(emulatorId: string, platformId: string): Promise<void>;
  
  // Launching
  launchGame(game: Game, emulatorId?: string): Promise<LaunchResult>;
  buildCommand(emulator: Emulator, options: CommandOptions): string;
  
  // Sessions
  endPlaySession(sessionId: string, duration: number): Promise<void>;
  getPlayHistory(gameId: string, options?: HistoryOptions): Promise<PlaySession[]>;
}

interface LaunchResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}
```

#### WidgetService

```typescript
interface IWidgetService {
  getWidgets(options?: WidgetFilter): Promise<Widget[]>;
  addWidget(input: AddWidgetInput): Promise<Widget>;
  updateWidget(id: string, updates: Partial<Widget>): Promise<Widget | null>;
  removeWidget(id: string): Promise<void>;
  reorderWidgets(newOrder: string[]): Promise<void>;
  getWidgetData(widgetId: string, type: WidgetType): Promise<WidgetData>;
  getDefaultWidgets(): WidgetConfig[];
}
```

#### GenreService

```typescript
interface IGenreService {
  getGenres(): Promise<Genre[]>;
  getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]>;
  assignGenre(gameId: string, genre: string | null): Promise<void>;
  getGenreStats(genre: string): Promise<GenreStats>;
  extractGenreFromMetadata(metadata: string): string | null;
}
```

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

const useLibraryStore = create<LibraryState>(/* ... */);
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

### DatabaseAdapter

```typescript
interface DatabaseAdapter {
  open(): Promise<void>;
  close(): Promise<void>;
  isConnected(): boolean;
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
```

### Desktop Adapter

```typescript
import { createDesktopAdapter } from '@emuz/database';

const adapter = await createDesktopAdapter({
  path: '/path/to/database.db',
  wal: true,
  foreignKeys: true,
});

await adapter.open();
```

### Mobile Adapter

```typescript
import { createMobileAdapter } from '@emuz/database';

const adapter = await createMobileAdapter({
  name: 'emuz.db',
  location: 'default',
});

await adapter.open();
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
  readDir(path: string): Promise<FileEntry[]>;
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: Buffer): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStat>;
  mkdir(path: string): Promise<void>;
  rm(path: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  move(src: string, dest: string): Promise<void>;
  getDocumentsPath(): string;
  getCachePath(): string;
}

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FileStat {
  size: number;
  mtime: Date;
  isDirectory: boolean;
}
```

### LauncherAdapter

```typescript
interface LauncherAdapter {
  launch(command: string, options?: LaunchOptions): Promise<LaunchResult>;
  isAvailable(path: string): boolean;
  detectEmulators(): Promise<DetectedEmulator[]>;
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
</Button>
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

<GameCard
  game={game}
  onPress={handleGamePress}
  showPlatformBadge
/>
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

<GameGrid
  games={games}
  columns={4}
  onGamePress={handleGamePress}
/>
```

#### SearchBar

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search games..."
/>
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
</I18nProvider>

// Use in components
function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button onClick={() => i18n.changeLanguage('es')}>
        Español
      </button>
    </div>
  );
}
```

### Available Namespaces

- `common`: Common strings (app name, buttons, etc.)
- `games`: Game-related strings
- `platforms`: Platform names and descriptions
- `settings`: Settings labels and descriptions
