/**
 * widgetsStore — unit tests
 *
 * Tests: CRUD, reorder, visibility, resize, move, widget data cache
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWidgetsStore } from '../stores/widgetsStore';
import type { Widget } from '../models/Widget';

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const localStorageStub: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  writable: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWidget(id: string, position: number, overrides: Partial<Widget> = {}): Widget {
  const now = new Date();
  return {
    id,
    type: 'recent_games',
    size: 'medium',
    position,
    isVisible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function resetStore(): void {
  useWidgetsStore.setState({
    widgets: [],
    isEditing: false,
    isLoading: false,
    loadingWidgetId: null,
    widgetData: new Map(),
  });
}

const W1 = makeWidget('w1', 0);
const W2 = makeWidget('w2', 1);
const W3 = makeWidget('w3', 2);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('widgetsStore — CRUD', () => {
  beforeEach(resetStore);

  it('setWidgets replaces the widget list', () => {
    useWidgetsStore.getState().setWidgets([W1, W2]);
    expect(useWidgetsStore.getState().widgets).toHaveLength(2);
  });

  it('addWidget appends a widget', () => {
    useWidgetsStore.getState().setWidgets([W1]);
    useWidgetsStore.getState().addWidget(W2);
    expect(useWidgetsStore.getState().widgets).toHaveLength(2);
  });

  it('updateWidget patches a widget by id', () => {
    useWidgetsStore.getState().setWidgets([W1]);
    useWidgetsStore.getState().updateWidget('w1', { size: 'large' });
    expect(useWidgetsStore.getState().widgets[0].size).toBe('large');
  });

  it('updateWidget does not touch other widgets', () => {
    useWidgetsStore.getState().setWidgets([W1, W2]);
    useWidgetsStore.getState().updateWidget('w1', { size: 'small' });
    expect(useWidgetsStore.getState().widgets[1].size).toBe('medium');
  });

  it('removeWidget removes a widget by id', () => {
    useWidgetsStore.getState().setWidgets([W1, W2]);
    useWidgetsStore.getState().removeWidget('w1');
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
    expect(useWidgetsStore.getState().widgets[0].id).toBe('w2');
  });
});

describe('widgetsStore — reorder', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2, W3]);
  });

  it('reorderWidgets assigns positions by index order', () => {
    useWidgetsStore.getState().reorderWidgets(['w3', 'w1', 'w2']);
    const widgets = useWidgetsStore.getState().widgets;
    const byId = Object.fromEntries(widgets.map((w) => [w.id, w.position]));
    expect(byId['w3']).toBe(0);
    expect(byId['w1']).toBe(1);
    expect(byId['w2']).toBe(2);
  });
});

describe('widgetsStore — visibility', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2]);
  });

  it('toggleWidgetVisibility hides a visible widget', () => {
    useWidgetsStore.getState().toggleWidgetVisibility('w1');
    const w = useWidgetsStore.getState().widgets.find((w) => w.id === 'w1') as Widget;
    expect(w.isVisible).toBe(false);
  });

  it('toggleWidgetVisibility shows a hidden widget', () => {
    useWidgetsStore.getState().setWidgets([makeWidget('w1', 0, { isVisible: false })]);
    useWidgetsStore.getState().toggleWidgetVisibility('w1');
    expect(useWidgetsStore.getState().widgets[0].isVisible).toBe(true);
  });

  it('getVisibleWidgets returns only visible widgets sorted by position', () => {
    useWidgetsStore
      .getState()
      .setWidgets([
        makeWidget('w1', 2, { isVisible: true }),
        makeWidget('w2', 0, { isVisible: false }),
        makeWidget('w3', 1, { isVisible: true }),
      ]);
    const visible = useWidgetsStore.getState().getVisibleWidgets();
    expect(visible.map((w) => w.id)).toEqual(['w3', 'w1']);
  });
});

describe('widgetsStore — resize', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1]);
  });

  it('resizeWidget updates the size of a widget', () => {
    useWidgetsStore.getState().resizeWidget('w1', 'large');
    expect(useWidgetsStore.getState().widgets[0].size).toBe('large');
  });
});

describe('widgetsStore — move', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2, W3]);
  });

  it('moveWidget up swaps positions with previous widget', () => {
    useWidgetsStore.getState().moveWidget('w2', 'up');
    const state = useWidgetsStore.getState();
    const byId = Object.fromEntries(state.widgets.map((w) => [w.id, w.position]));
    expect(byId['w2']).toBe(0);
    expect(byId['w1']).toBe(1);
  });

  it('moveWidget down swaps positions with next widget', () => {
    useWidgetsStore.getState().moveWidget('w2', 'down');
    const state = useWidgetsStore.getState();
    const byId = Object.fromEntries(state.widgets.map((w) => [w.id, w.position]));
    expect(byId['w2']).toBe(2);
    expect(byId['w3']).toBe(1);
  });

  it('moveWidget up on first widget is a no-op', () => {
    const before = (useWidgetsStore.getState().widgets.find((w) => w.id === 'w1') as Widget)
      .position;
    useWidgetsStore.getState().moveWidget('w1', 'up');
    const after = (useWidgetsStore.getState().widgets.find((w) => w.id === 'w1') as Widget)
      .position;
    expect(after).toBe(before);
  });

  it('moveWidget down on last widget is a no-op', () => {
    const before = (useWidgetsStore.getState().widgets.find((w) => w.id === 'w3') as Widget)
      .position;
    useWidgetsStore.getState().moveWidget('w3', 'down');
    const after = (useWidgetsStore.getState().widgets.find((w) => w.id === 'w3') as Widget)
      .position;
    expect(after).toBe(before);
  });
});

describe('widgetsStore — widget data cache', () => {
  beforeEach(resetStore);

  it('setWidgetData stores data for a widget', () => {
    useWidgetsStore.getState().setWidgetData('w1', { count: 5 });
    expect(useWidgetsStore.getState().getWidgetData('w1')).toEqual({ count: 5 });
  });

  it('getWidgetData returns undefined for unknown widget', () => {
    expect(useWidgetsStore.getState().getWidgetData('unknown')).toBeUndefined();
  });

  it('clearWidgetData(id) removes data for a specific widget', () => {
    useWidgetsStore.getState().setWidgetData('w1', { count: 5 });
    useWidgetsStore.getState().setWidgetData('w2', { count: 3 });
    useWidgetsStore.getState().clearWidgetData('w1');
    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
    expect(useWidgetsStore.getState().getWidgetData('w2')).toEqual({ count: 3 });
  });

  it('clearWidgetData() with no args clears all data', () => {
    useWidgetsStore.getState().setWidgetData('w1', { count: 5 });
    useWidgetsStore.getState().setWidgetData('w2', { count: 3 });
    useWidgetsStore.getState().clearWidgetData();
    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
    expect(useWidgetsStore.getState().getWidgetData('w2')).toBeUndefined();
  });
});

describe('widgetsStore — editing mode', () => {
  beforeEach(resetStore);

  it('setEditing sets isEditing to true', () => {
    useWidgetsStore.getState().setEditing(true);
    expect(useWidgetsStore.getState().isEditing).toBe(true);
  });

  it('setEditing sets isEditing to false', () => {
    useWidgetsStore.getState().setEditing(true);
    useWidgetsStore.getState().setEditing(false);
    expect(useWidgetsStore.getState().isEditing).toBe(false);
  });
});

describe('widgetsStore — loading', () => {
  beforeEach(resetStore);

  it('setLoading updates isLoading', () => {
    useWidgetsStore.getState().setLoading(true);
    expect(useWidgetsStore.getState().isLoading).toBe(true);
  });

  it('setLoadingWidget tracks which widget is loading', () => {
    useWidgetsStore.getState().setLoadingWidget('w1');
    expect(useWidgetsStore.getState().loadingWidgetId).toBe('w1');
  });

  it('setLoadingWidget(null) clears the loading widget', () => {
    useWidgetsStore.getState().setLoadingWidget('w1');
    useWidgetsStore.getState().setLoadingWidget(null);
    expect(useWidgetsStore.getState().loadingWidgetId).toBeNull();
  });
});
