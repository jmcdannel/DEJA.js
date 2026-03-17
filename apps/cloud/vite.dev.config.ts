import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { ViteDevServer } from 'vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

function extractFileName(pathname: string): string {
  const filename = pathname.split('/').pop() || ''
  return filename
    .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

// Dev middleware that handles /api/sounds without needing a separate sound-api server
const soundsApiPlugin = () => ({
  name: 'sounds-api-dev',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/sounds', async (_req, res) => {
      try {
        const { list } = await import('@vercel/blob')
        const { blobs } = await list({ limit: 100, prefix: '' })
        const sounds = blobs.map((blob) => ({
          name: extractFileName(blob.pathname),
          url: blob.url,
          size: blob.size,
          uploadedAt: blob.uploadedAt?.toISOString() ?? new Date().toISOString(),
          contentType: 'contentType' in blob ? String(blob.contentType) : 'audio/mpeg',
          pathname: blob.pathname,
        }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ sounds }))
      } catch (error) {
        console.error('[sounds-api-dev] Error listing sounds:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Failed to load sounds' }))
      }
    })
  },
})

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
    plugins: [vue(), workspacePackagePlugin(), soundsApiPlugin()],
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
        '@repo/modules/effects',
        '@repo/modules/layouts',
        '@repo/modules/locos',
        '@repo/modules',
        '@repo/dccex',
        '@repo/deja',
        '@repo/utils',
        '@repo/ui',
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
