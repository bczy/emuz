/**
 * GameGrid component tests (Story 6.2)
 *
 * Tests: empty state, loading state, list of games
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GameGrid } from '../components/GameGrid';
import type { Game } from '@emuz/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGame(id: string, title: string): Game {
  const now = new Date();
  return {
    id,
    platformId: 'plat-uuid-1111-1111-1111-111111111111',
    title,
    filePath: `/roms/${id}.rom`,
    fileName: `${id}.rom`,
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

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
// Tests
// ---------------------------------------------------------------------------

describe('GameGrid — empty state', () => {
  it('shows the default empty message when no games and not loading', () => {
    render(<GameGrid games={[]} />);
    expect(container.textContent).toContain('No games found');
  });

  it('shows a custom empty message when provided', () => {
    render(<GameGrid games={[]} emptyMessage="Your library is empty" />);
    expect(container.textContent).toContain('Your library is empty');
  });

  it('does NOT show the empty state when loading with no games', () => {
    render(<GameGrid games={[]} loading={true} />);
    expect(container.textContent).not.toContain('No games found');
  });

  it('renders with a testID data attribute in empty state', () => {
    render(<GameGrid games={[]} testID="game-grid" />);
    const grid = container.querySelector('[data-testid="game-grid"]');
    expect(grid).not.toBeNull();
  });
});

describe('GameGrid — loading state', () => {
  it('renders skeleton elements when loading with no games', () => {
    render(<GameGrid games={[]} loading={true} skeletonCount={6} />);
    // Skeletons are divs without text content
    const allDivs = container.querySelectorAll('div');
    // At least one div present (the container + skeletons)
    expect(allDivs.length).toBeGreaterThan(1);
  });

  it('renders with testID data attribute in loading state', () => {
    render(<GameGrid games={[]} loading={true} testID="game-grid-loading" />);
    const grid = container.querySelector('[data-testid="game-grid-loading"]');
    expect(grid).not.toBeNull();
  });
});

describe('GameGrid — list of games', () => {
  it('renders game titles when games array is provided', async () => {
    const games = [
      makeGame('game-uuid-1111-1111-1111-111111111111', 'Zelda'),
      makeGame('game-uuid-2222-2222-2222-222222222222', 'Metroid'),
    ];
    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <GameGrid games={games} />
      </React.Suspense>
    );
    // Wait for lazy GameCard to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(container.textContent).toContain('Zelda');
    expect(container.textContent).toContain('Metroid');
  });

  it('renders with testID data attribute when games are provided', async () => {
    const games = [makeGame('game-uuid-1111-1111-1111-111111111111', 'Zelda')];
    render(
      <React.Suspense fallback={null}>
        <GameGrid games={games} testID="game-grid-list" />
      </React.Suspense>
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const grid = container.querySelector('[data-testid="game-grid-list"]');
    expect(grid).not.toBeNull();
  });
});
