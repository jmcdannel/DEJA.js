<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeStep from './steps/WelcomeStep.vue'
import PlanStep from './steps/PlanStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import LayoutStep from './steps/LayoutStep.vue'
import ServerStep from './steps/ServerStep.vue'
import type { PlanTier, BillingCycle } from '@repo/modules'

const router = useRouter()
const currentStep = ref(1)
const selectedPlan = ref<PlanTier>('hobbyist')
const selectedBillingCycle = ref<BillingCycle>('monthly')

function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  selectedPlan.value = payload.plan
  selectedBillingCycle.value = payload.billingCycle ?? 'monthly'

  if (payload.plan === 'hobbyist') {
    currentStep.value = 4
  } else {
    currentStep.value = 3
  }
}

function handlePaymentComplete() {
  currentStep.value = 4
}

function handleLayoutComplete() {
  currentStep.value = 5
}

function handleServerComplete() {
  router.push({ name: 'pending-approval' })
}
</script>

<template>
  <v-container class="max-w-3xl mx-auto py-8">
    <v-stepper-vertical v-model="currentStep">
      <v-stepper-vertical-item title="Welcome" :value="1">
        <WelcomeStep />
        <template #actions="{ next }">
          <v-btn color="primary" @click="next">Get Started</v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Choose Your Plan" :value="2">
        <PlanStep @complete="handlePlanComplete" />
      </v-stepper-vertical-item>

      <v-stepper-vertical-item
        title="Payment Details"
        :value="3"
        :subtitle="selectedPlan === 'hobbyist' ? 'Not required' : undefined"
        :disabled="selectedPlan === 'hobbyist'"
      >
        <PaymentStep
          v-if="selectedPlan !== 'hobbyist'"
          :plan="selectedPlan"
          :billing-cycle="selectedBillingCycle"
          @complete="handlePaymentComplete"
        />
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Create Your Layout" :value="4">
        <LayoutStep @complete="handleLayoutComplete" />
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Server Preference" :value="5">
        <ServerStep @complete="handleServerComplete" />
      </v-stepper-vertical-item>
    </v-stepper-vertical>
  </v-container>
</template>
