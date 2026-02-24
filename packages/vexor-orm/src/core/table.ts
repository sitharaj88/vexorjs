/**
 * Table Definitions
 *
 * Define database tables with full type inference.
 */

import type {
  ColumnDef,
  ColumnBuilder,
  TableDef,
  TableColumns,
  IndexDef,
  ConstraintDef,
  InferSelectType,
  InferInsertType,
  InferUpdateType,
} from './types.js';

// Removed unused 'Type' import

/**
 * Table options
 */
export interface TableOptions {
  schema?: string;
  primaryKey?: string[];
  indexes?: IndexDef[];
  constraints?: ConstraintDef[];
}

/**
 * Column definitions input (builders or defs)
 */
type ColumnInput = ColumnBuilder<unknown, boolean, boolean> | ColumnDef;

/**
 * Convert column input to column def
 */
function toColumnDef(input: ColumnInput, name: string): ColumnDef {
  if ('_brand' in input && input._brand === 'ColumnDef') {
    return { ...input, name } as ColumnDef;
  }
  // It's a builder
  return (input as ColumnBuilder<unknown>).build(name);
}

/**
 * Infer column type from builder
 */
type InferColumnFromBuilder<T> = T extends ColumnBuilder<infer _Type, infer NotNull, infer HasDefault>
  ? ColumnDef<_Type> & { notNull: NotNull; hasDefault: HasDefault }
  : T extends ColumnDef<infer _Type2>
  ? T
  : never;

/**
 * Infer columns from input
 */
type InferColumnsFromInput<T extends Record<string, ColumnInput>> = {
  [K in keyof T]: InferColumnFromBuilder<T[K]>;
};

/**
 * Table class with type inference
 */
export class Table<TColumns extends TableColumns = TableColumns> implements TableDef<TColumns> {
  readonly _brand = 'TableDef' as const;
  readonly tableName: string;
  readonly schema?: string;
  readonly columns: TColumns;
  readonly primaryKey?: (keyof TColumns)[];
  readonly indexes?: IndexDef[];
  readonly constraints?: ConstraintDef[];

  constructor(
    name: string,
    columns: TColumns,
    options?: TableOptions
  ) {
    this.tableName = name;
    this.columns = columns;
    this.schema = options?.schema;
    this.primaryKey = options?.primaryKey as (keyof TColumns)[];
    this.indexes = options?.indexes;
    this.constraints = options?.constraints;
  }

  /**
   * Get column by name
   */
  getColumn<K extends keyof TColumns>(name: K): TColumns[K] {
    return this.columns[name];
  }

  /**
   * Get all column names
   */
  getColumnNames(): (keyof TColumns)[] {
    return Object.keys(this.columns) as (keyof TColumns)[];
  }

  /**
   * Get full table name (with schema)
   */
  getFullName(): string {
    return this.schema ? `${this.schema}.${this.tableName}` : this.tableName;
  }

  /**
   * Get primary key columns
   */
  getPrimaryKey(): (keyof TColumns)[] {
    if (this.primaryKey) {
      return this.primaryKey;
    }
    // Find columns marked as primary key
    return this.getColumnNames().filter(
      (colName) => this.columns[colName].primaryKey
    );
  }
}

/**
 * Create a table definition
 */
export function table<T extends Record<string, ColumnInput>>(
  name: string,
  columns: T,
  options?: TableOptions
): Table<InferColumnsFromInput<T>> {
  // Convert builders to column defs
  const columnDefs: Record<string, ColumnDef> = {};
  for (const [key, value] of Object.entries(columns)) {
    columnDefs[key] = toColumnDef(value, key);
  }

  return new Table(
    name,
    columnDefs as InferColumnsFromInput<T>,
    options
  );
}

/**
 * Type helpers for working with tables
 */
export type TableSelect<T extends TableDef> = InferSelectType<T['columns']>;
export type TableInsert<T extends TableDef> = InferInsertType<T['columns']>;
export type TableUpdate<T extends TableDef> = InferUpdateType<T['columns']>;

/**
 * Create an index definition
 */
export function index(
  name: string,
  columns: string | string[],
  options?: Omit<IndexDef, 'columns' | 'name' | 'unique'>
): IndexDef {
  return {
    name,
    columns: Array.isArray(columns) ? columns : [columns],
    unique: false,
    ...options,
  };
}

/**
 * Create a unique index definition
 */
export function uniqueIndex(
  name: string,
  columns: string | string[],
  options?: Omit<IndexDef, 'columns' | 'name' | 'unique'>
): IndexDef {
  return {
    name,
    columns: Array.isArray(columns) ? columns : [columns],
    unique: true,
    ...options,
  };
}
