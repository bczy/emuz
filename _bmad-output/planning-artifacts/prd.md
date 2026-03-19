# EmuZ — Product Requirements Document

**Version**: 1.1.0 | **Status**: Active | **Last edited**: 2026-03-18 | **Changes**: Added `romType: 'software'` as 3rd classification (US-1.5, FR-8)

> _"Yet another emulators and ROMs management front-end"_

---

## Executive Summary

EmuZ is a cross-platform emulator frontend inspired by Daijishou, targeting all major platforms (iOS, Android, macOS, Linux, Windows). It provides a unified, visually rich interface for managing ROM libraries, scraping metadata, and launching games through installed emulators — no emulator cores bundled, no ROM distribution.

**Key differentiator**: Daijishou exists only on Android. EmuZ brings the same experience to all 5 platforms from a single codebase.

---

## Problem Statement

Retro gamers face a fragmented experience:

1. Multiple emulators, each with its own interface and organization
2. ROMs scattered across folders with no unified browsing/search
3. Missing cover art and metadata that must be obtained manually
4. Relearning interfaces across different platforms and devices
5. Technical complexity of setting up emulators and associating ROMs

---

## Target Users

| Persona               | Need                                                   |
| --------------------- | ------------------------------------------------------ |
| Casual Retro Gamer    | Simple access to classic games without technical setup |
| Collector             | Large ROM libraries requiring organization tools       |
| Multi-Platform User   | Consistent experience across phone, tablet, desktop    |
| Daijishou User        | Same Android experience on iOS/Desktop                 |
| Retroid/Handheld User | Unified frontend for gaming handhelds                  |
| Streamer              | Quick game access for content creation                 |

---

## V1.0 Scope

### ✅ Included

- Library management (scan, organize, collections, favorites)
- ROM type classification (game / homebrew / software) with visual badge and sidebar filter
- Metadata scraping (hybrid: local DB + ScreenScraper)
- Emulator launching (URL schemes + direct process spawn)
- Daijishou-style interface (home widgets, platform wallpapers, genres)
- 100+ platform support
- 5 OS: iOS, Android, macOS, Linux, Windows
- Themes and color customization
- Full offline mode
- i18n: EN, FR, ES, DE, JA, ZH

### ❌ Out of Scope

- Cloud save synchronization
- RetroAchievements integration
- Online multiplayer / Netplay
- ROM downloading or distribution
- Built-in emulator cores
- Streaming (Moonlight-like)
- Native OS widgets
- Bluetooth gamepad configuration

---

## Epics & User Stories

### Epic 1: Library Management

#### US-1.1 — ROM Library Setup

**As a** user, **I want to** add folders containing my ROMs, **so that** EmuZ can discover and organize my games automatically.

**Acceptance Criteria:**

- [ ] User can add multiple ROM directories
- [ ] Application scans directories recursively
- [ ] Supported ROM formats automatically detected by extension
- [ ] Duplicate ROMs identified and marked
- [ ] Scan progress displayed with estimated time remaining

**Architecture ref**: `ScannerService.addDirectory()`, `libs/platform/src/filesystem/`

---

#### US-1.2 — Automatic Game Identification

**As a** user, **I want to** have my ROMs automatically identified and matched with game metadata, **so that** I can see cover art, descriptions, and accurate game names.

**Acceptance Criteria:**

- [ ] ROMs matched against local/online database by hash
- [ ] Cover art automatically downloaded when available
- [ ] Game titles properly formatted (not raw file names)
- [ ] Platform/console correctly identified from extension
- [ ] User can manually correct misidentified games

**Architecture ref**: `MetadataService.identifyGame()`, ADR-008 (hybrid metadata)

---

#### US-1.3 — Collection Organization

**As a** user, **I want to** organize my games into custom collections, **so that** I can group them by preference, genre, or any criteria.

**Acceptance Criteria:**

- [ ] User can create unlimited collections
- [ ] Games can belong to multiple collections
- [ ] Collections have custom icons and colors
- [ ] Smart collections based on rules (e.g., "All RPGs", "Recently Played")

**Architecture ref**: `LibraryService.createCollection()`, `collections` table

---

#### US-1.4 — Search and Filter

**As a** user, **I want to** quickly search and filter my game library, **so that** I can find any game within seconds.

**Acceptance Criteria:**

- [ ] Global search accessible from anywhere (keyboard shortcut on desktop)
- [ ] Search by title, platform, year, genre
- [ ] Filter by platform, collection, recently played
- [ ] Sort by name, date added, last played, rating
- [ ] Search results update as user types (debounced)
- [ ] Results appear in < 100ms

**Architecture ref**: `LibraryService.searchGames()` (fuse.js fuzzy search)

---

#### US-1.5 — ROM Type Classification

**As a** user, **I want to** classify each ROM as a commercial game, a homebrew, or software, **so that** I can organize, filter, and interact with each category according to its nature.

**Acceptance Criteria:**

- [ ] Each ROM has a `romType`: `'game' | 'homebrew' | 'software'` (default: `'game'`)
- [ ] User can change `romType` from the game detail screen
- [ ] Sidebar and search offer a "Type" filter: game / homebrew / software / all
- [ ] Visual badge distinguishes each type (e.g., "HB" for homebrew, "SW" for software)
- [ ] Scanner can infer `romType` from the source folder name (e.g., `homebrews/` → `'homebrew'`, `software/` → `'software'`)
- [ ] `romType` is included in search/filter `SearchOptions`
- [ ] Existing ROMs in the database are migrated with default `romType = 'game'`
- [ ] `romType: 'software'` entries are hidden by default in the main game grid; accessible via dedicated "Software" section or explicit filter
- [ ] `romType: 'software'` supports a distinct launch path (not constrained to standard game emulator flow)

**Architecture ref**: `LibraryService.searchGames()`, ADR-014 (romType enum design), `libs/core/src/models/Game.ts`, `libs/database/src/schema/index.ts`

---

### Epic 2: Emulator Integration

#### US-2.1 — Emulator Configuration

**As a** user, **I want to** configure my installed emulators, **so that** games can be launched with the correct emulator.

**Acceptance Criteria:**

- [ ] Common emulators auto-detected when installed
- [ ] User can manually add emulator paths
- [ ] Default emulator settable per platform
- [ ] Multiple emulators configurable per platform
- [ ] Emulator settings validated on save

**Architecture ref**: `LaunchService.detectEmulators()`, `libs/emulators/src/detector/`

---

#### US-2.2 — Game Launch

**As a** user, **I want to** launch any game with one click, **so that** I can start playing immediately.

**Acceptance Criteria:**

- [ ] Single click/tap launches game with default emulator
- [ ] Long press/right-click shows emulator options
- [ ] Launch parameters customizable per game
- [ ] Recent games quickly accessible
- [ ] Launch failures show helpful error messages
- [ ] Handoff to emulator in < 1 second

**Architecture ref**: `LaunchService.launchGame()`, `libs/platform/src/launcher/`

---

#### US-2.3 — Per-Game Configuration

**As a** user, **I want to** save specific settings for individual games, **so that** each game runs with optimal configuration.

**Acceptance Criteria:**

- [ ] Override default emulator for specific games
- [ ] Custom launch arguments per game
- [ ] Configuration persistent across sessions

---

### Epic 3: User Interface (Daijishou-style)

#### US-3.1 — Widget Home Screen _(Daijishou feature)_

**As a** user, **I want to** customize my home screen with widgets, **so that** I have quick access to my favorite content.

**Acceptance Criteria:**

- [ ] Recent games widget
- [ ] Favorites widget
- [ ] Play statistics widget (time played, game count)
- [ ] Platform shortcuts widget
- [ ] Widgets draggable/reorderable
- [ ] Widget size options (small, medium, large)

**Architecture ref**: `WidgetService`, `widgetsStore`, `libs/ui/src/components/widgets/`

---

#### US-3.2 — Grid View

**As a** user, **I want to** browse my games in a visual grid layout, **so that** I can identify games by cover art.

**Acceptance Criteria:**

- [ ] Responsive grid adapts to screen size
- [ ] Cover art displayed prominently
- [ ] Platform badge on each game card
- [ ] Hover/focus shows quick actions
- [ ] Smooth scrolling with virtualization for large libraries

---

#### US-3.3 — Game Details

**As a** user, **I want to** view detailed information about a game, **so that** I can learn about it before playing.

**Acceptance Criteria:**

- [ ] Full-screen detail view with large artwork
- [ ] Description, release date, developer, publisher
- [ ] Screenshots gallery (when available)
- [ ] Play statistics (time played, last session)
- [ ] Quick launch button, favorites toggle

---

#### US-3.4 — Platform Browser with Wallpapers _(Daijishou feature)_

**As a** user, **I want to** browse games organized by platform with custom wallpapers, **so that** the interface reflects each console's aesthetic.

**Acceptance Criteria:**

- [ ] Platform list with game counts
- [ ] Platform pages with custom wallpapers
- [ ] Blur/overlay wallpaper options
- [ ] Custom platform icons
- [ ] Empty platforms hideable

**Architecture ref**: ADR-009 (JSON platform definitions), `platforms.wallpaper_path`

---

#### US-3.5 — Genre Navigation _(Daijishou feature)_

**As a** user, **I want to** browse games by genre, **so that** I can discover games based on my mood.

**Acceptance Criteria:**

- [ ] Genre list with game counts
- [ ] Genre assigned from metadata
- [ ] Manual genre override available
- [ ] Multi-genre support per game

**Architecture ref**: `GenreService`, `Genre` model

---

#### US-3.6 — Theme Customization

**As a** user, **I want to** customize the application appearance, **so that** it matches my preferences.

**Acceptance Criteria:**

- [ ] Dark and light mode
- [ ] Accent color customization
- [ ] Grid size adjustment
- [ ] Font size options
- [ ] Theme presets (default emerald green on slate dark)

---

### Epic 4: Cross-Platform Features

#### US-4.1 — Consistent Experience

**As a** user, **I want to** have the same experience across all my devices, **so that** I don't have to relearn the interface.

**Acceptance Criteria:**

- [ ] Identical core features on all 5 platforms
- [ ] Platform-appropriate input handling (touch/mouse/keyboard)
- [ ] Consistent navigation patterns
- [ ] Responsive design for all screen sizes

**Architecture ref**: ADR-001 (Nx monorepo), ADR-005 (platform adapters)

---

#### US-4.2 — Data Portability

**As a** user, **I want to** export and import my library configuration, **so that** I can backup or transfer my setup.

**Acceptance Criteria:**

- [ ] Export library metadata to portable format
- [ ] Export settings and preferences
- [ ] Import on different device/platform
- [ ] Merge or replace existing data

---

### Epic 5: Performance & Reliability

#### US-5.1 — Fast Library Loading

**Acceptance Criteria:**

- [ ] Initial load < 2 seconds for 1000+ games
- [ ] Incremental loading for very large libraries
- [ ] Cover art loaded asynchronously (never blocks UI)
- [ ] Memory-efficient image caching

**Architecture ref**: ADR-003 (SQLite indexes), React Query caching

---

#### US-5.2 — Offline Functionality

**Acceptance Criteria:**

- [ ] All core features work offline
- [ ] Cached metadata and artwork available
- [ ] Clear indication of offline/online mode
- [ ] Graceful degradation of online features

**Architecture ref**: ADR-008 (local metadata DB), offline-first design

---

## Functional Requirements

| ID   | Requirement                                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1 | Detect ROMs by file extension; support ZIP/7z/RAR archives; calculate checksums                                                                                                   |
| FR-2 | Local SQLite metadata DB; user can edit any field; metadata versioning                                                                                                            |
| FR-3 | Emulator registry with per-platform definitions and launch command templates                                                                                                      |
| FR-4 | Support all 5 target OS: iOS, Android, macOS, Linux, Windows                                                                                                                      |
| FR-5 | 100+ gaming platforms (all Daijishou platforms)                                                                                                                                   |
| FR-6 | Widget home screen with at least 4 widget types                                                                                                                                   |
| FR-7 | Genre-based navigation with metadata-sourced genres                                                                                                                               |
| FR-8 | `romType: 'software'` entries hidden from main grid by default; visible via "Software" section or explicit filter; support distinct launch path independent of game emulator flow |

---

## Non-Functional Requirements

| ID    | Category      | Requirement                                                                                                                                                                |
| ----- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1 | Performance   | App launch < 2s; scan < 5s/1000 ROMs; search < 100ms; memory < 500MB                                                                                                       |
| NFR-2 | Security      | No ROM distribution; file paths validated; no telemetry; no sensitive path logging                                                                                         |
| NFR-3 | Accessibility | Screen reader support; full keyboard navigation; high contrast mode; configurable font sizes                                                                               |
| NFR-4 | Localization  | English base; i18n architecture; RTL layout support; 6 languages at launch                                                                                                 |
| NFR-5 | Reliability   | > 99% crash-free sessions; > 90% ROM identification accuracy                                                                                                               |
| NFR-6 | Testing       | > 80% line coverage for `libs/core`; all public APIs tested; E2E mobile flows covered by Detox 20.47.0 (iOS + Android); E2E desktop flows covered by Playwright (Electron) |

---

## Supported Platforms (100+)

### Nintendo

| System           | Extensions       | RetroArch Core            |
| ---------------- | ---------------- | ------------------------- |
| NES              | .nes, .fds       | nestopia, fceumm          |
| SNES             | .smc, .sfc       | snes9x, bsnes             |
| Game Boy         | .gb              | gambatte, mgba            |
| Game Boy Color   | .gbc             | gambatte, mgba            |
| Game Boy Advance | .gba             | mgba, vba-m               |
| Nintendo 64      | .n64, .z64, .v64 | mupen64plus, parallel-n64 |
| Nintendo DS      | .nds             | desmume, melonds          |
| Nintendo 3DS     | .3ds, .cia       | citra                     |
| GameCube         | .iso, .gcz       | dolphin                   |
| Wii              | .iso, .wbfs      | dolphin                   |

### Sony

| System        | Extensions            | RetroArch Core            |
| ------------- | --------------------- | ------------------------- |
| PlayStation   | .bin/.cue, .iso, .pbp | duckstation, pcsx_rearmed |
| PlayStation 2 | .iso, .chd            | pcsx2                     |
| PlayStation 3 | .pkg                  | rpcs3 (standalone)        |
| PSP           | .iso, .cso            | ppsspp                    |

### Sega

| System             | Extensions       | RetroArch Core             |
| ------------------ | ---------------- | -------------------------- |
| Master System      | .sms             | genesis_plus_gx            |
| Genesis/Mega Drive | .md, .gen        | genesis_plus_gx, picodrive |
| Sega CD            | .bin/.cue, .chd  | genesis_plus_gx            |
| Saturn             | .bin/.cue, .iso  | beetle-saturn, yabause     |
| Dreamcast          | .gdi, .cdi, .chd | flycast                    |
| Game Gear          | .gg              | genesis_plus_gx            |

### Arcade

| System             | Extensions | RetroArch Core |
| ------------------ | ---------- | -------------- |
| MAME               | .zip       | mame           |
| FinalBurn Neo      | .zip       | fbneo          |
| Neo Geo            | .zip       | fbneo          |
| NAOMI / Atomiswave | .zip       | flycast        |

### Other

| System        | Extensions | RetroArch Core |
| ------------- | ---------- | -------------- |
| Atari 2600    | .a26       | stella         |
| TurboGrafx-16 | .pce       | beetle-pce     |
| WonderSwan    | .ws, .wsc  | beetle-wswan   |
| DOS           | varies     | dosbox-pure    |
| Amiga         | .adf       | puae           |
| MSX           | .rom       | bluemsx        |

_Full 100+ platform list in `libs/emulators/src/data/platforms/`_

---

## Success Metrics

| Metric                         | Target |
| ------------------------------ | ------ |
| Library load time (1000 games) | < 2s   |
| Game launch handoff            | < 1s   |
| ROM identification accuracy    | > 90%  |
| Platform feature parity        | 100%   |
| Crash-free sessions            | > 99%  |
| Core test coverage             | > 80%  |
