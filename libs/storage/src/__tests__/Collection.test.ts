import { describe, it, expect, beforeEach } from 'vitest';
import { CollectionStore } from '../Collection.js';
import type { FileIO } from '../types.js';

// ---------------------------------------------------------------------------
// In-memory FileIO mock — zero disk I/O
// ---------------------------------------------------------------------------
function createMemoryIO(): FileIO & { files: Map<string, string> } {
  const files = new Map<string, string>();
  return {
    files,
    async readText(p: string) {
      return files.get(p) ?? '';
    },
    async writeText(p: string, c: string) {
      files.set(p, c);
    },
    async rename(from: string, to: string) {
      const c = files.get(from);
      if (c !== undefined) {
        files.set(to, c);
        files.delete(from);
      }
    },
    async exists(p: string) {
      return files.has(p);
    },
    async mkdir(p: string) {
      files.set(p, '');
    },
    joinPath: (...parts: string[]) => parts.join('/'),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface Item {
  id: string;
  name: string;
  count: number;
  createdAt: Date;
}

const FILE_PATH = 'data/items.json';

function makeStore(io: FileIO): CollectionStore<Item> {
  return new CollectionStore<Item>(FILE_PATH, io);
}

function makeItem(id: string, overrides: Partial<Item> = {}): Item {
  return {
    id,
    name: `Item ${id}`,
    count: 0,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CollectionStore', () => {
  let io: ReturnType<typeof createMemoryIO>;
  let store: CollectionStore<Item>;

  beforeEach(async () => {
    io = createMemoryIO();
    store = makeStore(io);
    await store.load();
  });

  // 1. all() returns empty array when file doesn't exist
  it('all() returns empty array when file does not exist', () => {
    expect(store.all()).toEqual([]);
  });

  // 2. insert() adds item; findById() returns it
  it('insert() adds item and findById() returns it', () => {
    const item = makeItem('a');
    store.insert(item);
    const found = store.findById('a');
    expect(found).toEqual(item);
  });

  // 3. insert() throws on duplicate key
  it('insert() throws on duplicate key', () => {
    store.insert(makeItem('dup'));
    expect(() => store.insert(makeItem('dup'))).toThrow();
  });

  // 4. upsert() replaces existing item
  it('upsert() replaces existing item', () => {
    store.insert(makeItem('x', { name: 'Original' }));
    store.upsert(makeItem('x', { name: 'Updated' }));
    expect(store.findById('x')?.name).toBe('Updated');
    expect(store.count()).toBe(1);
  });

  // 5. update() applies partial patch, returns updated item
  it('update() applies partial patch and returns updated item', () => {
    store.insert(makeItem('p', { count: 5 }));
    const updated = store.update('p', { count: 10 });
    expect(updated?.count).toBe(10);
    expect(updated?.name).toBe('Item p');
    expect(store.findById('p')?.count).toBe(10);
  });

  // 6. update() returns undefined for unknown id
  it('update() returns undefined for unknown id', () => {
    const result = store.update('nonexistent', { count: 1 });
    expect(result).toBeUndefined();
  });

  // 7. delete() removes item, returns true; returns false if not found
  it('delete() removes item and returns true; returns false if not found', () => {
    store.insert(makeItem('del'));
    expect(store.delete('del')).toBe(true);
    expect(store.findById('del')).toBeUndefined();
    expect(store.delete('del')).toBe(false);
  });

  // 8. count() with no predicate returns total count
  it('count() with no predicate returns total count', () => {
    store.insert(makeItem('1'));
    store.insert(makeItem('2'));
    store.insert(makeItem('3'));
    expect(store.count()).toBe(3);
  });

  // 9. count() with predicate filters correctly
  it('count() with predicate filters correctly', () => {
    store.insert(makeItem('a1', { count: 5 }));
    store.insert(makeItem('a2', { count: 10 }));
    store.insert(makeItem('a3', { count: 3 }));
    expect(store.count((i) => i.count > 4)).toBe(2);
  });

  // 10. find() returns filtered array
  it('find() returns filtered array', () => {
    store.insert(makeItem('b1', { name: 'Alpha' }));
    store.insert(makeItem('b2', { name: 'Beta' }));
    store.insert(makeItem('b3', { name: 'Alpha Two' }));
    const result = store.find((i) => i.name.startsWith('Alpha'));
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id).sort()).toEqual(['b1', 'b3']);
  });

  // 11. findOne() returns first match or undefined
  it('findOne() returns first match or undefined', () => {
    store.insert(makeItem('c1', { count: 7 }));
    store.insert(makeItem('c2', { count: 3 }));
    const found = store.findOne((i) => i.count === 7);
    expect(found?.id).toBe('c1');
    expect(store.findOne((i) => i.count === 99)).toBeUndefined();
  });

  // 12. dirty starts false; becomes true after insert; becomes false after flush
  it('dirty flag: starts false, set on insert, cleared on flush', async () => {
    // Access dirty via the class directly
    const s = store as unknown as { dirty: boolean };
    expect(s.dirty).toBe(false);
    store.insert(makeItem('d1'));
    expect(s.dirty).toBe(true);
    await store.flush();
    expect(s.dirty).toBe(false);
  });

  // 13. flush() writes .tmp file then renames to final path
  it('flush() writes .tmp then renames to final path', async () => {
    store.insert(makeItem('e1'));
    // Before flush — the data file doesn't exist yet
    expect(io.files.has(FILE_PATH)).toBe(false);
    await store.flush();
    // After flush — final file exists, tmp file is gone
    expect(io.files.has(FILE_PATH)).toBe(true);
    expect(io.files.has(`${FILE_PATH}.tmp`)).toBe(false);
  });

  // 14. flush() is no-op when not dirty (file count unchanged)
  it('flush() is a no-op when not dirty', async () => {
    // First flush creates the file
    store.insert(makeItem('f1'));
    await store.flush();
    const sizeBefore = io.files.size;
    // No mutations — flush again
    await store.flush();
    expect(io.files.size).toBe(sizeBefore);
  });

  // 15. Second CollectionStore instance on same path loads data written by first
  it('second instance on same path loads data persisted by first', async () => {
    store.insert(makeItem('g1', { name: 'Persisted' }));
    await store.flush();

    const store2 = new CollectionStore<Item>(FILE_PATH, io);
    await store2.load();
    expect(store2.findById('g1')?.name).toBe('Persisted');
  });

  // 16. Date objects survive JSON round-trip
  it('Date objects survive JSON round-trip', async () => {
    const d = new Date('2024-06-15T12:00:00.000Z');
    store.insert(makeItem('h1', { createdAt: d }));
    await store.flush();

    const store2 = new CollectionStore<Item>(FILE_PATH, io);
    await store2.load();
    const found = store2.findById('h1');
    expect(found?.createdAt).toBeInstanceOf(Date);
    expect(found?.createdAt.toISOString()).toBe(d.toISOString());
  });

  // 17. keyField = 'key' works for SettingsRow-style records
  it("keyField = 'key' works for settings-style records", async () => {
    interface Setting {
      key: string;
      value: string;
      updated_at: Date;
    }
    const settingsIo = createMemoryIO();
    const settings = new CollectionStore<Setting>('settings.json', settingsIo, 'key');
    await settings.load();

    settings.insert({ key: 'theme', value: 'dark', updated_at: new Date() });
    settings.insert({ key: 'lang', value: 'en', updated_at: new Date() });

    expect(settings.findById('theme')?.value).toBe('dark');
    expect(settings.count()).toBe(2);

    await settings.flush();
    const settings2 = new CollectionStore<Setting>('settings.json', settingsIo, 'key');
    await settings2.load();
    expect(settings2.findById('lang')?.value).toBe('en');
  });

  // 18. load() is idempotent (calling twice doesn't duplicate data)
  it('load() is idempotent — calling twice does not duplicate data', async () => {
    store.insert(makeItem('i1'));
    await store.flush();

    const store2 = new CollectionStore<Item>(FILE_PATH, io);
    await store2.load();
    await store2.load(); // second call
    expect(store2.count()).toBe(1);
  });
});
