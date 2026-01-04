# EmuZ Emulator Integration Guide

This guide explains how EmuZ integrates with external emulators to launch games.

## Overview

EmuZ does not include any emulation code itself. Instead, it acts as a frontend that:
1. Organizes your ROM library
2. Detects installed emulators
3. Launches games using the appropriate emulator

## Supported Emulators

### Multi-System Emulators

#### RetroArch
**Platforms**: Windows, macOS, Linux, Android, iOS

RetroArch is a frontend for multiple emulator cores. EmuZ supports:
- Auto-detection on all platforms
- Core selection based on game platform
- Custom core paths

**Command Template**:
```
{executable} -L {core} "{rom}"
```

### Console-Specific Emulators

#### Dolphin (GameCube/Wii)
**Platforms**: Windows, macOS, Linux, Android

**Desktop Command**:
```
{executable} -e "{rom}"
```

**Android**: Launched via Intent
```java
Intent intent = new Intent(Intent.ACTION_VIEW);
intent.setDataAndType(romUri, "application/octet-stream");
intent.setPackage("org.dolphinemu.dolphinemu");
```

#### PCSX2 (PlayStation 2)
**Platforms**: Windows, macOS, Linux

**Command**:
```
{executable} "{rom}"
```

#### mGBA (Game Boy / Game Boy Advance)
**Platforms**: Windows, macOS, Linux

**Command**:
```
{executable} "{rom}"
```

#### DeSmuME / melonDS (Nintendo DS)
**Platforms**: Windows, macOS, Linux

**melonDS Command**:
```
{executable} "{rom}"
```

#### PPSSPP (PlayStation Portable)
**Platforms**: Windows, macOS, Linux, Android, iOS

**Desktop Command**:
```
{executable} "{rom}"
```

**Mobile**: URL scheme `ppsspp://` or Intent

#### Citra / Lime3DS (Nintendo 3DS)
**Platforms**: Windows, macOS, Linux, Android

**Command**:
```
{executable} "{rom}"
```

#### DuckStation (PlayStation 1)
**Platforms**: Windows, macOS, Linux, Android

**Command**:
```
{executable} "{rom}"
```

## Adding a Custom Emulator

### Desktop (Electron)

1. Go to **Settings → Emulators**
2. Click **Add Emulator**
3. Fill in the details:
   - **Name**: Display name
   - **Executable**: Path to the emulator binary
   - **Platforms**: Which game platforms it supports
   - **Command Template**: How to launch (see below)

### Mobile

On mobile, emulators must be installed from app stores. EmuZ detects them automatically.

#### Android
Uses Intent system to launch games:
```kotlin
val intent = Intent(Intent.ACTION_VIEW).apply {
    setDataAndType(romUri, mimeType)
    setPackage(packageName)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
startActivity(intent)
```

#### iOS
Uses URL schemes to launch games:
```swift
if let url = URL(string: "retroarch://rom?path=\(encodedPath)") {
    UIApplication.shared.open(url)
}
```

## Command Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{executable}` | Path to emulator | `/usr/bin/retroarch` |
| `{rom}` | Path to ROM file | `/games/mario.nes` |
| `{core}` | RetroArch core path | `/cores/nestopia.so` |
| `{saves}` | Save directory | `/saves/nes` |
| `{config}` | Config file path | `/config/retroarch.cfg` |

### Example Templates

**RetroArch (with core)**:
```
{executable} -L {core} "{rom}"
```

**RetroArch (fullscreen)**:
```
{executable} -L {core} -f "{rom}"
```

**Dolphin (GameCube)**:
```
{executable} -e "{rom}"
```

**Generic emulator**:
```
{executable} "{rom}"
```

## Auto-Detection

EmuZ automatically detects installed emulators by checking:

### Windows
- Common installation paths
- Registry entries
- PATH environment variable

```
%APPDATA%\RetroArch\
%PROGRAMFILES%\RetroArch\
%PROGRAMFILES%\Dolphin\
C:\Users\*\scoop\apps\retroarch\
```

### macOS
- Applications folder
- Homebrew installations

```
/Applications/RetroArch.app
/Applications/Dolphin.app
/opt/homebrew/bin/
~/Applications/
```

### Linux
- System binaries
- Flatpak installations
- AppImage locations

```
/usr/bin/retroarch
/usr/bin/dolphin-emu
~/.local/share/flatpak/
~/.local/bin/
```

### Android
Queries for installed packages:
```kotlin
val packages = listOf(
    "com.retroarch",
    "com.retroarch.aarch64",
    "org.dolphinemu.dolphinemu",
    "org.ppsspp.ppsspp",
    "org.duckstation.duckstation",
    // ... more
)
```

### iOS
Checks for registered URL schemes:
```swift
let schemes = ["retroarch", "delta", "ppsspp", "provenance"]
for scheme in schemes {
    if UIApplication.shared.canOpenURL(URL(string: "\(scheme)://")!) {
        // Emulator is installed
    }
}
```

## Platform-to-Core Mapping (RetroArch)

| Platform | Recommended Core | Alternative |
|----------|------------------|-------------|
| NES | nestopia | fceumm |
| SNES | snes9x | bsnes |
| Game Boy | gambatte | mgba |
| Game Boy Color | gambatte | mgba |
| Game Boy Advance | mgba | vba-m |
| N64 | mupen64plus | parallel-n64 |
| Genesis/Mega Drive | genesis_plus_gx | picodrive |
| Master System | genesis_plus_gx | picodrive |
| Game Gear | genesis_plus_gx | gearsystem |
| PS1 | beetle_psx_hw | pcsx_rearmed |
| PSP | ppsspp | - |
| Arcade | fbneo | mame |
| Atari 2600 | stella | - |
| Atari 7800 | prosystem | - |

## Troubleshooting

### Game doesn't launch

1. **Check emulator path**: Verify the executable exists
2. **Check ROM path**: Ensure no special characters in path
3. **Check permissions**: Emulator may need file access permissions
4. **Check command template**: Test manually in terminal

### Wrong emulator opens

1. Go to **Settings → Emulators**
2. Set the correct **default emulator** for the platform
3. Or right-click game → **Open with** → Choose emulator

### Android: "No app found"

1. Ensure the emulator is installed from Play Store
2. Check if the emulator supports file opening via Intent
3. Try a different emulator for the platform

### iOS: "Cannot open URL"

1. Ensure the emulator is installed (may require AltStore/sideloading)
2. Check the URL scheme is correct
3. Some emulators may not support URL schemes

## Adding New Emulator Definitions

To add a new emulator to the registry:

1. Create a definition in `libs/emulators/src/registry/`:

```typescript
// libs/emulators/src/registry/myemulator.ts
import type { EmulatorDefinition } from './types';

export const myEmulator: EmulatorDefinition = {
  id: 'myemulator',
  name: 'My Emulator',
  description: 'An emulator for XYZ console',
  platformIds: ['xyz'],
  hostPlatforms: ['windows', 'macos', 'linux'],
  website: 'https://myemulator.org',
  commandTemplate: '{executable} "{rom}"',
  defaultPaths: {
    windows: ['C:\\Program Files\\MyEmulator\\myemu.exe'],
    macos: ['/Applications/MyEmulator.app/Contents/MacOS/myemu'],
    linux: ['/usr/bin/myemu'],
  },
  androidPackages: ['com.myemulator.app'],
  iosUrlScheme: 'myemu',
};
```

2. Register in `libs/emulators/src/registry/index.ts`

3. Rebuild the library:
```bash
pnpm nx build emulators
```

## API Reference

### LaunchService

```typescript
// Get available emulators for a platform
const emulators = await launchService.getEmulators({ platformId: 'nes' });

// Launch a game
await launchService.launchGame(game, emulatorId?);

// Set default emulator
await launchService.setDefaultEmulator(emulatorId, platformId);
```

### EmulatorRegistry

```typescript
import { getEmulatorById, searchEmulators } from '@emuz/emulators';

// Get emulator definition
const retroarch = getEmulatorById('retroarch');

// Search emulators
const gbaEmulators = searchEmulators({ 
  platformId: 'gba',
  hostPlatform: 'linux'
});
```
