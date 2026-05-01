import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local and .env
for (const envFile of ['.env.local', '.env']) {
  const p = join(__dirname, envFile)
  if (!existsSync(p)) continue
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
if (!FIREBASE_API_KEY) {
  console.error('❌ Set VITE_FIREBASE_API_KEY in .env or .env.local')
  process.exit(1)
}

const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
function generateUlid() {
  const time = Date.now()
  const timeChars = []
  let t = time
  for (let i = 0; i < 10; i++) {
    timeChars.unshift(ULID_ALPHABET[t % 32])
    t = Math.floor(t / 32)
  }
  const randChars = []
  for (let i = 0; i < 16; i++) {
    randChars.push(ULID_ALPHABET[Math.floor(Math.random() * 32)])
  }
  return timeChars.join('') + randChars.join('')
}

// Verify ID token via Firebase REST API (no admin SDK needed)
async function verifyIdToken(idToken) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.users?.[0] ?? null
}

// Write server doc via Firestore REST API (no admin SDK needed)
async function writeServerDoc(idToken, uid, serverId, serverDoc) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}/servers/${serverId}`
  const fields = {}
  for (const [k, v] of Object.entries(serverDoc)) {
    if (v === null) fields[k] = { nullValue: null }
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v }
    else if (typeof v === 'string') fields[k] = { stringValue: v }
  }
  // Add serverTimestamp for createdAt
  fields.createdAt = { timestampValue: new Date().toISOString() }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firestore write failed: ${res.status} ${err}`)
  }
}

// Generate a dev custom token (signs in via Firebase REST API exchange)
async function mintCustomToken(uid, serverId) {
  // In dev, we generate a sign-in token by creating a custom token via
  // the Firebase Auth REST API using signInWithCustomToken workaround.
  // Since we can't sign JWTs without a service account, we return
  // a dev token that the CLI can use with `deja login --token`.
  // The dev token format: dev:<uid>:<serverId>:<random>
  const random = randomBytes(16).toString('hex')
  return `dev:${uid}:${serverId}:${random}`
}

const PORT = parseInt(process.env.PORT || '3099')

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk
  const parsed = body ? JSON.parse(body) : null

  const sendJson = (code, data) => {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }

  try {
    if (req.url === '/api/cli-auth/mint' && req.method === 'POST') {
      const authHeader = req.headers.authorization
      const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!idToken) return sendJson(401, { error: 'Missing Authorization Bearer token' })

      const user = await verifyIdToken(idToken)
      if (!user) return sendJson(401, { error: 'Invalid or expired ID token' })

      const name = typeof parsed?.name === 'string' ? parsed.name.trim().slice(0, 60) : null
      if (!name) return sendJson(400, { error: 'name is required (1-60 chars)' })

      const layoutId = typeof parsed?.layoutId === 'string' ? parsed.layoutId.trim() : null
      if (!layoutId) return sendJson(400, { error: 'layoutId is required' })

      const serverId = generateUlid()

      // Skip Firestore write in dev — admin SDK bypasses rules in production,
      // but the user's ID token can't write to users/{uid}/servers/.
      console.log(`📝 [dev] Would write server doc: users/${user.localId}/servers/${serverId}`, { name, layoutId })
      const customToken = await mintCustomToken(user.localId, serverId)

      console.log(`✅ Minted server "${name}" (${serverId}) for user ${user.localId}`)
      sendJson(200, { customToken, serverId })

    } else if (req.url === '/api/cli-auth/refresh' && req.method === 'POST') {
      // For dev, just echo back a dev token
      sendJson(200, { customToken: 'dev-refresh-token', expiresIn: 3600, refreshToken: parsed?.refreshToken })

    } else {
      res.statusCode = 404
      res.end('Not found')
    }
  } catch (err) {
    console.error('❌', err)
    sendJson(500, { error: 'Internal error' })
  }
})

server.listen(PORT, () => {
  console.log(`🔑 cli-auth dev server running on http://localhost:${PORT}`)
  console.log(`   Using Firebase project: ${process.env.VITE_FIREBASE_PROJECT_ID || '(not set)'}`)
  console.log(`   ⚠️  Dev mode — tokens are NOT real custom tokens`)
})
