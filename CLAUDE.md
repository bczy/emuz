# EmuZ — Claude Code Instructions

Daijishou-inspired cross-platform emulator frontend (iOS, Android, macOS, Linux, Windows).

## Tech Stack

| Layer    | Technology                                                           |
| -------- | -------------------------------------------------------------------- |
| Monorepo | Nx 20.x + pnpm 9.x                                                   |
| Desktop  | Electron 33.x + Vite + React 19.x + TailwindCSS 4.x                  |
| Mobile   | React Native 0.76+ + NativeWind 4.x + React Navigation               |
| State    | Zustand 5.x + React Query 5.x                                        |
| Database | SQLite (better-sqlite3 desktop / react-native-sqlite-storage mobile) |
| i18n     | react-i18next (EN, ES, FR, DE, JA, ZH)                               |
| Testing  | Vitest                                                               |

## Project Structure

```
emuz/
├── apps/
│   ├── desktop/     # Electron app (main + renderer processes)
│   └── mobile/      # React Native app (bare workflow)
├── libs/
│   ├── core/        # @emuz/core — services, models (Zod), Zustand stores
│   ├── database/    # @emuz/database — schema, migrations, adapters
│   ├── emulators/   # @emuz/emulators — registry, detector, launchers
│   ├── i18n/        # @emuz/i18n — locale files, config
│   ├── platform/    # @emuz/platform — filesystem, platform-specific adapters
│   └── ui/          # @emuz/ui — shared React/RN components, themes
├── docs/            # Architecture, API, contributing guides
└── .specify/        # Spec-Kit artifacts (specs, tasks, constitution)
```

## Key Commands

```bash
pnpm install                         # Install dependencies
pnpm build                           # Build all packages
pnpm test                            # Run all tests
pnpm lint                            # Lint all packages
pnpm fix                             # Fix lint + format
pnpm format                          # Prettier format
pnpm affected:test                   # Test only changed files

pnpm nx serve desktop                # Desktop dev server
pnpm nx start mobile                 # Mobile Metro bundler
pnpm nx run-ios mobile               # Run on iOS
pnpm nx run-android mobile           # Run on Android
pnpm nx test core --coverage         # Test with coverage
pnpm nx test core --watch            # Test in watch mode
```

## Development Rules (NON-NEGOTIABLE)

### TDD — Test-First Development

**Always write tests before implementing.** The cycle is:

1. Write tests → get user approval
2. Tests fail (red)
3. Implement until tests pass (green)
4. Refactor

Minimum 80% test coverage for core services. All public APIs must have tests.

### Cross-Platform First

- No platform-specific code in shared `libs/`
- All file system access must go through `@emuz/platform` adapters
- No hardcoded paths or synchronous file ops on the main thread

### Security

- Validate all file paths (prevent directory traversal)
- No user data collection; all data stored locally
- Never modify or distribute ROM files

## Code Conventions

### TypeScript

- Strict mode everywhere
- Prefer `interface` over `type` for object shapes
- Explicit return types on public functions
- Use Zod for model validation in `libs/core/src/models`

### React / React Native

- Functional components + hooks only
- Extract business logic into custom hooks
- Keep components focused; one responsibility per component

### Styling

- Desktop: TailwindCSS 4.x utility classes
- Mobile: NativeWind 4.x (same Tailwind API)
- Color palette: emerald green (`#10b981`) on slate dark (`#0f172a`)

### Adding Features — Layer Order

1. **Model** in `libs/core/src/models` — Zod schema + inferred type
2. **Migration** in `libs/database/src/migrations` — versioned up/down
3. **Service** in `libs/core/src/services` — interface + class implementing it
4. **UI Component** in `libs/ui/src/components/MyComponent/` — `.tsx`, `index.ts`
5. **i18n** — add keys to `libs/i18n/src/locales/en/` first, then other locales

### Commits — Conventional Commits

```
feat(ui): add game card context menu
fix(scanner): handle symbolic links correctly
test(core): add LibraryService unit tests
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## MCP Servers

Two MCP servers are pre-configured for this project:

### Context7 — Up-to-date Library Docs

Add `use context7` to any prompt to fetch current documentation:

- `use library /react-native/react-native`
- `use library /pmndrs/zustand`
- `use library /marklawlor/nativewind`
- `use library /react-navigation/react-navigation`
- `use library /vitest-dev/vitest`

See `docs/ai-tools.md` for the full library ID list.

### Nx MCP — Workspace Management

Tools: `nx_workspace`, `nx_project_details`, `nx_generators`, `nx_run_generator`, `nx_visualize_graph`, `nx_docs`

## Key Architecture Decisions

- Desktop uses IPC bridge between Electron main and renderer processes
- Platform adapters in `@emuz/platform` abstract filesystem differences
- Database adapters pattern: same interface for better-sqlite3 and react-native-sqlite-storage
- Zustand stores live in `@emuz/core`; components consume via hooks
- Navigation: React Navigation (mobile) / Electron router (desktop)

## Reference Docs

- Architecture: `docs/architecture.md`
- API reference: `docs/api.md`
- Emulator integration: `docs/emulator-integration.md`
- Project constitution: `.specify/memory/constitution.md`
- Implementation tasks: `.specify/specs/001-emuz-core/tasks.md`
