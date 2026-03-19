/**
 * GenreList component tests
 *
 * Tests: basic rendering, layouts, selection, game counts, empty state, interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GenreList, GenreItem } from '../components/GenreList/GenreList';
import type { Genre } from '@emuz/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGenre(overrides: Partial<Genre> = {}): Genre {
  const now = new Date();
  return {
    id: 'genre-uuid-1111-1111-1111-111111111111',
    name: 'Action',
    slug: 'action',
    gameCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
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

describe('GenreList — empty state', () => {
  it('renders the empty message when genres array is empty', () => {
    render(<GenreList genres={[]} />);
    expect(container.textContent).toContain('No genres found');
  });

  it('renders testID on empty state container', () => {
    render(<GenreList genres={[]} testID="genre-list-empty" />);
    const el = container.querySelector('[data-testid="genre-list-empty"]');
    expect(el).not.toBeNull();
  });
});

describe('GenreList — basic rendering', () => {
  it('renders genre names', () => {
    const genres = [
      makeGenre({ id: 'id-1', name: 'Action', slug: 'action' }),
      makeGenre({ id: 'id-2', name: 'Puzzle', slug: 'puzzle' }),
    ];
    render(<GenreList genres={genres} />);
    expect(container.textContent).toContain('Action');
    expect(container.textContent).toContain('Puzzle');
  });

  it('renders testID on the list container', () => {
    render(<GenreList genres={[makeGenre()]} testID="my-genre-list" />);
    const el = container.querySelector('[data-testid="my-genre-list"]');
    expect(el).not.toBeNull();
  });

  it('renders one item per genre', () => {
    const genres = [
      makeGenre({ id: 'id-1', name: 'Action', slug: 'action' }),
      makeGenre({ id: 'id-2', name: 'RPG', slug: 'rpg' }),
      makeGenre({ id: 'id-3', name: 'Sports', slug: 'sports' }),
    ];
    render(<GenreList genres={genres} />);
    const buttons = container.querySelectorAll('[role="button"]');
    expect(buttons.length).toBe(3);
  });
});

describe('GenreList — game counts', () => {
  it('displays game count next to each genre in list layout', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} gameCounts={{ 'id-1': 42 }} layout="list" />);
    expect(container.textContent).toContain('42');
  });

  it('shows 0 when no count provided for a genre', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} />);
    expect(container.textContent).toContain('0');
  });

  it('displays "X games" in grid layout', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} gameCounts={{ 'id-1': 7 }} layout="grid" />);
    expect(container.textContent).toContain('7 games');
  });
});

describe('GenreList — selection', () => {
  it('sets aria-selected=true on the selected genre item', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} selectedId="id-1" />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    expect(btn.getAttribute('aria-selected')).toBe('true');
  });

  it('sets aria-selected=false when genre is not selected', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} selectedId="id-2" />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    expect(btn.getAttribute('aria-selected')).toBe('false');
  });
});

describe('GenreList — interactions', () => {
  it('calls onGenreClick with the correct genre when clicked', () => {
    const onGenreClick = vi.fn();
    const genre = makeGenre({ id: 'id-1', name: 'Racing', slug: 'racing' });
    render(<GenreList genres={[genre]} onGenreClick={onGenreClick} />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    act(() => {
      btn.click();
    });
    expect(onGenreClick).toHaveBeenCalledOnce();
    expect(onGenreClick).toHaveBeenCalledWith(genre);
  });

  it('does not throw when onGenreClick is not provided', () => {
    const genre = makeGenre({ id: 'id-1' });
    render(<GenreList genres={[genre]} />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    expect(() => {
      act(() => {
        btn.click();
      });
    }).not.toThrow();
  });
});

describe('GenreList — layout modes', () => {
  it('renders in list layout by default', () => {
    render(<GenreList genres={[makeGenre()]} testID="gl" />);
    const el = container.querySelector('[data-testid="gl"]') as HTMLElement;
    expect(el).not.toBeNull();
    // list layout uses flex column
    expect(el.style.flexDirection).toBe('column');
  });

  it('renders in horizontal layout', () => {
    render(<GenreList genres={[makeGenre()]} layout="horizontal" testID="gl" />);
    const el = container.querySelector('[data-testid="gl"]') as HTMLElement;
    expect(el.style.overflowX).toBe('auto');
  });

  it('renders in grid layout', () => {
    render(<GenreList genres={[makeGenre()]} layout="grid" testID="gl" />);
    const el = container.querySelector('[data-testid="gl"]') as HTMLElement;
    expect(el.style.gridTemplateColumns).toContain('minmax');
  });
});

describe('GenreItem — standalone', () => {
  it('renders genre name', () => {
    const genre = makeGenre({ name: 'Horror', slug: 'horror' });
    render(<GenreItem genre={genre} />);
    expect(container.textContent).toContain('Horror');
  });

  it('uses the genre color when provided', () => {
    const genre = makeGenre({ color: '#FF00FF' });
    render(<GenreItem genre={genre} />);
    // Color is applied to icon SVG fill — verify it rendered
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const genre = makeGenre();
    render(<GenreItem genre={genre} onClick={onClick} />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    act(() => {
      btn.click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });
});
