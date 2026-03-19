import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from './lib/firebase'
import { stripe, getPriceId } from './lib/stripe'
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
  const { plan, billingCycle } = req.body as {
    plan: 'engineer' | 'conductor'
    billingCycle: 'monthly' | 'annual'
  }

  if (!plan || !billingCycle) {
    return res.status(400).json({ error: 'Missing required fields: plan, billingCycle' })
  }

  const userDoc = await db.doc(`users/${uid}`).get()
  const subscriptionId = userDoc.data()?.subscription?.stripeSubscriptionId as string | undefined

  if (!subscriptionId) {
    return res.status(404).json({ error: 'No active subscription found' })
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const newPriceId = getPriceId(plan, billingCycle)

    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: subscription.items.data[0]?.id, price: newPriceId }],
      proration_behavior: 'create_prorations',
    })

    await db.doc(`users/${uid}`).update({
      'subscription.plan': plan,
      'subscription.billingCycle': billingCycle,
      'subscription.updatedAt': FieldValue.serverTimestamp(),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Plan change failed'
    return res.status(400).json({ error: message })
  }
}
