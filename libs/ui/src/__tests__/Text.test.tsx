/**
 * Text component tests
 *
 * Tests: basic rendering, variants (HTML element mapping), colors,
 *        alignment, weight, truncation, testID
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Text } from '../components/Text/Text';

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Text — basic rendering', () => {
  it('renders children text content', () => {
    render(<Text>Hello World</Text>);
    expect(container.textContent).toContain('Hello World');
  });

  it('renders a testID data attribute', () => {
    render(<Text testID="my-text">Test</Text>);
    const el = container.querySelector('[data-testid="my-text"]');
    expect(el).not.toBeNull();
  });

  it('defaults to a <p> element for body variant', () => {
    render(<Text testID="body-text">Body</Text>);
    const el = container.querySelector('[data-testid="body-text"]');
    expect(el?.tagName.toLowerCase()).toBe('p');
  });
});

describe('Text — HTML element mapping', () => {
  const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

  headingVariants.forEach((variant) => {
    it(`variant="${variant}" renders a <${variant}> element`, () => {
      render(
        <Text variant={variant} testID={`text-${variant}`}>
          Heading
        </Text>
      );
      const el = container.querySelector(`[data-testid="text-${variant}"]`);
      expect(el?.tagName.toLowerCase()).toBe(variant);
    });
  });

  it('variant="body" renders a <p> element', () => {
    render(
      <Text variant="body" testID="text-body">
        Body
      </Text>
    );
    const el = container.querySelector('[data-testid="text-body"]');
    expect(el?.tagName.toLowerCase()).toBe('p');
  });

  it('variant="bodySmall" renders a <p> element', () => {
    render(
      <Text variant="bodySmall" testID="text-bodySmall">
        Small
      </Text>
    );
    const el = container.querySelector('[data-testid="text-bodySmall"]');
    expect(el?.tagName.toLowerCase()).toBe('p');
  });

  it('variant="caption" renders a <p> element', () => {
    render(
      <Text variant="caption" testID="text-caption">
        Caption
      </Text>
    );
    const el = container.querySelector('[data-testid="text-caption"]');
    expect(el?.tagName.toLowerCase()).toBe('p');
  });

  it('variant="label" renders a <label> element', () => {
    render(
      <Text variant="label" testID="text-label">
        Label
      </Text>
    );
    const el = container.querySelector('[data-testid="text-label"]');
    expect(el?.tagName.toLowerCase()).toBe('label');
  });

  it('variant="code" renders a <code> element', () => {
    render(
      <Text variant="code" testID="text-code">
        const x = 1;
      </Text>
    );
    const el = container.querySelector('[data-testid="text-code"]');
    expect(el?.tagName.toLowerCase()).toBe('code');
  });
});

describe('Text — colors', () => {
  it('applies primary color by default', () => {
    render(<Text testID="text-default">Default</Text>);
    const el = container.querySelector('[data-testid="text-default"]') as HTMLElement;
    expect(el.style.color).toContain('#F8FAFC');
  });

  it('applies accent color', () => {
    render(
      <Text color="accent" testID="text-accent">
        Accent
      </Text>
    );
    const el = container.querySelector('[data-testid="text-accent"]') as HTMLElement;
    expect(el.style.color).toContain('#10B981');
  });

  it('applies error color', () => {
    render(
      <Text color="error" testID="text-error">
        Error
      </Text>
    );
    const el = container.querySelector('[data-testid="text-error"]') as HTMLElement;
    expect(el.style.color).toContain('#EF4444');
  });

  it('applies success color', () => {
    render(
      <Text color="success" testID="text-success">
        Success
      </Text>
    );
    const el = container.querySelector('[data-testid="text-success"]') as HTMLElement;
    expect(el.style.color).toContain('#22C55E');
  });

  it('applies warning color', () => {
    render(
      <Text color="warning" testID="text-warning">
        Warning
      </Text>
    );
    const el = container.querySelector('[data-testid="text-warning"]') as HTMLElement;
    expect(el.style.color).toContain('#F59E0B');
  });

  it('applies muted color', () => {
    render(
      <Text color="muted" testID="text-muted">
        Muted
      </Text>
    );
    const el = container.querySelector('[data-testid="text-muted"]') as HTMLElement;
    expect(el.style.color).toContain('#64748B');
  });
});

describe('Text — alignment', () => {
  it('applies center alignment', () => {
    render(
      <Text align="center" testID="text-center">
        Centered
      </Text>
    );
    const el = container.querySelector('[data-testid="text-center"]') as HTMLElement;
    expect(el.style.textAlign).toBe('center');
  });

  it('applies right alignment', () => {
    render(
      <Text align="right" testID="text-right">
        Right
      </Text>
    );
    const el = container.querySelector('[data-testid="text-right"]') as HTMLElement;
    expect(el.style.textAlign).toBe('right');
  });

  it('applies left alignment', () => {
    render(
      <Text align="left" testID="text-left">
        Left
      </Text>
    );
    const el = container.querySelector('[data-testid="text-left"]') as HTMLElement;
    expect(el.style.textAlign).toBe('left');
  });

  it('does not set textAlign when align is not provided', () => {
    render(<Text testID="text-no-align">No align</Text>);
    const el = container.querySelector('[data-testid="text-no-align"]') as HTMLElement;
    expect(el.style.textAlign).toBe('');
  });
});

describe('Text — font weight', () => {
  it('applies bold weight', () => {
    render(
      <Text weight="bold" testID="text-bold">
        Bold
      </Text>
    );
    const el = container.querySelector('[data-testid="text-bold"]') as HTMLElement;
    expect(el.style.fontWeight).toBe('700');
  });

  it('applies semibold weight', () => {
    render(
      <Text weight="semibold" testID="text-semibold">
        Semibold
      </Text>
    );
    const el = container.querySelector('[data-testid="text-semibold"]') as HTMLElement;
    expect(el.style.fontWeight).toBe('600');
  });

  it('applies medium weight', () => {
    render(
      <Text weight="medium" testID="text-medium">
        Medium
      </Text>
    );
    const el = container.querySelector('[data-testid="text-medium"]') as HTMLElement;
    expect(el.style.fontWeight).toBe('500');
  });

  it('applies normal weight', () => {
    render(
      <Text weight="normal" testID="text-normal">
        Normal
      </Text>
    );
    const el = container.querySelector('[data-testid="text-normal"]') as HTMLElement;
    expect(el.style.fontWeight).toBe('400');
  });
});

describe('Text — truncation', () => {
  it('applies overflow:hidden and textOverflow:ellipsis when truncate=true', () => {
    render(
      <Text truncate={true} testID="text-truncate">
        Long long long text
      </Text>
    );
    const el = container.querySelector('[data-testid="text-truncate"]') as HTMLElement;
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(el.style.whiteSpace).toBe('nowrap');
  });

  it('does not apply truncation styles when truncate=false', () => {
    render(
      <Text truncate={false} testID="text-no-truncate">
        Short text
      </Text>
    );
    const el = container.querySelector('[data-testid="text-no-truncate"]') as HTMLElement;
    expect(el.style.textOverflow).toBe('');
  });
});

describe('Text — variant font sizes', () => {
  const variantFontSizes: Array<
    [NonNullable<React.ComponentProps<typeof Text>['variant']>, string]
  > = [
    ['h1', '48px'],
    ['h2', '36px'],
    ['h3', '30px'],
    ['h4', '24px'],
    ['h5', '20px'],
    ['h6', '18px'],
    ['body', '16px'],
    ['bodySmall', '14px'],
    ['caption', '12px'],
    ['label', '14px'],
    ['code', '14px'],
  ];

  variantFontSizes.forEach(([variant, expectedSize]) => {
    it(`variant="${variant}" has fontSize ${expectedSize}`, () => {
      render(
        <Text variant={variant} testID={`fs-${variant}`}>
          Content
        </Text>
      );
      const el = container.querySelector(`[data-testid="fs-${variant}"]`) as HTMLElement;
      expect(el.style.fontSize).toBe(expectedSize);
    });
  });
});

describe('Text — custom className and style', () => {
  it('forwards className to the root element', () => {
    render(
      <Text className="custom-class" testID="text-cls">
        Text
      </Text>
    );
    const el = container.querySelector('[data-testid="text-cls"]') as HTMLElement;
    expect(el.classList.contains('custom-class')).toBe(true);
  });

  it('forwards style overrides to the root element', () => {
    render(
      <Text style={{ letterSpacing: 2 }} testID="text-style">
        Text
      </Text>
    );
    const el = container.querySelector('[data-testid="text-style"]') as HTMLElement;
    expect(el.style.letterSpacing).toBe('2px');
  });
});

describe('Text — accessibility role', () => {
  it('forwards role prop to the root element', () => {
    render(
      <Text role="heading" testID="text-role">
        Heading
      </Text>
    );
    const el = container.querySelector('[data-testid="text-role"]') as HTMLElement;
    expect(el.getAttribute('role')).toBe('heading');
  });
});
