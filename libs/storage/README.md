# @emuz/storage

> Zero-dependency flat-file JSON storage engine used by both apps. Replaces SQLite with an atomic write-then-rename strategy backed by an injectable `FileIO` interface.

## Boundaries

### Owns
- `FileIO` interface — minimal I/O abstraction decoupling the engine from Node.js or React Native
- `CollectionStore<T>` — generic in-memory store backed by a single JSON file
- `CollectionGameStore` — junction store for the many-to-many collection↔game relationship
- `FlatDb` — orchestrates all 10 stores; single `open / flush / close` lifecycle
- `createNodeFileIO()` — Node.js implementation of `FileIO` (desktop / Electron)
- `loadPlatformSeeds()` — seeds 25 built-in gaming platforms on first run

### Delegates
- Business-logic queries and domain rules → `@emuz/core`
- React Native file I/O — caller must supply a `FileIO` implementation (e.g. via `react-native-fs`)

## Integration Map

### Depended by
- `@emuz/core` — creates a `FlatDb` instance and passes it to services

### External dependencies

None at runtime. Dev-only: `typescript`, `vitest`.

## Usage

### Command line

```bash
# Build
pnpm nx build storage

# Test
pnpm nx test storage

# Test with coverage
pnpm nx test storage --coverage
```

### Code

```typescript
import { createFlatDb, createNodeFileIO } from '@emuz/storage';

// Desktop (Electron main process)
const db = createFlatDb('/path/to/data', createNodeFileIO());
await db.open(); // creates dataDir, loads all stores, seeds platforms

// Read
const allGames = db.games.all();
const game = db.games.findById('abc-123');

// Write
db.games.insert({ id: 'abc-123', title: 'Zelda', platform_id: 'nes', /* … */ });
db.games.update('abc-123', { play_count: 5 });
db.games.delete('abc-123');

// Many-to-many
db.collectionGames.insert({ collection_id: 'col-1', game_id: 'abc-123', added_at: new Date() });
const gamesInCol = db.collectionGames.findByCollection('col-1');

// Persist to disk
await db.flush();
await db.close();
```

**Supplying a custom `FileIO`** (React Native):

```typescript
import RNFS from 'react-native-fs';
import type { FileIO } from '@emuz/storage';
import path from 'path';

const rnFileIO: FileIO = {
  readText: (p) => RNFS.readFile(p, 'utf8').catch(() => ''),
  writeText: (p, c) => RNFS.writeFile(p, c, 'utf8'),
  rename: (from, to) => RNFS.moveFile(from, to),
  exists: RNFS.exists,
  mkdir: (p) => RNFS.mkdir(p),
  joinPath: (...parts) => parts.join('/'),
};

const db = createFlatDb(RNFS.DocumentDirectoryPath + '/emuz', rnFileIO);
await db.open();
```

## Public API

### `createFlatDb(dataDir, io)`

```typescript
function createFlatDb(dataDir: string, io: FileIO): FlatDb;
```

Returns a `FlatDb` instance. Call `open()` before accessing any store.

### `FlatDb`

```typescript
interface FlatDb {
  platforms:       CollectionStore<PlatformRow>;
  games:           CollectionStore<GameRow>;
  emulators:       CollectionStore<EmulatorRow>;
  collections:     CollectionStore<CollectionRow>;
  collectionGames: CollectionGameStore;
  widgets:         CollectionStore<WidgetRow>;
  genres:          CollectionStore<GenreRow>;
  settings:        CollectionStore<SettingsRow>;      // keyed by 'key', not 'id'
  scanDirectories: CollectionStore<ScanDirectoryRow>;
  playSessions:    CollectionStore<PlaySessionRow>;
  open():  Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}
```

### `CollectionStore<T>`

```typescript
interface CollectionStore<T extends object> {
  all(): T[];
  findById(id: string): T | undefined;
  find(predicate: (item: T) => boolean): T[];
  findOne(predicate: (item: T) => boolean): T | undefined;
  count(predicate?: (item: T) => boolean): number;
  insert(item: T): void;      // throws if key already exists
  upsert(item: T): void;      // insert or replace
  update(id: string, patch: Partial<T>): T | undefined;
  delete(id: string): boolean;
  flush(): Promise<void>;
  load(): Promise<void>;
}
```

### `CollectionGameStore`

```typescript
interface CollectionGameStore {
  all(): CollectionGameRow[];
  findByCollection(collectionId: string): CollectionGameRow[];
  findByGame(gameId: string): CollectionGameRow[];
  has(collectionId: string, gameId: string): boolean;
  insert(row: CollectionGameRow): void;
  delete(collectionId: string, gameId: string): boolean;
  deleteByCollection(collectionId: string): void;
  deleteByGame(gameId: string): void;
  count(): number;
  flush(): Promise<void>;
  load(): Promise<void>;
}
```

### `FileIO`

```typescript
interface FileIO {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  rename(from: string, to: string): Promise<void>; // atomic swap
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  joinPath(...parts: string[]): string;
}
```

### `createNodeFileIO()`

```typescript
function createNodeFileIO(): FileIO;
```

Node.js (`node:fs/promises` + `node:path`) implementation. Use in Electron main process only.

### `loadPlatformSeeds(store)`

```typescript
function loadPlatformSeeds(store: CollectionStore<PlatformRow>): void;
```

Inserts 25 built-in platforms (NES, SNES, PS1, GBA, …) if the store is empty. Called automatically by `FlatDb.open()`.

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Call any store before `db.open()` | Always `await db.open()` first |
| Import `createNodeFileIO` in React Native code | Supply a `react-native-fs`-backed `FileIO` |
| Mutate row objects returned by `findById` / `all` directly | Use `update()` so the store marks itself dirty |
| Skip `flush()` / `close()` before process exit | Always call `await db.close()` in your shutdown handler |
| Add business logic inside store predicates | Keep predicates simple; aggregate in `@emuz/core` services |

## Constraints

- **Zero runtime dependencies** — any I/O must come through the injected `FileIO`
- **ESM only** — `"type": "module"` in `package.json`; no CommonJS output
- **Atomic writes** — the engine writes to a `.tmp` file then renames; never partial-write the live file
- **No cross-store transactions** — callers must handle consistency at the service layer
- **Strict TypeScript** — no `any`, no `ts-ignore`

## See Also

- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
- Migration from SQLite: [\_bmad-output/planning-artifacts/architecture.md](../../_bmad-output/planning-artifacts/architecture.md)
