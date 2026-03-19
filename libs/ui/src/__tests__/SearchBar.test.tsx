/**
 * SearchBar component tests
 *
 * Tests: rendering, input handling, clear button, submit on Enter, disabled state, loading state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { SearchBar } from '../components/SearchBar';

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

function getInput(): HTMLInputElement {
  return container.querySelector('input[type="text"]') as HTMLInputElement;
}

function _simulateInput(input: HTMLInputElement, value: string): void {
  act(() => {
    Object.defineProperty(input, 'value', { value, configurable: true });
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(Object.assign(new Event('change', { bubbles: true }), { target: input }));
    // React synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('SearchBar — rendering', () => {
  it('renders an input with aria-label "Search"', () => {
    render(<SearchBar />);
    const input = getInput();
    expect(input).not.toBeNull();
    expect(input.getAttribute('aria-label')).toBe('Search');
  });

  it('shows custom placeholder', () => {
    render(<SearchBar placeholder="Find a ROM..." />);
    expect(getInput().placeholder).toBe('Find a ROM...');
  });

  it('renders with testID data attribute', () => {
    render(<SearchBar testID="search-1" />);
    expect(container.querySelector('[data-testid="search-1"]')).not.toBeNull();
  });

  it('shows keyboard shortcut hint by default when empty', () => {
    render(<SearchBar shortcutKey="/" showShortcutHint={true} />);
    expect(container.textContent).toContain('/');
  });

  it('hides shortcut hint when showShortcutHint=false', () => {
    // The shortcut hint is a <span> containing only the key character
    // We verify the dedicated hint span is absent by checking no standalone "/" appears
    render(<SearchBar shortcutKey="/" showShortcutHint={false} />);
    // Input placeholder may contain "/" but the hint span should be absent
    const spans = Array.from(container.querySelectorAll('span'));
    const hintSpan = spans.find((s) => s.textContent === '/');
    expect(hintSpan).toBeUndefined();
  });
});

describe('SearchBar — external value sync', () => {
  it('displays the provided value prop', () => {
    render(<SearchBar value="zelda" />);
    expect(getInput().value).toBe('zelda');
  });

  it('updates when value prop changes', () => {
    render(<SearchBar value="zelda" />);
    expect(getInput().value).toBe('zelda');
    render(<SearchBar value="metroid" />);
    expect(getInput().value).toBe('metroid');
  });
});

describe('SearchBar — clear button', () => {
  it('shows clear button when value is provided', () => {
    render(<SearchBar value="zelda" />);
    const clearBtn = container.querySelector('[aria-label="Clear search"]');
    expect(clearBtn).not.toBeNull();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" />);
    expect(container.querySelector('[aria-label="Clear search"]')).toBeNull();
  });

  it('calls onClear and onChange("") when clear button is clicked', () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    render(<SearchBar value="zelda" onClear={onClear} onChange={onChange} debounceMs={0} />);
    act(() => {
      (container.querySelector('[aria-label="Clear search"]') as HTMLElement).click();
    });
    expect(onClear).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('SearchBar — submit on Enter', () => {
  it('calls onSubmit with current value when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(<SearchBar value="mario" onSubmit={onSubmit} />);
    act(() => {
      getInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onSubmit).toHaveBeenCalledWith('mario');
  });
});

describe('SearchBar — disabled state', () => {
  it('disables the input when disabled=true', () => {
    render(<SearchBar disabled={true} />);
    expect(getInput().disabled).toBe(true);
  });
});

describe('SearchBar — loading state', () => {
  it('hides clear button when loading', () => {
    render(<SearchBar value="zelda" loading={true} />);
    expect(container.querySelector('[aria-label="Clear search"]')).toBeNull();
  });
});

describe('SearchBar — focus/blur handlers', () => {
  it('calls onFocus when input is focused', () => {
    const onFocus = vi.fn();
    render(<SearchBar onFocus={onFocus} />);
    act(() => {
      getInput().focus();
    });
    expect(onFocus).toHaveBeenCalledOnce();
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = vi.fn();
    render(<SearchBar onBlur={onBlur} />);
    act(() => {
      getInput().focus();
      getInput().blur();
    });
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
