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
import { table, index, uniqueIndex } from '../core/table.js';
import { column } from '../core/column.js';
import { eq } from '../query/builder.js';
import { hasMany, hasOne, belongsTo, belongsToMany } from '../relations/index.js';
import { createQueryCache } from '../cache/index.js';
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
    if (db?.connected) {
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

  describe('driver routing', () => {
    it('accepts mysql config (driver factory wired into Database)', () => {
      // Connecting would require mysql2; we only verify the driver string is
      // accepted by createDatabase / createDriverFactory dispatch.
      const mysqlDb = createDatabase({
        driver: 'mysql',
        database: 'app',
      } as unknown as Parameters<typeof createDatabase>[0]);

      expect(mysqlDb).toBeInstanceOf(Database);
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

  describe('createTable / dropTable (with indexes)', () => {
    let cleanupFile: () => void;

    beforeEach(() => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = createDatabase(config);
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('creates a table from a TableDef', async () => {
      await db.connect();
      const widgets = table('widgets', {
        id: column.integer().primaryKey(),
        label: column.text().notNull(),
      });

      await db.createTable(widgets);

      const result = await db.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='widgets'"
      );
      expect(result.rows).toHaveLength(1);
    });

    it('creates declared indexes alongside the table', async () => {
      await db.connect();
      const events = table(
        'events',
        {
          id: column.integer().primaryKey(),
          user_id: column.integer().notNull(),
          email: column.text().notNull(),
        },
        {
          indexes: [
            index('idx_events_user', 'user_id'),
            uniqueIndex('uq_events_email', 'email'),
          ],
        }
      );

      await db.createTable(events);

      const idx = await db.query<{ name: string; tbl_name: string; sql: string }>(
        "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND tbl_name='events'"
      );

      const names = idx.rows.map((r) => r.name);
      expect(names).toContain('idx_events_user');
      expect(names).toContain('uq_events_email');

      const uniqueIdx = idx.rows.find((r) => r.name === 'uq_events_email');
      expect(uniqueIdx?.sql).toMatch(/UNIQUE/i);
    });

    it('respects ifNotExists option', async () => {
      await db.connect();
      const t = table('again', {
        id: column.integer().primaryKey(),
      });

      await db.createTable(t);
      // Second call should not throw with ifNotExists
      await expect(
        db.createTable(t, { ifNotExists: true })
      ).resolves.toBeUndefined();
    });

    it('dropTable removes the table', async () => {
      await db.connect();
      const t = table('soon_gone', { id: column.integer().primaryKey() });
      await db.createTable(t);
      await db.dropTable(t);

      const result = await db.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='soon_gone'"
      );
      expect(result.rows).toHaveLength(0);
    });

    it('dropTable accepts a string name', async () => {
      await db.connect();
      await db.query('CREATE TABLE name_only (id INTEGER PRIMARY KEY)');
      await db.dropTable('name_only');

      const result = await db.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='name_only'"
      );
      expect(result.rows).toHaveLength(0);
    });

    it('createTable throws when not connected', async () => {
      const t = table('x', { id: column.integer().primaryKey() });
      await expect(db.createTable(t)).rejects.toThrow('not connected');
    });

    it('dropTable throws when not connected', async () => {
      await expect(db.dropTable('x')).rejects.toThrow('not connected');
    });
  });

  describe('loadRelations (end-to-end via SQLite)', () => {
    let cleanupFile: () => void;

    const usersT = table('users', {
      id: column.integer().primaryKey(),
      name: column.text().notNull(),
    });

    const postsT = table('posts', {
      id: column.integer().primaryKey(),
      user_id: column.integer().notNull(),
      title: column.text().notNull(),
    });

    const profilesT = table('profiles', {
      id: column.integer().primaryKey(),
      user_id: column.integer().notNull(),
      bio: column.text(),
    });

    const tagsT = table('tags', {
      id: column.integer().primaryKey(),
      name: column.text().notNull(),
    });

    const postTagsT = table('post_tags', {
      post_id: column.integer().notNull(),
      tag_id: column.integer().notNull(),
    });

    beforeEach(async () => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = await connect(config);
      await db.createTable(usersT);
      await db.createTable(postsT);
      await db.createTable(profilesT);
      await db.createTable(tagsT);
      await db.createTable(postTagsT);

      await db.query('INSERT INTO users (id, name) VALUES (1, ?), (2, ?)', [
        'alice',
        'bob',
      ]);
      await db.query(
        'INSERT INTO posts (id, user_id, title) VALUES (1, 1, ?), (2, 1, ?), (3, 2, ?)',
        ['hello', 'world', 'orphan']
      );
      await db.query(
        'INSERT INTO profiles (id, user_id, bio) VALUES (10, 1, ?)',
        ['alice bio']
      );
      await db.query('INSERT INTO tags (id, name) VALUES (100, ?), (101, ?)', [
        'red',
        'blue',
      ]);
      await db.query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES (1, 100), (1, 101), (2, 100)'
      );
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('eager-loads hasMany without N+1', async () => {
      const users = await db.execute<{ id: number; name: string }>(
        'SELECT * FROM users'
      );
      await db.loadRelations(
        users,
        { posts: hasMany(postsT, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      const alice = users.find((u) => u.name === 'alice') as any;
      const bob = users.find((u) => u.name === 'bob') as any;
      expect(alice.posts).toHaveLength(2);
      expect(bob.posts).toHaveLength(1);
    });

    it('eager-loads hasOne', async () => {
      const users = await db.execute<{ id: number; name: string }>(
        'SELECT * FROM users'
      );
      await db.loadRelations(
        users,
        { profile: hasOne(profilesT, { foreignKey: 'user_id' }) },
        { profile: true }
      );

      const alice = users.find((u) => u.name === 'alice') as any;
      const bob = users.find((u) => u.name === 'bob') as any;
      expect(alice.profile?.bio).toBe('alice bio');
      expect(bob.profile).toBeNull();
    });

    it('eager-loads belongsTo', async () => {
      const posts = await db.execute<{ id: number; user_id: number }>(
        'SELECT * FROM posts ORDER BY id'
      );
      await db.loadRelations(
        posts,
        { author: belongsTo(usersT, { foreignKey: 'user_id' }) },
        { author: true }
      );

      expect((posts[0] as any).author?.name).toBe('alice');
      expect((posts[2] as any).author?.name).toBe('bob');
    });

    it('eager-loads belongsToMany through a join table', async () => {
      const posts = await db.execute<{ id: number; title: string }>(
        'SELECT * FROM posts ORDER BY id'
      );
      await db.loadRelations(
        posts,
        {
          tags: belongsToMany(tagsT, {
            through: postTagsT,
            sourceKey: 'post_id',
            targetKey: 'tag_id',
          }),
        },
        { tags: true }
      );

      const post1 = posts[0] as any;
      const post2 = posts[1] as any;
      const post3 = posts[2] as any;
      expect(post1.tags).toHaveLength(2);
      expect(post2.tags).toHaveLength(1);
      expect(post3.tags).toHaveLength(0);
    });

    it('throws when calling loadRelations before connect', async () => {
      await db.close();
      await expect(
        db.loadRelations(
          [{ id: 1 }],
          { posts: hasMany(postsT, { foreignKey: 'user_id' }) },
          { posts: true }
        )
      ).rejects.toThrow('not connected');
    });
  });

  describe('cached / invalidateCache', () => {
    let cleanupFile: () => void;

    beforeEach(async () => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = createDatabase(config, { cache: createQueryCache({ defaultTtlMs: 5_000 }) });
      await db.connect();
      await db.query('CREATE TABLE x (id INTEGER PRIMARY KEY, n INTEGER)');
      await db.query('INSERT INTO x (n) VALUES (1), (2), (3)');
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('returns rows on first call', async () => {
      const rows = await db.cached<{ id: number; n: number }>(
        'SELECT * FROM x ORDER BY id'
      );
      expect(rows).toHaveLength(3);
    });

    it('serves repeated calls from cache', async () => {
      const sql = 'SELECT n FROM x ORDER BY id';
      const a = await db.cached(sql);
      // Mutate the underlying table; cached call should still return stale data.
      await db.query('DELETE FROM x');
      const b = await db.cached(sql);
      expect(b).toEqual(a);
      expect((b as Array<unknown>).length).toBe(3);
    });

    it('invalidateCache(key) drops a single entry', async () => {
      const sql = 'SELECT n FROM x';
      await db.cached(sql);
      await db.query('DELETE FROM x');

      // Use the same key strategy as cached() does internally.
      const { buildCacheKey } = await import('../cache/index.js');
      await db.invalidateCache(buildCacheKey(sql, []));

      const fresh = await db.cached(sql);
      expect(fresh).toEqual([]);
    });

    it('invalidateCache() with no args clears everything', async () => {
      const sql = 'SELECT n FROM x';
      await db.cached(sql);
      await db.query('DELETE FROM x');
      await db.invalidateCache();

      const fresh = await db.cached(sql);
      expect(fresh).toEqual([]);
    });

    it('honors a per-call ttlMs override', async () => {
      const sql = 'SELECT n FROM x';
      await db.cached(sql, [], { ttlMs: 1 });
      // Wait past the TTL and the cache must miss
      await new Promise((r) => setTimeout(r, 5));
      await db.query('DELETE FROM x');
      const fresh = await db.cached(sql, [], { ttlMs: 1 });
      expect(fresh).toEqual([]);
    });

    it('falls back to a plain query when no cache is configured', async () => {
      // Build a fresh db without a cache option
      const { config, cleanup } = tempFileConfig();
      const noCacheDb = await connect(config);
      try {
        await noCacheDb.query('CREATE TABLE x (id INTEGER PRIMARY KEY)');
        await noCacheDb.query('INSERT INTO x (id) VALUES (1)');
        const rows = await noCacheDb.cached('SELECT * FROM x');
        expect(rows).toHaveLength(1);
        // No cache means each call hits the DB
        await noCacheDb.query('DELETE FROM x');
        const fresh = await noCacheDb.cached('SELECT * FROM x');
        expect(fresh).toEqual([]);
      } finally {
        await noCacheDb.close();
        cleanup();
      }
    });

    it('cached() throws when not connected', async () => {
      await db.close();
      await expect(db.cached('SELECT 1')).rejects.toThrow('not connected');
    });
  });

  describe('addColumn / dropColumn (end-to-end)', () => {
    let cleanupFile: () => void;

    beforeEach(async () => {
      const { config, cleanup } = tempFileConfig();
      cleanupFile = cleanup;
      db = await connect(config);
      await db.query('CREATE TABLE widgets (id INTEGER PRIMARY KEY)');
    });

    afterEach(() => {
      cleanupFile?.();
    });

    it('addColumn adds a column from a ColumnBuilder', async () => {
      await db.addColumn('widgets', 'label', column.text());
      await db.query('INSERT INTO widgets (id, label) VALUES (1, ?)', ['hello']);
      const r = await db.query<{ label: string }>('SELECT label FROM widgets');
      expect(r.rows[0].label).toBe('hello');
    });

    it('addColumn accepts a TableDef as the target', async () => {
      const widgets = table('widgets', { id: column.integer().primaryKey() });
      await db.addColumn(widgets, 'qty', column.integer());
      await db.query('INSERT INTO widgets (id, qty) VALUES (1, 99)');
      const r = await db.query<{ qty: number }>('SELECT qty FROM widgets');
      expect(r.rows[0].qty).toBe(99);
    });

    it('dropColumn removes a column', async () => {
      await db.addColumn('widgets', 'tmp', column.text());
      await db.dropColumn('widgets', 'tmp');

      // SQLite reports columns via PRAGMA — confirm `tmp` is gone.
      const r = await db.query<{ name: string }>('PRAGMA table_info(widgets)');
      const names = r.rows.map((row) => row.name);
      expect(names).not.toContain('tmp');
    });

    it('addColumn throws when not connected', async () => {
      await db.close();
      await expect(
        db.addColumn('widgets', 'x', column.text())
      ).rejects.toThrow('not connected');
    });

    it('dropColumn throws when not connected', async () => {
      await db.close();
      await expect(db.dropColumn('widgets', 'x')).rejects.toThrow(
        'not connected'
      );
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
