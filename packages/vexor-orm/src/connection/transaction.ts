/**
 * Transaction Management
 *
 * Provides transaction support with automatic rollback,
 * savepoints, and nested transactions.
 */

import type { Transaction, QueryResult } from '../core/types.js';
import type { ConnectionPool, PoolConnection } from './pool.js';

/**
 * Transaction isolation levels
 */
export type IsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

/**
 * Transaction options
 */
export interface TransactionOptions {
  /** Isolation level */
  isolationLevel?: IsolationLevel;
  /** Read-only transaction */
  readOnly?: boolean;
  /** Transaction timeout in ms */
  timeout?: number;
}

/**
 * Savepoint for nested transactions
 */
interface Savepoint {
  name: string;
  createdAt: Date;
}

/**
 * Transaction state
 */
export type TransactionState = 'active' | 'committed' | 'rolled_back' | 'error';

/**
 * Transaction implementation
 */
export class TransactionImpl implements Transaction {
  private connection: PoolConnection;
  private pool: ConnectionPool;
  private state: TransactionState = 'active';
  private savepoints: Savepoint[] = [];
  private savepointCounter = 0;
  private timeoutTimer?: ReturnType<typeof setTimeout>;

  constructor(
    connection: PoolConnection,
    pool: ConnectionPool,
    options: TransactionOptions = {}
  ) {
    this.connection = connection;
    this.pool = pool;

    // Set timeout if specified
    if (options.timeout) {
      this.timeoutTimer = setTimeout(() => {
        this.handleTimeout();
      }, options.timeout);
    }
  }

  /**
   * Execute a query within this transaction
   */
  async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    this.ensureActive();
    try {
      return await this.connection.driver.query<T>(sql, params);
    } catch (error) {
      this.state = 'error';
      throw error;
    }
  }

  /**
   * Execute a query and return rows
   */
  async execute<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  /**
   * Commit the transaction
   */
  async commit(): Promise<void> {
    this.ensureActive();
    this.clearTimeout();

    try {
      await this.connection.driver.query('COMMIT');
      this.state = 'committed';
    } finally {
      this.releaseConnection();
    }
  }

  /**
   * Rollback the transaction
   */
  async rollback(): Promise<void> {
    if (this.state !== 'active' && this.state !== 'error') {
      return; // Already finalized
    }
    this.clearTimeout();

    try {
      await this.connection.driver.query('ROLLBACK');
      this.state = 'rolled_back';
    } finally {
      this.releaseConnection();
    }
  }

  /**
   * Create a savepoint for nested transaction
   */
  async savepoint(name?: string): Promise<string> {
    this.ensureActive();

    const savepointName = name || `sp_${++this.savepointCounter}`;
    await this.connection.driver.query(`SAVEPOINT ${savepointName}`);

    this.savepoints.push({
      name: savepointName,
      createdAt: new Date(),
    });

    return savepointName;
  }

  /**
   * Rollback to a savepoint
   */
  async rollbackTo(savepoint: string): Promise<void> {
    this.ensureActive();

    const index = this.savepoints.findIndex((sp) => sp.name === savepoint);
    if (index === -1) {
      throw new Error(`Savepoint "${savepoint}" not found`);
    }

    await this.connection.driver.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);

    // Remove this and all later savepoints
    this.savepoints = this.savepoints.slice(0, index);
  }

  /**
   * Release a savepoint
   */
  async releaseSavepoint(savepoint: string): Promise<void> {
    this.ensureActive();

    const index = this.savepoints.findIndex((sp) => sp.name === savepoint);
    if (index === -1) {
      throw new Error(`Savepoint "${savepoint}" not found`);
    }

    await this.connection.driver.query(`RELEASE SAVEPOINT ${savepoint}`);
    this.savepoints.splice(index, 1);
  }

  /**
   * Check if transaction is active
   */
  isActive(): boolean {
    return this.state === 'active';
  }

  /**
   * Get transaction state
   */
  getState(): TransactionState {
    return this.state;
  }

  /**
   * Ensure transaction is active
   */
  private ensureActive(): void {
    if (this.state !== 'active') {
      throw new Error(`Transaction is ${this.state}`);
    }
  }

  /**
   * Clear timeout timer
   */
  private clearTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
  }

  /**
   * Handle transaction timeout
   */
  private async handleTimeout(): Promise<void> {
    this.state = 'error';
    await this.rollback();
    throw new Error('Transaction timeout');
  }

  /**
   * Release connection back to pool
   */
  private releaseConnection(): void {
    this.pool.release(this.connection);
  }
}

/**
 * Transaction manager
 *
 * Handles transaction lifecycle and provides
 * utilities for working with transactions.
 */
export class TransactionManager {
  private pool: ConnectionPool;

  constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  /**
   * Begin a new transaction
   */
  async begin(options: TransactionOptions = {}): Promise<TransactionImpl> {
    const connection = await this.pool.acquire();

    try {
      // Set isolation level if specified
      if (options.isolationLevel) {
        await connection.driver.query(
          `SET TRANSACTION ISOLATION LEVEL ${options.isolationLevel}`
        );
      }

      // Set read-only if specified
      if (options.readOnly) {
        await connection.driver.query('SET TRANSACTION READ ONLY');
      }

      // Start transaction
      await connection.driver.query('BEGIN');

      return new TransactionImpl(connection, this.pool, options);
    } catch (error) {
      this.pool.release(connection);
      throw error;
    }
  }

  /**
   * Execute callback within a transaction
   *
   * Automatically commits on success, rolls back on error.
   */
  async transaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const tx = await this.begin(options);

    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  /**
   * Execute callback within a transaction with automatic retry
   */
  async transactionWithRetry<T>(
    callback: (tx: Transaction) => Promise<T>,
    options: TransactionOptions & {
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const retryDelay = options.retryDelay ?? 100;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.transaction(callback, options);
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable (serialization failure, deadlock)
        if (this.isRetryableError(error)) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Transaction failed');
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes('deadlock') ||
      message.includes('serialization') ||
      message.includes('could not serialize') ||
      message.includes('lock timeout')
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a transaction manager
 */
export function createTransactionManager(
  pool: ConnectionPool
): TransactionManager {
  return new TransactionManager(pool);
}
