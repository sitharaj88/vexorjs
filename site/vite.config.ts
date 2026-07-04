import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/vexorjs/',
  build: {
    // Deployed by .github/workflows/docs.yml (GitHub Pages, Actions mode);
    // the build output is not committed to the repository
    outDir: 'dist',
  },
});
