/**
 * Relations
 *
 * Declarative relation primitives for the ORM:
 * - hasOne / hasMany — reverse-side relations (child rows pointing to parent)
 * - belongsTo        — forward-side relation (this row points to a parent)
 * - belongsToMany    — many-to-many through a join table
 *
 * Eager loading is provided via `loadRelations()` which fetches all related
 * rows in a single batched IN-query per relation (no N+1).
 */

import type { TableDef } from '../core/types.js';

/**
 * Either a plain TableDef or a `softDeletable(table)` wrapper.
 *
 * Defined inline (not imported from features/soft-delete) to keep the
 * relations module dependency-light. We only need the shape: a `table`
 * property and `options` describing the deleted-flag column.
 */
export type RelationTarget =
  | TableDef
  | {
      table: TableDef;
      options: {
        column: string;
        useBooleanFlag?: boolean;
        booleanColumn?: string;
        includeDeleted?: boolean;
      };
    };

interface SoftDeleteFilter {
  /** Either `IS NULL` or `= 0` depending on the soft-delete strategy. */
  sql: string;
}

/**
 * Extract the underlying TableDef and an optional soft-delete WHERE
 * fragment. Plain TableDefs return `{ filter: undefined }`.
 */
function resolveTarget(target: RelationTarget): {
  table: TableDef;
  filter: SoftDeleteFilter | undefined;
} {
  if ('_brand' in target && target._brand === 'TableDef') {
    return { table: target, filter: undefined };
  }
  const wrapped = target as Exclude<RelationTarget, TableDef>;
  if (wrapped.options.includeDeleted) {
    return { table: wrapped.table, filter: undefined };
  }
  if (wrapped.options.useBooleanFlag) {
    const col = wrapped.options.booleanColumn ?? 'is_deleted';
    return {
      table: wrapped.table,
      filter: { sql: `${quoteIdent(col)} = 0` },
    };
  }
  return {
    table: wrapped.table,
    filter: { sql: `${quoteIdent(wrapped.options.column)} IS NULL` },
  };
}

// ---------------------------------------------------------------------------
// Relation definitions
// ---------------------------------------------------------------------------

export type RelationKind = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';

export interface BaseRelation {
  readonly _brand: 'Relation';
  readonly kind: RelationKind;
  readonly target: RelationTarget;
}

export interface HasOneRelation extends BaseRelation {
  readonly kind: 'hasOne';
  readonly foreignKey: string; // column on the *target* pointing back
  readonly localKey: string; // column on the *source* (default: 'id')
}

export interface HasManyRelation extends BaseRelation {
  readonly kind: 'hasMany';
  readonly foreignKey: string;
  readonly localKey: string;
}

export interface BelongsToRelation extends BaseRelation {
  readonly kind: 'belongsTo';
  readonly foreignKey: string; // column on the *source* pointing at the parent
  readonly ownerKey: string; // column on the *target* (default: 'id')
}

export interface BelongsToManyRelation extends BaseRelation {
  readonly kind: 'belongsToMany';
  readonly through: TableDef | string;
  readonly sourceKey: string; // FK on the join table → source
  readonly targetKey: string; // FK on the join table → target
  readonly localKey: string; // PK on source (default: 'id')
  readonly ownerKey: string; // PK on target (default: 'id')
}

export type Relation =
  | HasOneRelation
  | HasManyRelation
  | BelongsToRelation
  | BelongsToManyRelation;

export interface HasOneOptions {
  foreignKey: string;
  localKey?: string;
}

export interface HasManyOptions {
  foreignKey: string;
  localKey?: string;
}

export interface BelongsToOptions {
  foreignKey: string;
  ownerKey?: string;
}

export interface BelongsToManyOptions {
  through: TableDef | string;
  sourceKey: string;
  targetKey: string;
  localKey?: string;
  ownerKey?: string;
}

/**
 * Declare a one-to-one relation (target has a FK back to this table).
 *
 *   hasOne(profiles, { foreignKey: 'user_id' })
 *
 * Pass a `softDeletable(profiles)` wrapper to auto-filter soft-deleted
 * children from eager loads.
 */
export function hasOne(
  target: RelationTarget,
  options: HasOneOptions
): HasOneRelation {
  return {
    _brand: 'Relation',
    kind: 'hasOne',
    target,
    foreignKey: options.foreignKey,
    localKey: options.localKey ?? 'id',
  };
}

/**
 * Declare a one-to-many relation (multiple target rows point back).
 *
 *   hasMany(posts, { foreignKey: 'user_id' })
 */
export function hasMany(
  target: RelationTarget,
  options: HasManyOptions
): HasManyRelation {
  return {
    _brand: 'Relation',
    kind: 'hasMany',
    target,
    foreignKey: options.foreignKey,
    localKey: options.localKey ?? 'id',
  };
}

/**
 * Declare a many-to-one (this row points at a parent).
 *
 *   belongsTo(users, { foreignKey: 'user_id' })
 */
export function belongsTo(
  target: RelationTarget,
  options: BelongsToOptions
): BelongsToRelation {
  return {
    _brand: 'Relation',
    kind: 'belongsTo',
    target,
    foreignKey: options.foreignKey,
    ownerKey: options.ownerKey ?? 'id',
  };
}

/**
 * Declare a many-to-many relation through a join table.
 *
 *   belongsToMany(tags, {
 *     through: postTags,
 *     sourceKey: 'post_id',
 *     targetKey: 'tag_id',
 *   })
 */
export function belongsToMany(
  target: RelationTarget,
  options: BelongsToManyOptions
): BelongsToManyRelation {
  return {
    _brand: 'Relation',
    kind: 'belongsToMany',
    target,
    through: options.through,
    sourceKey: options.sourceKey,
    targetKey: options.targetKey,
    localKey: options.localKey ?? 'id',
    ownerKey: options.ownerKey ?? 'id',
  };
}

// ---------------------------------------------------------------------------
// Eager loading (driver-agnostic)
// ---------------------------------------------------------------------------

/**
 * Minimal driver shape needed for eager loading.
 * Compatible with the Database client and any DatabaseDriver.
 */
export interface RelationExecutor {
  query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: T[] }>;
}

/**
 * Map of relation name → relation definition.
 */
export type RelationMap = Record<string, Relation>;

/**
 * Specifies which relations to eager-load. `true` loads the relation as-is.
 */
export type LoadSpec<R extends RelationMap> = {
  [K in keyof R]?: true;
};

/**
 * Result type: parent row plus a property per loaded relation.
 *
 * - hasMany / belongsToMany → array
 * - hasOne / belongsTo      → single row (or null)
 */
export type WithLoaded<TParent, R extends RelationMap, S extends LoadSpec<R>> = TParent & {
  [K in keyof S as S[K] extends true ? K : never]: K extends keyof R
    ? R[K]['kind'] extends 'hasMany' | 'belongsToMany'
      ? Record<string, unknown>[]
      : Record<string, unknown> | null
    : never;
};

/**
 * Quote an identifier for SQL. Uses double-quotes (Postgres/SQLite) which
 * MySQL also accepts in ANSI mode. Keeps it simple — relations rely on
 * user-supplied column names.
 */
function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function placeholders(count: number, start = 1): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    parts.push(`$${start + i}`);
  }
  return parts.join(', ');
}

/**
 * Eager-load relations for a list of parent rows. One IN-query per relation.
 */
export async function loadRelations<TParent extends Record<string, unknown>>(
  executor: RelationExecutor,
  parents: TParent[],
  relations: RelationMap,
  spec: Record<string, true>
): Promise<TParent[]> {
  if (parents.length === 0) return parents;

  for (const [name, flag] of Object.entries(spec)) {
    if (!flag) continue;
    const relation = relations[name];
    if (!relation) {
      throw new Error(`Unknown relation: ${name}`);
    }

    await loadOne(executor, parents, name, relation);
  }

  return parents;
}

async function loadOne(
  executor: RelationExecutor,
  parents: Array<Record<string, unknown>>,
  name: string,
  relation: Relation
): Promise<void> {
  switch (relation.kind) {
    case 'hasOne':
    case 'hasMany': {
      const { foreignKey, localKey } = relation;
      const { table, filter } = resolveTarget(relation.target);
      const ids = uniqueValues(parents.map((p) => p[localKey]));
      if (ids.length === 0) {
        for (const p of parents) {
          p[name] = relation.kind === 'hasMany' ? [] : null;
        }
        return;
      }

      const where = `${quoteIdent(foreignKey)} IN (${placeholders(ids.length)})`;
      const sql = `SELECT * FROM ${quoteIdent(table.tableName)} WHERE ${where}${
        filter ? ` AND ${filter.sql}` : ''
      }`;
      const result = await executor.query<Record<string, unknown>>(sql, ids);

      const grouped = groupBy(result.rows, foreignKey);
      for (const p of parents) {
        const key = p[localKey];
        const matches = grouped.get(key) ?? [];
        p[name] =
          relation.kind === 'hasMany' ? matches : matches[0] ?? null;
      }
      return;
    }

    case 'belongsTo': {
      const { foreignKey, ownerKey } = relation;
      const { table, filter } = resolveTarget(relation.target);
      const ids = uniqueValues(parents.map((p) => p[foreignKey]));
      if (ids.length === 0) {
        for (const p of parents) p[name] = null;
        return;
      }

      const where = `${quoteIdent(ownerKey)} IN (${placeholders(ids.length)})`;
      const sql = `SELECT * FROM ${quoteIdent(table.tableName)} WHERE ${where}${
        filter ? ` AND ${filter.sql}` : ''
      }`;
      const result = await executor.query<Record<string, unknown>>(sql, ids);

      const byKey = new Map<unknown, Record<string, unknown>>();
      for (const row of result.rows) {
        byKey.set(row[ownerKey], row);
      }

      for (const p of parents) {
        p[name] = byKey.get(p[foreignKey]) ?? null;
      }
      return;
    }

    case 'belongsToMany': {
      const { through, sourceKey, targetKey, localKey, ownerKey } = relation;
      const { table, filter } = resolveTarget(relation.target);
      const ids = uniqueValues(parents.map((p) => p[localKey]));
      if (ids.length === 0) {
        for (const p of parents) p[name] = [];
        return;
      }

      const throughName =
        typeof through === 'string' ? through : through.tableName;

      // Single join query: target rows + the source-side FK from the join.
      // The soft-delete filter applies to the *target* table's column, so
      // qualify with `t.` to disambiguate.
      const filterSql = filter
        ? ` AND t.${filter.sql.replace(/^"([^"]+)"/, '"$1"')}`
        : '';
      const sql =
        `SELECT t.*, j.${quoteIdent(sourceKey)} AS __source_key ` +
        `FROM ${quoteIdent(throughName)} j ` +
        `INNER JOIN ${quoteIdent(table.tableName)} t ` +
        `ON j.${quoteIdent(targetKey)} = t.${quoteIdent(ownerKey)} ` +
        `WHERE j.${quoteIdent(sourceKey)} IN (${placeholders(ids.length)})` +
        filterSql;

      const result = await executor.query<Record<string, unknown>>(sql, ids);

      const grouped = new Map<unknown, Record<string, unknown>[]>();
      for (const row of result.rows) {
        const sourceKeyVal = row.__source_key;
        delete row.__source_key;
        if (!grouped.has(sourceKeyVal)) grouped.set(sourceKeyVal, []);
        grouped.get(sourceKeyVal)!.push(row);
      }

      for (const p of parents) {
        p[name] = grouped.get(p[localKey]) ?? [];
      }
      return;
    }
  }
}

function uniqueValues(values: unknown[]): unknown[] {
  const set = new Set<unknown>();
  for (const v of values) {
    if (v !== null && v !== undefined) set.add(v);
  }
  return Array.from(set);
}

function groupBy<T extends Record<string, unknown>>(
  rows: T[],
  key: string
): Map<unknown, T[]> {
  const map = new Map<unknown, T[]>();
  for (const row of rows) {
    const k = row[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(row);
  }
  return map;
}
