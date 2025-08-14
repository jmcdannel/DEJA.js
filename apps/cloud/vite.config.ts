import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Custom plugin to handle workspace package resolution
const workspacePackagePlugin = () => {
  return {
    name: 'workspace-package-resolver',
    resolveId(id: string) {
      if (id.startsWith('@repo/')) {
        // Handle workspace package imports
        const packageName = id.replace('@repo/', '')
        const packagePath = fileURLToPath(new URL(`../../packages/${packageName}/index.ts`, import.meta.url))
        return packagePath
      }
      return null
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), workspacePackagePlugin()],
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
    proxy: {
      // BBC Sound Effects API proxy
      '/api/bbc': {
        target: 'https://sound-effects.bbcrewind.co.uk',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/bbc/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('BBC API Proxy Error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying to BBC API:', req.method, req.url)
          })
        }
      },
      
      // BBC Audio files proxy
      '/api/bbc-audio': {
        target: 'https://sound-effects.bbcrewind.co.uk',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/bbc-audio/, '/audio'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('BBC Audio Proxy Error:', err)
          })
        }
      },
      
      // BBC Search proxy
      '/api/bbc-search': {
        target: 'https://sound-effects.bbcrewind.co.uk',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/bbc-search/, '/search'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('BBC Search Proxy Error:', err)
          })
        }
      },
      
      // Local API proxy (for development)
      '/api/local': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/local/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Local API Proxy Error:', err)
          })
        }
      },
      
      // HTTPS bypass for development
      '/api/https-bypass': {
        target: 'https://httpbin.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/https-bypass/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('HTTPS Bypass Proxy Error:', err)
          })
        }
      }
    },
    
    // CORS configuration for development
    cors: {
      origin: ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    },
    
    // HTTPS configuration for development
    https: false, // Set to true if you need HTTPS locally
    
    // Additional headers for development
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
})