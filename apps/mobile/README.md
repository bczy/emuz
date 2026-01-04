# EmuZ Mobile App

This is the React Native mobile application for EmuZ, supporting both iOS and Android.

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

# Install iOS dependencies
cd apps/mobile/ios
pod install
```

### Environment Setup

Follow the React Native environment setup guide:
https://reactnative.dev/docs/environment-setup

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
pnpm nx run-ios mobile

# Or with specific device
pnpm nx run-ios mobile -- --simulator="iPhone 15 Pro"
```

### Run on Android

```bash
pnpm nx run-android mobile
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

- React Native 0.76+
- React Navigation 7
- NativeWind (Tailwind CSS)
- Zustand (State Management)
- React Query (Data Fetching)
- expo-linking (URL Schemes)

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
# Build release bundle
pnpm nx build-ios mobile

# Archive in Xcode
```

### Android

```bash
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
