# EmuZ — Component Inventory

Generated: 2026-03-19 | Source: exhaustive scan of `libs/ui/`

## Overview

All components live in `@emuz/ui` (`libs/ui/src/components/`). They are built with React and use inline `React.CSSProperties` styles with CSS variable theming. Components are designed to work on both React (desktop) and React Native (mobile) via shared prop interfaces and NativeWind-compatible design tokens.

**Total:** 18 component families + 12 built-in icon variants

---

## Core UI Components

### Button

**File:** `libs/ui/src/components/Button/Button.tsx`

**Props:**

```typescript
{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'  // default: 'primary'
  size?: 'sm' | 'md' | 'lg'                                // default: 'md'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean        // shows spinner, disables interaction
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
  testID?: string
  'aria-label'?: string
}
```

| Variant     | Background      | Text       | Use case                     |
| ----------- | --------------- | ---------- | ---------------------------- |
| `primary`   | Emerald #10B981 | White      | Primary actions (Play, Save) |
| `secondary` | Slate surface   | Slate text | Secondary actions            |
| `ghost`     | Transparent     | Accent     | Tertiary actions, toolbar    |
| `danger`    | Red #EF4444     | White      | Destructive actions (Delete) |

| Size | Height | Font |
| ---- | ------ | ---- |
| `sm` | 32px   | 14px |
| `md` | 40px   | 16px |
| `lg` | 48px   | 18px |

**States:** hover (brightens), pressed (scale 0.98), loading (spinner overlay), disabled (opacity + aria-disabled)

---

### Input

**File:** `libs/ui/src/components/Input/Input.tsx`

**Props:**

```typescript
{
  value?: string
  defaultValue?: string
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  size?: 'sm' | 'md' | 'lg'    // heights: 32/40/48px
  disabled?: boolean
  readOnly?: boolean
  error?: boolean
  errorMessage?: string         // red text displayed below input
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: ...  onBlur?: ...  onKeyDown?: ...
  autoFocus?: boolean
  name?: string
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**States:** Focus (emerald border + ring shadow), Error (red border + message below), Disabled (muted)

---

### Card

**File:** `libs/ui/src/components/Card/Card.tsx`

**Props:**

```typescript
{
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  clickable?: boolean     // enables hover effects + pointer cursor
  selected?: boolean      // emerald border highlight + ring
  disabled?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'   // 0/12/16/24px
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  role?: string
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Hover effect (clickable):** translateY(-2px) + border highlight

---

### Badge

**File:** `libs/ui/src/components/Badge/Badge.tsx`

**Props:**

```typescript
{
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'    // text: 10/12/14px
  pill?: boolean                // fully rounded (borderRadius: 9999px)
  dot?: boolean                 // dot-only (6/8/10px), ignores children
  className?: string  style?: React.CSSProperties  testID?: string
}
```

---

### Icon

**File:** `libs/ui/src/components/Icon/Icon.tsx`

**Props:**

```typescript
{
  children?: React.ReactNode    // custom SVG passthrough
  size?: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|number  // 12/16/20/24/32/48px
  color?: 'primary'|'secondary'|'tertiary'|'muted'|'accent'|'error'|'success'|'warning'|'inherit'
  rotate?: number               // degrees
  flip?: 'horizontal'|'vertical'|'both'
  spin?: boolean                // 1s rotation animation
  pulse?: boolean               // 1s opacity pulse animation
  'aria-label'?: string
  'aria-hidden'?: boolean
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Built-in icon components** (pre-composed SVG):
`ChevronRightIcon`, `ChevronDownIcon`, `SearchIcon`, `PlayIcon`, `HeartIcon`, `HeartFilledIcon`, `SettingsIcon`, `HomeIcon`, `GridIcon`, `FolderIcon`, `CloseIcon`, `MoreIcon`

---

### Text

**File:** `libs/ui/src/components/Text/Text.tsx`

**Props:**

```typescript
{
  children: React.ReactNode
  variant?: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'body'|'bodySmall'|'caption'|'label'|'code'
  color?: 'primary'|'secondary'|'tertiary'|'muted'|'accent'|'error'|'success'|'warning'
  align?: 'left'|'center'|'right'
  weight?: 'normal'|'medium'|'semibold'|'bold'
  truncate?: boolean              // overflow ellipsis
  numberOfLines?: number          // -webkit-line-clamp
  className?: string  style?: React.CSSProperties  role?: string  testID?: string
}
```

| Variant   | Size          | HTML Element  |
| --------- | ------------- | ------------- |
| h1        | 48px          | `<h1>`        |
| h2        | 36px          | `<h2>`        |
| h3–h6     | 30/24/20/18px | `<h3>`–`<h6>` |
| body      | 16px          | `<p>`         |
| bodySmall | 14px          | `<p>`         |
| caption   | 12px          | `<p>`         |
| label     | 14px          | `<label>`     |
| code      | 14px mono     | `<code>`      |

---

## Game Display Components

### GameCard

**File:** `libs/ui/src/components/GameCard/GameCard.tsx`

**Props:**

```typescript
{
  game: Game
  platform?: Platform
  size?: 'small' | 'medium' | 'large'   // 120×160 / 160×220 / 200×280
  showPlatform?: boolean
  isFavorite?: boolean
  isSelected?: boolean
  onClick?: (game: Game) => void
  onDoubleClick?: (game: Game) => void
  onContextMenu?: (game: Game, event: React.MouseEvent) => void
  onFavoriteToggle?: (game: Game) => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Renders:** Cover art (lazy-loaded, placeholder on error) + title below + platform badge (top-left) + heart button (top-right) + play overlay on hover

**Hover effects:** scale(1.02), emerald border, play overlay appears

---

### GameGrid

**File:** `libs/ui/src/components/GameGrid/GameGrid.tsx`

**Props:**

```typescript
{
  games: Game[]
  platforms?: Map<string, Platform>
  cardSize?: 'small' | 'medium' | 'large'
  showPlatforms?: boolean
  favorites?: Set<string>
  selectedGameId?: string
  loading?: boolean
  skeletonCount?: number
  emptyMessage?: string
  onGameClick?: (game: Game) => void
  onGameDoubleClick?: (game: Game) => void
  onGameContextMenu?: (game: Game, event: React.MouseEvent) => void
  onFavoriteToggle?: (game: Game) => void
  onLoadMore?: () => void        // triggered by IntersectionObserver
  hasMore?: boolean
  gap?: number
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Features:** CSS grid auto-fill, `IntersectionObserver` infinite scroll trigger, skeleton pulse loaders when `loading`, empty state with message

---

### GameDetail

**File:** `libs/ui/src/components/GameDetail/GameDetail.tsx`

**Props:**

```typescript
{
  game: Game
  platform?: Platform
  emulators?: Emulator[]
  selectedEmulatorId?: string
  isFavorite?: boolean
  loading?: boolean
  onPlay?: (game: Game, emulatorId?: string) => void
  onFavoriteToggle?: (game: Game) => void
  onEdit?: (game: Game) => void
  onClose?: () => void
  onEmulatorSelect?: (emulatorId: string) => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Renders:** Full-width panel (max 600px) — cover image, title, platform badge, metadata grid (developer/publisher/release/genre/rating), description, emulator dropdown, Play + Favorite + Edit buttons, formatted play time and dates

---

## Navigation Components

### SearchBar

**File:** `libs/ui/src/components/SearchBar/SearchBar.tsx`

**Props:**

```typescript
{
  value?: string
  placeholder?: string
  debounceMs?: number           // default 300ms
  showShortcutHint?: boolean    // shows shortcut key hint
  shortcutKey?: string          // default '/'
  size?: 'sm' | 'md' | 'lg'    // 32/40/48px
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onClear?: () => void
  onFocus?: () => void
  onBlur?: () => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Keyboard:** '/' key focuses (global listener), Escape blurs

---

### Sidebar

**File:** `libs/ui/src/components/Sidebar/Sidebar.tsx`

**Props:**

```typescript
{
  platforms?: Platform[]
  collections?: Collection[]
  platformCounts?: Record<string, number>   // game count per platform
  collectionCounts?: Record<string, number>
  selectedId?: string
  collapsed?: boolean
  onPlatformClick?: (platform: Platform) => void
  onCollectionClick?: (collection: Collection) => void
  onActionClick?: (actionId: string) => void
  onToggleCollapse?: () => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Renders:** EmuZ logo header, collapsible sections (Platforms, Collections), items with icon + count, section collapse toggles, collapse button

---

### BottomTabBar

**File:** `libs/ui/src/components/BottomTabBar/BottomTabBar.tsx`

**Props:**

```typescript
{
  tabs: TabItem[]               // { id, label, icon, badge? }
  activeTabId: string
  onTabChange: (tabId: string) => void
  hideLabels?: boolean
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Renders:** Bottom bar with active indicator line, badge counters, safe-area-inset-bottom padding

---

## Platform / Genre Components

### PlatformCard

**File:** `libs/ui/src/components/PlatformCard/PlatformCard.tsx`

**Props:**

```typescript
{
  platform: Platform
  gameCount?: number
  wallpaperUrl?: string
  size?: 'small' | 'medium' | 'large'   // 160×100 / 240×140 / 320×180
  isSelected?: boolean
  onClick?: (platform: Platform) => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Platform colors:**
| Platform | Color | Platform | Color |
|----------|-------|----------|-------|
| NES | #E60012 | PlayStation | #003087 |
| SNES | #7B5AA6 | PS2 | #00439C |
| N64 | #009E60 | PSP | #003791 |
| GameCube | #6A0DAD | Sega Genesis | #0060A8 |
| Wii | #009AC7 | Dreamcast | #F97107 |
| GBA | #8C0900 | Xbox | #107C10 |
| NDS | #D50000 | | |

---

### GenreList + GenreItem

**File:** `libs/ui/src/components/GenreList/GenreList.tsx`

**GenreList Props:**

```typescript
{
  genres: Genre[]
  gameCounts?: Record<string, number>
  selectedId?: string
  layout?: 'list' | 'grid' | 'horizontal'
  onGenreClick?: (genre: Genre) => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**Genre accent colors:** Action (#EF4444), Adventure (#10B981), RPG (#8B5CF6), Platformer (#F59E0B), Puzzle (#3B82F6), Racing (#EF4444), Sports (#22C55E), Fighting (#DC2626), Shooter (#6B7280), Strategy (#7C3AED), Simulation (#0EA5E9), Arcade (#F97316)

---

## Widget Components

### WidgetContainer

**File:** `libs/ui/src/components/widgets/WidgetContainer.tsx`

**Props:**

```typescript
{
  widget?: Widget
  title?: string
  size?: 'small'|'medium'|'large'|'wide'|'tall'  // 160×160 / 320×160 / 320×320 / 480×160 / 160×320
  isDragging?: boolean
  isEditing?: boolean
  loading?: boolean
  children: React.ReactNode
  headerAction?: React.ReactNode
  onRemove?: () => void
  onSettings?: () => void
  onDragStart/End?: (e: React.DragEvent) => void
  className?: string  style?: React.CSSProperties  testID?: string
}
```

**States:** Editing (dashed border + remove/settings buttons), Dragging (opacity 0.7 + scale 1.02 + shadow)

---

### RecentGamesWidget

Extends `WidgetContainerProps` minus `children`.

```typescript
{
  games: Game[]
  maxGames?: number
  onGameClick?: (game: Game) => void
  onGamePlay?: (game: Game) => void
}
```

**Renders:** Vertical list, 40×52px cover, title, relative time ("Just now" / "5m ago" / "2h ago" / "3d ago" / date), hover play button

---

### FavoritesWidget

```typescript
{
  games: Game[]
  maxGames?: number
  onGameClick?: (game: Game) => void
  onGamePlay?: (game: Game) => void
}
```

**Renders:** Cover grid (64px width, aspect-ratio), heart badge overlay, play overlay on hover

---

### StatsWidget

```typescript
{
  stats: {
    totalGames: number
    totalPlatforms: number
    totalPlayTime: number   // minutes
    favoriteCount: number
    recentlyAddedCount: number
    recentlyPlayedCount: number
  }
  onStatClick?: (statKey: keyof LibraryStats) => void
}
```

**Renders:** 3×2 grid with colored icon containers + large value + label. Colors: Games (emerald), Platforms (blue), Play Time (amber), Favorites (red), New (purple), Played (pink)

---

### PlatformShortcutsWidget

```typescript
{
  platforms: Platform[]
  gameCounts?: Record<string, number>
  maxPlatforms?: number
  onPlatformClick?: (platform: Platform) => void
}
```

**Renders:** auto-fill grid, 24×24 icon + name + count per platform

---

## Design Tokens Summary

| Token Category    | Key Values                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Primary**       | #10B981 (emerald-500), #34D399 (emerald-400 accent)                                     |
| **Background**    | #0F172A (slate-900, dark bg), #1E293B (slate-800, surface), #334155 (slate-700, border) |
| **Text**          | #F8FAFC (primary), #94A3B8 (secondary), #64748B (muted)                                 |
| **Status**        | Success #22C55E, Warning #F59E0B, Error #EF4444, Info #3B82F6                           |
| **Spacing**       | 24-step scale: 0px → 384px                                                              |
| **Border Radius** | sm 2px, DEFAULT 4px, md 6px, lg 8px, xl 12px, 2xl 16px, full 9999px                     |
| **Z-Index**       | dropdown 1000 → modal 1400 → toast 1700 → tooltip 1800                                  |

See `libs/ui/src/themes/tokens.ts` for the complete token set.
