# EmuZ - Universal Emulator Hub

> *"Yet another emulators and ROMs management front-end"*

## Feature Overview

**Feature Name**: EmuZ Core Application  
**Feature ID**: 001-emuz-core  
**Created**: 2026-01-04  
**Status**: Clarified  
**Inspired By**: [Daijishou](https://github.com/TapiocaFox/Daijishou)

---

## Executive Summary

EmuZ is a cross-platform application designed to centralize multiple gaming emulators into a single, unified interface—similar to Daijishou but available on **all platforms** (iOS, Android, macOS, Linux, and Windows). Users can organize their ROM libraries, discover new games via metadata scraping, and launch them with their preferred emulator using URL schemes or direct execution.

---

## Problem Statement

### Current Pain Points

1. **Fragmented Experience**: Gamers typically have multiple emulators installed, each with its own interface and organization system
2. **Manual Organization**: ROMs are scattered across folders with no unified way to browse or search
3. **Missing Metadata**: Cover art, descriptions, and game information must be manually obtained
4. **Platform Inconsistency**: Different emulators on different platforms means relearning interfaces
5. **Configuration Complexity**: Setting up emulators and associating ROMs requires technical knowledge

### Target Users

- **Casual Retro Gamers**: Want simple access to classic games without technical setup
- **Collectors**: Have large ROM libraries and need organization tools
- **Multi-Platform Users**: Use multiple devices and want a consistent experience
- **Daijishou Users**: Want the same experience on iOS/Desktop
- **Retroid/Handheld Users**: Need a unified frontend for their gaming devices
- **Streamers**: Need quick access to games for content creation

---

## User Stories

### Epic 1: Library Management

#### US-1.1: ROM Library Setup
**As a** user  
**I want to** add folders containing my ROMs to the application  
**So that** EmuZ can discover and organize my games automatically

**Acceptance Criteria:**
- [ ] User can add multiple ROM directories
- [ ] Application scans directories recursively
- [ ] Supported ROM formats are automatically detected
- [ ] Duplicate ROMs are identified and marked
- [ ] Scan progress is displayed with estimated time

#### US-1.2: Automatic Game Identification
**As a** user  
**I want to** have my ROMs automatically identified and matched with game metadata  
**So that** I can see cover art, descriptions, and accurate game names

**Acceptance Criteria:**
- [ ] ROMs are matched against a local/online database
- [ ] Cover art is automatically downloaded when available
- [ ] Game titles are properly formatted (not file names)
- [ ] Platform/console is correctly identified
- [ ] User can manually correct misidentified games

#### US-1.3: Collection Organization
**As a** user  
**I want to** organize my games into custom collections  
**So that** I can group games by preference, genre, or any criteria I choose

**Acceptance Criteria:**
- [ ] User can create unlimited collections
- [ ] Games can belong to multiple collections
- [ ] Collections can have custom icons and colors
- [ ] Smart collections based on rules (e.g., "All RPGs", "Recently Played")
- [ ] Collections sync across devices (optional)

#### US-1.4: Search and Filter
**As a** user  
**I want to** quickly search and filter my game library  
**So that** I can find any game within seconds

**Acceptance Criteria:**
- [ ] Global search accessible from anywhere (keyboard shortcut)
- [ ] Search by title, platform, year, genre
- [ ] Filter by platform, collection, recently played
- [ ] Sort by name, date added, last played, rating
- [ ] Search results update as user types

---

### Epic 2: Emulator Integration

#### US-2.1: Emulator Configuration
**As a** user  
**I want to** configure my installed emulators in EmuZ  
**So that** games can be launched with the correct emulator

**Acceptance Criteria:**
- [ ] Common emulators are auto-detected when installed
- [ ] User can manually add emulator paths
- [ ] Default emulator can be set per platform
- [ ] Multiple emulators can be configured per platform
- [ ] Emulator settings are validated on save

#### US-2.2: Game Launch
**As a** user  
**I want to** launch any game with one click  
**So that** I can start playing immediately

**Acceptance Criteria:**
- [ ] Single click/tap launches game with default emulator
- [ ] Long press/right-click shows emulator options
- [ ] Launch parameters can be customized per game
- [ ] Recent games are quickly accessible
- [ ] Launch failures show helpful error messages

#### US-2.3: Per-Game Configuration
**As a** user  
**I want to** save specific settings for individual games  
**So that** each game runs with optimal configuration

**Acceptance Criteria:**
- [ ] Override default emulator for specific games
- [ ] Custom launch arguments per game
- [ ] Save state location configuration
- [ ] Input mapping overrides
- [ ] Configuration is persistent across sessions

---

### Epic 3: User Interface

#### US-3.1: Grid View
**As a** user  
**I want to** browse my games in a visual grid layout  
**So that** I can quickly identify games by their cover art

**Acceptance Criteria:**
- [ ] Responsive grid adapts to screen size
- [ ] Cover art displayed prominently
- [ ] Platform badge on each game card
- [ ] Hover/focus shows quick actions
- [ ] Smooth scrolling with virtualization for large libraries

#### US-3.2: Game Details
**As a** user  
**I want to** view detailed information about a game  
**So that** I can learn about it before playing

**Acceptance Criteria:**
- [ ] Full-screen detail view with large artwork
- [ ] Description, release date, developer, publisher
- [ ] Screenshots gallery (when available)
- [ ] Play statistics (time played, last session)
- [ ] Quick launch button

#### US-3.3: Platform Browser
**As a** user  
**I want to** browse games organized by platform  
**So that** I can explore games for specific consoles

**Acceptance Criteria:**
- [ ] Sidebar lists all platforms with game counts
- [ ] Platform pages show custom branding/colors
- [ ] Platform-specific features (e.g., arcade favorites)
- [ ] Empty platforms can be hidden
- [ ] Custom platform icons

#### US-3.4: Theme Customization
**As a** user  
**I want to** customize the application appearance  
**So that** it matches my preferences

**Acceptance Criteria:**
- [ ] Dark and light mode
- [ ] Accent color customization
- [ ] Grid size adjustment
- [ ] Font size options
- [ ] Theme presets (Retro, Modern, Minimal)

---

### Epic 4: Cross-Platform Features

#### US-4.1: Consistent Experience
**As a** user  
**I want to** have the same experience across all my devices  
**So that** I don't have to relearn the interface

**Acceptance Criteria:**
- [ ] Identical core features on all platforms
- [ ] Platform-appropriate input handling
- [ ] Consistent navigation patterns
- [ ] Same settings and options available
- [ ] Responsive design for all screen sizes

#### US-4.2: Data Portability
**As a** user  
**I want to** export and import my library configuration  
**So that** I can backup or transfer my setup

**Acceptance Criteria:**
- [ ] Export library metadata to portable format
- [ ] Export settings and preferences
- [ ] Import on different device/platform
- [ ] Merge or replace existing data
- [ ] Cloud backup option (optional feature)

---

### Epic 5: Performance & Reliability

#### US-5.1: Fast Library Loading
**As a** user  
**I want to** have my library load quickly  
**So that** I can start browsing immediately

**Acceptance Criteria:**
- [ ] Initial load under 2 seconds for 1000+ games
- [ ] Incremental loading for very large libraries
- [ ] Cover art loaded asynchronously
- [ ] Search index built in background
- [ ] Memory-efficient image caching

#### US-5.2: Offline Functionality
**As a** user  
**I want to** use the app without internet connection  
**So that** I can play games anywhere

**Acceptance Criteria:**
- [ ] All core features work offline
- [ ] Cached metadata and artwork available
- [ ] Pending syncs queue for later
- [ ] Clear indication of offline mode
- [ ] Graceful degradation of online features

---

## Functional Requirements

### FR-1: ROM Detection
- Detect ROMs based on file extension mapping
- Support common archive formats (ZIP, 7z, RAR)
- Calculate checksums for accurate identification
- Handle multi-file games (e.g., CD images with CUE/BIN)

### FR-2: Metadata Database
- Local SQLite database for all metadata
- Scraped data from TheGamesDB, ScreenScraper, or similar
- User can manually edit any field
- Metadata versioning for updates

### FR-3: Emulator Registry
- Configuration file for supported emulators
- Per-platform emulator definitions
- Launch command templates with placeholders
- Support for portable and installed emulators

### FR-4: Platform Support Matrix

| Platform | Framework | Status |
|----------|-----------|--------|
| iOS | React Native | Planned |
| Android | React Native | Planned |
| macOS | Electron | Planned |
| Linux | Electron | Planned |
| Windows | Electron | Planned |

---

## Non-Functional Requirements

### NFR-1: Performance
- App launch: < 2 seconds
- Library scan: < 5 seconds for 1000 ROMs
- Game launch: < 1 second to hand off to emulator
- Memory usage: < 500MB for large libraries

### NFR-2: Security
- No ROM distribution or downloading
- File paths validated and sandboxed
- No external network requests without consent
- Sensitive paths not logged

### NFR-3: Accessibility
- Screen reader support
- Keyboard navigation complete
- High contrast mode
- Configurable font sizes

### NFR-4: Localization
- English as base language
- Architecture supports i18n
- RTL layout support
- Date/number formatting

---

## Out of Scope (v1.0)

- Cloud save synchronization
- RetroAchievements integration
- Online multiplayer / Netplay
- ROM downloading or distribution
- Built-in emulator cores (use external emulators)
- Streaming features (Moonlight-like)
- Native OS widgets (iOS/Android)
- Bluetooth gamepad configuration

---

## Supported Platforms (100+)

EmuZ supports all platforms available in Daijishou, organized by category:

### Nintendo
| System | Extensions | RetroArch Core |
|--------|------------|----------------|
| NES | .nes, .fds | nestopia, fceumm |
| SNES | .smc, .sfc | snes9x, bsnes |
| Game Boy | .gb | gambatte, mgba |
| Game Boy Color | .gbc | gambatte, mgba |
| Game Boy Advance | .gba | mgba, vba-m |
| Nintendo 64 | .n64, .z64, .v64 | mupen64plus, parallel-n64 |
| Nintendo DS | .nds | desmume, melonds |
| Nintendo 3DS | .3ds, .cia | citra |
| GameCube | .iso, .gcz | dolphin |
| Wii | .iso, .wbfs | dolphin |
| Virtual Boy | .vb | beetle-vb |

### Sony
| System | Extensions | RetroArch Core |
|--------|------------|----------------|
| PlayStation | .bin/.cue, .iso, .pbp | duckstation, pcsx_rearmed |
| PlayStation 2 | .iso, .chd | pcsx2 |
| PlayStation 3 | .pkg | (rpcs3 standalone) |
| PSP | .iso, .cso | ppsspp |
| PS Vita | .vpk | (vita3k standalone) |

### Sega
| System | Extensions | RetroArch Core |
|--------|------------|----------------|
| Master System | .sms | genesis_plus_gx |
| Genesis/Mega Drive | .md, .gen | genesis_plus_gx, picodrive |
| Sega CD | .bin/.cue, .chd | genesis_plus_gx |
| 32X | .32x | picodrive |
| Saturn | .bin/.cue, .iso | beetle-saturn, yabause |
| Dreamcast | .gdi, .cdi, .chd | flycast |
| Game Gear | .gg | genesis_plus_gx |

### Arcade
| System | Extensions | RetroArch Core |
|--------|------------|----------------|
| MAME | .zip | mame |
| FinalBurn Neo | .zip | fbneo |
| CPS1/2/3 | .zip | fbneo |
| Neo Geo | .zip | fbneo |
| Atomiswave | .zip | flycast |
| NAOMI | .zip | flycast |

### Other Systems
| System | Extensions | RetroArch Core |
|--------|------------|----------------|
| Atari 2600 | .a26 | stella |
| Atari 7800 | .a78 | prosystem |
| Atari Lynx | .lnx | handy |
| TurboGrafx-16 | .pce | beetle-pce |
| Neo Geo Pocket | .ngp, .ngc | beetle-ngp |
| WonderSwan | .ws, .wsc | beetle-wswan |
| DOS | varies | dosbox-pure |
| Amiga | .adf | puae |
| MSX | .rom | bluemsx |

*Full list: 100+ platforms matching Daijishou*

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Library load time (1000 games) | < 2s |
| Game launch time | < 1s |
| ROM identification accuracy | > 90% |
| Platform parity (features) | 100% |
| Crash-free sessions | > 99% |

---

## Review & Acceptance Checklist

- [ ] All user stories have clear acceptance criteria
- [ ] Non-functional requirements are measurable
- [ ] Out of scope items are clearly defined
- [ ] Success metrics are achievable and measurable
- [ ] Technical feasibility confirmed for all platforms
- [ ] Security considerations addressed
- [ ] Accessibility requirements defined
