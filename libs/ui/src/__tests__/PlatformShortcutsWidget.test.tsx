/**
 * PlatformShortcutsWidget — unit tests
 *
 * Covers: empty state, platform list rendering, maxPlatforms limit,
 *         onPlatformClick handler, game count display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { PlatformShortcutsWidget } from '../components/widgets/PlatformShortcutsWidget';
import type { Platform } from '@emuz/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlatform(id: string, name: string, shortName?: string): Platform {
  const now = new Date();
  return {
    id,
    name,
    shortName,
    romExtensions: [],
    createdAt: now,
    updatedAt: now,
  };
}

const NES = makePlatform(
  'nes-uuid-1111-1111-1111-111111111111',
  'Nintendo Entertainment System',
  'NES'
);
const SNES = makePlatform('snes-uuid-2222-2222-2222-222222222222', 'Super Nintendo', 'SNES');
const GB = makePlatform('gb-uuid-3333-3333-3333-333333333333', 'Game Boy', 'GB');
const GBA = makePlatform('gba-uuid-4444-4444-4444-444444444444', 'Game Boy Advance', 'GBA');
const N64 = makePlatform('n64-uuid-5555-5555-5555-555555555555', 'Nintendo 64', 'N64');
const GC = makePlatform('gc-uuid-6666-6666-6666-666666666666', 'GameCube', 'GCN');
const WII = makePlatform('wii-uuid-7777-7777-7777-777777777777', 'Wii');

// ---------------------------------------------------------------------------
// DOM setup
// ---------------------------------------------------------------------------

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
// Empty state
// ---------------------------------------------------------------------------

describe('PlatformShortcutsWidget — empty state', () => {
  it('shows "No platforms found" when platforms list is empty', () => {
    render(<PlatformShortcutsWidget platforms={[]} />);
    expect(container.textContent).toContain('No platforms found');
  });

  it('renders the "Platforms" widget title when empty', () => {
    render(<PlatformShortcutsWidget platforms={[]} />);
    expect(container.textContent).toContain('Platforms');
  });

  it('does not render any platform buttons when empty', () => {
    render(<PlatformShortcutsWidget platforms={[]} />);
    // No title elements that would be platform names
    expect(container.querySelectorAll('[title]').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Platform list rendering
// ---------------------------------------------------------------------------

describe('PlatformShortcutsWidget — platform list', () => {
  it('renders shortName when provided', () => {
    render(<PlatformShortcutsWidget platforms={[NES]} />);
    expect(container.textContent).toContain('NES');
  });

  it('renders full name when shortName is not set', () => {
    render(<PlatformShortcutsWidget platforms={[WII]} />);
    expect(container.textContent).toContain('Wii');
  });

  it('renders multiple platforms', () => {
    render(<PlatformShortcutsWidget platforms={[NES, SNES, GB]} />);
    expect(container.textContent).toContain('NES');
    expect(container.textContent).toContain('SNES');
    expect(container.textContent).toContain('GB');
  });

  it('renders game count of 0 when no gameCounts provided', () => {
    render(<PlatformShortcutsWidget platforms={[NES]} />);
    expect(container.textContent).toContain('0 games');
  });

  it('renders correct game count from gameCounts prop', () => {
    render(<PlatformShortcutsWidget platforms={[NES]} gameCounts={{ [NES.id]: 42 }} />);
    expect(container.textContent).toContain('42 games');
  });

  it('renders 0 games for platform not in gameCounts', () => {
    render(<PlatformShortcutsWidget platforms={[NES, SNES]} gameCounts={{ [NES.id]: 10 }} />);
    // SNES has no entry in gameCounts → 0 games
    const text = container.textContent ?? '';
    expect(text).toContain('10 games');
    expect(text).toContain('0 games');
  });

  it('renders title attribute with platform name and game count', () => {
    render(<PlatformShortcutsWidget platforms={[NES]} gameCounts={{ [NES.id]: 5 }} />);
    const el = container.querySelector('[title]');
    expect(el?.getAttribute('title')).toContain('Nintendo Entertainment System');
    expect(el?.getAttribute('title')).toContain('5 games');
  });
});

// ---------------------------------------------------------------------------
// maxPlatforms limit
// ---------------------------------------------------------------------------

describe('PlatformShortcutsWidget — maxPlatforms', () => {
  const ALL_PLATFORMS = [NES, SNES, GB, GBA, N64, GC, WII];

  it('shows at most maxPlatforms platforms (default 6)', () => {
    render(<PlatformShortcutsWidget platforms={ALL_PLATFORMS} />);
    // 7 platforms, default max is 6 → Wii should not appear
    expect(container.textContent).not.toContain('Wii');
    expect(container.textContent).toContain('GCN'); // 6th platform visible
  });

  it('respects a custom maxPlatforms value', () => {
    render(<PlatformShortcutsWidget platforms={ALL_PLATFORMS} maxPlatforms={3} />);
    expect(container.textContent).toContain('NES');
    expect(container.textContent).toContain('SNES');
    expect(container.textContent).toContain('GB');
    expect(container.textContent).not.toContain('GBA');
  });

  it('shows all platforms when maxPlatforms is greater than list length', () => {
    render(<PlatformShortcutsWidget platforms={[NES, SNES]} maxPlatforms={10} />);
    expect(container.textContent).toContain('NES');
    expect(container.textContent).toContain('SNES');
  });

  it('shows nothing (empty state) when maxPlatforms is 0', () => {
    render(<PlatformShortcutsWidget platforms={[NES, SNES]} maxPlatforms={0} />);
    expect(container.textContent).toContain('No platforms found');
  });
});

// ---------------------------------------------------------------------------
// Click handler
// ---------------------------------------------------------------------------

describe('PlatformShortcutsWidget — onPlatformClick', () => {
  it('calls onPlatformClick with the correct platform when clicked', () => {
    const onPlatformClick = vi.fn();
    render(<PlatformShortcutsWidget platforms={[NES]} onPlatformClick={onPlatformClick} />);
    const el = container.querySelector('[title]') as HTMLElement;
    act(() => {
      el.click();
    });
    expect(onPlatformClick).toHaveBeenCalledOnce();
    expect(onPlatformClick).toHaveBeenCalledWith(NES);
  });

  it('calls onPlatformClick with the correct platform for each item', () => {
    const onPlatformClick = vi.fn();
    render(<PlatformShortcutsWidget platforms={[NES, SNES]} onPlatformClick={onPlatformClick} />);
    const items = container.querySelectorAll('[title]');
    act(() => {
      (items[1] as HTMLElement).click();
    });
    expect(onPlatformClick).toHaveBeenCalledWith(SNES);
  });

  it('does not throw when onPlatformClick is not provided', () => {
    render(<PlatformShortcutsWidget platforms={[NES]} />);
    const el = container.querySelector('[title]') as HTMLElement;
    expect(() =>
      act(() => {
        el.click();
      })
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('PlatformShortcutsWidget — loading', () => {
  it('does not render platform names when loading=true', () => {
    render(<PlatformShortcutsWidget platforms={[NES, SNES]} loading={true} />);
    expect(container.textContent).not.toContain('NES');
    expect(container.textContent).not.toContain('SNES');
  });
});
