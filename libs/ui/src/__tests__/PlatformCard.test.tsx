/**
 * PlatformCard component tests
 *
 * Tests: rendering, game count badge, click handler, selected state, wallpaper error fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { PlatformCard } from '../components/PlatformCard';
import type { Platform } from '@emuz/core';

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

describe('PlatformCard — rendering', () => {
  it('renders the platform name', () => {
    render(<PlatformCard platform={makePlatform()} />);
    expect(container.textContent).toContain('Super Nintendo');
  });

  it('renders with testID data attribute', () => {
    render(<PlatformCard platform={makePlatform()} testID="platform-card-1" />);
    expect(container.querySelector('[data-testid="platform-card-1"]')).not.toBeNull();
  });

  it('has role=button for accessibility', () => {
    render(<PlatformCard platform={makePlatform()} />);
    expect(container.querySelector('[role="button"]')).not.toBeNull();
  });

  it('includes platform name and game count in aria-label', () => {
    render(<PlatformCard platform={makePlatform()} gameCount={42} />);
    const btn = container.querySelector('[role="button"]') as HTMLElement;
    expect(btn.getAttribute('aria-label')).toContain('Super Nintendo');
    expect(btn.getAttribute('aria-label')).toContain('42');
  });

  it('renders manufacturer when provided', () => {
    const platform = makePlatform({ manufacturer: 'Nintendo' });
    render(<PlatformCard platform={platform} />);
    expect(container.textContent).toContain('Nintendo');
  });
});

describe('PlatformCard — game count badge', () => {
  it('shows "0 games" badge by default', () => {
    render(<PlatformCard platform={makePlatform()} />);
    expect(container.textContent).toContain('0 games');
  });

  it('shows singular "game" for count of 1', () => {
    render(<PlatformCard platform={makePlatform()} gameCount={1} />);
    expect(container.textContent).toContain('1 game');
    expect(container.textContent).not.toContain('1 games');
  });

  it('shows plural "games" for count > 1', () => {
    render(<PlatformCard platform={makePlatform()} gameCount={5} />);
    expect(container.textContent).toContain('5 games');
  });
});

describe('PlatformCard — click handler', () => {
  it('calls onClick with platform when card is clicked', () => {
    const onClick = vi.fn();
    const platform = makePlatform();
    render(<PlatformCard platform={platform} onClick={onClick} />);
    act(() => {
      (container.querySelector('[role="button"]') as HTMLElement).click();
    });
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(platform);
  });

  it('does not throw when onClick is not provided', () => {
    render(<PlatformCard platform={makePlatform()} />);
    expect(() =>
      act(() => {
        (container.querySelector('[role="button"]') as HTMLElement).click();
      })
    ).not.toThrow();
  });
});

describe('PlatformCard — wallpaper error fallback', () => {
  it('hides wallpaper div when wallpaperUrl triggers error', () => {
    render(<PlatformCard platform={makePlatform()} wallpaperUrl="/broken.jpg" />);
    const img = container.querySelector('img[src="/broken.jpg"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    act(() => {
      img.dispatchEvent(new Event('error'));
    });
    // After error, imageError=true — wallpaper div should no longer render
    expect(container.querySelector('img[src="/broken.jpg"]')).toBeNull();
  });
});
