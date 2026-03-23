<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage, useWebSocket } from '@vueuse/core'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { BackgroundSettings, ServerSetupInfo } from '@repo/ui'
import { useThemeSwitcher, type ThemeMode } from '@repo/ui/src/composables/useThemeSwitcher'
import { useDisplay } from 'vuetify'
import { useWsConnection } from '../composables/useWsConnection'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()
const { themePreference, setTheme } = useThemeSwitcher()
const { mdAndUp } = useDisplay()

const layoutId = useStorage('@DEJA/layoutId', '')

// WebSocket connection
const { wshost, wsUrl } = useWsConnection()
const wsEnabled = useStorage('@DEJA/pref/ws-logging', false)
const { status: wsStatus } = useWebSocket(wsUrl, {
  autoReconnect: { delay: 2000, retries: 10 },
})
const wsConnected = computed(() => wsStatus.value === 'OPEN')
const showTunnelHelp = ref(false)

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

const portalLoading = ref(false)
async function openBillingPortal() {
  if (!user.value) return
  portalLoading.value = true
  try {
    const token = await getIdToken(user.value)
    const billingApiUrl = import.meta.env.VITE_BILLING_API_URL
    const res = await fetch(`${billingApiUrl}/api/billing-portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
  } finally {
    portalLoading.value = false
  }
}

// Monitor-specific
const autoRefresh = ref(true)
const refreshInterval = ref(15)
const includeDiagnostics = ref(false)

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'mdi-moon-waning-crescent' },
  { value: 'light', label: 'Light', icon: 'mdi-white-balance-sunny' },
  { value: 'high-contrast', label: 'High Contrast', icon: 'mdi-contrast-box' },
]

const sections = [
  { id: 'account', label: 'Account', icon: 'mdi-account-circle-outline' },
  { id: 'billing', label: 'Billing', icon: 'mdi-credit-card-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'mdi-palette-outline' },
  { id: 'connection', label: 'Connection', icon: 'mdi-server-network' },
  { id: 'server-setup', label: 'Server Setup', icon: 'mdi-download-outline' },
  { id: 'monitor', label: 'Monitor', icon: 'mdi-monitor-dashboard' },
  { id: 'backgrounds', label: 'Backgrounds', icon: 'mdi-image-outline' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const appVersion = __APP_VERSION__

const backgroundPages = [
  { path: '/', label: 'Dashboard', icon: 'mdi-view-dashboard' },
  { path: '/settings', label: 'Settings', icon: 'mdi-cog' },
  { path: '/logs', label: 'Logs', icon: 'mdi-file-document' },
]
</script>

<template>
  <div class="settings-page">
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
            <div class="settings-row__value">{{ user?.email }}</div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label"><span class="settings-row__name">Display Name</span></div>
            <div class="settings-row__value">{{ user?.displayName || '—' }}</div>
          </div>
        </div>

        <!-- Billing -->
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
              <span class="font-semibold">{{ planName }}</span>
              <span class="text-sm opacity-60">{{ planPrice }}</span>
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
              <v-btn v-if="plan !== 'conductor'" variant="tonal" color="primary" size="small" prepend-icon="mdi-arrow-up-bold" class="text-none">
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
        </div>

        <!-- Connection -->
        <div id="connection" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-server-network</v-icon>
            <h2 class="settings-section__title">Connection</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">WebSocket Host</span>
              <span class="settings-row__desc">Address of the DEJA.js server or Cloudflare tunnel URL</span>
            </div>
            <div class="settings-row__value flex items-center gap-2">
              <v-text-field v-model="wshost" density="compact" variant="outlined" hide-details style="min-width: 280px;" placeholder="your-tunnel.trycloudflare.com" />
              <v-chip
                :color="wsConnected ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
                :prepend-icon="wsConnected ? 'mdi-check-circle' : 'mdi-alert-circle'"
              >
                {{ wsConnected ? 'Connected' : 'Disconnected' }}
              </v-chip>
            </div>
          </div>
          <div class="settings-row settings-row--block">
            <button
              class="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-none opacity-70 hover:opacity-100"
              style="color: rgb(var(--v-theme-primary))"
              @click="showTunnelHelp = !showTunnelHelp"
            >
              <v-icon size="14">{{ showTunnelHelp ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
              Remote access via Cloudflare Tunnel
            </button>
            <div v-if="showTunnelHelp" class="mt-2 text-xs opacity-60 leading-relaxed">
              <p class="mb-2">To access your DEJA.js server remotely:</p>
              <ol class="list-decimal list-inside space-y-1 mb-2">
                <li>In your server directory, run <code class="px-1 rounded" style="background: rgba(var(--v-theme-surface-variant), 0.5)">pnpm tunnel</code></li>
                <li>Copy the generated <code class="px-1 rounded" style="background: rgba(var(--v-theme-surface-variant), 0.5)">*.trycloudflare.com</code> URL</li>
                <li>Paste it in the WebSocket Host field above (no port or protocol needed)</li>
              </ol>
              <p class="opacity-70">For a persistent URL, use <code class="px-1 rounded" style="background: rgba(var(--v-theme-surface-variant), 0.5)">pnpm tunnel:named</code> with a Cloudflare account.</p>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">WebSocket Logging</span>
              <span class="settings-row__desc">Enable verbose WebSocket message logging</span>
            </div>
            <div class="settings-row__value">
              <v-switch v-model="wsEnabled" color="primary" hide-details density="compact" />
            </div>
          </div>
        </div>

        <!-- Server Setup -->
        <div id="server-setup" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-download-outline</v-icon>
            <h2 class="settings-section__title">Server Setup</h2>
          </div>
          <ServerSetupInfo :uid="user?.uid" :layout-id="layoutId" />
        </div>

        <!-- Monitor Settings -->
        <div id="monitor" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-monitor-dashboard</v-icon>
            <h2 class="settings-section__title">Monitor</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Auto-refresh</span>
              <span class="settings-row__desc">Automatically refresh dashboard data</span>
            </div>
            <div class="settings-row__value">
              <v-switch v-model="autoRefresh" color="primary" hide-details density="compact" />
            </div>
          </div>
          <div v-if="autoRefresh" class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Refresh Interval</span>
              <span class="settings-row__desc">How often to poll for updates</span>
            </div>
            <div class="settings-row__value">
              <v-text-field v-model.number="refreshInterval" type="number" min="5" max="120" suffix="sec" density="compact" variant="outlined" hide-details style="max-width: 120px;" />
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Verbose Diagnostics</span>
              <span class="settings-row__desc">Include detailed diagnostics in log output</span>
            </div>
            <div class="settings-row__value">
              <v-switch v-model="includeDiagnostics" color="primary" hide-details density="compact" />
            </div>
          </div>
        </div>

        <!-- Backgrounds -->
        <div id="backgrounds" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-image-outline</v-icon>
            <h2 class="settings-section__title">Backgrounds</h2>
          </div>
          <div class="settings-row settings-row--block">
            <BackgroundSettings app-name="monitor" :pages="backgroundPages" />
          </div>
        </div>

        <!-- Version -->
        <p class="settings-version">DEJA.js Monitor v{{ appVersion }}</p>
      </div>

      <!-- Jump-to nav (desktop only, right side) -->
      <nav v-if="mdAndUp" class="settings-nav">
        <div class="settings-nav__inner">
          <p class="text-xs opacity-50 uppercase tracking-widest font-medium mb-3">Settings</p>
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
.settings-page {
  padding: 24px 32px;
}

.settings-layout {
  display: flex;
  gap: 32px;
  max-width: 1100px;
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
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.settings-nav__item:hover {
  color: rgba(var(--v-theme-on-surface), 0.85);
  background: rgba(var(--v-theme-primary), 0.08);
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-section {
  background: rgba(var(--v-theme-surface), 0.7);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: clip;
}

.settings-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.settings-section__icon { color: rgb(var(--v-theme-primary)); }

.settings-section__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  gap: 16px;
}
.settings-row:last-child { border-bottom: none; }
.settings-row--block { flex-direction: column; align-items: stretch; }
.settings-row--actions { padding: 12px 20px 16px; }

.settings-row__label { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.settings-row__name { font-size: 0.875rem; font-weight: 500; color: rgba(var(--v-theme-on-surface), 0.8); }
.settings-row__desc { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.45); }
.settings-row__value { flex-shrink: 0; }

.settings-version {
  text-align: center;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
  padding: 16px 0 8px;
}
</style>
