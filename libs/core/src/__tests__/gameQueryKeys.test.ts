/**
 * gameQueryKeys — unit tests
 *
 * Ensures query keys are stable, unique, and correctly structured
 * so React Query cache invalidation works as expected.
 */

import { describe, it, expect } from 'vitest';
import { gameQueryKeys } from '../hooks/useGamesQuery';

describe('gameQueryKeys — structure', () => {
  it('all is ["games"]', () => {
    expect(gameQueryKeys.all).toEqual(['games']);
  });

  it('lists() starts with all', () => {
    expect(gameQueryKeys.lists()[0]).toBe('games');
    expect(gameQueryKeys.lists()[1]).toBe('list');
  });

  it('list() with no options is a superset of lists()', () => {
    const list = gameQueryKeys.list();
    const lists = gameQueryKeys.lists();
    expect(list.slice(0, lists.length)).toEqual([...lists]);
  });

  it('list(options) includes the options object', () => {
    const opts = { query: 'zelda', platformId: 'p1' };
    const key = gameQueryKeys.list(opts);
    expect(key[key.length - 1]).toBe(opts);
  });

  it('detail(id) includes the game id', () => {
    expect(gameQueryKeys.detail('game-123')).toContain('game-123');
    expect(gameQueryKeys.detail('game-123')).toContain('detail');
  });

  it('recent(limit) includes the limit', () => {
    expect(gameQueryKeys.recent(5)).toContain(5);
    expect(gameQueryKeys.recent(5)).toContain('recent');
  });

  it('favorites() contains "favorites"', () => {
    expect(gameQueryKeys.favorites()).toContain('favorites');
  });
});

describe('gameQueryKeys — uniqueness', () => {
  it('list and detail keys are distinct', () => {
    const list = JSON.stringify(gameQueryKeys.list());
    const detail = JSON.stringify(gameQueryKeys.detail('g1'));
    expect(list).not.toBe(detail);
  });

  it('different detail ids produce different keys', () => {
    expect(gameQueryKeys.detail('g1')).not.toEqual(gameQueryKeys.detail('g2'));
  });

  it('different recent limits produce different keys', () => {
    expect(gameQueryKeys.recent(5)).not.toEqual(gameQueryKeys.recent(10));
  });

  it('list with options differs from list without options', () => {
    const withOpts = gameQueryKeys.list({ query: 'z' });
    const withoutOpts = gameQueryKeys.list();
    expect(withOpts).not.toEqual(withoutOpts);
  });
});
