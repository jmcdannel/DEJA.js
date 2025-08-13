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
    exclude: ['dotenv']
  },
  build: {
    rollupOptions: {
      external: ['dotenv']
    }
  },
  server: {
    port: 6000
  },
})