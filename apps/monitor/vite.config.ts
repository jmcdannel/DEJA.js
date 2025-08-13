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
    rollupOptions: {
      external: ['dotenv']
    }
  },
  server: {
    port: 4000
  },
})
