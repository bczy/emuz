# EmuZ Mobile App

> React Native 0.81 + Expo 54 application: EmuZ emulator frontend for iOS and Android, styled with NativeWind 4 and navigated with React Navigation 7.

## Boundaries

### Owns

- React Native screens and navigation (React Navigation 7 stack + bottom tabs)
- App root (`index.js`, `App.tsx`, `AppProviders`)
- Metro bundler configuration for pnpm monorepo workspace resolution
- Babel configuration (NativeWind + Expo preset)
- NativeWind/Tailwind configuration
- First-run setup wizard
- Mobile platform service adapters (`FileService`, `LauncherService`, `StorageService`)

### Delegates

- Business logic (library, scan, launch) → `@emuz/core` services and stores
- Database access → `@emuz/database` mobile adapter (`react-native-sqlite-storage`)
- File I/O → `@emuz/platform` mobile adapters
- Shared UI components → `@emuz/ui`
- Emulator definitions → `@emuz/emulators`
- Translations → `@emuz/i18n`

## Integration Map

### Internal dependencies

| Package           | Used for                                               |
| ----------------- | ------------------------------------------------------ |
| `@emuz/core`      | All services + Zustand stores + model types            |
| `@emuz/database`  | `createMobileAdapter` — SQLite on-device storage       |
| `@emuz/platform`  | `createMobileFSAdapter`, `createMobileLauncherAdapter` |
| `@emuz/ui`        | All shared screen components                           |
| `@emuz/emulators` | Emulator registry for launch target selection          |
| `@emuz/i18n`      | `I18nProvider`, `useTranslation`                       |

### Depended by

_Top-level application — nothing depends on `apps/mobile`._

### External dependencies

| Package                         | Version | Role                                      |
| ------------------------------- | ------- | ----------------------------------------- |
| `react-native`                  | `^0.81` | Cross-platform mobile runtime             |
| `expo`                          | `^54.x` | Dev tooling, build system, managed config |
| `@react-navigation/native`      | `^7.x`  | Navigation container                      |
| `@react-navigation/bottom-tabs` | `^7.x`  | Bottom tab navigator                      |
| `nativewind`                    | `^4.x`  | Tailwind utility classes for React Native |
| `react-native-sqlite-storage`   | `^6.x`  | On-device SQLite (via `@emuz/database`)   |

## Usage

### Command line

```bash
# Install dependencies (from workspace root)
pnpm install

# iOS: install native dependencies
cd apps/mobile && npx expo prebuild && cd ios && pod install && cd ../..

# Start Metro bundler
pnpm nx start mobile

# Run on iOS simulator
pnpm nx run-ios mobile
# Or: npx expo run:ios

# Run on Android emulator
pnpm nx run-android mobile
# Or: npx expo run:android

# Run tests
pnpm nx test mobile

# Lint
pnpm nx lint mobile

# Build for production (iOS)
npx expo prebuild --platform ios
npx expo run:ios --configuration Release

# Build for production (Android APK)
cd apps/mobile/android && ./gradlew assembleRelease

# Build for production (Android AAB — Play Store)
cd apps/mobile/android && ./gradlew bundleRelease
```

### Prerequisites

- Node.js 22 LTS
- pnpm 9.x
- Xcode 15+ (iOS builds only)
- Android Studio with SDK (Android builds only)
- CocoaPods (iOS builds only)

## Project Structure

```
apps/mobile/
├── src/
│   ├── App.tsx              # React root — wraps I18nProvider, AppProviders
│   ├── global.css           # NativeWind base styles
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/             # One file per screen
│   │   ├── HomeScreen.tsx         # Daijishou-style widget dashboard
│   │   ├── LibraryScreen.tsx      # Game grid with sort/filter (platform, genre, romType)
│   │   ├── PlatformsScreen.tsx
│   │   ├── GenresScreen.tsx
│   │   ├── CollectionsScreen.tsx
│   │   ├── GameDetailScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Mobile-specific adapter wiring
│   │   ├── FileService.ts
│   │   ├── LauncherService.ts
│   │   ├── StorageService.ts
│   │   └── init.ts          # Bootstrap: create adapters, initialize DB
│   └── providers/
│       └── AppProviders.tsx # Zustand, React Query, I18n, Navigation providers
├── android/
├── ios/
├── index.js                 # AppRegistry entry point
├── metro.config.js          # Monorepo-aware Metro config
├── babel.config.js          # NativeWind + Expo Babel preset
└── tailwind.config.js
```

## Emulator Launch

### Android (Intent system)

Games are launched via Android package intents: RetroArch, Dolphin, PPSSPP, DuckStation. Intent package names are sourced from `@emuz/emulators` `EmulatorDefinition.androidPackages`.

### iOS (URL schemes)

Games are launched via URL schemes: RetroArch (`retroarch://`), Delta (`delta://`), PPSSPP (`ppsspp://`), Provenance. URL schemes are sourced from `@emuz/emulators` `EmulatorDefinition.iosUrlScheme`.

## Anti-Patterns

| ❌ Do NOT                                                 | ✅ Do instead                                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Put business logic in screens or navigation               | Business logic belongs in `@emuz/core` services; screens only call hooks                     |
| Import `@emuz/database` directly in screens               | Database access goes through `@emuz/core` services                                           |
| Use hardcoded colors in `StyleSheet.create`               | Use NativeWind `className` with design token classes                                         |
| Use `import fs from 'fs'` or Node.js APIs                 | React Native has no Node.js — use `@emuz/platform` mobile adapters                           |
| Configure Metro to use `disableHierarchicalLookup: false` | The monorepo requires `disableHierarchicalLookup: true` to prevent duplicate React instances |

## Constraints

- No Node.js APIs — React Native runs in a JS engine without Node
- All `@emuz/*` workspace packages must be resolved through Metro's `watchFolders` configuration
- `react` and `react-native` must resolve from the app's `node_modules` (not hoisted) — enforced by `extraNodeModules` in Metro config
- NativeWind requires `jsxImportSource: 'nativewind'` in Babel preset — do not remove it
- Minimum supported: iOS 16, Android API 26

## See Also

- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
- Emulator integration guide: [docs/emulator-integration.md](../../docs/emulator-integration.md)
- Contributing guide: [docs/contributing.md](../../docs/contributing.md)
