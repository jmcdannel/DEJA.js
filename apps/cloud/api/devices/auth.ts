import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifySessionSecret } from './lib/sessionSecret'

const ALLOWED_STATUSES = ['active', 'trialing', 'past_due']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const pairingId = typeof req.body?.pairingId === 'string' ? req.body.pairingId : null
  const sessionSecret = typeof req.body?.sessionSecret === 'string' ? req.body.sessionSecret : null
  if (!pairingId || !sessionSecret) {
    return res.status(400).json({ error: 'pairingId and sessionSecret required' })
  }

  const pairingSnap = await db.doc(`devicePairings/${pairingId}`).get()
  if (!pairingSnap.exists) return res.status(404).json({ error: 'Pairing not found' })

  const pairing = pairingSnap.data() as {
    uid: string
    layoutId: string | null
    secretHash: string
    revoked: boolean
  }
  if (pairing.revoked) return res.status(403).json({ error: 'Pairing revoked' })
  if (!verifySessionSecret(sessionSecret, pairing.secretHash)) {
    return res.status(401).json({ error: 'Invalid session secret' })
  }

  const userSnap = await db.doc(`users/${pairing.uid}`).get()
  const sub = userSnap.data()?.subscription as { status?: string; plan?: string } | undefined
  if (!sub?.status || !ALLOWED_STATUSES.includes(sub.status)) {
    return res.status(402).json({ error: 'Subscription not active', subscription: sub ?? null })
  }

  const customToken = await getAuth().createCustomToken(pairing.uid, {
    pairingId,
    layoutId: pairing.layoutId,
  })

  await pairingSnap.ref.update({ lastAuthAt: FieldValue.serverTimestamp() })

  return res.status(200).json({
    customToken,
    uid: pairing.uid,
    layoutId: pairing.layoutId,
    subscription: { status: sub.status, plan: sub.plan ?? null },
  })
}
