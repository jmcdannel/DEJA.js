import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
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
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
      },
      // Source maps for development
      sourcemap: mode === 'development'
    },
    server: {
      port: 5174, // Changed from 5000 to avoid conflicts
      host: true, // Allow external connections
      
      proxy: {
        // BBC Sound Effects API proxy
        '/api/bbc': {
          target: 'https://sound-effects.bbcrewind.co.uk',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/bbc/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('🚂 BBC API Proxy Error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🚂 Proxying to BBC API:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('🚂 BBC API Response:', proxyRes.statusCode, req.url)
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
              console.log('🎵 BBC Audio Proxy Error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🎵 Proxying BBC Audio:', req.method, req.url)
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
              console.log('🔍 BBC Search Proxy Error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔍 Proxying BBC Search:', req.method, req.url)
            })
          }
        },
        
        // Local API proxy (for development)
        '/api/local': {
          target: env.VITE_LOCAL_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/local/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('🏠 Local API Proxy Error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🏠 Proxying to Local API:', req.method, req.url)
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
              console.log('🔓 HTTPS Bypass Proxy Error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔓 Proxying HTTPS Bypass:', req.method, req.url)
            })
          }
        },
        
        // Mock API for development (when BBC API is unavailable)
        '/api/mock': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/mock/, '/mock'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('🎭 Mock API Proxy Error:', err.message)
            })
          }
        }
      },
      
      // CORS configuration for development
      cors: {
        origin: [
          'http://localhost:5174', // Primary development port
          'http://localhost:5000', // Original port (if available)
          'http://localhost:3000', 
          'http://localhost:5173',
          'http://localhost:5175',
          'http://localhost:5176'
        ],
        credentials: true
      },
      
      // HTTPS configuration for development
      https: env.VITE_DEV_HTTPS === 'true' ? {
        key: env.VITE_DEV_HTTPS_KEY,
        cert: env.VITE_DEV_HTTPS_CERT
      } : false,
      
      // Additional headers for development
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      },
      
      // Watch for file changes
      watch: {
        usePolling: true,
        interval: 1000
      }
    },
    
    // Development-specific optimizations
    esbuild: {
      // Keep console.logs in development
      drop: mode === 'production' ? ['console', 'debugger'] : []
    }
  }
})
