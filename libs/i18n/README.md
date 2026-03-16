# @emuz/i18n

> Internationalization layer: react-i18next configuration, locale files, and typed translation hooks for all 6 supported languages (EN, ES, FR, DE, JA, ZH).

## Boundaries

### Owns
- react-i18next initialization and configuration
- Locale JSON files for: English (`en`), Spanish (`es`), French (`fr`), German (`de`), Japanese (`ja`), Chinese (`zh`)
- `I18nProvider` React component (wraps both apps)
- Re-exported `useTranslation` hook (typed, pre-configured)
- Translation namespaces: `common`, `games`, `platforms`, `settings`

### Delegates
- UI rendering of translated strings → consuming components in `apps/` and `@emuz/ui`
- Language preference persistence → `@emuz/core` `useSettingsStore`
- No business logic, no database access, no file I/O

## Integration Map

### Internal dependencies

_None. This is a leaf library with no `@emuz/*` imports._

### Depended by
- `apps/desktop` — wraps renderer with `I18nProvider`; all components use `useTranslation()`
- `apps/mobile` — wraps app with `I18nProvider`; all components use `useTranslation()`
- `@emuz/ui` — shared components use `useTranslation()` for labels

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `react-i18next` | `^14.x` | React integration for i18next (hooks, provider) |
| `i18next` | `^23.x` | Core i18n engine (namespace loading, language switching) |

## Usage

### Command line

```bash
# Build
pnpm nx build i18n

# Test
pnpm nx test i18n

# Test with coverage
pnpm nx test i18n --coverage

# Lint
pnpm nx lint i18n
```

### Code

```tsx
// 1. Wrap the app root with I18nProvider (done once per app)
import { I18nProvider } from '@emuz/i18n';

export function App() {
  return (
    <I18nProvider>
      <RootNavigator />
    </I18nProvider>
  );
}

// 2. Use translations in any component
import { useTranslation } from '@emuz/i18n';

function GameDetailScreen() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('games.playNow')}</Text>
      <Button onPress={() => i18n.changeLanguage('fr')} title="Français" />
    </View>
  );
}
```

## Public API

```typescript
// Provider
function I18nProvider(props: { children: React.ReactNode }): JSX.Element;

// Hook (re-exported from react-i18next, pre-configured)
function useTranslation(ns?: Namespace): UseTranslationResponse;

// Available namespaces
type Namespace = 'common' | 'games' | 'platforms' | 'settings';
```

### Translation key structure

```
common.*      — app name, generic buttons (save, cancel, delete, search...)
games.*       — game detail labels, play count, last played, favorites
platforms.*   — platform names, manufacturer, generation labels
settings.*    — settings screen labels, theme options, language names
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Hardcode any user-visible string in JSX | Always use `t('namespace.key')` |
| Add a translation key to non-English locales first | Add to `en/` first, then propagate to other locales |
| Use string interpolation for dynamic values: `t('hello') + name` | Use i18next interpolation: `t('hello', { name })` with `{{name}}` in the locale file |
| Import locale JSON files directly in components | Use `useTranslation()` — direct imports bypass the i18next runtime |
| Persist the selected language in this lib | Language preference is stored by `useSettingsStore` in `@emuz/core` |

## Constraints

- English (`en`) is the source locale — all keys must exist in `en/` before other locales
- All 6 locales must have the same key structure (CI checks for missing keys)
- No business logic in locale files — translation values must be pure strings or simple interpolations
- `I18nProvider` must be placed at the root of the component tree, above any component using `useTranslation()`

## Adding a Translation Key

1. Add the key and English value to the appropriate file in `libs/i18n/src/locales/en/`
2. Add the translated values for the remaining 5 locales
3. Use the key in the component with `t('namespace.key')`

## See Also

- Full API reference: [docs/api.md](../../docs/api.md#emuzi18n)
- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
