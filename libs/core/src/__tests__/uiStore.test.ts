/**
 * uiStore — unit tests
 *
 * Covers: defaults, view mode, fullscreen, sidebar, modals, toasts,
 *         context menu, search, scan progress
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUIStore } from '../stores/uiStore';

// ---------------------------------------------------------------------------
// localStorage stub (Node environment has no localStorage)
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
// Reset helper — bring store back to initial state between tests
// ---------------------------------------------------------------------------

function resetStore(): void {
  useUIStore.setState({
    viewMode: 'grid',
    isFullscreen: false,
    sidebar: { isOpen: true, width: 280, expandedSections: ['platforms', 'collections'] },
    activeModal: { type: null },
    toasts: [],
    contextMenu: { isOpen: false, x: 0, y: 0 },
    isSearchOpen: false,
    searchQuery: '',
    scanProgress: null,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('uiStore — defaults', () => {
  beforeEach(resetStore);

  it('has grid viewMode by default', () => {
    expect(useUIStore.getState().viewMode).toBe('grid');
  });

  it('is not fullscreen by default', () => {
    expect(useUIStore.getState().isFullscreen).toBe(false);
  });

  it('sidebar is open by default', () => {
    expect(useUIStore.getState().sidebar.isOpen).toBe(true);
  });

  it('sidebar has default width of 280', () => {
    expect(useUIStore.getState().sidebar.width).toBe(280);
  });

  it('sidebar has default expandedSections', () => {
    expect(useUIStore.getState().sidebar.expandedSections).toEqual(['platforms', 'collections']);
  });

  it('activeModal type is null by default', () => {
    expect(useUIStore.getState().activeModal.type).toBeNull();
  });

  it('toasts is empty by default', () => {
    expect(useUIStore.getState().toasts).toEqual([]);
  });

  it('contextMenu is closed by default', () => {
    expect(useUIStore.getState().contextMenu.isOpen).toBe(false);
  });

  it('isSearchOpen is false by default', () => {
    expect(useUIStore.getState().isSearchOpen).toBe(false);
  });

  it('searchQuery is empty string by default', () => {
    expect(useUIStore.getState().searchQuery).toBe('');
  });

  it('scanProgress is null by default', () => {
    expect(useUIStore.getState().scanProgress).toBeNull();
  });
});

describe('uiStore — view mode', () => {
  beforeEach(resetStore);

  it('setViewMode changes to list', () => {
    useUIStore.getState().setViewMode('list');
    expect(useUIStore.getState().viewMode).toBe('list');
  });

  it('setViewMode changes to compact', () => {
    useUIStore.getState().setViewMode('compact');
    expect(useUIStore.getState().viewMode).toBe('compact');
  });

  it('setViewMode changes back to grid', () => {
    useUIStore.getState().setViewMode('list');
    useUIStore.getState().setViewMode('grid');
    expect(useUIStore.getState().viewMode).toBe('grid');
  });
});

describe('uiStore — fullscreen', () => {
  beforeEach(resetStore);

  it('setFullscreen(true) sets isFullscreen to true', () => {
    useUIStore.getState().setFullscreen(true);
    expect(useUIStore.getState().isFullscreen).toBe(true);
  });

  it('setFullscreen(false) sets isFullscreen to false', () => {
    useUIStore.getState().setFullscreen(true);
    useUIStore.getState().setFullscreen(false);
    expect(useUIStore.getState().isFullscreen).toBe(false);
  });
});

describe('uiStore — sidebar', () => {
  beforeEach(resetStore);

  it('toggleSidebar closes an open sidebar', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebar.isOpen).toBe(false);
  });

  it('toggleSidebar re-opens a closed sidebar', () => {
    useUIStore.getState().toggleSidebar();
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebar.isOpen).toBe(true);
  });

  it('setSidebarOpen(false) closes sidebar', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebar.isOpen).toBe(false);
  });

  it('setSidebarOpen(true) opens sidebar', () => {
    useUIStore.getState().setSidebarOpen(false);
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebar.isOpen).toBe(true);
  });

  it('setSidebarWidth updates width within allowed range', () => {
    useUIStore.getState().setSidebarWidth(350);
    expect(useUIStore.getState().sidebar.width).toBe(350);
  });

  it('setSidebarWidth clamps to minimum of 200', () => {
    useUIStore.getState().setSidebarWidth(100);
    expect(useUIStore.getState().sidebar.width).toBe(200);
  });

  it('setSidebarWidth clamps to maximum of 400', () => {
    useUIStore.getState().setSidebarWidth(600);
    expect(useUIStore.getState().sidebar.width).toBe(400);
  });

  it('toggleSidebarSection adds a new section', () => {
    useUIStore.getState().toggleSidebarSection('settings');
    expect(useUIStore.getState().sidebar.expandedSections).toContain('settings');
  });

  it('toggleSidebarSection removes an existing section', () => {
    useUIStore.getState().toggleSidebarSection('platforms');
    expect(useUIStore.getState().sidebar.expandedSections).not.toContain('platforms');
  });

  it('toggleSidebarSection preserves other sections when removing one', () => {
    useUIStore.getState().toggleSidebarSection('platforms');
    expect(useUIStore.getState().sidebar.expandedSections).toContain('collections');
  });
});

describe('uiStore — modals', () => {
  beforeEach(resetStore);

  it('openModal sets type', () => {
    useUIStore.getState().openModal('settings');
    expect(useUIStore.getState().activeModal.type).toBe('settings');
  });

  it('openModal sets props', () => {
    useUIStore.getState().openModal('confirm', { message: 'Are you sure?' });
    expect(useUIStore.getState().activeModal.props).toEqual({ message: 'Are you sure?' });
  });

  it('closeModal resets type to null', () => {
    useUIStore.getState().openModal('settings');
    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal.type).toBeNull();
  });
});

describe('uiStore — toasts', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('addToast adds a toast with a generated id', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'Hello' });
    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].id).toBeTruthy();
  });

  it('addToast generates unique ids', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'A' });
    useUIStore.getState().addToast({ type: 'info', message: 'B' });
    const ids = useUIStore.getState().toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('addToast supports all toast types', () => {
    (['info', 'success', 'warning', 'error'] as const).forEach((type) => {
      useUIStore.getState().addToast({ type, message: type });
    });
    const types = useUIStore.getState().toasts.map((t) => t.type);
    expect(types).toEqual(['info', 'success', 'warning', 'error']);
  });

  it('removeToast removes the specified toast', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'A' });
    const id = useUIStore.getState().toasts[0].id;
    useUIStore.getState().removeToast(id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('removeToast leaves other toasts intact', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'A' });
    useUIStore.getState().addToast({ type: 'info', message: 'B' });
    const idA = useUIStore.getState().toasts[0].id;
    useUIStore.getState().removeToast(idA);
    expect(useUIStore.getState().toasts).toHaveLength(1);
    expect(useUIStore.getState().toasts[0].message).toBe('B');
  });

  it('clearToasts removes all toasts', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'A' });
    useUIStore.getState().addToast({ type: 'error', message: 'B' });
    useUIStore.getState().clearToasts();
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('toast auto-removes after its duration', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'auto', duration: 1000 });
    expect(useUIStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1001);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('toast with duration=0 does not auto-remove', () => {
    useUIStore.getState().addToast({ type: 'info', message: 'sticky', duration: 0 });
    vi.advanceTimersByTime(60000);
    expect(useUIStore.getState().toasts).toHaveLength(1);
  });
});

describe('uiStore — context menu', () => {
  beforeEach(resetStore);

  it('openContextMenu sets isOpen to true', () => {
    useUIStore.getState().openContextMenu(100, 200);
    expect(useUIStore.getState().contextMenu.isOpen).toBe(true);
  });

  it('openContextMenu sets x and y coordinates', () => {
    useUIStore.getState().openContextMenu(100, 200);
    expect(useUIStore.getState().contextMenu.x).toBe(100);
    expect(useUIStore.getState().contextMenu.y).toBe(200);
  });

  it('openContextMenu stores target when provided', () => {
    useUIStore.getState().openContextMenu(10, 20, { type: 'game', id: 'game-1' });
    expect(useUIStore.getState().contextMenu.target).toEqual({ type: 'game', id: 'game-1' });
  });

  it('closeContextMenu sets isOpen to false', () => {
    useUIStore.getState().openContextMenu(10, 20);
    useUIStore.getState().closeContextMenu();
    expect(useUIStore.getState().contextMenu.isOpen).toBe(false);
  });

  it('closeContextMenu preserves x and y coordinates', () => {
    useUIStore.getState().openContextMenu(50, 75);
    useUIStore.getState().closeContextMenu();
    expect(useUIStore.getState().contextMenu.x).toBe(50);
    expect(useUIStore.getState().contextMenu.y).toBe(75);
  });
});

describe('uiStore — search', () => {
  beforeEach(resetStore);

  it('setSearchOpen(true) opens search', () => {
    useUIStore.getState().setSearchOpen(true);
    expect(useUIStore.getState().isSearchOpen).toBe(true);
  });

  it('setSearchOpen(false) closes search', () => {
    useUIStore.getState().setSearchOpen(true);
    useUIStore.getState().setSearchOpen(false);
    expect(useUIStore.getState().isSearchOpen).toBe(false);
  });

  it('setSearchQuery updates searchQuery', () => {
    useUIStore.getState().setSearchQuery('zelda');
    expect(useUIStore.getState().searchQuery).toBe('zelda');
  });

  it('setSearchQuery with empty string clears query', () => {
    useUIStore.getState().setSearchQuery('zelda');
    useUIStore.getState().setSearchQuery('');
    expect(useUIStore.getState().searchQuery).toBe('');
  });
});

describe('uiStore — scan progress', () => {
  beforeEach(resetStore);

  it('setScanProgress sets progress object', () => {
    const progress = {
      isScanning: true,
      currentPath: '/roms',
      filesFound: 10,
      filesProcessed: 3,
      gamesAdded: 2,
    };
    useUIStore.getState().setScanProgress(progress);
    expect(useUIStore.getState().scanProgress).toEqual(progress);
  });

  it('setScanProgress(null) clears progress', () => {
    useUIStore.getState().setScanProgress({
      isScanning: false,
      filesFound: 5,
      filesProcessed: 5,
      gamesAdded: 3,
    });
    useUIStore.getState().setScanProgress(null);
    expect(useUIStore.getState().scanProgress).toBeNull();
  });

  it('setScanProgress updates currentPath', () => {
    useUIStore.getState().setScanProgress({
      isScanning: true,
      currentPath: '/roms/nes',
      filesFound: 100,
      filesProcessed: 50,
      gamesAdded: 45,
    });
    expect(useUIStore.getState().scanProgress?.currentPath).toBe('/roms/nes');
  });
});
