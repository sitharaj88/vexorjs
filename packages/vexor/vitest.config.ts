import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
      // Ratchet: raise these as coverage improves, never lower them
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 85,
        statements: 75,
      },
    },
  },
});
