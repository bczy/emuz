import type { CollectionGameRow } from './rows.js';

/**
 * Minimal file I/O abstraction used by the storage engine.
 * Keeps the engine decoupled from Node.js or React Native specifics.
 */
export interface FileIO {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  /** Atomic rename — used for write-then-rename flush strategy. */
  rename(from: string, to: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  joinPath(...parts: string[]): string;
}

/**
 * Generic store backed by a single JSON file.
 * T must have a string key field (default: 'id').
 */
export interface CollectionStore<T extends object> {
  all(): T[];
  findById(id: string): T | undefined;
  find(predicate: (item: T) => boolean): T[];
  findOne(predicate: (item: T) => boolean): T | undefined;
  count(predicate?: (item: T) => boolean): number;
  /** Throws if the key already exists. */
  insert(item: T): void;
  /** Insert or replace. */
  upsert(item: T): void;
  update(id: string, patch: Partial<T>): T | undefined;
  delete(id: string): boolean;
  flush(): Promise<void>;
  load(): Promise<void>;
}

/**
 * Junction store for the many-to-many collection↔game relationship.
 * Keyed by composite (collection_id, game_id).
 */
export interface CollectionGameStore {
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

import type {
  PlatformRow,
  GameRow,
  EmulatorRow,
  CollectionRow,
  WidgetRow,
  GenreRow,
  SettingsRow,
  ScanDirectoryRow,
  PlaySessionRow,
} from './rows.js';

export interface FlatDb {
  platforms: CollectionStore<PlatformRow>;
  games: CollectionStore<GameRow>;
  emulators: CollectionStore<EmulatorRow>;
  collections: CollectionStore<CollectionRow>;
  collectionGames: CollectionGameStore;
  widgets: CollectionStore<WidgetRow>;
  genres: CollectionStore<GenreRow>;
  settings: CollectionStore<SettingsRow>;
  scanDirectories: CollectionStore<ScanDirectoryRow>;
  playSessions: CollectionStore<PlaySessionRow>;
  open(): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}
