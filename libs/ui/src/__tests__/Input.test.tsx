/**
 * Input component tests
 *
 * Covers: basic render, types, sizes, disabled, readOnly, error state,
 *         icons, onChange/onFocus/onBlur/onKeyDown handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Input } from '../components/Input/Input';

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

function getInput(): HTMLInputElement {
  return container.querySelector('input') as HTMLInputElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Input — basic rendering', () => {
  it('renders an <input> element', () => {
    render(<Input />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('renders with data-testid when testID is provided', () => {
    render(<Input testID="my-input" />);
    expect(container.querySelector('[data-testid="my-input"]')).not.toBeNull();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Search games…" />);
    expect(getInput().placeholder).toBe('Search games…');
  });

  it('renders with aria-label', () => {
    render(<Input aria-label="Search" />);
    expect(getInput().getAttribute('aria-label')).toBe('Search');
  });

  it('defaults to type="text"', () => {
    render(<Input />);
    expect(getInput().type).toBe('text');
  });

  it('respects the type prop', () => {
    render(<Input type="password" />);
    expect(getInput().type).toBe('password');
  });

  it('renders with a controlled value', () => {
    render(<Input value="hello" onChange={vi.fn()} />);
    expect(getInput().value).toBe('hello');
  });

  it('renders with a name attribute', () => {
    render(<Input name="query" />);
    expect(getInput().name).toBe('query');
  });
});

// ---------------------------------------------------------------------------
// Disabled / readOnly
// ---------------------------------------------------------------------------

describe('Input — disabled state', () => {
  it('is disabled when disabled=true', () => {
    render(<Input disabled />);
    expect(getInput().disabled).toBe(true);
  });
});

describe('Input — readOnly state', () => {
  it('is readOnly when readOnly=true', () => {
    render(<Input readOnly value="fixed" onChange={vi.fn()} />);
    expect(getInput().readOnly).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe('Input — error state', () => {
  it('sets aria-invalid=true when error=true', () => {
    render(<Input error />);
    expect(getInput().getAttribute('aria-invalid')).toBe('true');
  });

  it('does not show errorMessage when error=false', () => {
    render(<Input error={false} errorMessage="Bad value" />);
    expect(container.textContent).not.toContain('Bad value');
  });

  it('shows errorMessage when error=true and errorMessage is provided', () => {
    render(<Input error errorMessage="Required field" />);
    expect(container.textContent).toContain('Required field');
  });
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

describe('Input — onChange handler', () => {
  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} />);
    const input = getInput();
    act(() => {
      // Setting .value and dispatching an 'input' event triggers React's synthetic onChange
      (
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ) as PropertyDescriptor
      ).set?.call(input, 'abc');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe('Input — onFocus / onBlur handlers', () => {
  it('calls onFocus when input receives focus', () => {
    const onFocus = vi.fn();
    render(<Input onFocus={onFocus} />);
    act(() => {
      // Use .focus() so jsdom triggers the real focus event that React listens to
      getInput().focus();
    });
    expect(onFocus).toHaveBeenCalledOnce();
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = vi.fn();
    render(<Input onBlur={onBlur} />);
    act(() => {
      getInput().focus();
    });
    act(() => {
      getInput().blur();
    });
    expect(onBlur).toHaveBeenCalledOnce();
  });
});

describe('Input — onKeyDown handler', () => {
  it('calls onKeyDown on key press', () => {
    const onKeyDown = vi.fn();
    render(<Input onKeyDown={onKeyDown} />);
    act(() => {
      getInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

describe('Input — icons', () => {
  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />);
    expect(container.querySelector('[data-testid="left-icon"]')).not.toBeNull();
  });

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />);
    expect(container.querySelector('[data-testid="right-icon"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sizes (smoke)
// ---------------------------------------------------------------------------

describe('Input — sizes', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`renders size="${size}" without throwing`, () => {
      render(<Input size={size} placeholder={size} />);
      expect(getInput().placeholder).toBe(size);
    });
  }
});
