# EmuZ Architecture

> *A Daijishou-inspired cross-platform emulator frontend*

## Overview

EmuZ is a modern, cross-platform emulator frontend built with a focus on user experience, performance, and extensibility. It supports desktop (Windows, macOS, Linux) and mobile (Android, iOS) platforms through a shared codebase.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Applications                                    │
├─────────────────────────────────┬───────────────────────────────────────┤
│       Desktop (Electron)        │        Mobile (React Native)          │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐        │
│  │    Renderer Process     │    │    │       React Native      │        │
│  │  ┌─────────────────┐    │    │    │    ┌─────────────────┐  │        │
│  │  │   React + Vite  │    │    │    │    │   NativeWind    │  │        │
│  │  └─────────────────┘    │    │    │    └─────────────────┘  │        │
│  │  ┌─────────────────┐    │    │    │    ┌─────────────────┐  │        │
│  │  │  TailwindCSS    │    │    │    │    │ React Navigation│  │        │
│  │  └─────────────────┘    │    │    │    └─────────────────┘  │        │
│  └─────────────────────────┘    │    └─────────────────────────┘        │
│  ┌─────────────────────────┐    │                                       │
│  │     Main Process        │    │                                       │
│  │  ┌─────────────────┐    │    │                                       │
│  │  │    IPC Bridge   │    │    │                                       │
│  │  └─────────────────┘    │    │                                       │
│  └─────────────────────────┘    │                                       │
└─────────────────────────────────┴───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Shared Libraries                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   @emuz/ui  │ │ @emuz/core  │ │@emuz/database│ │@emuz/emulators│     │
│  │             │ │             │ │             │ │             │        │
│  │ • Components│ │ • Services  │ │ • Schema    │ │ • Registry  │        │
│  │ • Themes    │ │ • Models    │ │ • Migrations│ │ • Detector  │        │
│  │ • Hooks     │ │ • Stores    │ │ • Adapters  │ │ • Launchers │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐                                        │
│  │@emuz/platform│ │  @emuz/i18n │                                       │
│  │             │ │             │                                        │
│  │ • Filesystem│ │ • Locales   │                                        │
│  │ • Launchers │ │ • Config    │                                        │
│  └─────────────┘ └─────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Package Structure

### Applications

#### `apps/desktop` - Electron Desktop Application
- **Framework**: Electron 33.x with Vite
- **Renderer**: React 19.x with TailwindCSS 4.x
- **State**: Zustand 5.x with React Query 5.x
- **Features**: Native file system access, process spawning, window management

#### `apps/mobile` - React Native Mobile Application  
- **Framework**: React Native 0.76+ (Bare Workflow)
- **Styling**: NativeWind 4.x (Tailwind for React Native)
- **Navigation**: React Navigation 7.x
- **Features**: Platform-specific file access, emulator launching via intents/URL schemes

### Libraries

#### `libs/core` - Core Business Logic
Contains all platform-agnostic business logic:
- **Models**: Game, Platform, Emulator, Collection, Widget, Genre, Settings
- **Services**: LibraryService, ScannerService, MetadataService, LaunchService, WidgetService, GenreService
- **Stores**: Zustand stores for state management
- **Hooks**: React hooks for accessing services

#### `libs/database` - Database Layer
SQLite-based persistence layer:
- **Schema**: All table definitions using Drizzle-like types
- **Migrations**: Versioned database migrations
- **Adapters**: Platform-specific database implementations
  - Desktop: better-sqlite3
  - Mobile: react-native-sqlite-storage

#### `libs/ui` - UI Components
Shared UI component library:
- **Components**: Button, Card, GameCard, GameGrid, Sidebar, Widgets, etc.
- **Themes**: Dark theme with Emerald Green (#10B981) accent
- **Design System**: Typography, spacing, colors

#### `libs/emulators` - Emulator Definitions
Database of known emulators:
- **Registry**: All supported emulators with metadata
- **Detector**: Auto-detection logic per platform
- **Launchers**: Command templates and launch logic

#### `libs/platform` - Platform Abstractions
Platform-specific implementations:
- **Filesystem**: Unified file system API across platforms
- **Launchers**: Process spawning / Intent launching

#### `libs/i18n` - Internationalization
Multi-language support:
- **Locales**: EN, ES, FR, DE, JA, ZH
- **Config**: i18next configuration

## Data Flow

```
User Action → React Component → Store Action → Service Method → Database Adapter → SQLite
     ↑                                              ↓
     └──────────────────── State Update ←──────────┘
```

### State Management

1. **Zustand Stores**: Application state (library, settings, UI)
2. **React Query**: Server state (async data fetching/caching)
3. **Local State**: Component-specific UI state

### Service Layer

Services provide the business logic layer:

```typescript
// Example: LibraryService
interface ILibraryService {
  getAllGames(options?: PaginationOptions): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  searchGames(options: SearchOptions): Promise<Game[]>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | null>;
  deleteGame(id: string): Promise<void>;
  // ... more methods
}
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `games` | Game entries with metadata |
| `platforms` | Gaming platform definitions |
| `emulators` | Configured emulators |
| `collections` | User-defined game collections |
| `collection_games` | Many-to-many collection↔game |
| `scan_directories` | ROM scan locations |
| `play_sessions` | Play history tracking |
| `widgets` | Dashboard widget configuration |
| `settings` | Application settings |

### Entity Relationships

```
platforms 1──∞ games
games ∞──∞ collections (via collection_games)
games 1──∞ play_sessions
emulators ∞──∞ platforms
```

## Key Features

### Daijishou-Inspired Home Screen
- Configurable widget system
- Recent games, favorites, statistics widgets
- Platform shortcuts with wallpapers

### Platform-Aware Design
- Platform cards with background wallpapers
- Genre-based organization
- User collections

### Smart Library Management
- Recursive ROM scanning
- Hash-based game identification
- Metadata scraping
- Cover art management

### Emulator Integration
- Auto-detection of installed emulators
- Configurable command templates
- Play session tracking
- Platform-specific launching

## Tech Stack Summary

| Layer | Desktop | Mobile |
|-------|---------|--------|
| Framework | Electron 33.x | React Native 0.76+ |
| UI | React 19.x | React Native + NativeWind |
| Styling | TailwindCSS 4.x | NativeWind 4.x |
| State | Zustand 5.x | Zustand 5.x |
| Data | React Query 5.x | React Query 5.x |
| Database | better-sqlite3 | react-native-sqlite-storage |
| Build | Vite | Metro |
| Monorepo | Nx 20.x | Nx 20.x |
| Package Manager | pnpm 9.x | pnpm 9.x |

## Build System

### Nx Monorepo
- Task orchestration with caching
- Dependency graph for builds
- Parallel execution

### Scripts
```bash
# Development
pnpm nx serve desktop    # Run desktop dev
pnpm nx start mobile     # Run mobile Metro

# Build
pnpm nx build desktop    # Build desktop
pnpm nx build-ios mobile # Build iOS
pnpm nx build-android mobile # Build Android

# Test
pnpm nx test core        # Test core library
pnpm nx run-many -t test # Run all tests

# Lint
pnpm nx run-many -t lint # Lint all projects
```

## Security Considerations

1. **File Access**: Scoped to user-selected directories
2. **No Network by Default**: Metadata scraping is opt-in
3. **Local Storage**: All data stored locally in SQLite
4. **Platform Sandboxing**: Respects platform security models

## Performance Optimizations

1. **Virtualized Lists**: Large game grids use virtualization
2. **Image Caching**: Cover art cached locally
3. **Lazy Loading**: Components and routes loaded on demand
4. **Database Indexing**: Optimized queries with proper indexes
5. **Incremental Scanning**: Only scan changed files

## Future Considerations

1. **Cloud Sync**: Optional save state/settings sync
2. **Controller Support**: Native controller input
3. **RetroAchievements**: Integration with RetroAchievements
4. **Themes**: User-customizable themes
5. **Plugins**: Extension system for additional features
