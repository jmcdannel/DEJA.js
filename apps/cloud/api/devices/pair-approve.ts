import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'
import { generateSessionSecret, hashSessionSecret } from './lib/sessionSecret'

const ALLOWED_STATUSES = ['active', 'trialing', 'past_due']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })

  const userCode = typeof req.body?.userCode === 'string' ? req.body.userCode.toUpperCase() : null
  const label = typeof req.body?.label === 'string' && req.body.label.trim().length > 0
    ? req.body.label.slice(0, 80)
    : 'DEJA Server'
  const layoutId = typeof req.body?.layoutId === 'string' ? req.body.layoutId : null
  if (!userCode) return res.status(400).json({ error: 'userCode required' })

  const userSnap = await db.doc(`users/${auth.uid}`).get()
  const sub = userSnap.data()?.subscription as { status?: string } | undefined
  if (!sub?.status || !ALLOWED_STATUSES.includes(sub.status)) {
    return res.status(402).json({ error: 'Subscription not active' })
  }

  const codeRef = db.doc(`devicePairingCodes/${userCode}`)
  const codeSnap = await codeRef.get()
  if (!codeSnap.exists) return res.status(404).json({ error: 'Code not found or expired' })
  const code = codeSnap.data() as { state: 'pending' | 'approved'; userAgent: string | null; expiresAt: { toDate: () => Date } }

  if (code.expiresAt.toDate() < new Date()) {
    await codeRef.delete()
    return res.status(404).json({ error: 'Code expired' })
  }
  if (code.state !== 'pending') return res.status(409).json({ error: 'Code already used' })

  const sessionSecret = generateSessionSecret()
  const pairingRef = db.collection('devicePairings').doc()
  await pairingRef.set({
    uid: auth.uid,
    layoutId,
    label,
    secretHash: hashSessionSecret(sessionSecret),
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
    lastAuthAt: null,
    userAgent: code.userAgent,
  })

  await codeRef.update({
    state: 'approved',
    pairingId: pairingRef.id,
    sessionSecret,
    approvedBy: auth.uid,
    approvedAt: FieldValue.serverTimestamp(),
  })

  return res.status(200).json({ ok: true, pairingId: pairingRef.id })
}
