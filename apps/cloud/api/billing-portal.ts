import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from './lib/firebase'
import { stripe } from './lib/stripe'
import { verifyFirebaseAuth } from './lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  const uid = auth.uid!
  const userDoc = await db.doc(`users/${uid}`).get()
  const stripeCustomerId = userDoc.data()?.subscription?.stripeCustomerId as string | undefined

  if (!stripeCustomerId) {
    return res.status(404).json({ error: 'No billing account found' })
  }

  try {
    const origin = req.headers.origin ?? 'https://cloud.dejajs.com'
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: origin,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create billing portal session'
    return res.status(400).json({ error: message })
  }
}
