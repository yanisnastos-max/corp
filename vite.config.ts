import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages base: matches repo name yanisnastos-max/corp
  base: '/corp/',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    open: true,
  },
});
