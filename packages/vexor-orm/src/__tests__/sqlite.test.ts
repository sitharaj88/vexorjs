/**
 * SQLite Driver Tests
 *
 * Uses real better-sqlite3 with in-memory databases for genuine
 * driver-level coverage (DDL, DML, params, type parsing, pragmas).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SQLiteDriver,
  createSQLiteDriver,
  createSQLiteDriverFactory,
  createMemoryDatabase,
  convertPostgresPlaceholders,
  type SQLiteConfig,
} from '../drivers/sqlite.js';

// Access internals for unit tests of pure helpers
type AnyDriver = SQLiteDriver & {
  normalizeParam(p: unknown): unknown;
  parseValue(v: unknown): unknown;
  parseRow<T>(row: Record<string, unknown>): T;
  statementCache: Map<string, unknown>;
};

const memConfig: SQLiteConfig = {
  driver: 'sqlite',
  filename: ':memory:',
};

describe('SQLiteDriver', () => {
  let driver: SQLiteDriver;

  afterEach(async () => {
    if (driver) {
      await driver.close();
    }
  });

  describe('connection lifecycle', () => {
    it('connects to an in-memory database', async () => {
      driver = new SQLiteDriver(memConfig);
      await driver.connect();

      const result = await driver.query('SELECT 1 as one');
      expect(result.rows).toEqual([{ one: 1 }]);
    });

    it('createMemoryDatabase returns a connected driver', async () => {
      driver = await createMemoryDatabase();
      const result = await driver.query('SELECT 42 as answer');
      expect(result.rows[0]).toEqual({ answer: 42 });
    });

    it('throws when querying a closed connection', async () => {
      driver = new SQLiteDriver(memConfig);
      await expect(driver.query('SELECT 1')).rejects.toThrow('Not connected');
    });

    it('close is idempotent', async () => {
      driver = await createMemoryDatabase();
      await driver.close();
      await expect(driver.close()).resolves.toBeUndefined();
    });
  });

  describe('DDL & DML', () => {
    beforeEach(async () => {
      driver = await createMemoryDatabase();
    });

    it('executes CREATE TABLE without returning rows', async () => {
      const result = await driver.query(
        'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER)'
      );
      expect(result.rows).toEqual([]);
      expect(result.fields).toEqual([]);
    });

    it('inserts and reports rowCount + lastInsertId', async () => {
      await driver.query('CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)');
      const result = await driver.query(
        'INSERT INTO items (label) VALUES (?)',
        ['first']
      );

      expect(result.rowCount).toBe(1);
      expect(result.lastInsertId).toBe(1);
    });

    it('selects rows with field metadata', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY, name TEXT)');
      await driver.query('INSERT INTO x (name) VALUES (?), (?)', ['a', 'b']);

      const result = await driver.query<{ id: number; name: string }>(
        'SELECT id, name FROM x ORDER BY id'
      );

      expect(result.rowCount).toBe(2);
      expect(result.rows).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]);
      expect(result.fields?.map((f) => f.name)).toEqual(['id', 'name']);
    });

    it('updates rows and reports changes', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY, n INTEGER)');
      await driver.query('INSERT INTO x (n) VALUES (1), (2), (3)');

      const result = await driver.query('UPDATE x SET n = n + 10 WHERE n > ?', [1]);
      expect(result.rowCount).toBe(2);
    });

    it('deletes rows and reports changes', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY)');
      await driver.query('INSERT INTO x (id) VALUES (1), (2), (3)');

      const result = await driver.query('DELETE FROM x WHERE id < ?', [3]);
      expect(result.rowCount).toBe(2);
    });

    it('handles INSERT...RETURNING as a SELECT-style result', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY, name TEXT)');
      const result = await driver.query<{ id: number; name: string }>(
        'INSERT INTO x (name) VALUES (?) RETURNING id, name',
        ['alpha']
      );

      expect(result.rows).toEqual([{ id: 1, name: 'alpha' }]);
    });
  });

  describe('parameter normalization', () => {
    beforeEach(async () => {
      driver = await createMemoryDatabase();
    });

    it('binds booleans as 1/0', async () => {
      await driver.query('CREATE TABLE x (flag INTEGER)');
      await driver.query('INSERT INTO x (flag) VALUES (?)', [true]);
      await driver.query('INSERT INTO x (flag) VALUES (?)', [false]);

      const r = await driver.query<{ flag: number }>('SELECT flag FROM x ORDER BY rowid');
      expect(r.rows.map((row) => row.flag)).toEqual([1, 0]);
    });

    it('binds undefined as NULL', async () => {
      await driver.query('CREATE TABLE x (val TEXT)');
      await driver.query('INSERT INTO x (val) VALUES (?)', [undefined]);

      const r = await driver.query<{ val: string | null }>('SELECT val FROM x');
      expect(r.rows[0].val).toBeNull();
    });

    it('binds Date as ISO string', async () => {
      await driver.query('CREATE TABLE x (ts TEXT)');
      const d = new Date('2024-01-15T12:00:00.000Z');
      await driver.query('INSERT INTO x (ts) VALUES (?)', [d]);

      const r = await driver.query<{ ts: unknown }>('SELECT ts FROM x');
      // The driver re-parses ISO strings back to Date on read
      expect(r.rows[0].ts).toBeInstanceOf(Date);
      expect((r.rows[0].ts as Date).toISOString()).toBe('2024-01-15T12:00:00.000Z');
    });

    it('binds objects as JSON strings', async () => {
      await driver.query('CREATE TABLE x (data TEXT)');
      await driver.query('INSERT INTO x (data) VALUES (?)', [{ a: 1, b: 'x' }]);

      const r = await driver.query<{ data: unknown }>('SELECT data FROM x');
      // String storage is reparsed as JSON object on read
      expect(r.rows[0].data).toEqual({ a: 1, b: 'x' });
    });
  });

  describe('value parsing', () => {
    let d: AnyDriver;

    beforeEach(() => {
      d = new SQLiteDriver(memConfig) as AnyDriver;
    });

    it('parses object-shaped JSON strings', () => {
      expect(d.parseValue('{"a":1}')).toEqual({ a: 1 });
    });

    it('parses array-shaped JSON strings', () => {
      expect(d.parseValue('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('returns raw string when JSON is malformed', () => {
      expect(d.parseValue('{not-json')).toBe('{not-json');
    });

    it('parses ISO date strings to Date', () => {
      const result = d.parseValue('2024-01-15T12:00:00.000Z');
      expect(result).toBeInstanceOf(Date);
    });

    it('leaves non-date strings alone', () => {
      expect(d.parseValue('hello world')).toBe('hello world');
    });

    it('returns null for null/undefined', () => {
      expect(d.parseValue(null)).toBeNull();
      expect(d.parseValue(undefined)).toBeNull();
    });

    it('preserves numbers', () => {
      expect(d.parseValue(42)).toBe(42);
      expect(d.parseValue(0)).toBe(0);
      expect(d.parseValue(1)).toBe(1);
    });
  });

  describe('normalizeParam (unit)', () => {
    let d: AnyDriver;

    beforeEach(() => {
      d = new SQLiteDriver(memConfig) as AnyDriver;
    });

    it('undefined → null', () => {
      expect(d.normalizeParam(undefined)).toBeNull();
    });

    it('boolean → 1/0', () => {
      expect(d.normalizeParam(true)).toBe(1);
      expect(d.normalizeParam(false)).toBe(0);
    });

    it('Date → ISO string', () => {
      const dt = new Date('2024-01-15T12:00:00Z');
      expect(d.normalizeParam(dt)).toBe('2024-01-15T12:00:00.000Z');
    });

    it('plain object → JSON string', () => {
      expect(d.normalizeParam({ a: 1 })).toBe('{"a":1}');
    });

    it('arrays pass through', () => {
      const arr = [1, 2];
      expect(d.normalizeParam(arr)).toBe(arr);
    });

    it('primitives pass through', () => {
      expect(d.normalizeParam('hi')).toBe('hi');
      expect(d.normalizeParam(7)).toBe(7);
    });
  });

  describe('PRAGMA handling', () => {
    it('treats PRAGMA setters as non-select (no rows)', async () => {
      driver = await createMemoryDatabase();
      const result = await driver.query('PRAGMA cache_size = 100');
      expect(result.rows).toEqual([]);
    });

    it('treats PRAGMA queries as select', async () => {
      driver = await createMemoryDatabase();
      const result = await driver.query<{ journal_mode: string }>(
        'PRAGMA journal_mode'
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('applies configured pragmas on connect', async () => {
      driver = new SQLiteDriver({
        ...memConfig,
        foreignKeys: true,
        synchronous: 'NORMAL',
      });
      await driver.connect();

      const fk = await driver.query<{ foreign_keys: number }>('PRAGMA foreign_keys');
      expect(fk.rows[0].foreign_keys).toBe(1);
    });
  });

  describe('statement caching', () => {
    it('reuses prepared statements for identical SQL', async () => {
      driver = await createMemoryDatabase();
      const ad = driver as AnyDriver;

      await driver.query('CREATE TABLE x (id INTEGER)');
      await driver.query('INSERT INTO x (id) VALUES (?)', [1]);
      await driver.query('INSERT INTO x (id) VALUES (?)', [2]);

      // Same insert SQL reused — should occupy 1 cache slot
      const insertHits = Array.from(ad.statementCache.keys()).filter((k) =>
        k.startsWith('INSERT')
      );
      expect(insertHits).toHaveLength(1);
    });

    it('clears the cache on close', async () => {
      driver = await createMemoryDatabase();
      const ad = driver as AnyDriver;

      await driver.query('SELECT 1');
      expect(ad.statementCache.size).toBeGreaterThan(0);

      await driver.close();
      expect(ad.statementCache.size).toBe(0);
    });
  });

  describe('helpers', () => {
    beforeEach(async () => {
      driver = await createMemoryDatabase();
    });

    it('getLastInsertId returns the most recent rowid', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY, n INTEGER)');
      await driver.query('INSERT INTO x (n) VALUES (?)', [10]);
      await driver.query('INSERT INTO x (n) VALUES (?)', [20]);

      const id = await driver.getLastInsertId();
      expect(id).toBe(2);
    });

    it('getChanges returns the change count from the last write', async () => {
      await driver.query('CREATE TABLE x (id INTEGER PRIMARY KEY)');
      await driver.query('INSERT INTO x (id) VALUES (1), (2), (3)');
      await driver.query('DELETE FROM x WHERE id < 3');

      const changes = await driver.getChanges();
      expect(changes).toBe(2);
    });
  });

  describe('placeholder translation', () => {
    it('convertPostgresPlaceholders rewrites $N to ?', () => {
      expect(convertPostgresPlaceholders('SELECT * FROM x WHERE id = $1')).toBe(
        'SELECT * FROM x WHERE id = ?'
      );
      expect(
        convertPostgresPlaceholders(
          'UPDATE x SET a = $1, b = $2 WHERE id = $3'
        )
      ).toBe('UPDATE x SET a = ?, b = ? WHERE id = ?');
    });

    it('leaves SQL without placeholders untouched', () => {
      expect(convertPostgresPlaceholders('SELECT 1')).toBe('SELECT 1');
    });

    it('leaves existing ? placeholders alone', () => {
      expect(convertPostgresPlaceholders('SELECT * FROM x WHERE id = ?')).toBe(
        'SELECT * FROM x WHERE id = ?'
      );
    });

    it('handles multi-digit placeholders', () => {
      expect(convertPostgresPlaceholders('VALUES ($1, $10, $11)')).toBe(
        'VALUES (?, ?, ?)'
      );
    });

    it('drives query() end-to-end with $N placeholders', async () => {
      driver = await createMemoryDatabase();
      await driver.query(
        'CREATE TABLE x (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER)'
      );
      await driver.query(
        'INSERT INTO x (name, qty) VALUES ($1, $2)',
        ['apple', 3]
      );

      const r = await driver.query<{ name: string; qty: number }>(
        'SELECT name, qty FROM x WHERE name = $1',
        ['apple']
      );
      expect(r.rows[0]).toEqual({ name: 'apple', qty: 3 });
    });
  });

  describe('factories', () => {
    it('createSQLiteDriver returns a SQLiteDriver instance', () => {
      const d = createSQLiteDriver(memConfig);
      expect(d).toBeInstanceOf(SQLiteDriver);
    });

    it('createSQLiteDriverFactory yields a connected driver', async () => {
      const factory = createSQLiteDriverFactory(memConfig);
      driver = await factory();
      expect(driver).toBeInstanceOf(SQLiteDriver);

      const r = await driver.query('SELECT 1 as x');
      expect(r.rows).toEqual([{ x: 1 }]);
    });
  });
});
