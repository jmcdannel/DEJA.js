<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { PLAN_DISPLAY, TIER_ORDER } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const emit = defineEmits<{
  complete: [payload: { plan: PlanTier; billingCycle: BillingCycle | null }]
}>()

const user = useCurrentUser()
const db = useFirestore()
const billingCycle = ref<BillingCycle>('monthly')
const loading = ref(false)
const showCompare = ref(false)

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
  ctaText: string
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
      { text: 'Remote monitoring', included: false },
      { text: 'Tour App', included: false },
      { text: 'Direct support', included: false },
    ],
    ctaText: 'Choose Hobbyist',
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
      { text: 'Remote monitoring via secure tunnel', included: true },
      { text: 'Basic macros & scheduling', included: true, partial: true },
      { text: 'Community forum access', included: true },
      { text: 'Support tickets', included: true, tag: '72hr SLA' },
      { text: 'Tour App', included: false },
      { text: 'Early feature access', included: false },
    ],
    ctaText: 'Choose Engineer',
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
      { text: 'Remote monitoring via secure tunnel', included: true },
      { text: 'Tour App included', included: true },
      { text: 'Advanced macros & automations', included: true },
      { text: 'Priority support', included: true, tag: '24hr SLA' },
      { text: '1 setup session / month', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Beta testing & feedback program', included: true },
    ],
    ctaText: 'Choose Conductor',
    featured: false,
  },
])

function displayPrice(plan: PlanCard) {
  if (plan.tier === 'hobbyist') return '0'
  return billingCycle.value === 'annual'
    ? `${plan.annualPrice}`
    : `${plan.monthlyPrice}`
}

function pricePeriod(plan: PlanCard) {
  if (plan.tier === 'hobbyist') return '/mo'
  return billingCycle.value === 'annual' ? '/yr' : '/mo'
}

function priceNote(plan: PlanCard) {
  return billingCycle.value === 'annual' ? plan.annualPriceNote : plan.priceNote
}

async function selectPlan(tier: PlanTier) {
  loading.value = true

  try {
    if (tier === 'hobbyist') {
      if (user.value) {
        await setDoc(doc(db, 'users', user.value.uid), {
          email: user.value.email ?? '',
          displayName: user.value.displayName ?? null,
          createdAt: serverTimestamp(),
          subscription: {
            plan: 'hobbyist',
            status: 'active',
            billingCycle: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialEndsAt: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: serverTimestamp(),
          },
        }, { merge: true })
      }

      emit('complete', { plan: 'hobbyist', billingCycle: null })
    } else {
      emit('complete', { plan: tier, billingCycle: billingCycle.value })
    }
  } catch (err) {
    console.error('Failed to select plan:', err)
    // Still emit complete even if Firestore write fails — we can retry later
    emit('complete', { plan: tier, billingCycle: tier === 'hobbyist' ? null : billingCycle.value })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="plan-step">
    <!-- Toggle -->
    <div class="flex justify-center mb-8">
      <div class="toggle-wrap">
        <button
          class="toggle-btn"
          :class="{ active: billingCycle === 'monthly' }"
          @click="billingCycle = 'monthly'"
        >
          Monthly
        </button>
        <button
          class="toggle-btn"
          :class="{ active: billingCycle === 'annual' }"
          @click="billingCycle = 'annual'"
        >
          Annual
          <span class="save-badge">SAVE 20%</span>
        </button>
      </div>
    </div>

    <!-- Cards -->
    <div class="plan-cards">
      <div
        v-for="plan in planCards"
        :key="plan.tier"
        class="plan-card"
        :class="{ featured: plan.featured }"
      >
        <div v-if="plan.featured" class="featured-badge">Most Popular</div>

        <div class="tier-label">{{ plan.label }}</div>
        <div class="tier-name font-display" :class="{ 'text-sky-400': plan.featured }">
          {{ plan.name }}
        </div>

        <div class="price-wrap">
          <span class="price-dollar">$</span>
          <span class="price-amount">{{ displayPrice(plan) }}</span>
          <span class="price-period">{{ pricePeriod(plan) }}</span>
        </div>
        <div class="price-note">{{ priceNote(plan) }}</div>

        <div class="divider" />

        <ul class="features">
          <li
            v-for="(feature, i) in plan.features"
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
              {{ feature.included ? (feature.partial ? '~' : '✓') : '✕' }}
            </span>
            <span>{{ feature.text }}</span>
            <span v-if="feature.tag" class="limit-tag" :class="{ 'limit-tag--featured': plan.featured }">
              {{ feature.tag }}
            </span>
          </li>
        </ul>

        <button
          class="cta-btn"
          :disabled="loading"
          @click="selectPlan(plan.tier)"
        >
          {{ plan.ctaText }} →
        </button>
      </div>
    </div>

    <!-- Compare CTA -->
    <div class="text-center mt-8">
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
              <tr><td>WiThrottle Protocol</td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>DCC-EX Command Station</td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Multi-throttle sessions</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>

              <tr class="section-head"><td colspan="4">// Layout Management</td></tr>
              <tr><td>Locos</td><td class="text-center"><span class="tc-p">5 max</span></td><td class="text-center"><span class="tc-p">25 max</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
              <tr><td>Turnouts &amp; Signals</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">15 each</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
              <tr><td>Effects &amp; Sounds</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">15 each</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
              <tr><td>Layout configurations</td><td class="text-center"><span class="tc-p">1</span></td><td class="text-center"><span class="tc-p">2</span></td><td class="text-center"><span class="tc-p">Unlimited</span></td></tr>
              <tr><td>Macros &amp; Scheduling</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">Basic</span></td><td class="text-center"><span class="tc-p">Advanced</span></td></tr>

              <tr class="section-head"><td colspan="4">// Cloud &amp; Data</td></tr>
              <tr><td>Firebase cloud sync</td><td class="text-center"><span class="tc-p">Limited</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Multi-device access</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>

              <tr class="section-head"><td colspan="4">// Apps &amp; Features</td></tr>
              <tr><td>Tour App</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Early feature access</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Beta testing program</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>

              <tr class="section-head"><td colspan="4">// Support</td></tr>
              <tr><td>AI chatbot &amp; docs</td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Community forum</td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td><td class="text-center"><span class="tc-y">✓</span></td></tr>
              <tr><td>Support tickets</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">72hr SLA</span></td><td class="text-center"><span class="tc-p">24hr SLA</span></td></tr>
              <tr><td>Setup sessions</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">1/mo</span></td></tr>
              <tr><td>Additional support</td><td class="text-center"><span class="tc-n">✕</span></td><td class="text-center"><span class="tc-p">$20/incident</span></td><td class="text-center"><span class="tc-p">$20/incident</span></td></tr>
            </tbody>
          </table>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showCompare = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.plan-step {
  padding: 0 4px;
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
}
@media (max-width: 960px) {
  .plan-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
  .plan-card.featured {
    transform: none;
  }
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

/* ── FEATURED BADGE ── */
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
  display: block;
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
}
.cta-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cta-btn:not(:disabled) {
  background: #38bdf8;
  color: #020617;
}
.cta-btn:hover:not(:disabled) {
  background: #7dd3fc;
  box-shadow: 0 4px 24px rgba(56, 189, 248, 0.3);
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
.compare-table tbody tr:last-child td {
  border-bottom: none;
}
.compare-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
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
