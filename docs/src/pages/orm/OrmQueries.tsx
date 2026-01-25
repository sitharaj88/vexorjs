import CodeBlock from '../../components/CodeBlock';

const selectCode = `// Select all columns
const users = await db.select().from(usersTable);

// Select specific columns
const names = await db
  .select({ id: usersTable.id, name: usersTable.name })
  .from(usersTable);

// Get first result
const user = await db.select().from(usersTable).first();

// Get one or throw
const user = await db.select().from(usersTable).firstOrThrow();`;

const whereCode = `import { eq, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull, inArray, between, and, or, not } from 'vexor-orm';

// Equality
db.select().from(users).where(eq(users.id, 1));

// Comparison
db.select().from(users).where(gt(users.age, 18));
db.select().from(users).where(gte(users.age, 18));
db.select().from(users).where(lt(users.age, 65));
db.select().from(users).where(lte(users.age, 65));
db.select().from(users).where(ne(users.status, 'inactive'));

// Pattern matching
db.select().from(users).where(like(users.name, 'John%'));
db.select().from(users).where(ilike(users.name, '%john%')); // case-insensitive

// Null checks
db.select().from(users).where(isNull(users.deletedAt));
db.select().from(users).where(isNotNull(users.email));

// In array
db.select().from(users).where(inArray(users.role, ['admin', 'moderator']));

// Between
db.select().from(users).where(between(users.age, 18, 65));

// Combine with AND/OR
db.select().from(users).where(
  and(
    eq(users.active, true),
    or(
      eq(users.role, 'admin'),
      gt(users.age, 18)
    )
  )
);`;

const orderLimitCode = `// Order by
db.select().from(users).orderBy(users.createdAt, 'desc');
db.select().from(users).orderBy(users.name, 'asc');

// Multiple order by
db.select().from(users)
  .orderBy(users.role, 'asc')
  .orderBy(users.name, 'asc');

// Limit and offset
db.select().from(users).limit(10);
db.select().from(users).limit(10).offset(20);`;

const insertCode = `// Insert single row
const user = await db
  .insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();

// Insert multiple rows
const newUsers = await db
  .insert(users)
  .values([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ])
  .returning();

// Insert with ON CONFLICT (upsert)
await db
  .insert(users)
  .values({ id: 1, name: 'John', email: 'john@example.com' })
  .onConflict('email')
  .doUpdate({ name: 'John Updated' });`;

const updateCode = `// Update with WHERE
await db
  .update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1));

// Update multiple columns
await db
  .update(users)
  .set({
    name: 'Jane',
    updatedAt: new Date(),
  })
  .where(eq(users.id, 1));

// Update with returning
const updated = await db
  .update(users)
  .set({ active: false })
  .where(eq(users.id, 1))
  .returning();`;

const deleteCode = `// Delete with WHERE
await db
  .delete(users)
  .where(eq(users.id, 1));

// Delete with returning
const deleted = await db
  .delete(users)
  .where(eq(users.status, 'inactive'))
  .returning();`;

const joinCode = `// Inner join
const results = await db
  .select({
    user: users,
    post: posts,
  })
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId));

// Left join
const results = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// Multiple joins
const results = await db
  .select()
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .innerJoin(categories, eq(posts.categoryId, categories.id));`;

const transactionCode = `// Basic transaction
await db.transaction(async (tx) => {
  const user = await tx
    .insert(users)
    .values({ name: 'John', email: 'john@example.com' })
    .returning();

  await tx
    .insert(posts)
    .values({ title: 'My Post', authorId: user.id });
});

// Transaction with rollback
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ name: 'John', email: 'john@example.com' });

    // This will rollback the entire transaction
    throw new Error('Something went wrong');
  });
} catch (error) {
  console.log('Transaction rolled back');
}`;

export default function OrmQueries() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="queries" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Query Builder
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Build type-safe SQL queries with a fluent API.
        </p>
      </div>

      <section>
        <h2 id="select" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          SELECT Queries
        </h2>
        <CodeBlock code={selectCode} />
      </section>

      <section>
        <h2 id="where" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          WHERE Clauses
        </h2>
        <CodeBlock code={whereCode} showLineNumbers />
      </section>

      <section>
        <h2 id="order-limit" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          ORDER BY, LIMIT, OFFSET
        </h2>
        <CodeBlock code={orderLimitCode} />
      </section>

      <section>
        <h2 id="insert" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          INSERT Queries
        </h2>
        <CodeBlock code={insertCode} />
      </section>

      <section>
        <h2 id="update" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          UPDATE Queries
        </h2>
        <CodeBlock code={updateCode} />
      </section>

      <section>
        <h2 id="delete" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          DELETE Queries
        </h2>
        <CodeBlock code={deleteCode} />
      </section>

      <section>
        <h2 id="joins" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          JOINs
        </h2>
        <CodeBlock code={joinCode} />
      </section>

      <section>
        <h2 id="transactions" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Transactions
        </h2>
        <CodeBlock code={transactionCode} />
      </section>
    </div>
  );
}
