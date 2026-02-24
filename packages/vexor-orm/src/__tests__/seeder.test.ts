/**
 * Seeder Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Sequence,
  createFactory,
  createSeederRunner,
  defineSeeder,
  truncate,
  fake,
} from '../seeder/index.js';
import type { FactoryDefinition, Seeder, SeederOptions } from '../seeder/index.js';

// ---------------------------------------------------------------------------
// Mock Database
// ---------------------------------------------------------------------------

function createMockDb() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, fields: [] }),
  };
}

// ---------------------------------------------------------------------------
// Sequence
// ---------------------------------------------------------------------------

describe('Sequence', () => {
  it('should start at 1 by default', () => {
    const seq = new Sequence();
    expect(seq.current()).toBe(1);
  });

  it('should start at a custom value', () => {
    const seq = new Sequence(100);
    expect(seq.current()).toBe(100);
  });

  it('should generate sequential values via next()', () => {
    const seq = new Sequence();
    expect(seq.next()).toBe(1);
    expect(seq.next()).toBe(2);
    expect(seq.next()).toBe(3);
    expect(seq.current()).toBe(4); // next value to be returned
  });

  it('should reset to a given value', () => {
    const seq = new Sequence();
    seq.next();
    seq.next();
    seq.reset(10);

    expect(seq.current()).toBe(10);
    expect(seq.next()).toBe(10);
    expect(seq.next()).toBe(11);
  });

  it('should reset to 1 by default', () => {
    const seq = new Sequence(50);
    seq.next();
    seq.next();
    seq.reset();

    expect(seq.current()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

describe('Factory', () => {
  interface UserRecord extends Record<string, unknown> {
    name: string;
    email: string;
    role: string;
  }

  let db: ReturnType<typeof createMockDb>;
  let seq: Sequence;
  let userDefinition: FactoryDefinition<UserRecord>;

  beforeEach(() => {
    db = createMockDb();
    seq = new Sequence();
    userDefinition = {
      table: 'users',
      definition: () => ({
        name: `user_${seq.next()}`,
        email: `user_${seq.current() - 1}@test.com`,
        role: 'user',
      }),
    };
  });

  describe('make', () => {
    it('should generate a record from the definition', () => {
      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const record = factory.make();

      expect(record).toHaveProperty('name');
      expect(record).toHaveProperty('email');
      expect(record).toHaveProperty('role', 'user');
    });

    it('should apply overrides', () => {
      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const record = factory.make({ name: 'Custom Name', role: 'admin' });

      expect(record.name).toBe('Custom Name');
      expect(record.role).toBe('admin');
      expect(record.email).toBeDefined();
    });
  });

  describe('makeMany', () => {
    it('should generate N records', () => {
      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const records = factory.makeMany(5);

      expect(records).toHaveLength(5);
      // each record should be distinct (different sequence values)
      const names = records.map((r) => r.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(5);
    });

    it('should apply overrides to all records', () => {
      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const records = factory.makeMany(3, { role: 'admin' });

      for (const record of records) {
        expect(record.role).toBe('admin');
      }
    });
  });

  describe('state and withState', () => {
    it('should register a named state', () => {
      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const returned = factory.state('admin', { role: 'admin' });

      // state() returns the same factory for chaining
      expect(returned).toBe(factory);
    });

    it('should apply state overrides via withState', () => {
      const factory = createFactory<UserRecord>(db as any, {
        ...userDefinition,
        states: {
          admin: { role: 'admin' },
        },
      });

      const adminFactory = factory.withState('admin');
      const record = adminFactory.make();

      expect(record.role).toBe('admin');
    });

    it('should apply function-based states', () => {
      const factory = createFactory<UserRecord>(db as any, {
        ...userDefinition,
        states: {
          editor: () => ({ role: 'editor', name: 'Editor User' }),
        },
      });

      const editorFactory = factory.withState('editor');
      const record = editorFactory.make();

      expect(record.role).toBe('editor');
      expect(record.name).toBe('Editor User');
    });

    it('should combine overrides with state', () => {
      const factory = createFactory<UserRecord>(db as any, {
        ...userDefinition,
        states: {
          admin: { role: 'admin' },
        },
      });

      const adminFactory = factory.withState('admin');
      const record = adminFactory.make({ name: 'Custom Admin' });

      expect(record.role).toBe('admin');
      expect(record.name).toBe('Custom Admin');
    });
  });

  describe('create', () => {
    it('should insert a record into the database', async () => {
      const insertedRow = { name: 'user_1', email: 'user_1@test.com', role: 'user', id: 1 };
      db.query.mockResolvedValueOnce({ rows: [insertedRow], rowCount: 1, fields: [] });

      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const record = await factory.create();

      expect(db.query).toHaveBeenCalledOnce();
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO users');
      expect(sql).toContain('RETURNING *');
      expect(params).toBeDefined();
      expect(record).toEqual(insertedRow);
    });

    it('should apply overrides when creating', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ name: 'Admin', email: 'x', role: 'admin', id: 1 }],
        rowCount: 1,
        fields: [],
      });

      const factory = createFactory<UserRecord>(db as any, userDefinition);
      await factory.create({ role: 'admin' });

      const [, params] = db.query.mock.calls[0];
      expect(params).toContain('admin');
    });
  });

  describe('createMany', () => {
    it('should insert N records into the database', async () => {
      db.query.mockResolvedValue({
        rows: [{ name: 'x', email: 'x', role: 'user', id: 1 }],
        rowCount: 1,
        fields: [],
      });

      const factory = createFactory<UserRecord>(db as any, userDefinition);
      const records = await factory.createMany(3);

      expect(records).toHaveLength(3);
      expect(db.query).toHaveBeenCalledTimes(3);
    });
  });
});

// ---------------------------------------------------------------------------
// SeederRunner
// ---------------------------------------------------------------------------

describe('SeederRunner', () => {
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe('register and getSeeders', () => {
    it('should register a seeder', () => {
      const runner = createSeederRunner({ db: db as any });
      const seeder: Seeder = { name: 'users', run: vi.fn() };

      runner.register(seeder);

      expect(runner.getSeeders()).toHaveLength(1);
      expect(runner.getSeeders()[0].name).toBe('users');
    });

    it('should register multiple seeders in order', () => {
      const runner = createSeederRunner({ db: db as any });
      const s1: Seeder = { name: 'first', run: vi.fn() };
      const s2: Seeder = { name: 'second', run: vi.fn() };

      runner.register(s1);
      runner.register(s2);

      const names = runner.getSeeders().map((s) => s.name);
      expect(names).toEqual(['first', 'second']);
    });

    it('should return a copy of seeders array', () => {
      const runner = createSeederRunner({ db: db as any });
      const seeder: Seeder = { name: 'test', run: vi.fn() };

      runner.register(seeder);
      const list = runner.getSeeders();
      list.pop();

      // internal list should not be affected
      expect(runner.getSeeders()).toHaveLength(1);
    });
  });

  describe('runAll', () => {
    it('should run all registered seeders', async () => {
      const runner = createSeederRunner({ db: db as any });
      const run1 = vi.fn();
      const run2 = vi.fn();

      runner.register({ name: 'first', run: run1 });
      runner.register({ name: 'second', run: run2 });

      await runner.runAll();

      expect(run1).toHaveBeenCalledWith(db);
      expect(run2).toHaveBeenCalledWith(db);
    });

    it('should run seeders in registration order', async () => {
      const runner = createSeederRunner({ db: db as any });
      const order: string[] = [];

      runner.register({ name: 'a', run: async () => { order.push('a'); } });
      runner.register({ name: 'b', run: async () => { order.push('b'); } });
      runner.register({ name: 'c', run: async () => { order.push('c'); } });

      await runner.runAll();

      expect(order).toEqual(['a', 'b', 'c']);
    });
  });

  describe('run (specific names)', () => {
    it('should run only named seeders', async () => {
      const runner = createSeederRunner({ db: db as any });
      const runA = vi.fn();
      const runB = vi.fn();
      const runC = vi.fn();

      runner.register({ name: 'a', run: runA });
      runner.register({ name: 'b', run: runB });
      runner.register({ name: 'c', run: runC });

      await runner.run(['b']);

      expect(runA).not.toHaveBeenCalled();
      expect(runB).toHaveBeenCalledOnce();
      expect(runC).not.toHaveBeenCalled();
    });

    it('should skip unknown seeder names', async () => {
      const runner = createSeederRunner({ db: db as any });
      runner.register({ name: 'known', run: vi.fn() });

      // should not throw for unknown names
      await runner.run(['unknown']);
    });
  });

  describe('revertAll', () => {
    it('should revert seeders in reverse order', async () => {
      const runner = createSeederRunner({ db: db as any });
      const order: string[] = [];

      runner.register({
        name: 'a',
        run: vi.fn(),
        revert: async () => { order.push('a'); },
      });
      runner.register({
        name: 'b',
        run: vi.fn(),
        revert: async () => { order.push('b'); },
      });
      runner.register({
        name: 'c',
        run: vi.fn(),
        revert: async () => { order.push('c'); },
      });

      await runner.revertAll();

      expect(order).toEqual(['c', 'b', 'a']);
    });

    it('should skip seeders without a revert function', async () => {
      const runner = createSeederRunner({ db: db as any });
      const revertFn = vi.fn();

      runner.register({ name: 'no-revert', run: vi.fn() });
      runner.register({ name: 'with-revert', run: vi.fn(), revert: revertFn });

      await runner.revertAll();

      expect(revertFn).toHaveBeenCalledOnce();
    });
  });

  describe('revert (specific names)', () => {
    it('should revert only named seeders', async () => {
      const runner = createSeederRunner({ db: db as any });
      const revertA = vi.fn();
      const revertB = vi.fn();

      runner.register({ name: 'a', run: vi.fn(), revert: revertA });
      runner.register({ name: 'b', run: vi.fn(), revert: revertB });

      await runner.revert(['a']);

      expect(revertA).toHaveBeenCalled();
      expect(revertB).not.toHaveBeenCalled();
    });
  });

  describe('tracking mode', () => {
    it('should create tracking table when track is true', async () => {
      const runner = createSeederRunner({ db: db as any, track: true });
      runner.register({ name: 'test', run: vi.fn() });

      // Mock the tracking queries
      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [{ count: 0 }], rowCount: 1, fields: [] }) // hasRun check
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }); // markAsRun

      await runner.runAll();

      // First call should be CREATE TABLE IF NOT EXISTS
      const firstCall = db.query.mock.calls[0][0];
      expect(firstCall).toContain('CREATE TABLE IF NOT EXISTS _seeders');
    });

    it('should skip already-run seeders when tracking', async () => {
      const runner = createSeederRunner({ db: db as any, track: true });
      const runFn = vi.fn();
      runner.register({ name: 'test', run: runFn });

      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [{ count: 1 }], rowCount: 1, fields: [] }); // hasRun -> true

      await runner.runAll();

      expect(runFn).not.toHaveBeenCalled();
    });

    it('should use custom tracking table name', async () => {
      const runner = createSeederRunner({
        db: db as any,
        track: true,
        trackingTable: '_custom_seeders',
      });
      runner.register({ name: 'x', run: vi.fn() });

      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }], rowCount: 1, fields: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] });

      await runner.runAll();

      const firstCall = db.query.mock.calls[0][0];
      expect(firstCall).toContain('_custom_seeders');
    });
  });
});

// ---------------------------------------------------------------------------
// defineSeeder helper
// ---------------------------------------------------------------------------

describe('defineSeeder', () => {
  it('should create a seeder object with name and run', () => {
    const run = vi.fn();
    const seeder = defineSeeder('users', run);

    expect(seeder.name).toBe('users');
    expect(seeder.run).toBe(run);
    expect(seeder.revert).toBeUndefined();
  });

  it('should include revert when provided', () => {
    const run = vi.fn();
    const revert = vi.fn();
    const seeder = defineSeeder('users', run, revert);

    expect(seeder.revert).toBe(revert);
  });
});

// ---------------------------------------------------------------------------
// truncate helper
// ---------------------------------------------------------------------------

describe('truncate', () => {
  it('should DELETE FROM a single table', async () => {
    const db = createMockDb();
    await truncate(db as any, 'users');

    expect(db.query).toHaveBeenCalledWith('DELETE FROM users');
  });

  it('should DELETE FROM multiple tables', async () => {
    const db = createMockDb();
    await truncate(db as any, ['users', 'posts', 'comments']);

    expect(db.query).toHaveBeenCalledWith('DELETE FROM users');
    expect(db.query).toHaveBeenCalledWith('DELETE FROM posts');
    expect(db.query).toHaveBeenCalledWith('DELETE FROM comments');
  });

  it('should attempt to reset sqlite_sequence', async () => {
    const db = createMockDb();
    await truncate(db as any, 'users');

    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM sqlite_sequence WHERE name = ?',
      ['users']
    );
  });

  it('should not throw if sqlite_sequence reset fails', async () => {
    const db = createMockDb();
    db.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // DELETE FROM
      .mockRejectedValueOnce(new Error('not sqlite')); // sqlite_sequence fails

    await expect(truncate(db as any, 'users')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// fake utilities (smoke tests)
// ---------------------------------------------------------------------------

describe('fake utilities', () => {
  it('should generate a UUID', () => {
    const uuid = fake.uuid();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('should generate first and last names', () => {
    expect(typeof fake.firstName()).toBe('string');
    expect(typeof fake.lastName()).toBe('string');
    expect(fake.firstName().length).toBeGreaterThan(0);
  });

  it('should generate a full name', () => {
    const name = fake.fullName();
    expect(name).toContain(' ');
  });

  it('should generate an email', () => {
    const email = fake.email();
    expect(email).toContain('@');
  });

  it('should generate an integer within bounds', () => {
    for (let i = 0; i < 50; i++) {
      const val = fake.int(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('should generate a float with correct decimals', () => {
    const val = fake.float(0, 100, 3);
    const decimals = val.toString().split('.')[1];
    if (decimals) {
      expect(decimals.length).toBeLessThanOrEqual(3);
    }
  });

  it('should generate a boolean', () => {
    const val = fake.boolean();
    expect(typeof val).toBe('boolean');
  });

  it('should pick a random array element', () => {
    const arr = ['a', 'b', 'c'];
    const el = fake.arrayElement(arr);
    expect(arr).toContain(el);
  });

  it('should generate an alphanumeric string of given length', () => {
    const str = fake.alphanumeric(20);
    expect(str).toHaveLength(20);
    expect(str).toMatch(/^[A-Za-z0-9]+$/);
  });
});
