/**
 * GameCard component tests (Story 6.2)
 *
 * Tests: renders with/without cover art, favorite state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GameCard } from '../components/GameCard';
import type { Game, Platform } from '@emuz/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGame(overrides: Partial<Game> = {}): Game {
  const now = new Date();
  return {
    id: 'game-uuid-1111-1111-1111-111111111111',
    platformId: 'plat-uuid-1111-1111-1111-111111111111',
    title: 'Super Test Game',
    filePath: '/roms/test.rom',
    fileName: 'test.rom',
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makePlatform(overrides: Partial<Platform> = {}): Platform {
  const now = new Date();
  return {
    id: 'plat-uuid-1111-1111-1111-111111111111',
    name: 'Super Nintendo',
    shortName: 'SNES',
    romExtensions: ['.sfc', '.smc'],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    // unmount by rendering null
  });
  container.remove();
});

function render(ui: React.ReactElement): void {
  act(() => {
    createRoot(container).render(ui);
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GameCard — basic rendering', () => {
  it('renders the game title', () => {
    render(<GameCard game={makeGame()} />);
    expect(container.textContent).toContain('Super Test Game');
  });

  it('renders with a testID data attribute', () => {
    render(<GameCard game={makeGame()} testID="game-card-1" />);
    const card = container.querySelector('[data-testid="game-card-1"]');
    expect(card).not.toBeNull();
  });

  it('has role=button for accessibility', () => {
    render(<GameCard game={makeGame()} />);
    const btn = container.querySelector('[role="button"]');
    expect(btn).not.toBeNull();
  });
});

describe('GameCard — cover art', () => {
  it('renders placeholder when coverPath is absent', () => {
    render(<GameCard game={makeGame({ coverPath: undefined })} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    // Placeholder is an inline SVG data URL
    expect(img.src).toContain('data:image/svg+xml');
  });

  it('renders the cover image when coverPath is provided', () => {
    const game = makeGame({ coverPath: '/covers/test.jpg' });
    render(<GameCard game={game} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('/covers/test.jpg');
  });

  it('falls back to placeholder on image load error', () => {
    const game = makeGame({ coverPath: '/covers/broken.jpg' });
    render(<GameCard game={game} />);
    const img = container.querySelector('img') as HTMLImageElement;
    // Trigger error event
    act(() => {
      img.dispatchEvent(new Event('error'));
    });
    expect(img.src).toContain('data:image/svg+xml');
  });
});

describe('GameCard — favorite state', () => {
  it('renders the favorite button', () => {
    render(<GameCard game={makeGame()} />);
    const btn = container.querySelector('[aria-label="Add to favorites"]');
    expect(btn).not.toBeNull();
  });

  it('shows "Remove from favorites" aria-label when isFavorite=true', () => {
    render(<GameCard game={makeGame()} isFavorite={true} />);
    const btn = container.querySelector('[aria-label="Remove from favorites"]');
    expect(btn).not.toBeNull();
  });

  it('calls onFavoriteToggle when favorite button is clicked', () => {
    const onFavoriteToggle = vi.fn();
    const game = makeGame();
    render(<GameCard game={game} onFavoriteToggle={onFavoriteToggle} />);
    const btn = container.querySelector('[aria-label="Add to favorites"]') as HTMLElement;
    act(() => {
      btn.click();
    });
    expect(onFavoriteToggle).toHaveBeenCalledOnce();
    expect(onFavoriteToggle).toHaveBeenCalledWith(game);
  });
});

describe('GameCard — platform badge', () => {
  it('shows platform short name badge when platform is provided', () => {
    const platform = makePlatform();
    render(<GameCard game={makeGame()} platform={platform} showPlatform={true} />);
    expect(container.textContent).toContain('SNES');
  });

  it('hides platform badge when showPlatform=false', () => {
    const platform = makePlatform();
    render(<GameCard game={makeGame()} platform={platform} showPlatform={false} />);
    // The badge span should not exist
    expect(container.textContent).not.toContain('SNES');
  });
});

describe('GameCard — click handlers', () => {
  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    const game = makeGame();
    render(<GameCard game={game} onClick={onClick} />);
    const card = container.querySelector('[role="button"]') as HTMLElement;
    act(() => {
      card.click();
    });
    expect(onClick).toHaveBeenCalledWith(game);
  });
});

describe('GameCard — aria-label', () => {
  it('includes game title in aria-label', () => {
    render(<GameCard game={makeGame()} />);
    const card = container.querySelector('[aria-label]') as HTMLElement;
    expect(card.getAttribute('aria-label')).toContain('Super Test Game');
  });

  it('includes platform name in aria-label when platform provided', () => {
    const platform = makePlatform();
    render(<GameCard game={makeGame()} platform={platform} />);
    const card = container.querySelector('[role="button"]') as HTMLElement;
    expect(card.getAttribute('aria-label')).toContain('Super Nintendo');
  });
});
