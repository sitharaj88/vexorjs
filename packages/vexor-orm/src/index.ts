/**
 * Vexor ORM
 *
 * A blazing-fast, TypeScript-first ORM for Node.js, Bun, and Deno.
 *
 * @packageDocumentation
 */

// Core types
export type {
  ColumnDef,
  ColumnBuilder,
  DataType,
  ForeignKeyRef,
  TableDef,
  TableColumns,
  IndexDef,
  ConstraintDef,
  InferTableColumns,
  InferColumnType,
  InferSelectType,
  InferInsertType,
  InferUpdateType,
  OrderDirection,
  JoinType,
  ComparisonOp,
  SQLExpression,
  ColumnRef,
  QueryResult,
  DatabaseConfig,
  DatabaseDriver,
  Transaction,
  Migration,
  MigrationStatus,
} from './core/types.js';

// Column builders
export {
  column,
  col,
} from './core/column.js';

// Table definitions
export {
  Table,
  table,
  index,
  uniqueIndex,
  type TableOptions,
  type TableSelect,
  type TableInsert,
  type TableUpdate,
} from './core/table.js';

// Query builders
export {
  SelectBuilder,
  InsertBuilder,
  UpdateBuilder,
  DeleteBuilder,
  select,
  from,
  insert,
  update,
  deleteFrom,
  del,
  sql,
  SQLValue,
  SQLRaw,
  eq,
  ne,
  lt,
  gt,
  lte,
  gte,
  like,
  ilike,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  and,
  or,
  type WhereCondition,
} from './query/builder.js';

// Connection pooling
export {
  ConnectionPool,
  createPool,
  type ConnectionState,
  type PoolConnection,
  type PoolOptions,
  type PoolStats,
} from './connection/pool.js';

// Transaction management
export {
  TransactionImpl,
  TransactionManager,
  createTransactionManager,
  type IsolationLevel,
  type TransactionOptions,
  type TransactionState,
} from './connection/transaction.js';

// Database drivers
export {
  PostgresDriver,
  createPostgresDriver,
  createPostgresDriverFactory,
  type PostgresConfig,
  type PostgresSSLConfig,
} from './drivers/postgres.js';

export {
  SQLiteDriver,
  createSQLiteDriver,
  createSQLiteDriverFactory,
  createMemoryDatabase,
  type SQLiteConfig,
} from './drivers/sqlite.js';

// Migrations
export {
  MigrationRunner,
  createMigrationRunner,
  type MigrationFile,
  type MigrationRunnerOptions,
  type MigrationResult,
} from './migrations/runner.js';

export {
  MigrationGenerator,
  createMigrationGenerator,
  generateMigrationFileContent,
  type GeneratorOptions,
  type GeneratedMigration,
} from './migrations/generator.js';

// Database client
export {
  Database,
  createDatabase,
  connect,
  type DatabaseOptions,
} from './database.js';

// Re-export column as vexor for API compatibility
export { column as vexor } from './core/column.js';

// Import for default export object
import { column as _column, col as _col } from './core/column.js';
import { table as _table, Table as _Table, index as _index, uniqueIndex as _uniqueIndex } from './core/table.js';
import {
  select as _select,
  from as _from,
  insert as _insert,
  update as _update,
  deleteFrom as _deleteFrom,
  del as _del,
  sql as _sql,
  eq as _eq,
  ne as _ne,
  lt as _lt,
  gt as _gt,
  lte as _lte,
  gte as _gte,
  like as _like,
  ilike as _ilike,
  inArray as _inArray,
  notInArray as _notInArray,
  isNull as _isNull,
  isNotNull as _isNotNull,
  and as _and,
  or as _or,
} from './query/builder.js';
import { createPool as _createPool } from './connection/pool.js';
import { createPostgresDriver as _createPostgresDriver } from './drivers/postgres.js';
import { createSQLiteDriver as _createSQLiteDriver, createMemoryDatabase as _createMemoryDatabase } from './drivers/sqlite.js';
import { createMigrationRunner as _createMigrationRunner } from './migrations/runner.js';
import { createMigrationGenerator as _createMigrationGenerator } from './migrations/generator.js';
import { createDatabase as _createDatabase, connect as _connect } from './database.js';

/**
 * Default export for convenient access
 */
export default {
  column: _column,
  col: _col,
  table: _table,
  Table: _Table,
  index: _index,
  uniqueIndex: _uniqueIndex,
  select: _select,
  from: _from,
  insert: _insert,
  update: _update,
  deleteFrom: _deleteFrom,
  del: _del,
  sql: _sql,
  eq: _eq,
  ne: _ne,
  lt: _lt,
  gt: _gt,
  lte: _lte,
  gte: _gte,
  like: _like,
  ilike: _ilike,
  inArray: _inArray,
  notInArray: _notInArray,
  isNull: _isNull,
  isNotNull: _isNotNull,
  and: _and,
  or: _or,
  createDatabase: _createDatabase,
  connect: _connect,
  createPool: _createPool,
  createPostgresDriver: _createPostgresDriver,
  createSQLiteDriver: _createSQLiteDriver,
  createMemoryDatabase: _createMemoryDatabase,
  createMigrationRunner: _createMigrationRunner,
  createMigrationGenerator: _createMigrationGenerator,
};
