<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { Logo, DejaTracker } from '@repo/ui'
import NameLayoutStep from './steps/NameLayoutStep.vue'
import PlanStep from './steps/PlanStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import InstallStep from './steps/InstallStep.vue'
import { TIER_ORDER, useOnboarding } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const router = useRouter()
const route = useRoute()
const user = useCurrentUser()
const currentStep = ref(1)
const { state: onboardingState, setLayoutNamed, setPlanSelected, setInstallStarted } = useOnboarding()

const userLayouts = useCollection(
  computed(() =>
    user.value?.email
      ? query(collection(db, 'layouts'), where('owner', '==', user.value.email))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id ?? '')

// Layout info collected in step 1, used in step 4 (install) to create the layout
const pendingLayoutName = ref('')
const pendingLayoutId = ref('')

const selectedPlan = ref<PlanTier>('hobbyist')
const selectedBillingCycle = ref<BillingCycle>('monthly')

// Restore state from Firestore if user returns mid-onboarding
onMounted(() => {
  const os = onboardingState.value
  if (os.layoutNamed && os.pendingLayoutName && os.pendingLayoutId) {
    pendingLayoutName.value = os.pendingLayoutName
    pendingLayoutId.value = os.pendingLayoutId

    if (os.planSelected) {
      currentStep.value = 4
    } else {
      currentStep.value = 2
    }
  }

  // Handle deep-link query params (e.g., /onboarding?plan=engineer)
  const planParam = route.query.plan as string | undefined
  const billingParam = route.query.billing as string | undefined
  if (planParam && TIER_ORDER.includes(planParam as PlanTier)) {
    selectedPlan.value = planParam as PlanTier
    if (billingParam === 'annual' || billingParam === 'monthly') {
      selectedBillingCycle.value = billingParam
    }
  }
})

// Smooth scroll to top + mark install step on step change
watch(currentStep, (step) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (step === 4) {
    setInstallStarted()
  }
})

// Step 1: Name Layout complete
function handleNameComplete(payload: { name: string; id: string }) {
  pendingLayoutName.value = payload.name
  pendingLayoutId.value = payload.id
  setLayoutNamed(payload.name, payload.id)
  currentStep.value = 2
}

// Step 2: Plan selection complete
function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  selectedPlan.value = payload.plan
  selectedBillingCycle.value = payload.billingCycle ?? 'monthly'
  setPlanSelected()

  if (payload.plan === 'hobbyist') {
    if (user.value) {
      setDoc(doc(db, 'users', user.value.uid), {
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
    currentStep.value = 4
  } else {
    currentStep.value = 3
  }
}

// Step 3: Payment complete
function handlePaymentComplete() {
  currentStep.value = 4
}

// Step 4: Install complete → go to dashboard
function handleInstallComplete() {
  router.push({ name: 'home' })
}

// Steps config for visual tracker
const steps = computed(() => [
  { value: 0, title: 'Create Account', icon: 'mdi-account-plus-outline', disabled: false },
  { value: 1, title: 'Name Layout', icon: 'mdi-map-marker-path', disabled: false },
  { value: 2, title: 'Choose Plan', icon: 'mdi-tag-outline', disabled: false },
  { value: 3, title: 'Payment', icon: 'mdi-credit-card-outline', disabled: selectedPlan.value === 'hobbyist' },
  { value: 4, title: 'Install', icon: 'mdi-download-outline', disabled: false },
])

// Map wizard currentStep to DejaTracker activeStep
const trackerStep = computed(() => {
  if (currentStep.value <= 1) return 1  // Name Layout
  if (currentStep.value === 2) return 2 // Plan
  if (currentStep.value === 3) return 2 // Payment = still on plan visually
  return 3                               // Install
})
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
      :active-step="trackerStep"
      :show-status="currentStep === 4"
      compact
      class="mb-8"
    />

    <Transition name="step-fade" mode="out-in">
      <div :key="currentStep">
        <!-- Step 1: Name your layout -->
        <NameLayoutStep v-if="currentStep === 1" @complete="handleNameComplete" />

        <!-- Step 2: Choose a plan (or skip) -->
        <PlanStep v-else-if="currentStep === 2" @complete="handlePlanComplete" />

        <!-- Step 3: Payment (paid plans only) -->
        <template v-else-if="currentStep === 3">
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

        <!-- Step 4: Install (creates layout + starts server detection) -->
        <InstallStep
          v-else-if="currentStep === 4"
          :uid="user?.uid"
          :layout-id="pendingLayoutId || primaryLayoutId"
          :layout-name="pendingLayoutName"
          @complete="handleInstallComplete"
        />
      </div>
    </Transition>
  </v-container>
</template>

<style scoped>
.step-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.step-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
