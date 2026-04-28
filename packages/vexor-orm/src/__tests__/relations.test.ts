/**
 * Relation Tests
 *
 * Tests for relation primitives and eager loading. Pure unit tests run with
 * a mock executor; integration coverage is provided via the Database class
 * end-to-end against SQLite (see database.test.ts).
 */

import { describe, it, expect, vi } from 'vitest';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import {
  hasOne,
  hasMany,
  belongsTo,
  belongsToMany,
  loadRelations,
  type RelationExecutor,
} from '../relations/index.js';
import { softDeletable } from '../features/soft-delete.js';

// ---------------------------------------------------------------------------
// Test tables
// ---------------------------------------------------------------------------

const users = table('users', {
  id: column.integer().primaryKey(),
  name: column.text().notNull(),
});

const posts = table('posts', {
  id: column.integer().primaryKey(),
  user_id: column.integer().notNull(),
  title: column.text().notNull(),
});

const profiles = table('profiles', {
  id: column.integer().primaryKey(),
  user_id: column.integer().notNull(),
  bio: column.text(),
});

const tags = table('tags', {
  id: column.integer().primaryKey(),
  name: column.text().notNull(),
});

const postTags = table('post_tags', {
  post_id: column.integer().notNull(),
  tag_id: column.integer().notNull(),
});

// ---------------------------------------------------------------------------
// Relation primitives
// ---------------------------------------------------------------------------

describe('relation primitives', () => {
  it('hasOne uses default localKey of "id"', () => {
    const rel = hasOne(profiles, { foreignKey: 'user_id' });
    expect(rel.kind).toBe('hasOne');
    expect(rel.target).toBe(profiles);
    expect(rel.foreignKey).toBe('user_id');
    expect(rel.localKey).toBe('id');
  });

  it('hasMany supports a custom localKey', () => {
    const rel = hasMany(posts, { foreignKey: 'user_id', localKey: 'uuid' });
    expect(rel.kind).toBe('hasMany');
    expect(rel.localKey).toBe('uuid');
  });

  it('belongsTo uses default ownerKey of "id"', () => {
    const rel = belongsTo(users, { foreignKey: 'user_id' });
    expect(rel.kind).toBe('belongsTo');
    expect(rel.foreignKey).toBe('user_id');
    expect(rel.ownerKey).toBe('id');
  });

  it('belongsToMany captures the join table and key columns', () => {
    const rel = belongsToMany(tags, {
      through: postTags,
      sourceKey: 'post_id',
      targetKey: 'tag_id',
    });
    expect(rel.kind).toBe('belongsToMany');
    expect(rel.through).toBe(postTags);
    expect(rel.sourceKey).toBe('post_id');
    expect(rel.targetKey).toBe('tag_id');
    expect(rel.localKey).toBe('id');
    expect(rel.ownerKey).toBe('id');
  });

  it('belongsToMany accepts a string for through', () => {
    const rel = belongsToMany(tags, {
      through: 'post_tags',
      sourceKey: 'post_id',
      targetKey: 'tag_id',
    });
    expect(rel.through).toBe('post_tags');
  });
});

// ---------------------------------------------------------------------------
// Eager loading — mock executor
// ---------------------------------------------------------------------------

function makeExecutor(
  responses: Array<{ rows: Record<string, unknown>[] }>
): RelationExecutor & { calls: Array<{ sql: string; params: unknown[] }> } {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  let i = 0;
  return {
    calls,
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      calls.push({ sql, params: params ?? [] });
      const r = responses[i++];
      return r ?? { rows: [] };
    }) as unknown as RelationExecutor['query'],
  };
}

describe('loadRelations', () => {
  it('returns parents unchanged when the parent list is empty', async () => {
    const exec = makeExecutor([]);
    const result = await loadRelations(
      exec,
      [],
      { posts: hasMany(posts, { foreignKey: 'user_id' }) },
      { posts: true }
    );
    expect(result).toEqual([]);
    expect(exec.calls).toHaveLength(0);
  });

  it('throws on an unknown relation name', async () => {
    const exec = makeExecutor([]);
    await expect(
      loadRelations(
        exec,
        [{ id: 1 }],
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { friends: true }
      )
    ).rejects.toThrow('Unknown relation: friends');
  });

  it('skips relations whose flag is not true', async () => {
    const exec = makeExecutor([]);
    await loadRelations(
      exec,
      [{ id: 1 }],
      { posts: hasMany(posts, { foreignKey: 'user_id' }) },
      {} // no flags set
    );
    expect(exec.calls).toHaveLength(0);
  });

  describe('hasMany', () => {
    it('groups child rows by foreign key on a single IN query', async () => {
      const exec = makeExecutor([
        {
          rows: [
            { id: 1, user_id: 1, title: 'a' },
            { id: 2, user_id: 1, title: 'b' },
            { id: 3, user_id: 2, title: 'c' },
          ],
        },
      ]);

      const parents = [
        { id: 1, name: 'alice' },
        { id: 2, name: 'bob' },
      ] as Record<string, unknown>[];

      await loadRelations(
        exec,
        parents,
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect(exec.calls).toHaveLength(1);
      expect(exec.calls[0].sql).toContain('FROM "posts"');
      expect(exec.calls[0].sql).toContain('"user_id" IN ($1, $2)');
      expect(exec.calls[0].params).toEqual([1, 2]);

      expect((parents[0] as any).posts).toHaveLength(2);
      expect((parents[1] as any).posts).toHaveLength(1);
    });

    it('returns [] for parents with no matches', async () => {
      const exec = makeExecutor([
        { rows: [{ id: 1, user_id: 1, title: 'a' }] },
      ]);

      const parents = [
        { id: 1 },
        { id: 2 },
      ] as Record<string, unknown>[];

      await loadRelations(
        exec,
        parents,
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect((parents[0] as any).posts).toHaveLength(1);
      expect((parents[1] as any).posts).toEqual([]);
    });

    it('deduplicates IN params across parents with the same key', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      const parents = [{ id: 1 }, { id: 1 }, { id: 2 }] as Record<
        string,
        unknown
      >[];

      await loadRelations(
        exec,
        parents,
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect(exec.calls[0].params).toEqual([1, 2]);
    });

    it('skips the query and assigns [] when all parent keys are null', async () => {
      const exec = makeExecutor([]);
      const parents = [{ id: null }, { id: null }] as Record<
        string,
        unknown
      >[];

      await loadRelations(
        exec,
        parents,
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect(exec.calls).toHaveLength(0);
      expect((parents[0] as any).posts).toEqual([]);
    });
  });

  describe('hasOne', () => {
    it('attaches a single child or null', async () => {
      const exec = makeExecutor([
        {
          rows: [{ id: 10, user_id: 1, bio: 'hello' }],
        },
      ]);

      const parents = [
        { id: 1 },
        { id: 2 },
      ] as Record<string, unknown>[];

      await loadRelations(
        exec,
        parents,
        { profile: hasOne(profiles, { foreignKey: 'user_id' }) },
        { profile: true }
      );

      expect((parents[0] as any).profile).toMatchObject({ bio: 'hello' });
      expect((parents[1] as any).profile).toBeNull();
    });
  });

  describe('belongsTo', () => {
    it('attaches the parent row by FK lookup', async () => {
      const exec = makeExecutor([
        {
          rows: [
            { id: 1, name: 'alice' },
            { id: 2, name: 'bob' },
          ],
        },
      ]);

      const childRows = [
        { id: 100, user_id: 1, title: 'a' },
        { id: 101, user_id: 2, title: 'b' },
        { id: 102, user_id: 99, title: 'orphan' },
      ] as Record<string, unknown>[];

      await loadRelations(
        exec,
        childRows,
        { author: belongsTo(users, { foreignKey: 'user_id' }) },
        { author: true }
      );

      expect((childRows[0] as any).author).toMatchObject({ name: 'alice' });
      expect((childRows[1] as any).author).toMatchObject({ name: 'bob' });
      expect((childRows[2] as any).author).toBeNull();
    });
  });

  describe('belongsToMany', () => {
    it('joins through the link table and groups by source key', async () => {
      const exec = makeExecutor([
        {
          rows: [
            { id: 10, name: 'red', __source_key: 1 },
            { id: 11, name: 'blue', __source_key: 1 },
            { id: 10, name: 'red', __source_key: 2 },
          ],
        },
      ]);

      const parents = [
        { id: 1, title: 'p1' },
        { id: 2, title: 'p2' },
      ] as Record<string, unknown>[];

      await loadRelations(
        exec,
        parents,
        {
          tags: belongsToMany(tags, {
            through: postTags,
            sourceKey: 'post_id',
            targetKey: 'tag_id',
          }),
        },
        { tags: true }
      );

      expect(exec.calls[0].sql).toContain('FROM "post_tags" j');
      expect(exec.calls[0].sql).toContain('INNER JOIN "tags" t');
      expect((parents[0] as any).tags).toHaveLength(2);
      expect((parents[1] as any).tags).toHaveLength(1);
      // __source_key should be stripped from the result
      expect((parents[0] as any).tags[0]).not.toHaveProperty('__source_key');
    });

    it('accepts a string through-table name', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        {
          tags: belongsToMany(tags, {
            through: 'post_tags',
            sourceKey: 'post_id',
            targetKey: 'tag_id',
          }),
        },
        { tags: true }
      );
      expect(exec.calls[0].sql).toContain('FROM "post_tags" j');
    });
  });

  describe('soft-delete-aware targets', () => {
    it('hasMany with softDeletable() appends `IS NULL` filter', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        { posts: hasMany(softDeletable(posts), { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect(exec.calls[0].sql).toContain('WHERE "user_id" IN ($1)');
      expect(exec.calls[0].sql).toContain('AND "deleted_at" IS NULL');
    });

    it('belongsTo with softDeletable() filters parents too', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ user_id: 1 }],
        { author: belongsTo(softDeletable(users), { foreignKey: 'user_id' }) },
        { author: true }
      );

      expect(exec.calls[0].sql).toContain('AND "deleted_at" IS NULL');
    });

    it('belongsToMany applies the filter to the target side via t.<col>', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        {
          tags: belongsToMany(softDeletable(tags), {
            through: postTags,
            sourceKey: 'post_id',
            targetKey: 'tag_id',
          }),
        },
        { tags: true }
      );

      expect(exec.calls[0].sql).toContain('AND t."deleted_at" IS NULL');
    });

    it('respects a custom soft-delete column', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        {
          posts: hasMany(
            softDeletable(posts, { column: 'archived_at' }),
            { foreignKey: 'user_id' }
          ),
        },
        { posts: true }
      );

      expect(exec.calls[0].sql).toContain('AND "archived_at" IS NULL');
    });

    it('uses `<col> = 0` for boolean-flag soft delete', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        {
          posts: hasMany(
            softDeletable(posts, {
              useBooleanFlag: true,
              booleanColumn: 'is_deleted',
            }),
            { foreignKey: 'user_id' }
          ),
        },
        { posts: true }
      );

      expect(exec.calls[0].sql).toContain('AND "is_deleted" = 0');
    });

    it('skips the filter when includeDeleted is set', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        {
          posts: hasMany(
            softDeletable(posts, { includeDeleted: true }),
            { foreignKey: 'user_id' }
          ),
        },
        { posts: true }
      );

      expect(exec.calls[0].sql).not.toContain('deleted');
    });

    it('plain TableDef (no wrapper) has no filter', async () => {
      const exec = makeExecutor([{ rows: [] }]);
      await loadRelations(
        exec,
        [{ id: 1 }],
        { posts: hasMany(posts, { foreignKey: 'user_id' }) },
        { posts: true }
      );

      expect(exec.calls[0].sql).not.toContain('deleted');
    });
  });

  it('loads multiple relations in a single call', async () => {
    const exec = makeExecutor([
      // posts response
      { rows: [{ id: 1, user_id: 1, title: 'p' }] },
      // profile response
      { rows: [{ id: 9, user_id: 1, bio: 'b' }] },
    ]);

    const parents = [{ id: 1 }] as Record<string, unknown>[];

    await loadRelations(
      exec,
      parents,
      {
        posts: hasMany(posts, { foreignKey: 'user_id' }),
        profile: hasOne(profiles, { foreignKey: 'user_id' }),
      },
      { posts: true, profile: true }
    );

    expect(exec.calls).toHaveLength(2);
    expect((parents[0] as any).posts).toHaveLength(1);
    expect((parents[0] as any).profile).toMatchObject({ bio: 'b' });
  });
});
