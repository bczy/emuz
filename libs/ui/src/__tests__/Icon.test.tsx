/**
 * Icon component tests
 *
 * Tests: basic rendering, sizes, colors, transforms, animations,
 *        accessibility, named icons
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import {
  Icon,
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
  PlayIcon,
  HeartIcon,
  HeartFilledIcon,
  SettingsIcon,
  HomeIcon,
  GridIcon,
  FolderIcon,
  CloseIcon,
  MoreIcon,
} from '../components/Icon/Icon';

// ---------------------------------------------------------------------------
// Helpers
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

function _getSpan(): HTMLSpanElement {
  return container.querySelector(
    'span[data-testid], span[data-icon-name], span'
  ) as HTMLSpanElement;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Icon — basic rendering', () => {
  it('renders a span wrapper', () => {
    render(
      <Icon testID="icon-basic">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-basic"]');
    expect(span).not.toBeNull();
  });

  it('renders children inside the span', () => {
    render(
      <Icon testID="icon-child">
        <svg data-testid="inner-svg" viewBox="0 0 24 24" />
      </Icon>
    );
    const inner = container.querySelector('[data-testid="inner-svg"]');
    expect(inner).not.toBeNull();
  });

  it('sets data-icon-name when name is provided', () => {
    render(
      <Icon name="my-icon" testID="icon-named">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-named"]') as HTMLElement;
    expect(span.getAttribute('data-icon-name')).toBe('my-icon');
  });
});

describe('Icon — sizes', () => {
  it('defaults to 20px (md size)', () => {
    render(
      <Icon testID="icon-md">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-md"]') as HTMLElement;
    expect(span.style.width).toBe('20px');
    expect(span.style.height).toBe('20px');
  });

  it('xs size = 12px', () => {
    render(
      <Icon size="xs" testID="icon-xs">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-xs"]') as HTMLElement;
    expect(span.style.width).toBe('12px');
    expect(span.style.height).toBe('12px');
  });

  it('sm size = 16px', () => {
    render(
      <Icon size="sm" testID="icon-sm">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-sm"]') as HTMLElement;
    expect(span.style.width).toBe('16px');
    expect(span.style.height).toBe('16px');
  });

  it('lg size = 24px', () => {
    render(
      <Icon size="lg" testID="icon-lg">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-lg"]') as HTMLElement;
    expect(span.style.width).toBe('24px');
    expect(span.style.height).toBe('24px');
  });

  it('xl size = 32px', () => {
    render(
      <Icon size="xl" testID="icon-xl">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-xl"]') as HTMLElement;
    expect(span.style.width).toBe('32px');
    expect(span.style.height).toBe('32px');
  });

  it('2xl size = 48px', () => {
    render(
      <Icon size="2xl" testID="icon-2xl">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-2xl"]') as HTMLElement;
    expect(span.style.width).toBe('48px');
    expect(span.style.height).toBe('48px');
  });

  it('accepts a numeric size', () => {
    render(
      <Icon size={36} testID="icon-num">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-num"]') as HTMLElement;
    expect(span.style.width).toBe('36px');
    expect(span.style.height).toBe('36px');
  });
});

describe('Icon — colors', () => {
  it('applies accent color CSS variable', () => {
    render(
      <Icon color="accent" testID="icon-accent">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-accent"]') as HTMLElement;
    expect(span.style.color).toContain('#10B981');
  });

  it('applies inherit color when color="inherit"', () => {
    render(
      <Icon color="inherit" testID="icon-inherit">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-inherit"]') as HTMLElement;
    expect(span.style.color).toBe('inherit');
  });

  it('applies error color', () => {
    render(
      <Icon color="error" testID="icon-error">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-error"]') as HTMLElement;
    expect(span.style.color).toContain('#EF4444');
  });
});

describe('Icon — transforms', () => {
  it('applies rotate transform', () => {
    render(
      <Icon rotate={90} testID="icon-rotate">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-rotate"]') as HTMLElement;
    expect(span.style.transform).toContain('rotate(90deg)');
  });

  it('applies horizontal flip transform', () => {
    render(
      <Icon flip="horizontal" testID="icon-flip-h">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-flip-h"]') as HTMLElement;
    expect(span.style.transform).toContain('scaleX(-1)');
  });

  it('applies vertical flip transform', () => {
    render(
      <Icon flip="vertical" testID="icon-flip-v">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-flip-v"]') as HTMLElement;
    expect(span.style.transform).toContain('scaleY(-1)');
  });

  it('applies both flip transforms when flip="both"', () => {
    render(
      <Icon flip="both" testID="icon-flip-both">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-flip-both"]') as HTMLElement;
    expect(span.style.transform).toContain('scaleX(-1)');
    expect(span.style.transform).toContain('scaleY(-1)');
  });
});

describe('Icon — animations', () => {
  it('injects keyframes style element when spin=true', () => {
    render(
      <Icon spin={true} testID="icon-spin">
        <svg />
      </Icon>
    );
    const styleEl = container.querySelector('style');
    expect(styleEl).not.toBeNull();
    expect((styleEl as HTMLStyleElement).textContent).toContain('icon-spin');
  });

  it('injects keyframes style element when pulse=true', () => {
    render(
      <Icon pulse={true} testID="icon-pulse">
        <svg />
      </Icon>
    );
    const styleEl = container.querySelector('style');
    expect(styleEl).not.toBeNull();
    expect((styleEl as HTMLStyleElement).textContent).toContain('icon-pulse');
  });

  it('does not inject style when neither spin nor pulse', () => {
    render(
      <Icon testID="icon-no-anim">
        <svg />
      </Icon>
    );
    const styleEl = container.querySelector('style');
    expect(styleEl).toBeNull();
  });
});

describe('Icon — accessibility', () => {
  it('sets role=img and aria-label when aria-label is provided', () => {
    render(
      <Icon aria-label="Close dialog" testID="icon-a11y">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-a11y"]') as HTMLElement;
    expect(span.getAttribute('role')).toBe('img');
    expect(span.getAttribute('aria-label')).toBe('Close dialog');
  });

  it('sets aria-hidden=true when no aria-label provided', () => {
    render(
      <Icon testID="icon-hidden">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-hidden"]') as HTMLElement;
    expect(span.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets aria-hidden=false when explicitly provided', () => {
    render(
      <Icon aria-hidden={false} testID="icon-visible">
        <svg />
      </Icon>
    );
    const span = container.querySelector('[data-testid="icon-visible"]') as HTMLElement;
    expect(span.getAttribute('aria-hidden')).toBe('false');
  });
});

describe('Icon — named icon components', () => {
  const namedIcons = [
    { name: 'ChevronRightIcon', Component: ChevronRightIcon },
    { name: 'ChevronDownIcon', Component: ChevronDownIcon },
    { name: 'SearchIcon', Component: SearchIcon },
    { name: 'PlayIcon', Component: PlayIcon },
    { name: 'HeartIcon', Component: HeartIcon },
    { name: 'HeartFilledIcon', Component: HeartFilledIcon },
    { name: 'SettingsIcon', Component: SettingsIcon },
    { name: 'HomeIcon', Component: HomeIcon },
    { name: 'GridIcon', Component: GridIcon },
    { name: 'FolderIcon', Component: FolderIcon },
    { name: 'CloseIcon', Component: CloseIcon },
    { name: 'MoreIcon', Component: MoreIcon },
  ];

  namedIcons.forEach(({ name, Component }) => {
    it(`${name} renders an SVG`, () => {
      render(<Component testID={`named-${name}`} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    });
  });

  it('named icons accept size prop', () => {
    render(<SearchIcon size="lg" testID="search-lg" />);
    const span = container.querySelector('[data-testid="search-lg"]') as HTMLElement;
    expect(span.style.width).toBe('24px');
  });
});
