/**
 * UI Store - Manages UI state with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * View mode options
 */
export type ViewMode = 'grid' | 'list' | 'compact';

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  width: number;
  expandedSections: string[];
}

/**
 * Modal state
 */
export interface ModalState {
  type: string | null;
  props?: Record<string, unknown>;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

/**
 * UI state interface
 */
export interface UIState {
  // View
  viewMode: ViewMode;
  isFullscreen: boolean;
  
  // Sidebar
  sidebar: SidebarState;
  
  // Modals
  activeModal: ModalState;
  
  // Toasts
  toasts: Toast[];
  
  // Context menu
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    target?: { type: string; id: string };
  };
  
  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Scan progress
  scanProgress: {
    isScanning: boolean;
    currentPath?: string;
    filesFound: number;
    filesProcessed: number;
    gamesAdded: number;
  } | null;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebarSection: (section: string) => void;
  
  openModal: (type: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  openContextMenu: (x: number, y: number, target?: { type: string; id: string }) => void;
  closeContextMenu: () => void;
  
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  setScanProgress: (progress: UIState['scanProgress']) => void;
}

/**
 * Generate unique ID for toasts
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Default sidebar state
 */
const defaultSidebar: SidebarState = {
  isOpen: true,
  width: 280,
  expandedSections: ['platforms', 'collections'],
};

/**
 * UI store
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'grid',
      isFullscreen: false,
      sidebar: defaultSidebar,
      activeModal: { type: null },
      toasts: [],
      contextMenu: { isOpen: false, x: 0, y: 0 },
      isSearchOpen: false,
      searchQuery: '',
      scanProgress: null,

      // View actions
      setViewMode: (viewMode: ViewMode) => set({ viewMode }),
      setFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({
          sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
        })),
      setSidebarOpen: (isOpen: boolean) =>
        set((state) => ({
          sidebar: { ...state.sidebar, isOpen },
        })),
      setSidebarWidth: (width: number) =>
        set((state) => ({
          sidebar: { ...state.sidebar, width: Math.max(200, Math.min(400, width)) },
        })),
      toggleSidebarSection: (section: string) =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            expandedSections: state.sidebar.expandedSections.includes(section)
              ? state.sidebar.expandedSections.filter((s) => s !== section)
              : [...state.sidebar.expandedSections, section],
          },
        })),

      // Modal actions
      openModal: (type, props) => set({ activeModal: { type, props } }),
      closeModal: () => set({ activeModal: { type: null } }),

      // Toast actions
      addToast: (toast) => {
        const id = generateId();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),

      // Context menu actions
      openContextMenu: (x, y, target) =>
        set({ contextMenu: { isOpen: true, x, y, target } }),
      closeContextMenu: () =>
        set((state) => ({ contextMenu: { ...state.contextMenu, isOpen: false } })),

      // Search actions
      setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Scan progress actions
      setScanProgress: (scanProgress) => set({ scanProgress }),
    }),
    {
      name: 'emuz-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebar: {
          isOpen: state.sidebar.isOpen,
          width: state.sidebar.width,
          expandedSections: state.sidebar.expandedSections,
        },
      }),
    }
  )
);
