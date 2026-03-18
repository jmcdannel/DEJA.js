import { fileURLToPath, URL } from 'node:url'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
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

// Vite plugin to run Vercel serverless functions locally in dev
const apiDir = fileURLToPath(new URL('./api', import.meta.url))

const vercelApiPlugin = (envVars: Record<string, string>): Plugin => ({
  name: 'vite-plugin-vercel-api',
  configureServer(server) {
    // Make env vars available to API handlers via process.env
    Object.assign(process.env, envVars)

    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

      if (!url.pathname.startsWith('/api/')) {
        return next()
      }

      const apiPath = url.pathname.replace('/api/', '')

      // Resolve handler file path
      let modulePath: string | null = null
      const dynamicParams: Record<string, string> = {}

      // Try exact match: /api/sounds → ./api/sounds.ts
      const exactPath = join(apiDir, `${apiPath}.ts`)
      if (existsSync(exactPath)) {
        modulePath = exactPath
      } else {
        // Try dynamic segment: /api/sounds/foo → ./api/sounds/[param].ts
        const segments = apiPath.split('/')
        const lastSegment = segments.pop()!
        const parentDir = join(apiDir, ...segments)

        if (existsSync(parentDir)) {
          try {
            const files = readdirSync(parentDir)
            const dynamicFile = files.find(f => f.startsWith('[') && f.endsWith('].ts'))
            if (dynamicFile) {
              const paramName = dynamicFile.match(/^\[(.+)\]\.ts$/)?.[1]
              if (paramName) {
                modulePath = join(parentDir, dynamicFile)
                dynamicParams[paramName] = lastSegment
              }
            }
          } catch { /* ignore */ }
        }
      }

      if (!modulePath) {
        return next()
      }

      try {
        // Read body for non-GET requests
        let body: Buffer | undefined
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          body = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer) => chunks.push(chunk))
            req.on('end', () => resolve(Buffer.concat(chunks)))
          })
        }

        // Build query params
        const query: Record<string, string | string[]> = { ...dynamicParams }
        url.searchParams.forEach((value, key) => {
          query[key] = value
        })

        // Create VercelRequest-compatible object
        const vercelReq = Object.assign(req, { query, body, cookies: {} })

        // Create VercelResponse-compatible object
        const vercelRes = Object.assign(res, {
          status(code: number) {
            res.statusCode = code
            return vercelRes
          },
          json(data: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return vercelRes
          },
          send(responseBody: unknown) {
            res.end(responseBody)
            return vercelRes
          }
        })

        const mod = await server.ssrLoadModule(modulePath)
        await mod.default(vercelReq, vercelRes)
      } catch (error) {
        console.error(`[API] ${url.pathname} error:`, error)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      }
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue(), workspacePackagePlugin(), vercelApiPlugin(env)],
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
      port: 3011, // Standardized cloud app port
      host: true, // Allow external connections

      // CORS configuration for development
      cors: {
        origin: [
          'http://localhost:3011', // Standardized cloud port
          'http://localhost:3000',
          'http://localhost:3021',
          'http://localhost:3031',
          'http://localhost:3041',
          'http://localhost:3051'
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
