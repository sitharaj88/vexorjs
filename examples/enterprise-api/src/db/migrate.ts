/**
 * Database Migration Script
 *
 * Initializes the database schema.
 */

import { initializeDatabase, closeDatabase } from './index.js';

async function migrate(): Promise<void> {
  console.log('Running database migrations...');

  try {
    await initializeDatabase();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

migrate();
