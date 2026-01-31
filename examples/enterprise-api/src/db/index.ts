/**
 * Database Connection and Initialization
 *
 * Uses SQLite for the example (no external database required).
 * Can be easily swapped for PostgreSQL in production.
 */

import { createDatabase } from '@vexorjs/orm';
import { config } from '../config/index.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Ensure data directory exists
const dbPath = config.databaseUrl;
if (!dbPath.includes(':memory:')) {
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Create database connection with SQLite config
// For in-memory databases, use a single connection to avoid multiple separate databases
const isMemoryDb = dbPath === ':memory:';
export const db = createDatabase(
  {
    driver: 'sqlite',
    filename: dbPath,
  },
  {
    logging: config.isDevelopment && !config.isTest,
    // For in-memory databases, use single connection (multiple connections = multiple databases!)
    pool: isMemoryDb ? { min: 1, max: 1 } : undefined,
  }
);

// Track if database has been initialized
let initialized = false;

/**
 * Initialize database with schema
 */
export async function initializeDatabase(): Promise<void> {
  // Prevent re-initialization (important for in-memory databases)
  if (initialized) {
    return;
  }

  await db.connect();
  initialized = true;

  // Create tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_active BOOLEAN NOT NULL DEFAULT 1,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
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
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      total_amount DECIMAL(10, 2) NOT NULL,
      shipping_address TEXT,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100) NOT NULL,
      resource_id VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id)`);

  console.log('Database initialized successfully');
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  await db.close();
  initialized = false;
}

// Re-export schema
export * from './schema.js';
