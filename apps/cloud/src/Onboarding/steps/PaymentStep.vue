<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
const error = ref<string | null>(null)
const cardElementRef = ref<HTMLDivElement | null>(null)

const planInfo = PLAN_DISPLAY[props.plan]
const priceLabel = props.billingCycle === 'annual'
  ? `$${planInfo.annualPrice}/yr`
  : `$${planInfo.monthlyPrice}/mo`

let stripe: import('@stripe/stripe-js').Stripe | null = null
let cardElement: import('@stripe/stripe-js').StripeCardElement | null = null

onMounted(async () => {
  const { loadStripe } = await import('@stripe/stripe-js')
  stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  if (!stripe) {
    error.value = 'Failed to load payment processor'
    return
  }

  const elements = stripe.elements()
  cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': { color: '#888888' },
      },
    },
  })

  if (cardElementRef.value) {
    cardElement.mount(cardElementRef.value)
  }
})

onUnmounted(() => {
  cardElement?.destroy()
})

async function handleSubmit() {
  if (!stripe || !cardElement || !user.value) return

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
    const billingApiUrl = import.meta.env.VITE_BILLING_API_URL

    const response = await fetch(`${billingApiUrl}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan: props.plan,
        billingCycle: props.billingCycle,
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
  <div>
    <v-card class="mx-auto" max-width="500">
      <v-card-title class="text-center">
        Complete Your Subscription
      </v-card-title>

      <v-card-subtitle class="text-center">
        {{ planInfo.name }} plan — {{ priceLabel }}
      </v-card-subtitle>

      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Your 14-day free trial starts today. You won't be charged until it ends.
        </v-alert>

        <div class="text-subtitle-2 mb-2">Card Details</div>
        <div
          ref="cardElementRef"
          class="pa-4 rounded border"
          style="background: rgba(255,255,255,0.05); min-height: 44px;"
        />

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!stripe"
          block
          @click="handleSubmit"
        >
          Start 14-Day Free Trial
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
