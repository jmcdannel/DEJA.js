import { Hono } from 'hono'
import { stripe, getPriceId } from '../lib/stripe'
import { db } from '../lib/firebase'
import { authMiddleware } from '../middleware/auth'
import { FieldValue } from 'firebase-admin/firestore'

export const subscribeRoute = new Hono()

subscribeRoute.post('/subscribe', authMiddleware, async (c) => {
  const { uid, email } = c.get('auth')
  const { plan, billingCycle, paymentMethodId } = await c.req.json<{
    plan: 'engineer' | 'conductor'
    billingCycle: 'monthly' | 'annual'
    paymentMethodId: string
  }>()

  if (!plan || !billingCycle || !paymentMethodId) {
    return c.json({ error: 'Missing required fields: plan, billingCycle, paymentMethodId' }, 400)
  }

  if (!['engineer', 'conductor'].includes(plan)) {
    return c.json({ error: 'Invalid plan. Must be engineer or conductor.' }, 400)
  }

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

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null
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

    try {
      await db.doc(`users/${uid}`).set(
        { email, displayName: null, subscription: subscriptionData, createdAt: FieldValue.serverTimestamp() },
        { merge: true }
      )
    } catch {
      try {
        await db.doc(`users/${uid}`).set(
          { email, displayName: null, subscription: subscriptionData, createdAt: FieldValue.serverTimestamp() },
          { merge: true }
        )
      } catch (retryErr) {
        console.error('Firestore write failed after retry:', retryErr)
      }
    }

    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string; status?: string } } | null
    const clientSecret = invoice?.payment_intent?.client_secret ?? null
    const requiresAction = invoice?.payment_intent?.status === 'requires_action'

    return c.json({
      subscriptionId: subscription.id,
      status: requiresAction ? 'requires_action' : subscription.status,
      clientSecret,
    })
  } catch (err) {
    if (customer) {
      try {
        await stripe.customers.del(customer.id)
      } catch {
        console.error('Failed to clean up orphaned customer:', customer.id)
      }
    }

    const message = err instanceof Error ? err.message : 'Subscription creation failed'
    return c.json({ error: message }, 400)
  }
})
