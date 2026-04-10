import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../lib/firebase'
import { verifySessionSecret } from './lib/sessionSecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userCode = typeof req.body?.userCode === 'string' ? req.body.userCode : null
  const pollToken = typeof req.body?.pollToken === 'string' ? req.body.pollToken : null
  if (!userCode || !pollToken) return res.status(400).json({ error: 'userCode and pollToken required' })

  const codeRef = db.doc(`devicePairingCodes/${userCode}`)
  const snap = await codeRef.get()
  if (!snap.exists) return res.status(404).json({ state: 'expired' })

  const data = snap.data() as {
    pollTokenHash: string
    state: 'pending' | 'approved'
    pairingId: string | null
    sessionSecret: string | null
    expiresAt: { toDate: () => Date }
  }

  if (data.expiresAt.toDate() < new Date()) {
    await codeRef.delete()
    return res.status(404).json({ state: 'expired' })
  }
  if (!verifySessionSecret(pollToken, data.pollTokenHash)) {
    return res.status(401).json({ error: 'Invalid poll token' })
  }

  if (data.state === 'pending') return res.status(200).json({ state: 'pending' })
  if (data.state === 'approved') {
    const payload = { state: 'approved' as const, pairingId: data.pairingId, sessionSecret: data.sessionSecret }
    await codeRef.delete()
    return res.status(200).json(payload)
  }
  return res.status(200).json({ state: data.state })
}
