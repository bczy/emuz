# @emuz/platform

> Platform abstraction layer: unified filesystem and launcher adapters that hide the differences between Electron (Node.js), iOS, and Android.

## Boundaries

### Owns
- `FileSystemAdapter` interface — unified file I/O API (read, write, stat, mkdir, copy, move)
- `LauncherAdapter` interface — unified game launch API (execute command, detect emulators)
- Desktop filesystem adapter backed by Node.js `fs`
- Mobile filesystem adapter backed by React Native filesystem APIs
- Desktop launcher adapter (spawns child processes)
- Mobile launcher adapter (Android intents, iOS URL schemes)

### Delegates
- Business decisions about which file to read or which emulator to launch → `@emuz/core` services
- Emulator definitions and command templates → `@emuz/emulators`
- Path resolution for the database file → consumed by `@emuz/database`
- No UI, no stores, no React — pure I/O layer

## Integration Map

### Internal dependencies

_None. This is a leaf library with no `@emuz/*` imports._

### Depended by
- `@emuz/core` — `ScannerService` uses FileSystemAdapter; `LaunchService` uses LauncherAdapter

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `react-native-fs` | `^2.x` | Filesystem access on iOS and Android |
| `electron` | `^33.x` | Node.js `fs` and `child_process` available via main process context |

## Usage

### Command line

```bash
# Build
pnpm nx build platform

# Test
pnpm nx test platform

# Test with coverage
pnpm nx test platform --coverage

# Lint
pnpm nx lint platform
```

### Code

```typescript
// Desktop (Electron main process)
import { createDesktopFSAdapter, createDesktopLauncherAdapter } from '@emuz/platform';

const fs = createDesktopFSAdapter();
const launcher = createDesktopLauncherAdapter();

// Mobile (React Native)
import { createMobileFSAdapter, createMobileLauncherAdapter } from '@emuz/platform';

const fs = createMobileFSAdapter();
const launcher = createMobileLauncherAdapter();

// Generic usage via interface (same API for both)
const entries = await fs.readDir('/path/to/roms');
const result = await launcher.launch('/usr/bin/retroarch -L core.so {rom}');
```

## Public API

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

interface LauncherAdapter {
  launch(command: string, options?: LaunchOptions): Promise<LaunchResult>;
  isAvailable(path: string): boolean;
  detectEmulators(): Promise<DetectedEmulator[]>;
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

interface LaunchResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| `import fs from 'fs'` anywhere outside this lib | Use `FileSystemAdapter` from `@emuz/platform` |
| `import { exec } from 'child_process'` outside this lib | Use `LauncherAdapter.launch()` |
| Use `require('fs')` in the Electron renderer | All Node.js APIs must be invoked from the main process via IPC |
| Hardcode paths like `/home/user/roms` | Use `getDocumentsPath()` / `getCachePath()` from the adapter |
| Synchronous file operations on the main thread | All adapter methods are async — never block the event loop |

## Constraints

- All filesystem operations must be async — no `fs.readFileSync` or equivalent
- Path validation is mandatory before any operation (prevent directory traversal): reject paths containing `..`
- Adapters must never modify or copy ROM files; read-only access is the maximum needed for scanning
- The Node.js `fs` module and `child_process` are forbidden outside of this library

## See Also

- Full API reference: [docs/api.md](../../docs/api.md#emuzplatform)
- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
