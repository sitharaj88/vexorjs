/**
 * Database Client
 *
 * Main entry point for Vexor ORM that ties together
 * connection pooling, query building, and transactions.
 */

import type {
  DatabaseConfig,
  DatabaseDriver,
  TableDef,
  QueryResult,
  Transaction,
  InferSelectType,
  InferInsertType,
  InferUpdateType,
} from './core/types.js';

import { ConnectionPool, createPool, type PoolOptions } from './connection/pool.js';
import { TransactionManager, type TransactionOptions } from './connection/transaction.js';
import { createPostgresDriverFactory, type PostgresConfig } from './drivers/postgres.js';
import { createSQLiteDriverFactory, type SQLiteConfig } from './drivers/sqlite.js';
import {
  SelectBuilder,
  InsertBuilder,
  UpdateBuilder,
  DeleteBuilder,
  select as selectBuilder,
  insert as insertBuilder,
  update as updateBuilder,
  deleteFrom as deleteFromBuilder,
  type WhereCondition,
} from './query/builder.js';
import { MigrationRunner, type MigrationFile, type MigrationRunnerOptions } from './migrations/runner.js';

/**
 * Database options
 */
export interface DatabaseOptions {
  /** Pool configuration */
  pool?: PoolOptions;
  /** Migration options */
  migrations?: MigrationRunnerOptions;
  /** Enable query logging */
  logging?: boolean | ((sql: string, params?: unknown[]) => void);
}

/**
 * Database client
 *
 * Main interface for interacting with the database.
 */
export class Database {
  private config: DatabaseConfig;
  private options: DatabaseOptions;
  private pool: ConnectionPool | null = null;
  private transactionManager: TransactionManager | null = null;
  private migrationRunner: MigrationRunner | null = null;
  private isConnected = false;

  constructor(config: DatabaseConfig, options: DatabaseOptions = {}) {
    this.config = config;
    this.options = options;
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    // Create driver factory based on config
    const driverFactory = this.createDriverFactory();

    // Create connection pool
    this.pool = createPool(this.config, driverFactory, this.options.pool);
    await this.pool.initialize();

    // Create transaction manager
    this.transactionManager = new TransactionManager(this.pool);

    this.isConnected = true;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.shutdown();
      this.pool = null;
    }
    this.transactionManager = null;
    this.isConnected = false;
  }

  /**
   * Execute a raw SQL query
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    this.ensureConnected();
    this.logQuery(sql, params);
    return this.pool!.query<T>(sql, params);
  }

  /**
   * Execute a query and return rows
   */
  async execute<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  /**
   * Start a SELECT query
   */
  select<T extends TableDef>(
    table: T
  ): SelectBuilder<T> {
    return selectBuilder(table);
  }

  /**
   * Start an INSERT query
   */
  insert<T extends TableDef>(
    table: T
  ): InsertBuilder<T> {
    return insertBuilder(table);
  }

  /**
   * Start an UPDATE query
   */
  update<T extends TableDef>(
    table: T
  ): UpdateBuilder<T> {
    return updateBuilder(table);
  }

  /**
   * Start a DELETE query
   */
  delete<T extends TableDef>(
    table: T
  ): DeleteBuilder<T> {
    return deleteFromBuilder(table);
  }

  /**
   * Execute a SELECT query and return results
   */
  async selectFrom<T extends TableDef>(
    table: T
  ): Promise<InferSelectType<T['columns']>[]> {
    const builder = this.select(table);
    const query = builder.toSQL();
    const params = builder.getValues();
    const result = await this.execute<InferSelectType<T['columns']>>(query, params);
    return result;
  }

  /**
   * Insert a row and return the inserted row
   */
  async insertInto<T extends TableDef>(
    table: T,
    values: InferInsertType<T['columns']>
  ): Promise<InferSelectType<T['columns']>> {
    const builder = this.insert(table).values(values as Record<string, unknown>).returningAll();
    const query = builder.toSQL();
    const params = builder.getValues();
    const result = await this.execute<InferSelectType<T['columns']>>(query, params);
    return result[0];
  }

  /**
   * Insert multiple rows
   */
  async insertMany<T extends TableDef>(
    table: T,
    values: InferInsertType<T['columns']>[]
  ): Promise<InferSelectType<T['columns']>[]> {
    const results: InferSelectType<T['columns']>[] = [];
    for (const row of values) {
      const inserted = await this.insertInto(table, row);
      results.push(inserted);
    }
    return results;
  }

  /**
   * Update rows matching condition
   */
  async updateWhere<T extends TableDef>(
    table: T,
    values: Partial<InferUpdateType<T['columns']>>,
    condition: WhereCondition
  ): Promise<number> {
    const builder = this.update(table)
      .set(values as unknown as Partial<Record<keyof T['columns'], unknown>>)
      .where(condition);
    const query = builder.toSQL();
    const params = builder.getValues();
    const result = await this.query(query, params);
    return result.rowCount;
  }

  /**
   * Delete rows matching condition
   */
  async deleteWhere<T extends TableDef>(
    table: T,
    condition: WhereCondition
  ): Promise<number> {
    const builder = this.delete(table).where(condition);
    const query = builder.toSQL();
    const params = builder.getValues();
    const result = await this.query(query, params);
    return result.rowCount;
  }

  /**
   * Find a single row by condition
   */
  async findOne<T extends TableDef>(
    table: T,
    condition: WhereCondition
  ): Promise<InferSelectType<T['columns']> | null> {
    const builder = this.select(table).where(condition).limit(1);
    const query = builder.toSQL();
    const params = builder.getValues();
    const result = await this.execute<InferSelectType<T['columns']>>(query, params);
    return result[0] ?? null;
  }

  /**
   * Find rows by condition
   */
  async findMany<T extends TableDef>(
    table: T,
    condition?: WhereCondition
  ): Promise<InferSelectType<T['columns']>[]> {
    let builder = this.select(table);
    if (condition) {
      builder = builder.where(condition);
    }
    const query = builder.toSQL();
    const params = builder.getValues();
    return this.execute<InferSelectType<T['columns']>>(query, params);
  }

  /**
   * Count rows
   */
  async count<T extends TableDef>(
    table: T,
    condition?: WhereCondition
  ): Promise<number> {
    let builder = this.select(table).selectAll();
    if (condition) {
      builder = builder.where(condition);
    }
    // For count, we need to execute a COUNT query
    const countQuery = `SELECT COUNT(*) as count FROM ${table.tableName}`;
    const result = await this.execute<{ count: number | string }>(countQuery, []);
    const count = result[0]?.count ?? 0;
    return typeof count === 'string' ? parseInt(count, 10) : count;
  }

  /**
   * Begin a transaction
   */
  async transaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    this.ensureConnected();
    return this.transactionManager!.transaction(callback, options);
  }

  /**
   * Get migration runner
   */
  getMigrations(migrations?: MigrationFile[]): MigrationRunner {
    this.ensureConnected();

    if (!this.migrationRunner) {
      // Create a simple driver wrapper for migrations
      const driverWrapper: DatabaseDriver = {
        query: async <T>(sql: string, params?: unknown[]) => {
          return this.pool!.query<T>(sql, params);
        },
        close: async () => {},
      };

      this.migrationRunner = new MigrationRunner(driverWrapper, {
        ...this.options.migrations,
        migrations,
      });
    } else if (migrations) {
      this.migrationRunner.addMigrations(migrations);
    }

    return this.migrationRunner;
  }

  /**
   * Run pending migrations
   */
  async migrate(migrations?: MigrationFile[]): Promise<void> {
    const runner = this.getMigrations(migrations);
    await runner.migrateUp();
  }

  /**
   * Rollback last migration
   */
  async rollback(): Promise<void> {
    const runner = this.getMigrations();
    await runner.migrateDown();
  }

  /**
   * Get pool statistics
   */
  getStats() {
    this.ensureConnected();
    return this.pool!.getStats();
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Ensure database is connected
   */
  private ensureConnected(): void {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
  }

  /**
   * Create driver factory based on config
   */
  private createDriverFactory(): () => Promise<DatabaseDriver> {
    switch (this.config.driver) {
      case 'postgres':
        return createPostgresDriverFactory(this.config as PostgresConfig);
      case 'sqlite':
        return createSQLiteDriverFactory(this.config as SQLiteConfig);
      default:
        throw new Error(`Unsupported database driver: ${this.config.driver}`);
    }
  }

  /**
   * Log query if logging is enabled
   */
  private logQuery(sql: string, params?: unknown[]): void {
    if (!this.options.logging) return;

    if (typeof this.options.logging === 'function') {
      this.options.logging(sql, params);
    } else {
      console.log('[SQL]', sql, params ?? []);
    }
  }
}

/**
 * Create a database connection
 */
export function createDatabase(
  config: DatabaseConfig,
  options?: DatabaseOptions
): Database {
  return new Database(config, options);
}

/**
 * Create and connect to a database
 */
export async function connect(
  config: DatabaseConfig,
  options?: DatabaseOptions
): Promise<Database> {
  const db = createDatabase(config, options);
  await db.connect();
  return db;
}
