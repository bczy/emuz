/**
 * Widgets Store - Manages home screen widgets with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Widget, WidgetType, WidgetSize } from '../models/Widget';

/**
 * Widgets state interface
 */
export interface WidgetsState {
  // Data
  widgets: Widget[];
  isEditing: boolean;
  
  // Loading
  isLoading: boolean;
  loadingWidgetId: string | null;
  
  // Cached widget data
  widgetData: Map<string, unknown>;
  
  // Actions
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  
  setEditing: (isEditing: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingWidget: (widgetId: string | null) => void;
  
  setWidgetData: (widgetId: string, data: unknown) => void;
  getWidgetData: (widgetId: string) => unknown;
  clearWidgetData: (widgetId?: string) => void;
  
  // Widget helpers
  getVisibleWidgets: () => Widget[];
  moveWidget: (widgetId: string, direction: 'up' | 'down') => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
}

/**
 * Default widget configuration
 */
export const defaultWidgets: Array<{ type: WidgetType; size: WidgetSize }> = [
  { type: 'continue-playing', size: 'large' },
  { type: 'recent-games', size: 'medium' },
  { type: 'favorites', size: 'medium' },
  { type: 'stats', size: 'small' },
  { type: 'platform-shortcuts', size: 'medium' },
];

/**
 * Widgets store
 */
export const useWidgetsStore = create<WidgetsState>()(
  persist(
    (set, get) => ({
      // Initial state
      widgets: [],
      isEditing: false,
      isLoading: false,
      loadingWidgetId: null,
      widgetData: new Map(),

      // Data actions
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),
      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
          ),
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      reorderWidgets: (widgetIds) =>
        set((state) => {
          const widgetMap = new Map(state.widgets.map((w) => [w.id, w]));
          const reordered = widgetIds
            .map((id, index) => {
              const widget = widgetMap.get(id);
              if (widget) {
                return { ...widget, position: index };
              }
              return null;
            })
            .filter((w): w is Widget => w !== null);
          return { widgets: reordered };
        }),

      // UI actions
      setEditing: (isEditing) => set({ isEditing }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingWidget: (loadingWidgetId) => set({ loadingWidgetId }),

      // Widget data cache
      setWidgetData: (widgetId, data) =>
        set((state) => {
          const newMap = new Map(state.widgetData);
          newMap.set(widgetId, data);
          return { widgetData: newMap };
        }),
      getWidgetData: (widgetId) => get().widgetData.get(widgetId),
      clearWidgetData: (widgetId) =>
        set((state) => {
          const newMap = new Map(state.widgetData);
          if (widgetId) {
            newMap.delete(widgetId);
          } else {
            newMap.clear();
          }
          return { widgetData: newMap };
        }),

      // Helper actions
      getVisibleWidgets: () =>
        get()
          .widgets.filter((w) => w.isVisible)
          .sort((a, b) => a.position - b.position),

      moveWidget: (widgetId, direction) =>
        set((state) => {
          const widgets = [...state.widgets].sort((a, b) => a.position - b.position);
          const index = widgets.findIndex((w) => w.id === widgetId);
          
          if (index === -1) return state;
          
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= widgets.length) return state;
          
          // Swap positions
          const temp = widgets[index].position;
          widgets[index] = { ...widgets[index], position: widgets[newIndex].position };
          widgets[newIndex] = { ...widgets[newIndex], position: temp };
          
          return { widgets };
        }),

      toggleWidgetVisibility: (widgetId) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
          ),
        })),

      resizeWidget: (widgetId, size) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === widgetId ? { ...w, size } : w
          ),
        })),
    }),
    {
      name: 'emuz-widgets',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets.map((w) => ({
          id: w.id,
          type: w.type,
          title: w.title,
          size: w.size,
          position: w.position,
          config: w.config,
          isVisible: w.isVisible,
        })),
      }),
    }
  )
);
