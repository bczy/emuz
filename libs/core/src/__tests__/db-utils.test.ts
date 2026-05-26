import { describe, it, expect } from 'vitest';
import { toDate, toOptionalDate, buildUpdateQuery } from '../utils/db';

describe('toDate', () => {
  it('converts Unix seconds to a Date', () => {
    const result = toDate(1700000000);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1700000000 * 1000);
  });

  it('handles zero', () => {
    const result = toDate(0);
    expect(result.getTime()).toBe(0);
  });
});

describe('toOptionalDate', () => {
  it('converts a number to a Date', () => {
    const result = toOptionalDate(1700000000);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(1700000000 * 1000);
  });

  it('returns undefined for null', () => {
    expect(toOptionalDate(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(toOptionalDate(undefined)).toBeUndefined();
  });
});

describe('buildUpdateQuery', () => {
  it('builds SET clause from field pairs', () => {
    const result = buildUpdateQuery([
      ['title', 'New Title'],
      ['rating', 5],
    ]);
    expect(result).not.toBeNull();
    const { setClauses, params } = result as NonNullable<typeof result>;
    expect(setClauses).toContain('title = ?');
    expect(setClauses).toContain('rating = ?');
    expect(setClauses).toContain('updated_at = ?');
    expect(params).toContain('New Title');
    expect(params).toContain(5);
    expect(params.length).toBe(3);
  });

  it('returns null for empty fields', () => {
    expect(buildUpdateQuery([])).toBeNull();
  });

  it('handles null values', () => {
    const result = buildUpdateQuery([['description', null]]);
    expect(result).not.toBeNull();
    const { params } = result as NonNullable<typeof result>;
    expect(params[0]).toBeNull();
  });

  it('always appends updated_at', () => {
    const result = buildUpdateQuery([['title', 'X']]);
    const { setClauses, params } = result as NonNullable<typeof result>;
    expect(setClauses).toContain('updated_at = ?');
    const lastParam = params[params.length - 1];
    expect(typeof lastParam).toBe('number');
  });
});
