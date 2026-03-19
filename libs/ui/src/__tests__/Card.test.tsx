/**
 * Card component tests
 *
 * Covers: basic render, variants, padding, clickable, selected, disabled, onClick
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Card } from '../components/Card/Card';

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

function getCard(): HTMLDivElement {
  return container.querySelector('div') as HTMLDivElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Card — basic rendering', () => {
  it('renders children', () => {
    render(<Card>Hello Card</Card>);
    expect(container.textContent).toContain('Hello Card');
  });

  it('renders with data-testid when testID is provided', () => {
    render(<Card testID="card-1">Content</Card>);
    expect(container.querySelector('[data-testid="card-1"]')).not.toBeNull();
  });

  it('does not set role by default (non-clickable)', () => {
    render(<Card>Content</Card>);
    expect(getCard().getAttribute('role')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Clickable
// ---------------------------------------------------------------------------

describe('Card — clickable', () => {
  it('sets role="button" when clickable=true', () => {
    render(<Card clickable>Content</Card>);
    expect(container.querySelector('[role="button"]')).not.toBeNull();
  });

  it('sets tabIndex=0 when clickable and not disabled', () => {
    render(<Card clickable>Content</Card>);
    expect(getCard().tabIndex).toBe(0);
  });

  it('calls onClick when clicked and clickable=true', () => {
    const onClick = vi.fn();
    render(
      <Card clickable onClick={onClick}>
        Content
      </Card>
    );
    act(() => {
      getCard().click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when not clickable', () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Content</Card>);
    act(() => {
      getCard().click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// ---------------------------------------------------------------------------

describe('Card — disabled state', () => {
  it('sets aria-disabled=true when disabled', () => {
    render(<Card disabled>Content</Card>);
    expect(getCard().getAttribute('aria-disabled')).toBe('true');
  });

  it('does not call onClick when disabled and clickable', () => {
    const onClick = vi.fn();
    render(
      <Card clickable disabled onClick={onClick}>
        Content
      </Card>
    );
    act(() => {
      getCard().click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Selected state
// ---------------------------------------------------------------------------

describe('Card — selected state', () => {
  it('renders without throwing when selected=true', () => {
    render(<Card selected>Selected</Card>);
    expect(container.textContent).toContain('Selected');
  });
});

// ---------------------------------------------------------------------------
// Variants (smoke)
// ---------------------------------------------------------------------------

describe('Card — variants', () => {
  for (const variant of ['default', 'outlined', 'elevated'] as const) {
    it(`renders variant="${variant}"`, () => {
      render(<Card variant={variant}>variant</Card>);
      expect(container.textContent).toContain('variant');
    });
  }
});

// ---------------------------------------------------------------------------
// Padding (smoke)
// ---------------------------------------------------------------------------

describe('Card — padding', () => {
  for (const padding of ['none', 'sm', 'md', 'lg'] as const) {
    it(`renders padding="${padding}"`, () => {
      render(<Card padding={padding}>pad</Card>);
      expect(container.textContent).toContain('pad');
    });
  }
});

// ---------------------------------------------------------------------------
// Custom role
// ---------------------------------------------------------------------------

describe('Card — custom role', () => {
  it('uses the provided role prop', () => {
    render(<Card role="article">Content</Card>);
    expect(container.querySelector('[role="article"]')).not.toBeNull();
  });
});
