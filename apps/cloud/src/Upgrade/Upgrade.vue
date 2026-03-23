<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY, TIER_ORDER } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'
import { PageHeader } from '@repo/ui'

const router = useRouter()
const user = useCurrentUser()
const { plan, subscription, status } = useSubscription()

const billingCycle = ref<BillingCycle>('monthly')
const selectedPlan = ref<PlanTier | null>(null)
const loading = ref(false)
const changePlanLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const showCompare = ref(false)

// Stripe Elements state
const stripeLoading = ref(true)
const stripeReady = ref(false)
const cardComplete = ref(false)
const cardElementRef = ref<HTMLDivElement | null>(null)

let stripe: import('@stripe/stripe-js').Stripe | null = null
let cardElement: import('@stripe/stripe-js').StripeCardElement | null = null

const hasStripeSubscription = computed(() => !!subscription.value?.stripeCustomerId)

const currentTierIndex = computed(() => TIER_ORDER.indexOf(plan.value))

interface PlanFeature {
  text: string
  included: boolean
  partial?: boolean
  tag?: string
}

interface PlanCard {
  tier: PlanTier
  label: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  priceNote: string
  annualPriceNote: string
  features: PlanFeature[]
  featured: boolean
}

const planCards = computed<PlanCard[]>(() => [
  {
    tier: 'hobbyist',
    label: '// Free',
    name: 'Hobbyist',
    description: PLAN_DISPLAY.hobbyist.description,
    monthlyPrice: 0,
    annualPrice: 0,
    priceNote: 'Free forever. No credit card required.',
    annualPriceNote: 'Free forever. No credit card required.',
    features: [
      { text: 'WiThrottle + DCC-EX throttle', included: true },
      { text: 'Limited cloud account', included: true, tag: '5 locos' },
      { text: 'Firebase onboarding flow', included: true },
      { text: 'Docs & AI support chatbot', included: true },
      { text: 'Turnouts & signals', included: false },
      { text: 'Effects & sounds', included: false },
      { text: 'Tour App', included: false },
      { text: 'Direct support', included: false },
    ],
    featured: false,
  },
  {
    tier: 'engineer',
    label: '// Recommended',
    name: 'Engineer',
    description: PLAN_DISPLAY.engineer.description,
    monthlyPrice: 7,
    annualPrice: 67,
    priceNote: 'Billed monthly. Cancel anytime.',
    annualPriceNote: 'Billed annually. Cancel anytime.',
    features: [
      { text: 'Everything in Hobbyist', included: true },
      { text: 'Full cloud access', included: true, tag: '25 locos' },
      { text: 'Turnouts & Signals', included: true, tag: '15 each' },
      { text: 'Effects & Sounds', included: true, tag: '15 each' },
      { text: '2 layout configurations', included: true },
      { text: 'Basic macros & scheduling', included: true, partial: true },
      { text: 'Community forum access', included: true },
      { text: 'Support tickets', included: true, tag: '72hr SLA' },
      { text: 'Tour App', included: false },
      { text: 'Early feature access', included: false },
    ],
    featured: true,
  },
  {
    tier: 'conductor',
    label: '// Pro',
    name: 'Conductor',
    description: PLAN_DISPLAY.conductor.description,
    monthlyPrice: 18,
    annualPrice: 173,
    priceNote: 'Includes 1 setup session (~$40 value).',
    annualPriceNote: 'Includes 1 setup session + 2 months free.',
    features: [
      { text: 'Everything in Engineer', included: true },
      { text: 'Unlimited locos, turnouts, signals', included: true },
      { text: 'Unlimited effects & sounds', included: true },
      { text: 'Unlimited layouts', included: true },
      { text: 'Tour App included', included: true },
      { text: 'Advanced macros & automations', included: true },
      { text: 'Priority support', included: true, tag: '24hr SLA' },
      { text: '1 setup session / month', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Beta testing program', included: true },
    ],
    featured: false,
  },
])

function tierRelation(tier: PlanTier): 'current' | 'upgrade' | 'downgrade' {
  const targetIndex = TIER_ORDER.indexOf(tier)
  if (targetIndex === currentTierIndex.value) return 'current'
  return targetIndex > currentTierIndex.value ? 'upgrade' : 'downgrade'
}

function ctaLabel(card: PlanCard): string {
  const relation = tierRelation(card.tier)
  if (relation === 'current') return 'Current Plan'
  if (relation === 'downgrade') return 'Manage in Stripe'
  return `Upgrade to ${card.name}`
}

function ctaIcon(card: PlanCard): string {
  const relation = tierRelation(card.tier)
  if (relation === 'current') return 'mdi-check-circle'
  if (relation === 'downgrade') return 'mdi-open-in-new'
  return 'mdi-arrow-up-bold'
}

function displayPrice(p: PlanCard) {
  if (p.tier === 'hobbyist') return '0'
  return billingCycle.value === 'annual' ? `${p.annualPrice}` : `${p.monthlyPrice}`
}

function pricePeriod(p: PlanCard) {
  if (p.tier === 'hobbyist') return '/mo'
  return billingCycle.value === 'annual' ? '/yr' : '/mo'
}

function priceNote(p: PlanCard) {
  return billingCycle.value === 'annual' ? p.annualPriceNote : p.priceNote
}

// Initialize Stripe for new subscriptions
async function initStripe() {
  try {
    const { loadStripe } = await import('@stripe/stripe-js')
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      error.value = 'Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.'
      stripeLoading.value = false
      return
    }

    stripe = await loadStripe(key)
    if (!stripe) {
      error.value = 'Failed to load Stripe. Please check your internet connection.'
      stripeLoading.value = false
      return
    }

    const elements = stripe.elements()
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#e0f2fe',
          iconColor: '#38bdf8',
          fontFamily: 'Inter, system-ui, sans-serif',
          '::placeholder': { color: 'rgba(148, 163, 184, 0.5)' },
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
      },
    })

    cardElement.on('change', (event) => {
      cardComplete.value = event.complete
      if (event.error) {
        error.value = event.error.message
      } else {
        error.value = null
      }
    })

    stripeLoading.value = false
    stripeReady.value = true
    await nextTick()

    if (cardElementRef.value) {
      cardElement.mount(cardElementRef.value)
    }
  } catch {
    error.value = 'Failed to initialize payment form. Please refresh and try again.'
    stripeLoading.value = false
  }
}

onUnmounted(() => {
  cardElement?.destroy()
})

function handleCardClick(card: PlanCard) {
  const relation = tierRelation(card.tier)
  if (relation === 'current') return
  if (relation === 'downgrade') {
    openBillingPortal()
    return
  }

  // Upgrade flow
  if (hasStripeSubscription.value) {
    changePlan(card.tier)
  } else {
    selectedPlan.value = card.tier
    initStripe()
  }
}

// Change plan for existing Stripe customers
async function changePlan(newPlan: PlanTier) {
  if (!user.value) return
  changePlanLoading.value = true
  error.value = null

  try {
    const token = await getIdToken(user.value)

    const res = await fetch('/api/change-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newPlan, billingCycle: billingCycle.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.error ?? 'Failed to change plan'
      return
    }

    success.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    changePlanLoading.value = false
  }
}

// Subscribe for first-time paid users (hobbyist upgrading)
async function handleNewSubscription() {
  if (!stripe || !cardElement || !user.value || !selectedPlan.value) return
  if (!cardComplete.value) {
    error.value = 'Please complete your card details'
    return
  }

  loading.value = true
  error.value = null

  try {
    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (pmError) {
      error.value = pmError.message ?? 'Card validation failed'
      return
    }

    const token = await getIdToken(user.value)

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan: selectedPlan.value,
        billingCycle: billingCycle.value,
        paymentMethodId: paymentMethod.id,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error ?? 'Subscription creation failed'
      return
    }

    if (data.status === 'requires_action' && data.clientSecret) {
      const { error: scaError } = await stripe.confirmCardSetup(data.clientSecret)
      if (scaError) {
        error.value = scaError.message ?? 'Card authentication failed'
        return
      }
    }

    success.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

const portalLoading = ref(false)

async function openBillingPortal() {
  if (!user.value) return
  portalLoading.value = true
  try {
    const token = await getIdToken(user.value)
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
    }
  } finally {
    portalLoading.value = false
  }
}

function cancelPayment() {
  selectedPlan.value = null
  error.value = null
  cardElement?.destroy()
  cardElement = null
  stripe = null
  stripeReady.value = false
  stripeLoading.value = true
}
</script>

<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader title="Upgrade" icon="mdi-arrow-up-bold-circle" color="amber">
      <template #actions>
        <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" class="text-none" @click="router.back()">
          Back
        </v-btn>
      </template>
    </PageHeader>

    <!-- Success State -->
    <div v-if="success" class="upgrade-success">
      <div class="success-card">
        <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
        <h2 class="text-2xl font-bold text-sky-100 mb-2">Plan Updated!</h2>
        <p class="text-slate-400 mb-6">
          Your subscription has been updated. Changes take effect immediately.
        </p>
        <v-btn color="primary" variant="tonal" class="text-none" @click="router.push({ name: 'Settings' })">
          Back to Settings
        </v-btn>
      </div>
    </div>

    <!-- Payment Step (for new subscriptions) -->
    <div v-else-if="selectedPlan" class="payment-view">
      <div class="payment-container">
        <!-- Back button -->
        <button class="back-link mb-6" @click="cancelPayment">
          <v-icon size="16">mdi-arrow-left</v-icon>
          Back to plans
        </button>

        <!-- Order Summary -->
        <div class="summary-card mb-6">
          <h3 class="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">Order Summary</h3>
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-lg font-semibold text-sky-100">{{ PLAN_DISPLAY[selectedPlan].name }} Plan</p>
              <p class="text-sm text-slate-400">{{ billingCycle === 'annual' ? 'Annual' : 'Monthly' }} billing</p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-sky-100">
                ${{ billingCycle === 'annual' ? PLAN_DISPLAY[selectedPlan].annualPrice : PLAN_DISPLAY[selectedPlan].monthlyPrice }}{{ billingCycle === 'annual' ? '/yr' : '/mo' }}
              </p>
            </div>
          </div>
          <div class="divider-line my-4" />
          <ul class="space-y-2">
            <li v-for="feature in PLAN_DISPLAY[selectedPlan].features" :key="feature" class="flex items-start gap-2 text-sm text-slate-400">
              <v-icon size="16" color="primary" class="mt-0.5 flex-shrink-0">mdi-check</v-icon>
              {{ feature }}
            </li>
          </ul>
        </div>

        <!-- Payment Card -->
        <div class="payment-card">
          <div class="flex items-center gap-3 mb-5">
            <v-icon color="primary" size="24">mdi-credit-card-outline</v-icon>
            <h2 class="text-lg font-semibold text-sky-100">Payment Details</h2>
          </div>

          <v-alert type="info" variant="tonal" density="compact" class="mb-5">
            <template #text>
              Your <strong>14-day free trial</strong> starts today. You won't be charged until it ends.
            </template>
          </v-alert>

          <template v-if="stripeLoading">
            <div class="card-element-container mb-5 flex items-center justify-center gap-3">
              <v-progress-circular size="20" width="2" indeterminate color="primary" />
              <span class="text-sm text-slate-400">Loading payment form...</span>
            </div>
          </template>

          <template v-else-if="stripeReady">
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Card Information</p>
            <div ref="cardElementRef" class="card-element-container mb-5" />
          </template>

          <template v-else>
            <v-alert type="warning" variant="tonal" density="compact" class="mb-5">
              {{ error || 'Payment form could not be loaded.' }}
            </v-alert>
          </template>

          <v-alert v-if="error && stripeReady" type="error" variant="tonal" density="compact" class="mb-5">
            {{ error }}
          </v-alert>

          <v-btn
            color="primary"
            size="large"
            block
            :loading="loading"
            :disabled="!stripeReady || !cardComplete || loading"
            class="text-none font-weight-bold"
            @click="handleNewSubscription"
          >
            <v-icon start>mdi-lock</v-icon>
            Start 14-Day Free Trial
          </v-btn>

          <div class="flex items-center justify-center gap-2 mt-4">
            <v-icon size="14" class="text-slate-500">mdi-shield-check</v-icon>
            <span class="text-xs text-slate-500">Secured by Stripe. Cancel anytime.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Selection -->
    <template v-else>
      <!-- Current plan banner -->
      <div class="current-plan-banner">
        <div class="flex items-center gap-3">
          <v-icon size="20" color="primary">mdi-account-circle</v-icon>
          <div>
            <span class="text-sm text-sky-100 font-medium">
              You're on the <strong>{{ PLAN_DISPLAY[plan].name }}</strong> plan
            </span>
            <span v-if="status !== 'active'" class="ml-2">
              <v-chip :color="status === 'trialing' ? 'info' : 'warning'" size="x-small" variant="tonal" class="uppercase tracking-wider">{{ status }}</v-chip>
            </span>
          </div>
        </div>
        <v-btn v-if="hasStripeSubscription" variant="text" size="small" prepend-icon="mdi-open-in-new" :loading="portalLoading" class="text-none text-slate-400" @click="openBillingPortal">
          Manage Billing
        </v-btn>
      </div>

      <!-- Billing cycle toggle -->
      <div class="flex justify-center mb-2">
        <div class="toggle-wrap">
          <button class="toggle-btn" :class="{ active: billingCycle === 'monthly' }" @click="billingCycle = 'monthly'">
            Monthly
          </button>
          <button class="toggle-btn" :class="{ active: billingCycle === 'annual' }" @click="billingCycle = 'annual'">
            Annual
            <span class="save-badge">SAVE 20%</span>
          </button>
        </div>
      </div>

      <!-- Error -->
      <v-alert v-if="error" type="error" variant="tonal" density="compact" closable class="mx-4" @click:close="error = null">
        {{ error }}
      </v-alert>

      <!-- Plan cards -->
      <div class="plan-cards">
        <div
          v-for="card in planCards"
          :key="card.tier"
          class="plan-card"
          :class="{
            featured: card.featured,
            'plan-card--current': tierRelation(card.tier) === 'current',
          }"
        >
          <div v-if="card.featured" class="featured-badge">Most Popular</div>
          <div v-if="tierRelation(card.tier) === 'current'" class="current-badge">Your Plan</div>

          <div class="tier-label">{{ card.label }}</div>
          <div class="tier-name font-display" :class="{ 'text-sky-400': card.featured }">
            {{ card.name }}
          </div>

          <div class="price-wrap">
            <span class="price-dollar">$</span>
            <span class="price-amount">{{ displayPrice(card) }}</span>
            <span class="price-period">{{ pricePeriod(card) }}</span>
          </div>
          <div class="price-note">{{ priceNote(card) }}</div>

          <div class="divider" />

          <ul class="features">
            <li
              v-for="(feature, i) in card.features"
              :key="i"
              :class="{ dim: !feature.included }"
            >
              <span
                class="check-icon"
                :class="{
                  yes: feature.included && !feature.partial,
                  no: !feature.included,
                  partial: feature.partial,
                }"
              >
                {{ feature.included ? (feature.partial ? '~' : '&#10003;') : '&#10005;' }}
              </span>
              <span>{{ feature.text }}</span>
              <span v-if="feature.tag" class="limit-tag" :class="{ 'limit-tag--featured': card.featured }">
                {{ feature.tag }}
              </span>
            </li>
          </ul>

          <button
            class="cta-btn"
            :class="{
              'cta-btn--current': tierRelation(card.tier) === 'current',
              'cta-btn--downgrade': tierRelation(card.tier) === 'downgrade',
            }"
            :disabled="tierRelation(card.tier) === 'current' || changePlanLoading"
            @click="handleCardClick(card)"
          >
            <v-icon v-if="changePlanLoading && tierRelation(card.tier) === 'upgrade'" size="18" class="mr-1 animate-spin">mdi-loading</v-icon>
            <v-icon v-else size="18" class="mr-1">{{ ctaIcon(card) }}</v-icon>
            {{ ctaLabel(card) }}
          </button>
        </div>
      </div>

      <!-- Compare link -->
      <div class="text-center mt-6 mb-4">
        <button class="compare-cta" @click="showCompare = true">
          <v-icon size="small" class="mr-1">mdi-table</v-icon>
          View Full Feature Breakdown
        </button>
      </div>

      <!-- Comparison Modal -->
      <v-dialog v-model="showCompare" max-width="900" scrollable>
        <v-card class="bg-[#0f172a] border border-white/10">
          <v-card-title class="font-display text-2xl text-sky-100 pa-6 pb-0">
            Full Feature Breakdown
          </v-card-title>
          <v-card-subtitle class="px-6 text-slate-400">
            Everything you get, spelled out clearly.
          </v-card-subtitle>
          <v-card-text class="pa-6">
            <table class="compare-table">
              <thead>
                <tr>
                  <th style="width: 40%">Feature</th>
                  <th>Hobbyist</th>
                  <th class="text-sky-400">Engineer</th>
                  <th>Conductor</th>
                </tr>
              </thead>
              <tbody>
                <tr class="section-head"><td colspan="4">// Throttle &amp; Control</td></tr>
                <tr><td>WiThrottle Protocol</td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>DCC-EX Command Station</td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Multi-throttle sessions</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>

                <tr class="section-head"><td colspan="4">// Layout Management</td></tr>
                <tr><td>Locos</td><td class="text-center"><span class="tc-p">5 max</span></td><td class="text-center"><span class="tc-p">25 max</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
                <tr><td>Turnouts &amp; Signals</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-p">15 each</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
                <tr><td>Effects &amp; Sounds</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-p">15 each</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
                <tr><td>Layout configurations</td><td class="text-center"><span class="tc-p">1</span></td><td class="text-center"><span class="tc-p">2</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
                <tr><td>Macros &amp; Scheduling</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-p">Basic</span></td><td class="text-center"><span class="tc-p">Advanced</span></td></tr>

                <tr class="section-head"><td colspan="4">// Cloud &amp; Data</td></tr>
                <tr><td>Firebase cloud sync</td><td class="text-center"><span class="tc-p">Limited</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Multi-device access</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>

                <tr class="section-head"><td colspan="4">// Apps &amp; Features</td></tr>
                <tr><td>Tour App</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Early feature access</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Beta testing program</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>

                <tr class="section-head"><td colspan="4">// Support</td></tr>
                <tr><td>AI chatbot &amp; docs</td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Community forum</td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td><td class="text-center"><span class="tc-y">&#10003;</span></td></tr>
                <tr><td>Support tickets</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-p">72hr SLA</span></td><td class="text-center"><span class="tc-p">24hr SLA</span></td></tr>
                <tr><td>Setup sessions</td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-n">&#10005;</span></td><td class="text-center"><span class="tc-p">1/mo</span></td></tr>
              </tbody>
            </table>
          </v-card-text>
          <v-card-actions class="pa-6 pt-0">
            <v-spacer />
            <v-btn variant="text" @click="showCompare = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<style scoped>
/* ── CURRENT PLAN BANNER ── */
.current-plan-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 12px 20px;
  margin: 0 16px;
}

/* ── SUCCESS STATE ── */
.upgrade-success {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}
.success-card {
  text-align: center;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 440px;
}

/* ── PAYMENT VIEW ── */
.payment-view {
  display: flex;
  justify-content: center;
  padding: 0 16px;
}
.payment-container {
  width: 100%;
  max-width: 480px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 150ms ease;
}
.back-link:hover {
  color: #38bdf8;
}

.summary-card {
  background: rgba(15, 23, 42, 0.45);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.payment-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.payment-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

.card-element-container {
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 14px 16px;
  min-height: 44px;
  transition: border-color 150ms ease;
}
.card-element-container:focus-within {
  border-color: rgba(56, 189, 248, 0.5);
}

.divider-line {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
}

/* ── TOGGLE ── */
.toggle-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 40px;
  padding: 5px 6px;
}
.toggle-btn {
  padding: 8px 20px;
  border-radius: 32px;
  border: none;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s;
  color: rgba(148, 163, 184, 0.7);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.toggle-btn.active {
  background: #38bdf8;
  color: #020617;
  font-weight: 700;
}
.save-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 20px;
  padding: 2px 6px;
  letter-spacing: 0.05em;
}

/* ── CARDS GRID ── */
.plan-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
  padding: 0 16px;
}
@media (max-width: 960px) {
  .plan-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
  .plan-card.featured { transform: none; }
}

/* ── CARD ── */
.plan-card {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 32px 24px;
  position: relative;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.plan-card:hover {
  border-color: rgba(148, 163, 184, 0.25);
  transform: translateY(-4px);
}
.plan-card.featured {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.65) 100%);
  border-color: #38bdf8;
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5);
  transform: translateY(-8px);
}
.plan-card.featured:hover {
  transform: translateY(-12px);
  box-shadow: 0 0 50px rgba(56, 189, 248, 0.3), 0 24px 70px rgba(0, 0, 0, 0.5);
}
.plan-card--current {
  border-color: rgba(34, 197, 94, 0.3);
}

/* ── BADGES ── */
.featured-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: #38bdf8;
  color: #020617;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 4px 16px;
  border-radius: 0 0 10px 10px;
}
.current-badge {
  position: absolute;
  top: -1px;
  right: 16px;
  background: #22c55e;
  color: #020617;
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 0 0 8px 8px;
}

/* ── TIER INFO ── */
.tier-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 6px;
}
.tier-name {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  margin-bottom: 16px;
  color: #e0f2fe;
}

/* ── PRICING ── */
.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
}
.price-dollar {
  font-size: 1.1rem;
  color: rgba(148, 163, 184, 0.7);
  font-weight: 300;
}
.price-amount {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  letter-spacing: -0.01em;
  line-height: 1;
  color: #f8fafc;
}
.price-period {
  font-size: 0.875rem;
  color: rgba(148, 163, 184, 0.7);
  margin-left: 2px;
}
.price-note {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.5);
  margin-bottom: 24px;
  min-height: 1.2em;
}

/* ── DIVIDER ── */
.divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
  margin-bottom: 24px;
}

/* ── FEATURES ── */
.features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
  padding: 0;
}
.features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #e0f2fe;
}
.features li.dim {
  color: rgba(148, 163, 184, 0.5);
}
.check-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 700;
}
.check-icon.yes {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.check-icon.no {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.check-icon.partial {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.limit-tag {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  padding: 1px 6px;
  color: rgba(148, 163, 184, 0.7);
  white-space: nowrap;
  align-self: center;
}
.limit-tag--featured {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

/* ── CTA BUTTONS ── */
.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
  background: #38bdf8;
  color: #020617;
}
.cta-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cta-btn:hover:not(:disabled) {
  background: #7dd3fc;
  box-shadow: 0 4px 24px rgba(56, 189, 248, 0.3);
}
.cta-btn--current {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
}
.cta-btn--current:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.12);
  box-shadow: none;
}
.cta-btn--downgrade {
  background: transparent;
  color: rgba(148, 163, 184, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.cta-btn--downgrade:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.08);
  box-shadow: none;
  color: #e0f2fe;
  border-color: rgba(148, 163, 184, 0.3);
}

/* ── COMPARE CTA ── */
.compare-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s;
}
.compare-cta:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

/* ── COMPARISON TABLE ── */
.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.compare-table thead th {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
  padding: 0 0 12px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.compare-table thead th:not(:first-child) {
  text-align: center;
}
.compare-table tbody td {
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: #e0f2fe;
}
.compare-table tbody tr:last-child td { border-bottom: none; }
.compare-table tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
.compare-table .section-head td {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #38bdf8;
  padding-top: 20px;
  border-bottom: none;
}
.tc-y { color: #22c55e; }
.tc-n { color: rgba(239, 68, 68, 0.5); }
.tc-p { color: #38bdf8; font-size: 0.75rem; font-family: 'DM Mono', monospace; }
</style>
