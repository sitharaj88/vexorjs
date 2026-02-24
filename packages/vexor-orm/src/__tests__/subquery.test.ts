/**
 * Subquery Tests
 */

import { describe, it, expect } from 'vitest';
import {
  subquery,
  scalar,
  exists,
  notExists,
  inSubquery,
  notInSubquery,
  lateral,
  withCTE,
  union,
  unionAll,
  intersect,
  except,
  all,
  any,
  values,
  isSubquery,
  isScalarSubquery,
  isExistsSubquery,
  isInSubquery,
  isLateralSubquery,
} from '../query/subquery.js';
import type { QueryBuilderLike } from '../query/subquery.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple mock query builder for testing */
function mockQuery(sql: string, params: unknown[] = []): QueryBuilderLike {
  return { toSQL: () => ({ sql, params }) };
}

// ---------------------------------------------------------------------------
// subquery (FROM / JOIN)
// ---------------------------------------------------------------------------
describe('subquery', () => {
  it('should wrap query with alias', () => {
    const q = mockQuery('SELECT id FROM users WHERE active = ?', [true]);
    const sq = subquery(q, 'active_users');

    expect(sq._type).toBe('subquery');
    expect(sq.alias).toBe('active_users');

    const { sql, params } = sq.toSQL();
    expect(sql).toBe('(SELECT id FROM users WHERE active = ?) AS active_users');
    expect(params).toEqual([true]);
  });
});

// ---------------------------------------------------------------------------
// scalar subquery
// ---------------------------------------------------------------------------
describe('scalar', () => {
  it('should wrap query in parentheses', () => {
    const q = mockQuery('SELECT COUNT(*) FROM orders WHERE user_id = ?', [1]);
    const sq = scalar(q);

    expect(sq._type).toBe('scalar_subquery');
    const { sql, params } = sq.toSQL();
    expect(sql).toBe('(SELECT COUNT(*) FROM orders WHERE user_id = ?)');
    expect(params).toEqual([1]);
  });
});

// ---------------------------------------------------------------------------
// EXISTS
// ---------------------------------------------------------------------------
describe('exists', () => {
  it('should produce EXISTS SQL', () => {
    const q = mockQuery('SELECT 1 FROM users WHERE id = ?', [42]);
    const eq = exists(q);

    expect(eq._type).toBe('exists_subquery');
    expect(eq.negated).toBe(false);

    const { sql, params } = eq.toSQL();
    expect(sql).toBe('EXISTS (SELECT 1 FROM users WHERE id = ?)');
    expect(params).toEqual([42]);
  });
});

describe('notExists', () => {
  it('should produce NOT EXISTS SQL', () => {
    const q = mockQuery('SELECT 1 FROM bans WHERE user_id = ?', [7]);
    const neq = notExists(q);

    expect(neq._type).toBe('exists_subquery');
    expect(neq.negated).toBe(true);

    const { sql, params } = neq.toSQL();
    expect(sql).toBe('NOT EXISTS (SELECT 1 FROM bans WHERE user_id = ?)');
    expect(params).toEqual([7]);
  });
});

// ---------------------------------------------------------------------------
// IN / NOT IN
// ---------------------------------------------------------------------------
describe('inSubquery', () => {
  it('should produce column IN (subquery) SQL', () => {
    const q = mockQuery('SELECT id FROM active_users');
    const iq = inSubquery('user_id', q);

    expect(iq._type).toBe('in_subquery');
    expect(iq.negated).toBe(false);

    const { sql, params } = iq.toSQL();
    expect(sql).toBe('user_id IN (SELECT id FROM active_users)');
    expect(params).toEqual([]);
  });
});

describe('notInSubquery', () => {
  it('should produce column NOT IN (subquery) SQL', () => {
    const q = mockQuery('SELECT id FROM banned_users');
    const niq = notInSubquery('user_id', q);

    expect(niq._type).toBe('in_subquery');
    expect(niq.negated).toBe(true);

    const { sql, params } = niq.toSQL();
    expect(sql).toBe('user_id NOT IN (SELECT id FROM banned_users)');
    expect(params).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// LATERAL
// ---------------------------------------------------------------------------
describe('lateral', () => {
  it('should produce LATERAL (subquery) AS alias', () => {
    const q = mockQuery('SELECT * FROM get_orders(u.id)');
    const lq = lateral(q, 'orders');

    expect(lq._type).toBe('lateral_subquery');

    const { sql, params } = lq.toSQL();
    expect(sql).toBe('LATERAL (SELECT * FROM get_orders(u.id)) AS orders');
    expect(params).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CTE / WITH
// ---------------------------------------------------------------------------
describe('WithBuilder', () => {
  it('should build a simple CTE', () => {
    const q = mockQuery('SELECT id, name FROM users WHERE active = ?', [true]);
    const builder = withCTE().as('active_users', q);

    const { sql, params } = builder.toSQL();
    expect(sql).toBe('WITH active_users AS (SELECT id, name FROM users WHERE active = ?)');
    expect(params).toEqual([true]);
  });

  it('should build multiple CTEs', () => {
    const q1 = mockQuery('SELECT id FROM users');
    const q2 = mockQuery('SELECT user_id FROM orders WHERE total > ?', [100]);

    const builder = withCTE()
      .as('all_users', q1)
      .as('big_orders', q2);

    const { sql, params } = builder.toSQL();
    expect(sql).toContain('WITH');
    expect(sql).toContain('all_users AS (SELECT id FROM users)');
    expect(sql).toContain('big_orders AS (SELECT user_id FROM orders WHERE total > ?)');
    expect(params).toEqual([100]);
  });

  it('should support column list', () => {
    const q = mockQuery('SELECT 1, 2, 3');
    const builder = withCTE().as('nums', q, { columns: ['a', 'b', 'c'] });

    const { sql } = builder.toSQL();
    expect(sql).toContain('nums (a, b, c) AS (SELECT 1, 2, 3)');
  });

  it('should support MATERIALIZED hint', () => {
    const q = mockQuery('SELECT * FROM big_table');
    const builder = withCTE().as('cached', q, { materialized: true });

    const { sql } = builder.toSQL();
    expect(sql).toContain('MATERIALIZED (SELECT * FROM big_table)');
  });

  it('should support NOT MATERIALIZED hint', () => {
    const q = mockQuery('SELECT * FROM small_table');
    const builder = withCTE().as('uncached', q, { materialized: false });

    const { sql } = builder.toSQL();
    expect(sql).toContain('NOT MATERIALIZED (SELECT * FROM small_table)');
  });

  it('should return empty string when no CTEs added', () => {
    const { sql, params } = withCTE().toSQL();
    expect(sql).toBe('');
    expect(params).toEqual([]);
  });

  it('should return all CTEs from getCTEs', () => {
    const builder = withCTE()
      .as('a', mockQuery('SELECT 1'))
      .as('b', mockQuery('SELECT 2'));

    const ctes = builder.getCTEs();
    expect(ctes).toHaveLength(2);
    expect(ctes[0].name).toBe('a');
    expect(ctes[1].name).toBe('b');
  });
});

// ---------------------------------------------------------------------------
// UNION / INTERSECT / EXCEPT
// ---------------------------------------------------------------------------
describe('union', () => {
  it('should produce UNION SQL', () => {
    const q1 = mockQuery('SELECT id FROM a');
    const q2 = mockQuery('SELECT id FROM b');

    const { sql, params } = union(q1, q2).toSQL();
    expect(sql).toBe('(SELECT id FROM a) UNION (SELECT id FROM b)');
    expect(params).toEqual([]);
  });
});

describe('unionAll', () => {
  it('should produce UNION ALL SQL', () => {
    const q1 = mockQuery('SELECT id FROM a');
    const q2 = mockQuery('SELECT id FROM b');

    const { sql } = unionAll(q1, q2).toSQL();
    expect(sql).toBe('(SELECT id FROM a) UNION ALL (SELECT id FROM b)');
  });
});

describe('intersect', () => {
  it('should produce INTERSECT SQL', () => {
    const q1 = mockQuery('SELECT id FROM a');
    const q2 = mockQuery('SELECT id FROM b');

    const { sql } = intersect(q1, q2).toSQL();
    expect(sql).toBe('(SELECT id FROM a) INTERSECT (SELECT id FROM b)');
  });
});

describe('except', () => {
  it('should produce EXCEPT SQL', () => {
    const q1 = mockQuery('SELECT id FROM a');
    const q2 = mockQuery('SELECT id FROM b');

    const { sql } = except(q1, q2).toSQL();
    expect(sql).toBe('(SELECT id FROM a) EXCEPT (SELECT id FROM b)');
  });
});

// ---------------------------------------------------------------------------
// ALL / ANY
// ---------------------------------------------------------------------------
describe('all', () => {
  it('should produce ALL (subquery)', () => {
    const q = mockQuery('SELECT price FROM products');
    const { sql } = all(q).toSQL();
    expect(sql).toBe('ALL (SELECT price FROM products)');
  });
});

describe('any', () => {
  it('should produce ANY (subquery)', () => {
    const q = mockQuery('SELECT price FROM products');
    const { sql } = any(q).toSQL();
    expect(sql).toBe('ANY (SELECT price FROM products)');
  });
});

// ---------------------------------------------------------------------------
// VALUES
// ---------------------------------------------------------------------------
describe('values', () => {
  it('should produce VALUES clause from rows', () => {
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const { sql, params } = values(rows, 'v').toSQL();

    expect(sql).toBe('(VALUES (?, ?), (?, ?)) AS v (id, name)');
    expect(params).toEqual([1, 'Alice', 2, 'Bob']);
  });

  it('should throw on empty rows', () => {
    expect(() => values([], 'v').toSQL()).toThrow('VALUES clause requires at least one row');
  });
});

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------
describe('type guards', () => {
  it('isSubquery', () => {
    const sq = subquery(mockQuery('SELECT 1'), 'a');
    expect(isSubquery(sq)).toBe(true);
    expect(isSubquery(null)).toBe(false);
    expect(isSubquery({ _type: 'other' })).toBe(false);
  });

  it('isScalarSubquery', () => {
    const sq = scalar(mockQuery('SELECT 1'));
    expect(isScalarSubquery(sq)).toBe(true);
  });

  it('isExistsSubquery', () => {
    const sq = exists(mockQuery('SELECT 1'));
    expect(isExistsSubquery(sq)).toBe(true);
  });

  it('isInSubquery', () => {
    const sq = inSubquery('col', mockQuery('SELECT 1'));
    expect(isInSubquery(sq)).toBe(true);
  });

  it('isLateralSubquery', () => {
    const sq = lateral(mockQuery('SELECT 1'), 'a');
    expect(isLateralSubquery(sq)).toBe(true);
  });
});
