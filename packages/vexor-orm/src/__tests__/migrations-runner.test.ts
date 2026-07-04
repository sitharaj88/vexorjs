/**
 * Migration Runner Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MigrationRunner, createMigrationRunner } from '../migrations/runner.js';
import type { MigrationFile, } from '../migrations/runner.js';

// ---------------------------------------------------------------------------
// Mock Database Driver
// ---------------------------------------------------------------------------

function createMockDriver() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, fields: [] }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Sample migrations
// ---------------------------------------------------------------------------

function sampleMigrations(): MigrationFile[] {
  return [
    {
      version: '001',
      name: 'create_users',
      up: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255))',
      down: 'DROP TABLE users',
    },
    {
      version: '002',
      name: 'create_posts',
      up: 'CREATE TABLE posts (id SERIAL PRIMARY KEY, title VARCHAR(255), user_id INTEGER)',
      down: 'DROP TABLE posts',
    },
    {
      version: '003',
      name: 'add_email_to_users',
      up: 'ALTER TABLE users ADD COLUMN email VARCHAR(255)',
      down: 'ALTER TABLE users DROP COLUMN email',
    },
  ];
}

// ---------------------------------------------------------------------------
// MigrationRunner
// ---------------------------------------------------------------------------

describe('MigrationRunner', () => {
  let db: ReturnType<typeof createMockDriver>;
  let migrations: MigrationFile[];

  beforeEach(() => {
    db = createMockDriver();
    migrations = sampleMigrations();
  });

  // ---- Initialization ----

  describe('initialize', () => {
    it('should create the migrations tracking table', async () => {
      const runner = new MigrationRunner(db as any, { migrations });
      await runner.initialize();

      expect(db.query).toHaveBeenCalledTimes(1);
      const sql = db.query.mock.calls[0][0] as string;
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS _vexor_migrations');
      expect(sql).toContain('version');
      expect(sql).toContain('name');
    });

    it('should use custom table name', async () => {
      const runner = new MigrationRunner(db as any, {
        migrations,
        tableName: '_my_migrations',
      });
      await runner.initialize();

      const sql = db.query.mock.calls[0][0] as string;
      expect(sql).toContain('_my_migrations');
    });
  });

  // ---- Migration management ----

  describe('getMigrations', () => {
    it('should return all registered migrations', () => {
      const runner = new MigrationRunner(db as any, { migrations });
      const result = runner.getMigrations();

      expect(result).toHaveLength(3);
      expect(result.map((m) => m.version)).toEqual(['001', '002', '003']);
    });

    it('should return a copy (not the internal array)', () => {
      const runner = new MigrationRunner(db as any, { migrations });
      const result = runner.getMigrations();
      result.pop();

      expect(runner.getMigrations()).toHaveLength(3);
    });
  });

  describe('addMigrations', () => {
    it('should add and sort migrations by version', () => {
      const runner = new MigrationRunner(db as any, {
        migrations: [migrations[2]], // start with 003
      });

      runner.addMigrations([migrations[0], migrations[1]]); // add 001, 002

      const versions = runner.getMigrations().map((m) => m.version);
      expect(versions).toEqual(['001', '002', '003']);
    });
  });

  // ---- Pending migrations ----

  describe('getPendingMigrations', () => {
    it('should return all migrations when none applied', async () => {
      // getAppliedMigrations queries the table, returns empty
      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }); // SELECT applied

      const runner = new MigrationRunner(db as any, { migrations });
      const pending = await runner.getPendingMigrations();

      expect(pending).toHaveLength(3);
    });

    it('should exclude already applied migrations', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ version: '001', name: 'create_users', appliedAt: new Date() }],
        rowCount: 1,
        fields: [],
      });

      const runner = new MigrationRunner(db as any, { migrations });
      const pending = await runner.getPendingMigrations();

      expect(pending).toHaveLength(2);
      expect(pending.map((m) => m.version)).toEqual(['002', '003']);
    });
  });

  // ---- Run pending migrations ----

  describe('migrateUp', () => {
    it('should run all pending migrations', async () => {
      db.query
        // initialize: CREATE TABLE
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // getPendingMigrations -> getAppliedMigrations -> SELECT
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // migration 001 up SQL
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // INSERT into tracking table
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // migration 002 up SQL
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // INSERT into tracking table
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // migration 003 up SQL
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // INSERT into tracking table
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateUp();

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.applied)).toBe(true);
      expect(results.map((r) => r.version)).toEqual(['001', '002', '003']);
    });

    it('should record version in tracking table after each migration', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // SELECT applied
        .mockResolvedValue({ rows: [], rowCount: 0, fields: [] }); // all subsequent

      const runner = new MigrationRunner(db as any, { migrations: [migrations[0]] });
      await runner.migrateUp();

      // Should have INSERT INTO _vexor_migrations call
      const insertCalls = db.query.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('INSERT INTO _vexor_migrations')
      );
      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0][1]).toContain('001');
      expect(insertCalls[0][1]).toContain('create_users');
    });

    it('should stop on first error', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // SELECT applied
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // migration 001 succeeds
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // INSERT tracking
        .mockRejectedValueOnce(new Error('table already exists')); // migration 002 fails

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateUp();

      expect(results).toHaveLength(2);
      expect(results[0].applied).toBe(true);
      expect(results[1].applied).toBe(false);
      expect(results[1].error).toBeDefined();
      expect(results[1].error!.message).toBe('table already exists');
    });

    it('should include duration in results', async () => {
      db.query.mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations: [migrations[0]] });
      const results = await runner.migrateUp();

      expect(results[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should support function-based migrations', async () => {
      const upFn = vi.fn();
      const fnMigration: MigrationFile = {
        version: '001',
        name: 'fn_migration',
        up: upFn,
        down: vi.fn(),
      };

      db.query.mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations: [fnMigration] });
      const results = await runner.migrateUp();

      expect(results[0].applied).toBe(true);
      expect(upFn).toHaveBeenCalledWith(db);
    });
  });

  // ---- Rollback last migration ----

  describe('migrateDown', () => {
    it('should rollback the last applied migration', async () => {
      // getAppliedMigrations returns the first migration as applied
      db.query
        .mockResolvedValueOnce({
          rows: [{ version: '001', name: 'create_users', appliedAt: new Date() }],
          rowCount: 1,
          fields: [],
        })
        // down SQL
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] })
        // DELETE from tracking table
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateDown();

      expect(results).toHaveLength(1);
      expect(results[0].version).toBe('001');
      expect(results[0].applied).toBe(true);
    });

    it('should remove version from tracking table on rollback', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [{ version: '001', name: 'create_users', appliedAt: new Date() }],
          rowCount: 1,
          fields: [],
        })
        .mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      await runner.migrateDown();

      const deleteCalls = db.query.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('DELETE FROM _vexor_migrations')
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][1]).toContain('001');
    });

    it('should return empty array when no migrations applied', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateDown();

      expect(results).toEqual([]);
    });

    it('should throw if migration has no down function', async () => {
      const noDownMigrations: MigrationFile[] = [
        { version: '001', name: 'no_down', up: 'CREATE TABLE x (id INT)' },
      ];

      db.query.mockResolvedValueOnce({
        rows: [{ version: '001', name: 'no_down', appliedAt: new Date() }],
        rowCount: 1,
        fields: [],
      });

      const runner = new MigrationRunner(db as any, { migrations: noDownMigrations });
      await expect(runner.migrateDown()).rejects.toThrow('has no down migration');
    });
  });

  // ---- Migration status tracking ----

  describe('getStatus', () => {
    it('should return status for all migrations', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ version: '001', name: 'create_users', appliedAt: new Date() }],
        rowCount: 1,
        fields: [],
      });

      const runner = new MigrationRunner(db as any, { migrations });
      const status = await runner.getStatus();

      expect(status).toHaveLength(3);
      expect(status[0]).toMatchObject({ version: '001', name: 'create_users', applied: true });
      expect(status[1]).toMatchObject({ version: '002', name: 'create_posts', applied: false });
      expect(status[2]).toMatchObject({ version: '003', name: 'add_email_to_users', applied: false });
    });

    it('should mark all as not applied when none have run', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const status = await runner.getStatus();

      expect(status.every((s) => s.applied === false)).toBe(true);
    });

    it('should include appliedAt for applied migrations', async () => {
      const appliedAt = new Date('2025-01-15T10:00:00Z');
      db.query.mockResolvedValueOnce({
        rows: [{ version: '001', name: 'create_users', appliedAt }],
        rowCount: 1,
        fields: [],
      });

      const runner = new MigrationRunner(db as any, { migrations });
      const status = await runner.getStatus();

      expect(status[0].appliedAt).toEqual(appliedAt);
      expect(status[1].appliedAt).toBeUndefined();
    });
  });

  // ---- Dry-run mode ----

  describe('dry-run mode', () => {
    it('should not execute SQL in dry-run mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      db.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [], rowCount: 0, fields: [] }); // SELECT applied

      const runner = new MigrationRunner(db as any, { migrations, dryRun: true });
      const results = await runner.migrateUp();

      expect(results).toHaveLength(3);
      // In dry-run, applied should be false for all
      expect(results.every((r) => r.applied === false)).toBe(true);

      // The actual migration SQL should NOT have been executed
      // Only initialize and getPendingMigrations queries should have run
      const migrationSqlCalls = db.query.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('CREATE TABLE users')
      );
      expect(migrationSqlCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should log dry-run messages', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      db.query.mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, {
        migrations: [migrations[0]],
        dryRun: true,
      });
      await runner.migrateUp();

      const dryRunLogs = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('[DRY RUN]')
      );
      expect(dryRunLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });

  // ---- migrateUpTo ----

  describe('migrateUpTo', () => {
    it('should only run migrations up to specified version', async () => {
      db.query.mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateUpTo('002');

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.version)).toEqual(['001', '002']);
    });
  });

  // ---- migrateDownTo ----

  describe('migrateDownTo', () => {
    it('should rollback migrations down to specified version', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            { version: '001', name: 'create_users', appliedAt: new Date() },
            { version: '002', name: 'create_posts', appliedAt: new Date() },
            { version: '003', name: 'add_email_to_users', appliedAt: new Date() },
          ],
          rowCount: 3,
          fields: [],
        })
        .mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.migrateDownTo('001');

      // should rollback 003 and 002
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.version)).toEqual(['003', '002']);
    });
  });

  // ---- reset ----

  describe('reset', () => {
    it('should rollback all applied migrations in reverse order', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            { version: '001', name: 'create_users', appliedAt: new Date() },
            { version: '002', name: 'create_posts', appliedAt: new Date() },
          ],
          rowCount: 2,
          fields: [],
        })
        .mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations });
      const results = await runner.reset();

      expect(results).toHaveLength(2);
      expect(results[0].version).toBe('002');
      expect(results[1].version).toBe('001');
    });

    it('should skip migrations without down function', async () => {
      const noDownMigrations: MigrationFile[] = [
        { version: '001', name: 'no_down', up: 'CREATE TABLE x (id INT)' },
      ];

      db.query
        .mockResolvedValueOnce({
          rows: [{ version: '001', name: 'no_down', appliedAt: new Date() }],
          rowCount: 1,
          fields: [],
        })
        .mockResolvedValue({ rows: [], rowCount: 0, fields: [] });

      const runner = new MigrationRunner(db as any, { migrations: noDownMigrations });
      const results = await runner.reset();

      // Should be empty because migration has no down
      expect(results).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// createMigrationRunner factory
// ---------------------------------------------------------------------------

describe('createMigrationRunner', () => {
  it('should return a MigrationRunner instance', () => {
    const db = createMockDriver();
    const runner = createMigrationRunner(db as any);

    expect(runner).toBeInstanceOf(MigrationRunner);
  });

  it('should accept options', () => {
    const db = createMockDriver();
    const migs = sampleMigrations();
    const runner = createMigrationRunner(db as any, { migrations: migs, tableName: '_custom' });

    expect(runner.getMigrations()).toHaveLength(3);
  });
});
