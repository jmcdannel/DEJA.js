<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { Logo, DejaTracker } from '@repo/ui'
import PlanStep from './steps/PlanStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import LayoutStep from './steps/LayoutStep.vue'
import InstallStep from './steps/InstallStep.vue'
import { TIER_ORDER, useOnboarding } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const router = useRouter()
const route = useRoute()
const user = useCurrentUser()
const currentStep = ref(1)
const { setPlanSelected, setLayoutCreated, setInstallStarted } = useOnboarding()

const userLayouts = useCollection(
  computed(() =>
    user.value?.email
      ? query(collection(db, 'layouts'), where('owner', '==', user.value.email))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id ?? '')
const selectedPlan = ref<PlanTier>('hobbyist')
const selectedBillingCycle = ref<BillingCycle>('monthly')

onMounted(async () => {
  const planParam = route.query.plan as string | undefined
  const billingParam = route.query.billing as string | undefined

  if (planParam && TIER_ORDER.includes(planParam as PlanTier)) {
    const plan = planParam as PlanTier
    selectedPlan.value = plan
    if (billingParam === 'annual' || billingParam === 'monthly') {
      selectedBillingCycle.value = billingParam
    }

    if (plan === 'hobbyist') {
      // Auto-create hobbyist subscription and skip to layout step
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
      setPlanSelected() // 🔥 fire-and-forget — persist onboarding progress
      currentStep.value = 3
    } else {
      setPlanSelected() // 🔥 fire-and-forget — persist onboarding progress
      currentStep.value = 2
    }
  }
})

// 🚀 Mark install step started when user reaches step 4
watch(currentStep, (step) => {
  if (step === 4) {
    setInstallStarted() // 🔥 fire-and-forget — persist onboarding progress
  }
})

function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  selectedPlan.value = payload.plan
  selectedBillingCycle.value = payload.billingCycle ?? 'monthly'
  setPlanSelected() // 🔥 fire-and-forget — persist onboarding progress

  if (payload.plan === 'hobbyist') {
    currentStep.value = 3
  } else {
    currentStep.value = 2
  }
}

function handlePaymentComplete() {
  currentStep.value = 3
}

function handleLayoutComplete() {
  setLayoutCreated() // 🔥 fire-and-forget — persist onboarding progress
  currentStep.value = 4
}

function handleInstallComplete() {
  router.push({ name: 'home' })
}

const steps = computed(() => [
  { value: 0, title: 'Create Account', icon: 'mdi-account-plus-outline', disabled: false },
  { value: 1, title: 'Choose Plan', icon: 'mdi-tag-outline', disabled: false },
  { value: 2, title: 'Payment', icon: 'mdi-credit-card-outline', disabled: selectedPlan.value === 'hobbyist' },
  { value: 3, title: 'Register Layout', icon: 'mdi-map-marker-path', disabled: false },
  { value: 4, title: 'Install', icon: 'mdi-download-outline', disabled: false },
])
</script>

<template>
  <v-container class="max-w-5xl mx-auto py-8">
    <div class="flex flex-col items-center mb-8">
      <Logo size="xl" :show-icon="true" variant="cloud" app-title="Cloud" class="mb-2" />
      <p class="opacity-60 text-sm">
        Time to put the "smart" in your choo-choos. Let's get you on the rails.
      </p>
    </div>

    <DejaTracker
      :active-step="currentStep"
      :show-status="currentStep === 4"
      class="mb-8"
    />

    <div class="animate-deja-fade-in" :key="currentStep">
      <PlanStep v-if="currentStep === 1" @complete="handlePlanComplete" />

      <template v-else-if="currentStep === 2">
        <PaymentStep
          v-if="selectedPlan !== 'hobbyist'"
          :plan="selectedPlan"
          :billing-cycle="selectedBillingCycle"
          @complete="handlePaymentComplete"
        />
        <div v-else class="text-center py-8 opacity-60">
          No payment required for the Hobbyist plan.
        </div>
      </template>

      <LayoutStep v-else-if="currentStep === 3" @complete="handleLayoutComplete" />

      <InstallStep
        v-else-if="currentStep === 4"
        :uid="user?.uid"
        :layout-id="primaryLayoutId"
        @complete="handleInstallComplete"
      />
    </div>
  </v-container>
</template>

