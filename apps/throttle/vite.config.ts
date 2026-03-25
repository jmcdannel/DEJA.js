import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

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
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  optimizeDeps: {
    include: [
      '@repo/firebase-config',
      '@repo/modules',
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
      external: ['dotenv', '@spryrocks/capacitor-socket-connection-plugin']
    }
  },
  server: {
    port: 3041,
        
    cors: true
  },
})
