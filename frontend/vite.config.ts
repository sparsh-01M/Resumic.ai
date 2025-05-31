import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable native modules
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu'],
    },
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'],
  },
});
