/**
 * GameDetail component tests
 *
 * Tests: rendering, cover fallback, metadata display, actions, emulator select
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GameDetail } from '../components/GameDetail';
import type { Game, Platform, Emulator } from '@emuz/core';

function makeGame(overrides: Partial<Game> = {}): Game {
  const now = new Date();
  return {
    id: 'game-uuid-1111-1111-1111-111111111111',
    platformId: 'plat-uuid-1111-1111-1111-111111111111',
    title: 'Chrono Trigger',
    filePath: '/roms/ct.sfc',
    fileName: 'ct.sfc',
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makePlatform(): Platform {
  const now = new Date();
  return {
    id: 'plat-uuid-1111-1111-1111-111111111111',
    name: 'Super Nintendo',
    shortName: 'SNES',
    romExtensions: ['.sfc', '.smc'],
    createdAt: now,
    updatedAt: now,
  };
}

function makeEmulator(id: string, name: string): Emulator {
  const now = new Date();
  return {
    id,
    name,
    platforms: ['snes'],
    isDefault: false,
    isInstalled: true,
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

describe('GameDetail — rendering', () => {
  it('renders the game title', () => {
    render(<GameDetail game={makeGame()} />);
    expect(container.textContent).toContain('Chrono Trigger');
  });

  it('renders with testID data attribute', () => {
    render(<GameDetail game={makeGame()} testID="game-detail-1" />);
    expect(container.querySelector('[data-testid="game-detail-1"]')).not.toBeNull();
  });

  it('renders platform name when platform is provided', () => {
    render(<GameDetail game={makeGame()} platform={makePlatform()} />);
    expect(container.textContent).toContain('Super Nintendo');
  });

  it('does not render platform badge when platform is absent', () => {
    render(<GameDetail game={makeGame()} />);
    expect(container.textContent).not.toContain('Super Nintendo');
  });
});

describe('GameDetail — cover image', () => {
  it('renders cover image when coverPath is set', () => {
    render(<GameDetail game={makeGame({ coverPath: '/covers/ct.jpg' })} />);
    const img = container.querySelector('img[alt="Chrono Trigger"]') as HTMLImageElement;
    expect(img.src).toContain('/covers/ct.jpg');
  });

  it('uses placeholder when coverPath is absent', () => {
    render(<GameDetail game={makeGame({ coverPath: undefined })} />);
    const img = container.querySelector('img[alt="Chrono Trigger"]') as HTMLImageElement;
    expect(img.src).toContain('data:image/svg+xml');
  });

  it('falls back to placeholder on image load error', () => {
    render(<GameDetail game={makeGame({ coverPath: '/covers/broken.jpg' })} />);
    const img = container.querySelector('img[alt="Chrono Trigger"]') as HTMLImageElement;
    act(() => {
      img.dispatchEvent(new Event('error'));
    });
    expect(img.src).toContain('data:image/svg+xml');
  });
});

describe('GameDetail — metadata', () => {
  it('shows "Never played" when playTime is 0', () => {
    render(<GameDetail game={makeGame({ playTime: 0 })} />);
    expect(container.textContent).toContain('Never played');
  });

  it('shows formatted play time in minutes', () => {
    render(<GameDetail game={makeGame({ playTime: 45 * 60 })} />);
    expect(container.textContent).toContain('45 minutes');
  });

  it('shows formatted play time in hours', () => {
    render(<GameDetail game={makeGame({ playTime: 2 * 3600 })} />);
    expect(container.textContent).toContain('2 hours');
  });

  it('shows developer when provided', () => {
    render(<GameDetail game={makeGame({ developer: 'Square' })} />);
    expect(container.textContent).toContain('Square');
  });

  it('shows description when provided', () => {
    render(<GameDetail game={makeGame({ description: 'A classic JRPG' })} />);
    expect(container.textContent).toContain('A classic JRPG');
  });
});

describe('GameDetail — actions', () => {
  it('renders a Play button', () => {
    render(<GameDetail game={makeGame()} />);
    expect(container.textContent).toContain('Play');
  });

  it('calls onPlay when Play button is clicked', () => {
    const onPlay = vi.fn();
    const game = makeGame();
    render(<GameDetail game={game} onPlay={onPlay} />);
    // Find button containing "Play" text
    const buttons = Array.from(container.querySelectorAll('button'));
    const playBtn = buttons.find((b) => b.textContent?.includes('Play'));
    act(() => {
      playBtn?.click();
    });
    expect(onPlay).toHaveBeenCalledWith(game, undefined);
  });

  it('shows "Launching..." when loading=true', () => {
    render(<GameDetail game={makeGame()} loading={true} />);
    expect(container.textContent).toContain('Launching...');
  });

  it('calls onFavoriteToggle when favorite button is clicked', () => {
    const onFavoriteToggle = vi.fn();
    const game = makeGame();
    render(<GameDetail game={game} onFavoriteToggle={onFavoriteToggle} />);
    const btn = container.querySelector('[aria-label="Add to favorites"]') as HTMLElement;
    act(() => {
      btn.click();
    });
    expect(onFavoriteToggle).toHaveBeenCalledWith(game);
  });

  it('shows "Remove from favorites" aria-label when isFavorite=true', () => {
    render(<GameDetail game={makeGame()} isFavorite={true} />);
    expect(container.querySelector('[aria-label="Remove from favorites"]')).not.toBeNull();
  });

  it('renders Edit button and calls onEdit when clicked', () => {
    const onEdit = vi.fn();
    const game = makeGame();
    render(<GameDetail game={game} onEdit={onEdit} />);
    const editBtn = container.querySelector('[aria-label="Edit game"]') as HTMLElement;
    act(() => {
      editBtn.click();
    });
    expect(onEdit).toHaveBeenCalledWith(game);
  });

  it('does not render Edit button when onEdit is absent', () => {
    render(<GameDetail game={makeGame()} />);
    expect(container.querySelector('[aria-label="Edit game"]')).toBeNull();
  });

  it('renders Close button and calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(<GameDetail game={makeGame()} onClose={onClose} />);
    const closeBtn = container.querySelector('[aria-label="Close"]') as HTMLElement;
    act(() => {
      closeBtn.click();
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('GameDetail — emulator select', () => {
  it('does not render emulator select when 0 or 1 emulators', () => {
    render(
      <GameDetail
        game={makeGame()}
        emulators={[makeEmulator('emu-1111-1111-1111-1111-111111111111', 'Snes9x')]}
      />
    );
    expect(container.querySelector('select')).toBeNull();
  });

  it('renders emulator dropdown when 2+ emulators are provided', () => {
    render(
      <GameDetail
        game={makeGame()}
        emulators={[
          makeEmulator('emu-1111-1111-1111-1111-111111111111', 'Snes9x'),
          makeEmulator('emu-2222-2222-2222-2222-222222222222', 'BSNES'),
        ]}
      />
    );
    expect(container.querySelector('select')).not.toBeNull();
    expect(container.textContent).toContain('Snes9x');
    expect(container.textContent).toContain('BSNES');
  });

  it('calls onEmulatorSelect when emulator is changed', () => {
    const onEmulatorSelect = vi.fn();
    render(
      <GameDetail
        game={makeGame()}
        emulators={[
          makeEmulator('emu-1111-1111-1111-1111-111111111111', 'Snes9x'),
          makeEmulator('emu-2222-2222-2222-2222-222222222222', 'BSNES'),
        ]}
        onEmulatorSelect={onEmulatorSelect}
      />
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(select, 'emu-2222-2222-2222-2222-222222222222');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onEmulatorSelect).toHaveBeenCalledWith('emu-2222-2222-2222-2222-222222222222');
  });
});
