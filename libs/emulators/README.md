# @emuz/emulators

> Static emulator registry: definitions, auto-detection helpers, and platform-to-emulator mappings for RetroArch, Dolphin, mGBA, DeSmuME, PCSX2, and others.

## Boundaries

### Owns
- `EmulatorDefinition` type and the complete static registry of known emulators
- Search and filter functions over the registry (`getAllEmulators`, `getEmulatorById`, `searchEmulators`, `getEmulatorsByPlatform`, `getEmulatorsByHostPlatform`, `getRecommendedEmulator`)
- Default executable paths per host platform (Windows, macOS, Linux)
- Android package names and iOS URL schemes for mobile launch
- RetroArch core-to-platform mappings

### Delegates
- User-created emulator records (custom paths, user preferences) → `@emuz/core` `LaunchService` + `@emuz/database`
- Actually launching emulators → `@emuz/platform` LauncherAdapter
- Detecting installed emulators on disk → `@emuz/platform` LauncherAdapter
- No UI, no database writes, no file I/O

## Integration Map

### Internal dependencies

_None. This is a leaf library with no `@emuz/*` imports._

### Depended by
- `@emuz/core` — `LaunchService` reads `EmulatorDefinition` to build commands and populate defaults
- `apps/desktop` — reads definitions to render emulator picker UI
- `apps/mobile` — reads `androidPackages` and `iosUrlScheme` for mobile launch

### External dependencies

_None. Pure TypeScript data — no runtime dependencies._

## Usage

### Command line

```bash
# Build
pnpm nx build emulators

# Test
pnpm nx test emulators

# Test with coverage
pnpm nx test emulators --coverage

# Lint
pnpm nx lint emulators
```

### Code

```typescript
import {
  getAllEmulators,
  getEmulatorById,
  searchEmulators,
  getRecommendedEmulator,
} from '@emuz/emulators';

// Get all registered emulator definitions
const all = getAllEmulators();

// Lookup a specific emulator
const retroarch = getEmulatorById('retroarch');

// Find emulators for a given platform + host OS
const gbaOnLinux = searchEmulators({ platformId: 'gba', hostPlatform: 'linux' });

// Get the recommended emulator for a platform on the current host
const best = getRecommendedEmulator('nes', 'windows');
// => EmulatorDefinition | null
```

## Public API

```typescript
interface EmulatorDefinition {
  id: string;
  name: string;
  description?: string;
  website?: string;
  platformIds: string[];              // e.g. ['nes', 'snes', 'gba']
  hostPlatforms: HostPlatform[];      // which OS this emulator runs on
  commandTemplate?: string;           // e.g. 'retroarch -L {core} {rom}'
  defaultPaths?: Record<HostPlatform, string[]>;
  androidPackages?: string[];         // Android intent package names
  iosUrlScheme?: string;              // e.g. 'delta://'
  isRetroarchCore?: boolean;
  corePath?: string;                  // RetroArch core .so/.dll path
}

type HostPlatform = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

// Registry functions
function getAllEmulators(): EmulatorDefinition[];
function getEmulatorById(id: string): EmulatorDefinition | undefined;
function getEmulatorsByPlatform(platformId: string): EmulatorDefinition[];
function getEmulatorsByHostPlatform(hostPlatform: HostPlatform): EmulatorDefinition[];
function searchEmulators(criteria: EmulatorSearchCriteria): EmulatorDefinition[];
function getRecommendedEmulator(platformId: string, hostPlatform: HostPlatform): EmulatorDefinition | null;

interface EmulatorSearchCriteria {
  platformId?: string;
  hostPlatform?: HostPlatform;
  isRetroarchCore?: boolean;
}
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Hardcode emulator paths in `@emuz/core` or app code | Read `defaultPaths` from the `EmulatorDefinition` |
| Store user-configured emulator records in this lib | User emulators live in `@emuz/database` via `LaunchService` |
| Modify, copy, or distribute ROM files | This lib only defines how to *launch* — never touches ROM content |
| Add platform-specific launch code (intent, URL scheme dispatch) here | That logic belongs in `@emuz/platform` LauncherAdapter |

## Constraints

- This library is **read-only data** — no database writes, no file system access, no network calls
- ROM files must never be modified or redistributed — EmuZ is a launcher, not an editor
- Adding a new emulator means adding a new `EmulatorDefinition` entry — nothing else
- No runtime dependencies: the registry is pure TypeScript data structures

## Supported Emulators

| ID | Name | Platforms |
|----|------|-----------|
| `retroarch` | RetroArch | Multi-system (via cores) |
| `dolphin` | Dolphin | GameCube, Wii |
| `mgba` | mGBA | GBA, GBC, GB |
| `desmume` | DeSmuME | Nintendo DS |
| `pcsx2` | PCSX2 | PlayStation 2 |
| `ppsspp` | PPSSPP | PlayStation Portable |
| `delta` | Delta (iOS) | NES, SNES, GBA, N64 |
| `provenance` | Provenance (iOS) | Multi-system |

## See Also

- Full emulator integration guide: [docs/emulator-integration.md](../../docs/emulator-integration.md)
- Full API reference: [docs/api.md](../../docs/api.md#emuzemulators)
