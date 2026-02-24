import { CodeBlock } from '../components/CodeBlock';
import { Database as DatabaseIcon, Table, Link2 } from 'lucide-react';

const usersSchema = `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const refreshTokensSchema = `CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const productsSchema = `CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const ordersSchema = `CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const orderItemsSchema = `CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const auditLogsSchema = `CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const seedCommand = `# Run the seed script
npm run seed

# This creates sample data:
# - Admin user: admin@example.com / Admin123!
# - Regular user: user@example.com / User1234!
# - Sample products in Electronics and Accessories categories`;

const tables = [
  { name: 'users', description: 'User accounts and authentication data', icon: '👤' },
  { name: 'refresh_tokens', description: 'JWT refresh tokens for session management', icon: '🔑' },
  { name: 'products', description: 'Product catalog with categories and stock', icon: '📦' },
  { name: 'orders', description: 'Customer orders with status tracking', icon: '🛒' },
  { name: 'order_items', description: 'Individual items within orders', icon: '📋' },
  { name: 'audit_logs', description: 'Activity logging for security auditing', icon: '📝' },
];

export function Database() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Database
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        SQLite database schema and data management.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Schema Overview
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.name}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{table.icon}</span>
                <code className="font-semibold text-primary-600 dark:text-primary-400">
                  {table.name}
                </code>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {table.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Entity Relationship */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Relationships
        </h2>
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Link2 className="text-primary-500" size={20} />
              <span className="text-slate-700 dark:text-slate-300">
                <code className="text-primary-600 dark:text-primary-400">users</code>
                {' → '}
                <code className="text-primary-600 dark:text-primary-400">refresh_tokens</code>
                <span className="text-slate-500 ml-2">(1:N)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="text-primary-500" size={20} />
              <span className="text-slate-700 dark:text-slate-300">
                <code className="text-primary-600 dark:text-primary-400">users</code>
                {' → '}
                <code className="text-primary-600 dark:text-primary-400">products</code>
                <span className="text-slate-500 ml-2">(1:N, created_by)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="text-primary-500" size={20} />
              <span className="text-slate-700 dark:text-slate-300">
                <code className="text-primary-600 dark:text-primary-400">users</code>
                {' → '}
                <code className="text-primary-600 dark:text-primary-400">orders</code>
                <span className="text-slate-500 ml-2">(1:N)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="text-primary-500" size={20} />
              <span className="text-slate-700 dark:text-slate-300">
                <code className="text-primary-600 dark:text-primary-400">orders</code>
                {' → '}
                <code className="text-primary-600 dark:text-primary-400">order_items</code>
                <span className="text-slate-500 ml-2">(1:N)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="text-primary-500" size={20} />
              <span className="text-slate-700 dark:text-slate-300">
                <code className="text-primary-600 dark:text-primary-400">products</code>
                {' → '}
                <code className="text-primary-600 dark:text-primary-400">order_items</code>
                <span className="text-slate-500 ml-2">(1:N)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Table Schemas */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Table Schemas
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              users
            </h3>
            <CodeBlock code={usersSchema} language="sql" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              refresh_tokens
            </h3>
            <CodeBlock code={refreshTokensSchema} language="sql" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              products
            </h3>
            <CodeBlock code={productsSchema} language="sql" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              orders
            </h3>
            <CodeBlock code={ordersSchema} language="sql" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              order_items
            </h3>
            <CodeBlock code={orderItemsSchema} language="sql" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Table size={18} className="text-primary-500" />
              audit_logs
            </h3>
            <CodeBlock code={auditLogsSchema} language="sql" />
          </div>
        </div>
      </section>

      {/* Seeding */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Seeding Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Populate the database with sample data for testing.
        </p>
        <CodeBlock code={seedCommand} language="bash" />
      </section>
    </div>
  );
}
