/**
 * Sidebar component tests
 *
 * Tests: rendering, platform list, collections, selected state, section collapse, toggle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Sidebar } from '../components/Sidebar';
import type { Platform, Collection } from '@emuz/core';

function makePlatform(id: string, name: string): Platform {
  const now = new Date();
  return {
    id,
    name,
    shortName: name.slice(0, 4).toUpperCase(),
    romExtensions: ['.rom'],
    createdAt: now,
    updatedAt: now,
  };
}

function makeCollection(id: string, name: string): Collection {
  const now = new Date();
  return {
    id,
    name,
    gameIds: [],
    isSystem: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
}

const SNES = makePlatform('plat-uuid-1111-1111-1111-111111111111', 'Super Nintendo');
const N64 = makePlatform('plat-uuid-2222-2222-2222-222222222222', 'Nintendo 64');
const COL1 = makeCollection('col-uuid-1111-1111-1111-111111111111', 'Favorites');

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

describe('Sidebar — rendering', () => {
  it('renders the EmuZ logo text', () => {
    render(<Sidebar />);
    expect(container.textContent).toContain('EmuZ');
  });

  it('renders with testID data attribute', () => {
    render(<Sidebar testID="sidebar-1" />);
    expect(container.querySelector('[data-testid="sidebar-1"]')).not.toBeNull();
  });

  it('renders as an <aside> element', () => {
    render(<Sidebar />);
    expect(container.querySelector('aside')).not.toBeNull();
  });
});

describe('Sidebar — platforms section', () => {
  it('renders platform names', () => {
    render(<Sidebar platforms={[SNES, N64]} />);
    expect(container.textContent).toContain('Super Nintendo');
    expect(container.textContent).toContain('Nintendo 64');
  });

  it('shows game count badge when platformCounts is provided', () => {
    render(<Sidebar platforms={[SNES]} platformCounts={{ [SNES.id]: 12 }} />);
    expect(container.textContent).toContain('12');
  });

  it('calls onPlatformClick with correct platform when clicked', () => {
    const onPlatformClick = vi.fn();
    render(<Sidebar platforms={[SNES, N64]} onPlatformClick={onPlatformClick} />);
    const buttons = Array.from(container.querySelectorAll('[role="button"]'));
    const snesBtn = buttons.find((b) => b.textContent?.includes('Super Nintendo'));
    act(() => {
      (snesBtn as HTMLElement).click();
    });
    expect(onPlatformClick).toHaveBeenCalledWith(SNES);
  });

  it('does not render platforms section when list is empty', () => {
    render(<Sidebar platforms={[]} />);
    expect(container.textContent).not.toContain('Platforms');
  });
});

describe('Sidebar — collections section', () => {
  it('renders collection names', () => {
    render(<Sidebar collections={[COL1]} />);
    expect(container.textContent).toContain('Favorites');
  });

  it('calls onCollectionClick with correct collection when clicked', () => {
    const onCollectionClick = vi.fn();
    render(<Sidebar collections={[COL1]} onCollectionClick={onCollectionClick} />);
    const buttons = Array.from(container.querySelectorAll('[role="button"]'));
    const col1Btn = buttons.find((b) => b.textContent?.includes('Favorites'));
    act(() => {
      (col1Btn as HTMLElement).click();
    });
    expect(onCollectionClick).toHaveBeenCalledWith(COL1);
  });

  it('does not render collections section when list is empty', () => {
    render(<Sidebar collections={[]} />);
    expect(container.textContent).not.toContain('Collections');
  });
});

describe('Sidebar — section collapse', () => {
  it('hides platforms after clicking the section header', () => {
    render(<Sidebar platforms={[SNES]} />);
    // "Platforms" section header button
    const sectionBtn = Array.from(container.querySelectorAll('[role="button"]')).find(
      (b) => b.textContent?.trim() === 'Platforms'
    );
    act(() => {
      (sectionBtn as HTMLElement).click();
    });
    expect(container.textContent).not.toContain('Super Nintendo');
  });

  it('re-expands platforms after clicking section header twice', () => {
    render(<Sidebar platforms={[SNES]} />);
    const getSectionBtn = () =>
      Array.from(container.querySelectorAll('[role="button"]')).find(
        (b) => b.textContent?.trim() === 'Platforms'
      ) as HTMLElement;
    act(() => {
      getSectionBtn().click();
    });
    act(() => {
      getSectionBtn().click();
    });
    expect(container.textContent).toContain('Super Nintendo');
  });
});

describe('Sidebar — collapse toggle', () => {
  it('calls onToggleCollapse when collapse button is clicked', () => {
    const onToggleCollapse = vi.fn();
    render(<Sidebar collapsed={false} onToggleCollapse={onToggleCollapse} />);
    const collapseBtn = container.querySelector('[aria-label="Collapse sidebar"]') as HTMLElement;
    act(() => {
      collapseBtn.click();
    });
    expect(onToggleCollapse).toHaveBeenCalledOnce();
  });

  it('shows Expand button when collapsed=true', () => {
    render(<Sidebar collapsed={true} onToggleCollapse={vi.fn()} />);
    expect(container.querySelector('[aria-label="Expand sidebar"]')).not.toBeNull();
  });

  it('hides EmuZ text label when collapsed', () => {
    render(<Sidebar collapsed={true} />);
    // Logo text has display:none when collapsed — textContent still present in DOM
    // Verify the h1 has display:none via inline style
    const h1 = container.querySelector('h1') as HTMLElement;
    expect(h1?.style.display).toBe('none');
  });
});
