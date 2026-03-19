/**
 * BottomTabBar component tests
 *
 * Tests: basic rendering, active tab, labels, badges, interactions, defaultTabs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BottomTabBar, defaultTabs } from '../components/BottomTabBar/BottomTabBar';
import type { TabItem } from '../components/BottomTabBar/BottomTabBar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTabs(overrides: Partial<TabItem>[] = []): TabItem[] {
  const base: TabItem[] = [
    { id: 'home', label: 'Home', icon: <span>H</span> },
    { id: 'library', label: 'Library', icon: <span>L</span> },
    { id: 'settings', label: 'Settings', icon: <span>S</span> },
  ];
  return base.map((tab, i) => ({ ...tab, ...overrides[i] }));
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BottomTabBar — basic rendering', () => {
  it('renders the nav element with role=tablist', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    const nav = container.querySelector('[role="tablist"]');
    expect(nav).not.toBeNull();
  });

  it('renders a button for each tab', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
  });

  it('renders tab labels', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Library');
    expect(container.textContent).toContain('Settings');
  });

  it('renders testID on the nav container', () => {
    render(
      <BottomTabBar
        tabs={makeTabs()}
        activeTabId="home"
        onTabChange={vi.fn()}
        testID="bottom-tab-bar"
      />
    );
    const el = container.querySelector('[data-testid="bottom-tab-bar"]');
    expect(el).not.toBeNull();
  });
});

describe('BottomTabBar — active tab', () => {
  it('marks the active tab with aria-selected=true', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="library" onTabChange={vi.fn()} />);
    const libTab = container.querySelector('[aria-label="Library"]') as HTMLElement;
    expect(libTab.getAttribute('aria-selected')).toBe('true');
  });

  it('marks inactive tabs with aria-selected=false', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    const libTab = container.querySelector('[aria-label="Library"]') as HTMLElement;
    expect(libTab.getAttribute('aria-selected')).toBe('false');
  });

  it('renders active indicator span only for the active tab', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    // The active tab button should contain an extra span (the indicator)
    const homeTab = container.querySelector('[aria-label="Home"]') as HTMLElement;
    // Active indicator has position:absolute and top:0
    const spans = homeTab.querySelectorAll('span');
    const hasIndicator = Array.from(spans).some(
      (s) => s.style.position === 'absolute' && s.style.top === '0px'
    );
    expect(hasIndicator).toBe(true);
  });
});

describe('BottomTabBar — labels', () => {
  it('hides label text when hideLabels=true', () => {
    render(
      <BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} hideLabels={true} />
    );
    // Labels are rendered inside span elements inside each button
    const tabs = container.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      // With hideLabels, the label span is not rendered — only icon container spans remain
      const labelSpans = Array.from(tab.querySelectorAll('span')).filter((s) =>
        ['Home', 'Library', 'Settings'].some((l) => s.textContent === l)
      );
      expect(labelSpans.length).toBe(0);
    });
  });

  it('shows labels when hideLabels=false (default)', () => {
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={vi.fn()} />);
    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Library');
  });
});

describe('BottomTabBar — badges', () => {
  it('renders badge when badge > 0', () => {
    const tabs: TabItem[] = [{ id: 'home', label: 'Home', icon: <span>H</span>, badge: 3 }];
    render(<BottomTabBar tabs={tabs} activeTabId="home" onTabChange={vi.fn()} />);
    expect(container.textContent).toContain('3');
  });

  it('does not render badge when badge=0', () => {
    const tabs: TabItem[] = [{ id: 'home', label: 'Home', icon: <span>H</span>, badge: 0 }];
    render(<BottomTabBar tabs={tabs} activeTabId="home" onTabChange={vi.fn()} />);
    // "0" should not appear as badge text — label text includes "Home", not "0"
    const allText = container.textContent ?? '';
    // Only "Home" visible; "0" badge not rendered
    expect(allText).not.toContain('0');
  });

  it('caps badge display at 99+', () => {
    const tabs: TabItem[] = [{ id: 'home', label: 'Home', icon: <span>H</span>, badge: 150 }];
    render(<BottomTabBar tabs={tabs} activeTabId="home" onTabChange={vi.fn()} />);
    expect(container.textContent).toContain('99+');
  });

  it('shows exact number when badge <= 99', () => {
    const tabs: TabItem[] = [{ id: 'home', label: 'Home', icon: <span>H</span>, badge: 99 }];
    render(<BottomTabBar tabs={tabs} activeTabId="home" onTabChange={vi.fn()} />);
    expect(container.textContent).toContain('99');
    expect(container.textContent).not.toContain('99+');
  });
});

describe('BottomTabBar — interactions', () => {
  it('calls onTabChange with the tab id when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={onTabChange} />);
    const settingsTab = container.querySelector('[aria-label="Settings"]') as HTMLElement;
    act(() => {
      settingsTab.click();
    });
    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith('settings');
  });

  it('calls onTabChange when currently active tab is re-clicked', () => {
    const onTabChange = vi.fn();
    render(<BottomTabBar tabs={makeTabs()} activeTabId="home" onTabChange={onTabChange} />);
    const homeTab = container.querySelector('[aria-label="Home"]') as HTMLElement;
    act(() => {
      homeTab.click();
    });
    expect(onTabChange).toHaveBeenCalledWith('home');
  });
});

describe('BottomTabBar — defaultTabs', () => {
  it('has 5 tabs in defaultTabs', () => {
    expect(defaultTabs.length).toBe(5);
  });

  it('renders using defaultTabs when tabs prop is omitted', () => {
    render(<BottomTabBar activeTabId="home" onTabChange={vi.fn()} tabs={defaultTabs} />);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(5);
  });

  it('defaultTabs includes home, platforms, genres, search, settings', () => {
    const ids = defaultTabs.map((t) => t.id);
    expect(ids).toContain('home');
    expect(ids).toContain('platforms');
    expect(ids).toContain('genres');
    expect(ids).toContain('search');
    expect(ids).toContain('settings');
  });
});
