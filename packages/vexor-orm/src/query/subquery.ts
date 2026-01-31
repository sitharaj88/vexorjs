/**
 * Subquery Support for Vexor ORM
 *
 * Type-safe subqueries for SELECT, WHERE, FROM, and JOIN clauses.
 */

// Simple interface for query builders that can be used in subqueries
export interface QueryBuilderLike {
  toSQL(): { sql: string; params: unknown[] };
}

// ============================================================================
// Types
// ============================================================================

export interface Subquery<T = unknown> {
  readonly _type: 'subquery';
  readonly alias: string;
  readonly query: QueryBuilderLike;
  readonly resultType: T;
  toSQL(): { sql: string; params: unknown[] };
}

export interface ScalarSubquery<T = unknown> {
  readonly _type: 'scalar_subquery';
  readonly query: QueryBuilderLike;
  readonly resultType: T;
  toSQL(): { sql: string; params: unknown[] };
}

export interface ExistsSubquery {
  readonly _type: 'exists_subquery';
  readonly query: QueryBuilderLike;
  readonly negated: boolean;
  toSQL(): { sql: string; params: unknown[] };
}

export interface InSubquery {
  readonly _type: 'in_subquery';
  readonly column: string;
  readonly query: QueryBuilderLike;
  readonly negated: boolean;
  toSQL(): { sql: string; params: unknown[] };
}

export interface LateralSubquery<T = unknown> {
  readonly _type: 'lateral_subquery';
  readonly alias: string;
  readonly query: QueryBuilderLike;
  readonly resultType: T;
  toSQL(): { sql: string; params: unknown[] };
}

export interface CTEDefinition<T = unknown> {
  readonly name: string;
  readonly query: QueryBuilderLike;
  readonly columns?: string[];
  readonly materialized?: boolean;
  readonly recursive?: boolean;
  readonly resultType: T;
}

// ============================================================================
// Subquery Builders
// ============================================================================

/**
 * Create a subquery that can be used in FROM or JOIN
 */
export function subquery<T extends QueryBuilderLike>(
  query: T,
  alias: string
): Subquery<unknown> {
  return {
    _type: 'subquery',
    alias,
    query,
    resultType: undefined as any,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `(${sql}) AS ${alias}`,
        params,
      };
    },
  };
}

/**
 * Create a scalar subquery for use in SELECT or WHERE
 */
export function scalar<T extends QueryBuilderLike>(
  query: T
): ScalarSubquery<unknown> {
  return {
    _type: 'scalar_subquery',
    query,
    resultType: undefined as any,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `(${sql})`,
        params,
      };
    },
  };
}

/**
 * Create an EXISTS subquery condition
 */
export function exists<T extends QueryBuilderLike>(
  query: T
): ExistsSubquery {
  return {
    _type: 'exists_subquery',
    query,
    negated: false,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `EXISTS (${sql})`,
        params,
      };
    },
  };
}

/**
 * Create a NOT EXISTS subquery condition
 */
export function notExists<T extends QueryBuilderLike>(
  query: T
): ExistsSubquery {
  return {
    _type: 'exists_subquery',
    query,
    negated: true,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `NOT EXISTS (${sql})`,
        params,
      };
    },
  };
}

/**
 * Create an IN subquery condition
 */
export function inSubquery<T extends QueryBuilderLike>(
  column: string,
  query: T
): InSubquery {
  return {
    _type: 'in_subquery',
    column,
    query,
    negated: false,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `${column} IN (${sql})`,
        params,
      };
    },
  };
}

/**
 * Create a NOT IN subquery condition
 */
export function notInSubquery<T extends QueryBuilderLike>(
  column: string,
  query: T
): InSubquery {
  return {
    _type: 'in_subquery',
    column,
    query,
    negated: true,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `${column} NOT IN (${sql})`,
        params,
      };
    },
  };
}

/**
 * Create a LATERAL subquery (PostgreSQL)
 */
export function lateral<T extends QueryBuilderLike>(
  query: T,
  alias: string
): LateralSubquery<unknown> {
  return {
    _type: 'lateral_subquery',
    alias,
    query,
    resultType: undefined as any,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `LATERAL (${sql}) AS ${alias}`,
        params,
      };
    },
  };
}

// ============================================================================
// Common Table Expressions (CTE)
// ============================================================================

/**
 * Create a WITH clause (Common Table Expression)
 */
export class WithBuilder<TCTEs extends Record<string, unknown> = {}> {
  private ctes: CTEDefinition[] = [];
  private isRecursive = false;

  /**
   * Add a CTE
   */
  as<
    TName extends string,
    TQuery extends QueryBuilderLike
  >(
    name: TName,
    query: TQuery,
    options?: { columns?: string[]; materialized?: boolean }
  ): WithBuilder<TCTEs & { [K in TName]: unknown }> {
    this.ctes.push({
      name,
      query,
      columns: options?.columns,
      materialized: options?.materialized,
      resultType: undefined as any,
    });
    return this as any;
  }

  /**
   * Add a recursive CTE
   */
  recursive<
    TName extends string,
    _TQuery extends QueryBuilderLike
  >(
    name: TName,
    initialQuery: QueryBuilderLike,
    recursiveQuery: (cte: { name: string }) => QueryBuilderLike,
    options?: { columns?: string[] }
  ): WithBuilder<TCTEs & { [K in TName]: unknown }> {
    this.isRecursive = true;

    // Create a reference to the CTE for the recursive part
    // Note: recursiveQuery is called to validate types but result stored in CTE
    void recursiveQuery({ name });

    this.ctes.push({
      name,
      query: initialQuery, // We'll need to combine initial + recursive
      columns: options?.columns,
      recursive: true,
      resultType: undefined as any,
    });

    return this as any;
  }

  /**
   * Get all CTEs
   */
  getCTEs(): CTEDefinition[] {
    return this.ctes;
  }

  /**
   * Build the WITH clause SQL
   */
  toSQL(): { sql: string; params: unknown[] } {
    if (this.ctes.length === 0) {
      return { sql: '', params: [] };
    }

    const params: unknown[] = [];
    const ctesSql = this.ctes.map((cte) => {
      const { sql: querySQL, params: queryParams } = cte.query.toSQL();
      params.push(...queryParams);

      let cteSql = cte.name;
      if (cte.columns && cte.columns.length > 0) {
        cteSql += ` (${cte.columns.join(', ')})`;
      }
      cteSql += ' AS ';

      if (cte.materialized !== undefined) {
        cteSql += cte.materialized ? 'MATERIALIZED ' : 'NOT MATERIALIZED ';
      }

      cteSql += `(${querySQL})`;
      return cteSql;
    });

    const withKeyword = this.isRecursive ? 'WITH RECURSIVE' : 'WITH';
    return {
      sql: `${withKeyword} ${ctesSql.join(', ')}`,
      params,
    };
  }
}

/**
 * Start building a WITH clause
 */
export function withCTE(): WithBuilder {
  return new WithBuilder();
}

// ============================================================================
// Comparison Operators with Subqueries
// ============================================================================

/**
 * Compare a column with ALL values from a subquery
 */
export function all<T extends QueryBuilderLike>(
  query: T
): { _type: 'all'; query: T; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'all',
    query,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `ALL (${sql})`,
        params,
      };
    },
  };
}

/**
 * Compare a column with ANY value from a subquery
 */
export function any<T extends QueryBuilderLike>(
  query: T
): { _type: 'any'; query: T; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'any',
    query,
    toSQL() {
      const { sql, params } = query.toSQL();
      return {
        sql: `ANY (${sql})`,
        params,
      };
    },
  };
}

/**
 * Alias for ANY (PostgreSQL uses SOME as synonym)
 */
export const some = any;

// ============================================================================
// Derived Table Utilities
// ============================================================================

/**
 * Create a derived table from values
 */
export function values<T extends Record<string, unknown>>(
  rows: T[],
  alias: string
): { _type: 'values'; alias: string; rows: T[]; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'values',
    alias,
    rows,
    toSQL() {
      if (rows.length === 0) {
        throw new Error('VALUES clause requires at least one row');
      }

      const columns = Object.keys(rows[0]);
      const params: unknown[] = [];
      const rowsSql = rows.map((row) => {
        const values = columns.map((col) => {
          params.push(row[col]);
          return '?';
        });
        return `(${values.join(', ')})`;
      });

      return {
        sql: `(VALUES ${rowsSql.join(', ')}) AS ${alias} (${columns.join(', ')})`,
        params,
      };
    },
  };
}

/**
 * Create a UNION of multiple queries
 */
export function union<T extends QueryBuilderLike>(
  ...queries: T[]
): { _type: 'union'; queries: T[]; all: boolean; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'union',
    queries,
    all: false,
    toSQL() {
      const params: unknown[] = [];
      const sqls = queries.map((q) => {
        const { sql, params: qParams } = q.toSQL();
        params.push(...qParams);
        return `(${sql})`;
      });
      return {
        sql: sqls.join(' UNION '),
        params,
      };
    },
  };
}

/**
 * Create a UNION ALL of multiple queries
 */
export function unionAll<T extends QueryBuilderLike>(
  ...queries: T[]
): { _type: 'union'; queries: T[]; all: boolean; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'union',
    queries,
    all: true,
    toSQL() {
      const params: unknown[] = [];
      const sqls = queries.map((q) => {
        const { sql, params: qParams } = q.toSQL();
        params.push(...qParams);
        return `(${sql})`;
      });
      return {
        sql: sqls.join(' UNION ALL '),
        params,
      };
    },
  };
}

/**
 * Create an INTERSECT of multiple queries
 */
export function intersect<T extends QueryBuilderLike>(
  ...queries: T[]
): { _type: 'intersect'; queries: T[]; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'intersect',
    queries,
    toSQL() {
      const params: unknown[] = [];
      const sqls = queries.map((q) => {
        const { sql, params: qParams } = q.toSQL();
        params.push(...qParams);
        return `(${sql})`;
      });
      return {
        sql: sqls.join(' INTERSECT '),
        params,
      };
    },
  };
}

/**
 * Create an EXCEPT of multiple queries
 */
export function except<T extends QueryBuilderLike>(
  ...queries: T[]
): { _type: 'except'; queries: T[]; toSQL: () => { sql: string; params: unknown[] } } {
  return {
    _type: 'except',
    queries,
    toSQL() {
      const params: unknown[] = [];
      const sqls = queries.map((q) => {
        const { sql, params: qParams } = q.toSQL();
        params.push(...qParams);
        return `(${sql})`;
      });
      return {
        sql: sqls.join(' EXCEPT '),
        params,
      };
    },
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isSubquery(value: unknown): value is Subquery {
  return typeof value === 'object' && value !== null && (value as any)._type === 'subquery';
}

export function isScalarSubquery(value: unknown): value is ScalarSubquery {
  return typeof value === 'object' && value !== null && (value as any)._type === 'scalar_subquery';
}

export function isExistsSubquery(value: unknown): value is ExistsSubquery {
  return typeof value === 'object' && value !== null && (value as any)._type === 'exists_subquery';
}

export function isInSubquery(value: unknown): value is InSubquery {
  return typeof value === 'object' && value !== null && (value as any)._type === 'in_subquery';
}

export function isLateralSubquery(value: unknown): value is LateralSubquery {
  return typeof value === 'object' && value !== null && (value as any)._type === 'lateral_subquery';
}
