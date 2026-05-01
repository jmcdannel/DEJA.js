import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdmin } from './_lib/admin.js'
import { applyCors } from './_lib/cors.js'

const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function generateUlid(): string {
  const time = Date.now()
  const timeChars: string[] = []
  let t = time
  for (let i = 0; i < 10; i++) {
    timeChars.unshift(ULID_ALPHABET[t % 32]!)
    t = Math.floor(t / 32)
  }
  const randChars: string[] = []
  for (let i = 0; i < 16; i++) {
    randChars.push(ULID_ALPHABET[Math.floor(Math.random() * 32)]!)
  }
  return timeChars.join('') + randChars.join('')
}

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, 60)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return res.status(401).json({ error: 'Missing Authorization Bearer token' })

  const { auth, db } = getAdmin()

  let uid: string
  try {
    const decoded = await auth.verifyIdToken(idToken)
    uid = decoded.uid
  } catch {
    return res.status(401).json({ error: 'Invalid or expired ID token' })
  }

  const body = req.body as { name?: unknown; layoutId?: unknown } | null
  const name = normalizeName(body?.name)
  if (!name) return res.status(400).json({ error: 'name is required (1-60 chars)' })

  const layoutId = typeof body?.layoutId === 'string' ? body.layoutId.trim() : null
  if (!layoutId) return res.status(400).json({ error: 'layoutId is required' })

  const serverId = generateUlid()

  try {
    const [, customToken] = await Promise.all([
      db
        .collection('users').doc(uid)
        .collection('servers').doc(serverId)
        .set({
          name,
          layoutId,
          createdAt: FieldValue.serverTimestamp(),
          lastSeenAt: null,
          revoked: false,
        }),
      auth.createCustomToken(uid, {
        serverId,
        kind: 'server',
      }),
    ])

    return res.status(200).json({ customToken, serverId })
  } catch (err) {
    console.error('cli-auth/mint failed:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
