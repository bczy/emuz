# EmuZ — Deployment Guide

Generated: 2026-03-19 | Source: exhaustive scan of CI/CD, electron-builder.yml, app configs

---

## Desktop (Electron) — Build & Release

### Local development build

```bash
pnpm nx build desktop
# Output: apps/desktop/dist/
#   dist/main/index.js         (main process)
#   dist/preload/index.js      (preload)
#   dist/renderer/index.html   (React SPA)
```

### Distribution packages

```bash
# All platforms (run on the target OS)
pnpm nx package desktop

# Platform-specific
pnpm nx package:mac desktop     # → .dmg + .zip (x64 + arm64)
pnpm nx package:win desktop     # → .exe (NSIS installer) + portable (x64)
pnpm nx package:linux desktop   # → .AppImage + .deb (x64)
```

**Output directory:** `apps/desktop/release/`

### electron-builder configuration (`apps/desktop/electron-builder.yml`)

| Setting         | Value                                               |
| --------------- | --------------------------------------------------- |
| App ID          | `com.emuz.app`                                      |
| Product name    | `EmuZ`                                              |
| Artifact naming | `EmuZ-{version}-{os}-{arch}.{ext}`                  |
| macOS targets   | DMG + ZIP (x64 + arm64 universal)                   |
| Windows targets | NSIS installer + portable .exe (x64)                |
| Linux targets   | AppImage + .deb (x64)                               |
| macOS dark mode | Enabled                                             |
| NSIS            | One-click: false, allow dir change: true            |
| Native rebuild  | Sequential (rebuilds `better-sqlite3` per platform) |
| Auto-update     | Disabled (`publish: null`)                          |
| Build resources | `apps/desktop/build/` (icons, entitlements)         |

### macOS Code Signing & Notarization

Required for distribution outside App Store:

```bash
# Secrets needed:
CSC_LINK=<path or base64 of .p12 certificate>
CSC_KEY_PASSWORD=<certificate password>
APPLE_ID=<developer@example.com>
APPLE_ID_PASSWORD=<app-specific password>
```

Currently `notarize: false` in electron-builder.yml — **must enable before App Store or public release**.

### Windows Code Signing

```bash
CSC_LINK=<path or base64 of .pfx certificate>
CSC_KEY_PASSWORD=<certificate password>
```

---

## Desktop CI/CD (GitHub Actions)

### test.yml — PR + main/develop push

```
Trigger: push to main | develop, all PRs

Job: test  (ubuntu-latest)
  → pnpm install --frozen-lockfile
  → Restore Nx cache (key: nx-{OS}-{pnpm-lock-hash}-{git-sha})
  → pnpm nx run-many -t build --parallel=3
  → pnpm nx run-many -t test --parallel=3 --coverage
  → pnpm nx run-many -t lint --parallel=3 --max-warnings=0
  → Upload coverage/*/lcov.info → Codecov

Job: build-desktop  (matrix: ubuntu / macos / windows)
  Runs after: test
  → pnpm nx build desktop  (verifies cross-OS build)
```

### release.yml — Version tag push

```
Trigger: push of v* tag (e.g., v1.0.0)

Job: release-desktop  (matrix: ubuntu / macos / windows)
  → pnpm nx build desktop
  → electron-builder packages + signs artifacts
  → Uploads to GitHub Releases:
      *.dmg  *.zip  *.exe  *.AppImage  *.deb  *.rpm
```

### Nx Cache in CI

Cache key strategy:

- Primary: `nx-{runner.os}-{hashFiles('pnpm-lock.yaml')}-{github.sha}`
- Fallback 1: `nx-{runner.os}-{hashFiles('pnpm-lock.yaml')}`
- Fallback 2: `nx-{runner.os}`

This gives cross-run caching without Nx Cloud.

---

## Mobile (React Native) — Build & Release

### iOS

**Development:**

```bash
cd apps/mobile/ios
pod install       # install native pods
cd ..
pnpm nx run-ios mobile
```

**Distribution build:**

```bash
pnpm nx bundle:ios mobile   # = expo export --platform ios
# Then archive + upload via Xcode Organizer or fastlane
```

**App configuration (`apps/mobile/app.json`):**

- Bundle ID: `com.emuz.app`
- File sharing: enabled (UIFileSharingEnabled, LSSupportsOpeningDocumentsInPlace)
- Supports tablet: true

### Android

**Development:**

```bash
pnpm nx run-android mobile
```

**Distribution build:**

```bash
pnpm nx bundle:android mobile   # = expo export --platform android
# Then build APK/AAB via Gradle:
cd apps/mobile/android
./gradlew assembleRelease     # APK
./gradlew bundleRelease       # AAB (for Google Play)
```

**Android configuration (`apps/mobile/android/app/build.gradle`):**

| Setting          | Current Value                 | Production Value      |
| ---------------- | ----------------------------- | --------------------- |
| `applicationId`  | `com.anonymous.emuzsource` ⚠️ | `com.emuz.app`        |
| `versionCode`    | 1                             | increment per release |
| `versionName`    | "0.0.0"                       | semantic version      |
| Signing          | debug.keystore ⚠️             | production keystore   |
| Hermes           | enabled                       | enabled (keep)        |
| New Architecture | enabled                       | enabled (keep)        |

> ⚠️ **CRITICAL before release:** Change `applicationId` from `com.anonymous.emuzsource` to `com.emuz.app` and configure a production release keystore.

**Gradle properties:**

- `reactNativeArchitectures`: armeabi-v7a, arm64-v8a, x86, x86_64
- `newArchEnabled=true` (Fabric + TurboModules)
- `hermesEnabled=true`
- `edgeToEdgeEnabled=true`

### Mobile Release Signing

**Android production signing:**

1. Generate keystore: `keytool -genkey -v -keystore emuz-release.keystore -alias emuz -keyalg RSA -keysize 2048 -validity 10000`
2. Add to `android/app/build.gradle`:
   ```groovy
   signingConfigs {
     release {
       storeFile file(System.getenv('KEYSTORE_PATH'))
       storePassword System.getenv('KEYSTORE_PASSWORD')
       keyAlias System.getenv('KEY_ALIAS')
       keyPassword System.getenv('KEY_PASSWORD')
     }
   }
   ```

**iOS production signing:** Configure in Xcode → Signing & Capabilities → Team

---

## Version Management

Current version: `0.0.1` across all packages. To release:

1. Update `version` in:
   - `package.json` (root)
   - `apps/desktop/package.json`
   - `apps/mobile/app.json` (`expo.version`)
   - `apps/mobile/android/app/build.gradle` (`versionName`, `versionCode`)

2. Tag the release:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
   This triggers `release.yml` and produces GitHub Release artifacts.

---

## Database Migration (Production)

When shipping a new schema change:

1. Create a new migration in `libs/database/src/migrations/`:

   ```typescript
   export const migration002AddRomType = {
     version: 2,
     name: 'add_rom_type',
     up: (db: DatabaseAdapter) => {
       db.execute(`ALTER TABLE games ADD COLUMN rom_type TEXT NOT NULL DEFAULT 'game'`);
     },
     down: (db: DatabaseAdapter) => {
       // SQLite: no ALTER TABLE DROP COLUMN before 3.35
       // Must recreate table
     },
   };
   ```

2. Add to the `migrations` array in `index.ts`

3. Also run `pnpm drizzle-kit generate` in `libs/database/` to update Drizzle migration

4. `runMigrations()` runs automatically on app startup; it checks `_migrations` table version and only applies new migrations.

---

## Pre-Release Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No lint warnings: `pnpm lint`
- [ ] Desktop builds on all 3 OS (CI matrix passes)
- [ ] Mobile builds on iOS + Android
- [ ] Android `applicationId` updated to `com.emuz.app`
- [ ] Android release keystore configured
- [ ] macOS notarization enabled
- [ ] Version numbers updated in all manifests
- [ ] `romType` ADR-014 implemented (if shipping Epic 7)
- [ ] i18n completeness checked (570 keys still missing for non-EN locales)
- [ ] `LaunchService` migrated to Drizzle ORM
