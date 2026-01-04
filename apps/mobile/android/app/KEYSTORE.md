# Debug Keystore

The debug keystore should be generated automatically by Android Studio.

If you need to manually create one:

```bash
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

## Release Keystore

For release builds, create a keystore:

```bash
keytool -genkey -v -keystore emuz-release.keystore -alias emuz -keyalg RSA -keysize 2048 -validity 10000
```

Then add these to `~/.gradle/gradle.properties`:

```properties
EMUZ_RELEASE_STORE_FILE=/path/to/emuz-release.keystore
EMUZ_RELEASE_STORE_PASSWORD=your_password
EMUZ_RELEASE_KEY_ALIAS=emuz
EMUZ_RELEASE_KEY_PASSWORD=your_key_password
```
