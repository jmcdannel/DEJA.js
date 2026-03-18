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
  const { plan, billingCycle, paymentMethodId } = req.body as {
    plan: 'engineer' | 'conductor'
    billingCycle: 'monthly' | 'annual'
    paymentMethodId: string
  }

  if (!plan || !billingCycle || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields: plan, billingCycle, paymentMethodId' })
  }

  if (!['engineer', 'conductor'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be engineer or conductor.' })
  }

  // Get user email from Firestore
  const userDoc = await db.doc(`users/${uid}`).get()
  const email = userDoc.data()?.email as string | undefined

  let customer: { id: string } | null = null

  try {
    customer = await stripe.customers.create({
      email,
      metadata: { firebaseUid: uid },
    })

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    const priceId = getPriceId(plan, billingCycle)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: 14,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    })

    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    const periodEnd = new Date(subscription.current_period_end * 1000)

    const subscriptionData = {
      plan,
      status: subscription.status,
      billingCycle,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      trialEndsAt: trialEnd,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await db.doc(`users/${uid}`).set(
      { email, subscription: subscriptionData, createdAt: FieldValue.serverTimestamp() },
      { merge: true },
    )

    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string; status?: string } } | null
    const clientSecret = invoice?.payment_intent?.client_secret ?? null
    const requiresAction = invoice?.payment_intent?.status === 'requires_action'

    return res.status(200).json({
      subscriptionId: subscription.id,
      status: requiresAction ? 'requires_action' : subscription.status,
      clientSecret,
    })
  } catch (err) {
    if (customer) {
      try { await stripe.customers.del(customer.id) } catch { /* ignore cleanup errors */ }
    }
    const message = err instanceof Error ? err.message : 'Subscription creation failed'
    return res.status(400).json({ error: message })
  }
}
