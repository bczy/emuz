/**
 * WidgetService — Drizzle in-memory tests.
 * RED until: schema exports Drizzle tables AND WidgetService accepts DrizzleDb.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@emuz/database/schema';
import type { DrizzleDb } from '@emuz/database/schema';
import { WidgetService } from '../services/WidgetService';

let sqlite: InstanceType<typeof Database>;
let db: DrizzleDb;
let svc: WidgetService;

function setupTables(d: DrizzleDb): void {
  d.run(
    sql`CREATE TABLE IF NOT EXISTS widgets (id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT, size TEXT DEFAULT 'medium', position INTEGER NOT NULL, config TEXT, is_visible INTEGER DEFAULT 1, created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS platforms (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, manufacturer TEXT, generation INTEGER, release_year INTEGER, icon_path TEXT, wallpaper_path TEXT, color TEXT, rom_extensions TEXT NOT NULL DEFAULT '[]', created_at INTEGER, updated_at INTEGER)`
  );
  d.run(
    sql`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, platform_id TEXT NOT NULL, title TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT NOT NULL, file_size INTEGER, file_hash TEXT, cover_path TEXT, description TEXT, developer TEXT, publisher TEXT, release_date TEXT, genre TEXT, rating REAL, play_count INTEGER DEFAULT 0, play_time INTEGER DEFAULT 0, last_played_at INTEGER, is_favorite INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)`
  );
}

beforeEach(() => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  setupTables(db);
  svc = new WidgetService(db);
});

afterEach(() => sqlite.close());

describe('WidgetService (Drizzle)', () => {
  it('getWidgets returns empty list initially', async () => {
    expect(await svc.getWidgets()).toHaveLength(0);
  });

  it('addWidget creates a widget with auto-position', async () => {
    const w = await svc.addWidget({ type: 'recent_games' });
    expect(w.id).toBeDefined();
    expect(w.type).toBe('recent_games');
    expect(w.position).toBe(0);
  });

  it('addWidget increments position', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    const w2 = await svc.addWidget({ type: 'favorites' });
    expect(w2.position).toBe(w1.position + 1);
  });

  it('getWidgetById returns null for unknown id', async () => {
    expect(await svc.getWidgetById('nonexistent')).toBeNull();
  });

  it('getWidgetById returns widget after add', async () => {
    const w = await svc.addWidget({ type: 'stats', title: 'Stats' });
    const found = await svc.getWidgetById(w.id);
    expect(found?.title).toBe('Stats');
  });

  it('updateWidget updates fields', async () => {
    const w = await svc.addWidget({ type: 'recent_games' });
    const updated = await svc.updateWidget(w.id, { title: 'Recent', isVisible: false });
    expect(updated?.title).toBe('Recent');
    expect(updated?.isVisible).toBe(false);
  });

  it('removeWidget deletes the widget', async () => {
    const w = await svc.addWidget({ type: 'favorites' });
    await svc.removeWidget(w.id);
    expect(await svc.getWidgetById(w.id)).toBeNull();
  });

  it('removeWidget reorders remaining widgets', async () => {
    await svc.addWidget({ type: 'recent_games' });
    const w2 = await svc.addWidget({ type: 'favorites' });
    await svc.addWidget({ type: 'stats' });
    await svc.removeWidget(w2.id);
    const widgets = await svc.getWidgets();
    expect(widgets[0].position).toBe(0);
    expect(widgets[1].position).toBe(1);
  });

  it('reorderWidgets assigns correct positions', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    const w2 = await svc.addWidget({ type: 'favorites' });
    await svc.reorderWidgets([w2.id, w1.id]);
    const widgets = await svc.getWidgets();
    expect(widgets.find((w) => w.id === w2.id)?.position).toBe(0);
    expect(widgets.find((w) => w.id === w1.id)?.position).toBe(1);
  });

  it('getWidgets visibleOnly filter', async () => {
    const w1 = await svc.addWidget({ type: 'recent_games' });
    await svc.updateWidget(w1.id, { isVisible: false });
    await svc.addWidget({ type: 'favorites' });
    const visible = await svc.getWidgets({ visibleOnly: true });
    expect(visible).toHaveLength(1);
  });

  it('getWidgetData returns stats shape', async () => {
    const data = (await svc.getWidgetData('any', 'stats')) as { stats: Record<string, number> };
    expect(data.stats.totalGames).toBeDefined();
  });

  it('getDefaultWidgets returns 5 defaults', () => {
    expect(svc.getDefaultWidgets()).toHaveLength(5);
  });

  it('getWidgetData recent_games returns games list', async () => {
    const data = (await svc.getWidgetData('any', 'recent_games')) as { games: unknown[] };
    expect(Array.isArray(data.games)).toBe(true);
  });

  it('getWidgetData favorites returns games list', async () => {
    const data = (await svc.getWidgetData('any', 'favorites')) as { games: unknown[] };
    expect(Array.isArray(data.games)).toBe(true);
  });

  it('getWidgetData continue_playing returns games list', async () => {
    const data = (await svc.getWidgetData('any', 'continue_playing')) as { games: unknown[] };
    expect(Array.isArray(data.games)).toBe(true);
  });

  it('getWidgetData platform_shortcuts returns platforms list', async () => {
    const data = (await svc.getWidgetData('any', 'platform_shortcuts')) as { platforms: unknown[] };
    expect(Array.isArray(data.platforms)).toBe(true);
  });

  it('updateWidget with no real changes returns current widget', async () => {
    const w = await svc.addWidget({ type: 'stats' });
    const updated = await svc.updateWidget(w.id, {});
    expect(updated?.id).toBe(w.id);
  });

  it('createWidgetService factory returns a working service', async () => {
    const { createWidgetService } = await import('../services/WidgetService');
    const s = createWidgetService(db);
    expect(await s.getWidgets()).toHaveLength(0);
  });
});
