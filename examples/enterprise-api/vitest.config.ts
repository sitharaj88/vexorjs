import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Set environment variables BEFORE any code runs
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: ':memory:',
      JWT_SECRET: 'test-secret-key-for-testing-purposes-32ch',
      LOG_LEVEL: 'error',
    },
    // Run files sequentially, one at a time
    fileParallelism: false,
    // Use threads pool with max 1 worker to ensure sequential execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
