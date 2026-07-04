/**
 * Connection Pool Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectionPool } from '../connection/pool.js';

// ---------------------------------------------------------------------------
// Mock types (matching DatabaseDriver & DatabaseConfig interfaces)
// ---------------------------------------------------------------------------

interface MockDriver {
  query: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

function createMockDriver(): MockDriver {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, fields: [] }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockConfig() {
  return {
    dialect: 'postgres' as const,
    host: 'localhost',
    port: 5432,
    database: 'test',
    user: 'test',
    password: 'test',
  };
}

// ---------------------------------------------------------------------------
// ConnectionPool
// ---------------------------------------------------------------------------
describe('ConnectionPool', () => {
  let pool: ConnectionPool;
  let drivers: MockDriver[];

  beforeEach(() => {
    vi.useFakeTimers();
    drivers = [];
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  function createPool(options = {}) {
    const factory = async () => {
      const driver = createMockDriver();
      drivers.push(driver);
      return driver as any;
    };

    return new ConnectionPool(
      createMockConfig() as any,
      factory,
      {
        min: 2,
        max: 5,
        acquireTimeout: 5000,
        healthCheck: false,
        ...options,
      }
    );
  }

  describe('initialization', () => {
    it('should create minimum number of connections on initialize', async () => {
      pool = createPool({ min: 3 });
      await pool.initialize();

      const stats = pool.getStats();
      expect(stats.total).toBe(3);
      expect(stats.idle).toBe(3);
      expect(stats.busy).toBe(0);
      expect(drivers).toHaveLength(3);
    });

    it('should create default minimum connections', async () => {
      pool = createPool({ min: 2 });
      await pool.initialize();

      expect(pool.getStats().total).toBe(2);
    });
  });

  describe('acquire / release', () => {
    it('should acquire an idle connection', async () => {
      pool = createPool();
      await pool.initialize();

      const conn = await pool.acquire();
      expect(conn).toBeDefined();
      expect(conn.state).toBe('busy');
      expect(conn.id).toBeTruthy();

      const stats = pool.getStats();
      expect(stats.busy).toBe(1);
      expect(stats.idle).toBe(1); // min=2, one acquired

      pool.release(conn);
    });

    it('should release connection back to idle', async () => {
      pool = createPool();
      await pool.initialize();

      const conn = await pool.acquire();
      pool.release(conn);

      const stats = pool.getStats();
      expect(stats.idle).toBe(2);
      expect(stats.busy).toBe(0);
    });

    it('should create new connection when all are busy and under max', async () => {
      pool = createPool({ min: 1, max: 3 });
      await pool.initialize();

      const conn1 = await pool.acquire();
      const conn2 = await pool.acquire();

      expect(pool.getStats().total).toBeGreaterThanOrEqual(2);

      pool.release(conn1);
      pool.release(conn2);
    });
  });

  describe('pool stats', () => {
    it('should report correct initial stats', async () => {
      pool = createPool();
      await pool.initialize();

      const stats = pool.getStats();
      expect(stats.total).toBe(2);
      expect(stats.idle).toBe(2);
      expect(stats.busy).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.totalQueries).toBe(0);
      expect(stats.failedQueries).toBe(0);
      expect(stats.avgQueryTime).toBe(0);
    });

    it('should track query counts after executing queries', async () => {
      pool = createPool();
      await pool.initialize();

      await pool.query('SELECT 1');
      await pool.query('SELECT 2');

      const stats = pool.getStats();
      expect(stats.totalQueries).toBe(2);
    });
  });

  describe('query execution', () => {
    it('should execute a query through a pooled connection', async () => {
      pool = createPool();
      await pool.initialize();

      const result = await pool.query('SELECT * FROM users');
      expect(result).toBeDefined();
      expect(result.rows).toEqual([]);

      // The driver should have been called
      expect(drivers.some((d) => d.query.mock.calls.length > 0)).toBe(true);
    });

    it('should pass params to the driver', async () => {
      pool = createPool();
      await pool.initialize();

      await pool.query('SELECT * FROM users WHERE id = ?', [42]);

      const calledDriver = drivers.find((d) => d.query.mock.calls.length > 0)!;
      expect(calledDriver.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [42]
      );
    });

    it('should execute and return rows', async () => {
      pool = createPool();
      await pool.initialize();

      const mockRows = [{ id: 1, name: 'Alice' }];
      drivers.forEach((d) => {
        d.query.mockResolvedValue({ rows: mockRows, rowCount: 1, fields: [] });
      });

      const rows = await pool.execute('SELECT * FROM users');
      expect(rows).toEqual(mockRows);
    });
  });

  describe('shutdown', () => {
    it('should close all connections on shutdown', async () => {
      pool = createPool();
      await pool.initialize();

      await pool.shutdown();

      const stats = pool.getStats();
      expect(stats.total).toBe(0);
      expect(stats.idle).toBe(0);

      // Each driver's close should have been called
      for (const driver of drivers) {
        expect(driver.close).toHaveBeenCalled();
      }
    });

    it('should reject acquire after shutdown', async () => {
      pool = createPool();
      await pool.initialize();
      await pool.shutdown();

      await expect(pool.acquire()).rejects.toThrow('Pool is shutting down');
    });
  });

  describe('error handling', () => {
    it('should retry failed queries', async () => {
      vi.useRealTimers();
      let queryCallCount = 0;
      const retryFactory = async () => {
        const driver = {
          query: vi.fn().mockImplementation(async () => {
            queryCallCount++;
            if (queryCallCount === 1) {
              throw new Error('connection lost');
            }
            return { rows: [{ ok: true }], rowCount: 1, fields: [] };
          }),
          close: vi.fn().mockResolvedValue(undefined),
        };
        drivers.push(driver);
        return driver as any;
      };

      pool = new ConnectionPool(
        createMockConfig() as any,
        retryFactory,
        { min: 1, max: 3, healthCheck: false, retryDelay: 1, maxRetries: 3 }
      );
      await pool.initialize();

      const result = await pool.query('SELECT 1');
      expect(result.rows).toEqual([{ ok: true }]);
      await pool.shutdown();
      vi.useFakeTimers();
    });

    it('should track failed queries in stats', async () => {
      vi.useRealTimers();
      pool = createPool({ min: 1, max: 2, maxRetries: 1, retryDelay: 1 });
      await pool.initialize();

      drivers.forEach((d) => {
        d.query.mockRejectedValue(new Error('permanent failure'));
      });

      await pool.query('SELECT 1').catch(() => {});

      const stats = pool.getStats();
      expect(stats.failedQueries).toBeGreaterThanOrEqual(1);
      await pool.shutdown();
      vi.useFakeTimers();
    });
  });
});
