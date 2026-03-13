import { Hono } from 'hono'
import { stripe } from '../lib/stripe'
import { db } from '../lib/firebase'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

export const webhookRoute = new Hono()

async function getFirebaseUid(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  return (customer.metadata?.firebaseUid as string) ?? null
}

async function syncSubscription(subscription: Stripe.Subscription, uid: string) {
  const item = subscription.items.data[0]
  const priceId = item?.price.id ?? ''

  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_ENGINEER_MONTHLY ?? '']: 'engineer',
    [process.env.STRIPE_PRICE_ENGINEER_ANNUAL ?? '']: 'engineer',
    [process.env.STRIPE_PRICE_CONDUCTOR_MONTHLY ?? '']: 'conductor',
    [process.env.STRIPE_PRICE_CONDUCTOR_ANNUAL ?? '']: 'conductor',
  }
  const plan = priceMap[priceId] ?? 'hobbyist'

  const interval = item?.price.recurring?.interval
  const billingCycle = interval === 'year' ? 'annual' : 'monthly'

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null
  const periodEnd = new Date(subscription.current_period_end * 1000)

  await db.doc(`users/${uid}`).set({
    subscription: {
      plan,
      status: subscription.status,
      billingCycle,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      trialEndsAt: trialEnd,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: FieldValue.serverTimestamp(),
    },
  }, { merge: true })
}

webhookRoute.post('/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')
  if (!sig) return c.json({ error: 'Missing stripe-signature header' }, 400)

  const body = await c.req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return c.json({ error: message }, 400)
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const uid = await getFirebaseUid(subscription.customer as string)
        if (uid) await syncSubscription(subscription, uid)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const uid = await getFirebaseUid(subscription.customer as string)
        if (uid) {
          await db.doc(`users/${uid}`).set({
            subscription: {
              plan: 'hobbyist',
              status: 'canceled',
              billingCycle: null,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              trialEndsAt: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              updatedAt: FieldValue.serverTimestamp(),
            },
          }, { merge: true })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const uid = await getFirebaseUid(invoice.customer as string)
        if (uid) {
          await db.doc(`users/${uid}`).update({
            'subscription.status': 'past_due',
            'subscription.updatedAt': FieldValue.serverTimestamp(),
          })
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const uid = await getFirebaseUid(invoice.customer as string)
        if (uid) {
          await db.doc(`users/${uid}`).update({
            'subscription.status': 'active',
            'subscription.updatedAt': FieldValue.serverTimestamp(),
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return c.json({ error: 'Webhook handler failed' }, 500)
  }

  return c.json({ received: true })
})
