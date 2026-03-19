import type { FileIO, CollectionStore as ICollectionStore } from './types.js';

/**
 * Revives Date objects from ISO strings during JSON.parse.
 * Any string that looks like an ISO-8601 datetime is converted to Date.
 */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

/** Extract the key field value from an item using a runtime field name. */
function getKey(item: object, keyField: string): string {
  return (item as Record<string, unknown>)[keyField] as string;
}

/**
 * Generic in-memory store backed by a single JSON file.
 * Persists via atomic write-then-rename strategy.
 */
export class CollectionStore<T extends object> implements ICollectionStore<T> {
  private map: Map<string, T> = new Map();
  /** Whether the in-memory state differs from the persisted file. */
  dirty = false;
  private loaded = false;

  constructor(
    private readonly filePath: string,
    private readonly io: FileIO,
    private readonly keyField = 'id'
  ) {}

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  async load(): Promise<void> {
    if (this.loaded) return; // idempotent
    this.loaded = true;

    const raw = await this.io.readText(this.filePath);
    if (!raw) return;

    try {
      const parsed: T[] = JSON.parse(raw, dateReviver) as T[];
      this.map.clear();
      for (const item of parsed) {
        const key = getKey(item, this.keyField);
        this.map.set(key, item);
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

  all(): T[] {
    return Array.from(this.map.values());
  }

  findById(id: string): T | undefined {
    return this.map.get(id);
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.all().filter(predicate);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.all().find(predicate);
  }

  count(predicate?: (item: T) => boolean): number {
    if (!predicate) return this.map.size;
    let n = 0;
    for (const item of this.map.values()) {
      if (predicate(item)) n++;
    }
    return n;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  insert(item: T): void {
    const key = getKey(item, this.keyField);
    if (this.map.has(key)) {
      throw new Error(`CollectionStore: duplicate key "${key}" (keyField="${this.keyField}")`);
    }
    this.map.set(key, item);
    this.dirty = true;
  }

  upsert(item: T): void {
    const key = getKey(item, this.keyField);
    this.map.set(key, item);
    this.dirty = true;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.map.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch } as T;
    this.map.set(id, updated);
    this.dirty = true;
    return updated;
  }

  delete(id: string): boolean {
    const existed = this.map.has(id);
    if (existed) {
      this.map.delete(id);
      this.dirty = true;
    }
    return existed;
  }
}
