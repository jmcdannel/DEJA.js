<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'
import { PLAN_DISPLAY } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const props = defineProps<{
  plan: PlanTier
  billingCycle: BillingCycle
}>()

const emit = defineEmits<{
  complete: []
}>()

const user = useCurrentUser()
const loading = ref(false)
const stripeLoading = ref(true)
const error = ref<string | null>(null)
const stripeReady = ref(false)
const cardComplete = ref(false)
const cardElementRef = ref<HTMLDivElement | null>(null)

// Local billing cycle — can be switched to annual via upsell
const activeBillingCycle = ref<BillingCycle>(props.billingCycle)

const planInfo = PLAN_DISPLAY[props.plan]
const monthlyPrice = planInfo.monthlyPrice
const annualPrice = planInfo.annualPrice

const priceLabel = computed(() =>
  activeBillingCycle.value === 'annual'
    ? `$${annualPrice}/yr`
    : `$${monthlyPrice}/mo`
)
const savingsNote = computed(() =>
  activeBillingCycle.value === 'annual'
    ? `($${(annualPrice / 12).toFixed(2)}/mo — save $${(monthlyPrice * 12 - annualPrice)})`
    : null
)
const annualSavings = monthlyPrice * 12 - annualPrice
const showAnnualUpsell = computed(() => activeBillingCycle.value === 'monthly' && annualSavings > 0)

let stripe: import('@stripe/stripe-js').Stripe | null = null
let cardElement: import('@stripe/stripe-js').StripeCardElement | null = null

onMounted(async () => {
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
      error.value = 'Failed to load Stripe. Please check your internet connection and try again.'
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
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
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
  } catch (err) {
    error.value = 'Failed to initialize payment form. Please refresh and try again.'
    stripeLoading.value = false
  }
})

onUnmounted(() => {
  cardElement?.destroy()
})

async function handleSubmit() {
  if (!stripe || !cardElement || !user.value) return
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
        plan: props.plan,
        billingCycle: activeBillingCycle.value,
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

    emit('complete')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="payment-step">
    <div class="payment-container">
      <!-- Order Summary -->
      <div class="summary-card mb-6">
        <h3 class="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">Order Summary</h3>
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="text-lg font-semibold text-sky-100">{{ planInfo.name }} Plan</p>
            <p class="text-sm text-slate-400">{{ activeBillingCycle === 'annual' ? 'Annual' : 'Monthly' }} billing</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-sky-100">{{ priceLabel }}</p>
            <p v-if="savingsNote" class="text-xs text-emerald-400">{{ savingsNote }}</p>
          </div>
        </div>

        <div class="divider-line my-4" />

        <ul class="space-y-2">
          <li v-for="feature in planInfo.features" :key="feature" class="flex items-start gap-2 text-sm text-slate-400">
            <v-icon size="16" color="primary" class="mt-0.5 flex-shrink-0">mdi-check</v-icon>
            {{ feature }}
          </li>
        </ul>
      </div>

      <!-- Annual Upsell -->
      <div v-if="showAnnualUpsell" class="upsell-card mb-6" @click="activeBillingCycle = 'annual'">
        <div class="flex items-start gap-3">
          <v-icon color="amber" size="22" class="mt-0.5 flex-shrink-0">mdi-star-four-points</v-icon>
          <div class="flex-1">
            <p class="text-sm font-semibold text-sky-100 mb-1">Save ${{ annualSavings }}/year with annual billing</p>
            <p class="text-xs text-slate-400">
              Pay <strong class="text-sky-200">${{ annualPrice }}/yr</strong> instead of ${{ monthlyPrice * 12 }}/yr
              — that's just <strong class="text-sky-200">${{ (annualPrice / 12).toFixed(2) }}/mo</strong>.
            </p>
          </div>
          <v-btn variant="tonal" color="amber" size="small" class="text-none flex-shrink-0">
            Switch
          </v-btn>
        </div>
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

        <!-- Stripe loading state -->
        <template v-if="stripeLoading">
          <div class="card-element-container mb-5 flex items-center justify-center gap-3">
            <v-progress-circular size="20" width="2" indeterminate color="primary" />
            <span class="text-sm text-slate-400">Loading payment form...</span>
          </div>
        </template>

        <!-- Stripe loaded -->
        <template v-else-if="stripeReady">
          <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Card Information</p>
          <div
            ref="cardElementRef"
            class="card-element-container mb-5"
          />
        </template>

        <!-- Stripe failed to load -->
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
          @click="handleSubmit"
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
</template>

<style scoped>
.payment-step {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.payment-container {
  width: 100%;
  max-width: 480px;
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

.upsell-card {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}
.upsell-card:hover {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.12);
}
</style>
