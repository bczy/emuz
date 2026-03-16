# @emuz/database

> SQLite adapter layer: unified database interface for both `better-sqlite3` (desktop) and `react-native-sqlite-storage` (mobile), with versioned schema migrations.

## Boundaries

### Owns
- `DatabaseAdapter` interface — the single contract for all database operations
- Desktop adapter implementation backed by `better-sqlite3`
- Mobile adapter implementation backed by `react-native-sqlite-storage`
- SQLite schema definition (tables, indexes)
- Versioned migration system (up/down)

### Delegates
- Business logic queries (which games belong to a platform, etc.) → `@emuz/core` services
- File paths for the database file → `@emuz/platform` FileSystemAdapter
- No UI, no stores, no React — pure data layer

## Integration Map

### Internal dependencies

_None. This is a leaf library with no `@emuz/*` imports._

### Depended by
- `@emuz/core` — all services consume the DatabaseAdapter

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `better-sqlite3` | `^9.x` | Synchronous SQLite driver for Electron main process |
| `react-native-sqlite-storage` | `^6.x` | Async SQLite driver for iOS and Android |

## Usage

### Command line

```bash
# Build
pnpm nx build database

# Test
pnpm nx test database

# Test with coverage
pnpm nx test database --coverage

# Lint
pnpm nx lint database
```

### Code

```typescript
// Desktop (Electron main process only)
import { createDesktopAdapter } from '@emuz/database';

const db = await createDesktopAdapter({
  path: '/path/to/emuz.db',
  wal: true,
  foreignKeys: true,
});
await db.open();

// Mobile (React Native)
import { createMobileAdapter } from '@emuz/database';

const db = await createMobileAdapter({
  name: 'emuz.db',
  location: 'default',
});
await db.open();

// Generic usage via interface (same API for both)
const games = await db.query<Game>('SELECT * FROM games WHERE platform_id = ?', [platformId]);
```

## Public API

```typescript
interface DatabaseAdapter {
  open(): Promise<void>;
  close(): Promise<void>;
  isConnected(): boolean;
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

// Factory functions
function createDesktopAdapter(options: DesktopAdapterOptions): Promise<DatabaseAdapter>;
function createMobileAdapter(options: MobileAdapterOptions): Promise<DatabaseAdapter>;

interface DesktopAdapterOptions {
  path: string;
  wal?: boolean;       // WAL mode for concurrent reads (recommended: true)
  foreignKeys?: boolean;
}

interface MobileAdapterOptions {
  name: string;
  location?: 'default' | 'Library' | 'Documents';
}
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Import `better-sqlite3` directly in `@emuz/core` or UI | Use `createDesktopAdapter` from `@emuz/database` |
| Call `createDesktopAdapter` from the Electron **renderer** process | Instantiate the adapter in the **main** process only; expose via IPC |
| Run schema migrations inside service methods | Run migrations at adapter initialization time only |
| Write raw SQL in `@emuz/core` services | Pass the `DatabaseAdapter` into services; services call `adapter.query()` |
| Use `db.execute()` for reads | Use `db.query<T>()` for reads — it returns typed results |

## Constraints

- The `DatabaseAdapter` interface is the public contract — never expose driver-specific APIs to consumers
- `better-sqlite3` is synchronous but must only be used in the Electron **main** process (never renderer)
- All schema changes must go through a versioned migration — never alter tables in-place without a migration
- Foreign keys must be enabled (`PRAGMA foreign_keys = ON`) on all connections

## See Also

- Full API reference: [docs/api.md](../../docs/api.md#emuzdatabase)
- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
