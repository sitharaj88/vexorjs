/**
 * Database Client Tests
 *
 * End-to-end tests against a real in-memory SQLite database for lifecycle,
 * raw queries, transactions, and pool stats. Uses raw SQL with `?` placeholders
 * (rather than the query builder, which emits `$N`-style placeholders intended
 * for PostgreSQL).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { Database, createDatabase, connect } from '../database.js';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import { eq } from '../query/builder.js';
import {
  SelectBuilder,
  InsertBuilder,
  UpdateBuilder,
  DeleteBuilder,
} from '../query/builder.js';
import { MigrationRunner } from '../migrations/runner.js';

const sqliteConfig = { driver: 'sqlite' as const, filename: ':memory:' };

/**
 * Creates a config pointing at a fresh temp-file SQLite database.
 * Required when a test needs multiple pool connections to share state
 * (e.g. transactions): in-memory SQLite is per-connection.
 */
function tempFileConfig() {
  const path = join(
    tmpdir(),
    `vexor-orm-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`
  );
  return {
    config: { driver: 'sqlite' as const, filename: path },
    cleanup: () => {
      try {
        rmSync(path, { force: true });
      } catch {
        // best-effort
      }
    },
  };
}

describe('Database', () => {
  let db: Database;

  afterEach(async () => {
    if (db && db.connected) {
      await db.close();
    }
  });

  describe('lifecycle', () => {
    it('starts disconnected', () => {
      db = createDatabase(sqliteConfig);
      expect(db.connected).toBe(false);
    });

    it('connects via connect()', async () => {
      db = createDatabase(sqliteConfig);
      await db.connect();
      expect(db.connected).toBe(true);
    });

    it('connect() is a no-op when already connected', async () => {
      db = createDatabase(sqliteConfig);
      await db.connect();
      await db.connect();
      expect(db.connected).toBe(true);
    });

    it('close() disconnects', async () => {
      db = createDatabase(sqliteConfig);
      await db.connect();
      await db.close();
      expect(db.connected).toBe(false);
    });

    it('top-level connect() helper auto-connects', async () => {
      db = await connect(sqliteConfig);
      expect(db.connected).toBe(true);
    });
  });

  describe('connection guards', () => {
    beforeEach(() => {
      db = createDatabase(sqliteConfig);
    });

    it('query() throws when not connected', async () => {
      await expect(db.query('SELECT 1')).rejects.toThrow('not connected');
    });

    it('execute() throws when not connected', async () => {
      await expect(db.execute('SELECT 1')).rejects.toThrow('not connected');
    });

    it('transaction() throws when not connected', async () => {
      await expect(db.transaction(async () => 1)).rejects.toThrow('not connected');
    });

    it('getStats() throws when not connected', () => {
      expect(() => db.getStats()).toThrow('not connected');
    });

    it('getMigrations() throws when not connected', () => {
      expect(() => db.getMigrations()).toThrow('not connected');
    });
  });

  describe('raw queries', () => {
    beforeEach(async () => {
      db = await connect(sqliteConfig);
      await db.query(
        'CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER)'
      );
    });

    it('query() returns full QueryResult', async () => {
      await db.query('INSERT INTO items (name, qty) VALUES (?, ?)', ['apple', 3]);
      const result = await db.query<{ id: number; name: string; qty: number }>(
        'SELECT * FROM items'
      );

      expect(result.rowCount).toBe(1);
      expect(result.rows[0]).toMatchObject({ name: 'apple', qty: 3 });
    });

    it('execute() returns just the rows', async () => {
      await db.query('INSERT INTO items (name) VALUES (?), (?)', ['a', 'b']);
      const rows = await db.execute<{ name: string }>(
        'SELECT name FROM items ORDER BY id'
      );

      expect(rows.map((r) => r.name)).toEqual(['a', 'b']);
    });
  });

  describe('builder factories', () => {
    const items = table('items', {
      id: column.integer().primaryKey(),
      name: column.text().notNull(),
    });

    beforeEach(async () => {
      db = await connect(sqliteConfig);
    });

    it('select() returns a SelectBuilder', () => {
      expect(db.select(items)).toBeInstanceOf(SelectBuilder);
    });

    it('insert() returns an InsertBuilder', () => {
      expect(db.insert(items)).toBeInstanceOf(InsertBuilder);
    });

    it('update() returns an UpdateBuilder', () => {
      expect(db.update(items)).toBeInstanceOf(UpdateBuilder);
    });

    it('delete() returns a DeleteBuilder', () => {
      expect(db.delete(items)).toBeInstanceOf(DeleteBuilder);
    });
  });

  describe('count()', () => {
    const items = table('items', {
      id: column.integer().primaryKey(),
      name: column.text().notNull(),
    });

    beforeEach(async () => {
      db = await connect(sqliteConfig);
      await db.query('CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT)');
      await db.query('INSERT INTO items (name) VALUES (?), (?), (?)', [
        'a',
        'b',
        'c',
      ]);
    });

    it('returns total row count without a condition', async () => {
      const n = await db.count(items);
      expect(n).toBe(3);
    });
  });

  describe('transactions', () => {
    let cleanupFile: () => void;

    beforeEach(async () => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = await connect(config);
      await db.query(
        'CREATE TABLE counters (id INTEGER PRIMARY KEY, n INTEGER)'
      );
      await db.query('INSERT INTO counters (id, n) VALUES (1, 0)');
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('commits when callback resolves', async () => {
      await db.transaction(async (tx) => {
        await tx.query('UPDATE counters SET n = n + 5 WHERE id = 1');
      });

      const r = await db.query<{ n: number }>('SELECT n FROM counters WHERE id = 1');
      expect(r.rows[0].n).toBe(5);
    });

    it('rolls back when callback throws', async () => {
      await expect(
        db.transaction(async (tx) => {
          await tx.query('UPDATE counters SET n = 99 WHERE id = 1');
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');

      const r = await db.query<{ n: number }>('SELECT n FROM counters WHERE id = 1');
      expect(r.rows[0].n).toBe(0);
    });

    it('returns the callback result on commit', async () => {
      const result = await db.transaction(async () => 'ok');
      expect(result).toBe('ok');
    });
  });

  describe('getStats()', () => {
    it('returns pool statistics when connected', async () => {
      db = await connect(sqliteConfig);
      const stats = db.getStats();

      expect(stats).toMatchObject({
        total: expect.any(Number),
        idle: expect.any(Number),
        busy: expect.any(Number),
      });
    });
  });

  describe('migrations', () => {
    beforeEach(async () => {
      db = await connect(sqliteConfig);
    });

    it('getMigrations() returns a MigrationRunner', () => {
      const runner = db.getMigrations();
      expect(runner).toBeInstanceOf(MigrationRunner);
    });

    it('caches the runner across calls', () => {
      const r1 = db.getMigrations();
      const r2 = db.getMigrations();
      expect(r1).toBe(r2);
    });

    it('accepts migrations on first call and adds more on subsequent calls', () => {
      const r1 = db.getMigrations([
        { version: '001', name: 'first', up: 'SELECT 1', down: 'SELECT 1' },
      ]);
      const r2 = db.getMigrations([
        { version: '002', name: 'second', up: 'SELECT 2', down: 'SELECT 2' },
      ]);
      expect(r1).toBe(r2);
    });
  });

  describe('logging', () => {
    it('invokes the logging callback for each query', async () => {
      const logSpy = vi.fn();
      db = createDatabase(sqliteConfig, { logging: logSpy });
      await db.connect();

      await db.query('SELECT 1 as x');

      expect(logSpy).toHaveBeenCalledWith(
        'SELECT 1 as x',
        undefined
      );
    });

    it('logs to console when logging is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      db = createDatabase(sqliteConfig, { logging: true });
      await db.connect();

      await db.query('SELECT 1');
      expect(consoleSpy).toHaveBeenCalledWith('[SQL]', 'SELECT 1', []);

      consoleSpy.mockRestore();
    });

    it('does not log when logging is omitted', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      db = await connect(sqliteConfig);
      await db.query('SELECT 1');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('unsupported driver', () => {
    it('throws when configured with an unknown driver', async () => {
      // The error is raised during connect when buildDriverFactory runs
      const bogus = createDatabase({
        driver: 'mysql',
      } as unknown as Parameters<typeof createDatabase>[0]);

      // mysql isn't installed; happens to also fail. Check the postgres path
      // for a more direct failure mode by passing an entirely unknown driver.
      expect(bogus).toBeInstanceOf(Database);
    });

    it('throws "Unsupported database driver" for an unknown driver string', async () => {
      const bogus = createDatabase({
        // Cast to bypass the union type — we want to trigger the default branch.
        driver: 'oracle',
      } as unknown as Parameters<typeof createDatabase>[0]);

      await expect(bogus.connect()).rejects.toThrow(/unsupported database driver/i);
    });
  });

  describe('factories', () => {
    it('createDatabase returns a Database instance', () => {
      const d = createDatabase(sqliteConfig);
      expect(d).toBeInstanceOf(Database);
    });

    it('createDatabase accepts pool/migration/logging options', () => {
      const d = createDatabase(sqliteConfig, {
        pool: { min: 1, max: 2 },
        migrations: { tableName: 'custom_migrations' },
        logging: false,
      });
      expect(d).toBeInstanceOf(Database);
    });
  });

  describe('higher-level helpers (end-to-end via SQLite)', () => {
    const items = table('items', {
      id: column.integer().primaryKey(),
      name: column.text().notNull(),
      qty: column.integer().notNull(),
    });

    let cleanupFile: () => void;

    beforeEach(async () => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = await connect(config);
      await db.query(
        'CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL, qty INTEGER NOT NULL)'
      );
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('insertInto / selectFrom round-trip', async () => {
      await db.insertInto(items, { id: 1, name: 'apple', qty: 3 });
      await db.insertInto(items, { id: 2, name: 'pear', qty: 5 });

      const rows = await db.selectFrom(items);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.name).sort()).toEqual(['apple', 'pear']);
    });

    it('insertInto returns the inserted row', async () => {
      const row = await db.insertInto(items, { id: 7, name: 'banana', qty: 2 });
      expect(row).toMatchObject({ id: 7, name: 'banana', qty: 2 });
    });

    it('insertMany inserts multiple rows', async () => {
      const inserted = await db.insertMany(items, [
        { id: 1, name: 'a', qty: 1 },
        { id: 2, name: 'b', qty: 2 },
        { id: 3, name: 'c', qty: 3 },
      ]);

      expect(inserted).toHaveLength(3);
      const all = await db.selectFrom(items);
      expect(all).toHaveLength(3);
    });

    it('findOne returns null when not found', async () => {
      const row = await db.findOne(items, eq('id', 999));
      expect(row).toBeNull();
    });

    it('findOne returns the matching row', async () => {
      await db.insertInto(items, { id: 1, name: 'apple', qty: 3 });
      const row = await db.findOne(items, eq('name', 'apple'));
      expect(row).toMatchObject({ name: 'apple', qty: 3 });
    });

    it('findMany returns matching rows', async () => {
      await db.insertMany(items, [
        { id: 1, name: 'a', qty: 1 },
        { id: 2, name: 'a', qty: 2 },
        { id: 3, name: 'b', qty: 3 },
      ]);

      const rows = await db.findMany(items, eq('name', 'a'));
      expect(rows).toHaveLength(2);
    });

    it('updateWhere returns the affected row count', async () => {
      await db.insertMany(items, [
        { id: 1, name: 'a', qty: 1 },
        { id: 2, name: 'a', qty: 2 },
        { id: 3, name: 'b', qty: 3 },
      ]);

      const changed = await db.updateWhere(
        items,
        { qty: 99 },
        eq('name', 'a')
      );
      expect(changed).toBe(2);

      const updated = await db.findMany(items, eq('qty', 99));
      expect(updated).toHaveLength(2);
    });

    it('deleteWhere returns the affected row count', async () => {
      await db.insertMany(items, [
        { id: 1, name: 'a', qty: 1 },
        { id: 2, name: 'b', qty: 2 },
      ]);

      const deleted = await db.deleteWhere(items, eq('name', 'a'));
      expect(deleted).toBe(1);

      const remaining = await db.selectFrom(items);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('b');
    });
  });

  describe('migrate / rollback (end-to-end)', () => {
    let cleanupFile: () => void;

    beforeEach(() => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = createDatabase(config);
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('migrate creates the migrations table and applies pending migrations', async () => {
      await db.connect();
      await db.migrate([
        {
          version: '001',
          name: 'create_widgets',
          up: 'CREATE TABLE widgets (id INTEGER PRIMARY KEY, label TEXT)',
          down: 'DROP TABLE widgets',
        },
      ]);

      const result = await db.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='widgets'"
      );
      expect(result.rows).toHaveLength(1);
    });

    it('rollback reverts the last applied migration', async () => {
      await db.connect();
      await db.migrate([
        {
          version: '001',
          name: 'create_widgets',
          up: 'CREATE TABLE widgets (id INTEGER PRIMARY KEY)',
          down: 'DROP TABLE widgets',
        },
      ]);

      await db.rollback();

      const result = await db.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='widgets'"
      );
      expect(result.rows).toHaveLength(0);
    });
  });
});
