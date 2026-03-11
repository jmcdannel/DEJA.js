<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()

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

const enableAutoDeploy = ref(true)
const allowedNotifications = ref(['email'])
const defaultTheme = ref('system')
const logRetention = ref(30)
const betaFeatures = ref(false)
const notificationOptions = [
  { title: 'Email updates', value: 'email' },
  { title: 'SMS alerts', value: 'sms' },
  { title: 'Push notifications', value: 'push' },
]
const themeOptions = [
  { title: 'System default', value: 'system' },
  { title: 'Light', value: 'light' },
  { title: 'Dark', value: 'dark' },
]
</script>

<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
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

        <v-card>
          <v-card-title>Cloud Settings</v-card-title>
          <v-card-subtitle class="pb-0">Placeholder controls for configuration work.</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-6">
            <v-switch
              v-model="enableAutoDeploy"
              label="Enable auto-deploy for layout changes"
              color="primary"
              hide-details
            />
            <v-select
              v-model="allowedNotifications"
              :items="notificationOptions"
              label="Notification channels"
              multiple
              chips
              closable-chips
            />
            <v-select
              v-model="defaultTheme"
              :items="themeOptions"
              label="Dashboard theme"
            />
            <div>
              <div class="text-subtitle-2 mb-2">Log retention (days)</div>
              <v-slider
                v-model="logRetention"
                :min="7"
                :max="90"
                :step="1"
                thumb-label="always"
              />
            </div>
            <v-switch
              v-model="betaFeatures"
              label="Join cloud feature preview program"
              color="primary"
              hide-details
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="primary" variant="tonal" disabled>Save (coming soon)</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
