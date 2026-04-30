import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdmin } from './_lib/admin.js'
import { applyCors } from './_lib/cors.js'

interface SecureTokenResponse {
  id_token: string
  refresh_token: string
  expires_in: string
  user_id: string
}

async function exchangeRefreshToken(
  refreshToken: string,
  apiKey: string,
): Promise<SecureTokenResponse | null> {
  const url = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  })
  if (!res.ok) return null
  return (await res.json()) as SecureTokenResponse
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body as { refreshToken?: unknown } | null
  const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken : null
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' })

  const apiKey = process.env.FIREBASE_API_KEY
  if (!apiKey) {
    console.error('FIREBASE_API_KEY env var missing')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const tokenResp = await exchangeRefreshToken(refreshToken, apiKey)
  if (!tokenResp) {
    return res.status(401).json({ error: 'Refresh token invalid or revoked. Run "deja login" again.' })
  }

  const { auth, db } = getAdmin()

  let decoded: { uid: string; serverId?: string; kind?: string }
  try {
    decoded = (await auth.verifyIdToken(tokenResp.id_token)) as typeof decoded
  } catch {
    return res.status(401).json({ error: 'ID token verification failed' })
  }

  if (!decoded.serverId || decoded.kind !== 'server') {
    return res.status(401).json({ error: 'Token is not a server credential' })
  }

  const serverDocRef = db
    .collection('users').doc(decoded.uid)
    .collection('servers').doc(decoded.serverId)

  const snap = await serverDocRef.get()
  if (!snap.exists) {
    return res.status(403).json({ error: 'Server credential has been deleted' })
  }
  if (snap.data()?.revoked === true) {
    return res.status(403).json({ error: 'Server credential has been revoked' })
  }

  try {
    await serverDocRef.update({ lastSeenAt: FieldValue.serverTimestamp() })
  } catch (err) {
    console.warn('lastSeenAt update failed (non-fatal):', err)
  }

  let customToken: string
  try {
    customToken = await auth.createCustomToken(decoded.uid, {
      serverId: decoded.serverId,
      kind: 'server',
    })
  } catch (err) {
    console.error('createCustomToken failed:', err)
    return res.status(500).json({ error: 'Failed to mint custom token' })
  }

  return res.status(200).json({
    customToken,
    expiresIn: parseInt(tokenResp.expires_in, 10),
    refreshToken: tokenResp.refresh_token,
  })
}
