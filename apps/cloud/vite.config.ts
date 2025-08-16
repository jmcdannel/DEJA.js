import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@repo': fileURLToPath(new URL('../../packages', import.meta.url)),
    },
    dedupe: ['vue']
  },
  define: {
    // Provide fallback for process global to prevent "process is not defined" errors
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@repo/firebase-config',
      '@repo/modules/effects',
      '@repo/modules/layouts',
      '@repo/modules/locos',
      '@repo/modules/turnouts',
      '@repo/dccex',
      '@repo/deja',
      '@repo/utils',
      '@repo/ui',
      '@repo/auth'
    ],
    exclude: ['dotenv']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages/]
    },
    rollupOptions: {
      external: ['dotenv']
    }
  },
  server: {
    port: 5000,
        
    // CORS configuration for development
    cors: {
      origin: ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    },
    
    // Additional headers for development
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
})