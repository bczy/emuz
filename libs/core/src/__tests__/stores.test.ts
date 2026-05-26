import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLibraryStore } from '../stores/libraryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { useWidgetsStore } from '../stores/widgetsStore';
import type { Game } from '../models/Game';
import type { Platform } from '../models/Platform';
import type { Widget } from '../models/Widget';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function makeGame(overrides: Partial<Game> = {}): Game {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    platformId: 'plat-1',
    title: 'Test Game',
    filePath: '/roms/test.nes',
    fileName: 'test.nes',
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Game;
}

function makePlatform(overrides: Partial<Platform> = {}): Platform {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'NES',
    romExtensions: ['.nes'],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Platform;
}

function makeWidget(overrides: Partial<Widget> = {}): Widget {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    type: 'recent_games',
    size: 'medium',
    position: 0,
    isVisible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Widget;
}

// ─── Library Store ──────────────────────────────────────────────────

describe('useLibraryStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const s = useLibraryStore.getState();
    s.setGames([]);
    s.setPlatforms([]);
    s.setCollections([]);
    s.selectGame(null);
    s.selectPlatform(null);
    s.selectCollection(null);
    s.clearFilters();
    s.setSort({ field: 'title', order: 'asc' });
    s.setLoading(false);
    s.setRefreshing(false);
    s.setError(null);
  });

  it('sets and retrieves games', () => {
    const games = [makeGame({ title: 'Mario' }), makeGame({ title: 'Zelda' })];
    useLibraryStore.getState().setGames(games);
    expect(useLibraryStore.getState().games).toHaveLength(2);
  });

  it('adds a single game', () => {
    const game = makeGame({ title: 'Metroid' });
    useLibraryStore.getState().addGame(game);
    expect(useLibraryStore.getState().games).toHaveLength(1);
    expect(useLibraryStore.getState().games[0].title).toBe('Metroid');
  });

  it('updates a game by id', () => {
    const game = makeGame({ title: 'Old Title' });
    useLibraryStore.getState().setGames([game]);
    useLibraryStore.getState().updateGame(game.id, { title: 'New Title' });
    expect(useLibraryStore.getState().games[0].title).toBe('New Title');
  });

  it('removes a game by id', () => {
    const game = makeGame();
    useLibraryStore.getState().setGames([game]);
    useLibraryStore.getState().removeGame(game.id);
    expect(useLibraryStore.getState().games).toHaveLength(0);
  });

  it('clears selectedGameId when removing the selected game', () => {
    const game = makeGame();
    useLibraryStore.getState().setGames([game]);
    useLibraryStore.getState().selectGame(game.id);
    expect(useLibraryStore.getState().selectedGameId).toBe(game.id);
    useLibraryStore.getState().removeGame(game.id);
    expect(useLibraryStore.getState().selectedGameId).toBeNull();
  });

  it('selectPlatform also sets the platform filter', () => {
    useLibraryStore.getState().selectPlatform('plat-1');
    expect(useLibraryStore.getState().selectedPlatformId).toBe('plat-1');
    expect(useLibraryStore.getState().filters.platformId).toBe('plat-1');
  });

  it('selectPlatform(null) clears platformId filter', () => {
    useLibraryStore.getState().selectPlatform('plat-1');
    useLibraryStore.getState().selectPlatform(null);
    expect(useLibraryStore.getState().filters.platformId).toBeUndefined();
  });

  it('selectCollection sets the collection filter', () => {
    useLibraryStore.getState().selectCollection('col-1');
    expect(useLibraryStore.getState().selectedCollectionId).toBe('col-1');
    expect(useLibraryStore.getState().filters.collectionId).toBe('col-1');
  });

  it('clearFilters resets all filters', () => {
    useLibraryStore.getState().setFilters({ searchQuery: 'zelda', favoritesOnly: true });
    useLibraryStore.getState().clearFilters();
    expect(useLibraryStore.getState().filters.searchQuery).toBeUndefined();
    expect(useLibraryStore.getState().filters.favoritesOnly).toBe(false);
  });

  it('sets loading and error states', () => {
    useLibraryStore.getState().setLoading(true);
    expect(useLibraryStore.getState().isLoading).toBe(true);
    useLibraryStore.getState().setError('Something failed');
    expect(useLibraryStore.getState().error).toBe('Something failed');
  });

  it('setRefreshing works', () => {
    useLibraryStore.getState().setRefreshing(true);
    expect(useLibraryStore.getState().isRefreshing).toBe(true);
  });

  it('getGameById finds a game', () => {
    const game = makeGame({ title: 'FindMe' });
    useLibraryStore.getState().setGames([game]);
    expect(useLibraryStore.getState().getGameById(game.id)?.title).toBe('FindMe');
    expect(useLibraryStore.getState().getGameById('nonexistent')).toBeUndefined();
  });

  it('getPlatformById finds a platform', () => {
    const plat = makePlatform({ name: 'SNES' });
    useLibraryStore.getState().setPlatforms([plat]);
    expect(useLibraryStore.getState().getPlatformById(plat.id)?.name).toBe('SNES');
  });

  it('setCollections stores collections', () => {
    useLibraryStore.getState().setCollections([{ id: 'c1', name: 'Favs' } as any]);
    expect(useLibraryStore.getState().collections).toHaveLength(1);
  });

  describe('getFilteredGames', () => {
    const platformA = 'plat-a';
    const platformB = 'plat-b';

    const games = [
      makeGame({
        id: '1',
        title: 'Alpha',
        platformId: platformA,
        isFavorite: true,
        genre: 'action',
        developer: 'DevA',
      }),
      makeGame({
        id: '2',
        title: 'Beta',
        platformId: platformB,
        isFavorite: false,
        genre: 'rpg',
        publisher: 'PubB',
      }),
      makeGame({
        id: '3',
        title: 'Gamma',
        platformId: platformA,
        isFavorite: false,
        genre: 'action',
      }),
    ] as Game[];

    beforeEach(() => {
      useLibraryStore.getState().setGames(games);
    });

    it('returns all games with no filters', () => {
      expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(3);
    });

    it('filters by platformId', () => {
      useLibraryStore.getState().setFilters({ platformId: platformA });
      const result = useLibraryStore.getState().getFilteredGames();
      expect(result).toHaveLength(2);
      expect(result.every((g) => g.platformId === platformA)).toBe(true);
    });

    it('filters by favoritesOnly', () => {
      useLibraryStore.getState().setFilters({ favoritesOnly: true });
      const result = useLibraryStore.getState().getFilteredGames();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Alpha');
    });

    it('filters by genreId', () => {
      useLibraryStore.getState().setFilters({ genreId: 'rpg' });
      const result = useLibraryStore.getState().getFilteredGames();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Beta');
    });

    it('filters by searchQuery (title)', () => {
      useLibraryStore.getState().setFilters({ searchQuery: 'alpha' });
      const result = useLibraryStore.getState().getFilteredGames();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Alpha');
    });

    it('filters by searchQuery (developer)', () => {
      useLibraryStore.getState().setFilters({ searchQuery: 'deva' });
      expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(1);
    });

    it('filters by searchQuery (publisher)', () => {
      useLibraryStore.getState().setFilters({ searchQuery: 'pubb' });
      expect(useLibraryStore.getState().getFilteredGames()).toHaveLength(1);
    });

    it('sorts by title ascending', () => {
      useLibraryStore.getState().setSort({ field: 'title', order: 'asc' });
      const titles = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.title);
      expect(titles).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('sorts by title descending', () => {
      useLibraryStore.getState().setSort({ field: 'title', order: 'desc' });
      const titles = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.title);
      expect(titles).toEqual(['Gamma', 'Beta', 'Alpha']);
    });

    it('sorts by playCount', () => {
      const gamesWithCounts = [
        makeGame({ id: 'a', title: 'A', playCount: 5 }),
        makeGame({ id: 'b', title: 'B', playCount: 10 }),
        makeGame({ id: 'c', title: 'C', playCount: 1 }),
      ] as Game[];
      useLibraryStore.getState().setGames(gamesWithCounts);
      useLibraryStore.getState().setSort({ field: 'playCount', order: 'desc' });
      const counts = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.playCount);
      expect(counts).toEqual([10, 5, 1]);
    });

    it('sorts by lastPlayedAt', () => {
      const now = Date.now();
      const gamesWithDates = [
        makeGame({ id: 'a', title: 'A', lastPlayedAt: new Date(now - 3000) }),
        makeGame({ id: 'b', title: 'B', lastPlayedAt: new Date(now) }),
        makeGame({ id: 'c', title: 'C' }),
      ] as Game[];
      useLibraryStore.getState().setGames(gamesWithDates);
      useLibraryStore.getState().setSort({ field: 'lastPlayedAt', order: 'desc' });
      const titles = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.title);
      expect(titles[0]).toBe('B');
    });

    it('sorts by createdAt', () => {
      const gamesWithCreated = [
        makeGame({ id: 'a', title: 'A', createdAt: new Date(2020, 0, 1) }),
        makeGame({ id: 'b', title: 'B', createdAt: new Date(2025, 0, 1) }),
      ] as Game[];
      useLibraryStore.getState().setGames(gamesWithCreated);
      useLibraryStore.getState().setSort({ field: 'createdAt', order: 'asc' });
      const titles = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.title);
      expect(titles).toEqual(['A', 'B']);
    });

    it('sorts by releaseDate', () => {
      const gamesWithRelease = [
        makeGame({ id: 'a', title: 'A', releaseDate: '1990-01-01' }),
        makeGame({ id: 'b', title: 'B', releaseDate: '2020-01-01' }),
        makeGame({ id: 'c', title: 'C' }),
      ] as Game[];
      useLibraryStore.getState().setGames(gamesWithRelease);
      useLibraryStore.getState().setSort({ field: 'releaseDate', order: 'desc' });
      const titles = useLibraryStore
        .getState()
        .getFilteredGames()
        .map((g) => g.title);
      expect(titles[0]).toBe('B');
    });
  });
});

// ─── Settings Store ─────────────────────────────────────────────────

describe('useSettingsStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useSettingsStore.getState().resetToDefaults();
  });

  it('has expected defaults', () => {
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.language).toBe('en');
    expect(s.gridSize).toBe('medium');
    expect(s.showGameTitles).toBe(true);
    expect(s.autoScanOnStartup).toBe(true);
    expect(s.enableAnimations).toBe(true);
    expect(s.romDirectories).toEqual([]);
    expect(s.coversDirectory).toBe('.emuz/covers');
  });

  it('sets theme', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('sets language', () => {
    useSettingsStore.getState().setLanguage('ja');
    expect(useSettingsStore.getState().language).toBe('ja');
  });

  it('sets gridSize', () => {
    useSettingsStore.getState().setGridSize('large');
    expect(useSettingsStore.getState().gridSize).toBe('large');
  });

  it('toggles boolean settings', () => {
    useSettingsStore.getState().setShowGameTitles(false);
    expect(useSettingsStore.getState().showGameTitles).toBe(false);

    useSettingsStore.getState().setShowPlatformBadges(false);
    expect(useSettingsStore.getState().showPlatformBadges).toBe(false);

    useSettingsStore.getState().setAutoFetchMetadata(false);
    expect(useSettingsStore.getState().autoFetchMetadata).toBe(false);

    useSettingsStore.getState().setEnableAnimations(false);
    expect(useSettingsStore.getState().enableAnimations).toBe(false);

    useSettingsStore.getState().setScanHiddenFiles(true);
    expect(useSettingsStore.getState().scanHiddenFiles).toBe(true);

    useSettingsStore.getState().setScanRecursively(false);
    expect(useSettingsStore.getState().scanRecursively).toBe(false);

    useSettingsStore.getState().setAutoSelectEmulator(false);
    expect(useSettingsStore.getState().autoSelectEmulator).toBe(false);

    useSettingsStore.getState().setTrackPlayTime(false);
    expect(useSettingsStore.getState().trackPlayTime).toBe(false);

    useSettingsStore.getState().setConfirmBeforeLaunch(true);
    expect(useSettingsStore.getState().confirmBeforeLaunch).toBe(true);

    useSettingsStore.getState().setDownloadCovers(false);
    expect(useSettingsStore.getState().downloadCovers).toBe(false);

    useSettingsStore.getState().setEnableVirtualization(false);
    expect(useSettingsStore.getState().enableVirtualization).toBe(false);

    useSettingsStore.getState().setAutoScanOnStartup(false);
    expect(useSettingsStore.getState().autoScanOnStartup).toBe(false);
  });

  it('sets metadataLanguage', () => {
    useSettingsStore.getState().setMetadataLanguage('fr');
    expect(useSettingsStore.getState().metadataLanguage).toBe('fr');
  });

  it('adds ROM directory (no duplicates)', () => {
    useSettingsStore.getState().addRomDirectory('/roms');
    useSettingsStore.getState().addRomDirectory('/roms');
    useSettingsStore.getState().addRomDirectory('/more-roms');
    expect(useSettingsStore.getState().romDirectories).toEqual(['/roms', '/more-roms']);
  });

  it('removes ROM directory', () => {
    useSettingsStore.getState().addRomDirectory('/roms');
    useSettingsStore.getState().addRomDirectory('/more');
    useSettingsStore.getState().removeRomDirectory('/roms');
    expect(useSettingsStore.getState().romDirectories).toEqual(['/more']);
  });

  it('sets covers directory', () => {
    useSettingsStore.getState().setCoversDirectory('/custom/covers');
    expect(useSettingsStore.getState().coversDirectory).toBe('/custom/covers');
  });

  it('sets image quality', () => {
    useSettingsStore.getState().setImageQuality('low');
    expect(useSettingsStore.getState().imageQuality).toBe('low');
  });

  it('resetToDefaults restores all defaults', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setLanguage('ja');
    useSettingsStore.getState().addRomDirectory('/roms');
    useSettingsStore.getState().resetToDefaults();
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.language).toBe('en');
    expect(s.romDirectories).toEqual([]);
  });
});

// ─── UI Store ───────────────────────────────────────────────────────

describe('useUIStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const s = useUIStore.getState();
    s.setViewMode('grid');
    s.setFullscreen(false);
    s.setSidebarOpen(true);
    s.setSidebarWidth(280);
    s.closeModal();
    s.clearToasts();
    s.closeContextMenu();
    s.setSearchOpen(false);
    s.setSearchQuery('');
    s.setScanProgress(null);
  });

  it('sets view mode', () => {
    useUIStore.getState().setViewMode('list');
    expect(useUIStore.getState().viewMode).toBe('list');
  });

  it('sets fullscreen', () => {
    useUIStore.getState().setFullscreen(true);
    expect(useUIStore.getState().isFullscreen).toBe(true);
  });

  it('toggles sidebar', () => {
    expect(useUIStore.getState().sidebar.isOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebar.isOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebar.isOpen).toBe(true);
  });

  it('setSidebarOpen', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebar.isOpen).toBe(false);
  });

  it('clamps sidebar width between 200 and 400', () => {
    useUIStore.getState().setSidebarWidth(100);
    expect(useUIStore.getState().sidebar.width).toBe(200);
    useUIStore.getState().setSidebarWidth(500);
    expect(useUIStore.getState().sidebar.width).toBe(400);
    useUIStore.getState().setSidebarWidth(300);
    expect(useUIStore.getState().sidebar.width).toBe(300);
  });

  it('toggles sidebar sections', () => {
    useUIStore.getState().toggleSidebarSection('platforms');
    const has = useUIStore.getState().sidebar.expandedSections.includes('platforms');
    useUIStore.getState().toggleSidebarSection('platforms');
    const hasAfter = useUIStore.getState().sidebar.expandedSections.includes('platforms');
    expect(has).not.toBe(hasAfter);
  });

  it('opens and closes modals', () => {
    useUIStore.getState().openModal('settings', { tab: 'appearance' });
    expect(useUIStore.getState().activeModal.type).toBe('settings');
    expect(useUIStore.getState().activeModal.props).toEqual({ tab: 'appearance' });
    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal.type).toBeNull();
  });

  it('adds and removes toasts', () => {
    vi.useFakeTimers();
    useUIStore.getState().addToast({ type: 'success', message: 'Done!', duration: 0 });
    expect(useUIStore.getState().toasts).toHaveLength(1);
    expect(useUIStore.getState().toasts[0].message).toBe('Done!');

    const id = useUIStore.getState().toasts[0].id;
    useUIStore.getState().removeToast(id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('auto-removes toasts after duration', () => {
    vi.useFakeTimers();
    useUIStore.getState().addToast({ type: 'info', message: 'Temp', duration: 1000 });
    expect(useUIStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1100);
    expect(useUIStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('clears all toasts', () => {
    vi.useFakeTimers();
    useUIStore.getState().addToast({ type: 'info', message: 'A', duration: 0 });
    useUIStore.getState().addToast({ type: 'error', message: 'B', duration: 0 });
    useUIStore.getState().clearToasts();
    expect(useUIStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('opens and closes context menu', () => {
    useUIStore.getState().openContextMenu(100, 200, { type: 'game', id: 'g1' });
    const cm = useUIStore.getState().contextMenu;
    expect(cm.isOpen).toBe(true);
    expect(cm.x).toBe(100);
    expect(cm.y).toBe(200);
    expect(cm.target).toEqual({ type: 'game', id: 'g1' });

    useUIStore.getState().closeContextMenu();
    expect(useUIStore.getState().contextMenu.isOpen).toBe(false);
  });

  it('manages search state', () => {
    useUIStore.getState().setSearchOpen(true);
    expect(useUIStore.getState().isSearchOpen).toBe(true);
    useUIStore.getState().setSearchQuery('mario');
    expect(useUIStore.getState().searchQuery).toBe('mario');
  });

  it('manages scan progress', () => {
    useUIStore.getState().setScanProgress({
      isScanning: true,
      currentPath: '/roms',
      filesFound: 10,
      filesProcessed: 5,
      gamesAdded: 3,
    });
    const progress = useUIStore.getState().scanProgress;
    expect(progress?.isScanning).toBe(true);
    expect(progress?.gamesAdded).toBe(3);

    useUIStore.getState().setScanProgress(null);
    expect(useUIStore.getState().scanProgress).toBeNull();
  });
});

// ─── Widgets Store ──────────────────────────────────────────────────

describe('useWidgetsStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const s = useWidgetsStore.getState();
    s.setWidgets([]);
    s.setEditing(false);
    s.setLoading(false);
    s.setLoadingWidget(null);
    s.clearWidgetData();
  });

  it('sets and retrieves widgets', () => {
    const widgets = [makeWidget({ position: 0 }), makeWidget({ position: 1 })];
    useWidgetsStore.getState().setWidgets(widgets);
    expect(useWidgetsStore.getState().widgets).toHaveLength(2);
  });

  it('adds a widget', () => {
    useWidgetsStore.getState().addWidget(makeWidget());
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
  });

  it('updates a widget', () => {
    const w = makeWidget({ position: 0 });
    useWidgetsStore.getState().setWidgets([w]);
    useWidgetsStore.getState().updateWidget(w.id, { title: 'Updated' });
    expect(useWidgetsStore.getState().widgets[0].title).toBe('Updated');
  });

  it('removes a widget', () => {
    const w = makeWidget();
    useWidgetsStore.getState().setWidgets([w]);
    useWidgetsStore.getState().removeWidget(w.id);
    expect(useWidgetsStore.getState().widgets).toHaveLength(0);
  });

  it('reorders widgets', () => {
    const w1 = makeWidget({ position: 0 });
    const w2 = makeWidget({ position: 1 });
    const w3 = makeWidget({ position: 2 });
    useWidgetsStore.getState().setWidgets([w1, w2, w3]);
    useWidgetsStore.getState().reorderWidgets([w3.id, w1.id, w2.id]);
    const widgets = useWidgetsStore.getState().widgets;
    expect(widgets[0].id).toBe(w3.id);
    expect(widgets[0].position).toBe(0);
    expect(widgets[1].id).toBe(w1.id);
    expect(widgets[1].position).toBe(1);
  });

  it('reorderWidgets filters out unknown IDs', () => {
    const w1 = makeWidget({ position: 0 });
    useWidgetsStore.getState().setWidgets([w1]);
    useWidgetsStore.getState().reorderWidgets(['unknown', w1.id]);
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
  });

  it('sets editing and loading state', () => {
    useWidgetsStore.getState().setEditing(true);
    expect(useWidgetsStore.getState().isEditing).toBe(true);
    useWidgetsStore.getState().setLoading(true);
    expect(useWidgetsStore.getState().isLoading).toBe(true);
    useWidgetsStore.getState().setLoadingWidget('w1');
    expect(useWidgetsStore.getState().loadingWidgetId).toBe('w1');
  });

  it('manages widget data cache', () => {
    useWidgetsStore.getState().setWidgetData('w1', { games: [1, 2] });
    expect(useWidgetsStore.getState().getWidgetData('w1')).toEqual({ games: [1, 2] });

    useWidgetsStore.getState().clearWidgetData('w1');
    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
  });

  it('clears all widget data', () => {
    useWidgetsStore.getState().setWidgetData('w1', 'data1');
    useWidgetsStore.getState().setWidgetData('w2', 'data2');
    useWidgetsStore.getState().clearWidgetData();
    expect(useWidgetsStore.getState().getWidgetData('w1')).toBeUndefined();
    expect(useWidgetsStore.getState().getWidgetData('w2')).toBeUndefined();
  });

  it('getVisibleWidgets returns only visible sorted by position', () => {
    const w1 = makeWidget({ position: 2, isVisible: true });
    const w2 = makeWidget({ position: 0, isVisible: false });
    const w3 = makeWidget({ position: 1, isVisible: true });
    useWidgetsStore.getState().setWidgets([w1, w2, w3]);
    const visible = useWidgetsStore.getState().getVisibleWidgets();
    expect(visible).toHaveLength(2);
    expect(visible[0].position).toBe(1);
    expect(visible[1].position).toBe(2);
  });

  it('moveWidget swaps positions', () => {
    const w1 = makeWidget({ position: 0 });
    const w2 = makeWidget({ position: 1 });
    useWidgetsStore.getState().setWidgets([w1, w2]);
    useWidgetsStore.getState().moveWidget(w1.id, 'down');
    const widgets = useWidgetsStore.getState().widgets.sort((a, b) => a.position - b.position);
    expect(widgets[0].id).toBe(w2.id);
    expect(widgets[1].id).toBe(w1.id);
  });

  it('moveWidget does nothing at boundaries', () => {
    const w1 = makeWidget({ position: 0 });
    const w2 = makeWidget({ position: 1 });
    useWidgetsStore.getState().setWidgets([w1, w2]);
    useWidgetsStore.getState().moveWidget(w1.id, 'up');
    expect(useWidgetsStore.getState().widgets.find((w) => w.id === w1.id)?.position).toBe(0);
    useWidgetsStore.getState().moveWidget(w2.id, 'down');
    expect(useWidgetsStore.getState().widgets.find((w) => w.id === w2.id)?.position).toBe(1);
  });

  it('moveWidget does nothing for unknown widgetId', () => {
    const w = makeWidget({ position: 0 });
    useWidgetsStore.getState().setWidgets([w]);
    useWidgetsStore.getState().moveWidget('nonexistent', 'up');
    expect(useWidgetsStore.getState().widgets).toHaveLength(1);
  });

  it('toggleWidgetVisibility', () => {
    const w = makeWidget({ isVisible: true });
    useWidgetsStore.getState().setWidgets([w]);
    useWidgetsStore.getState().toggleWidgetVisibility(w.id);
    expect(useWidgetsStore.getState().widgets[0].isVisible).toBe(false);
    useWidgetsStore.getState().toggleWidgetVisibility(w.id);
    expect(useWidgetsStore.getState().widgets[0].isVisible).toBe(true);
  });

  it('resizeWidget', () => {
    const w = makeWidget({ size: 'small' });
    useWidgetsStore.getState().setWidgets([w]);
    useWidgetsStore.getState().resizeWidget(w.id, 'large');
    expect(useWidgetsStore.getState().widgets[0].size).toBe('large');
  });
});
