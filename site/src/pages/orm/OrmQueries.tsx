import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

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

const whereCode = `import { eq, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull, inArray, between, and, or, not } from '@vexorjs/orm';

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

const aggregateCode = `import { count, countDistinct, sum, avg, min, max } from '@vexorjs/orm';

// COUNT(*) AS total
const row = await db.select(orders)
  .selectRaw<{ total: number }>(count('*', 'total'))
  .first();

// Mix plain columns with aggregates and GROUP BY
const byStatus = await db.select(orders)
  .selectRaw<{ status: string; revenue: number }>('status', sum('amount', 'revenue'))
  .groupBy('status')
  .all();

// Every helper renders "FN(column) AS alias"
count();                         // COUNT(*) AS count
count('*', 'total');             // COUNT(*) AS total
countDistinct('email');          // COUNT(DISTINCT email) AS count
countDistinct('email', 'uniq');  // COUNT(DISTINCT email) AS uniq
sum('amount', 'revenue');        // SUM(amount) AS revenue
avg('price', 'avgPrice');        // AVG(price) AS avgPrice
min('created_at', 'firstSeen');  // MIN(created_at) AS firstSeen
max('created_at', 'lastSeen');   // MAX(created_at) AS lastSeen`;

const paramContextCode = `import { sql } from '@vexorjs/orm';

// Nested sql\`...\` fragments renumber their placeholders
// automatically when composed into a larger fragment
const active = sql\`status = \${'active'}\`;
const recent = sql\`created_at > \${lastWeek}\`;

const combined = sql\`WHERE \${active} AND \${recent}\`;
// => WHERE status = $1 AND created_at > $2
//    values: ['active', lastWeek]

// Building queries concurrently is safe — each query render
// owns its own ParamContext, so placeholder numbering can
// never be corrupted by another in-flight query
await Promise.all([
  db.select().from(users).where(eq(users.status, 'active')),
  db.select().from(orders).where(gt(orders.amount, 100)),
]);`;

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

const savepointCode = `await db.transaction(async (tx) => {
  await tx.execute('INSERT INTO accounts ...');

  const sp = await tx.savepoint();          // returns generated name like sp_1
  try {
    await tx.execute('UPDATE risky ...');
    await tx.releaseSavepoint(sp);          // keep the changes
  } catch {
    await tx.rollbackTo(sp);                // undo just this part, transaction continues
  }

  // The outer transaction is still active either way
  await tx.execute('INSERT INTO audit_log ...');
});

// You can also name savepoints yourself
await db.transaction(async (tx) => {
  await tx.savepoint('before_import');
  try {
    await tx.execute('INSERT INTO imports ...');
  } catch {
    await tx.rollbackTo('before_import');
  }
});`;

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
        <h2 id="aggregates" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Aggregates
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">count</code>, <code className="prose-code">countDistinct</code>,{' '}
          <code className="prose-code">sum</code>, <code className="prose-code">avg</code>,{' '}
          <code className="prose-code">min</code>, and <code className="prose-code">max</code> helpers
          build aggregate expressions like <code className="prose-code">COUNT(*) AS count</code>. Pass
          them to <code className="prose-code">selectRaw</code>, and provide the resulting row shape as
          its type argument to keep results fully typed.
        </p>
        <CodeBlock code={aggregateCode} showLineNumbers />
        <InfoBlock variant="warning" title="Raw expressions">
          <code className="prose-code">selectRaw</code> interpolates its arguments directly into the
          SELECT list. Only pass trusted, static expressions (like the aggregate helpers above) —
          never user input.
        </InfoBlock>
      </section>

      <section>
        <h2 id="placeholder-numbering" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Safe Placeholder Numbering
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each query render uses its own per-query <code className="prose-code">ParamContext</code>{' '}
          instead of shared global state. Placeholder numbers (<code className="prose-code">$1</code>,{' '}
          <code className="prose-code">$2</code>, ...) are assigned when a query is rendered to SQL, so
          building queries concurrently is always safe, and nested{' '}
          <code className="prose-code">sql</code> fragments renumber their placeholders automatically
          when composed into a larger query.
        </p>
        <CodeBlock code={paramContextCode} />
      </section>

      <section>
        <h2 id="transactions" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Transactions
        </h2>
        <CodeBlock code={transactionCode} />
      </section>

      <section>
        <h2 id="savepoints" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Savepoints
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Savepoints let you undo part of a transaction without rolling back the whole thing. They are
          part of the public <code className="prose-code">Transaction</code> interface:{' '}
          <code className="prose-code">savepoint(name?)</code> creates one (returning a generated name
          like <code className="prose-code">sp_1</code> when you don't pass your own),{' '}
          <code className="prose-code">rollbackTo(name)</code> undoes everything since it while keeping
          the transaction active, and <code className="prose-code">releaseSavepoint(name)</code> keeps
          the changes and discards the savepoint.
        </p>
        <CodeBlock code={savepointCode} showLineNumbers />
        <InfoBlock variant="info" title="Driver support">
          Savepoints work on all drivers, including MySQL. Rolling back to a savepoint also discards
          any savepoints created after it.
        </InfoBlock>
      </section>
    </div>
  );
}
