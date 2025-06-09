import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tex-loader',
      transform(code, id) {
        if (id.endsWith('.tex')) {
          return {
            code: `export default ${JSON.stringify(code)}`,
            map: null
          };
        }
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Use esbuild for minification instead of terser
    minify: 'esbuild',
    // Disable source maps in production
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Use a simpler build strategy
    target: 'esnext',
    // Disable code splitting for better compatibility
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    // Force esbuild to handle dependencies
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // Use esbuild for faster builds
  esbuild: {
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
