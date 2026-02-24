import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/drivers/postgres.ts',
    'src/drivers/sqlite.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
  splitting: true,
  treeshake: true,
});
