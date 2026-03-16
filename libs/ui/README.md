# @emuz/ui

> Shared component library: cross-platform React/React Native components, design tokens, and theme configuration built with TailwindCSS 4 (desktop) and NativeWind 4 (mobile).

## Boundaries

### Owns
- Shared React + React Native components (`Button`, `GameCard`, `GameGrid`, `SearchBar`, `Sidebar`, and others)
- Design tokens: color palette, spacing, border-radius, typography
- Theme configuration for TailwindCSS 4 (desktop) and NativeWind 4 (mobile)
- Component index re-exports (`index.ts`)

### Delegates
- Business logic and data fetching → `@emuz/core` services and stores
- Translation of label strings → `@emuz/i18n`
- Platform-specific navigation (stack push, modal) → app-level navigation in `apps/`
- Database access — never

## Integration Map

### Internal dependencies
| Package | Used for |
|---------|----------|
| `@emuz/core` | Model types (`Game`, `Platform`, `Collection`) used as component props |

### Depended by
- `apps/desktop` — imports all shared UI components
- `apps/mobile` — imports all shared UI components

### External dependencies
| Package | Version | Role |
|---------|---------|------|
| `react` | `^19.x` | Component model |
| `react-native` | `^0.76` | Cross-platform primitives (`View`, `Text`, `Pressable`) |
| `nativewind` | `^4.x` | Tailwind utility classes for React Native |
| `tailwindcss` | `^4.x` | Utility-first CSS (desktop renderer) |

## Usage

### Command line

```bash
# Build
pnpm nx build ui

# Test
pnpm nx test ui

# Test with coverage
pnpm nx test ui --coverage

# Lint
pnpm nx lint ui
```

### Code

```tsx
import { Button, GameCard, GameGrid, SearchBar, Sidebar } from '@emuz/ui';
import type { Game, Platform } from '@emuz/core';

function LibraryScreen({ games, platforms }: { games: Game[]; platforms: Platform[] }) {
  return (
    <View className="flex-1 bg-slate-900">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search games..."
      />
      <GameGrid
        games={games}
        columns={4}
        onGamePress={handleGamePress}
      />
    </View>
  );
}
```

## Public API

### Components

```tsx
// Button
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;       // desktop
  onPress?: () => void;       // mobile
}

// GameCard
interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
  onLongPress?: (game: Game) => void;
  showPlatformBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// GameGrid
interface GameGridProps {
  games: Game[];
  columns?: number;
  loading?: boolean;
  emptyMessage?: string;
  onGamePress?: (game: Game) => void;
  onLoadMore?: () => void;
}

// SearchBar
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Sidebar
interface SidebarProps {
  platforms: Platform[];
  collections: Collection[];
  selectedPlatform?: string;
  selectedCollection?: string;
  onPlatformSelect: (platformId: string) => void;
  onCollectionSelect: (collectionId: string) => void;
}
```

### Theme Tokens

```typescript
// Color palette
const colors = {
  primary: { DEFAULT: '#10B981', dark: '#059669', light: '#34D399' },
  background: { DEFAULT: '#0F172A', surface: '#1E293B', surfaceVariant: '#334155' },
  text: { primary: '#F8FAFC', secondary: '#94A3B8', muted: '#64748B' },
  status: { error: '#EF4444', warning: '#F59E0B', success: '#10B981', info: '#3B82F6' },
};
```

## Anti-Patterns

| ❌ Do NOT | ✅ Do instead |
|-----------|--------------|
| Put business logic in components (filtering, sorting, fetching) | Call `@emuz/core` hooks in the parent; pass data as props |
| Use hardcoded color values (`#10b981`, `'slate'`) in JSX | Use Tailwind utility classes or theme tokens |
| Import `@emuz/database` or `@emuz/platform` directly | Components must only depend on `@emuz/core` types |
| Implement navigation logic inside shared components | Pass `onPress` callbacks; navigation is the app's responsibility |
| Use `StyleSheet.create` with hardcoded colors | Use NativeWind `className` with design token classes |

## Constraints

- **Cross-platform required**: every component must work on both desktop (Electron renderer) and mobile (React Native)
- Use `className` (NativeWind/Tailwind) for all styling — no inline styles, no `StyleSheet.create` with raw values
- Color palette is emerald green (`#10b981`) on slate dark (`#0f172a`) — deviations require a design decision
- No business logic in components — one responsibility: render data passed as props
- Components must be functional (hooks only), no class components

## See Also

- Full API reference: [docs/api.md](../../docs/api.md#emuzui)
- Architecture overview: [docs/architecture.md](../../docs/architecture.md)
