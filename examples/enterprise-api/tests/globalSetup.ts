/**
 * Global Test Setup
 *
 * This runs ONCE before all test files, setting up environment variables
 * that need to be available when modules are first loaded.
 */

export default function globalSetup(): void {
  // Set test environment variables BEFORE any modules are loaded
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = ':memory:';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-32ch';
  process.env.LOG_LEVEL = 'error';
}
