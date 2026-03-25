# Onboarding + Stripe Pricing Integration — Design Spec

**Date:** 2026-03-11
**Status:** Draft
**Scope:** Modify onboarding to include plan selection and Stripe payment, add billing API, implement frontend plan gating

---

## 1. Overview

Integrate Stripe-based subscription billing into the DEJA.js cloud app onboarding flow. Users select a pricing plan during onboarding, enter payment info via embedded Stripe Elements (paid tiers get a 14-day free trial), and plan limits are enforced in the frontend UI.

### Pricing Tiers

| Tier | Monthly | Annual | Key Limits |
|------|---------|--------|------------|
| Hobbyist | Free | Free | 5 locos, 1 layout, no turnouts/signals/effects |
| Engineer | $7/mo | $67/yr | 25 locos, 15 turnouts/signals/effects, 2 layouts |
| Conductor | $18/mo | $173/yr | Unlimited everything, Tour App access |

### Key Decisions

- **Plan selection:** New step in onboarding wizard (between Welcome and Layout creation)
- **Payment method:** Stripe Elements embedded in onboarding wizard (not redirect)
- **Trial:** 14-day free trial for paid plans, card collected upfront
- **Billing backend:** New `apps/billing-api` (Hono on Vercel)
- **Plan data:** Stripe webhooks sync to `users/{userId}.subscription` in Firestore
- **Enforcement:** Frontend-only gating (backend enforcement deferred)
- **Approval flow:** Kept for all tiers (safety net)

---

## 2. Modified Onboarding Flow

### Current Flow (3 steps)
1. Welcome → 2. Create Layout → 3. Server Setup → Pending Approval

### New Flow (5 steps)
1. **Welcome** — Unchanged. Greeting with user display name.
2. **Choose Plan** (new) — Three Vuetify `v-card` plan cards with monthly/annual toggle. Shows plan name, price, key features, and limits. Monthly/annual toggle uses `v-btn-toggle`.
3. **Payment** (new) — Behavior depends on selected plan:
   - **Hobbyist:** Step is programmatically skipped — the wizard advances directly from step 2 to step 4. The stepper UI shows 5 steps but step 3 appears greyed out with label "Not required" for Hobbyist users.
   - **Engineer/Conductor:** Stripe Elements card form with "Start 14-Day Free Trial" button. Creates Stripe customer + subscription via billing-api.
4. **Create Layout** — Existing `LayoutStep`. Layout name + ID creation.
5. **Server Setup** — Existing `ServerStep`. Choose DEJA.js Server or WiThrottle. Redirects to `/pending-approval`.

### Rationale
- Plan step before layout creation so tier limits are known when creating the layout.
- Stripe subscription created with `trial_period_days: 14` — card collected upfront but not charged for 14 days.
- Plan stored on `users/{userId}.subscription` immediately after Stripe confirms (or immediately for Hobbyist), before layout step.

### Error Handling During Payment (Step 3)

**Card declined or Stripe API error:**
- `PaymentStep.vue` displays an inline error message below the card form (e.g., "Your card was declined. Please try a different card.")
- User can re-enter card details and retry without leaving the step
- The "Start Free Trial" button re-enables after an error

**3D Secure / SCA required:**
- After `POST /api/subscribe` returns `{ clientSecret, status: 'requires_action' }`, the frontend calls `stripe.confirmCardSetup(clientSecret)`
- Stripe.js opens the 3D Secure authentication modal
- On success: wizard advances to step 4
- On failure: inline error "Authentication failed. Please try again or use a different card."
- On modal close (user cancels): no error, user remains on step 3 and can retry

**Network error:**
- Generic "Connection error. Please try again." message with retry button
- No partial state — if customer was created but subscription failed, the endpoint catches this and deletes the orphaned customer before returning the error

**Navigation:**
- User can click "Back" to return to step 2 (Plan selection) and choose a different plan
- Stripe Elements form state resets when returning from step 2

---

## 3. Data Model

### Firestore: `users/{userId}` — New Collection

**Important:** The `users/` Firestore collection does not exist today. It must be created as part of this work.

**When documents are created:**
- **Hobbyist:** `PlanStep.vue` writes `{ subscription: { plan: "hobbyist", status: "active" }, email, displayName, createdAt }` directly to Firestore when the user selects Hobbyist and advances. No billing-api call needed.
- **Paid plans:** `POST /api/subscribe` creates the document after successful Stripe subscription creation.
- **Existing users (migration):** A one-time migration script writes `{ subscription: { plan: "hobbyist", status: "active" } }` to all existing Firebase Auth users who don't have a `users/` document. This runs before the feature launches.

### Subscription Fields

```typescript
interface UserSubscription {
  plan: 'hobbyist' | 'engineer' | 'conductor'
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
  billingCycle: 'monthly' | 'annual' | null       // null for Hobbyist
  stripeCustomerId: string | null                  // null for Hobbyist
  stripeSubscriptionId: string | null              // null for Hobbyist
  trialEndsAt: Timestamp | null                    // null for Hobbyist
  currentPeriodEnd: Timestamp | null               // null for Hobbyist
  cancelAtPeriodEnd: boolean                       // false for Hobbyist
  updatedAt: Timestamp
}
```

### Plan Limits Constants

Located in `packages/modules/plans/constants.ts`:

```typescript
export const PLAN_LIMITS = {
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
```

**Note:** Features listed on the pricing page that are not yet implemented (macros, scheduling, multi-device access) are omitted from `PLAN_LIMITS`. They will be added when those features are built.

### Stripe Products & Prices

Create in Stripe Dashboard (or via API during setup):

| Product | Price ID (monthly) | Price ID (annual) |
|---------|-------------------|-------------------|
| Engineer Plan | `price_engineer_monthly` | `price_engineer_annual` |
| Conductor Plan | `price_conductor_monthly` | `price_conductor_annual` |

Exact price IDs will be generated by Stripe and stored in billing-api environment variables.

---

## 4. Billing API (`apps/billing-api`)

### Stack
- **Hono** (lightweight TypeScript web framework) with `hono/cors` middleware
- **Stripe SDK** (`stripe` npm package)
- **Firebase Admin SDK** (`firebase-admin`) for Firestore writes and auth token verification
- **Deployed to Vercel** (serverless functions)

### Authentication Middleware

All endpoints except `/api/webhooks/stripe` require a Firebase ID token:

```
Authorization: Bearer <Firebase ID token>
```

The `middleware/auth.ts` middleware:
1. Extracts the bearer token from the `Authorization` header
2. Calls `admin.auth().verifyIdToken(token)` to verify and decode
3. Attaches `{ uid, email }` from the decoded token to the request context
4. Returns `401 Unauthorized` with `{ error: "Invalid or expired token" }` on failure

**Security principle:** `userId` and `email` are always extracted from the verified token, never accepted from the request body. This prevents spoofing.

### CORS Configuration

Hono CORS middleware configured with:
- **Allowed origins:** Cloud app origin(s) — `https://deja-cloud.vercel.app`, `http://localhost:3011` (dev)
- **Allowed methods:** `POST`
- **Allowed headers:** `Authorization, Content-Type`
- Origins are configured via environment variable `CORS_ALLOWED_ORIGINS` (comma-separated)

### Endpoints

#### `POST /api/subscribe`
**Called from:** Onboarding Payment step
**Auth:** Firebase ID token (userId and email extracted from token)
**Input:**
```typescript
{
  plan: 'engineer' | 'conductor'
  billingCycle: 'monthly' | 'annual'
  paymentMethodId: string  // from Stripe Elements
}
```
**Flow:**
1. Extract `uid` and `email` from verified auth token
2. Create Stripe customer (`stripe.customers.create`) with `email` and `metadata: { firebaseUid: uid }`
3. Attach payment method to customer (`stripe.paymentMethods.attach` + set as default)
4. Create subscription with `trial_period_days: 14` and appropriate price ID
5. Write `subscription` object to `users/{uid}` in Firestore
6. Return `{ subscriptionId, status, clientSecret }` — `clientSecret` is the `latest_invoice.payment_intent.client_secret` (present if SCA/3D Secure is required; null if trial starts without immediate charge)

**Error recovery:** If step 5 (Firestore write) fails after Stripe subscription creation, the endpoint retries the Firestore write once. If it fails again, it returns the subscription data anyway — the webhook handler (`customer.subscription.updated`) will sync the data on the next Stripe event, providing eventual consistency.

**Orphaned customer cleanup:** If subscription creation (step 4) fails after customer creation (step 2), the endpoint deletes the Stripe customer before returning the error response.

#### `POST /api/webhooks/stripe`
**Called from:** Stripe (automatic)
**Auth:** Stripe webhook signature verification (`stripe.webhooks.constructEvent`)
**Handles events:**
- `customer.subscription.created` — initial sync (backup for subscribe endpoint)
- `customer.subscription.updated` — sync status, plan, period dates to Firestore
- `customer.subscription.deleted` — set plan to `hobbyist`, status to `canceled`, clear Stripe IDs
- `invoice.payment_failed` — set status to `past_due`
- `invoice.paid` — set status to `active`

**Idempotency:** Webhook handlers are idempotent — they overwrite the Firestore `subscription` fields with the current Stripe state. Duplicate webhook deliveries produce the same result. No deduplication logic is needed.

**User lookup:** The `customer.metadata.firebaseUid` field is used to map Stripe events to Firestore `users/{uid}` documents.

#### `POST /api/billing-portal`
**Called from:** Cloud app Settings page
**Auth:** Firebase ID token (userId extracted from token)
**Input:** None — the `stripeCustomerId` is looked up from `users/{uid}.subscription.stripeCustomerId` in Firestore
**Returns:** `{ url: string }` — Stripe Billing Portal URL for managing subscription, payment methods, invoices, cancellation

#### `POST /api/change-plan`
**Called from:** Cloud app upgrade prompts / Settings
**Auth:** Firebase ID token (userId extracted from token)
**Input:** `{ newPlan: 'engineer' | 'conductor', billingCycle: 'monthly' | 'annual' }`
**Flow:**
1. Look up `stripeSubscriptionId` from `users/{uid}.subscription` in Firestore
2. Resolve `newPriceId` from `newPlan` + `billingCycle` using env var mapping
3. Update Stripe subscription with new price (`stripe.subscriptions.update`)
4. Webhook fires and syncs changes to Firestore
5. Return `{ status: 'updated' }`

### Environment Variables

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ENGINEER_MONTHLY=price_...
STRIPE_PRICE_ENGINEER_ANNUAL=price_...
STRIPE_PRICE_CONDUCTOR_MONTHLY=price_...
STRIPE_PRICE_CONDUCTOR_ANNUAL=price_...
CORS_ALLOWED_ORIGINS=https://deja-cloud.vercel.app,http://localhost:3011
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

**Firebase Admin init:** Uses the same env var pattern as `@repo/firebase-config/firebase-admin-node.ts` (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `VITE_FIREBASE_PROJECT_ID`) so the existing initialization code can be reused via `@repo/firebase-config`.

### Vercel Configuration

`apps/billing-api/vercel.json`:
```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }],
  "framework": null,
  "installCommand": "pnpm install --filter=billing-api...",
  "buildCommand": "pnpm --filter=billing-api build"
}
```

---

## 5. Frontend Integration

### New Module: `packages/modules/plans/`

New module within `@repo/modules` containing:

- `constants.ts` — `PLAN_LIMITS`, `PlanTier` type, price display values
- `types.ts` — `UserSubscription` interface, `PlanTier` union type
- `useSubscription.ts` — composable for plan-related checks

### `useSubscription()` Composable

```typescript
const {
  plan,           // ref<PlanTier>
  status,         // ref<SubscriptionStatus>
  limits,         // computed — PLAN_LIMITS[plan.value]
  isTrialing,     // computed boolean
  trialDaysLeft,  // computed number
  canAdd,         // (resource: keyof PlanLimits, currentCount: number) => boolean
  requiresPlan,   // (minPlan: PlanTier) => boolean
} = useSubscription()
```

Reads from VueFire reactive binding on `users/{userId}` document. No additional Firebase queries needed.

**`canAdd` usage:** Each consuming component is responsible for providing `currentCount`. This is typically the `.length` of the reactive Firestore collection already loaded by that component's composable (e.g., `useLocos().locos.value.length`, `useTurnouts().turnouts.value.length`).

### Stripe.js Loading

`@stripe/stripe-js` is lazy-loaded only in `PaymentStep.vue` via dynamic import:
```typescript
const { loadStripe } = await import('@stripe/stripe-js')
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```
This avoids adding Stripe to the main bundle — it only loads during onboarding when a paid plan is selected.

### Onboarding Components

New files in `apps/cloud/src/Onboarding/steps/`:

- `PlanStep.vue` — Three Vuetify `v-card` plan cards with `v-btn-toggle` for monthly/annual. Emits selected plan + billing cycle. For Hobbyist selection, writes user document to Firestore directly.
- `PaymentStep.vue` — Stripe Elements card form using `@stripe/stripe-js`. Calls `POST /api/subscribe`. Shows "Start 14-Day Free Trial" button. Handles SCA via `stripe.confirmCardSetup()`. Displays inline errors on failure with retry capability.

Modified files:
- `OnboardingWizard.vue` — Add steps 2 and 3, update stepper from 3 to 5 steps. Handle programmatic skip of step 3 for Hobbyist.

### Gating Patterns

**Pattern 1: Disabled Add Button** — When user is at resource limit
- Show count indicator (e.g., "5 / 5 max")
- Disable "Add" button
- Show upgrade CTA below (e.g., "Upgrade to Engineer for up to 25 locos")

**Pattern 2: Locked Feature Section** — When entire feature is unavailable on plan
- Show section title with plan badge (e.g., "ENGINEER")
- Lock icon with explanation
- Upgrade button with price

### Trial Banner

Shown in the cloud app header during the 14-day trial period:
- Displays plan name and days remaining
- "You won't be charged until the trial ends" reassurance
- Link to manage subscription

### Settings: Billing Section

New section in Cloud app Settings page:
- Current plan name, price, billing cycle
- Status badge (TRIALING / ACTIVE / PAST_DUE)
- Trial end date or next charge date
- "Upgrade to Conductor" button (for Engineer users)
- "Manage in Stripe" button → opens Stripe Billing Portal

### Where Gating Applies

| App | Gating |
|-----|--------|
| Cloud App | All resource limits (locos, turnouts, signals, effects, sounds, routes, layouts). Lock entire sections for Hobbyist. |
| Throttle App | Loco count limit — disable "Add Locomotive" when at cap |
| Tour App | Conductor-only — locked state for lower tiers |
| Nav/Sidebar | Plan badge + locked indicators next to gated menu items |

---

## 6. New Files & Modified Files

### New Files

```
apps/billing-api/
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
└── src/
    ├── index.ts              # Hono app entry point with CORS middleware
    ├── routes/
    │   ├── subscribe.ts      # POST /api/subscribe
    │   ├── webhook.ts        # POST /api/webhooks/stripe
    │   ├── billing-portal.ts # POST /api/billing-portal
    │   └── change-plan.ts    # POST /api/change-plan
    ├── lib/
    │   ├── stripe.ts         # Stripe client initialization
    │   └── firebase.ts       # Firebase Admin initialization (reuses @repo/firebase-config pattern)
    └── middleware/
        └── auth.ts           # Firebase ID token verification → extracts uid/email

packages/modules/plans/
├── constants.ts              # PLAN_LIMITS, tier metadata, price display values
├── types.ts                  # UserSubscription, PlanTier, PlanLimits types
├── useSubscription.ts        # Composable for plan checks
└── index.ts                  # Barrel export

apps/cloud/src/Onboarding/steps/
├── PlanStep.vue              # Plan selection cards (Vuetify v-card + v-btn-toggle)
└── PaymentStep.vue           # Stripe Elements payment form with SCA handling
```

### Modified Files

```
apps/cloud/src/Onboarding/OnboardingWizard.vue  # 3→5 steps, Hobbyist skip logic
apps/cloud/src/views/SettingsView.vue            # Add billing section (or new BillingSettings component)
apps/cloud/src/App.vue (or layout)               # Trial banner in header
packages/modules/index.ts                        # Export plans module
.env.example                                     # Add VITE_BILLING_API_URL, VITE_STRIPE_PUBLISHABLE_KEY
```

**Note:** `pnpm-workspace.yaml` does not need modification — it already uses `"apps/*"` glob which covers `apps/billing-api`.

---

## 7. Dependencies

### `apps/billing-api`
- `hono` — web framework
- `stripe` — Stripe Node.js SDK
- `firebase-admin` — Firestore writes from webhooks (via `@repo/firebase-config`)

### `apps/cloud` (additions)
- `@stripe/stripe-js` — Stripe Elements for embedded payment form (lazy-loaded)

### Stripe Dashboard Setup
- Create Engineer and Conductor products with monthly + annual prices
- Configure webhook endpoint pointing to `billing-api` Vercel URL
- Enable Customer Portal in Stripe settings

---

## 8. Migration: Existing Users

A one-time migration script (`scripts/migrate-users-to-plans.ts`) runs before the feature launches:

1. List all Firebase Auth users via Admin SDK
2. For each user without a `users/{uid}` Firestore document, create one with:
   ```json
   { "subscription": { "plan": "hobbyist", "status": "active", "billingCycle": null, "stripeCustomerId": null, "stripeSubscriptionId": null, "trialEndsAt": null, "currentPeriodEnd": null, "cancelAtPeriodEnd": false, "updatedAt": "<now>" } }
   ```
3. Log results (created count, skipped count, errors)

---

## 9. Out of Scope (Deferred)

- Backend enforcement via Firebase security rules or server-side checks
- Removing the admin approval flow
- Coupon/discount code support
- Team/organization billing
- Usage-based billing
- Rate limiting on billing-api endpoints (Vercel provides basic DDoS protection)
- Email notifications for trial expiry or payment failures (Stripe handles basic emails)
- Gating for unimplemented features (macros, scheduling, multi-device) — added to PLAN_LIMITS when built
