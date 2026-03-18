import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'
import { db } from '../lib/firebase'
import { stripe } from '../lib/stripe'

// Disable body parser so we can read raw body for signature verification
export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

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
  const billingCycle = item?.price.recurring?.interval === 'year' ? 'annual' : 'monthly'
  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' })

  const rawBody = await getRawBody(req)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return res.status(400).json({ error: message })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const uid = await getFirebaseUid(sub.customer as string)
        if (uid) await syncSubscription(sub, uid)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = await getFirebaseUid(sub.customer as string)
        if (uid) {
          await db.doc(`users/${uid}`).set({
            subscription: {
              plan: 'hobbyist', status: 'canceled', billingCycle: null,
              stripeCustomerId: null, stripeSubscriptionId: null,
              trialEndsAt: null, currentPeriodEnd: null,
              cancelAtPeriodEnd: false, updatedAt: FieldValue.serverTimestamp(),
            },
          }, { merge: true })
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const uid = await getFirebaseUid(invoice.customer as string)
        if (uid) await db.doc(`users/${uid}`).update({ 'subscription.status': 'past_due', 'subscription.updatedAt': FieldValue.serverTimestamp() })
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const uid = await getFirebaseUid(invoice.customer as string)
        if (uid) await db.doc(`users/${uid}`).update({ 'subscription.status': 'active', 'subscription.updatedAt': FieldValue.serverTimestamp() })
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  return res.status(200).json({ received: true })
}
