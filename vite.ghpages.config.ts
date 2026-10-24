import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates deterministic single-bundle fallback assets in ./gh-pages-app/
 * so GitHub Pages deployments work immediately even if Pages is pointed at main / (root).
 */
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'gh-pages-app',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((n) => n.endsWith('.css')) || assetInfo.name?.endsWith('.css')) {
            return 'app.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
