# EmuZ - Clarifications Document

## Feature: 001-emuz-core
## Created: 2026-01-04
## Status: Clarified

---

## Summary of Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Metadata source | **E - Hybrid** (local + online) |
| 2 | Priority emulators | **RetroArch cores** (like Daijishou) |
| 3 | Priority platform | **D - All platforms in parallel** |
| 4 | Mobile ROM access | **B - External folder selection** |
| 5 | UI Style | **Daijishou Style** (Media Center gaming) |
| 6 | Mobile launching | **URL Schemes** |
| 7 | V1.0 Scope | **No additional features** |
| 8 | Branding | **EmuZ** - Green - "Yet another emulators and ROMs management front-end" |

### Technical Clarifications (Implementation Phase)

| # | Question | Decision |
|---|----------|----------|
| 9 | React Native Workflow | **Bare Workflow** (full control, native modules) |
| 10 | Package naming | `@emuz/core`, `@emuz/database`, `@emuz/mobile`, `@emuz/desktop`, `@emuz/ui` |
| 11 | UI Framework | **NativeWind** (Tailwind CSS for React Native) |
| 12 | Minimum OS versions | **LTS - 2 major versions** (see details) |
| 13 | Testing framework | **Vitest** + RNTL + **Detox** (mobile E2E) + **Playwright** (desktop E2E) |
| 14 | CI/CD | **GitHub Actions** - Automated builds |
| 15 | Emulator config | **Economic solution** (embedded JSON files) |
| 16 | Offline metadata | **Download on first launch** |
| 17 | Node.js Version | **Node 22 LTS** |
| 18 | GitHub repo name | **emuz** |
| 19 | License | **GPL-3.0** (copyleft) |
| 20 | Metadata hosting | **GitHub Releases** |
| 21 | Monorepo Tool | **Nx** (existing experience) |
| 22 | Package Manager | **pnpm** (with node-linker=hoisted) |
| 23 | Documentation language | **English** (all docs, code, tests, comments) |
| 24 | i18n Framework | **react-i18next** (UI default: English) |

---

## Detailed Clarifications

### 1. Metadata - Hybrid Approach

**Decision**: Local database + online scraping

- **Local database**: Embed a pre-filled database with the most common games
- **Online fallback**: ScreenScraper API for games not found locally
- **Aggressive caching**: Once scraped, store locally permanently
- **Offline mode**: Full functionality without internet

### 2. Platforms/Emulators - RetroArch/Daijishou Style

**Decision**: Support all Daijishou platforms (~100+ systems)

#### Priority Platforms (categories)

| Category | Systems |
|----------|---------|
| **Nintendo Portables** | Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Nintendo 3DS |
| **Nintendo Consoles** | NES, SNES, Nintendo 64, GameCube, Wii, Wii U, Switch |
| **Sony Portables** | PSP, PS Vita |
| **Sony Consoles** | PlayStation, PlayStation 2, PlayStation 3 |
| **Sega Portables** | Game Gear |
| **Sega Consoles** | Master System, Genesis/Mega Drive, Saturn, Dreamcast, 32X, Sega CD |
| **Atari** | 2600, 5200, 7800, Lynx, Jaguar |
| **NEC** | TurboGrafx-16, PC Engine, PC-FX |
| **SNK** | Neo Geo, Neo Geo Pocket, Neo Geo CD |
| **Arcade** | MAME, FinalBurn Neo, CPS1/2/3, Atomiswave, NAOMI |
| **Computers** | DOS, Amiga, Commodore 64, MSX, Amstrad CPC, ZX Spectrum |
| **Other** | WonderSwan, Vectrex, 3DO, Virtual Boy, etc. |

#### Player Configuration (like Daijishou)

Each platform defines:
- Supported file extensions (regex)
- Launch commands (templates)
- Default arguments
- Compatible emulators (RetroArch cores + standalone)

### 3. Multi-Platform Simultaneous Development

**Decision**: All platforms in parallel

**Architecture to support this**:
```
libs/
├── core/          # 100% shared
├── ui/            # 95% shared (react-native-web)
├── database/      # Adapters per platform
├── emulators/     # Shared definitions, specific launchers
└── platform/      # Specific services (filesystem, launchers)
```

### 4. Mobile File Access

**Decision**: External folder selection

**Android**:
- Use Storage Access Framework (SAF)
- Allow selecting any folder
- Persist URI permissions

**iOS**:
- Access to app's Documents folder
- Import from Files app
- Sandboxing limitations accepted

### 5. User Interface - Daijishou Style

**Decision**: Reproduce the Daijishou experience

#### Key UI Features:

| Feature | Description |
|---------|-------------|
| **Widget Page** | Customizable home page with widgets (recent, favorites, RSS, stats) |
| **Platform View** | System list with custom wallpapers |
| **Library** | Game grid with box arts, sorting/filters |
| **Detail View** | Full game info (screenshots, description, stats) |
| **Genres** | Genre-based navigation |
| **Global Search** | Instant search across entire library |
| **Themes** | Customizable colors, wallpaper packs |

#### Main Layout:

```
┌─────────────────────────────────────────────────┐
│  [☰]  EmuZ                    [🔍] [⚙️]        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Widget  │ │ Widget  │ │ Widget  │  WIDGETS  │
│  │ Recent  │ │Favorites│ │  Stats  │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  ═══════════════════════════════════════════   │
│                                                 │
│  PLATFORMS                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ NES │ │SNES │ │ GB  │ │ GBA │ │ N64 │ ...  │
│  │     │ │     │ │     │ │     │ │     │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                 │
├────────┬────────┬────────┬────────┬────────────┤
│  🏠    │  📚   │  🎮   │  🔍   │     ⚙️       │
│  Home  │Platfor│ Genres │ Search │  Settings  │
└────────┴────────┴────────┴────────┴────────────┘
```

### 6. Emulator Launching

**Decision**: URL Schemes / Intent

#### Android
```kotlin
// Intent for RetroArch
Intent intent = new Intent(Intent.ACTION_VIEW);
intent.setData(Uri.parse("retroarch://run?rom=/path/to/rom.nes&core=nestopia"));

// Generic intent
intent.setClassName("com.retroarch", "com.retroarch.browser.retroactivity.RetroActivityFuture");
intent.putExtra("ROM", romPath);
intent.putExtra("LIBRETRO", corePath);
```

#### iOS
```
retroarch://run?rom=<path>&core=<core>
delta://game/<rom_path>
provenance://play?file=<path>
```

#### Desktop (macOS/Linux/Windows)
```bash
# Direct execution
/path/to/retroarch -L /cores/nestopia.so "/roms/game.nes"
/Applications/Dolphin.app/Contents/MacOS/Dolphin -e "/roms/game.iso"
```

### 7. V1.0 Scope

**Features confirmed for V1.0**:

✅ Included:
- Library management (scan, organization, collections)
- Metadata scraping (hybrid)
- Emulator launching (URL schemes + direct)
- Daijishou-style interface (widgets, platforms, search)
- 100+ platform support
- 5 OS (iOS, Android, macOS, Linux, Windows)
- Themes and color customization
- Full offline mode

❌ Excluded (future):
- Cloud synchronization
- Achievements/RetroAchievements
- Netplay/Multiplayer
- Streaming
- Native OS widgets
- Bluetooth controller integration

### 8. Branding

| Element | Value |
|---------|-------|
| **Name** | EmuZ |
| **Slogan** | "Yet another emulators and ROMs management front-end" |
| **Primary Color** | Green (#10B981 - Emerald 500) |
| **Secondary Color** | Dark Green (#059669 - Emerald 600) |
| **Background** | Dark (#0F172A - Slate 900) |
| **Accent** | Light Green (#34D399 - Emerald 400) |

#### Complete Palette

```css
:root {
  --color-primary: #10B981;      /* Primary green */
  --color-primary-light: #34D399; /* Light green (hover) */
  --color-primary-dark: #059669;  /* Dark green */
  
  --color-bg-primary: #0F172A;   /* Primary background */
  --color-bg-secondary: #1E293B; /* Card background */
  --color-bg-tertiary: #334155;  /* Hover background */
  
  --color-text-primary: #F8FAFC;  /* Primary text */
  --color-text-secondary: #94A3B8; /* Secondary text */
  
  --color-border: #334155;        /* Borders */
  --color-success: #22C55E;       /* Success */
  --color-error: #EF4444;         /* Error */
}
```

---

## Technical Clarifications (Detailed)

### 9. React Native - Bare Workflow

**Decision**: Bare Workflow (non-Expo)

**Justification**:
- Full access to native modules (SQLite, SAF, URL Schemes)
- Complete control over Gradle/Xcode configuration
- Better integration with native emulators
- No Expo limitations for deep links

**Implications**:
- Requires Xcode for iOS
- Manual native module configuration
- More flexibility for optimizations

### 10. Monorepo Package Naming

**Decision**: `@emuz` scope

```
libs/
├── core/          → @emuz/core
├── database/      → @emuz/database  
├── ui/            → @emuz/ui
├── platform/      → @emuz/platform
├── emulators/     → @emuz/emulators
apps/
├── mobile/        → @emuz/mobile (private)
├── desktop/       → @emuz/desktop (private)
```

### 11. UI Framework - NativeWind

**Decision**: NativeWind v4+

**Advantages**:
- Familiar Tailwind CSS syntax
- Theming via CSS variables
- Native dark mode support
- Compatible with react-native-web
- Optimal performance (static compilation)

**Configuration**:
```js
// tailwind.config.js
module.exports = {
  content: [
    "./apps/**/*.{js,jsx,ts,tsx}",
    "./libs/ui/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        background: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155',
        }
      }
    }
  }
}
```

### 12. Minimum OS Versions

**Rule**: LTS - 2 major versions (as of January 2026)

| Platform | Minimum Version | Justification |
|----------|-----------------|---------------|
| **iOS** | 15.0+ | iOS 17 current → -2 = iOS 15 |
| **Android** | API 28 (9.0)+ | Android 14 current → -2 ≈ Android 9 |
| **macOS** | 12.0 (Monterey)+ | macOS 15 current → -2 = macOS 12 |
| **Windows** | 10 (21H2)+ | Windows 11 current → -1 = Win 10 |
| **Linux** | Ubuntu 22.04 LTS+ | Two recent LTS versions |

**Technical Implications**:
- Android: `minSdkVersion = 28`
- iOS: `IPHONEOS_DEPLOYMENT_TARGET = 15.0`
- Electron: Chromium compatible with these OS

### 13. Testing Framework

**Testing Stack**:

| Level | Tool | Usage |
|-------|------|-------|
| **Unit** | Vitest | Fast unit tests |
| **Integration** | Vitest + RNTL | React Native components |
| **E2E Mobile** | Detox | Automated iOS/Android tests |
| **E2E Desktop** | Playwright | Automated Electron tests |

**Vitest Configuration**:
```ts
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      threshold: { lines: 80 }
    }
  }
})
```

### 14. CI/CD - GitHub Actions

**Decision**: Automated builds on PR and main push

**Pipelines**:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  build-android:
    needs: lint-test
    runs-on: ubuntu-latest
    # Build APK for tests

  build-ios:
    needs: lint-test
    runs-on: macos-latest
    # Build for TestFlight (optional)

  build-desktop:
    needs: lint-test
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    # Build Electron per OS
```

**No automatic release** (for now - resource conservation)

### 15. Emulator Configuration - Economic Solution

**Decision**: JSON files embedded in the app

**Approach**:
1. Manually create config files for 100+ platforms
2. Use Daijishou configs as inspiration (open source)
3. Store in `@emuz/emulators/data/platforms/`
4. Allow community contributions via GitHub

**Structure**:
```json
// platforms/nintendo/nes.json
{
  "id": "nes",
  "name": "Nintendo Entertainment System",
  "shortName": "NES",
  "manufacturer": "Nintendo",
  "year": 1983,
  "generation": 3,
  "extensions": [".nes", ".fds", ".unf", ".unif"],
  "players": [
    {
      "id": "retroarch-nestopia",
      "name": "RetroArch (Nestopia)",
      "package": "com.retroarch",
      "core": "nestopia_libretro",
      "platforms": ["android", "ios", "desktop"]
    },
    {
      "id": "retroarch-fceumm",
      "name": "RetroArch (FCEUmm)",
      "package": "com.retroarch",
      "core": "fceumm_libretro",
      "platforms": ["android", "ios", "desktop"]
    }
  ],
  "scraper": {
    "screenscraper_id": 3,
    "igdb_platform_id": 18
  }
}
```

**Cost**: $0 (manual initial work, community contributions)

### 16. Metadata - First Launch Download

**Decision**: Database downloaded on first launch

**Implementation**:
```
1. First launch → "Downloading metadata..." screen
2. Download metadata.db.gz (~50-100 MB compressed)
3. Decompress to app data folder
4. Monthly incremental updates (optional)
```

**Advantages**:
- Lightweight app download
- Always up-to-date database
- Skip option (offline mode)

**Metadata Source**:
- Generate from public dumps (ScreenScraper, No-Intro DATs)
- Host on GitHub Releases (free)
- Alternative: Free CDN (Cloudflare R2 free tier)

---

## Final Clarifications

### 17. Node.js Version

**Decision**: Node 22 LTS

- Support until April 2027
- Latest ES2024 features
- Compatible with pnpm 9+, Nx, Vitest

### 18. GitHub Repo Name

**Decision**: `emuz`

- URL: `github.com/<username>/emuz`
- Simple and memorable
- Matches project name

### 19. Open Source License

**Decision**: GPL-3.0

**Justification**:
- Consistent with RetroArch ecosystem (GPL)
- Ensures derivatives remain open source
- Protection against commercial appropriation
- Emulation community is mostly GPL

**Implications**:
- All forks must remain GPL-3.0
- Source code must be distributed with binaries
- Compatible with most libraries (verify Electron)

### 20. Metadata Database Hosting

**Decision**: GitHub Releases

**Implementation**:
```
Repository: github.com/<username>/emuz-metadata
Releases:
  - v2026.01 → metadata-2026-01.db.gz (estimated ~50-100MB)
  - v2026.02 → metadata-2026-02.db.gz
  - ...
```

**Advantages**:
- Free (2GB per release, unlimited releases)
- GitHub global CDN
- Natural versioning
- No server maintenance

**Download URL**:
```
https://github.com/<username>/emuz-metadata/releases/latest/download/metadata.db.gz
```

### 21. Monorepo Tool - Nx

**Decision**: Nx

**Justification**:
- User's existing experience with Nx
- Official React Native plugins (`@nx/react-native`)
- Excellent integration with pnpm
- Generators for quick lib/app creation
- Remote caching via Nx Cloud (free for open source)
- Dependency graph visualization

**Plugins Used**:

| Plugin | Usage |
|--------|-------|
| `@nx/react-native` | Mobile app |
| `@nx/react` | Desktop components (Electron renderer) |
| `@nx/js` | Shared TypeScript libraries |
| `@nx/vite` | Electron renderer build |
| `@nx/eslint` | Linting configuration |
| `nx-electron` (community) | Electron support |

**Nx Cloud Configuration** (optional):
```bash
# Enable remote caching (free for open source projects)
npx nx connect
```

### 22. Package Manager - pnpm with hoisting

**Decision**: pnpm with `node-linker=hoisted`

**Required Configuration** (`.npmrc`):
```ini
node-linker=hoisted
shamefully-hoist=true
```

**Justification**:
- Significant disk space savings
- Compatible with React Native when hoisted
- Nx handles dependency resolution
- Faster commands than npm/yarn

**Key Commands**:
```bash
# Installation
pnpm install

# Add dependency to a project
pnpm add <package> --filter @emuz/core

# Update
pnpm update -r
```

### 23. Documentation Language - English

**Decision**: All English

**Scope**:
- All documentation (README, docs/, .specify/)
- Code comments
- Variable/function names
- Git commit messages
- Test descriptions
- Error messages

**Rationale**:
- Universal accessibility
- Open source best practices
- Easier contributions from global community

### 24. Internationalization - react-i18next

**Decision**: react-i18next

**Configuration**:
```typescript
// libs/i18n/src/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'games', 'settings', 'platforms'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**Structure**:
```
libs/
└── i18n/
    └── src/
        ├── index.ts
        └── locales/
            ├── en/
            │   ├── common.json
            │   ├── games.json
            │   ├── settings.json
            │   └── platforms.json
            ├── fr/
            ├── es/
            ├── de/
            ├── ja/
            └── zh/
```

**Usage**:
```tsx
import { useTranslation } from 'react-i18next';

function GameCard({ game }) {
  const { t } = useTranslation('games');
  
  return (
    <View>
      <Text>{t('playCount', { count: game.playCount })}</Text>
      <Button title={t('actions.launch')} />
    </View>
  );
}
```

**Default Language**: English (en)

**Initial Languages for V1.0**:
- English (en) - Default
- French (fr)
- Spanish (es)
- German (de)
- Japanese (ja)
- Chinese Simplified (zh-CN)

---

## Updated User Stories

### US-6.1: Widget System
**As a** user  
**I want to** customize my home screen with widgets  
**So that** I can have quick access to my favorite content

**Acceptance Criteria:**
- [ ] Recent games widget
- [ ] Favorites widget  
- [ ] Statistics widget (time played, games count)
- [ ] Platform shortcuts widget
- [ ] Widgets are draggable/reorderable
- [ ] Widget size options

### US-6.2: Platform Wallpapers
**As a** user  
**I want to** have custom wallpapers for each platform  
**So that** the interface reflects the aesthetic of each console

**Acceptance Criteria:**
- [ ] Default wallpaper per platform
- [ ] User can set custom wallpaper
- [ ] Wallpaper packs downloadable
- [ ] Blur/overlay options

### US-6.3: Genre Navigation
**As a** user  
**I want to** browse games by genre  
**So that** I can discover games based on my mood

**Acceptance Criteria:**
- [ ] Genre list with game counts
- [ ] Genre assigned from metadata
- [ ] Manual genre override
- [ ] Multi-genre support per game

---

## Architecture Impact

### New Packages Required

```
libs/
├── core/
│   └── src/
│       ├── services/
│       │   └── WidgetService.ts     # NEW
│       └── models/
│           └── Widget.ts            # NEW
├── ui/
│   └── src/
│       └── components/
│           ├── widgets/             # NEW
│           │   ├── RecentGamesWidget.tsx
│           │   ├── FavoritesWidget.tsx
│           │   └── StatsWidget.tsx
│           └── PlatformCard/        # With wallpaper support
├── i18n/                            # NEW PACKAGE
│   └── src/
│       ├── index.ts
│       └── locales/
│           ├── en/
│           └── ...
└── platform/                        # NEW PACKAGE
    └── src/
        ├── filesystem/
        │   ├── android.ts           # SAF implementation
        │   ├── ios.ts               # Documents + Files
        │   └── desktop.ts           # Native FS
        └── launcher/
            ├── android.ts           # Intent system
            ├── ios.ts               # URL schemes
            └── desktop.ts           # Process spawn
```

### Updated DB Schema

```sql
-- Widgets table
CREATE TABLE widgets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'recent', 'favorites', 'stats', 'platform', 'custom'
    position INTEGER NOT NULL,
    size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'
    config TEXT, -- JSON configuration
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Platform wallpapers
ALTER TABLE platforms ADD COLUMN wallpaper_path TEXT;
ALTER TABLE platforms ADD COLUMN wallpaper_blur INTEGER DEFAULT 0;
```

---

## Next Steps

1. ✅ Clarifications documented (1-8)
2. ✅ Technical clarifications documented (9-16)
3. ✅ Final clarifications documented (17-24)
4. ✅ plan.md updated with final tech stack
5. ⬜ Start Phase 1 implementation
