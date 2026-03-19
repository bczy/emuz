# EmuZ — Project Overview

**EmuZ** is a Daijishou-inspired, cross-platform emulator frontend for iOS, Android, macOS, Linux, and Windows — built from a single Nx monorepo. It is a **library manager and launcher**, not an emulator itself: it scans ROM files, enriches them with metadata, and hands them off to installed emulators.

## Quick Reference

| Attribute             | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Type**              | Monorepo (Nx 20.x + pnpm 9.x)                                      |
| **Primary Language**  | TypeScript 5.7 (strict mode)                                       |
| **Platforms**         | iOS, Android, macOS, Linux, Windows                                |
| **Desktop Framework** | Electron 33.x + Vite + React 18.x                                  |
| **Mobile Framework**  | React Native 0.81.5 + Expo 54 (bare workflow)                      |
| **State Management**  | Zustand 5.x + React Query 5.x                                      |
| **Database**          | SQLite (better-sqlite3 desktop / op-sqlite mobile) via Drizzle ORM |
| **Styling**           | TailwindCSS 4.x (desktop) / NativeWind 4.x (mobile)                |
| **Color Palette**     | Emerald green `#10B981` on slate dark `#0F172A`                    |
| **i18n**              | EN (complete), FR/ES/DE/JA/ZH (common namespace only)              |
| **Version**           | 0.0.1 (pre-release)                                                |

## Repository Structure

```
emuz/
├── apps/
│   ├── desktop/     # Electron app — main + renderer + preload processes
│   └── mobile/      # React Native app — bare Expo workflow
├── libs/
│   ├── core/        # @emuz/core     — Zod models, Drizzle services, Zustand stores, hooks
│   ├── database/    # @emuz/database — Drizzle schema, migrations, platform adapters
│   ├── emulators/   # @emuz/emulators — registry (22 emulators), detector classes
│   ├── i18n/        # @emuz/i18n     — react-i18next config, 6 locales, 4 namespaces
│   ├── platform/    # @emuz/platform — cross-platform FS adapters + launcher abstraction
│   └── ui/          # @emuz/ui       — 18 shared React/RN components, dark/light themes
├── docs/            # Generated + curated documentation
├── _bmad-output/    # Planning artifacts (PRD, architecture ADRs) + 41 story files
└── android/         # React Native Android project root
```

## Architecture Type

**Nx Monorepo — Multi-Part** with a shared-library layer:

```
apps/desktop ──────┐
                   ├── @emuz/ui ──────── @emuz/core ─── @emuz/database
apps/mobile  ──────┘                                 └── @emuz/platform
             also directly imports: @emuz/emulators, @emuz/i18n
```

All business logic lives in `libs/`. Apps are thin consumers.

## Technology Stack Detail

| Layer            | Desktop                              | Mobile                              | Shared Libs      |
| ---------------- | ------------------------------------ | ----------------------------------- | ---------------- |
| **Framework**    | Electron 33.x                        | React Native 0.81.5 + Expo 54       | —                |
| **UI**           | React 18.3.1 + React Router 7        | React Navigation 7.x (stack + tabs) | @emuz/ui         |
| **Styling**      | TailwindCSS 4.x + CSS vars           | NativeWind 4.x                      | Design tokens    |
| **State**        | Zustand 5.x (stores in @emuz/core)   | Zustand 5.x                         | @emuz/core       |
| **Server State** | React Query 5.x                      | React Query 5.x                     | @emuz/core hooks |
| **Database**     | better-sqlite3 + Drizzle ORM         | op-sqlite + Drizzle ORM             | @emuz/database   |
| **Filesystem**   | Node.js fs/promises                  | react-native-fs                     | @emuz/platform   |
| **Emulators**    | child_process.spawn                  | Linking URL schemes / Intents       | @emuz/emulators  |
| **Build**        | electron-vite 2.x + electron-builder | Metro + Expo CLI                    | Nx + Vite        |

## Key Design Decisions

| ADR     | Decision                                        | Rationale                                                               |
| ------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| ADR-001 | Nx 20.x + pnpm 9.x monorepo                     | Team experience, official RN support, local cache                       |
| ADR-013 | Drizzle ORM replaces legacy DatabaseAdapter     | Type-safe schema, multi-platform SQLite, migration tooling              |
| ADR-014 | `romType: 'game' \| 'homebrew'` on `Game` model | User-requested ROM classification — additive column (not yet in schema) |

## Performance Targets

| Metric                    | Target      |
| ------------------------- | ----------- |
| App launch                | < 2 seconds |
| Library scan (1000+ ROMs) | < 5 seconds |
| Search response           | < 100ms     |
| Memory (large library)    | < 500MB     |

## What EmuZ Does NOT Do

- Bundle or download emulators / ROMs
- Sync cloud saves or RetroAchievements
- Provide network/online multiplayer
- Modify or distribute ROM files

## Known Gaps (as of exhaustive scan 2026-03-19)

| Area               | Gap                                                                     |
| ------------------ | ----------------------------------------------------------------------- |
| `romType` schema   | ADR-014 approved but column not yet in database schema                  |
| i18n               | FR/ES/DE/JA/ZH missing 570 keys (games, settings, platforms namespaces) |
| Android package ID | Still `com.anonymous.emuzsource` — must change before release           |
| `LaunchService`    | Last service using legacy `DatabaseAdapter` instead of Drizzle          |
| Desktop tests      | Vitest configured but no test files implemented in apps/desktop         |
| Platform tests     | Filesystem/launcher tests are structural-only (no real I/O)             |

## Documentation Map

| Document                                                     | Purpose                                  |
| ------------------------------------------------------------ | ---------------------------------------- |
| [index.md](./index.md)                                       | Master index — start here                |
| [source-tree-analysis.md](./source-tree-analysis.md)         | Annotated directory tree for all parts   |
| [data-models.md](./data-models.md)                           | Database schema — all 9 tables           |
| [component-inventory.md](./component-inventory.md)           | All 18 @emuz/ui components               |
| [integration-architecture.md](./integration-architecture.md) | IPC bridge, lib dependencies, data flow  |
| [development-guide.md](./development-guide.md)               | Local setup, commands, workflow          |
| [deployment-guide.md](./deployment-guide.md)                 | Build pipelines, release process         |
| [architecture.md](./architecture.md)                         | System design (existing, curated)        |
| [api.md](./api.md)                                           | Public API reference (existing, curated) |
| [contributing.md](./contributing.md)                         | Contributor guide (existing, curated)    |
| [emulator-integration.md](./emulator-integration.md)         | Emulator registry + launch (existing)    |
