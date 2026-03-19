# EmuZ — Documentation Index

Generated: 2026-03-19 | Source: exhaustive scan of entire monorepo

EmuZ is a Daijishou-inspired cross-platform emulator frontend for iOS, Android, macOS, Linux, and Windows. Built as an Nx monorepo with Electron (desktop) and React Native (mobile).

---

## Quick Navigation

| I want to…                             | Go to                                                   |
| -------------------------------------- | ------------------------------------------------------- |
| Understand the project at a high level | [Project Overview](#project-overview)                   |
| Start developing                       | [Development Guide](development-guide.md)               |
| Understand the codebase structure      | [Source Tree Analysis](source-tree-analysis.md)         |
| Work with data / database              | [Data Models](data-models.md)                           |
| Build UI components                    | [Component Inventory](component-inventory.md)           |
| Understand how packages connect        | [Integration Architecture](integration-architecture.md) |
| Package or release the app             | [Deployment Guide](deployment-guide.md)                 |
| Contribute to the project              | [Contributing Guide](contributing.md)                   |
| Use AI tools (Context7, Nx MCP)        | [AI Tools](ai-tools.md)                                 |
| Work with the BMAD agent system        | [BMAD Guide](bmad-guide.md)                             |
| Integrate emulators                    | [Emulator Integration](emulator-integration.md)         |
| Use the public API                     | [API Reference](api.md)                                 |
| Understand architecture decisions      | [Architecture](architecture.md)                         |

---

## Project Overview

**Stack at a glance:**

| Layer    | Technology                                                 |
| -------- | ---------------------------------------------------------- |
| Monorepo | Nx 20.x + pnpm 9.x                                         |
| Desktop  | Electron 33.x + Vite + React 19.x + TailwindCSS 4.x        |
| Mobile   | React Native 0.76+ + NativeWind 4.x + React Navigation 7.x |
| State    | Zustand 5.x + React Query 5.x                              |
| Database | SQLite via Drizzle ORM (better-sqlite3 / op-sqlite)        |
| i18n     | react-i18next (EN, ES, FR, DE, JA, ZH)                     |
| Testing  | Vitest (≥ 80% coverage enforced)                           |

**Packages:** 6 shared libs + 2 apps

```
@emuz/database  →  @emuz/core  →  @emuz/ui  →  apps/desktop
@emuz/platform  ↗                            →  apps/mobile
@emuz/emulators  (leaf — no @emuz/* deps)
@emuz/i18n       (leaf — no @emuz/* deps)
```

See [project-overview.md](project-overview.md) for the full architecture summary including ADRs and known gaps.

---

## Generated Documentation (this session)

These files were produced by exhaustive monorepo scan on 2026-03-19:

| Document                                                   | Description                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| [project-overview.md](project-overview.md)                 | High-level project summary, ADR highlights, known gaps       |
| [source-tree-analysis.md](source-tree-analysis.md)         | Annotated directory tree — every file with purpose           |
| [data-models.md](data-models.md)                           | Drizzle ORM schema (9 tables) + Zod domain models            |
| [component-inventory.md](component-inventory.md)           | All 18 @emuz/ui components with prop interfaces              |
| [integration-architecture.md](integration-architecture.md) | IPC channels, package graph, data flows, security boundaries |
| [development-guide.md](development-guide.md)               | Setup, TDD workflow, lint, conventions, commit format        |
| [deployment-guide.md](deployment-guide.md)                 | Build/release, CI/CD, code signing, version management       |

---

## Existing Documentation

| Document                                                   | Description                                |
| ---------------------------------------------------------- | ------------------------------------------ |
| [architecture.md](architecture.md)                         | Architecture overview and decision records |
| [api.md](api.md)                                           | Public API reference                       |
| [contributing.md](contributing.md)                         | Contribution guidelines                    |
| [emulator-integration.md](emulator-integration.md)         | How to add and integrate emulators         |
| [ai-tools.md](ai-tools.md)                                 | Context7 library IDs, Nx MCP tools         |
| [bmad-guide.md](bmad-guide.md)                             | BMAD agent workflow guide                  |
| [documentation-guidelines.md](documentation-guidelines.md) | Rules for writing project docs             |

---

## Key Entry Points by Role

### New Developer

1. [Development Guide → Prerequisites](development-guide.md#prerequisites)
2. [Development Guide → First-Time Setup](development-guide.md#first-time-setup)
3. [Source Tree Analysis](source-tree-analysis.md) — understand what lives where
4. [Integration Architecture](integration-architecture.md) — understand how it connects

### Adding a Feature

Follow the layer order from [development-guide.md](development-guide.md#adding-a-feature--layer-order):

1. Model → `libs/core/src/models/` ([Data Models](data-models.md))
2. Migration → `libs/database/src/migrations/` ([Data Models → Migration History](data-models.md#migration-history))
3. Service → `libs/core/src/services/`
4. UI Component → `libs/ui/src/components/` ([Component Inventory](component-inventory.md))
5. i18n → `libs/i18n/src/locales/en/`

### Desktop Platform Work

- [Integration Architecture → Desktop IPC Architecture](integration-architecture.md#desktop-ipc-architecture)
- [Integration Architecture → IPC Channel Reference](integration-architecture.md#ipc-channel-reference)
- [Deployment Guide → Desktop Build & Release](deployment-guide.md#desktop-electron--build--release)

### Mobile Platform Work

- [Integration Architecture → Mobile Integration Architecture](integration-architecture.md#mobile-integration-architecture)
- [Deployment Guide → Mobile Build & Release](deployment-guide.md#mobile-react-native--build--release)

### Releasing

- [Deployment Guide → Pre-Release Checklist](deployment-guide.md#pre-release-checklist)
- [Deployment Guide → Version Management](deployment-guide.md#version-management)
- [Deployment Guide → CI/CD](deployment-guide.md#desktop-cicd-github-actions)

---

## Known Gaps (as of 2026-03-19)

| Gap                                                                   | Location                            | Severity                           |
| --------------------------------------------------------------------- | ----------------------------------- | ---------------------------------- |
| `romType` column not in DB schema (ADR-014 approved, not implemented) | `libs/database/`                    | High — blocks Epic 7               |
| 570 i18n keys missing for FR/ES/DE/JA/ZH                              | `libs/i18n/src/locales/`            | Medium                             |
| Android `applicationId` still `com.anonymous.emuzsource`              | `apps/mobile/android/`              | Critical before release            |
| Android release keystore not configured                               | `apps/mobile/android/`              | Critical before release            |
| macOS notarization disabled                                           | `apps/desktop/electron-builder.yml` | Required for App Store             |
| `LaunchService` still uses legacy `DatabaseAdapter`                   | `libs/core/src/services/`           | Medium — Drizzle migration pending |
| No test files in `apps/desktop/`                                      | `apps/desktop/`                     | Medium                             |

---

_This index is maintained as a living document. Re-run `/bmad-tech-writer` → `DP` to regenerate after significant codebase changes._
