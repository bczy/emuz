import type { CollectionGameRow } from './rows.js';
import type { FileIO, CollectionGameStore as ICollectionGameStore } from './types.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

function compositeKey(collectionId: string, gameId: string): string {
  return `${collectionId}:${gameId}`;
}

/**
 * Junction store for the collection↔game many-to-many relationship.
 * Keyed by composite `${collection_id}:${game_id}`.
 */
export class CollectionGameStore implements ICollectionGameStore {
  private map: Map<string, CollectionGameRow> = new Map();
  private dirty = false;
  private loaded = false;

  constructor(
    private readonly filePath: string,
    private readonly io: FileIO
  ) {}

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;

    const raw = await this.io.readText(this.filePath);
    if (!raw) return;

    try {
      const parsed: CollectionGameRow[] = JSON.parse(raw, dateReviver) as CollectionGameRow[];
      this.map.clear();
      for (const row of parsed) {
        this.map.set(compositeKey(row.collection_id, row.game_id), row);
      }
    } catch {
      // Corrupt file — start empty
    }
  }

  async flush(): Promise<void> {
    if (!this.dirty) return;

    const tmp = `${this.filePath}.tmp`;
    const serialized = JSON.stringify(Array.from(this.map.values()), null, 2);
    await this.io.writeText(tmp, serialized);
    await this.io.rename(tmp, this.filePath);
    this.dirty = false;
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  all(): CollectionGameRow[] {
    return Array.from(this.map.values());
  }

  findByCollection(collectionId: string): CollectionGameRow[] {
    return this.all().filter((r) => r.collection_id === collectionId);
  }

  findByGame(gameId: string): CollectionGameRow[] {
    return this.all().filter((r) => r.game_id === gameId);
  }

  has(collectionId: string, gameId: string): boolean {
    return this.map.has(compositeKey(collectionId, gameId));
  }

  count(): number {
    return this.map.size;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  insert(row: CollectionGameRow): void {
    const key = compositeKey(row.collection_id, row.game_id);
    if (this.map.has(key)) {
      throw new Error(`CollectionGameStore: duplicate pair (${row.collection_id}, ${row.game_id})`);
    }
    this.map.set(key, row);
    this.dirty = true;
  }

  delete(collectionId: string, gameId: string): boolean {
    const key = compositeKey(collectionId, gameId);
    const existed = this.map.has(key);
    if (existed) {
      this.map.delete(key);
      this.dirty = true;
    }
    return existed;
  }

  deleteByCollection(collectionId: string): void {
    for (const [key, row] of this.map) {
      if (row.collection_id === collectionId) {
        this.map.delete(key);
        this.dirty = true;
      }
    }
  }

  deleteByGame(gameId: string): void {
    for (const [key, row] of this.map) {
      if (row.game_id === gameId) {
        this.map.delete(key);
        this.dirty = true;
      }
    }
  }
}
