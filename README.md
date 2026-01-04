# EmuZ

<div align="center">
  <h3>🎮 A Daijishou-inspired cross-platform emulator frontend</h3>
  <p>Organize, browse, and launch your retro game collection with style.</p>
</div>

---

## ✨ Features

- 🎮 **Universal Game Library** - Manage ROMs across 100+ retro platforms
- 🏠 **Widget Dashboard** - Daijishou-style home screen with customizable widgets
- 🖼️ **Platform Wallpapers** - Beautiful platform backgrounds like Daijishou
- 🔍 **Smart Scanning** - Automatic ROM detection and organization
- 📊 **Play Tracking** - Track your play time and history
- 📂 **Collections** - Create custom game collections
- 🏷️ **Genres** - Organize games by genre
- ⚡ **Emulator Integration** - Launch games in RetroArch, Dolphin, PCSX2, and more
- 🌍 **Multi-language** - EN, ES, FR, DE, JA, ZH support

## 📱 Platforms

| Platform | Status |
|----------|--------|
| 🖥️ Windows | ✅ Ready |
| 🍎 macOS | ✅ Ready |
| 🐧 Linux | ✅ Ready |
| 🤖 Android | ✅ Ready |
| 📱 iOS | ✅ Ready |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Nx 20.x + pnpm 9.x |
| Desktop | Electron 33.x + Vite |
| Mobile | React Native 0.76+ (Bare Workflow) |
| UI | React 19.x + TailwindCSS 4.x / NativeWind 4.x |
| State | Zustand 5.x + React Query 5.x |
| Database | SQLite (better-sqlite3 / react-native-sqlite-storage) |
| i18n | react-i18next |
| Testing | Vitest |

## 📁 Project Structure

```
emuz/
├── apps/
│   ├── desktop/         # Electron desktop app
│   └── mobile/          # React Native mobile app
├── libs/
│   ├── core/            # Business logic, models, services
│   ├── database/        # SQLite database layer
│   ├── emulators/       # Emulator definitions & detection
│   ├── i18n/            # Internationalization
│   ├── platform/        # Platform-specific adapters
│   └── ui/              # Shared UI components
├── docs/                # Documentation
└── .github/             # CI/CD workflows
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22 LTS
- **pnpm** 9.x
- **Xcode** 15+ (for iOS development)
- **Android Studio** (for Android development)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/emuz.git
cd emuz

# Install dependencies
pnpm install

# Build all packages
pnpm nx run-many -t build
```

### Running Desktop App

```bash
# Development mode
pnpm nx serve desktop

# Build for production
pnpm nx build desktop
```

### Running Mobile App

```bash
# Start Metro bundler
pnpm nx start mobile

# iOS (requires macOS + Xcode)
cd apps/mobile/ios && pod install && cd ..
pnpm nx run-ios mobile

# Android
pnpm nx run-android mobile
```

## 📚 Documentation

- [Architecture](docs/architecture.md) - System design and data flow
- [API Reference](docs/api.md) - Library APIs and interfaces
- [Emulator Integration](docs/emulator-integration.md) - How to add emulators
- [Contributing](docs/contributing.md) - How to contribute

### Specifications

- [Task List](.specify/specs/001-emuz-core/tasks.md) - Implementation roadmap
- [Technical Plan](.specify/specs/001-emuz-core/plan.md) - Architecture details

## 🎮 Supported Emulators

| Emulator | Platforms | Desktop | Mobile |
|----------|-----------|---------|--------|
| RetroArch | 100+ systems | ✅ | ✅ |
| Dolphin | GameCube, Wii | ✅ | ✅ Android |
| PCSX2 | PlayStation 2 | ✅ | ❌ |
| PPSSPP | PSP | ✅ | ✅ |
| mGBA | GBA, GB, GBC | ✅ | ❌ |
| DuckStation | PS1 | ✅ | ✅ Android |
| melonDS | Nintendo DS | ✅ | ✅ Android |
| Citra/Lime3DS | 3DS | ✅ | ✅ Android |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) before submitting a PR.

```bash
# Run tests
pnpm nx run-many -t test

# Run linting
pnpm nx run-many -t lint

# Format code
pnpm prettier --write .
```

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Daijishou](https://github.com/magneticchen/Daijishō) - Inspiration for this project
- [RetroArch](https://www.retroarch.com/) - Emulator integration reference
- [Nx](https://nx.dev/) - Monorepo tooling

---

<div align="center">
  <p>Made with ❤️ for the retro gaming community</p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
