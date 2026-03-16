# @emuz/core

> Central business logic layer: Zod models, service interfaces, Zustand stores, and React hooks shared by both apps.

## Boundaries

### Owns
- Domain models with Zod schemas and inferred TypeScript types (`Game`, `Platform`, `Emulator`, `Collection`, `Widget`, `Genre`)
- Service interfaces and concrete implementations (`LibraryService`, `ScannerService`, `LaunchService`, `WidgetService`, `GenreService`)
- Zustand stores (`useLibraryStore`, `useSettingsStore`, `useUIStore`)
- Business-logic React hooks that compose stores and services

### Delegates
- File I/O and filesystem operations → `@emuz/platform` (FileSystemAdapter)
- SQL queries and database connections → `@emuz/database` (DatabaseAdapter)
- UI rendering and visual components → `@emuz/ui`
- Emulator definitions and auto-detection logic → `@emuz/emulators`
- i18n string resolution → `@emuz/i18n`
- Platform-specific launch mechanisms (Android intents, iOS URL schemes) → `@emuz/platform` (LauncherAdapter)

## Integration Map

### Internal dependencies
| Package | Used for |
|---------|----------|
| `@emuz/database` | DatabaseAdapter for all read/write operations |
| `@emuz/platform` | FileSystemAdapter (scan, hash) + LauncherAdapter (game launch) |

### Depended by
- `@emuz/ui` — imports models (`Game`, `Platform`, `Collection`) for component props
- `apps/desktop` — consumes all services and stores via hooks
- `apps/mobile` — consumes all services and stores via hooks

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `zod` | `^3.x` | Schema validation and TypeScript type inference for all models |
| `zustand` | `^5.x` | Reactive state stores |
| `@tanstack/react-query` | `^5.x` | Server-state caching for service calls |

## Usage

### Command line

```bash
# Build
pnpm nx build core

# Test
pnpm nx test core

# Test with coverage (minimum 80% required)
pnpm nx test core --coverage

# Test in watch mode
pnpm nx test core --watch

# Lint
pnpm nx lint core
```

### Code

```typescript
// Models
import type { Game, Platform, Emulator, Collection } from '@emuz/core';

// Services
import { LibraryService, ScannerService, LaunchService } from '@emuz/core';

// Stores
import { useLibraryStore, useSettingsStore, useUIStore } from '@emuz/core';

// Example: consuming the library store in a component
function GameList() {
  const { games, fetchGames, isLoading } = useLibraryStore();

  useEffect(() => { fetchGames(); }, []);

  return isLoading ? <Spinner /> : <GameGrid games={games} />;
}
```

## Public API

### Models

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
  playTime: number; // seconds
  lastPlayedAt?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

### Services

```typescript
interface ILibraryService {
  getAllGames(options?: PaginationOptions): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]>;
  searchGames(options: SearchOptions): Promise<Game[]>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | null>;
  deleteGame(id: string): Promise<void>;
  getFavorites(options?: PaginationOptions): Promise<Game[]>;
  addToFavorites(gameId: string): Promise<void>;
  removeFromFavorites(gameId: string): Promise<void>;
  getCollections(): Promise<Collection[]>;
  createCollection(input: CreateCollectionInput): Promise<Collection>;
  updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null>;
  deleteCollection(id: string): Promise<void>;
  addToCollection(collectionId: string, gameId: string): Promise<void>;
  removeFromCollection(collectionId: string, gameId: string): Promise<void>;
  recordPlaySession(gameId: string, duration: number): Promise<void>;
  getRecentlyPlayed(limit?: number): Promise<Game[]>;
}

interface IScannerService {
  addDirectory(path: string, options?: AddDirectoryOptions): Promise<void>;
  removeDirectory(path: string, options?: RemoveDirectoryOptions): Promise<void>;
  getDirectories(): Promise<ScanDirectory[]>;
  scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  getScanStatus(): ScanStatus;
  detectPlatformByExtension(extension: string): string | null;
  calculateHash(filePath: string): Promise<string>;
}

interface ILaunchService {
  getEmulators(options?: EmulatorFilter): Promise<Emulator[]>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;
  detectEmulators(): Promise<DetectedEmulator[]>;
  addEmulator(input: AddEmulatorInput): Promise<Emulator>;
  updateEmulator(id: string, updates: Partial<Emulator>): Promise<Emulator | null>;
  deleteEmulator(id: string): Promise<void>;
  setDefaultEmulator(emulatorId: string, platformId: string): Promise<void>;
  launchGame(game: Game, emulatorId?: string): Promise<LaunchResult>;
  buildCommand(emulator: Emulator, options: CommandOptions): string;
  endPlaySession(sessionId: string, duration: number): Promise<void>;
  getPlayHistory(gameId: string, options?: HistoryOptions): Promise<PlaySession[]>;
}
```

### Stores

```typescript
// useLibraryStore
interface LibraryState {
  games: Game[];
  platforms: Platform[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  fetchPlatforms: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  setGames: (games: Game[]) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  removeGame: (id: string) => void;
}

// useSettingsStore
interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  language: string;
  gridColumns: number;
  showHiddenFiles: boolean;
  scanDirectories: string[];
  setTheme: (theme: SettingsState['theme']) => void;
  setLanguage: (language: string) => void;
  setGridColumns: (columns: number) => void;
  setScanDirectories: (dirs: string[]) => void;
}

// useUIStore
interface UIState {
  sidebarOpen: boolean;
  currentView: 'grid' | 'list';
  sortBy: 'title' | 'lastPlayed' | 'platform' | 'rating';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  selectedPlatform: string | null;
  selectedGenre: string | null;
  toggleSidebar: () => void;
  setView: (view: UIState['currentView']) => void;
  setSort: (by: UIState['sortBy'], order: UIState['sortOrder']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlatform: (platformId: string | null) => void;
}
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Import `better-sqlite3` or `react-native-sqlite-storage` directly | Use `@emuz/database` DatabaseAdapter |
| Import `fs`, `path`, or `RNFS` directly | Use `@emuz/platform` FileSystemAdapter |
| Put React Native or Electron-specific code in services | Keep services platform-agnostic; platform specifics live in `@emuz/platform` |
| Call `useLibraryStore` outside a React component | Use service methods directly in non-component code |
| Bypass Zod validation when creating/updating models | Always parse through the Zod schema to get a validated type |

## Constraints

- **Strict TypeScript** — no `any`, no implicit `any`, no `ts-ignore` without justification
- **Minimum 80% test coverage** for all services (enforced by CI)
- **No platform-specific imports** — this lib must compile for both Electron and React Native environments
- **Test-first** — write tests before implementing any service method (TDD, see `CLAUDE.md`)
- All public service methods must have explicit return types

## See Also

- Full API reference: [docs/api.md](../../docs/api.md#emuzcore)
- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
