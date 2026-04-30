import { initializeApp, getApps } from 'firebase/app'
import { initializeAuth, inMemoryPersistence, signInWithCustomToken } from 'firebase/auth'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout, stderr, argv, exit } from 'node:process'
import { join } from 'node:path'
import { loadEnvFile, DEJA_DIR, readConfig, writeConfig } from './config.mjs'

function parseArgs(args) {
  const result = { token: null, outputToken: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token') result.token = args[i + 1] ?? null
    else if (args[i] === '--output-token') result.outputToken = true
  }
  return result
}

function decodeJwtPayload(jwt) {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function readTokenFromStdin() {
  const rl = createInterface({ input: stdin, output: stderr })
  const answer = await rl.question('Paste your custom token: ')
  rl.close()
  return answer.trim()
}

async function main() {
  loadEnvFile(join(DEJA_DIR, '.env'))
  const { token: tokenArg, outputToken } = parseArgs(argv.slice(2))

  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
  if (!apiKey) {
    stderr.write('❌ Missing VITE_FIREBASE_API_KEY in ~/.deja/.env\n')
    exit(1)
  }

  const customToken = tokenArg || (await readTokenFromStdin())
  if (!customToken) {
    stderr.write('❌ No custom token provided.\n')
    exit(1)
  }

  const claims = decodeJwtPayload(customToken)
  const serverId = claims?.claims?.serverId ?? claims?.serverId
  if (!serverId) {
    stderr.write('❌ Token has no serverId claim — was it minted by /api/cli-auth/mint?\n')
    exit(1)
  }

  const config = {
    apiKey,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }

  const app = getApps()[0] ?? initializeApp(config)
  const auth = initializeAuth(app, { persistence: inMemoryPersistence })

  let credential
  try {
    credential = await signInWithCustomToken(auth, customToken)
  } catch (err) {
    stderr.write(`❌ Sign-in failed: ${err.message}\n`)
    if (err.code === 'auth/invalid-custom-token' || err.code === 'auth/custom-token-mismatch') {
      stderr.write('   Tokens expire 1 hour after generation. Generate a new one and try again.\n')
    }
    exit(1)
  }

  const { uid, refreshToken } = credential.user
  if (!refreshToken) {
    stderr.write('❌ Sign-in succeeded but no refresh token returned.\n')
    exit(1)
  }

  if (outputToken) {
    stdout.write(refreshToken + '\n')
    stderr.write(`✅ Logged in as ${credential.user.email ?? uid}. Refresh token printed to stdout.\n`)
    exit(0)
  }

  writeConfig({ uid, serverId, refreshToken })
  stderr.write(`✅ Logged in as ${credential.user.email ?? uid}. Server: ${serverId}\n`)
}

main().catch((err) => {
  stderr.write(`❌ Unexpected error: ${err.message}\n`)
  exit(1)
})
