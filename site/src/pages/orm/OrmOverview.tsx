import { Link } from 'react-router-dom';
import { ArrowRight, Database, Zap, Shield, GitBranch } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';

const quickStartCode = `import { table, column, createConnection, eq } from '@vexorjs/orm';

// Define your schema
const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  createdAt: column.timestamp().defaultNow(),
});

// Connect to database
const db = await createConnection({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL,
});

// Query with full type inference
const allUsers = await db.select().from(users);

const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 1))
  .first();

// Insert
const newUser = await db
  .insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();

// Update
await db
  .update(users)
  .set({ name: 'Jane' })
  .where(eq(users.id, 1));

// Delete
await db
  .delete(users)
  .where(eq(users.id, 1));`;

const features = [
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Prepared statement caching, connection pooling, and query plan optimization.',
  },
  {
    icon: Shield,
    title: 'Type-Safe Queries',
    description: 'Full TypeScript inference for tables, columns, and query results.',
  },
  {
    icon: Database,
    title: 'Multi-Database',
    description: 'Support for PostgreSQL, MySQL, and SQLite with a unified API.',
  },
  {
    icon: GitBranch,
    title: 'Migrations',
    description: 'Version-controlled, reversible migrations with automatic generation.',
  },
];

export default function OrmOverview() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="vexor-orm" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Vexor ORM
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A blazing-fast, type-safe ORM designed for modern TypeScript applications.
          Built for performance without sacrificing developer experience.
        </p>
      </div>

      {/* Features */}
      <section>
        <h2 id="features" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="card">
              <feature.icon className="w-8 h-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section>
        <h2 id="quick-start" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Start
        </h2>
        <CodeBlock code={quickStartCode} showLineNumbers />
      </section>

      {/* Database Support */}
      <section>
        <h2 id="databases" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Supported Databases
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Database</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Driver</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">PostgreSQL</td>
                <td className="py-3 px-4"><code className="prose-code">postgres</code></td>
                <td className="py-3 px-4 text-green-500">Full Support</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">MySQL</td>
                <td className="py-3 px-4"><code className="prose-code">mysql</code></td>
                <td className="py-3 px-4 text-green-500">Full Support</td>
              </tr>
              <tr>
                <td className="py-3 px-4">SQLite</td>
                <td className="py-3 px-4"><code className="prose-code">sqlite</code></td>
                <td className="py-3 px-4 text-green-500">Full Support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Learn More
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/orm/schema" className="btn-primary">
            Schema Definition <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/orm/queries" className="btn-secondary">
            Query Builder
          </Link>
          <Link to="/orm/migrations" className="btn-secondary">
            Migrations
          </Link>
        </div>
      </section>
    </div>
  );
}
