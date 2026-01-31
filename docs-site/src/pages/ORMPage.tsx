import CodeBlock from '../components/CodeBlock';

const connectionCode = `import { Database, PostgresDriver } from '@vexorjs/orm';

// Create database connection
const db = new Database({
  driver: new PostgresDriver({
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password',
    // Connection pool settings
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMs: 30000
    }
  })
});

// Connect to database
await db.connect();

// Use in your app
app.decorate('db', db);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  process.exit(0);
});`;

const schemaCode = `import { defineTable, column, sql } from '@vexorjs/orm';

// Define users table
export const users = defineTable('users', {
  id: column.serial().primaryKey(),
  email: column.varchar(255).unique().notNull(),
  name: column.varchar(100).notNull(),
  password: column.varchar(255).notNull(),
  role: column.enum('role', ['admin', 'user', 'guest']).default('user'),
  isActive: column.boolean().default(true),
  metadata: column.jsonb<{ preferences: Record<string, unknown> }>(),
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp().defaultNow()
});

// Define posts table with foreign key
export const posts = defineTable('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  content: column.text(),
  slug: column.varchar(255).unique().notNull(),
  authorId: column.integer().references(() => users.id).notNull(),
  publishedAt: column.timestamp().nullable(),
  views: column.integer().default(0),
  tags: column.array(column.varchar(50)),
  createdAt: column.timestamp().defaultNow()
});

// Define comments table
export const comments = defineTable('comments', {
  id: column.serial().primaryKey(),
  content: column.text().notNull(),
  postId: column.integer().references(() => posts.id).notNull(),
  authorId: column.integer().references(() => users.id).notNull(),
  createdAt: column.timestamp().defaultNow()
});`;

const selectCode = `import { eq, and, or, like, gt, lt, isNull, inArray, desc, asc } from '@vexorjs/orm';

// Basic select
const allUsers = await db.select().from(users);

// Select specific columns
const userNames = await db.select({
  id: users.id,
  name: users.name,
  email: users.email
}).from(users);

// Where conditions
const activeAdmins = await db.select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    eq(users.isActive, true)
  ));

// Complex conditions
const filteredUsers = await db.select()
  .from(users)
  .where(or(
    eq(users.role, 'admin'),
    and(
      eq(users.role, 'user'),
      gt(users.createdAt, new Date('2024-01-01'))
    )
  ));

// Pattern matching
const searchResults = await db.select()
  .from(users)
  .where(like(users.email, '%@example.com'));

// NULL checks
const unverified = await db.select()
  .from(users)
  .where(isNull(users.verifiedAt));

// IN clause
const specificUsers = await db.select()
  .from(users)
  .where(inArray(users.id, [1, 2, 3, 4, 5]));

// Ordering
const sortedUsers = await db.select()
  .from(users)
  .orderBy(desc(users.createdAt), asc(users.name));

// Pagination
const page = await db.select()
  .from(users)
  .limit(10)
  .offset(20);

// Get first result
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1))
  .first();`;

const joinCode = `// Inner join
const postsWithAuthors = await db.select({
  postId: posts.id,
  postTitle: posts.title,
  authorName: users.name,
  authorEmail: users.email
})
.from(posts)
.innerJoin(users, eq(posts.authorId, users.id));

// Left join
const usersWithPosts = await db.select({
  userId: users.id,
  userName: users.name,
  postCount: sql\`COUNT(\${posts.id})\`
})
.from(users)
.leftJoin(posts, eq(users.id, posts.authorId))
.groupBy(users.id, users.name);

// Multiple joins
const commentsWithDetails = await db.select({
  commentId: comments.id,
  content: comments.content,
  postTitle: posts.title,
  authorName: users.name
})
.from(comments)
.innerJoin(posts, eq(comments.postId, posts.id))
.innerJoin(users, eq(comments.authorId, users.id))
.orderBy(desc(comments.createdAt));`;

const insertCode = `// Insert single record
const newUser = await db.insert(users)
  .values({
    email: 'john@example.com',
    name: 'John Doe',
    password: hashedPassword
  })
  .returning();

// Insert multiple records
const newUsers = await db.insert(users)
  .values([
    { email: 'alice@example.com', name: 'Alice', password: hash1 },
    { email: 'bob@example.com', name: 'Bob', password: hash2 }
  ])
  .returning();

// Insert with conflict handling (upsert)
const upserted = await db.insert(users)
  .values({
    email: 'john@example.com',
    name: 'John Updated',
    password: newHash
  })
  .onConflict('email')
  .doUpdate({
    name: 'John Updated',
    updatedAt: new Date()
  })
  .returning();

// Insert with returning specific columns
const userId = await db.insert(users)
  .values({ email: 'new@example.com', name: 'New User', password: hash })
  .returning({ id: users.id });`;

const updateCode = `// Update single record
await db.update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, 1));

// Update with returning
const updated = await db.update(users)
  .set({ isActive: false })
  .where(eq(users.email, 'john@example.com'))
  .returning();

// Increment/decrement
await db.update(posts)
  .set({ views: sql\`\${posts.views} + 1\` })
  .where(eq(posts.id, 1));

// Conditional update
await db.update(users)
  .set({
    role: 'admin',
    updatedAt: new Date()
  })
  .where(and(
    eq(users.role, 'user'),
    gt(users.createdAt, new Date('2023-01-01'))
  ));`;

const deleteCode = `// Delete single record
await db.delete(users)
  .where(eq(users.id, 1));

// Delete with returning
const deleted = await db.delete(users)
  .where(eq(users.email, 'old@example.com'))
  .returning();

// Delete multiple
await db.delete(posts)
  .where(and(
    eq(posts.authorId, 1),
    isNull(posts.publishedAt)
  ));

// Delete all (use with caution!)
await db.delete(sessions)
  .where(lt(sessions.expiresAt, new Date()));`;

const transactionCode = `// Basic transaction
await db.transaction(async (tx) => {
  // All operations use the transaction connection
  const user = await tx.insert(users)
    .values({ email: 'new@example.com', name: 'New User', password: hash })
    .returning();

  await tx.insert(posts)
    .values({
      title: 'First Post',
      content: 'Hello!',
      slug: 'first-post',
      authorId: user[0].id
    });

  // If any operation fails, everything is rolled back
});

// Transaction with isolation level
await db.transaction(async (tx) => {
  // Serializable isolation for strict consistency
  const balance = await tx.select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, 1))
    .first();

  if (balance && balance.balance >= amount) {
    await tx.update(accounts)
      .set({ balance: sql\`\${accounts.balance} - \${amount}\` })
      .where(eq(accounts.id, 1));

    await tx.update(accounts)
      .set({ balance: sql\`\${accounts.balance} + \${amount}\` })
      .where(eq(accounts.id, 2));
  }
}, { isolationLevel: 'serializable' });

// Nested savepoints
await db.transaction(async (tx) => {
  await tx.insert(users).values(userData);

  try {
    await tx.savepoint(async (sp) => {
      await sp.insert(posts).values(postData);
      // This might fail, but won't rollback the user insert
    });
  } catch (e) {
    console.log('Post insert failed, but user was created');
  }
});`;

const migrationCode = `// migrations/001_create_users.ts
import { Migration } from '@vexorjs/orm';

export const migration: Migration = {
  name: '001_create_users',

  async up(db) {
    await db.schema.createTable('users', (table) => {
      table.serial('id').primaryKey();
      table.varchar('email', 255).unique().notNull();
      table.varchar('name', 100).notNull();
      table.varchar('password', 255).notNull();
      table.enum('role', ['admin', 'user', 'guest']).default('user');
      table.boolean('is_active').default(true);
      table.jsonb('metadata');
      table.timestamp('created_at').defaultNow();
      table.timestamp('updated_at').defaultNow();
    });

    // Create index
    await db.schema.createIndex('users', 'idx_users_email', ['email']);
  },

  async down(db) {
    await db.schema.dropTable('users');
  }
};`;

const migrationCliCode = `# Run all pending migrations
npx vexor db:migrate

# Rollback last migration
npx vexor db:rollback

# Rollback all migrations
npx vexor db:rollback --all

# Check migration status
npx vexor db:status

# Generate new migration
npx vexor db:generate create_posts`;

export default function ORMPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Vexor ORM</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A blazing-fast, type-safe ORM designed for modern TypeScript applications.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x26A1;</div>
          <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">High Performance</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Prepared statements, connection pooling, and query optimization</p>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x1F512;</div>
          <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Type Safe</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Full TypeScript inference from schema to query results</p>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x1F4BE;</div>
          <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Multi-Database</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">PostgreSQL, MySQL, and SQLite support</p>
        </div>
      </div>

      {/* Connection */}
      <section id="connection">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Database Connection</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Connect to your database with built-in connection pooling and health checks.
        </p>
        <CodeBlock code={connectionCode} filename="db.ts" showLineNumbers />
      </section>

      {/* Schema */}
      <section id="schema">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Schema Definition</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define your tables with full type inference. Column types are automatically inferred.
        </p>
        <CodeBlock code={schemaCode} filename="schema.ts" showLineNumbers />

        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Column Types</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 px-4">Method</th>
                <th className="text-left py-2 px-4">SQL Type</th>
                <th className="text-left py-2 px-4">TypeScript Type</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>serial()</code></td>
                <td className="py-2 px-4">SERIAL</td>
                <td className="py-2 px-4">number</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>integer()</code></td>
                <td className="py-2 px-4">INTEGER</td>
                <td className="py-2 px-4">number</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>bigint()</code></td>
                <td className="py-2 px-4">BIGINT</td>
                <td className="py-2 px-4">bigint</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>varchar(n)</code></td>
                <td className="py-2 px-4">VARCHAR(n)</td>
                <td className="py-2 px-4">string</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>text()</code></td>
                <td className="py-2 px-4">TEXT</td>
                <td className="py-2 px-4">string</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>boolean()</code></td>
                <td className="py-2 px-4">BOOLEAN</td>
                <td className="py-2 px-4">boolean</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>timestamp()</code></td>
                <td className="py-2 px-4">TIMESTAMP</td>
                <td className="py-2 px-4">Date</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 px-4"><code>jsonb&lt;T&gt;()</code></td>
                <td className="py-2 px-4">JSONB</td>
                <td className="py-2 px-4">T</td>
              </tr>
              <tr>
                <td className="py-2 px-4"><code>array(type)</code></td>
                <td className="py-2 px-4">type[]</td>
                <td className="py-2 px-4">Type[]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SELECT */}
      <section id="select">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">SELECT Queries</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Build type-safe SELECT queries with filtering, sorting, and pagination.
        </p>
        <CodeBlock code={selectCode} filename="queries.ts" showLineNumbers />
      </section>

      {/* JOINs */}
      <section id="joins">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">JOIN Queries</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Combine data from multiple tables with type-safe joins.
        </p>
        <CodeBlock code={joinCode} filename="joins.ts" showLineNumbers />
      </section>

      {/* INSERT */}
      <section id="insert">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">INSERT Operations</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Insert single or multiple records with conflict handling.
        </p>
        <CodeBlock code={insertCode} filename="insert.ts" showLineNumbers />
      </section>

      {/* UPDATE */}
      <section id="update">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">UPDATE Operations</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Update records with type-safe conditions and expressions.
        </p>
        <CodeBlock code={updateCode} filename="update.ts" showLineNumbers />
      </section>

      {/* DELETE */}
      <section id="delete">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">DELETE Operations</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Delete records with safe conditions.
        </p>
        <CodeBlock code={deleteCode} filename="delete.ts" showLineNumbers />
      </section>

      {/* Transactions */}
      <section id="transactions">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Transactions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Execute multiple operations atomically with full ACID compliance.
        </p>
        <CodeBlock code={transactionCode} filename="transactions.ts" showLineNumbers />

        <div className="mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-vexor-400">Automatic Rollback:</strong> If any operation throws an error,
            the entire transaction is automatically rolled back. No manual cleanup required.
          </p>
        </div>
      </section>

      {/* Migrations */}
      <section id="migrations">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Migrations</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Version-controlled database schema changes with up/down migrations.
        </p>
        <CodeBlock code={migrationCode} filename="migrations/001_create_users.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Migration CLI</h3>
          <CodeBlock code={migrationCliCode} language="bash" />
        </div>
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/vexorjs/docs/middleware" className="block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Middleware &rarr;</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Add authentication, caching, and more with built-in middleware</p>
          </a>
          <a href="/vexorjs/docs/realtime" className="block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Real-time &rarr;</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Build WebSocket and SSE applications</p>
          </a>
        </div>
      </section>
    </div>
  );
}
