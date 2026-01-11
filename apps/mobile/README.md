# EmuZ Mobile App

This is the React Native mobile application for EmuZ, built with **Expo** and supporting both iOS and Android.

## Prerequisites

- Node.js 22 LTS
- pnpm 9.x
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

## Setup

### Install Dependencies

```bash
# From workspace root
pnpm install

# Install iOS dependencies (after prebuild)
cd apps/mobile
npx expo prebuild
cd ios && pod install && cd ..
```

### Environment Setup

Follow the Expo environment setup guide:
https://docs.expo.dev/get-started/set-up-your-environment/

## Running the App

### Start Metro Bundler

```bash
# From workspace root
pnpm nx start mobile

# Or from mobile directory
cd apps/mobile
pnpm start
```

### Run on iOS

```bash
# Using Expo
npx expo run:ios

# Or with Nx
pnpm nx ios mobile
```

### Run on Android

```bash
# Using Expo
npx expo run:android

# Or with Nx
pnpm nx android mobile
```

## Configuration Notes

### Monorepo Metro Configuration

The app uses a custom `metro.config.js` configured for the pnpm monorepo:

- Uses `expo/metro-config` for Expo compatibility
- Watches the entire workspace for changes
- Resolves `@emuz/*` workspace packages from `libs/`
- Explicitly resolves `react` and `react-native` from project's `node_modules`
- Uses `disableHierarchicalLookup` to avoid module resolution conflicts

### Babel Configuration

Uses `babel-preset-expo` with NativeWind v4 integration:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### App Entry Point

The app uses a custom entry point (`index.js`) registered as `'main'`:

```javascript
import { AppRegistry } from 'react-native';
import App from './src/App';
AppRegistry.registerComponent('main', () => App);
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── App.tsx              # Main app entry
│   ├── global.css           # NativeWind styles
│   ├── navigation/          # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── PlatformsScreen.tsx
│   │   ├── GenresScreen.tsx
│   │   ├── CollectionsScreen.tsx
│   │   ├── GameDetailScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── services/            # Platform services
│   │   ├── FileService.ts
│   │   ├── LauncherService.ts
│   │   ├── StorageService.ts
│   │   └── init.ts
│   ├── providers/           # App providers
│   │   └── AppProviders.tsx
│   └── types/               # TypeScript declarations
│       └── global.d.ts
├── android/                 # Android project
├── ios/                     # iOS project
├── index.js                 # App entry point
├── metro.config.js          # Metro bundler config
├── babel.config.js          # Babel config
├── tailwind.config.js       # NativeWind/Tailwind config
└── app.json                 # App configuration
```

## Features

- **Home Screen**: Daijishou-style widgets (Recent, Favorites, Stats)
- **Library**: Grid view with sorting and filtering
- **Platforms**: Browse by gaming platform with wallpaper support
- **Genres**: Browse by game genre
- **Collections**: User-defined game collections
- **Game Detail**: Full game info with play button
- **Settings**: App configuration
- **Setup Wizard**: First-run experience

## Tech Stack

- React Native 0.81+
- Expo 54+
- React Navigation 7
- NativeWind 4.x (Tailwind CSS)
- Zustand (State Management)
- React Query (Data Fetching)

## Emulator Integration

The app supports launching games in external emulators:

### Android

Uses Intent system to launch games:

- RetroArch
- Dolphin
- PPSSPP
- DuckStation
- And more...

### iOS

Uses URL schemes to launch games:

- RetroArch
- Delta
- PPSSPP
- Provenance

## Building for Release

### iOS

```bash
# Prebuild native project
npx expo prebuild --platform ios

# Build release bundle
npx expo run:ios --configuration Release

# Or archive in Xcode for App Store
```

### Android

```bash
# Prebuild native project
npx expo prebuild --platform android

# Build release APK
cd apps/mobile/android
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease
```

## Testing

```bash
pnpm nx test mobile
```

## License

GPL-3.0
