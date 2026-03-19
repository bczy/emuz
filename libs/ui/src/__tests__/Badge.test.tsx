/**
 * Badge component tests
 *
 * Covers: basic render, variants, sizes, pill, dot mode, testID
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Badge } from '../components/Badge/Badge';

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

function render(ui: React.ReactElement): void {
  act(() => {
    createRoot(container).render(ui);
  });
}

function _getSpan(): HTMLSpanElement {
  return container.querySelector('span') as HTMLSpanElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Badge — basic rendering', () => {
  it('renders a <span> element', () => {
    render(<Badge>New</Badge>);
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('renders children text', () => {
    render(<Badge>Beta</Badge>);
    expect(container.textContent).toContain('Beta');
  });

  it('renders with data-testid when testID is provided', () => {
    render(<Badge testID="badge-1">Tag</Badge>);
    expect(container.querySelector('[data-testid="badge-1"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Variants (smoke)
// ---------------------------------------------------------------------------

describe('Badge — variants', () => {
  for (const variant of [
    'default',
    'primary',
    'success',
    'warning',
    'error',
    'info',
    'outline',
  ] as const) {
    it(`renders variant="${variant}"`, () => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(container.textContent).toContain(variant);
    });
  }
});

// ---------------------------------------------------------------------------
// Sizes (smoke)
// ---------------------------------------------------------------------------

describe('Badge — sizes', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`renders size="${size}"`, () => {
      render(<Badge size={size}>{size}</Badge>);
      expect(container.textContent).toContain(size);
    });
  }
});

// ---------------------------------------------------------------------------
// Pill shape
// ---------------------------------------------------------------------------

describe('Badge — pill', () => {
  it('renders without throwing when pill=true', () => {
    render(<Badge pill>Pill</Badge>);
    expect(container.textContent).toContain('Pill');
  });

  it('applies borderRadius 9999 in inline style when pill=true', () => {
    render(
      <Badge pill testID="pill-badge">
        Pill
      </Badge>
    );
    const span = container.querySelector('[data-testid="pill-badge"]') as HTMLSpanElement;
    expect(span.style.borderRadius).toBe('9999px');
  });
});

// ---------------------------------------------------------------------------
// Dot mode
// ---------------------------------------------------------------------------

describe('Badge — dot mode', () => {
  it('renders an empty span when dot=true', () => {
    render(<Badge dot testID="dot-badge" />);
    const span = container.querySelector('[data-testid="dot-badge"]') as HTMLSpanElement;
    expect(span).not.toBeNull();
    expect(span.textContent).toBe('');
  });

  it('renders dot with correct size for each size variant', () => {
    for (const [size, expected] of [
      ['sm', '6px'],
      ['md', '8px'],
      ['lg', '10px'],
    ] as const) {
      const localContainer = document.createElement('div');
      document.body.appendChild(localContainer);
      act(() => {
        createRoot(localContainer).render(<Badge dot size={size} testID={`dot-${size}`} />);
      });
      const span = localContainer.querySelector(`[data-testid="dot-${size}"]`) as HTMLSpanElement;
      expect(span.style.width).toBe(expected);
      expect(span.style.height).toBe(expected);
      localContainer.remove();
    }
  });
});
