<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY, useLayout } from '@repo/modules'
import { BackgroundSettings, ServerSetupInfo } from '@repo/ui'
import { useThemeSwitcher, type ThemeMode } from '@repo/ui/src/composables/useThemeSwitcher'
import { useDisplay } from 'vuetify'
import PageHeader from '@/Core/UI/PageHeader.vue'
import LayoutTags from '@/Layout/LayoutTags.vue'
import PortList from '@/Layout/PortList.vue'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()
const { getLayout, updateLayout } = useLayout()
const storedLayoutId = useStorage('@DEJA/layoutId', '')
const { themePreference, setTheme } = useThemeSwitcher()
const { mdAndUp } = useDisplay()

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
    return `Trial ends ${subscription.value.trialEndsAt.toDate().toLocaleDateString()}`
  }
  if (subscription.value?.currentPeriodEnd) {
    return `Next charge ${subscription.value.currentPeriodEnd.toDate().toLocaleDateString()}`
  }
  return ''
})

// Server connection type
const serverType = ref<'deja-server' | 'withrottle'>('deja-server')
const serverSaving = ref(false)
const serverSaved = ref(false)

watch(() => layout, (l) => {
  if (l?.throttleConnection?.type) {
    serverType.value = l.throttleConnection.type
  }
}, { immediate: true })

async function saveServerType() {
  if (!storedLayoutId.value) return
  serverSaving.value = true
  try {
    await updateLayout(storedLayoutId.value, {
      throttleConnection: { type: serverType.value }
    })
    serverSaved.value = true
    setTimeout(() => { serverSaved.value = false }, 3000)
  } catch {
    // Silent fail
  } finally {
    serverSaving.value = false
  }
}

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

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'mdi-moon-waning-crescent' },
  { value: 'light', label: 'Light', icon: 'mdi-white-balance-sunny' },
  { value: 'high-contrast', label: 'High Contrast', icon: 'mdi-contrast-box' },
]

const appVersion = __APP_VERSION__

const backgroundPages = [
  { path: '/', label: 'Home', icon: 'mdi-home' },
  { path: '/locos', label: 'Roster', icon: 'mdi-train' },
  { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
  { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
  { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
  { path: '/sensors', label: 'Sensors', icon: 'mdi-motion-sensor' },
  { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
  { path: '/dccex', label: 'DCC-EX', icon: 'mdi-console' },
  { path: '/layout', label: 'Layout', icon: 'mdi-floor-plan' },
]

const sections = [
  { id: 'account', label: 'Account', icon: 'mdi-account-circle-outline' },
  { id: 'billing', label: 'Billing', icon: 'mdi-credit-card-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'mdi-palette-outline' },
  { id: 'connection', label: 'Connection', icon: 'mdi-server-network' },
  { id: 'server-setup', label: 'Server Setup', icon: 'mdi-download-outline' },
  { id: 'layout', label: 'Layout', icon: 'mdi-floor-plan' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader menu="Settings" :subtitle="layout?.name" />

    <div class="settings-layout">
      <!-- Content -->
      <div class="settings-content">
        <!-- Account -->
        <div id="account" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-account-circle-outline</v-icon>
            <h2 class="settings-section__title">Account</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label"><span class="settings-row__name">Email</span></div>
            <div class="settings-row__value text-slate-300">{{ user?.email }}</div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label"><span class="settings-row__name">Display Name</span></div>
            <div class="settings-row__value text-slate-300">{{ user?.displayName || '—' }}</div>
          </div>
        </div>

        <!-- Billing & Subscription -->
        <div id="billing" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-credit-card-outline</v-icon>
            <h2 class="settings-section__title">Billing & Subscription</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Current Plan</span>
              <span class="settings-row__desc">{{ nextDateLabel }}</span>
            </div>
            <div class="settings-row__value flex items-center gap-3">
              <span class="text-sky-100 font-semibold">{{ planName }}</span>
              <span class="text-slate-400 text-sm">{{ planPrice }}</span>
              <v-chip :color="statusColor" size="x-small" variant="tonal" class="uppercase tracking-wider">{{ status }}</v-chip>
            </div>
          </div>
          <div v-if="isTrialing" class="settings-row">
            <div class="settings-row__label"><span class="settings-row__name">Trial</span></div>
            <div class="settings-row__value">
              <v-chip color="info" size="small" variant="tonal">{{ trialDaysLeft }} days remaining</v-chip>
            </div>
          </div>
          <div class="settings-row settings-row--actions">
            <div class="flex flex-wrap gap-3">
              <v-btn v-if="plan !== 'conductor'" variant="tonal" color="primary" size="small" prepend-icon="mdi-arrow-up-bold" class="text-none" :to="{ name: 'Upgrade' }">
                Upgrade to {{ plan === 'hobbyist' ? 'Engineer' : 'Conductor' }}
              </v-btn>
              <v-btn v-if="subscription?.stripeCustomerId" variant="outlined" size="small" prepend-icon="mdi-open-in-new" :loading="portalLoading" class="text-none" @click="openBillingPortal">
                Manage in Stripe
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div id="appearance" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-palette-outline</v-icon>
            <h2 class="settings-section__title">Appearance</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Theme</span>
              <span class="settings-row__desc">Choose your preferred color scheme</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle :model-value="themePreference" @update:model-value="(v: ThemeMode) => setTheme(v)" mandatory divided density="compact" variant="outlined" color="primary">
                <v-btn v-for="opt in themeOptions" :key="opt.value" :value="opt.value" size="small" class="text-none">
                  <v-icon start size="16">{{ opt.icon }}</v-icon>
                  <span class="hidden sm:inline">{{ opt.label }}</span>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Backgrounds</span>
              <span class="settings-row__desc">Customize page backgrounds</span>
            </div>
            <BackgroundSettings app-name="cloud" :pages="backgroundPages" />
          </div>
        </div>

        <!-- Server Connection -->
        <div id="connection" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-server-network</v-icon>
            <h2 class="settings-section__title">Server Connection</h2>
          </div>
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Connection Type</span>
              <span class="settings-row__desc">How your DEJA apps connect to your command station</span>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 mb-4">
              <div
                v-for="opt in [
                  { value: 'deja-server', label: 'DEJA.js Server', desc: 'USB-connected to your DCC-EX Command Station', icon: 'mdi-usb' },
                  { value: 'withrottle', label: 'WiThrottle Server', desc: 'Existing WiThrottle on your network (DCC-EX WiFi or JMRI)', icon: 'mdi-wifi' },
                ]"
                :key="opt.value"
                class="server-option"
                :class="{ 'server-option--selected': serverType === opt.value }"
                @click="serverType = opt.value as 'deja-server' | 'withrottle'"
              >
                <v-icon size="24" :color="serverType === opt.value ? 'primary' : undefined" class="mb-2">{{ opt.icon }}</v-icon>
                <div class="font-medium text-sm text-sky-100">{{ opt.label }}</div>
                <div class="text-xs text-slate-400 mt-1">{{ opt.desc }}</div>
              </div>
            </div>
            <v-btn color="primary" variant="tonal" size="small" :loading="serverSaving" :prepend-icon="serverSaved ? 'mdi-check' : 'mdi-content-save'" class="text-none" @click="saveServerType">
              {{ serverSaved ? 'Saved!' : 'Save' }}
            </v-btn>
          </div>
        </div>

        <!-- Server Setup -->
        <div id="server-setup" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-download-outline</v-icon>
            <h2 class="settings-section__title">Server Setup</h2>
          </div>
          <ServerSetupInfo :uid="user?.uid" :layout-id="storedLayoutId" />
        </div>

        <!-- Layout Configuration -->
        <div id="layout" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-floor-plan</v-icon>
            <h2 class="settings-section__title">Layout — {{ layout?.name }}</h2>
          </div>
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Tags</span>
              <span class="settings-row__desc">Organize and categorize your layout elements</span>
            </div>
            <LayoutTags />
          </div>
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">USB Ports</span>
              <span class="settings-row__desc">Connected serial devices</span>
            </div>
            <PortList :ports="layout?.ports || []" />
          </div>
        </div>

        <!-- Version -->
        <p class="settings-version">DEJA.js Cloud v{{ appVersion }}</p>
      </div>

      <!-- Jump-to nav (desktop only, right side) -->
      <nav v-if="mdAndUp" class="settings-nav">
        <div class="settings-nav__inner">
          <p class="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Settings</p>
          <button
            v-for="s in sections"
            :key="s.id"
            class="settings-nav__item"
            @click="scrollTo(s.id)"
          >
            <v-icon size="16">{{ s.icon }}</v-icon>
            {{ s.label }}
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.settings-layout {
  display: flex;
  gap: 32px;
  max-width: 1100px;
  padding: 0 16px;
}

.settings-nav {
  flex-shrink: 0;
  width: 180px;
  position: sticky;
  top: 80px;
  align-self: flex-start;
}

.settings-nav__inner {
  padding: 16px 0;
}

.settings-nav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.settings-nav__item:hover {
  color: #e0f2fe;
  background: rgba(56, 189, 248, 0.08);
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-section {
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: clip;
}

.settings-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.settings-section__icon { color: #38bdf8; }

.settings-section__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e0f2fe;
  letter-spacing: 0.01em;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  gap: 16px;
}
.settings-row:last-child { border-bottom: none; }
.settings-row--block { flex-direction: column; align-items: stretch; }
.settings-row--actions { padding: 12px 20px 16px; }

.settings-row__label { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.settings-row__name { font-size: 0.875rem; font-weight: 500; color: #cbd5e1; }
.settings-row__desc { font-size: 0.75rem; color: rgba(148, 163, 184, 0.6); }
.settings-row__value { flex-shrink: 0; }

.server-option {
  flex: 1;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(2, 6, 23, 0.4);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
  text-align: center;
}
.server-option:hover {
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.05);
}
.server-option--selected {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.1);
}

.settings-version {
  text-align: center;
  font-size: 0.7rem;
  color: rgba(148, 163, 184, 0.4);
  padding: 16px 0 8px;
}
</style>
