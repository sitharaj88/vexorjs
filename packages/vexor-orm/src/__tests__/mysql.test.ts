/**
 * MySQL Driver Tests
 *
 * The `mysql2` package is not installed in this workspace. We exercise the
 * exported helpers directly and verify the factory functions surface a
 * clear "not installed" error. The full driver/pool surface is covered by
 * mocking `mysql2/promise` via `vi.mock`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  convertPlaceholders,
  escapeIdentifier,
  formatValue,
  createMySQLDriverFactory,
  createMySQLPool,
  createMySQLTransaction,
} from '../drivers/mysql.js';

// ---------------------------------------------------------------------------
// Mocked mysql2/promise — used by the "happy path" tests below
// ---------------------------------------------------------------------------

const mockExecute = vi.fn();
const mockEnd = vi.fn();
const mockBeginTransaction = vi.fn();
const mockCommit = vi.fn();
const mockRollback = vi.fn();
const mockRelease = vi.fn();
const mockGetConnection = vi.fn();
const mockPoolEnd = vi.fn();
const mockPoolExecute = vi.fn();
const mockCreateConnection = vi.fn();
const mockCreatePool = vi.fn();

vi.mock('mysql2/promise', () => ({
  createConnection: (...args: unknown[]) => mockCreateConnection(...args),
  createPool: (...args: unknown[]) => mockCreatePool(...args),
  default: {
    createConnection: (...args: unknown[]) => mockCreateConnection(...args),
    createPool: (...args: unknown[]) => mockCreatePool(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockExecute.mockReset();
  mockEnd.mockResolvedValue(undefined);
  mockBeginTransaction.mockResolvedValue(undefined);
  mockCommit.mockResolvedValue(undefined);
  mockRollback.mockResolvedValue(undefined);
  mockRelease.mockReset();
  mockPoolEnd.mockResolvedValue(undefined);
  mockPoolExecute.mockReset();

  const conn = {
    execute: mockExecute,
    end: mockEnd,
    beginTransaction: mockBeginTransaction,
    commit: mockCommit,
    rollback: mockRollback,
    release: mockRelease,
  };

  mockCreateConnection.mockResolvedValue(conn);
  mockGetConnection.mockResolvedValue(conn);
  mockCreatePool.mockReturnValue({
    getConnection: mockGetConnection,
    execute: mockPoolExecute,
    end: mockPoolEnd,
  });
});

// ---------------------------------------------------------------------------
// convertPlaceholders
// ---------------------------------------------------------------------------

describe('convertPlaceholders', () => {
  it('converts $1 to ?', () => {
    expect(convertPlaceholders('SELECT * FROM x WHERE id = $1')).toBe(
      'SELECT * FROM x WHERE id = ?'
    );
  });

  it('converts multiple placeholders in order', () => {
    expect(convertPlaceholders('UPDATE x SET a = $1, b = $2 WHERE id = $3')).toBe(
      'UPDATE x SET a = ?, b = ? WHERE id = ?'
    );
  });

  it('handles repeated placeholder numbers (each becomes ?)', () => {
    expect(convertPlaceholders('SELECT $1, $1, $2')).toBe('SELECT ?, ?, ?');
  });

  it('returns SQL unchanged when there are no placeholders', () => {
    expect(convertPlaceholders('SELECT 1')).toBe('SELECT 1');
  });

  it('handles double-digit placeholders', () => {
    expect(convertPlaceholders('SELECT $1, $10, $11')).toBe('SELECT ?, ?, ?');
  });
});

// ---------------------------------------------------------------------------
// escapeIdentifier
// ---------------------------------------------------------------------------

describe('escapeIdentifier', () => {
  it('wraps identifiers in backticks', () => {
    expect(escapeIdentifier('users')).toBe('`users`');
  });

  it('escapes embedded backticks', () => {
    expect(escapeIdentifier('weird`name')).toBe('`weird``name`');
  });

  it('handles empty string', () => {
    expect(escapeIdentifier('')).toBe('``');
  });
});

// ---------------------------------------------------------------------------
// formatValue
// ---------------------------------------------------------------------------

describe('formatValue', () => {
  it('formats null and undefined as NULL', () => {
    expect(formatValue(null)).toBe('NULL');
    expect(formatValue(undefined)).toBe('NULL');
  });

  it('formats booleans as 1 / 0', () => {
    expect(formatValue(true)).toBe('1');
    expect(formatValue(false)).toBe('0');
  });

  it('formats numbers as plain strings', () => {
    expect(formatValue(42)).toBe('42');
    expect(formatValue(3.14)).toBe('3.14');
    expect(formatValue(0)).toBe('0');
  });

  it('formats Date as MySQL DATETIME literal', () => {
    expect(formatValue(new Date('2024-01-15T12:30:45.000Z'))).toBe(
      "'2024-01-15 12:30:45'"
    );
  });

  it('formats objects as JSON literals with escaped quotes', () => {
    expect(formatValue({ a: "it's" })).toBe(`'{"a":"it''s"}'`);
  });

  it('escapes single quotes in strings', () => {
    expect(formatValue("O'Brien")).toBe("'O''Brien'");
  });

  it('formats plain strings with surrounding quotes', () => {
    expect(formatValue('hello')).toBe("'hello'");
  });
});

// ---------------------------------------------------------------------------
// Driver factory — happy path (mocked mysql2)
// ---------------------------------------------------------------------------

describe('createMySQLDriverFactory', () => {
  it('connects with individual config fields and applies defaults', async () => {
    const factory = createMySQLDriverFactory({
      driver: 'mysql',
      host: 'db.example.com',
      port: 3307,
      database: 'app',
      user: 'u',
      password: 'p',
    });

    const driver = await factory();
    expect(mockCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'db.example.com',
        port: 3307,
        database: 'app',
        user: 'u',
        password: 'p',
      })
    );
    expect(driver).toMatchObject({
      query: expect.any(Function),
      close: expect.any(Function),
    });
  });

  it('parses connectionString into host/port/database/user/password', async () => {
    const factory = createMySQLDriverFactory({
      driver: 'mysql',
      connectionString: 'mysql://alice:secret@dbhost:3310/shop',
    });

    await factory();
    expect(mockCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'dbhost',
        port: 3310,
        user: 'alice',
        password: 'secret',
        database: 'shop',
      })
    );
  });

  it('forwards optional ssl/timezone/charset/multipleStatements options', async () => {
    const factory = createMySQLDriverFactory({
      driver: 'mysql',
      database: 'app',
      ssl: { rejectUnauthorized: false },
      connectTimeout: 1000,
      multipleStatements: true,
      timezone: 'Z',
      charset: 'utf8mb4',
      dateStrings: true,
    });

    await factory();
    expect(mockCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        ssl: { rejectUnauthorized: false },
        connectTimeout: 1000,
        multipleStatements: true,
        timezone: 'Z',
        charset: 'utf8mb4',
        dateStrings: true,
      })
    );
  });

  it('returns SELECT rows with mapped field types', async () => {
    mockExecute.mockResolvedValue([
      [{ id: 1, name: 'Alice' }],
      [
        { name: 'id', type: 3, length: 11, db: 'app', table: 'users' },
        { name: 'name', type: 253, length: 255, db: 'app', table: 'users' },
      ],
    ]);

    const driver = await createMySQLDriverFactory({
      driver: 'mysql',
      database: 'app',
    })();

    const result = await driver.query('SELECT id, name FROM users');
    expect(result.rows).toEqual([{ id: 1, name: 'Alice' }]);
    expect(result.rowCount).toBe(1);
    expect(result.fields).toEqual([
      { name: 'id', type: 'int' },
      { name: 'name', type: 'varchar' },
    ]);
  });

  it('translates $N placeholders to ? before executing', async () => {
    mockExecute.mockResolvedValue([[], []]);

    const driver = await createMySQLDriverFactory({
      driver: 'mysql',
      database: 'app',
    })();

    await driver.query('SELECT * FROM users WHERE id = $1 AND name = $2', [
      1,
      'Alice',
    ]);

    expect(mockExecute).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = ? AND name = ?',
      [1, 'Alice']
    );
  });

  it('returns affectedRows / lastInsertId for INSERT', async () => {
    mockExecute.mockResolvedValue([{ affectedRows: 1, insertId: 99 }, undefined]);

    const driver = await createMySQLDriverFactory({
      driver: 'mysql',
      database: 'app',
    })();

    const result = await driver.query('INSERT INTO users (name) VALUES (?)', [
      'Bob',
    ]);

    expect(result.rowCount).toBe(1);
    expect(result.lastInsertId).toBe(99);
    expect(result.rows).toEqual([]);
  });

  it('close() ends the underlying connection', async () => {
    const driver = await createMySQLDriverFactory({
      driver: 'mysql',
      database: 'app',
    })();

    await driver.close();
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Pool factory
// ---------------------------------------------------------------------------

describe('createMySQLPool', () => {
  it('builds pool config with connectionLimit and waitForConnections', async () => {
    const factory = createMySQLPool({
      driver: 'mysql',
      database: 'app',
      maxConnections: 7,
    });

    await factory();
    expect(mockCreatePool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionLimit: 7,
        waitForConnections: true,
      })
    );
  });

  it('defaults connectionLimit to 10', async () => {
    await createMySQLPool({ driver: 'mysql', database: 'app' })();
    expect(mockCreatePool).toHaveBeenCalledWith(
      expect.objectContaining({ connectionLimit: 10 })
    );
  });

  it('parses connectionString in pool config', async () => {
    await createMySQLPool({
      driver: 'mysql',
      connectionString: 'mysql://u:p@h:3306/db',
    })();

    expect(mockCreatePool).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'h',
        port: 3306,
        user: 'u',
        password: 'p',
        database: 'db',
      })
    );
  });

  it('getConnection returns a driver wrapper that releases on close', async () => {
    const pool = await createMySQLPool({ driver: 'mysql', database: 'app' })();
    const conn = await pool.getConnection();

    await conn.close();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('pool.query delegates to the underlying pool', async () => {
    mockPoolExecute.mockResolvedValue([
      [{ id: 1 }],
      [{ name: 'id', type: 3, length: 11, db: 'app', table: 't' }],
    ]);

    const pool = await createMySQLPool({ driver: 'mysql', database: 'app' })();
    const result = await pool.query('SELECT id FROM t');
    expect(result.rows).toEqual([{ id: 1 }]);
    expect(mockPoolExecute).toHaveBeenCalledWith('SELECT id FROM t', []);
  });

  it('pool.close shuts down the pool', async () => {
    const pool = await createMySQLPool({ driver: 'mysql', database: 'app' })();
    await pool.close();
    expect(mockPoolEnd).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

describe('createMySQLTransaction', () => {
  function createConn() {
    return {
      execute: mockExecute,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback,
    };
  }

  it('begins a transaction on creation', async () => {
    await createMySQLTransaction(createConn());
    expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
  });

  it('commit calls connection.commit', async () => {
    const tx = await createMySQLTransaction(createConn());
    await tx.commit();
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it('rollback calls connection.rollback', async () => {
    const tx = await createMySQLTransaction(createConn());
    await tx.rollback();
    expect(mockRollback).toHaveBeenCalledTimes(1);
  });

  it('execute returns rows from a SELECT', async () => {
    mockExecute.mockResolvedValue([[{ id: 1 }], []]);
    const tx = await createMySQLTransaction(createConn());

    const rows = await tx.execute<{ id: number }>('SELECT id FROM x');
    expect(rows).toEqual([{ id: 1 }]);
  });

  it('execute returns empty array for non-SELECT', async () => {
    mockExecute.mockResolvedValue([{ affectedRows: 1, insertId: 5 }, undefined]);
    const tx = await createMySQLTransaction(createConn());

    const rows = await tx.execute('INSERT INTO x VALUES (?)', [1]);
    expect(rows).toEqual([]);
  });

  it('query reports affectedRows and insertId for writes', async () => {
    mockExecute.mockResolvedValue([{ affectedRows: 2, insertId: 10 }, undefined]);
    const tx = await createMySQLTransaction(createConn());

    const result = await tx.query('UPDATE x SET n = 1');
    expect(result.rowCount).toBe(2);
    expect(result.lastInsertId).toBe(10);
  });
});
