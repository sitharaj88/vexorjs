import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { table, column, softDeletable } from '@vexorjs/orm';

// Define a table with soft delete support
const usersTable = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp(),
});

// Add soft delete capabilities to the table
const users = softDeletable(usersTable);

// Now soft delete a user instead of permanently removing them
await users.softDelete(db, { where: eq(users.id, 42) });

// The record still exists in the database with a deleted_at timestamp
// But it is excluded from normal queries by default
const activeUsers = await db.select().from(users);
// Only returns users where deleted_at IS NULL`;

const queryingTrashedCode = `import { eq } from '@vexorjs/orm';

// Normal query - soft-deleted records are excluded
const activeUsers = await db.select().from(users);

// Include soft-deleted records in results
const allUsers = await users.withTrashed(db)
  .select()
  .from(users);

// Only return soft-deleted records
const deletedUsers = await users.onlyTrashed(db)
  .select()
  .from(users);

// Combine with other filters
const trashedAdmins = await users.onlyTrashed(db)
  .select()
  .from(users)
  .where(eq(users.role, 'admin'));`;

const restoreCode = `// Restore a single soft-deleted record
await users.restore(db, { where: eq(users.id, 42) });
// Sets deleted_at back to NULL

// Restore multiple records
await users.restore(db, { where: eq(users.role, 'user') });

// Check if a record is soft-deleted before restoring
const user = await users.withTrashed(db)
  .select()
  .from(users)
  .where(eq(users.id, 42))
  .first();

if (user?.deletedAt) {
  await users.restore(db, { where: eq(users.id, 42) });
  console.log('User restored successfully');
}`;

const forceDeleteCode = `// Permanently delete a record (bypasses soft delete)
await users.forceDelete(db, { where: eq(users.id, 42) });

// This is equivalent to a standard DELETE query
// The record is permanently removed from the database

// Force delete all records that were soft-deleted over 30 days ago
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

await users.forceDelete(db, {
  where: lt(users.deletedAt, thirtyDaysAgo),
});`;

const booleanFlagCode = `import { table, column, softDeletable } from '@vexorjs/orm';

// Some databases or schemas prefer a boolean flag instead of a timestamp
const postsTable = table('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  content: column.text(),
  isDeleted: column.boolean().default(false),
  createdAt: column.timestamp().defaultNow(),
});

// Use boolean flag mode
const posts = softDeletable(postsTable, {
  useBooleanFlag: true,
  booleanColumn: 'isDeleted',
});

// Soft delete sets is_deleted = true
await posts.softDelete(db, { where: eq(posts.id, 1) });

// Restore sets is_deleted = false
await posts.restore(db, { where: eq(posts.id, 1) });

// Normal queries filter where is_deleted = false
const activePosts = await db.select().from(posts);`;

const migrationCode = `import { Migration } from '@vexorjs/orm';

// Migration to add soft delete column to an existing table
export const migration: Migration = {
  name: '20240220100000_add_soft_deletes_to_users',

  async up(db) {
    await db.schema.alterTable('users', (table) => {
      table.addColumn('deleted_at', 'timestamp').nullable();
    });

    // Add index for efficient filtering
    await db.schema.createIndex('users', 'deleted_at');
  },

  async down(db) {
    await db.schema.dropIndex('users', 'users_deleted_at_idx');
    await db.schema.alterTable('users', (table) => {
      table.dropColumn('deleted_at');
    });
  },
};

// For boolean flag mode
export const booleanMigration: Migration = {
  name: '20240220100001_add_soft_deletes_boolean',

  async up(db) {
    await db.schema.alterTable('posts', (table) => {
      table.addColumn('is_deleted', 'boolean').default(false).notNull();
    });

    await db.schema.createIndex('posts', 'is_deleted');
  },

  async down(db) {
    await db.schema.dropIndex('posts', 'posts_is_deleted_idx');
    await db.schema.alterTable('posts', (table) => {
      table.dropColumn('is_deleted');
    });
  },
};`;

const customColumnCode = `import { softDeletable } from '@vexorjs/orm';

// Use a custom column name for the deletion timestamp
const users = softDeletable(usersTable, {
  column: 'removed_at',
});

// Include soft-deleted records globally for admin dashboards
const adminUsers = softDeletable(usersTable, {
  column: 'deleted_at',
  includeDeleted: true,  // Queries include deleted records by default
});`;

export default function OrmSoftDeletes() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="soft-deletes" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Soft Deletes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          In most applications, deleting data permanently is a surprisingly dangerous operation. A user accidentally deletes their account, an administrator removes a record by mistake, or a cascading delete wipes out related data across multiple tables. With a physical <code className="prose-code">DELETE</code> statement, the rows are gone immediately and irreversibly. The only recovery path is restoring from a backup, which is slow, error-prone, and often impractical for single-record recovery.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Soft deletes solve this problem by replacing physical deletion with a logical marker. Instead of removing a row from the database, the operation sets a timestamp or flag column that indicates the record has been "deleted." The row remains in the table, fully intact, but is automatically filtered out of normal queries. From the perspective of your application code, the record behaves as if it has been deleted. But under the hood, it is still there, ready to be restored, audited, or permanently purged at a later time.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          This pattern is essential for applications that require audit trails, regulatory compliance, or data recovery capabilities. Financial systems must retain transaction records for years. Healthcare applications cannot permanently destroy patient data without explicit authorization. Even consumer applications benefit from soft deletes by offering users an "undo" window or a "trash" folder that holds recently deleted items before final removal.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The Vexor ORM provides first-class support for soft deletes through the <code className="prose-code">softDeletable()</code> wrapper. This function decorates a table definition with automatic query scoping, deletion, restoration, and force-delete capabilities. It supports both timestamp-based and boolean-flag modes, and it integrates transparently with the query builder so that you do not need to remember to add <code className="prose-code">WHERE deleted_at IS NULL</code> to every query you write.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you wrap a table definition with <code className="prose-code">softDeletable()</code>, Vexor intercepts the query builder pipeline for that table and injects a default filter condition. In timestamp mode (the default), this filter is <code className="prose-code">WHERE deleted_at IS NULL</code>. In boolean flag mode, it is <code className="prose-code">WHERE is_deleted = false</code>. This injection happens at the query builder level, not at the database level, meaning it is applied before the SQL is generated and has no runtime overhead beyond the additional WHERE clause.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The soft delete operation itself is an <code className="prose-code">UPDATE</code> statement, not a <code className="prose-code">DELETE</code>. When you call <code className="prose-code">users.softDelete(db, {'{ where: ... }'})</code>, Vexor generates <code className="prose-code">UPDATE users SET deleted_at = NOW() WHERE ...</code>. The record stays in place with all its columns intact. Because it is an update, it fires update triggers rather than delete triggers, and foreign key <code className="prose-code">ON DELETE</code> cascades are not activated. This is an important distinction if your schema relies on cascading deletes for referential integrity.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Query scoping works through three modes. The default scope excludes soft-deleted records from all queries. The <code className="prose-code">withTrashed()</code> scope removes the filter entirely, returning both active and deleted records. The <code className="prose-code">onlyTrashed()</code> scope inverts the filter, returning only records where the deletion marker is set. These scopes compose cleanly with the rest of the query builder, so you can add additional WHERE clauses, JOINs, ORDER BY, and LIMIT on top of any scope.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Restoration reverses the soft delete by clearing the deletion marker. In timestamp mode, <code className="prose-code">restore()</code> sets <code className="prose-code">deleted_at</code> back to <code className="prose-code">NULL</code>. In boolean mode, it sets the flag to <code className="prose-code">false</code>. The record immediately becomes visible in default-scoped queries again. Force deletion bypasses the soft delete mechanism entirely and issues a real <code className="prose-code">DELETE</code> statement, permanently removing the row from the database.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Soft Deletes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Soft deletes are the right choice when you need any of the following: the ability to recover accidentally deleted data, an audit trail that shows when records were removed and by whom, compliance with data retention regulations, or a user-facing "trash" or "archive" feature. They are particularly valuable for core business entities like users, orders, invoices, and documents where data loss has significant consequences.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          However, soft deletes are not appropriate for every table. High-volume transient data like session tokens, temporary upload records, or rate limit counters should be physically deleted to keep table sizes manageable. Soft-deleted records still occupy disk space, consume index entries, and slow down full-table operations. If a table accumulates millions of soft-deleted rows, queries that scan the entire table will degrade because the database must read and filter out dead rows.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The choice between timestamp and boolean mode depends on your requirements. Timestamps record when the deletion happened, which is valuable for audit logs, retention policies ("delete records that were soft-deleted more than 90 days ago"), and debugging. Boolean flags are simpler and use less storage, but they lose the temporal information. If you might ever need to know when a record was deleted, use timestamps. If the only question you need to answer is "is this active or not," a boolean flag suffices.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Be aware of the interaction between soft deletes and unique constraints. If a user soft-deletes their account with the email "alice@example.com," that email still occupies a row in the table. If another user tries to register with the same email, the unique constraint will reject it even though the original account appears deleted. Solutions include partial unique indexes (unique where <code className="prose-code">deleted_at IS NULL</code>), or implementing a cleanup job that force-deletes old soft-deleted records after a retention period.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To enable soft deletes on a table, wrap its definition with <code className="prose-code">softDeletable()</code>. By default, this assumes the table has a nullable <code className="prose-code">deleted_at</code> timestamp column. You do not need to declare this column in your table definition; the wrapper handles it automatically. The returned object exposes the original table's columns plus the soft delete methods: <code className="prose-code">softDelete()</code>, <code className="prose-code">restore()</code>, <code className="prose-code">forceDelete()</code>, <code className="prose-code">withTrashed()</code>, and <code className="prose-code">onlyTrashed()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Once wrapped, all standard queries against the table automatically exclude soft-deleted records. You do not need to modify existing code to respect the soft delete filter. This transparency is one of the primary advantages of the pattern: feature code that queries users, displays lists, or runs aggregations continues to work correctly without any changes.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/schema/users.ts" showLineNumbers />
        <InfoBlock variant="info">
          The <code className="prose-code">softDeletable()</code> wrapper automatically filters out
          deleted records from all standard queries. You do not need to add WHERE clauses manually.
        </InfoBlock>
      </section>

      <section>
        <h2 id="querying-soft-deleted" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Querying Soft-Deleted Records
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While the default scope hides soft-deleted records for safety, there are many scenarios where you need to see them. Admin dashboards often need to display all records regardless of deletion status. Data export tools must include deleted records for compliance. Customer support workflows need to find deleted accounts to restore them. The three query scopes give you precise control over which records are visible.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">withTrashed()</code> scope removes the default filter entirely, making all records visible. This is equivalent to querying the raw table without any soft delete logic. The <code className="prose-code">onlyTrashed()</code> scope inverts the filter, showing only records that have been soft-deleted. This is useful for building a "trash" view where users can browse and restore their deleted items. Both scopes return a query builder instance, so you can chain additional conditions like <code className="prose-code">where()</code>, <code className="prose-code">orderBy()</code>, and <code className="prose-code">limit()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Keep in mind that scopes are per-query, not global. Each individual query starts with the default scope (excluding deleted records) unless you explicitly opt into a different scope. This means you cannot accidentally leak deleted records into user-facing queries by forgetting to reset a global flag.
        </p>
        <CodeBlock code={queryingTrashedCode} filename="src/services/users.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="restoring" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Restoring Records
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          One of the most valuable aspects of soft deletes is the ability to undo a deletion. The <code className="prose-code">restore()</code> method clears the deletion marker, making the record visible in default-scoped queries again. Under the hood, this is an <code className="prose-code">UPDATE</code> statement that sets <code className="prose-code">deleted_at = NULL</code> (or <code className="prose-code">is_deleted = false</code> in boolean mode).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Restoration accepts a WHERE clause, so you can restore individual records by ID or bulk-restore records that match a condition. When restoring in bulk, be careful to verify that the WHERE clause targets the intended records. Restoring too broadly can surface records that were intentionally deleted by administrators.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If your application needs to implement a time-limited undo window (for example, "you can restore deleted items within 30 days"), combine <code className="prose-code">onlyTrashed()</code> with a date filter to show only recently deleted records. You can also implement a scheduled cleanup job that force-deletes records whose <code className="prose-code">deleted_at</code> timestamp exceeds the retention period, making them permanently unrecoverable after the window closes.
        </p>
        <CodeBlock code={restoreCode} filename="src/services/users.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="force-delete" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Force Delete
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Force deletion permanently removes a record from the database using a real SQL <code className="prose-code">DELETE</code> statement. This bypasses the soft delete mechanism entirely and is irreversible. Unlike soft delete, force delete does activate foreign key <code className="prose-code">ON DELETE</code> cascades and fires delete triggers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most common use case for force deletion is implementing a data retention policy. A scheduled background job runs periodically, finds records that were soft-deleted longer ago than the retention period (for example, 30 or 90 days), and permanently removes them. This keeps the table size under control while still giving users and administrators a recovery window.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Force deletion is also necessary for compliance with data erasure regulations such as GDPR's "right to be forgotten." When a user requests permanent deletion of their personal data, soft deletion alone may not satisfy the legal requirement. In these cases, force delete the user record and any associated personal data, then log the erasure event for compliance records.
        </p>
        <CodeBlock code={forceDeleteCode} filename="src/tasks/cleanup.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Force-deleted records cannot be recovered. Consider implementing a scheduled cleanup
          job that purges records older than a retention period rather than force-deleting immediately.
        </InfoBlock>
      </section>

      <section>
        <h2 id="boolean-flag-mode" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Boolean Flag Mode
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          By default, soft deletes use a nullable timestamp column to mark deletions. This records both the fact that a deletion occurred and the exact moment it happened. However, some schemas prefer a simpler boolean flag, especially when the deletion time is not important or when the application already tracks state changes through a separate audit log system.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Boolean flag mode replaces the timestamp column with a boolean column (defaulting to <code className="prose-code">is_deleted</code>). The column defaults to <code className="prose-code">false</code> for active records and is set to <code className="prose-code">true</code> when soft-deleted. The query scoping works identically: default queries filter <code className="prose-code">WHERE is_deleted = false</code>, <code className="prose-code">withTrashed()</code> removes the filter, and <code className="prose-code">onlyTrashed()</code> filters <code className="prose-code">WHERE is_deleted = true</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          One practical advantage of boolean mode is that the column is <code className="prose-code">NOT NULL</code> with a default value, which eliminates null-handling edge cases and can produce slightly more efficient query plans on some database engines. The trade-off is that you lose the deletion timestamp. If you use boolean mode but still need to know when records were deleted, add a separate <code className="prose-code">deleted_at</code> column that you populate manually alongside the soft delete call.
        </p>
        <CodeBlock code={booleanFlagCode} filename="src/schema/posts.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="custom-column" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Custom Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">softDeletable()</code> wrapper accepts an options object that lets you customize the column name and default query behavior. Changing the column name is useful when integrating with an existing database schema that uses a different naming convention, such as <code className="prose-code">removed_at</code> or <code className="prose-code">archived_at</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">includeDeleted</code> option flips the default scope so that queries include soft-deleted records by default. This is the opposite of the standard behavior and is primarily useful for admin-only table definitions where administrators need to see all records without explicitly calling <code className="prose-code">withTrashed()</code> on every query. You can create two wrapped versions of the same table -- one with default scoping for end users and one with <code className="prose-code">includeDeleted: true</code> for admin views.
        </p>
        <CodeBlock code={customColumnCode} />
      </section>

      <section>
        <h2 id="migration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Migration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Adding soft deletes to an existing table requires a migration that creates the deletion marker column. For timestamp mode, add a nullable <code className="prose-code">deleted_at</code> timestamp column. The column must be nullable because active (non-deleted) records will have a <code className="prose-code">NULL</code> value. For boolean mode, add a <code className="prose-code">NOT NULL</code> boolean column with a default of <code className="prose-code">false</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always create an index on the soft delete column. Without an index, every query against the table must perform a full table scan to find records where the deletion marker is not set. On large tables with millions of rows, this can degrade query performance dramatically. A partial index (indexing only non-null values for timestamp mode, or only <code className="prose-code">false</code> values for boolean mode) is even more efficient because it is smaller and covers exactly the rows that default-scoped queries return.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The migration should include a reversible <code className="prose-code">down()</code> method that drops the index and column. Be aware that running the down migration on a table that contains soft-deleted records will lose the deletion state: all records will effectively become "undeleted" because the marker column no longer exists. If this is a concern, ensure that soft-deleted records are either force-deleted or exported before reverting the migration.
        </p>
        <CodeBlock code={migrationCode} filename="migrations/20240220100000_add_soft_deletes.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Adding an index on the <code className="prose-code">deleted_at</code> column significantly
          improves query performance when filtering soft-deleted records, especially on large tables.
        </InfoBlock>
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Implement a data retention policy from the start. Soft-deleted records accumulate over time and can bloat table sizes significantly. A scheduled job that force-deletes records older than your retention period (commonly 30, 60, or 90 days) keeps the table lean and ensures you are not storing data beyond what is operationally necessary or legally required.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle unique constraints carefully. If your table has a unique index on a column like <code className="prose-code">email</code>, soft-deleted records still occupy that unique slot. Consider using partial unique indexes that only enforce uniqueness among active (non-deleted) records. In PostgreSQL, this is <code className="prose-code">CREATE UNIQUE INDEX ON users (email) WHERE deleted_at IS NULL</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Think through cascading soft deletes for related records. If you soft-delete a user, should their posts, comments, and uploads also be soft-deleted? The ORM does not cascade soft deletes automatically because the correct behavior is application-specific. Implement cascading logic explicitly in your service layer or event handlers if your domain requires it.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Test both the soft-deleted and non-soft-deleted code paths. It is common to write queries that work correctly for active records but break when soft-deleted records are reintroduced via <code className="prose-code">withTrashed()</code>. Ensure that your admin views, data exports, and restoration workflows handle the presence of deleted records gracefully.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">column</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'deleted_at'</code></td>
                <td className="py-3 px-4">The name of the nullable timestamp column used to mark soft-deleted records. This column must exist in the database table and should be nullable. When a record is soft-deleted, this column is set to the current timestamp. When restored, it is set back to <code className="prose-code">NULL</code>. Ignored when <code className="prose-code">useBooleanFlag</code> is <code className="prose-code">true</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">includeDeleted</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">When set to <code className="prose-code">true</code>, the default query scope includes soft-deleted records alongside active ones. This effectively makes <code className="prose-code">withTrashed()</code> the default behavior. Useful for admin-facing table definitions where deleted records should always be visible without extra method calls.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">useBooleanFlag</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">Enables boolean flag mode instead of timestamp mode. When <code className="prose-code">true</code>, soft deletes set a boolean column to <code className="prose-code">true</code> rather than recording a timestamp. The default scope filters <code className="prose-code">WHERE is_deleted = false</code> instead of <code className="prose-code">WHERE deleted_at IS NULL</code>. Use this when you do not need to know the deletion time.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">booleanColumn</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'is_deleted'</code></td>
                <td className="py-3 px-4">The name of the boolean column used when <code className="prose-code">useBooleanFlag</code> is <code className="prose-code">true</code>. This column must be a <code className="prose-code">NOT NULL</code> boolean with a default of <code className="prose-code">false</code>. Ignored when <code className="prose-code">useBooleanFlag</code> is <code className="prose-code">false</code> or unset.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/orm/seeders" className="btn-primary">
            Seeders &amp; Factories <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/orm/migrations" className="btn-secondary">
            Migrations
          </Link>
        </div>
      </section>
    </div>
  );
}
