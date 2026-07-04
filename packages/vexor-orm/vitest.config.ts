import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    // better-sqlite3 (native) can be slow to initialize when many worker
    // processes start simultaneously; the default 5s is too tight under load
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.ts',
        '**/index.ts',
      ],
      // Ratchet: raise these as coverage improves, never lower them
      thresholds: {
        lines: 82,
        functions: 82,
        branches: 85,
        statements: 82,
      },
    },
  },
});
