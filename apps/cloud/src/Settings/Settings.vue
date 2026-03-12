<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY, useLayout } from '@repo/modules'
import { BackgroundSettings } from '@repo/ui'
import PageHeader from '@/Core/UI/PageHeader.vue'
import LayoutTags from '@/Layout/LayoutTags.vue'
import PortList from '@/Layout/PortList.vue'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()
const { getLayout } = useLayout()

const layout = getLayout()

const planName = computed(() => PLAN_DISPLAY[plan.value].name)
const planPrice = computed(() => {
  const display = PLAN_DISPLAY[plan.value]
  if (plan.value === 'hobbyist') return 'Free'
  const cycle = subscription.value?.billingCycle
  return cycle === 'annual' ? `$${display.annualPrice}/yr` : `$${display.monthlyPrice}/mo`
})

const statusColor = computed(() => {
  switch (status.value) {
    case 'trialing': return 'info'
    case 'active': return 'success'
    case 'past_due': return 'error'
    case 'canceled': return 'warning'
    default: return 'default'
  }
})

const nextDateLabel = computed(() => {
  if (isTrialing.value && subscription.value?.trialEndsAt) {
    return `Trial ends: ${subscription.value.trialEndsAt.toDate().toLocaleDateString()}`
  }
  if (subscription.value?.currentPeriodEnd) {
    return `Next charge: ${subscription.value.currentPeriodEnd.toDate().toLocaleDateString()}`
  }
  return ''
})

const portalLoading = ref(false)

async function openBillingPortal() {
  if (!user.value) return
  portalLoading.value = true
  try {
    const token = await getIdToken(user.value)
    const billingApiUrl = import.meta.env.VITE_BILLING_API_URL
    const res = await fetch(`${billingApiUrl}/api/billing-portal`, {
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
</script>

<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader menu="Settings" :subtitle="layout?.name" />

    <!-- Billing & Subscription -->
    <v-card class="mb-6">
      <v-card-title>Billing & Subscription</v-card-title>
      <v-divider class="my-2" />
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <span class="text-h5 font-weight-bold" style="color: rgb(var(--v-theme-primary));">
              {{ planName }}
            </span>
            <span class="text-body-2 text-medium-emphasis ml-2">{{ planPrice }}</span>
          </div>
          <v-chip :color="statusColor" size="small" variant="elevated">
            {{ status.toUpperCase() }}
          </v-chip>
        </div>

        <div v-if="nextDateLabel" class="text-body-2 text-medium-emphasis mb-4">
          {{ nextDateLabel }}
        </div>

        <div class="d-flex ga-3">
          <v-btn
            v-if="plan !== 'conductor'"
            variant="tonal"
            size="small"
            :to="{ name: 'settings' }"
          >
            Upgrade to {{ plan === 'hobbyist' ? 'Engineer' : 'Conductor' }}
          </v-btn>
          <v-btn
            v-if="subscription?.stripeCustomerId"
            variant="tonal"
            size="small"
            :loading="portalLoading"
            @click="openBillingPortal"
          >
            Manage in Stripe
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Background Settings -->
    <BackgroundSettings
      app-name="cloud"
      :pages="[
        { path: '/', label: 'Home', icon: 'mdi-home' },
        { path: '/locos', label: 'Roster', icon: 'mdi-train' },
        { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
        { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
        { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
        { path: '/sensors', label: 'Sensors', icon: 'mdi-motion-sensor' },
        { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
        { path: '/dccex', label: 'DCC-EX', icon: 'mdi-console' },
        { path: '/layout', label: 'Layout', icon: 'mdi-floor-plan' },
      ]"
      class="mb-4"
    />

    <!-- Tags -->
    <v-card variant="tonal">
      <v-card-title class="text-brand-cyan">
        <v-icon icon="mdi-tag-multiple" class="mr-2"></v-icon>
        Tags
      </v-card-title>
      <v-card-text>
        <LayoutTags />
      </v-card-text>
    </v-card>

    <!-- USB Ports -->
    <v-card variant="tonal">
      <v-card-title class="text-brand-cyan">
        <v-icon icon="mdi-usb" class="mr-2"></v-icon>
        USB Ports
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortList :ports="layout?.ports || []" />

          <v-card
            class="mx-auto w-full h-full justify-between flex flex-col glass border border-white/10"
            prepend-icon="mdi-view-module"
            title="Modules"
            color="transparent"
            variant="flat"
            density="compact"
          >
            <v-card-text>
              <v-list lines="one" bg-color="transparent">
                <v-list-item
                  v-for="module in layout?.modules"
                  :key="module"
                  :title="module"
                  class="text-white/80"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
