import { Hono } from 'hono'
import { stripe, getPriceId } from '../lib/stripe'
import { db } from '../lib/firebase'
import { authMiddleware } from '../middleware/auth'

export const changePlanRoute = new Hono()

changePlanRoute.post('/change-plan', authMiddleware, async (c) => {
  const { uid } = c.get('auth')
  const { newPlan, billingCycle } = await c.req.json<{
    newPlan: 'engineer' | 'conductor'
    billingCycle: 'monthly' | 'annual'
  }>()

  if (!newPlan || !billingCycle) {
    return c.json({ error: 'Missing required fields: newPlan, billingCycle' }, 400)
  }

  const userDoc = await db.doc(`users/${uid}`).get()
  const subscriptionId = userDoc.data()?.subscription?.stripeSubscriptionId

  if (!subscriptionId) {
    return c.json({ error: 'No active subscription to update' }, 404)
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const newPriceId = getPriceId(newPlan, billingCycle)

  await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0]?.id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations',
  })

  return c.json({ status: 'updated' })
})
