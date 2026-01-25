/**
 * Vexor ORM Core Types
 *
 * Type definitions for the ORM system with full TypeScript inference.
 */

// ============ Column Types ============

/**
 * Base column definition
 */
export interface ColumnDef<T = unknown> {
  readonly _type: T;
  readonly _brand: 'ColumnDef';
  readonly dataType: DataType;
  readonly name?: string;
  readonly notNull: boolean;
  readonly hasDefault: boolean;
  readonly primaryKey: boolean;
  readonly unique: boolean;
  readonly references?: ForeignKeyRef;
  readonly defaultValue?: unknown;
  readonly check?: string;
  readonly length?: number;
  readonly precision?: number;
  readonly scale?: number;
  readonly enumValues?: string[];
}

/**
 * Foreign key reference
 */
export interface ForeignKeyRef {
  table: string;
  column: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

/**
 * SQL data types
 */
export type DataType =
  | 'serial'
  | 'bigserial'
  | 'integer'
  | 'bigint'
  | 'smallint'
  | 'decimal'
  | 'numeric'
  | 'real'
  | 'double'
  | 'double precision'
  | 'varchar'
  | 'char'
  | 'text'
  | 'boolean'
  | 'date'
  | 'time'
  | 'timestamp'
  | 'timestamptz'
  | 'json'
  | 'jsonb'
  | 'uuid'
  | 'bytea'
  | 'enum';

/**
 * Column builder for fluent API
 */
export interface ColumnBuilder<T, NotNull extends boolean = false, HasDefault extends boolean = false> {
  readonly _type: T;
  readonly _notNull: NotNull;
  readonly _hasDefault: HasDefault;

  /** Mark column as NOT NULL */
  notNull(): ColumnBuilder<T, true, HasDefault>;

  /** Mark column as primary key */
  primaryKey(): ColumnBuilder<T, true, HasDefault>;

  /** Mark column as unique */
  unique(): ColumnBuilder<T, NotNull, HasDefault>;

  /** Set default value */
  default(value: T | (() => T)): ColumnBuilder<T, NotNull, true>;

  /** Set default to current timestamp */
  defaultNow(): ColumnBuilder<T, NotNull, true>;

  /** Add foreign key reference */
  references(ref: () => ForeignKeyRef): ColumnBuilder<T, NotNull, HasDefault>;

  /** Add check constraint */
  check(expression: string): ColumnBuilder<T, NotNull, HasDefault>;

  /** Build the column definition */
  build(name: string): ColumnDef<T>;
}

// ============ Table Types ============

/**
 * Table column definitions
 */
export type TableColumns = Record<string, ColumnDef>;

/**
 * Table definition
 */
export interface TableDef<TColumns extends TableColumns = TableColumns> {
  readonly _brand: 'TableDef';
  readonly tableName: string;
  readonly schema?: string;
  readonly columns: TColumns;
  readonly primaryKey?: (keyof TColumns)[];
  readonly indexes?: IndexDef[];
  readonly constraints?: ConstraintDef[];
}

/**
 * Index definition
 */
export interface IndexDef {
  name: string;
  columns: string[];
  unique: boolean;
  where?: string;
  using?: 'btree' | 'hash' | 'gin' | 'gist';
}

/**
 * Constraint definition
 */
export interface ConstraintDef {
  name: string;
  type: 'primary' | 'unique' | 'foreign' | 'check';
  columns: string[];
  check?: string;
  references?: {
    table: string;
    columns: string[];
  };
}

// ============ Type Inference ============

/**
 * Infer columns from table definition
 */
export type InferTableColumns<T extends TableDef> = T['columns'];

/**
 * Infer TypeScript type for a column
 */
export type InferColumnType<T extends ColumnDef> = T['_type'];

/**
 * Infer select type (includes nullable for optional columns)
 */
export type InferSelectType<T extends TableColumns> = {
  [K in keyof T]: T[K]['notNull'] extends true
    ? InferColumnType<T[K]>
    : InferColumnType<T[K]> | null;
};

/**
 * Infer insert type (excludes auto-generated, includes defaults as optional)
 */
export type InferInsertType<T extends TableColumns> = {
  [K in keyof T as T[K]['hasDefault'] extends true ? never : T[K]['notNull'] extends true ? K : never]: InferColumnType<T[K]>;
} & {
  [K in keyof T as T[K]['hasDefault'] extends true ? K : T[K]['notNull'] extends true ? never : K]?: InferColumnType<T[K]>;
};

/**
 * Infer update type (all columns optional)
 */
export type InferUpdateType<T extends TableColumns> = Partial<{
  [K in keyof T]: InferColumnType<T[K]>;
}>;

// ============ Query Types ============

/**
 * Order direction
 */
export type OrderDirection = 'asc' | 'desc';

/**
 * Join type
 */
export type JoinType = 'inner' | 'left' | 'right' | 'full';

/**
 * Comparison operators
 */
export type ComparisonOp = '=' | '!=' | '<' | '>' | '<=' | '>=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';

/**
 * SQL expression
 */
export interface SQLExpression {
  readonly _brand: 'SQLExpression';
  toSQL(): string;
  getValues(): unknown[];
}

/**
 * Column reference for queries
 */
export interface ColumnRef<T = unknown> extends SQLExpression {
  readonly _type: T;
  readonly table: string;
  readonly column: string;
}

/**
 * Query result field info
 */
export interface QueryField {
  name: string;
  type: string;
}

/**
 * Query result
 */
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  fields?: QueryField[];
  lastInsertId?: number;
}

// ============ Database Connection ============

/**
 * Database configuration
 */
export interface DatabaseConfig {
  driver: 'postgres' | 'sqlite' | 'mysql';
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  connectionString?: string;
  maxConnections?: number;
  idleTimeout?: number;
  pool?: boolean;
}

/**
 * Database driver interface
 */
export interface DatabaseDriver {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  close(): Promise<void>;
}

/**
 * Transaction interface
 */
export interface Transaction {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  execute<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// ============ Migration Types ============

/**
 * Migration record from database
 */
export interface Migration {
  version: string;
  name: string;
  appliedAt?: Date;
}

/**
 * Migration status
 */
export interface MigrationStatus {
  version: string;
  name: string;
  applied: boolean;
  appliedAt?: Date;
}
