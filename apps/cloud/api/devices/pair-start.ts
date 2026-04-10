import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { generatePairingCode, generatePollToken } from './lib/pairingCodes'
import { hashSessionSecret } from './lib/sessionSecret'

const VERIFICATION_URL = process.env.DEVICE_VERIFICATION_URL ?? 'https://cloud.dejajs.com/device'
const TTL_SECONDS = 10 * 60

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userCode = generatePairingCode()
  const pollToken = generatePollToken()

  await db.doc(`devicePairingCodes/${userCode}`).set({
    pollTokenHash: hashSessionSecret(pollToken),
    state: 'pending',
    pairingId: null,
    sessionSecret: null,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + TTL_SECONDS * 1000),
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
  })

  return res.status(200).json({
    userCode,
    pollToken,
    verificationUrl: VERIFICATION_URL,
    pollInterval: 2,
    expiresIn: TTL_SECONDS,
  })
}
