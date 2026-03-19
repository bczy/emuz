/**
 * Button component tests
 *
 * Covers: basic render, variants, sizes, disabled, loading, icons, onClick
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Button } from '../components/Button/Button';

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

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Button — basic rendering', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(container.textContent).toContain('Click me');
  });

  it('renders a <button> element', () => {
    render(<Button>OK</Button>);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('renders with data-testid when testID is provided', () => {
    render(<Button testID="my-btn">OK</Button>);
    const btn = container.querySelector('[data-testid="my-btn"]');
    expect(btn).not.toBeNull();
  });

  it('renders with aria-label when provided', () => {
    render(<Button aria-label="submit form">Submit</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('submit form');
  });

  it('defaults to type="button"', () => {
    render(<Button>OK</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('button');
  });

  it('respects the type prop', () => {
    render(<Button type="submit">Submit</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// ---------------------------------------------------------------------------

describe('Button — disabled state', () => {
  it('is disabled when disabled=true', () => {
    render(<Button disabled>OK</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('sets aria-disabled=true when disabled', () => {
    render(<Button disabled>OK</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        OK
      </Button>
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      btn.click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('Button — loading state', () => {
  it('renders an svg spinner when loading=true', () => {
    render(<Button loading>OK</Button>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('hides children text when loading', () => {
    render(<Button loading>Click me</Button>);
    // children are replaced by spinner, text should not appear
    expect(container.textContent).not.toContain('Click me');
  });

  it('is disabled when loading=true', () => {
    render(<Button loading>OK</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('sets aria-busy=true when loading', () => {
    render(<Button loading>OK</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('does not call onClick when loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        OK
      </Button>
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      btn.click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// onClick
// ---------------------------------------------------------------------------

describe('Button — onClick', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      btn.click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

describe('Button — icons', () => {
  it('renders left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">L</span>}>Text</Button>);
    expect(container.querySelector('[data-testid="left-icon"]')).not.toBeNull();
  });

  it('renders right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">R</span>}>Text</Button>);
    expect(container.querySelector('[data-testid="right-icon"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Variants (smoke — just ensure they render without throwing)
// ---------------------------------------------------------------------------

describe('Button — variants', () => {
  for (const variant of ['primary', 'secondary', 'ghost', 'danger'] as const) {
    it(`renders variant="${variant}"`, () => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(container.textContent).toContain(variant);
    });
  }
});

// ---------------------------------------------------------------------------
// Sizes (smoke)
// ---------------------------------------------------------------------------

describe('Button — sizes', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`renders size="${size}"`, () => {
      render(<Button size={size}>{size}</Button>);
      expect(container.textContent).toContain(size);
    });
  }
});

// ---------------------------------------------------------------------------
// fullWidth
// ---------------------------------------------------------------------------

describe('Button — fullWidth', () => {
  it('renders without throwing when fullWidth=true', () => {
    render(<Button fullWidth>Full</Button>);
    expect(container.textContent).toContain('Full');
  });
});
