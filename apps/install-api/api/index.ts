import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { getLatestVersion, getReleaseUrl, uploadRelease } from './lib/blob'

const app = new Hono().basePath('/api')

// Serve the install script with Firebase config baked in from env vars
app.get('/', async (c) => {
  const installScript = generateInstallScript()
  return c.text(installScript, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
  })
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Redirect to latest release asset
app.get('/releases/latest/:filename', async (c) => {
  const filename = c.req.param('filename')
  const version = await getLatestVersion()
  if (!version) return c.json({ error: 'No releases found' }, 404)

  const url = await getReleaseUrl(version, filename)
  if (!url) return c.json({ error: 'File not found' }, 404)

  return c.redirect(url)
})

// Redirect to specific version asset
app.get('/releases/:version/:filename', async (c) => {
  const { version, filename } = c.req.param()
  const url = await getReleaseUrl(version, filename)
  if (!url) return c.json({ error: 'File not found' }, 404)

  return c.redirect(url)
})

// CI upload endpoint (protected by secret)
app.post('/releases/:version/upload', async (c) => {
  const authHeader = c.req.header('authorization')
  if (authHeader !== `Bearer ${process.env.UPLOAD_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const version = c.req.param('version')
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const url = await uploadRelease(
    version,
    file.name,
    file,
    file.type || 'application/octet-stream'
  )

  return c.json({ ok: true, url })
})

function generateInstallScript(): string {
  // Read the template and replace placeholders with env vars
  // In production, env vars are set in Vercel project settings
  const replacements: Record<string, string> = {
    __FIREBASE_API_KEY__: process.env.FIREBASE_API_KEY ?? '',
    __FIREBASE_AUTH_DOMAIN__: process.env.FIREBASE_AUTH_DOMAIN ?? '',
    __FIREBASE_PROJECT_ID__: process.env.FIREBASE_PROJECT_ID ?? '',
    __FIREBASE_DATABASE_URL__: process.env.FIREBASE_DATABASE_URL ?? '',
    __FIREBASE_STORAGE_BUCKET__: process.env.FIREBASE_STORAGE_BUCKET ?? '',
    __FIREBASE_MESSAGING_SENDER_ID__:
      process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    __FIREBASE_APP_ID__: process.env.FIREBASE_APP_ID ?? '',
    __FIREBASE_CLIENT_EMAIL__: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    __FIREBASE_PRIVATE_KEY__: process.env.FIREBASE_PRIVATE_KEY ?? '',
  }

  let script = INSTALL_SCRIPT_TEMPLATE
  for (const [placeholder, value] of Object.entries(replacements)) {
    script = script.replaceAll(placeholder, value)
  }
  return script
}

// The install script template is embedded at build time by the CI workflow.
// For local dev, it returns the placeholder version.
const INSTALL_SCRIPT_TEMPLATE = `__INSTALL_SCRIPT_TEMPLATE__`

export default handle(app)

// Named exports for each HTTP method (required by Vercel serverless)
export const GET = handle(app)
export const POST = handle(app)
