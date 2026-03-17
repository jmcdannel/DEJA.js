import { Hono } from 'hono'
import { stripe } from '../lib/stripe'
import { db } from '../lib/firebase'
import { authMiddleware } from '../middleware/auth'

export const billingPortalRoute = new Hono()

billingPortalRoute.post('/billing-portal', authMiddleware, async (c) => {
  const { uid } = c.get('auth')

  const userDoc = await db.doc(`users/${uid}`).get()
  const stripeCustomerId = userDoc.data()?.subscription?.stripeCustomerId

  if (!stripeCustomerId) {
    return c.json({ error: 'No active subscription found' }, 404)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: c.req.header('origin') ?? 'http://localhost:3011',
  })

  return c.json({ url: session.url })
})
