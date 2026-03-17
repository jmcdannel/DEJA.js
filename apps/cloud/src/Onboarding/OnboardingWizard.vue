<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { Logo } from '@repo/ui'
import PlanStep from './steps/PlanStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import LayoutStep from './steps/LayoutStep.vue'
import InstallStep from './steps/InstallStep.vue'
import { TIER_ORDER } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const router = useRouter()
const route = useRoute()
const user = useCurrentUser()
const currentStep = ref(1)

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
      currentStep.value = 3
    } else {
      currentStep.value = 2
    }
  }
})

function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  selectedPlan.value = payload.plan
  selectedBillingCycle.value = payload.billingCycle ?? 'monthly'

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
  currentStep.value = 4
}

function handleInstallComplete() {
  router.push({ name: 'setup-complete' })
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
      <p class="text-slate-400 text-sm">
        Time to put the "smart" in your choo-choos. Let's get you on the rails.
      </p>
    </div>

    <div class="stepper-container mb-8">
      <div class="stepper-track">
        <div
          v-for="(step, i) in steps"
          :key="step.value"
          class="stepper-step"
          :class="{
            'stepper-step--complete': currentStep > step.value,
            'stepper-step--active': currentStep === step.value,
            'stepper-step--pending': currentStep < step.value,
            'stepper-step--disabled': step.disabled,
            'stepper-step--clickable': currentStep > step.value && !step.disabled && step.value > 0,
          }"
          @click="currentStep > step.value && !step.disabled && step.value > 0 ? (currentStep = step.value) : undefined"
        >
          <div class="stepper-icon">
            <v-icon v-if="currentStep > step.value" size="20">mdi-check</v-icon>
            <v-icon v-else :size="20">{{ step.icon }}</v-icon>
          </div>
          <span class="stepper-label">{{ step.title }}</span>
          <div v-if="i < steps.length - 1" class="stepper-connector" :class="{ 'stepper-connector--complete': currentStep > step.value }" />
        </div>
      </div>
    </div>

    <div class="animate-deja-fade-in" :key="currentStep">
      <PlanStep v-if="currentStep === 1" @complete="handlePlanComplete" />

      <template v-else-if="currentStep === 2">
        <PaymentStep
          v-if="selectedPlan !== 'hobbyist'"
          :plan="selectedPlan"
          :billing-cycle="selectedBillingCycle"
          @complete="handlePaymentComplete"
        />
        <div v-else class="text-center py-8 text-slate-400">
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

<style scoped>
/* Custom stepper */
.stepper-container {
  max-width: 640px;
  margin: 0 auto;
}
.stepper-track {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
}
.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}

/* Icon circle */
.stepper-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: rgba(148, 163, 184, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

/* Label */
.stepper-label {
  margin-top: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.4);
  text-align: center;
  transition: color 0.3s ease;
  white-space: nowrap;
}

/* Connector line */
.stepper-connector {
  position: absolute;
  top: 22px;
  left: calc(50% + 26px);
  right: calc(-50% + 26px);
  height: 2px;
  background: rgba(148, 163, 184, 0.15);
  z-index: 1;
  transition: background 0.3s ease;
}
.stepper-connector--complete {
  background: linear-gradient(90deg, #22d3ee, #38bdf8);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
}

/* Clickable (completed steps) */
.stepper-step--clickable {
  cursor: pointer;
}
.stepper-step--clickable:hover .stepper-icon {
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.5), 0 0 6px rgba(34, 211, 238, 0.3);
  transform: scale(1.08);
}

/* Complete state — cyan glow */
.stepper-step--complete .stepper-icon {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.3), 0 0 4px rgba(34, 211, 238, 0.2);
}
.stepper-step--complete .stepper-label {
  color: #22d3ee;
}

/* Active state — bright cyan pulse */
.stepper-step--active .stepper-icon {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.2);
  color: #e0f2fe;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), 0 0 8px rgba(56, 189, 248, 0.3);
  animation: step-pulse 2s ease-in-out infinite;
}
.stepper-step--active .stepper-label {
  color: #e0f2fe;
  font-weight: 600;
}

/* Pending state */
.stepper-step--pending .stepper-icon {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.5);
  color: rgba(148, 163, 184, 0.5);
}
.stepper-step--pending .stepper-label {
  color: rgba(148, 163, 184, 0.5);
}

/* Disabled (skipped) state */
.stepper-step--disabled .stepper-icon {
  border-color: rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.35);
  color: rgba(148, 163, 184, 0.3);
}
.stepper-step--disabled .stepper-label {
  color: rgba(148, 163, 184, 0.35);
  text-decoration: line-through;
}

@keyframes step-pulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.3), 0 0 6px rgba(56, 189, 248, 0.2);
  }
  50% {
    box-shadow: 0 0 24px rgba(56, 189, 248, 0.5), 0 0 10px rgba(56, 189, 248, 0.35);
  }
}
</style>
