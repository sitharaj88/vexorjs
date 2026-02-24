import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/router/index.ts',
    'src/schema/index.ts',
    'src/middleware/index.ts',
    'src/adapters/index.ts'
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: false,
  target: 'node20',
  outDir: 'dist',
  external: ['bun', 'deno']
});
