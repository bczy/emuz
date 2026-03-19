# EmuZ — Development Guide

Generated: 2026-03-19 | Source: exhaustive scan of root configs, CI/CD, CLAUDE.md

---

## Prerequisites

| Tool               | Version                         | Notes                                                        |
| ------------------ | ------------------------------- | ------------------------------------------------------------ |
| **Node.js**        | ≥ 20.0.0 (22.x LTS recommended) | Required                                                     |
| **pnpm**           | 9.15.2 (pinned)                 | `corepack enable && corepack prepare pnpm@9.15.2 --activate` |
| **Git**            | Latest stable                   | Required                                                     |
| **Xcode**          | 15+                             | iOS only, macOS only                                         |
| **Android Studio** | Latest                          | Android development                                          |
| **CocoaPods**      | Latest                          | iOS native deps (`gem install cocoapods`)                    |

---

## First-Time Setup

```bash
git clone https://github.com/<your-fork>/emuz.git
cd emuz
pnpm install          # installs all workspace deps + sets up Husky hooks
pnpm build            # build all libs (generates TypeScript declarations)
pnpm test             # verify all tests pass
pnpm lint             # verify no lint errors
```

**Verify setup:**

```bash
pnpm nx graph         # opens dependency graph in browser
pnpm nx test core     # run just core lib tests
```

---

## Running Apps

### Desktop (Electron)

```bash
# Hot-reload dev server (main process reloads on save, renderer has HMR)
pnpm nx serve desktop

# Production build
pnpm nx build desktop

# Package for distribution
pnpm nx package desktop          # all platforms
pnpm nx package:mac desktop      # macOS only
pnpm nx package:win desktop      # Windows only
pnpm nx package:linux desktop    # Linux only
```

**Dev database path:** `~/.config/EmuZ/emuz.db`

### Mobile (React Native)

```bash
# Start Metro bundler
pnpm nx start mobile

# In a separate terminal:
pnpm nx run-ios mobile       # iOS — requires macOS + Xcode + CocoaPods
pnpm nx run-android mobile   # Android — requires Android Studio + emulator/device

# Convenience shortcuts
pnpm ios
pnpm android
```

**First iOS setup:**

```bash
cd apps/mobile/ios
pod install
cd ../..
pnpm nx run-ios mobile
```

**First Android setup:** Open Android Studio → AVD Manager → create Pixel_7_API_34 → start emulator → run `pnpm android`

---

## Testing

### Run tests

```bash
pnpm test                           # all tests, no coverage (fast, uses Nx cache)
pnpm test:coverage                  # with lcov reports → coverage/{projectRoot}/
pnpm test:watch                     # watch mode across all projects
pnpm nx test core                   # single project
pnpm nx test core --coverage        # single project with coverage
pnpm nx test core --watch           # watch mode for one project
pnpm affected:test                  # only changed packages
```

### Coverage location

```
coverage/
├── libs/core/lcov.info
├── libs/database/lcov.info
├── libs/ui/lcov.info
└── ...
```

**Target coverage:** ≥ 80% for core services (enforced in CI via Codecov)

### TDD workflow (NON-NEGOTIABLE)

Per CLAUDE.md, the development cycle is:

1. Write tests → get approval
2. Tests fail (red)
3. Implement until tests pass (green)
4. Refactor

All public APIs in `libs/` must have tests before implementation.

### Test patterns

```typescript
// Service tests (in-memory SQLite)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzleSchema, createDrizzleDesktopDb } from '@emuz/database';
import { LibraryService } from '@emuz/core';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema: drizzleSchema });
const service = new LibraryService(db);

// Store tests (direct .getState() access)
import { useLibraryStore } from '@emuz/core';
const { games, setGames } = useLibraryStore.getState();

// Hook tests (mocked service)
const mockService: ILibraryService = { getAllGames: vi.fn().mockResolvedValue([]) };
```

---

## Linting & Formatting

```bash
pnpm lint              # lint all (--max-warnings=0 strict mode)
pnpm fix               # lint --fix + prettier --write (auto-correct)
pnpm format            # prettier --write (format only)
pnpm format:check      # prettier --check (CI-safe, no write)
pnpm affected:lint     # lint only changed packages
```

### Lint rules

- **Module boundaries**: `@nx/enforce-module-boundaries` — apps cannot import from sibling apps; libs cannot import from apps
- **Unused vars**: `@typescript-eslint/no-unused-vars` (warn) — variables/args prefixed with `_` are allowed
- **No `eslint-disable`**: Do not add `// eslint-disable` comments without a genuine unavoidable reason
- **Max warnings = 0**: CI fails if any warning exists

### Formatting rules (.prettierrc.json)

- singleQuote: true
- semi: true
- printWidth: 100 (80 for JSON)
- trailingComma: es5
- tabWidth: 2, useTabs: false
- endOfLine: lf

---

## Pre-Commit Hooks

Configured via Husky + lint-staged. Runs automatically on `git commit`:

```bash
# Phase 1: lint-staged (staged files only)
eslint --fix --max-warnings 0   # on *.{js,jsx,ts,tsx,mts,cts}
prettier --write                 # on *.{js,jsx,ts,tsx,mts,cts}
prettier --write                 # on *.{json,md,yml,yaml}

# Phase 2: full test suite
pnpm test
```

Both phases must pass. **Do not use `--no-verify`** to bypass.

---

## Nx Cache

All `build`, `test`, and `lint` targets are cached:

```bash
pnpm nx reset          # clear local Nx cache if stale
```

**Cache invalidation triggers:**

- Any change to `package.json` or `pnpm-lock.yaml` (shared globals) busts ALL caches
- Dependency chain: changing `@emuz/core` invalidates cache for `@emuz/ui`, `apps/desktop`, `apps/mobile`

**Affected commands** (only process changed packages + dependents):

```bash
pnpm affected:build
pnpm affected:test
pnpm affected:lint
pnpm affected         # show what's affected
```

---

## Code Conventions

### TypeScript

- Strict mode everywhere (`"strict": true` in tsconfig)
- Prefer `interface` over `type` for object shapes
- Explicit return types on public functions
- Use Zod for validation in `libs/core/src/models/`

### Adding a feature — Layer Order

1. **Model** → `libs/core/src/models/` — Zod schema + inferred type
2. **Migration** → `libs/database/src/migrations/` — versioned up/down (also run `pnpm drizzle-kit generate`)
3. **Service** → `libs/core/src/services/` — interface + class
4. **UI Component** → `libs/ui/src/components/MyComponent/` — `.tsx` + `index.ts` + test
5. **i18n** → `libs/i18n/src/locales/en/` first, then other locales

### File structure for new service

```typescript
// libs/core/src/services/MyService.ts

export interface IMyService {
  doSomething(id: string): Promise<Result>;
}

export class MyService implements IMyService {
  constructor(private db: DrizzleDb) {}

  async doSomething(id: string): Promise<Result> {
    // use drizzle ORM — not raw SQL
    return this.db.select().from(myTable).where(eq(myTable.id, id)).get();
  }
}

export function createMyService(db: DrizzleDb): IMyService {
  return new MyService(db);
}
```

### React components

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}
export function Button({ label, onClick }: ButtonProps): JSX.Element { ... }

// ❌ Avoid
export default function({ label, onClick }) { ... }  // no typing, no named export
```

### No platform-specific code in libs/

```typescript
// ❌ In libs/ — uses Node.js directly
import { readFileSync } from 'fs';

// ✅ In libs/ — use platform adapter
import { createFileSystemAdapter } from '@emuz/platform';
const fs = createFileSystemAdapter();
const content = await fs.readText(path);
```

---

## Commit Messages (Conventional Commits)

Multi-line format with a body — **80 chars max per line**:

```
feat(ui): add game card context menu

Adds right-click context menu to GameCard with quick actions:
- Toggle favorite
- Add to collection
- Remove from library
- Show in folder

Closes #123
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes:** `ui`, `core`, `database`, `platform`, `emulators`, `i18n`, `desktop`, `mobile`

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# After implementation (pre-commit hooks run automatically)
git add libs/core/src/services/MyService.ts
git add libs/core/src/__tests__/MyService.test.ts
git commit -m "feat(core): add MyService with CRUD operations

Implements MyService following the Drizzle ORM pattern.
Tests cover happy path and error cases.
"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --fill
```

**Branch naming:**

- `feature/description`
- `fix/description`
- `docs/description`
- `refactor/description`

---

## Environment Variables

No `.env` files required for local development. Desktop uses Electron system paths; mobile uses React Native platform APIs.

For CI, secrets are in GitHub:

- `CODECOV_TOKEN` — coverage upload
- `CSC_LINK`, `CSC_KEY_PASSWORD` — Windows/macOS code signing
- `APPLE_ID`, `APPLE_ID_PASSWORD` — macOS notarization

---

## Troubleshooting

| Problem                               | Fix                                                        |
| ------------------------------------- | ---------------------------------------------------------- |
| TypeScript can't find `@emuz/*`       | Run `pnpm build` to generate type declarations             |
| Nx cache stale                        | Run `pnpm nx reset`                                        |
| iOS build fails                       | `cd apps/mobile/ios && pod install`                        |
| Android build fails                   | Check `ANDROID_HOME` env, ensure emulator/device connected |
| `better-sqlite3` native binding error | Run `pnpm nx rebuild desktop`                              |
| pre-commit hook fails                 | Fix lint errors; DO NOT use `--no-verify`                  |
| Tests fail after adding new lib       | Run `pnpm build` so TypeScript declarations are generated  |
