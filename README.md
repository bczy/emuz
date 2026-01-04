# EmuZ

A cross-platform emulator frontend for managing and playing your retro game collection.

## Overview

EmuZ is an open-source emulator frontend inspired by [Daijishou](https://github.com/magneticchen/Daijishō), designed to work seamlessly across all major platforms:

- 📱 **Mobile**: iOS & Android
- 🖥️ **Desktop**: macOS, Linux & Windows

## Features

- 🎮 **Universal Game Library** - Manage ROMs across 100+ retro platforms
- 🔍 **Smart Metadata** - Automatic game info, covers, and descriptions
- 🎨 **Customizable UI** - Widgets, themes, and personalized layouts
- 📂 **Collection Management** - Favorites, playlists, and genre organization
- ⚡ **Emulator Integration** - Launch games directly in your preferred emulator
- 🔄 **Cloud Sync** - Sync your library across devices
- 🌍 **Internationalization** - Multi-language support (EN, FR, ES, DE, JA, ZH)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Monorepo | Nx 20.x + pnpm |
| Mobile | React Native 0.76+ (Bare Workflow) |
| Desktop | Electron 33+ |
| Styling | NativeWind 4.x (Tailwind CSS) |
| State | Zustand 5.0+ |
| Database | SQLite |
| i18n | react-i18next |
| Testing | Vitest + Detox + Playwright |

## Project Structure

```
emuz/
├── apps/
│   ├── mobile/          # React Native app (iOS/Android)
│   ├── desktop/         # Electron app (macOS/Linux/Windows)
│   └── web/             # Web dashboard (optional)
├── libs/
│   ├── core/            # Business logic & services
│   ├── database/        # SQLite schemas & migrations
│   ├── ui/              # Shared UI components
│   ├── i18n/            # Internationalization
│   └── metadata/        # Game metadata providers
└── tools/               # Build & dev scripts
```

## Getting Started

### Prerequisites

- Node.js 22 LTS
- pnpm 9.x
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/emuz.git
cd emuz

# Install dependencies
pnpm install

# Run mobile app (iOS)
pnpm nx run mobile:run-ios

# Run mobile app (Android)
pnpm nx run mobile:run-android

# Run desktop app
pnpm nx run desktop:serve
```

## Documentation

Detailed specifications are available in the `.specify/` directory:

- [Constitution](.specify/memory/constitution.md) - Project principles
- [Specifications](.specify/specs/001-emuz-core/spec.md) - Functional requirements
- [Technical Plan](.specify/specs/001-emuz-core/plan.md) - Architecture details
- [Tasks](.specify/specs/001-emuz-core/tasks.md) - Implementation roadmap

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Daijishou](https://github.com/magneticchen/Daijishō) - Inspiration for this project
- [RetroArch](https://www.retroarch.com/) - Emulator integration reference
- [IGDB](https://www.igdb.com/) - Game metadata API
