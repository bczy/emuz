# EmuZ Desktop App

> Electron 33 application: two-process architecture (main + renderer) connected by a typed IPC bridge, providing the EmuZ emulator frontend on Windows, macOS, and Linux.

## Boundaries

### Owns
- Electron **main process**: window creation, IPC handler registration, database initialization, app lifecycle
- Electron **renderer process**: React 19 UI, TailwindCSS 4 styling, client-side routing
- Preload script: exposes a safe, typed IPC bridge to the renderer via `contextBridge`
- Vite build configuration for the renderer
- Platform-specific window chrome settings (macOS `hiddenInset` title bar, etc.)

### Delegates
- Business logic (game management, scanning, launch) → `@emuz/core` services (invoked from the main process via IPC handlers)
- Database access → `@emuz/database` desktop adapter (main process only)
- File system and process operations → `@emuz/platform` desktop adapters (main process only)
- UI components and design tokens → `@emuz/ui`
- Emulator definitions → `@emuz/emulators`
- Translations → `@emuz/i18n`

## Integration Map

### Internal dependencies
| Package | Used by | For |
|---------|---------|-----|
| `@emuz/core` | main process | Services (`LibraryService`, `ScannerService`, `LaunchService`) |
| `@emuz/database` | main process | `createDesktopAdapter` — SQLite via `better-sqlite3` |
| `@emuz/platform` | main process | `createDesktopFSAdapter`, `createDesktopLauncherAdapter` |
| `@emuz/ui` | renderer process | All visual components |
| `@emuz/emulators` | renderer + main | Emulator definitions and registry |
| `@emuz/i18n` | renderer process | `I18nProvider`, `useTranslation` |

### Depended by

_Top-level application — nothing depends on `apps/desktop`._

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `electron` | `^33.x` | Desktop runtime (Chromium + Node.js) |
| `vite` | `^5.x` | Renderer build tool and dev server |
| `react` | `^19.x` | UI framework (renderer process) |
| `react-router-dom` | `^6.x` | Client-side routing in the renderer |
| `tailwindcss` | `^4.x` | Utility-first CSS (renderer only) |

## Usage

### Command line

```bash
# Start the dev server (hot reload for renderer + auto-restart for main)
pnpm nx serve desktop

# Build for production
pnpm nx build desktop

# Run tests
pnpm nx test desktop

# Lint
pnpm nx lint desktop

# Package the app (creates distributable in dist/)
pnpm nx package desktop
```

### IPC Architecture

Communication between renderer and main process uses three typed IPC channels:

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `database` | renderer → main | All read/write operations (games, platforms, collections) |
| `fs` | renderer → main | Directory browsing, file stat |
| `launcher` | renderer → main | Launch a game, detect installed emulators |

```typescript
// In renderer: call main process via preload bridge
const games = await window.api.database.getAllGames({ page: 1, limit: 50 });
const result = await window.api.launcher.launchGame(game, emulatorId);
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Import `better-sqlite3` in the **renderer** process | SQLite only runs in the main process; use the `database` IPC channel |
| Import `fs` or `child_process` in the renderer | File/process access must go through the `fs` / `launcher` IPC channels |
| Disable `contextIsolation` or enable `nodeIntegration` | Security-critical settings — these must remain `false`/`true` as configured |
| Call `@emuz/core` services directly from the renderer | Services run in the main process; renderer communicates via IPC |
| Put business logic in IPC handlers | Handlers should be thin wrappers that delegate to `@emuz/core` services |

## Constraints

- `contextIsolation: true` and `nodeIntegration: false` are mandatory — never change these
- Node.js APIs (`fs`, `child_process`, `better-sqlite3`) must never be used in the renderer process
- All renderer-to-main communication must go through the typed preload bridge
- The renderer must not directly import `@emuz/database` or `@emuz/platform`
- Window minimum size: 1024×700 (enforced in `BrowserWindow` config)

## Project Structure

```
apps/desktop/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Entry point: window creation, app lifecycle
│   │   └── ipc/        # IPC handlers (database, fs, launcher channels)
│   ├── preload/        # contextBridge — exposes typed window.api to renderer
│   └── renderer/       # React app (Vite entry)
│       ├── App.tsx
│       ├── routes/     # react-router-dom route components
│       └── components/ # Desktop-specific components (wraps @emuz/ui)
├── vite.config.ts
└── electron.vite.config.ts
```

## See Also

- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
- Contributing guide: [docs/contributing.md](../../docs/contributing.md)
