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

const plans = computed(() =>
  TIER_ORDER.map((tier) => ({
    tier,
    ...PLAN_DISPLAY[tier],
    price: billingCycle.value === 'annual'
      ? PLAN_DISPLAY[tier].annualPrice
      : PLAN_DISPLAY[tier].monthlyPrice,
    priceLabel: billingCycle.value === 'annual'
      ? `$${PLAN_DISPLAY[tier].annualPrice}/yr`
      : `$${PLAN_DISPLAY[tier].monthlyPrice}/mo`,
  }))
)

async function selectPlan(tier: PlanTier) {
  if (!user.value) return
  loading.value = true

  try {
    if (tier === 'hobbyist') {
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

      emit('complete', { plan: 'hobbyist', billingCycle: null })
    } else {
      emit('complete', { plan: tier, billingCycle: billingCycle.value })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="text-center mb-6">
      <h2 class="text-h5 font-weight-bold mb-2">Choose Your Plan</h2>
      <p class="text-body-2 text-medium-emphasis">Start free, upgrade anytime</p>
      <v-btn-toggle v-model="billingCycle" mandatory class="mt-4" density="compact" variant="outlined">
        <v-btn value="monthly" size="small">Monthly</v-btn>
        <v-btn value="annual" size="small">Annual (save ~20%)</v-btn>
      </v-btn-toggle>
    </div>

    <v-row>
      <v-col v-for="plan in plans" :key="plan.tier" cols="12" md="4">
        <v-card
          :elevation="plan.tier === 'engineer' ? 8 : 2"
          :class="{ 'border-primary': plan.tier === 'engineer' }"
          class="h-100 d-flex flex-column"
        >
          <v-chip
            v-if="plan.tier === 'engineer'"
            color="primary"
            size="small"
            class="align-self-center mt-n3"
            style="position: absolute; top: 0; z-index: 1;"
          >
            Most Popular
          </v-chip>

          <v-card-title class="text-center pt-6">
            {{ plan.name }}
          </v-card-title>

          <v-card-subtitle class="text-center">
            {{ plan.description }}
          </v-card-subtitle>

          <v-card-text class="text-center flex-grow-0">
            <div class="text-h4 font-weight-bold my-4">
              <template v-if="plan.tier === 'hobbyist'">Free</template>
              <template v-else>{{ plan.priceLabel }}</template>
            </div>
          </v-card-text>

          <v-card-text class="flex-grow-1">
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-for="feature in plan.features" :key="feature" :title="feature" prepend-icon="mdi-check" />
            </v-list>
          </v-card-text>

          <v-card-actions class="justify-center pb-4">
            <v-btn
              :color="plan.tier === 'engineer' ? 'primary' : 'default'"
              :variant="plan.tier === 'engineer' ? 'elevated' : 'tonal'"
              :loading="loading"
              block
              @click="selectPlan(plan.tier)"
            >
              {{ plan.tier === 'hobbyist' ? 'Get Started' : 'Start Free Trial' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
