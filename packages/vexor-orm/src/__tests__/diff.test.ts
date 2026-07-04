/**
 * Schema diffing tests: diff detection, migration generation, and
 * end-to-end application of generated SQL against real SQLite.
 */

import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import {
  snapshotSchema,
  diffSchemas,
  generateMigrationFromDiff,
  generateAutoMigration,
} from '../migrations/diff.js';

const usersV1 = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
});

const usersV2 = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  bio: column.text(),
});

const posts = table('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
});

describe('snapshotSchema', () => {
  it('serializes to plain JSON and round-trips through stringify', () => {
    const snapshot = snapshotSchema([usersV1]);

    expect(snapshot.version).toBe(1);
    expect(snapshot.tables).toHaveLength(1);
    expect(snapshot.tables[0].name).toBe('users');
    expect(Object.keys(snapshot.tables[0].columns)).toEqual(['id', 'name', 'email']);

    const roundTripped = JSON.parse(JSON.stringify(snapshot));
    expect(roundTripped).toEqual(snapshot);
  });
});

describe('diffSchemas', () => {
  it('reports every table as added on first run (null snapshot)', () => {
    const diff = diffSchemas(null, [usersV1, posts]);

    expect(diff.hasChanges).toBe(true);
    expect(diff.addedTables.map((t) => t.name)).toEqual(['users', 'posts']);
    expect(diff.removedTables).toEqual([]);
    expect(diff.changedTables).toEqual([]);
  });

  it('reports no changes for identical schemas', () => {
    const snapshot = snapshotSchema([usersV1, posts]);
    const diff = diffSchemas(snapshot, [usersV1, posts]);

    expect(diff.hasChanges).toBe(false);
  });

  it('detects added and removed tables', () => {
    const snapshot = snapshotSchema([usersV1]);
    const diff = diffSchemas(snapshot, [posts]);

    expect(diff.addedTables.map((t) => t.name)).toEqual(['posts']);
    expect(diff.removedTables.map((t) => t.name)).toEqual(['users']);
  });

  it('detects added, removed, and changed columns', () => {
    const before = snapshotSchema([usersV1]);

    const changed = table('users', {
      id: column.serial().primaryKey(),
      name: column.text().notNull(), // varchar -> text
      bio: column.text(), // added
      // email removed
    });

    const diff = diffSchemas(before, [changed]);
    expect(diff.changedTables).toHaveLength(1);

    const change = diff.changedTables[0];
    expect(change.addedColumns.map((c) => c.name)).toEqual(['bio']);
    expect(change.removedColumns.map((c) => c.name)).toEqual(['email']);
    expect(change.changedColumns.map((c) => c.name)).toEqual(['name']);
    expect(change.changedColumns[0].from.dataType).toBe('varchar');
    expect(change.changedColumns[0].to.dataType).toBe('text');
  });
});

describe('generateMigrationFromDiff', () => {
  it('generates CREATE TABLE for added tables with DROP in down', () => {
    const diff = diffSchemas(null, [usersV1]);
    const migration = generateMigrationFromDiff(diff, { dialect: 'postgres' });

    expect(migration.up.join('\n')).toContain('CREATE TABLE');
    expect(migration.up.join('\n')).toContain('users');
    expect(migration.down.join('\n')).toContain('DROP TABLE');
    expect(migration.warnings).toEqual([]);
  });

  it('generates ADD COLUMN with a restoring rollback', () => {
    const diff = diffSchemas(snapshotSchema([usersV1]), [usersV2]);
    const migration = generateMigrationFromDiff(diff, { dialect: 'postgres' });

    expect(migration.up.join('\n')).toContain('ADD COLUMN');
    expect(migration.up.join('\n')).toContain('bio');
    expect(migration.down.join('\n')).toContain('DROP COLUMN');
  });

  it('recreates dropped tables in the down migration', () => {
    const diff = diffSchemas(snapshotSchema([usersV1, posts]), [usersV1]);
    const migration = generateMigrationFromDiff(diff, { dialect: 'postgres' });

    expect(migration.up.join('\n')).toContain('DROP TABLE');
    expect(migration.down.join('\n')).toContain('CREATE TABLE');
    expect(migration.down.join('\n')).toContain('posts');
  });

  it('warns instead of emitting ALTER COLUMN on sqlite', () => {
    const before = snapshotSchema([usersV1]);
    const changed = table('users', {
      id: column.serial().primaryKey(),
      name: column.text().notNull(),
      email: column.varchar(255).unique().notNull(),
    });

    const migration = generateMigrationFromDiff(diffSchemas(before, [changed]), {
      dialect: 'sqlite',
    });

    expect(migration.warnings.length).toBeGreaterThan(0);
    expect(migration.warnings[0]).toContain('SQLite');
  });

  it('warns about NOT NULL columns added without defaults', () => {
    const before = snapshotSchema([usersV1]);
    const withRequired = table('users', {
      id: column.serial().primaryKey(),
      name: column.varchar(255).notNull(),
      email: column.varchar(255).unique().notNull(),
      tenantId: column.integer().notNull(), // no default!
    });

    const migration = generateMigrationFromDiff(diffSchemas(before, [withRequired]), {
      dialect: 'postgres',
    });

    expect(migration.warnings.some((w) => w.includes('tenantId'))).toBe(true);
  });
});

describe('end-to-end against real SQLite', () => {
  it('generated up migrations execute successfully', () => {
    const db = new Database(':memory:');

    // First run: create everything
    const first = generateAutoMigration(null, [usersV1, posts], { dialect: 'sqlite' });
    expect(first.hasChanges).toBe(true);
    for (const sql of first.up) db.exec(sql);

    db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('ada', 'a@b.c');

    // Second run: add a column
    const second = generateAutoMigration(first.snapshot, [usersV2, posts], {
      dialect: 'sqlite',
    });
    expect(second.hasChanges).toBe(true);
    for (const sql of second.up) db.exec(sql);

    db.prepare('UPDATE users SET bio = ? WHERE name = ?').run('pioneer', 'ada');
    const row = db.prepare('SELECT bio FROM users WHERE name = ?').get('ada') as {
      bio: string;
    };
    expect(row.bio).toBe('pioneer');

    // Third run: no changes
    const third = generateAutoMigration(second.snapshot, [usersV2, posts], {
      dialect: 'sqlite',
    });
    expect(third.hasChanges).toBe(false);
    expect(third.up).toEqual([]);

    db.close();
  });
});
