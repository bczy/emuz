/**
 * useWidgets hook - Provides widget management
 */

import { useCallback, useEffect } from 'react';
import { useWidgetsStore } from '../stores/widgetsStore';
import type { Widget, WidgetType, WidgetSize } from '../models/Widget';
import type { IWidgetService } from '../services/types';

/**
 * Hook options
 */
export interface UseWidgetsOptions {
  /** Widget service instance */
  service: IWidgetService;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

/**
 * Hook return type
 */
export interface UseWidgetsReturn {
  // Data
  widgets: Widget[];
  visibleWidgets: Widget[];
  isLoading: boolean;
  isEditing: boolean;
  
  // Widget data
  getWidgetData: <T>(widgetId: string) => T | undefined;
  
  // Actions
  refreshWidgets: () => Promise<void>;
  addWidget: (type: WidgetType) => Promise<Widget | null>;
  removeWidget: (widgetId: string) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => Promise<void>;
  reorderWidgets: (widgetIds: string[]) => Promise<void>;
  
  // Edit mode
  setEditing: (isEditing: boolean) => void;
  toggleEditing: () => void;
  
  // Widget actions
  toggleVisibility: (widgetId: string) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
  moveWidget: (widgetId: string, direction: 'up' | 'down') => void;
  
  // Data loading
  loadWidgetData: (widgetId: string) => Promise<void>;
}

/**
 * Widgets hook for managing home screen widgets
 */
export function useWidgets(options: UseWidgetsOptions): UseWidgetsReturn {
  const { service, autoFetch = true } = options;

  const store = useWidgetsStore();

  // Fetch all widgets
  const refreshWidgets = useCallback(async () => {
    store.setLoading(true);

    try {
      const widgets = await service.getWidgets();
      store.setWidgets(widgets);
      store.clearWidgetData();
    } catch (err) {
      console.error('Failed to load widgets:', err);
    } finally {
      store.setLoading(false);
    }
  }, [service, store]);

  // Add widget
  const addWidget = useCallback(
    async (type: WidgetType): Promise<Widget | null> => {
      try {
        const widget = await service.addWidget(type);
        store.addWidget(widget);
        return widget;
      } catch (err) {
        console.error('Failed to add widget:', err);
        return null;
      }
    },
    [service, store]
  );

  // Remove widget
  const removeWidget = useCallback(
    async (widgetId: string) => {
      try {
        await service.removeWidget(widgetId);
        store.removeWidget(widgetId);
      } catch (err) {
        console.error('Failed to remove widget:', err);
      }
    },
    [service, store]
  );

  // Update widget
  const updateWidget = useCallback(
    async (widgetId: string, updates: Partial<Widget>) => {
      try {
        await service.updateWidget(widgetId, updates);
        store.updateWidget(widgetId, updates);
      } catch (err) {
        console.error('Failed to update widget:', err);
      }
    },
    [service, store]
  );

  // Reorder widgets
  const reorderWidgets = useCallback(
    async (widgetIds: string[]) => {
      try {
        await service.reorderWidgets(widgetIds);
        store.reorderWidgets(widgetIds);
      } catch (err) {
        console.error('Failed to reorder widgets:', err);
      }
    },
    [service, store]
  );

  // Load widget data
  const loadWidgetData = useCallback(
    async (widgetId: string) => {
      const widget = store.widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      store.setLoadingWidget(widgetId);

      try {
        const data = await service.getWidgetData(widget);
        store.setWidgetData(widgetId, data);
      } catch (err) {
        console.error(`Failed to load data for widget ${widgetId}:`, err);
      } finally {
        store.setLoadingWidget(null);
      }
    },
    [service, store]
  );

  // Get widget data with type
  const getWidgetData = useCallback(
    <T>(widgetId: string): T | undefined => {
      return store.getWidgetData(widgetId) as T | undefined;
    },
    [store]
  );

  // Toggle editing
  const toggleEditing = useCallback(() => {
    store.setEditing(!store.isEditing);
  }, [store]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refreshWidgets();
    }
  }, [autoFetch, refreshWidgets]);

  return {
    widgets: store.widgets,
    visibleWidgets: store.getVisibleWidgets(),
    isLoading: store.isLoading,
    isEditing: store.isEditing,
    getWidgetData,
    refreshWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    setEditing: store.setEditing,
    toggleEditing,
    toggleVisibility: store.toggleWidgetVisibility,
    resizeWidget: store.resizeWidget,
    moveWidget: store.moveWidget,
    loadWidgetData,
  };
}
