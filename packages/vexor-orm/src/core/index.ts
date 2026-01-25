/**
 * Core Module Exports
 */

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
} from './types.js';

export { column, col } from './column.js';

export {
  Table,
  table,
  index,
  uniqueIndex,
} from './table.js';

export type {
  TableOptions,
  TableSelect,
  TableInsert,
  TableUpdate,
} from './table.js';
