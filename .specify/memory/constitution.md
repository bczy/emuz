# EmuZ - Project Constitution

## 🎯 Vision

EmuZ is a universal emulator hub designed to centralize and simplify the management of multiple gaming emulators across all major platforms (iOS, Android, macOS, Linux, and Windows). The application provides a unified interface for organizing, launching, and managing ROMs from various emulator systems.

---

## Core Principles

### I. Cross-Platform First

- **React Native with Electron** for true cross-platform support
- Single codebase that works seamlessly on iOS, Android, macOS, Linux, and Windows
- Platform-specific optimizations where necessary, but shared core logic
- Native look and feel on each platform while maintaining consistency

### II. User Experience Excellence

- **Intuitive Navigation**: Users should be able to find and launch any game within 3 clicks
- **Visual Rich**: Cover art, screenshots, and metadata should be prominently displayed
- **Fast Launch**: Game launching should be near-instantaneous
- **Accessibility**: Support for various input methods (touch, keyboard, gamepad)

### III. Test-First Development (NON-NEGOTIABLE)

- TDD mandatory: Tests written → User approved → Tests fail → Then implement
- Red-Green-Refactor cycle strictly enforced
- Minimum 80% test coverage for core functionality
- All public APIs and complex logic must be documented

### IV. Performance Requirements

- **App Launch Time**: < 2 seconds on modern devices
- **Library Scan**: < 5 seconds for libraries with 1000+ ROMs
- **Memory Footprint**: Optimized for devices with limited resources
- **Offline First**: Full functionality without internet connection

### V. Security & Privacy

- **No Telemetry**: No user data collection without explicit consent
- **Local Storage**: All user data stored locally by default
- **ROM Safety**: Never modify or distribute ROM files
- **Secure Paths**: Validate all file paths to prevent directory traversal

---

## Technical Constraints

### Mandatory Technologies

- **React Native** (v0.76+) for mobile platforms (iOS/Android)
- **React** (v19+) for web/desktop components
- **Electron** (v33+) for desktop applications (macOS, Linux, Windows)
- **TypeScript** (v5.7+) for all application code with strict mode enabled
- **SQLite** for local database (via react-native-sqlite-storage / better-sqlite3)

### Project Structure

```
emuz/
├── apps/
│   ├── mobile/          # React Native mobile app (iOS/Android)
│   └── desktop/         # Electron desktop app (macOS/Linux/Windows)
├── packages/
│   ├── core/            # Shared business logic
│   ├── ui/              # Shared UI components
│   ├── emulators/       # Emulator integration layer
│   └── database/        # Database schemas and queries
├── .specify/            # Spec-Kit artifacts
└── docs/                # Documentation
```

### Supported Emulator Categories

All platforms from Daijishou (100+ systems):

1. **Nintendo**: NES, SNES, N64, GameCube, Wii, GB, GBA, DS, 3DS
2. **Sony**: PlayStation 1/2/3, PSP, PS Vita
3. **Sega**: Master System, Genesis, Saturn, Dreamcast, Game Gear
4. **Arcade**: MAME, FBNeo, CPS1/2/3, Neo Geo, NAOMI
5. **Atari**: 2600, 5200, 7800, Lynx, Jaguar
6. **Other**: TurboGrafx, WonderSwan, Vectrex, 3DO, etc.
7. **Computers**: DOS, Amiga, C64, MSX, ZX Spectrum

---

## Design Guidelines

### UI/UX Principles (Daijishou-inspired)

- **Widget Home Page**: Customizable widgets (recent, favorites, stats)
- **Platform Wallpapers**: Custom wallpapers per platform
- **Grid-Based Layout**: Cover art displayed in a responsive grid
- **Quick Actions**: Long-press/right-click for context menus
- **Search Everywhere**: Global search accessible from any screen
- **Genre Navigation**: Browse games by genre

### Color Palette - Green Theme

```css
/* Primary - Emerald Green */
--color-primary: #10b981;
--color-primary-light: #34d399;
--color-primary-dark: #059669;

/* Background - Slate Dark */
--color-bg-primary: #0f172a;
--color-bg-secondary: #1e293b;
--color-bg-tertiary: #334155;

/* Text */
--color-text-primary: #f8fafc;
--color-text-secondary: #94a3b8;

/* Borders & States */
--color-border: #334155;
--color-success: #22c55e;
--color-error: #ef4444;
```

---

## Decision-Making Framework

When making technical decisions, prioritize in this order:

1. **User Experience** - Does it improve the user's workflow?
2. **Cross-Platform Compatibility** - Does it work on all target platforms?
3. **Performance** - Does it meet performance requirements?
4. **Maintainability** - Is the code clean and testable?
5. **Feature Richness** - Does it add value without bloat?

---

## Anti-Patterns to Avoid

- ❌ Platform-specific code in shared modules
- ❌ Direct file system access without abstraction
- ❌ Hardcoded paths or configurations
- ❌ Synchronous file operations on main thread
- ❌ Large bundle sizes from unused dependencies
- ❌ Storing sensitive data in plain text

---

## Governance

Constitution supersedes all other practices. Amendments require:

- Documentation of the change
- Team approval
- Migration plan for existing code

All PRs/reviews must verify compliance with these principles.

## Quality Gates

Before any feature is considered complete:

- [ ] Works on all 5 target platforms (iOS, Android, macOS, Linux, Windows)
- [ ] Unit tests written and passing
- [ ] No TypeScript errors or warnings
- [ ] Accessibility tested
- [ ] Performance benchmarked
- [ ] Documentation updated
- [ ] Code reviewed

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04
