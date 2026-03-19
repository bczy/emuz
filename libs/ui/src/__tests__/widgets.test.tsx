/**
 * Widget component tests
 *
 * Covers: WidgetContainer, FavoritesWidget, RecentGamesWidget, StatsWidget
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { WidgetContainer } from '../components/widgets/WidgetContainer';
import { FavoritesWidget } from '../components/widgets/FavoritesWidget';
import { RecentGamesWidget } from '../components/widgets/RecentGamesWidget';
import { StatsWidget } from '../components/widgets/StatsWidget';
import type { Game } from '@emuz/core';
import type { LibraryStats } from '../components/widgets/StatsWidget';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGame(id: string, title: string, overrides: Partial<Game> = {}): Game {
  const now = new Date();
  return {
    id,
    platformId: 'plat-uuid-1111-1111-1111-111111111111',
    title,
    filePath: `/roms/${id}.rom`,
    fileName: `${id}.rom`,
    playCount: 0,
    playTime: 0,
    isFavorite: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const GAME_1 = makeGame('game-uuid-1111-1111-1111-111111111111', 'Zelda');
const GAME_2 = makeGame('game-uuid-2222-2222-2222-222222222222', 'Metroid');

const DEFAULT_STATS: LibraryStats = {
  totalGames: 150,
  totalPlatforms: 8,
  totalPlayTime: 300,
  favoriteCount: 12,
  recentlyAddedCount: 5,
  recentlyPlayedCount: 3,
};

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(ui: React.ReactElement): void {
  act(() => {
    root.render(ui);
  });
}

// ---------------------------------------------------------------------------
// WidgetContainer
// ---------------------------------------------------------------------------

describe('WidgetContainer — rendering', () => {
  it('renders the title', () => {
    render(<WidgetContainer title="My Widget">content</WidgetContainer>);
    expect(container.textContent).toContain('My Widget');
  });

  it('renders children', () => {
    render(
      <WidgetContainer title="W">
        <span>hello</span>
      </WidgetContainer>
    );
    expect(container.textContent).toContain('hello');
  });

  it('renders with testID', () => {
    render(
      <WidgetContainer title="W" testID="widget-1">
        x
      </WidgetContainer>
    );
    expect(container.querySelector('[data-testid="widget-1"]')).not.toBeNull();
  });

  it('shows loading spinner instead of children when loading=true', () => {
    render(
      <WidgetContainer title="W" loading={true}>
        <span>child</span>
      </WidgetContainer>
    );
    expect(container.textContent).not.toContain('child');
  });

  it('shows children when loading=false', () => {
    render(
      <WidgetContainer title="W" loading={false}>
        <span>child</span>
      </WidgetContainer>
    );
    expect(container.textContent).toContain('child');
  });

  it('shows settings and remove buttons in editing mode', () => {
    const onRemove = vi.fn();
    const onSettings = vi.fn();
    render(
      <WidgetContainer title="W" isEditing={true} onRemove={onRemove} onSettings={onSettings}>
        x
      </WidgetContainer>
    );
    expect(container.querySelector('[aria-label="Remove widget"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Widget settings"]')).not.toBeNull();
  });

  it('calls onRemove when Remove widget button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <WidgetContainer title="W" isEditing={true} onRemove={onRemove}>
        x
      </WidgetContainer>
    );
    act(() => {
      (container.querySelector('[aria-label="Remove widget"]') as HTMLElement).click();
    });
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// FavoritesWidget
// ---------------------------------------------------------------------------

describe('FavoritesWidget — empty state', () => {
  it('shows empty message when games list is empty', () => {
    render(<FavoritesWidget games={[]} />);
    expect(container.textContent).toContain('No favorites yet');
  });
});

describe('FavoritesWidget — with games', () => {
  it('renders game titles as img alt attributes', () => {
    render(<FavoritesWidget games={[GAME_1, GAME_2]} />);
    const alts = Array.from(container.querySelectorAll('img')).map((img) => img.alt);
    expect(alts).toContain('Zelda');
    expect(alts).toContain('Metroid');
  });

  it('respects maxGames limit', () => {
    const games = Array.from({ length: 10 }, (_, i) =>
      makeGame(`game-uuid-${i}111-1111-1111-111111111111`, `Game ${i}`)
    );
    render(<FavoritesWidget games={games} maxGames={3} />);
    // Only 3 images should be rendered
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(3);
  });

  it('calls onGameClick when a game item is clicked', () => {
    const onGameClick = vi.fn();
    render(<FavoritesWidget games={[GAME_1]} onGameClick={onGameClick} />);
    const img = container.querySelector('img') as HTMLImageElement;
    act(() => {
      img.parentElement?.click();
    });
    expect(onGameClick).toHaveBeenCalledWith(GAME_1);
  });

  it('shows "Favorites" as widget title', () => {
    render(<FavoritesWidget games={[]} />);
    expect(container.textContent).toContain('Favorites');
  });
});

// ---------------------------------------------------------------------------
// RecentGamesWidget
// ---------------------------------------------------------------------------

describe('RecentGamesWidget — empty state', () => {
  it('shows empty message when games list is empty', () => {
    render(<RecentGamesWidget games={[]} />);
    expect(container.textContent).toContain('No recently played games');
  });
});

describe('RecentGamesWidget — with games', () => {
  it('renders game titles', () => {
    render(<RecentGamesWidget games={[GAME_1, GAME_2]} />);
    expect(container.textContent).toContain('Zelda');
    expect(container.textContent).toContain('Metroid');
  });

  it('respects maxGames limit', () => {
    const games = Array.from({ length: 10 }, (_, i) =>
      makeGame(`game-uuid-${i}111-1111-1111-111111111111`, `Game ${i}`)
    );
    render(<RecentGamesWidget games={games} maxGames={2} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(2);
  });

  it('calls onGameClick when a game row is clicked', () => {
    const onGameClick = vi.fn();
    render(<RecentGamesWidget games={[GAME_1]} onGameClick={onGameClick} />);
    const img = container.querySelector('img') as HTMLImageElement;
    act(() => {
      img.parentElement?.click();
    });
    expect(onGameClick).toHaveBeenCalledWith(GAME_1);
  });

  it('calls onGamePlay when play button is clicked without bubbling to onGameClick', () => {
    const onGameClick = vi.fn();
    const onGamePlay = vi.fn();
    render(
      <RecentGamesWidget games={[GAME_1]} onGameClick={onGameClick} onGamePlay={onGamePlay} />
    );
    const playBtn = container.querySelector(`[aria-label="Play ${GAME_1.title}"]`) as HTMLElement;
    act(() => {
      playBtn.click();
    });
    expect(onGamePlay).toHaveBeenCalledWith(GAME_1);
    expect(onGameClick).not.toHaveBeenCalled();
  });

  it('shows "Recent Games" as widget title', () => {
    render(<RecentGamesWidget games={[]} />);
    expect(container.textContent).toContain('Recent Games');
  });

  it('shows last-played relative time for a game played recently', () => {
    const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const game = makeGame('game-uuid-3333-3333-3333-333333333333', 'Metroid', {
      lastPlayedAt: recentDate,
    });
    render(<RecentGamesWidget games={[game]} />);
    expect(container.textContent).toContain('5m ago');
  });
});

// ---------------------------------------------------------------------------
// StatsWidget
// ---------------------------------------------------------------------------

describe('StatsWidget — rendering', () => {
  it('renders "Library Stats" title', () => {
    render(<StatsWidget stats={DEFAULT_STATS} />);
    expect(container.textContent).toContain('Library Stats');
  });

  it('renders totalGames value', () => {
    render(<StatsWidget stats={DEFAULT_STATS} />);
    expect(container.textContent).toContain('150');
  });

  it('renders totalPlatforms value', () => {
    render(<StatsWidget stats={DEFAULT_STATS} />);
    expect(container.textContent).toContain('8');
  });

  it('formats play time in minutes when < 1 hour', () => {
    render(<StatsWidget stats={{ ...DEFAULT_STATS, totalPlayTime: 45 }} />);
    expect(container.textContent).toContain('45m');
  });

  it('formats play time in hours when >= 1 hour', () => {
    render(<StatsWidget stats={{ ...DEFAULT_STATS, totalPlayTime: 120 }} />);
    expect(container.textContent).toContain('2h');
  });

  it('formats play time in days when >= 24 hours', () => {
    render(<StatsWidget stats={{ ...DEFAULT_STATS, totalPlayTime: 25 * 60 }} />);
    expect(container.textContent).toContain('1d');
  });

  it('calls onStatClick with correct key when a stat item is clicked', () => {
    const onStatClick = vi.fn();
    render(<StatsWidget stats={DEFAULT_STATS} onStatClick={onStatClick} />);
    // The "Games" stat item — find by label text
    const allText = Array.from(container.querySelectorAll('p'));
    const gamesLabel = allText.find((p) => p.textContent === 'Games');
    act(() => {
      gamesLabel?.parentElement?.click();
    });
    expect(onStatClick).toHaveBeenCalledWith('totalGames');
  });
});
