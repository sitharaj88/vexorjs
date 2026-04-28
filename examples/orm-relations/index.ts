/**
 * ORM Relations Example
 *
 * Demonstrates eager loading of hasMany / belongsTo / belongsToMany
 * relations against an in-memory SQLite database.
 *
 * Run with: npx tsx examples/orm-relations/index.ts
 */

import {
  connect,
  table,
  column,
  hasMany,
  belongsTo,
  belongsToMany,
} from '@vexorjs/orm';

// ---------------------------------------------------------------------------
// Schema
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

const tags = table('tags', {
  id: column.integer().primaryKey(),
  name: column.text().notNull(),
});

const postTags = table('post_tags', {
  post_id: column.integer().notNull(),
  tag_id: column.integer().notNull(),
});

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

async function main() {
  const db = await connect({ driver: 'sqlite', filename: ':memory:' });

  // Create schema
  await db.createTable(users);
  await db.createTable(posts);
  await db.createTable(tags);
  await db.createTable(postTags);

  // Seed data
  await db.query('INSERT INTO users (id, name) VALUES (?, ?), (?, ?)', [
    1, 'Alice',
    2, 'Bob',
  ]);
  await db.query(
    'INSERT INTO posts (id, user_id, title) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
    [1, 1, 'Hello', 2, 1, 'World', 3, 2, 'From Bob']
  );
  await db.query('INSERT INTO tags (id, name) VALUES (?, ?), (?, ?)', [
    100, 'feature',
    101, 'bug',
  ]);
  await db.query(
    'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?), (?, ?), (?, ?)',
    [1, 100, 1, 101, 2, 100]
  );

  // 1. hasMany: load each user with their posts (one IN-query, not N+1)
  const usersWithPosts = await db.execute<{ id: number; name: string }>(
    'SELECT * FROM users'
  );
  await db.loadRelations(
    usersWithPosts,
    { posts: hasMany(posts, { foreignKey: 'user_id' }) },
    { posts: true }
  );
  console.log('users + posts:', JSON.stringify(usersWithPosts, null, 2));

  // 2. belongsTo: each post with its author
  const postsWithAuthor = await db.execute<{ id: number; user_id: number }>(
    'SELECT * FROM posts'
  );
  await db.loadRelations(
    postsWithAuthor,
    { author: belongsTo(users, { foreignKey: 'user_id' }) },
    { author: true }
  );
  console.log('posts + author:', JSON.stringify(postsWithAuthor, null, 2));

  // 3. belongsToMany: each post with its tags through the join table
  const postsWithTags = await db.execute<{ id: number; title: string }>(
    'SELECT * FROM posts'
  );
  await db.loadRelations(
    postsWithTags,
    {
      tags: belongsToMany(tags, {
        through: postTags,
        sourceKey: 'post_id',
        targetKey: 'tag_id',
      }),
    },
    { tags: true }
  );
  console.log('posts + tags:', JSON.stringify(postsWithTags, null, 2));

  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
