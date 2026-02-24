import CodeBlock from '../../components/CodeBlock';

const relationsCode = `import { table, column, relations, one, many } from '@vexorjs/orm';

// Users table
const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
});

// Posts table
const posts = table('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  authorId: column.integer().notNull().references(() => users.id),
});

// Comments table
const comments = table('comments', {
  id: column.serial().primaryKey(),
  content: column.text().notNull(),
  postId: column.integer().notNull().references(() => posts.id),
  authorId: column.integer().notNull().references(() => users.id),
});

// Define relations
const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts, {
    fields: [users.id],
    references: [posts.authorId],
  }),
  comments: many(comments, {
    fields: [users.id],
    references: [comments.authorId],
  }),
}));

const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments, {
    fields: [posts.id],
    references: [comments.postId],
  }),
}));`;

const eagerLoadingCode = `// Load user with their posts
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: true,
  },
});
// Result: { id, name, posts: [{ id, title, authorId }] }

// Load post with author and comments
const postWithDetails = await db.query.posts.findFirst({
  where: eq(posts.id, 1),
  with: {
    author: true,
    comments: {
      with: {
        author: true,
      },
    },
  },
});

// Nested loading with filters
const user = await db.query.users.findFirst({
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: [desc(posts.createdAt)],
      limit: 5,
    },
  },
});`;

const manyToManyCode = `// Junction table for many-to-many
const postsTags = table('posts_tags', {
  postId: column.integer().notNull().references(() => posts.id),
  tagId: column.integer().notNull().references(() => tags.id),
}, (t) => ({
  pk: t.primaryKey(t.postId, t.tagId),
}));

const tags = table('tags', {
  id: column.serial().primaryKey(),
  name: column.varchar(100).notNull(),
});

// Define relations through junction
const postsRelations = relations(posts, ({ many }) => ({
  postsTags: many(postsTags),
}));

const tagsRelations = relations(tags, ({ many }) => ({
  postsTags: many(postsTags),
}));

const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id],
  }),
}));

// Query posts with tags
const postWithTags = await db.query.posts.findFirst({
  with: {
    postsTags: {
      with: {
        tag: true,
      },
    },
  },
});`;

export default function OrmRelations() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="relations" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Relations
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Define relationships between tables and query related data efficiently.
        </p>
      </div>

      <section>
        <h2 id="defining" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Defining Relations
        </h2>
        <CodeBlock code={relationsCode} showLineNumbers />
      </section>

      <section>
        <h2 id="eager-loading" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Eager Loading
        </h2>
        <CodeBlock code={eagerLoadingCode} showLineNumbers />
      </section>

      <section>
        <h2 id="many-to-many" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Many-to-Many Relations
        </h2>
        <CodeBlock code={manyToManyCode} showLineNumbers />
      </section>
    </div>
  );
}
