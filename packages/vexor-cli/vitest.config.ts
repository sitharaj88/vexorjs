import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Module imports and fs-heavy command tests can exceed the default 5s
    // when many suites run in parallel (turbo runs all packages at once)
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
