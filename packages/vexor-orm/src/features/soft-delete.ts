/**
 * Soft Delete Feature
 *
 * Adds soft delete capabilities to tables, marking records as deleted
 * instead of actually removing them from the database.
 */

import type { TableDef } from '../core/types.js';

// Local where condition type for soft delete
export interface WhereCondition {
  column: string;
  operator: string;
  value: unknown;
}

// ============================================================================
// Types
// ============================================================================

export interface SoftDeleteOptions {
  /**
   * Column name for soft delete timestamp
   * Default: 'deleted_at'
   */
  column?: string;

  /**
   * Whether to include soft-deleted records by default
   * Default: false
   */
  includeDeleted?: boolean;

  /**
   * Whether to use a boolean flag instead of timestamp
   * Default: false (uses timestamp)
   */
  useBooleanFlag?: boolean;

  /**
   * Column name for boolean flag (if useBooleanFlag is true)
   * Default: 'is_deleted'
   */
  booleanColumn?: string;
}

export interface SoftDeleteTable<T extends TableDef> {
  /** Table definition */
  table: T;
  /** Soft delete options */
  options: Required<SoftDeleteOptions>;
}

export interface SoftDeleteQuery {
  /** Include soft-deleted records in query */
  withTrashed(): this;
  /** Only get soft-deleted records */
  onlyTrashed(): this;
  /** Restore soft-deleted record(s) */
  restore(): Promise<number>;
  /** Permanently delete record(s) */
  forceDelete(): Promise<number>;
}

// ============================================================================
// Default Options
// ============================================================================

const defaultOptions: Required<SoftDeleteOptions> = {
  column: 'deleted_at',
  includeDeleted: false,
  useBooleanFlag: false,
  booleanColumn: 'is_deleted',
};

// ============================================================================
// Soft Delete Helpers
// ============================================================================

/**
 * Create a soft-deletable table wrapper
 */
export function softDeletable<T extends TableDef>(
  table: T,
  options: SoftDeleteOptions = {}
): SoftDeleteTable<T> {
  return {
    table,
    options: { ...defaultOptions, ...options },
  };
}

/**
 * Get the soft delete where condition
 */
export function getSoftDeleteCondition(
  options: Required<SoftDeleteOptions>,
  includeDeleted: boolean = false
): WhereCondition | null {
  if (includeDeleted || options.includeDeleted) {
    return null;
  }

  if (options.useBooleanFlag) {
    return {
      column: options.booleanColumn,
      operator: '=',
      value: false,
    };
  }

  return {
    column: options.column,
    operator: 'IS',
    value: null,
  };
}

/**
 * Get the soft delete update values for delete operation
 */
export function getSoftDeleteValues(
  options: Required<SoftDeleteOptions>
): Record<string, unknown> {
  if (options.useBooleanFlag) {
    return { [options.booleanColumn]: true };
  }

  return { [options.column]: new Date().toISOString() };
}

/**
 * Get the restore values
 */
export function getRestoreValues(
  options: Required<SoftDeleteOptions>
): Record<string, unknown> {
  if (options.useBooleanFlag) {
    return { [options.booleanColumn]: false };
  }

  return { [options.column]: null };
}

/**
 * Get the only trashed where condition
 */
export function getOnlyTrashedCondition(
  options: Required<SoftDeleteOptions>
): WhereCondition {
  if (options.useBooleanFlag) {
    return {
      column: options.booleanColumn,
      operator: '=',
      value: true,
    };
  }

  return {
    column: options.column,
    operator: 'IS NOT',
    value: null,
  };
}

// ============================================================================
// SQL Generation Helpers
// ============================================================================

/**
 * Generate SQL for soft delete where clause
 */
export function generateSoftDeleteWhere(
  options: Required<SoftDeleteOptions>,
  alias?: string
): string {
  const prefix = alias ? `${alias}.` : '';

  if (options.useBooleanFlag) {
    return `${prefix}${options.booleanColumn} = false`;
  }

  return `${prefix}${options.column} IS NULL`;
}

/**
 * Generate SQL for only trashed where clause
 */
export function generateOnlyTrashedWhere(
  options: Required<SoftDeleteOptions>,
  alias?: string
): string {
  const prefix = alias ? `${alias}.` : '';

  if (options.useBooleanFlag) {
    return `${prefix}${options.booleanColumn} = true`;
  }

  return `${prefix}${options.column} IS NOT NULL`;
}

/**
 * Generate SQL for soft delete update
 */
export function generateSoftDeleteUpdate(
  tableName: string,
  options: Required<SoftDeleteOptions>,
  whereClause: string
): string {
  if (options.useBooleanFlag) {
    return `UPDATE ${tableName} SET ${options.booleanColumn} = true WHERE ${whereClause}`;
  }

  return `UPDATE ${tableName} SET ${options.column} = CURRENT_TIMESTAMP WHERE ${whereClause}`;
}

/**
 * Generate SQL for restore
 */
export function generateRestoreUpdate(
  tableName: string,
  options: Required<SoftDeleteOptions>,
  whereClause: string
): string {
  if (options.useBooleanFlag) {
    return `UPDATE ${tableName} SET ${options.booleanColumn} = false WHERE ${whereClause}`;
  }

  return `UPDATE ${tableName} SET ${options.column} = NULL WHERE ${whereClause}`;
}

// ============================================================================
// Soft Delete Query Builder Extension
// ============================================================================

export interface SoftDeleteQueryBuilder {
  /**
   * Include soft-deleted records
   */
  withTrashed(): this;

  /**
   * Only return soft-deleted records
   */
  onlyTrashed(): this;

  /**
   * Soft delete matching records
   */
  softDelete(): Promise<number>;

  /**
   * Restore soft-deleted records
   */
  restore(): Promise<number>;

  /**
   * Permanently delete records (bypass soft delete)
   */
  forceDelete(): Promise<number>;
}

/**
 * Create a soft-delete aware query context
 */
export function createSoftDeleteContext(options: SoftDeleteOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return {
    options: opts,

    /**
     * Apply soft delete filter to SQL
     */
    applySoftDeleteFilter(sql: string, _tableName: string, alias?: string): string {
      const whereCondition = generateSoftDeleteWhere(opts, alias);

      // Check if SQL already has WHERE clause
      const upperSql = sql.toUpperCase();
      const whereIndex = upperSql.lastIndexOf(' WHERE ');

      if (whereIndex !== -1) {
        // Add to existing WHERE
        const beforeWhere = sql.substring(0, whereIndex + 7);
        const afterWhere = sql.substring(whereIndex + 7);
        return `${beforeWhere}${whereCondition} AND ${afterWhere}`;
      }

      // Add new WHERE clause before ORDER BY, GROUP BY, LIMIT, etc.
      const orderIndex = upperSql.indexOf(' ORDER BY');
      const groupIndex = upperSql.indexOf(' GROUP BY');
      const limitIndex = upperSql.indexOf(' LIMIT');
      const havingIndex = upperSql.indexOf(' HAVING');

      const insertIndex = Math.min(
        orderIndex === -1 ? sql.length : orderIndex,
        groupIndex === -1 ? sql.length : groupIndex,
        limitIndex === -1 ? sql.length : limitIndex,
        havingIndex === -1 ? sql.length : havingIndex
      );

      const beforeInsert = sql.substring(0, insertIndex);
      const afterInsert = sql.substring(insertIndex);

      return `${beforeInsert} WHERE ${whereCondition}${afterInsert}`;
    },

    /**
     * Apply only trashed filter to SQL
     */
    applyOnlyTrashedFilter(sql: string, _tableName: string, alias?: string): string {
      const whereCondition = generateOnlyTrashedWhere(opts, alias);

      const upperSql = sql.toUpperCase();
      const whereIndex = upperSql.lastIndexOf(' WHERE ');

      if (whereIndex !== -1) {
        const beforeWhere = sql.substring(0, whereIndex + 7);
        const afterWhere = sql.substring(whereIndex + 7);
        return `${beforeWhere}${whereCondition} AND ${afterWhere}`;
      }

      const insertIndex = Math.min(
        upperSql.indexOf(' ORDER BY') === -1 ? sql.length : upperSql.indexOf(' ORDER BY'),
        upperSql.indexOf(' GROUP BY') === -1 ? sql.length : upperSql.indexOf(' GROUP BY'),
        upperSql.indexOf(' LIMIT') === -1 ? sql.length : upperSql.indexOf(' LIMIT')
      );

      const beforeInsert = sql.substring(0, insertIndex);
      const afterInsert = sql.substring(insertIndex);

      return `${beforeInsert} WHERE ${whereCondition}${afterInsert}`;
    },
  };
}

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Generate migration SQL for adding soft delete column
 */
export function addSoftDeleteColumn(
  tableName: string,
  options: SoftDeleteOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };

  if (opts.useBooleanFlag) {
    return `ALTER TABLE ${tableName} ADD COLUMN ${opts.booleanColumn} BOOLEAN DEFAULT false`;
  }

  return `ALTER TABLE ${tableName} ADD COLUMN ${opts.column} TIMESTAMP NULL`;
}

/**
 * Generate migration SQL for adding soft delete index
 */
export function addSoftDeleteIndex(
  tableName: string,
  options: SoftDeleteOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const column = opts.useBooleanFlag ? opts.booleanColumn : opts.column;

  return `CREATE INDEX idx_${tableName}_soft_delete ON ${tableName}(${column})`;
}

/**
 * Generate migration SQL for removing soft delete column
 */
export function removeSoftDeleteColumn(
  tableName: string,
  options: SoftDeleteOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const column = opts.useBooleanFlag ? opts.booleanColumn : opts.column;

  return `ALTER TABLE ${tableName} DROP COLUMN ${column}`;
}
