/**
 * Test Setup
 *
 * Configures the test environment and provides test utilities.
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Vexor } from '@vexorjs/core';
import { initializeDatabase, closeDatabase, db } from '../src/db/index.js';
import { hashPassword } from '../src/utils/password.js';
import { cors } from '../src/middleware/cors.js';
import { requestLogger } from '../src/middleware/logger.js';
import { errorHandler } from '../src/middleware/error-handler.js';
import { registerAuthRoutes } from '../src/modules/auth/routes.js';
import { registerUserRoutes } from '../src/modules/users/routes.js';
import { registerProductRoutes } from '../src/modules/products/routes.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = ':memory:';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-32ch';
process.env.LOG_LEVEL = 'error';

export let app: Vexor;
export let baseUrl: string;

/**
 * Create test application
 */
export function createTestApp(): Vexor {
  const testApp = new Vexor({ port: 0, logging: false });

  testApp.use(cors());
  testApp.use(requestLogger());

  testApp.get('/health', (ctx) => ctx.json({ status: 'healthy' }));

  registerAuthRoutes(testApp);
  registerUserRoutes(testApp);
  registerProductRoutes(testApp);

  testApp.setErrorHandler(errorHandler);

  return testApp;
}

/**
 * Setup test database with seed data
 */
export async function seedTestData(): Promise<void> {
  // Clear tables
  await db.query('DELETE FROM order_items');
  await db.query('DELETE FROM orders');
  await db.query('DELETE FROM products');
  await db.query('DELETE FROM refresh_tokens');
  await db.query('DELETE FROM audit_logs');
  await db.query('DELETE FROM users');

  // Reset auto-increment
  await db.query("DELETE FROM sqlite_sequence WHERE name IN ('users', 'products', 'orders', 'order_items', 'refresh_tokens', 'audit_logs')");

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  await db.query(
    `INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    ['admin@test.com', adminPassword, 'Test Admin', 'admin']
  );

  // Create regular user
  const userPassword = await hashPassword('User1234!');
  await db.query(
    `INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    ['user@test.com', userPassword, 'Test User', 'user']
  );

  // Create test products
  const products = [
    ['Test Product 1', 'Description 1', 99.99, 100, 'Electronics'],
    ['Test Product 2', 'Description 2', 149.99, 50, 'Electronics'],
    ['Test Product 3', 'Description 3', 29.99, 200, 'Accessories'],
  ];

  for (const [name, description, price, stock, category] of products) {
    await db.query(
      `INSERT INTO products (name, description, price, stock, category, created_by, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))`,
      [name, description, price, stock, category]
    );
  }
}

/**
 * Get auth token for testing
 */
export async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json() as { tokens?: { accessToken?: string } };
  return data.tokens?.accessToken || '';
}

/**
 * Get admin auth token
 */
export async function getAdminToken(): Promise<string> {
  return getAuthToken('admin@test.com', 'Admin123!');
}

/**
 * Get user auth token
 */
export async function getUserToken(): Promise<string> {
  return getAuthToken('user@test.com', 'User1234!');
}

// Global setup
beforeAll(async () => {
  await initializeDatabase();
  app = createTestApp();
  await app.listen(0);
  const addr = app.address();
  baseUrl = `http://localhost:${addr?.port}`;
});

// Reset data before each test
beforeEach(async () => {
  await seedTestData();
});

// Global teardown
afterAll(async () => {
  await app.close();
  await closeDatabase();
});
