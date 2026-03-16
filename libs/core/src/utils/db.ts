/**
 * Database utility helpers
 */

/**
 * Convert a Unix timestamp (seconds) to a Date.
 */
export function toDate(ts: number): Date {
  return new Date(ts * 1000);
}

/**
 * Convert a nullable Unix timestamp (seconds) to an optional Date.
 */
export function toOptionalDate(ts: number | null | undefined): Date | undefined {
  return ts != null ? new Date(ts * 1000) : undefined;
}

/**
 * Build the SET clause and params for a dynamic SQL UPDATE.
 *
 * Automatically appends `updated_at = <now>`.
 * Returns null if no fields are provided (caller should skip the UPDATE).
 *
 * @example
 * const result = buildUpdateQuery([['title', 'New Title'], ['rating', 9]]);
 * if (!result) return;
 * await db.execute(`UPDATE games SET ${result.setClauses} WHERE id = ?`, [...result.params, id]);
 */
export function buildUpdateQuery(
  fields: Array<[column: string, value: string | number | null]>
): { setClauses: string; params: (string | number | null)[] } | null {
  if (fields.length === 0) return null;

  const all: Array<[string, string | number | null]> = [
    ...fields,
    ['updated_at', Math.floor(Date.now() / 1000)],
  ];

  return {
    setClauses: all.map(([col]) => `${col} = ?`).join(', '),
    params: all.map(([, val]) => val),
  };
}
