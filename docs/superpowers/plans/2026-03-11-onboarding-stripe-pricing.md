# Onboarding + Stripe Pricing Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add plan selection and Stripe payment to the cloud app onboarding wizard, create a billing API backend, and enforce plan limits in the frontend UI.

**Architecture:** New `packages/modules/plans/` module defines types and limits. New `apps/billing-api/` Hono app handles Stripe operations. Cloud app onboarding wizard gains two new steps (plan selection + payment). `useSubscription()` composable reads plan data from Firestore `users/{userId}` for frontend gating.

**Tech Stack:** Vue 3 + Vuetify 3, Hono, Stripe SDK + Stripe Elements, Firebase Admin SDK, VueFire, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-11-onboarding-stripe-pricing-design.md`

---

## File Structure

### New Files

```
packages/modules/plans/
├── types.ts              # PlanTier, UserSubscription, PlanLimits, SubscriptionStatus types
├── constants.ts          # PLAN_LIMITS, PLAN_DISPLAY_INFO, TIER_ORDER
├── useSubscription.ts    # Composable: reads users/{uid}.subscription, exposes plan checks
└── index.ts              # Barrel export

apps/billing-api/
├── package.json          # Hono + stripe + firebase-admin deps
├── tsconfig.json         # Extends @repo/typescript-config/node.json
├── vercel.json           # Vercel serverless config
├── .env.example          # Stripe + Firebase env vars template
└── src/
    ├── index.ts          # Hono app: CORS, routes, error handler
    ├── lib/
    │   ├── stripe.ts     # Stripe client singleton
    │   └── firebase.ts   # Firebase Admin singleton + Firestore helper
    ├── middleware/
    │   └── auth.ts       # Firebase ID token verification middleware
    └── routes/
        ├── subscribe.ts      # POST /api/subscribe
        ├── webhook.ts        # POST /api/webhooks/stripe
        ├── billing-portal.ts # POST /api/billing-portal
        └── change-plan.ts    # POST /api/change-plan

apps/cloud/src/Onboarding/steps/
├── PlanStep.vue          # Plan selection cards with monthly/annual toggle
└── PaymentStep.vue       # Stripe Elements card form with SCA handling

scripts/
└── migrate-users-to-plans.ts  # One-time migration for existing users
```

### Modified Files

```
packages/modules/index.ts                            # Add plans barrel export
apps/cloud/package.json                               # Add @stripe/stripe-js dependency
apps/cloud/src/Onboarding/OnboardingWizard.vue        # 3→5 steps, Hobbyist skip logic
apps/cloud/src/Settings/Settings.vue                  # Add billing section
apps/cloud/src/App.vue                                # Add trial banner to header
.env.example                                          # Add VITE_BILLING_API_URL, VITE_STRIPE_PUBLISHABLE_KEY
```

---

## Chunk 1: Plans Module (`@repo/modules`)

> Independent — no external dependencies. Can be built in parallel with Chunk 2.

### Task 1: Plan Types and Constants

**Files:**
- Create: `packages/modules/plans/types.ts`
- Create: `packages/modules/plans/constants.ts`
- Create: `packages/modules/plans/index.ts`
- Modify: `packages/modules/index.ts` (add export at bottom, ~line 42)

- [ ] **Step 1: Create types.ts**

```typescript
// packages/modules/plans/types.ts
import type { Timestamp } from 'firebase/firestore'

export type PlanTier = 'hobbyist' | 'engineer' | 'conductor'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'

export type BillingCycle = 'monthly' | 'annual'

export interface UserSubscription {
  plan: PlanTier
  status: SubscriptionStatus
  billingCycle: BillingCycle | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  trialEndsAt: Timestamp | null
  currentPeriodEnd: Timestamp | null
  cancelAtPeriodEnd: boolean
  updatedAt: Timestamp
}

export interface UserDocument {
  email: string
  displayName: string | null
  createdAt: Timestamp
  subscription: UserSubscription
}

export interface PlanLimits {
  locos: number
  turnouts: number
  signals: number
  effects: number
  sounds: number
  routes: number
  layouts: number
  tourApp: boolean
}

export interface PlanDisplayInfo {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
}
```

- [ ] **Step 2: Create constants.ts**

```typescript
// packages/modules/plans/constants.ts
import type { PlanLimits, PlanTier, PlanDisplayInfo } from './types'

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  hobbyist: {
    locos: 5,
    turnouts: 0,
    signals: 0,
    effects: 0,
    sounds: 0,
    routes: 0,
    layouts: 1,
    tourApp: false,
  },
  engineer: {
    locos: 25,
    turnouts: 15,
    signals: 15,
    effects: 15,
    sounds: 15,
    routes: 10,
    layouts: 2,
    tourApp: false,
  },
  conductor: {
    locos: Infinity,
    turnouts: Infinity,
    signals: Infinity,
    effects: Infinity,
    sounds: Infinity,
    routes: Infinity,
    layouts: Infinity,
    tourApp: true,
  },
} as const

export const TIER_ORDER: PlanTier[] = ['hobbyist', 'engineer', 'conductor']

export const PLAN_DISPLAY: Record<PlanTier, PlanDisplayInfo> = {
  hobbyist: {
    name: 'Hobbyist',
    description: 'Get started with basic train control',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Up to 5 locomotives',
      'Basic throttle control',
      '1 layout configuration',
      'Community docs access',
    ],
  },
  engineer: {
    name: 'Engineer',
    description: 'Full cloud control for serious hobbyists',
    monthlyPrice: 7,
    annualPrice: 67,
    features: [
      'Up to 25 locomotives',
      '15 turnouts, signals & effects',
      '2 layout configurations',
      'Basic macros & scheduling',
      'Community forum access',
      'Support tickets (72hr SLA)',
    ],
  },
  conductor: {
    name: 'Conductor',
    description: 'Unlimited power for your railroad empire',
    monthlyPrice: 18,
    annualPrice: 173,
    features: [
      'Unlimited locomotives',
      'Unlimited turnouts, signals & effects',
      'Unlimited layout configurations',
      'Tour App access',
      'Advanced macros & automations',
      'Priority support (24hr SLA)',
      'Beta testing program',
    ],
  },
}
```

- [ ] **Step 3: Create barrel export index.ts**

```typescript
// packages/modules/plans/index.ts
export * from './types'
export * from './constants'
export { useSubscription } from './useSubscription'
```

- [ ] **Step 4: Add plans export to modules barrel**

Add to `packages/modules/index.ts` after the last export block (~line 42):

```typescript
// Plans
export * from './plans'
```

- [ ] **Step 5: Commit**

```bash
git add packages/modules/plans/types.ts packages/modules/plans/constants.ts packages/modules/plans/index.ts packages/modules/index.ts
git commit -m "feat(modules): add plan types, limits, and display constants"
```

---

### Task 2: useSubscription Composable

**Files:**
- Create: `packages/modules/plans/useSubscription.ts`

- [ ] **Step 1: Create useSubscription.ts**

```typescript
// packages/modules/plans/useSubscription.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser } from 'vuefire'
import { useFirestore } from 'vuefire'
import { PLAN_LIMITS, TIER_ORDER } from './constants'
import type { PlanTier, PlanLimits, UserDocument, SubscriptionStatus } from './types'

export function useSubscription() {
  const user = useCurrentUser()
  const db = useFirestore()

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })

  const userDoc = useDocument<UserDocument>(userDocRef)

  const subscription = computed(() => userDoc.value?.subscription ?? null)

  const plan = computed<PlanTier>(() => subscription.value?.plan ?? 'hobbyist')

  const status = computed<SubscriptionStatus>(() => subscription.value?.status ?? 'active')

  const limits = computed<PlanLimits>(() => PLAN_LIMITS[plan.value])

  const isTrialing = computed(() => status.value === 'trialing')

  const trialDaysLeft = computed(() => {
    if (!isTrialing.value || !subscription.value?.trialEndsAt) return 0
    const trialEnd = subscription.value.trialEndsAt.toDate()
    const now = new Date()
    const diff = trialEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const isActive = computed(() =>
    status.value === 'active' || status.value === 'trialing'
  )

  function canAdd(resource: keyof PlanLimits, currentCount: number): boolean {
    const limit = limits.value[resource]
    if (typeof limit === 'boolean') return limit
    return currentCount < limit
  }

  function requiresPlan(minPlan: PlanTier): boolean {
    const currentIndex = TIER_ORDER.indexOf(plan.value)
    const requiredIndex = TIER_ORDER.indexOf(minPlan)
    return currentIndex < requiredIndex
  }

  return {
    plan,
    status,
    limits,
    isTrialing,
    isActive,
    trialDaysLeft,
    canAdd,
    requiresPlan,
    subscription,
    userDoc,
  }
}
```

- [ ] **Step 2: Run type check**

Run: `pnpm --filter=@repo/modules type-check`
Expected: PASS (no type errors)

- [ ] **Step 3: Commit**

```bash
git add packages/modules/plans/useSubscription.ts
git commit -m "feat(modules): add useSubscription composable for plan checks"
```

---

## Chunk 2: Billing API (`apps/billing-api`)

> Independent — no dependencies on Chunk 1. Can be built in parallel.

### Task 3: Billing API Scaffolding

**Files:**
- Create: `apps/billing-api/package.json`
- Create: `apps/billing-api/tsconfig.json`
- Create: `apps/billing-api/vercel.json`
- Create: `apps/billing-api/.env.example`
- Create: `apps/billing-api/src/lib/stripe.ts`
- Create: `apps/billing-api/src/lib/firebase.ts`
- Create: `apps/billing-api/src/middleware/auth.ts`
- Create: `apps/billing-api/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "billing-api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.7.0",
    "stripe": "^17.5.0",
    "@hono/node-server": "^1.13.0"
  },
  "devDependencies": {
    "@repo/firebase-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "tsx": "^4.19.0",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
}
```

- [ ] **Step 4: Create .env.example**

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ENGINEER_MONTHLY=price_...
STRIPE_PRICE_ENGINEER_ANNUAL=price_...
STRIPE_PRICE_CONDUCTOR_MONTHLY=price_...
STRIPE_PRICE_CONDUCTOR_ANNUAL=price_...
CORS_ALLOWED_ORIGINS=http://localhost:3011
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
VITE_FIREBASE_PROJECT_ID=
```

- [ ] **Step 5: Create src/lib/stripe.ts**

```typescript
// apps/billing-api/src/lib/stripe.ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

export function getPriceId(plan: 'engineer' | 'conductor', cycle: 'monthly' | 'annual'): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`
  const priceId = process.env[key]
  if (!priceId) throw new Error(`Missing env var: ${key}`)
  return priceId
}
```

- [ ] **Step 6: Create src/lib/firebase.ts**

```typescript
// apps/billing-api/src/lib/firebase.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}

export const db = getFirestore()
export const auth = getAuth()
```

- [ ] **Step 7: Create src/middleware/auth.ts**

```typescript
// apps/billing-api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/firebase'

interface AuthContext {
  uid: string
  email: string
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }

  const token = header.slice(7)
  try {
    const decoded = await auth.verifyIdToken(token)
    c.set('auth', { uid: decoded.uid, email: decoded.email ?? '' })
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})
```

- [ ] **Step 8: Create src/index.ts**

```typescript
// apps/billing-api/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { subscribeRoute } from './routes/subscribe'
import { webhookRoute } from './routes/webhook'
import { billingPortalRoute } from './routes/billing-portal'
import { changePlanRoute } from './routes/change-plan'

const app = new Hono()

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3011')
  .split(',')
  .map(o => o.trim())

app.use('/api/*', cors({
  origin: allowedOrigins,
  allowMethods: ['POST'],
  allowHeaders: ['Authorization', 'Content-Type'],
}))

app.route('/api', subscribeRoute)
app.route('/api', webhookRoute)
app.route('/api', billingPortalRoute)
app.route('/api', changePlanRoute)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`
Expected: Dependencies installed, no errors

- [ ] **Step 10: Commit**

```bash
git add apps/billing-api/
git commit -m "feat(billing-api): scaffold Hono app with Stripe and Firebase libs"
```

---

### Task 4: Billing API Routes

**Files:**
- Create: `apps/billing-api/src/routes/subscribe.ts`
- Create: `apps/billing-api/src/routes/webhook.ts`
- Create: `apps/billing-api/src/routes/billing-portal.ts`
- Create: `apps/billing-api/src/routes/change-plan.ts`

- [ ] **Step 1: Create subscribe.ts**

```typescript
// apps/billing-api/src/routes/subscribe.ts
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
    // 1. Create Stripe customer
    customer = await stripe.customers.create({
      email,
      metadata: { firebaseUid: uid },
    })

    // 2. Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // 3. Create subscription with trial
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

    // 4. Write to Firestore
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
      // Retry once — webhook provides eventual consistency fallback
      try {
        await db.doc(`users/${uid}`).set(
          { email, displayName: null, subscription: subscriptionData, createdAt: FieldValue.serverTimestamp() },
          { merge: true }
        )
      } catch (retryErr) {
        console.error('Firestore write failed after retry:', retryErr)
        // Continue — webhook will sync eventually
      }
    }

    // 5. Extract clientSecret for SCA if needed
    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string; status?: string } } | null
    const clientSecret = invoice?.payment_intent?.client_secret ?? null
    const requiresAction = invoice?.payment_intent?.status === 'requires_action'

    return c.json({
      subscriptionId: subscription.id,
      status: requiresAction ? 'requires_action' : subscription.status,
      clientSecret,
    })
  } catch (err) {
    // Clean up orphaned customer if subscription creation failed
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
```

- [ ] **Step 2: Create webhook.ts**

```typescript
// apps/billing-api/src/routes/webhook.ts
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

  // Resolve plan from price ID
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_ENGINEER_MONTHLY ?? '']: 'engineer',
    [process.env.STRIPE_PRICE_ENGINEER_ANNUAL ?? '']: 'engineer',
    [process.env.STRIPE_PRICE_CONDUCTOR_MONTHLY ?? '']: 'conductor',
    [process.env.STRIPE_PRICE_CONDUCTOR_ANNUAL ?? '']: 'conductor',
  }
  const plan = priceMap[priceId] ?? 'hobbyist'

  // Resolve billing cycle
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
```

- [ ] **Step 3: Create billing-portal.ts**

```typescript
// apps/billing-api/src/routes/billing-portal.ts
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
```

- [ ] **Step 4: Create change-plan.ts**

```typescript
// apps/billing-api/src/routes/change-plan.ts
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
```

- [ ] **Step 5: Run type check**

Run: `pnpm --filter=billing-api type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/billing-api/src/routes/
git commit -m "feat(billing-api): add subscribe, webhook, billing-portal, and change-plan routes"
```

---

## Chunk 3: Onboarding Wizard Modifications

> Depends on Chunk 1 (plans module types/constants). Can start after Task 1 is complete.

### Task 5: PlanStep.vue — Plan Selection Component

**Files:**
- Create: `apps/cloud/src/Onboarding/steps/PlanStep.vue`

- [ ] **Step 1: Create PlanStep.vue**

Create a Vuetify-based plan selection step with three `v-card` plan cards and a monthly/annual toggle. The component should:
- Display three plan cards using `PLAN_DISPLAY` from `@repo/modules`
- Include a `v-btn-toggle` for monthly/annual billing cycle
- Highlight the Engineer plan as "Most Popular"
- Show price, features list, and limits for each plan
- For Hobbyist selection: write `{ subscription: { plan: 'hobbyist', status: 'active', ... null fields }, email, displayName, createdAt }` directly to Firestore `users/{uid}`
- Emit `complete` with `{ plan, billingCycle }` payload
- Use `@deja-tailwind` and `@vuetify` skill styling conventions
- Follow `<script setup lang="ts">` pattern

Key imports: `PLAN_DISPLAY`, `PLAN_LIMITS`, `PlanTier`, `BillingCycle` from `@repo/modules`, plus `useCurrentUser` from `vuefire`, `doc`, `setDoc`, `serverTimestamp` from `firebase/firestore`.

- [ ] **Step 2: Verify component renders**

Run: `pnpm --filter=deja-cloud dev` and navigate to `/onboarding`
Expected: Plan cards display correctly (manual check)

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Onboarding/steps/PlanStep.vue
git commit -m "feat(cloud): add PlanStep onboarding component with plan selection cards"
```

---

### Task 6: PaymentStep.vue — Stripe Elements Payment Form

**Files:**
- Create: `apps/cloud/src/Onboarding/steps/PaymentStep.vue`
- Modify: `apps/cloud/package.json` (add `@stripe/stripe-js` dependency)

- [ ] **Step 1: Add @stripe/stripe-js dependency**

Run: `pnpm --filter=deja-cloud add @stripe/stripe-js`

- [ ] **Step 2: Create PaymentStep.vue**

Create a Stripe Elements payment form component. The component should:
- Accept props: `plan` (PlanTier), `billingCycle` (BillingCycle)
- Lazy-load `@stripe/stripe-js` via `const { loadStripe } = await import('@stripe/stripe-js')`
- Initialize Stripe with `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`
- Mount a CardElement using Stripe Elements
- On submit: create PaymentMethod → call `POST ${VITE_BILLING_API_URL}/api/subscribe` with Firebase ID token in Authorization header
- Handle SCA: if response `status === 'requires_action'`, call `stripe.confirmCardSetup(clientSecret)`
- Show inline error messages for card declined, SCA failure, network errors
- Show "Start 14-Day Free Trial" as the submit button text
- Show plan name and price summary above the card form
- Emit `complete` on success
- Use Vuetify components (`v-card`, `v-btn`, `v-alert`) for layout and error display

Key imports: `useCurrentUser` from `vuefire`, `getIdToken` from `firebase/auth`, plan types from `@repo/modules`.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/package.json apps/cloud/src/Onboarding/steps/PaymentStep.vue
git commit -m "feat(cloud): add PaymentStep with Stripe Elements and SCA handling"
```

---

### Task 7: Modify OnboardingWizard.vue — 5-Step Flow

**Files:**
- Modify: `apps/cloud/src/Onboarding/OnboardingWizard.vue` (currently 40 lines)

- [ ] **Step 1: Update OnboardingWizard.vue**

Modify the existing wizard to include 5 steps:
1. Keep step 1 (WelcomeStep) unchanged
2. Add step 2 (PlanStep) — emits `complete` with `{ plan, billingCycle }`
3. Add step 3 (PaymentStep) — receives `plan` and `billingCycle` as props. If plan is 'hobbyist', programmatically skip to step 4 (set `currentStep` to 4 in the PlanStep complete handler)
4. Keep step 4 (LayoutStep, was step 2) unchanged
5. Keep step 5 (ServerStep, was step 3) — routes to 'pending-approval'

Add imports for `PlanStep`, `PaymentStep`, and reactive state for `selectedPlan` (ref<PlanTier>) and `selectedBillingCycle` (ref<BillingCycle | null>).

In the stepper UI, step 3 should show as greyed out with subtitle "Not required" when `selectedPlan === 'hobbyist'`.

- [ ] **Step 2: Verify the full flow**

Run: `pnpm --filter=deja-cloud dev` and test onboarding flow manually
Expected: 5-step stepper displays, Hobbyist skips payment step

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Onboarding/OnboardingWizard.vue
git commit -m "feat(cloud): update onboarding wizard from 3 to 5 steps with plan/payment"
```

---

## Chunk 4: Frontend Gating & UI

> Depends on Chunk 1 (useSubscription composable). Can start after Task 2 is complete.

### Task 8: Trial Banner

**Files:**
- Modify: `apps/cloud/src/App.vue` (~line 70, inside template after AppHeader)

- [ ] **Step 1: Add trial banner to App.vue**

After the `<AppHeader>` component (around line 87 in the template), add a trial banner that:
- Only shows when `isTrialing` is true (from `useSubscription()`)
- Displays: plan name, days remaining, "You won't be charged until the trial ends"
- Has a "Manage subscription" link that navigates to Settings
- Uses `v-banner` or a styled `v-alert` with `type="info"` and cyan color

Add `useSubscription` import from `@repo/modules` to the script section.

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/App.vue
git commit -m "feat(cloud): add trial banner to app header"
```

---

### Task 9: Settings Billing Section

**Files:**
- Modify: `apps/cloud/src/Settings/Settings.vue` (currently 73 lines, all placeholder)

- [ ] **Step 1: Add billing section to Settings.vue**

Add a "Billing & Subscription" section to the settings page that shows:
- Current plan name, price, and billing cycle using `useSubscription()`
- Status badge using `v-chip` (TRIALING=cyan, ACTIVE=green, PAST_DUE=red)
- Trial end date or next charge date (formatted with `toLocaleDateString`)
- "Upgrade" button (visible for hobbyist/engineer) — calls `POST /api/change-plan` or navigates to an upgrade flow
- "Manage in Stripe" button — calls `POST /api/billing-portal`, then opens returned URL in new tab

Import `useSubscription`, `PLAN_DISPLAY` from `@repo/modules`. Use `getIdToken` from `firebase/auth` for API calls.

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/Settings/Settings.vue
git commit -m "feat(cloud): add billing section to settings page"
```

---

### Task 10: Plan Gating Components (UpgradeBanner & PlanGate)

**Files:**
- Create: `apps/cloud/src/components/UpgradeBanner.vue`
- Create: `apps/cloud/src/components/PlanGate.vue`

- [ ] **Step 1: Create UpgradeBanner.vue**

A reusable component for showing upgrade prompts when at resource limits. Props:
- `resource: string` — human-readable name (e.g., "locomotives")
- `currentCount: number`
- `limit: number`
- `requiredPlan: PlanTier`

Shows: "{currentCount} / {limit} max" with a "Upgrade to {planName} for more" CTA linking to settings.

- [ ] **Step 2: Create PlanGate.vue**

A wrapper component that shows locked state when a feature requires a higher plan. Props:
- `requiredPlan: PlanTier`

Uses `useSubscription().requiresPlan()`. If the user has the required plan, renders the default slot. Otherwise shows a locked state with plan badge and upgrade button.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/components/UpgradeBanner.vue apps/cloud/src/components/PlanGate.vue
git commit -m "feat(cloud): add UpgradeBanner and PlanGate reusable components"
```

---

## Chunk 5: Environment & Migration

> Can be done in parallel with other chunks.

### Task 11: Environment Variables & Migration Script

**Files:**
- Modify: `.env.example` (add 2 lines at bottom)
- Create: `scripts/migrate-users-to-plans.ts`

- [ ] **Step 1: Update .env.example**

Add to the end of `.env.example`:

```
# Billing / Stripe
VITE_BILLING_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

- [ ] **Step 2: Create migration script**

```typescript
// scripts/migrate-users-to-plans.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import 'dotenv/config'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()
const auth = getAuth()

async function migrate() {
  console.log('Starting user migration to plans...')
  let created = 0
  let skipped = 0
  let errors = 0
  let nextPageToken: string | undefined

  do {
    const listResult = await auth.listUsers(1000, nextPageToken)

    for (const user of listResult.users) {
      try {
        const userDoc = await db.doc(`users/${user.uid}`).get()
        if (userDoc.exists) {
          skipped++
          continue
        }

        await db.doc(`users/${user.uid}`).set({
          email: user.email ?? '',
          displayName: user.displayName ?? null,
          createdAt: FieldValue.serverTimestamp(),
          subscription: {
            plan: 'hobbyist',
            status: 'active',
            billingCycle: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialEndsAt: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: FieldValue.serverTimestamp(),
          },
        })
        created++
      } catch (err) {
        errors++
        console.error(`Failed to migrate user ${user.uid}:`, err)
      }
    }

    nextPageToken = listResult.pageToken
  } while (nextPageToken)

  console.log(`Migration complete: ${created} created, ${skipped} skipped, ${errors} errors`)
}

migrate().catch(console.error)
```

- [ ] **Step 3: Commit**

```bash
git add .env.example scripts/migrate-users-to-plans.ts
git commit -m "feat: add env vars for Stripe and user migration script"
```

---

## Execution Order & Parallelism

```
Chunk 1 (Plans Module)  ──┐
                           ├──► Chunk 3 (Onboarding Steps) ──► Chunk 4 (Frontend Gating)
Chunk 2 (Billing API)  ───┘
Chunk 5 (Env & Migration)  ──► (independent, anytime)
```

**Can run in parallel:**
- Chunk 1 + Chunk 2 + Chunk 5 (all independent)
- Chunk 3 + Chunk 4 (after Chunk 1 completes, both can start)

**Sequential dependencies:**
- Chunk 3 depends on Chunk 1 (Task 1 specifically)
- Chunk 4 depends on Chunk 1 (Task 2 specifically)
- Full integration testing requires all chunks
