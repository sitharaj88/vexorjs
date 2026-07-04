/**
 * Transaction Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionImpl, TransactionManager, createTransactionManager } from '../connection/transaction.js';
import type { PoolConnection } from '../connection/pool.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function createMockDriver() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, fields: [] }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockConnection(driver = createMockDriver()): PoolConnection {
  return {
    id: 'conn-1',
    driver: driver as any,
    state: 'busy' as const,
    createdAt: new Date(),
    lastUsedAt: new Date(),
    queryCount: 0,
  };
}

function createMockPool(connection?: PoolConnection) {
  const conn = connection ?? createMockConnection();
  return {
    acquire: vi.fn().mockResolvedValue(conn),
    release: vi.fn(),
    _connection: conn,
  };
}

// ---------------------------------------------------------------------------
// TransactionImpl
// ---------------------------------------------------------------------------

describe('TransactionImpl', () => {
  let mockDriver: ReturnType<typeof createMockDriver>;
  let mockConnection: PoolConnection;
  let mockPool: ReturnType<typeof createMockPool>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDriver = createMockDriver();
    mockConnection = createMockConnection(mockDriver);
    mockPool = createMockPool(mockConnection);
  });

  // ---- State tracking ----

  describe('state tracking', () => {
    it('should start in active state', () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);

      expect(tx.isActive()).toBe(true);
      expect(tx.getState()).toBe('active');
    });

    it('should transition to committed state after commit', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.commit();

      expect(tx.isActive()).toBe(false);
      expect(tx.getState()).toBe('committed');
    });

    it('should transition to rolled_back state after rollback', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.rollback();

      expect(tx.isActive()).toBe(false);
      expect(tx.getState()).toBe('rolled_back');
    });

    it('should transition to error state when query fails', async () => {
      mockDriver.query.mockRejectedValueOnce(new Error('query failed'));
      const tx = new TransactionImpl(mockConnection, mockPool as any);

      await expect(tx.query('BAD SQL')).rejects.toThrow('query failed');
      expect(tx.getState()).toBe('error');
    });
  });

  // ---- BEGIN / COMMIT lifecycle ----

  describe('commit lifecycle', () => {
    it('should send COMMIT and release connection', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.commit();

      expect(mockDriver.query).toHaveBeenCalledWith('COMMIT');
      expect(mockPool.release).toHaveBeenCalledWith(mockConnection);
    });

    it('should reject operations after commit', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.commit();

      await expect(tx.query('SELECT 1')).rejects.toThrow('Transaction is committed');
      await expect(tx.commit()).rejects.toThrow('Transaction is committed');
    });
  });

  // ---- BEGIN / ROLLBACK on error ----

  describe('rollback lifecycle', () => {
    it('should send ROLLBACK and release connection', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.rollback();

      expect(mockDriver.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockPool.release).toHaveBeenCalledWith(mockConnection);
    });

    it('should be idempotent when already rolled back', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.rollback();

      // second rollback should not throw and not call ROLLBACK again
      await tx.rollback();
      expect(mockDriver.query).toHaveBeenCalledTimes(1);
    });

    it('should allow rollback from error state', async () => {
      mockDriver.query.mockRejectedValueOnce(new Error('oops'));
      const tx = new TransactionImpl(mockConnection, mockPool as any);

      await tx.query('BAD').catch(() => {});
      expect(tx.getState()).toBe('error');

      await tx.rollback();
      expect(tx.getState()).toBe('rolled_back');
      expect(mockDriver.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  // ---- Query execution ----

  describe('query execution', () => {
    it('should delegate query to the connection driver', async () => {
      const mockRows = [{ id: 1 }];
      mockDriver.query.mockResolvedValueOnce({ rows: mockRows, rowCount: 1, fields: [] });

      const tx = new TransactionImpl(mockConnection, mockPool as any);
      const result = await tx.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(result.rows).toEqual(mockRows);
      expect(mockDriver.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should return rows via execute()', async () => {
      const mockRows = [{ id: 1, name: 'Alice' }];
      mockDriver.query.mockResolvedValueOnce({ rows: mockRows, rowCount: 1, fields: [] });

      const tx = new TransactionImpl(mockConnection, mockPool as any);
      const rows = await tx.execute('SELECT * FROM users');

      expect(rows).toEqual(mockRows);
    });

    it('should throw when querying a non-active transaction', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.commit();

      await expect(tx.query('SELECT 1')).rejects.toThrow('Transaction is committed');
    });
  });

  // ---- Savepoints (nested transactions) ----

  describe('savepoints', () => {
    it('should create a named savepoint', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      const name = await tx.savepoint('my_sp');

      expect(name).toBe('my_sp');
      expect(mockDriver.query).toHaveBeenCalledWith('SAVEPOINT my_sp');
    });

    it('should auto-generate savepoint names', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      const sp1 = await tx.savepoint();
      const sp2 = await tx.savepoint();

      expect(sp1).toBe('sp_1');
      expect(sp2).toBe('sp_2');
    });

    it('should rollback to a savepoint', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.savepoint('sp_a');
      await tx.savepoint('sp_b');

      await tx.rollbackTo('sp_b');

      expect(mockDriver.query).toHaveBeenCalledWith('ROLLBACK TO SAVEPOINT sp_b');
    });

    it('should remove later savepoints on rollback', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.savepoint('sp_a');
      await tx.savepoint('sp_b');
      await tx.savepoint('sp_c');

      // rolling back to sp_a should discard sp_b and sp_c (slice to index 0)
      await tx.rollbackTo('sp_a');

      // sp_b should no longer exist
      await expect(tx.rollbackTo('sp_b')).rejects.toThrow('Savepoint "sp_b" not found');
    });

    it('should throw when rolling back to unknown savepoint', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await expect(tx.rollbackTo('no_such_sp')).rejects.toThrow('Savepoint "no_such_sp" not found');
    });

    it('should release a savepoint', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await tx.savepoint('sp_release');

      await tx.releaseSavepoint('sp_release');

      expect(mockDriver.query).toHaveBeenCalledWith('RELEASE SAVEPOINT sp_release');
    });

    it('should throw when releasing unknown savepoint', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any);
      await expect(tx.releaseSavepoint('nope')).rejects.toThrow('Savepoint "nope" not found');
    });
  });

  // ---- Timeout ----

  describe('timeout', () => {
    it('should clear timeout on commit', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any, { timeout: 5000 });
      await tx.commit();

      // Advancing timers should not cause issues
      vi.advanceTimersByTime(10000);
      expect(tx.getState()).toBe('committed');
    });

    it('should clear timeout on rollback', async () => {
      const tx = new TransactionImpl(mockConnection, mockPool as any, { timeout: 5000 });
      await tx.rollback();

      vi.advanceTimersByTime(10000);
      expect(tx.getState()).toBe('rolled_back');
    });
  });
});

// ---------------------------------------------------------------------------
// TransactionManager
// ---------------------------------------------------------------------------

describe('TransactionManager', () => {
  let mockDriver: ReturnType<typeof createMockDriver>;
  let mockConnection: PoolConnection;
  let mockPool: ReturnType<typeof createMockPool>;
  let manager: TransactionManager;

  beforeEach(() => {
    mockDriver = createMockDriver();
    mockConnection = createMockConnection(mockDriver);
    mockPool = createMockPool(mockConnection);
    manager = new TransactionManager(mockPool as any);
  });

  describe('begin', () => {
    it('should acquire a connection and send BEGIN', async () => {
      const tx = await manager.begin();

      expect(mockPool.acquire).toHaveBeenCalled();
      expect(mockDriver.query).toHaveBeenCalledWith('BEGIN');
      expect(tx.isActive()).toBe(true);
    });

    it('should set isolation level when specified', async () => {
      await manager.begin({ isolationLevel: 'SERIALIZABLE' });

      expect(mockDriver.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE'
      );
      expect(mockDriver.query).toHaveBeenCalledWith('BEGIN');
    });

    it('should set READ COMMITTED isolation level', async () => {
      await manager.begin({ isolationLevel: 'READ COMMITTED' });

      expect(mockDriver.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL READ COMMITTED'
      );
    });

    it('should set REPEATABLE READ isolation level', async () => {
      await manager.begin({ isolationLevel: 'REPEATABLE READ' });

      expect(mockDriver.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ'
      );
    });

    it('should set READ UNCOMMITTED isolation level', async () => {
      await manager.begin({ isolationLevel: 'READ UNCOMMITTED' });

      expect(mockDriver.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED'
      );
    });

    it('should set read-only mode when specified', async () => {
      await manager.begin({ readOnly: true });

      expect(mockDriver.query).toHaveBeenCalledWith('SET TRANSACTION READ ONLY');
    });

    it('should release connection if BEGIN fails', async () => {
      mockDriver.query.mockRejectedValueOnce(new Error('BEGIN failed'));

      await expect(manager.begin()).rejects.toThrow('BEGIN failed');
      expect(mockPool.release).toHaveBeenCalledWith(mockConnection);
    });
  });

  // ---- Callback-based transaction (auto commit/rollback) ----

  describe('transaction (callback)', () => {
    it('should auto-commit on success', async () => {
      const result = await manager.transaction(async (tx) => {
        await tx.query('INSERT INTO users (name) VALUES ($1)', ['Alice']);
        return 'done';
      });

      expect(result).toBe('done');
      expect(mockDriver.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDriver.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should auto-rollback on error', async () => {
      const error = new Error('insert failed');
      mockDriver.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // BEGIN
        .mockRejectedValueOnce(error); // failing query

      await expect(
        manager.transaction(async (tx) => {
          await tx.query('BAD SQL');
        })
      ).rejects.toThrow('insert failed');

      expect(mockDriver.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should pass options to begin', async () => {
      await manager.transaction(
        async () => 'ok',
        { isolationLevel: 'SERIALIZABLE' }
      );

      expect(mockDriver.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE'
      );
    });
  });

  // ---- Transaction with retry ----

  describe('transactionWithRetry', () => {
    it('should retry on deadlock error', async () => {
      vi.useFakeTimers();
      let attempt = 0;

      mockPool.acquire.mockImplementation(async () => {
        const driver = createMockDriver();
        const conn = createMockConnection(driver);

        if (attempt === 0) {
          // First attempt: BEGIN succeeds, then query throws deadlock
          driver.query
            .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // BEGIN
            .mockRejectedValueOnce(new Error('deadlock detected')) // query fails
            .mockResolvedValue({ rows: [], rowCount: 0, fields: [] }); // ROLLBACK
        } else {
          // Second attempt: everything succeeds
          driver.query.mockResolvedValue({ rows: [], rowCount: 0, fields: [] });
        }
        attempt++;

        return conn;
      });

      const promise = manager.transactionWithRetry(
        async (tx) => {
          await tx.query('UPDATE accounts SET balance = balance - 100');
          return 'success';
        },
        { maxRetries: 3, retryDelay: 10 }
      );

      // Fast-forward past any retry delay
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('success');
      expect(attempt).toBeGreaterThanOrEqual(2);

      vi.useRealTimers();
    });

    it('should throw non-retryable errors immediately', async () => {
      mockDriver.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('syntax error')); // non-retryable

      await expect(
        manager.transactionWithRetry(
          async (tx) => {
            await tx.query('INVALID SQL');
          },
          { maxRetries: 3, retryDelay: 10 }
        )
      ).rejects.toThrow('syntax error');
    });
  });
});

// ---------------------------------------------------------------------------
// createTransactionManager factory
// ---------------------------------------------------------------------------

describe('createTransactionManager', () => {
  it('should return a TransactionManager instance', () => {
    const pool = createMockPool();
    const manager = createTransactionManager(pool as any);

    expect(manager).toBeInstanceOf(TransactionManager);
  });
});
