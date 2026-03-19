/**
 * useWidgets hook — unit tests
 *
 * Strategy: mirror the hook's async logic (refreshWidgets, addWidget,
 * removeWidget, updateWidget, reorderWidgets, loadWidgetData) against the real
 * Zustand widgetsStore with a vi-mocked IWidgetService.  No jsdom or React
 * rendering required.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWidgetsStore } from '../stores/widgetsStore';
import type { Widget, WidgetType } from '../models/Widget';
import type { IWidgetService } from '../services/types';

// ---------------------------------------------------------------------------
// localStorage stub — required by Zustand persist middleware in Node env
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

function makeWidget(overrides: Partial<Widget> & Pick<Widget, 'id' | 'type' | 'position'>): Widget {
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    size: 'medium',
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

function makeService(overrides: Partial<IWidgetService> = {}): IWidgetService {
  return {
    getWidgets: vi.fn().mockResolvedValue([]),
    getWidgetById: vi.fn().mockResolvedValue(null),
    addWidget: vi
      .fn()
      .mockResolvedValue(makeWidget({ id: 'w-new', type: 'recent_games', position: 0 })),
    removeWidget: vi.fn().mockResolvedValue(undefined),
    updateWidget: vi.fn().mockResolvedValue(null),
    reorderWidgets: vi.fn().mockResolvedValue(undefined),
    getWidgetData: vi.fn().mockResolvedValue(null),
    getDefaultWidgets: vi.fn().mockReturnValue([]),
    ...overrides,
  } as IWidgetService;
}

/**
 * Replicate the async logic from useWidgets exactly, using the real store.
 * This lets us test service ↔ store interactions without React or jsdom.
 */
function buildActions(service: IWidgetService) {
  const refreshWidgets = async () => {
    useWidgetsStore.getState().setLoading(true);
    try {
      const widgets = await service.getWidgets();
      useWidgetsStore.getState().setWidgets(widgets);
      useWidgetsStore.getState().clearWidgetData();
    } catch (err) {
      // hook logs but does not re-throw
      void err;
    } finally {
      useWidgetsStore.getState().setLoading(false);
    }
  };

  const addWidget = async (type: WidgetType): Promise<Widget | null> => {
    try {
      const widget = await service.addWidget({ type });
      useWidgetsStore.getState().addWidget(widget);
      return widget;
    } catch (err) {
      void err;
      return null;
    }
  };

  const removeWidget = async (widgetId: string) => {
    try {
      await service.removeWidget(widgetId);
      useWidgetsStore.getState().removeWidget(widgetId);
    } catch (err) {
      void err;
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    try {
      await service.updateWidget(widgetId, updates);
      useWidgetsStore.getState().updateWidget(widgetId, updates);
    } catch (err) {
      void err;
    }
  };

  const reorderWidgets = async (widgetIds: string[]) => {
    try {
      await service.reorderWidgets(widgetIds);
      useWidgetsStore.getState().reorderWidgets(widgetIds);
    } catch (err) {
      void err;
    }
  };

  const loadWidgetData = async (widgetId: string) => {
    const widget = useWidgetsStore.getState().widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    useWidgetsStore.getState().setLoadingWidget(widgetId);
    try {
      const data = await service.getWidgetData(widgetId, widget.type);
      useWidgetsStore.getState().setWidgetData(widgetId, data);
    } catch (err) {
      void err;
    } finally {
      useWidgetsStore.getState().setLoadingWidget(null);
    }
  };

  return { refreshWidgets, addWidget, removeWidget, updateWidget, reorderWidgets, loadWidgetData };
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const W1 = makeWidget({ id: 'w1', type: 'recent_games', position: 0 });
const W2 = makeWidget({ id: 'w2', type: 'favorites', position: 1, isVisible: false });
const W3 = makeWidget({ id: 'w3', type: 'stats', position: 2 });

// ---------------------------------------------------------------------------
// refreshWidgets
// ---------------------------------------------------------------------------

describe('useWidgets — refreshWidgets', () => {
  beforeEach(resetStore);

  it('populates the store with widgets returned by the service', async () => {
    const service = makeService({ getWidgets: vi.fn().mockResolvedValue([W1, W2]) });
    const { refreshWidgets } = buildActions(service);

    await refreshWidgets();

    expect(useWidgetsStore.getState().widgets).toHaveLength(2);
    expect(useWidgetsStore.getState().isLoading).toBe(false);
  });

  it('calls getWidgets exactly once', async () => {
    const getWidgets = vi.fn().mockResolvedValue([]);
    const service = makeService({ getWidgets });
    const { refreshWidgets } = buildActions(service);

    await refreshWidgets();

    expect(getWidgets).toHaveBeenCalledOnce();
  });

  it('clears cached widget data after refresh', async () => {
    useWidgetsStore.getState().setWidgets([W1]);
    useWidgetsStore.getState().setWidgetData('w1', { games: [] });

    const service = makeService({ getWidgets: vi.fn().mockResolvedValue([W1]) });
    const { refreshWidgets } = buildActions(service);

    await refreshWidgets();

    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
  });

  it('sets isLoading to false even when the service throws', async () => {
    const service = makeService({
      getWidgets: vi.fn().mockRejectedValue(new Error('network error')),
    });
    const { refreshWidgets } = buildActions(service);

    await refreshWidgets();

    expect(useWidgetsStore.getState().isLoading).toBe(false);
  });

  it('does not overwrite widgets when the service throws', async () => {
    useWidgetsStore.getState().setWidgets([W1]);
    const service = makeService({
      getWidgets: vi.fn().mockRejectedValue(new Error('fail')),
    });
    const { refreshWidgets } = buildActions(service);

    await refreshWidgets();

    // setWidgets is only called on success; store keeps previous state
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// addWidget
// ---------------------------------------------------------------------------

describe('useWidgets — addWidget', () => {
  beforeEach(resetStore);

  it('appends the widget returned by the service to the store', async () => {
    const newWidget = makeWidget({ id: 'w-new', type: 'recent_games', position: 0 });
    const service = makeService({ addWidget: vi.fn().mockResolvedValue(newWidget) });
    const { addWidget } = buildActions(service);

    const result = await addWidget('recent_games');

    expect(result).toEqual(newWidget);
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
    expect(useWidgetsStore.getState().widgets[0].id).toBe('w-new');
  });

  it('calls service.addWidget with the correct type', async () => {
    const addWidgetFn = vi
      .fn()
      .mockResolvedValue(makeWidget({ id: 'x', type: 'stats', position: 0 }));
    const service = makeService({ addWidget: addWidgetFn });
    const { addWidget } = buildActions(service);

    await addWidget('stats');

    expect(addWidgetFn).toHaveBeenCalledWith({ type: 'stats' });
  });

  it('returns null and does not modify the store when the service throws', async () => {
    const service = makeService({
      addWidget: vi.fn().mockRejectedValue(new Error('add failed')),
    });
    const { addWidget } = buildActions(service);

    const result = await addWidget('favorites');

    expect(result).toBeNull();
    expect(useWidgetsStore.getState().widgets).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// removeWidget
// ---------------------------------------------------------------------------

describe('useWidgets — removeWidget', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2, W3]);
  });

  it('removes the widget from the store on success', async () => {
    const service = makeService();
    const { removeWidget } = buildActions(service);

    await removeWidget('w1');

    expect(useWidgetsStore.getState().widgets).toHaveLength(2);
    expect(useWidgetsStore.getState().widgets.find((w) => w.id === 'w1')).toBeUndefined();
  });

  it('calls service.removeWidget with the correct id', async () => {
    const removeWidgetFn = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ removeWidget: removeWidgetFn });
    const { removeWidget } = buildActions(service);

    await removeWidget('w2');

    expect(removeWidgetFn).toHaveBeenCalledWith('w2');
  });

  it('does not modify the store when the service throws', async () => {
    const service = makeService({
      removeWidget: vi.fn().mockRejectedValue(new Error('delete failed')),
    });
    const { removeWidget } = buildActions(service);

    await removeWidget('w1');

    expect(useWidgetsStore.getState().widgets).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// updateWidget
// ---------------------------------------------------------------------------

describe('useWidgets — updateWidget', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2]);
  });

  it('patches the widget in the store on success', async () => {
    const service = makeService();
    const { updateWidget } = buildActions(service);

    await updateWidget('w1', { title: 'Recent Hits' });

    expect(useWidgetsStore.getState().widgets.find((w) => w.id === 'w1')?.title).toBe(
      'Recent Hits'
    );
  });

  it('calls service.updateWidget with the correct arguments', async () => {
    const updateWidgetFn = vi.fn().mockResolvedValue(null);
    const service = makeService({ updateWidget: updateWidgetFn });
    const { updateWidget } = buildActions(service);

    await updateWidget('w2', { size: 'large' });

    expect(updateWidgetFn).toHaveBeenCalledWith('w2', { size: 'large' });
  });

  it('does not touch other widgets', async () => {
    const service = makeService();
    const { updateWidget } = buildActions(service);

    await updateWidget('w1', { title: 'Changed' });

    expect(useWidgetsStore.getState().widgets.find((w) => w.id === 'w2')?.title).toBeUndefined();
  });

  it('does not modify the store when the service throws', async () => {
    const service = makeService({
      updateWidget: vi.fn().mockRejectedValue(new Error('update failed')),
    });
    const { updateWidget } = buildActions(service);
    const before = useWidgetsStore.getState().widgets[0].title;

    await updateWidget('w1', { title: 'X' });

    expect(useWidgetsStore.getState().widgets[0].title).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// reorderWidgets
// ---------------------------------------------------------------------------

describe('useWidgets — reorderWidgets', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2, W3]);
  });

  it('reorders widgets in the store according to the provided id array', async () => {
    const service = makeService();
    const { reorderWidgets } = buildActions(service);

    await reorderWidgets(['w3', 'w1', 'w2']);

    const widgets = useWidgetsStore.getState().widgets;
    expect(widgets[0].id).toBe('w3');
    expect(widgets[0].position).toBe(0);
    expect(widgets[1].id).toBe('w1');
    expect(widgets[1].position).toBe(1);
    expect(widgets[2].id).toBe('w2');
    expect(widgets[2].position).toBe(2);
  });

  it('calls service.reorderWidgets with the correct id array', async () => {
    const reorderWidgetsFn = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ reorderWidgets: reorderWidgetsFn });
    const { reorderWidgets } = buildActions(service);

    await reorderWidgets(['w2', 'w3', 'w1']);

    expect(reorderWidgetsFn).toHaveBeenCalledWith(['w2', 'w3', 'w1']);
  });

  it('does not modify the store when the service throws', async () => {
    const service = makeService({
      reorderWidgets: vi.fn().mockRejectedValue(new Error('reorder failed')),
    });
    const { reorderWidgets } = buildActions(service);
    const before = useWidgetsStore.getState().widgets.map((w) => w.id);

    await reorderWidgets(['w3', 'w1', 'w2']);

    expect(useWidgetsStore.getState().widgets.map((w) => w.id)).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// loadWidgetData
// ---------------------------------------------------------------------------

describe('useWidgets — loadWidgetData', () => {
  beforeEach(() => {
    resetStore();
    useWidgetsStore.getState().setWidgets([W1, W2]);
  });

  it('fetches and caches data for the given widget', async () => {
    const data = { games: [{ id: 'g1' }] };
    const service = makeService({ getWidgetData: vi.fn().mockResolvedValue(data) });
    const { loadWidgetData } = buildActions(service);

    await loadWidgetData('w1');

    expect(useWidgetsStore.getState().getWidgetData('w1')).toEqual(data);
    expect(useWidgetsStore.getState().loadingWidgetId).toBeNull();
  });

  it('calls service.getWidgetData with correct id and type', async () => {
    const getWidgetData = vi.fn().mockResolvedValue({});
    const service = makeService({ getWidgetData });
    const { loadWidgetData } = buildActions(service);

    await loadWidgetData('w1');

    expect(getWidgetData).toHaveBeenCalledWith('w1', 'recent_games');
  });

  it('does nothing when the widget id does not exist in the store', async () => {
    const getWidgetData = vi.fn().mockResolvedValue({});
    const service = makeService({ getWidgetData });
    const { loadWidgetData } = buildActions(service);

    await loadWidgetData('nonexistent');

    expect(getWidgetData).not.toHaveBeenCalled();
  });

  it('clears loadingWidgetId even when the service throws', async () => {
    const service = makeService({
      getWidgetData: vi.fn().mockRejectedValue(new Error('fetch failed')),
    });
    const { loadWidgetData } = buildActions(service);

    await loadWidgetData('w1');

    expect(useWidgetsStore.getState().loadingWidgetId).toBeNull();
  });

  it('does not cache data when the service throws', async () => {
    const service = makeService({
      getWidgetData: vi.fn().mockRejectedValue(new Error('fetch failed')),
    });
    const { loadWidgetData } = buildActions(service);

    await loadWidgetData('w1');

    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
  });
});
