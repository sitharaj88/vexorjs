/**
 * Connection Pooling System
 *
 * High-performance connection pool with health checks,
 * intelligent routing, and automatic recovery.
 */

import type { DatabaseConfig, DatabaseDriver, QueryResult } from '../core/types.js';

/**
 * Connection state
 */
export type ConnectionState = 'idle' | 'busy' | 'closed' | 'error';

/**
 * Pool connection wrapper
 */
export interface PoolConnection {
  /** Unique connection ID */
  id: string;
  /** Underlying driver connection */
  driver: DatabaseDriver;
  /** Current state */
  state: ConnectionState;
  /** When the connection was created */
  createdAt: Date;
  /** When the connection was last used */
  lastUsedAt: Date;
  /** Number of queries executed */
  queryCount: number;
  /** Last error if any */
  lastError?: Error;
}

/**
 * Pool configuration options
 */
export interface PoolOptions {
  /** Minimum number of connections to maintain */
  min?: number;
  /** Maximum number of connections */
  max?: number;
  /** Connection acquisition timeout in ms */
  acquireTimeout?: number;
  /** Idle connection timeout in ms */
  idleTimeout?: number;
  /** Connection validation interval in ms */
  validateInterval?: number;
  /** Maximum connection age in ms */
  maxAge?: number;
  /** Enable connection health checks */
  healthCheck?: boolean;
  /** Health check interval in ms */
  healthCheckInterval?: number;
  /** Maximum retries for failed operations */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

/**
 * Pool statistics
 */
export interface PoolStats {
  /** Total connections in pool */
  total: number;
  /** Idle connections */
  idle: number;
  /** Busy connections */
  busy: number;
  /** Pending acquisition requests */
  pending: number;
  /** Total queries executed */
  totalQueries: number;
  /** Failed queries */
  failedQueries: number;
  /** Average query time in ms */
  avgQueryTime: number;
}

/**
 * Default pool options
 */
const DEFAULT_POOL_OPTIONS: Required<PoolOptions> = {
  min: 2,
  max: 10,
  acquireTimeout: 30000,
  idleTimeout: 60000,
  validateInterval: 30000,
  maxAge: 3600000, // 1 hour
  healthCheck: true,
  healthCheckInterval: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Connection acquisition request
 */
interface AcquisitionRequest {
  resolve: (conn: PoolConnection) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * Connection Pool
 *
 * Manages a pool of database connections with automatic
 * health checks, connection recycling, and load balancing.
 */
export class ConnectionPool {
  private options: Required<PoolOptions>;
  private connections: Map<string, PoolConnection> = new Map();
  private idleConnections: Set<string> = new Set();
  private pendingRequests: AcquisitionRequest[] = [];
  private driverFactory: () => Promise<DatabaseDriver>;
  private isShuttingDown = false;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private idleCheckTimer?: ReturnType<typeof setInterval>;

  // Statistics
  private stats = {
    totalQueries: 0,
    failedQueries: 0,
    queryTimes: [] as number[],
  };

  constructor(
    _config: DatabaseConfig,
    driverFactory: () => Promise<DatabaseDriver>,
    options: PoolOptions = {}
  ) {
    this.driverFactory = driverFactory;
    this.options = { ...DEFAULT_POOL_OPTIONS, ...options };
  }

  /**
   * Initialize the pool
   */
  async initialize(): Promise<void> {
    // Create minimum connections
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.options.min; i++) {
      promises.push(this.createConnection());
    }
    await Promise.all(promises);

    // Start health check timer
    if (this.options.healthCheck) {
      this.healthCheckTimer = setInterval(
        () => this.runHealthChecks(),
        this.options.healthCheckInterval
      );
    }

    // Start idle check timer
    this.idleCheckTimer = setInterval(
      () => this.checkIdleConnections(),
      this.options.idleTimeout / 2
    );
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<PoolConnection> {
    if (this.isShuttingDown) {
      throw new Error('Pool is shutting down');
    }

    // Try to get an idle connection
    for (const id of this.idleConnections) {
      const conn = this.connections.get(id);
      if (conn && conn.state === 'idle') {
        this.idleConnections.delete(id);
        conn.state = 'busy';
        conn.lastUsedAt = new Date();
        return conn;
      }
    }

    // Try to create a new connection if under max
    if (this.connections.size < this.options.max) {
      await this.createConnection();
      return this.acquire();
    }

    // Wait for a connection to become available
    return new Promise<PoolConnection>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.pendingRequests.findIndex(
          (r) => r.resolve === resolve
        );
        if (index !== -1) {
          this.pendingRequests.splice(index, 1);
        }
        reject(new Error('Connection acquisition timeout'));
      }, this.options.acquireTimeout);

      this.pendingRequests.push({ resolve, reject, timeout });
    });
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: PoolConnection): void {
    const conn = this.connections.get(connection.id);
    if (!conn) return;

    // Check if connection should be recycled
    const age = Date.now() - conn.createdAt.getTime();
    if (age > this.options.maxAge || conn.state === 'error') {
      this.destroyConnection(conn);
      return;
    }

    // If there are pending requests, assign this connection
    if (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift()!;
      clearTimeout(request.timeout);
      conn.state = 'busy';
      conn.lastUsedAt = new Date();
      request.resolve(conn);
      return;
    }

    // Return to idle pool
    conn.state = 'idle';
    this.idleConnections.add(conn.id);
  }

  /**
   * Execute a query using a pooled connection
   */
  async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    let conn: PoolConnection | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        conn = await this.acquire();
        const result = await conn.driver.query<T>(sql, params);
        conn.queryCount++;
        this.stats.totalQueries++;
        this.stats.queryTimes.push(Date.now() - startTime);

        // Keep only last 1000 query times for average calculation
        if (this.stats.queryTimes.length > 1000) {
          this.stats.queryTimes.shift();
        }

        this.release(conn);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.stats.failedQueries++;

        if (conn) {
          conn.state = 'error';
          conn.lastError = lastError;
          this.release(conn);
        }

        // Wait before retry
        if (attempt < this.options.maxRetries - 1) {
          await this.delay(this.options.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Query failed');
  }

  /**
   * Execute a query and return all rows
   */
  async execute<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    let idle = 0;
    let busy = 0;

    for (const conn of this.connections.values()) {
      if (conn.state === 'idle') idle++;
      else if (conn.state === 'busy') busy++;
    }

    const avgQueryTime =
      this.stats.queryTimes.length > 0
        ? this.stats.queryTimes.reduce((a, b) => a + b, 0) /
          this.stats.queryTimes.length
        : 0;

    return {
      total: this.connections.size,
      idle,
      busy,
      pending: this.pendingRequests.length,
      totalQueries: this.stats.totalQueries,
      failedQueries: this.stats.failedQueries,
      avgQueryTime,
    };
  }

  /**
   * Shutdown the pool
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Clear timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
    }

    // Reject pending requests
    for (const request of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Pool is shutting down'));
    }
    this.pendingRequests = [];

    // Close all connections
    const closePromises: Promise<void>[] = [];
    for (const conn of this.connections.values()) {
      closePromises.push(this.closeConnection(conn));
    }
    await Promise.all(closePromises);

    this.connections.clear();
    this.idleConnections.clear();
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<void> {
    const id = this.generateId();
    const driver = await this.driverFactory();

    const conn: PoolConnection = {
      id,
      driver,
      state: 'idle',
      createdAt: new Date(),
      lastUsedAt: new Date(),
      queryCount: 0,
    };

    this.connections.set(id, conn);
    this.idleConnections.add(id);
  }

  /**
   * Destroy a connection
   */
  private async destroyConnection(conn: PoolConnection): Promise<void> {
    this.connections.delete(conn.id);
    this.idleConnections.delete(conn.id);
    await this.closeConnection(conn);

    // Create replacement if under minimum
    if (this.connections.size < this.options.min && !this.isShuttingDown) {
      await this.createConnection();
    }
  }

  /**
   * Close a connection
   */
  private async closeConnection(conn: PoolConnection): Promise<void> {
    try {
      conn.state = 'closed';
      await conn.driver.close();
    } catch {
      // Ignore close errors
    }
  }

  /**
   * Run health checks on all connections
   */
  private async runHealthChecks(): Promise<void> {
    const checks: Promise<void>[] = [];

    for (const id of this.idleConnections) {
      const conn = this.connections.get(id);
      if (conn) {
        checks.push(this.checkConnection(conn));
      }
    }

    await Promise.all(checks);
  }

  /**
   * Check a single connection
   */
  private async checkConnection(conn: PoolConnection): Promise<void> {
    try {
      // Simple ping query
      await conn.driver.query('SELECT 1');
    } catch {
      conn.state = 'error';
      await this.destroyConnection(conn);
    }
  }

  /**
   * Check and remove idle connections
   */
  private async checkIdleConnections(): Promise<void> {
    const now = Date.now();
    const toRemove: PoolConnection[] = [];

    for (const id of this.idleConnections) {
      const conn = this.connections.get(id);
      if (!conn) continue;

      const idleTime = now - conn.lastUsedAt.getTime();
      const age = now - conn.createdAt.getTime();

      // Remove if idle too long or too old (but keep minimum)
      if (
        this.connections.size > this.options.min &&
        (idleTime > this.options.idleTimeout || age > this.options.maxAge)
      ) {
        toRemove.push(conn);
      }
    }

    for (const conn of toRemove) {
      await this.destroyConnection(conn);
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a connection pool
 */
export function createPool(
  config: DatabaseConfig,
  driverFactory: () => Promise<DatabaseDriver>,
  options?: PoolOptions
): ConnectionPool {
  return new ConnectionPool(config, driverFactory, options);
}
