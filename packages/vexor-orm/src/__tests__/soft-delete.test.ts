/**
 * Soft Delete Tests
 */

import { describe, it, expect, } from 'vitest';
import {
  softDeletable,
  getSoftDeleteCondition,
  getSoftDeleteValues,
  getRestoreValues,
  getOnlyTrashedCondition,
  generateSoftDeleteWhere,
  generateOnlyTrashedWhere,
  generateSoftDeleteUpdate,
  generateRestoreUpdate,
  createSoftDeleteContext,
  addSoftDeleteColumn,
  addSoftDeleteIndex,
  removeSoftDeleteColumn,
} from '../features/soft-delete.js';
import type { SoftDeleteOptions, } from '../features/soft-delete.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultOpts: Required<SoftDeleteOptions> = {
  column: 'deleted_at',
  includeDeleted: false,
  useBooleanFlag: false,
  booleanColumn: 'is_deleted',
};

const booleanOpts: Required<SoftDeleteOptions> = {
  column: 'deleted_at',
  includeDeleted: false,
  useBooleanFlag: true,
  booleanColumn: 'is_deleted',
};

function mockTableDef(name: string = 'users') {
  return {
    _brand: 'TableDef' as const,
    tableName: name,
    columns: {},
  };
}

// ---------------------------------------------------------------------------
// softDeletable
// ---------------------------------------------------------------------------

describe('softDeletable', () => {
  it('should wrap a table with default options', () => {
    const table = mockTableDef();
    const result = softDeletable(table);

    expect(result.table).toBe(table);
    expect(result.options.column).toBe('deleted_at');
    expect(result.options.includeDeleted).toBe(false);
    expect(result.options.useBooleanFlag).toBe(false);
    expect(result.options.booleanColumn).toBe('is_deleted');
  });

  it('should merge custom options', () => {
    const table = mockTableDef();
    const result = softDeletable(table, {
      column: 'removed_at',
      useBooleanFlag: true,
      booleanColumn: 'removed',
    });

    expect(result.options.column).toBe('removed_at');
    expect(result.options.useBooleanFlag).toBe(true);
    expect(result.options.booleanColumn).toBe('removed');
    // defaults should still be filled in
    expect(result.options.includeDeleted).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSoftDeleteCondition - WHERE deleted_at IS NULL
// ---------------------------------------------------------------------------

describe('getSoftDeleteCondition', () => {
  it('should return IS NULL condition for timestamp mode', () => {
    const condition = getSoftDeleteCondition(defaultOpts);

    expect(condition).not.toBeNull();
    expect(condition!.column).toBe('deleted_at');
    expect(condition!.operator).toBe('IS');
    expect(condition!.value).toBeNull();
  });

  it('should return boolean = false condition for boolean mode', () => {
    const condition = getSoftDeleteCondition(booleanOpts);

    expect(condition).not.toBeNull();
    expect(condition!.column).toBe('is_deleted');
    expect(condition!.operator).toBe('=');
    expect(condition!.value).toBe(false);
  });

  it('should return null when includeDeleted is true (withTrashed)', () => {
    const condition = getSoftDeleteCondition(defaultOpts, true);
    expect(condition).toBeNull();
  });

  it('should return null when options.includeDeleted is true', () => {
    const opts = { ...defaultOpts, includeDeleted: true };
    const condition = getSoftDeleteCondition(opts);
    expect(condition).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getOnlyTrashedCondition - only deleted records
// ---------------------------------------------------------------------------

describe('getOnlyTrashedCondition', () => {
  it('should return IS NOT NULL for timestamp mode', () => {
    const condition = getOnlyTrashedCondition(defaultOpts);

    expect(condition.column).toBe('deleted_at');
    expect(condition.operator).toBe('IS NOT');
    expect(condition.value).toBeNull();
  });

  it('should return boolean = true for boolean mode', () => {
    const condition = getOnlyTrashedCondition(booleanOpts);

    expect(condition.column).toBe('is_deleted');
    expect(condition.operator).toBe('=');
    expect(condition.value).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getSoftDeleteValues - softDelete sets deleted_at timestamp
// ---------------------------------------------------------------------------

describe('getSoftDeleteValues', () => {
  it('should return timestamp value for timestamp mode', () => {
    const values = getSoftDeleteValues(defaultOpts);

    expect(values).toHaveProperty('deleted_at');
    expect(typeof values.deleted_at).toBe('string');
    // should be a valid ISO string
    expect(new Date(values.deleted_at as string).toISOString()).toBe(values.deleted_at);
  });

  it('should return boolean true for boolean mode', () => {
    const values = getSoftDeleteValues(booleanOpts);

    expect(values).toEqual({ is_deleted: true });
  });
});

// ---------------------------------------------------------------------------
// getRestoreValues - restore clears deleted_at
// ---------------------------------------------------------------------------

describe('getRestoreValues', () => {
  it('should return null for timestamp mode', () => {
    const values = getRestoreValues(defaultOpts);

    expect(values).toEqual({ deleted_at: null });
  });

  it('should return boolean false for boolean mode', () => {
    const values = getRestoreValues(booleanOpts);

    expect(values).toEqual({ is_deleted: false });
  });
});

// ---------------------------------------------------------------------------
// SQL generation helpers
// ---------------------------------------------------------------------------

describe('generateSoftDeleteWhere', () => {
  it('should generate "deleted_at IS NULL" in timestamp mode', () => {
    const sql = generateSoftDeleteWhere(defaultOpts);
    expect(sql).toBe('deleted_at IS NULL');
  });

  it('should generate "is_deleted = false" in boolean mode', () => {
    const sql = generateSoftDeleteWhere(booleanOpts);
    expect(sql).toBe('is_deleted = false');
  });

  it('should prepend table alias', () => {
    const sql = generateSoftDeleteWhere(defaultOpts, 'u');
    expect(sql).toBe('u.deleted_at IS NULL');
  });
});

describe('generateOnlyTrashedWhere', () => {
  it('should generate "deleted_at IS NOT NULL" in timestamp mode', () => {
    const sql = generateOnlyTrashedWhere(defaultOpts);
    expect(sql).toBe('deleted_at IS NOT NULL');
  });

  it('should generate "is_deleted = true" in boolean mode', () => {
    const sql = generateOnlyTrashedWhere(booleanOpts);
    expect(sql).toBe('is_deleted = true');
  });

  it('should prepend table alias', () => {
    const sql = generateOnlyTrashedWhere(booleanOpts, 't');
    expect(sql).toBe('t.is_deleted = true');
  });
});

describe('generateSoftDeleteUpdate', () => {
  it('should generate UPDATE with CURRENT_TIMESTAMP in timestamp mode', () => {
    const sql = generateSoftDeleteUpdate('users', defaultOpts, 'id = 1');
    expect(sql).toBe('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1');
  });

  it('should generate UPDATE with boolean true in boolean mode', () => {
    const sql = generateSoftDeleteUpdate('users', booleanOpts, 'id = 1');
    expect(sql).toBe('UPDATE users SET is_deleted = true WHERE id = 1');
  });
});

describe('generateRestoreUpdate', () => {
  it('should generate UPDATE setting deleted_at = NULL in timestamp mode', () => {
    const sql = generateRestoreUpdate('users', defaultOpts, 'id = 1');
    expect(sql).toBe('UPDATE users SET deleted_at = NULL WHERE id = 1');
  });

  it('should generate UPDATE setting is_deleted = false in boolean mode', () => {
    const sql = generateRestoreUpdate('users', booleanOpts, 'id = 1');
    expect(sql).toBe('UPDATE users SET is_deleted = false WHERE id = 1');
  });
});

// ---------------------------------------------------------------------------
// createSoftDeleteContext - SQL filter application
// ---------------------------------------------------------------------------

describe('createSoftDeleteContext', () => {
  describe('applySoftDeleteFilter', () => {
    it('should add WHERE clause to query without WHERE', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter('SELECT * FROM users', 'users');
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL');
    });

    it('should prepend condition to existing WHERE clause', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter(
        'SELECT * FROM users WHERE active = true',
        'users'
      );
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL AND active = true');
    });

    it('should insert WHERE before ORDER BY', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter(
        'SELECT * FROM users ORDER BY name',
        'users'
      );
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY name');
    });

    it('should insert WHERE before LIMIT', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter(
        'SELECT * FROM users LIMIT 10',
        'users'
      );
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL LIMIT 10');
    });

    it('should insert WHERE before GROUP BY', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter(
        'SELECT status, COUNT(*) FROM users GROUP BY status',
        'users'
      );
      expect(sql).toContain('WHERE deleted_at IS NULL');
      expect(sql).toContain('GROUP BY status');
    });

    it('should use alias when provided', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applySoftDeleteFilter(
        'SELECT * FROM users u',
        'users',
        'u'
      );
      expect(sql).toContain('u.deleted_at IS NULL');
    });

    it('should use boolean mode when configured', () => {
      const ctx = createSoftDeleteContext({ useBooleanFlag: true });
      const sql = ctx.applySoftDeleteFilter('SELECT * FROM users', 'users');
      expect(sql).toBe('SELECT * FROM users WHERE is_deleted = false');
    });
  });

  describe('applyOnlyTrashedFilter', () => {
    it('should add IS NOT NULL condition for only trashed', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applyOnlyTrashedFilter('SELECT * FROM users', 'users');
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NOT NULL');
    });

    it('should prepend condition to existing WHERE clause', () => {
      const ctx = createSoftDeleteContext();
      const sql = ctx.applyOnlyTrashedFilter(
        'SELECT * FROM users WHERE role = \'admin\'',
        'users'
      );
      expect(sql).toContain('deleted_at IS NOT NULL AND');
    });

    it('should use boolean mode for only trashed', () => {
      const ctx = createSoftDeleteContext({ useBooleanFlag: true });
      const sql = ctx.applyOnlyTrashedFilter('SELECT * FROM users', 'users');
      expect(sql).toBe('SELECT * FROM users WHERE is_deleted = true');
    });
  });
});

// ---------------------------------------------------------------------------
// Migration helpers
// ---------------------------------------------------------------------------

describe('addSoftDeleteColumn', () => {
  it('should generate ALTER TABLE for timestamp column', () => {
    const sql = addSoftDeleteColumn('users');
    expect(sql).toBe('ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL');
  });

  it('should generate ALTER TABLE for boolean column', () => {
    const sql = addSoftDeleteColumn('users', { useBooleanFlag: true });
    expect(sql).toBe('ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT false');
  });

  it('should respect custom column names', () => {
    const sql = addSoftDeleteColumn('posts', { column: 'removed_at' });
    expect(sql).toBe('ALTER TABLE posts ADD COLUMN removed_at TIMESTAMP NULL');
  });
});

describe('addSoftDeleteIndex', () => {
  it('should generate CREATE INDEX for timestamp column', () => {
    const sql = addSoftDeleteIndex('users');
    expect(sql).toBe('CREATE INDEX idx_users_soft_delete ON users(deleted_at)');
  });

  it('should generate CREATE INDEX for boolean column', () => {
    const sql = addSoftDeleteIndex('users', { useBooleanFlag: true });
    expect(sql).toBe('CREATE INDEX idx_users_soft_delete ON users(is_deleted)');
  });
});

describe('removeSoftDeleteColumn', () => {
  it('should generate ALTER TABLE DROP for timestamp column', () => {
    const sql = removeSoftDeleteColumn('users');
    expect(sql).toBe('ALTER TABLE users DROP COLUMN deleted_at');
  });

  it('should generate ALTER TABLE DROP for boolean column', () => {
    const sql = removeSoftDeleteColumn('users', { useBooleanFlag: true });
    expect(sql).toBe('ALTER TABLE users DROP COLUMN is_deleted');
  });
});
