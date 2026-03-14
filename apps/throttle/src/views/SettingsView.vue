<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getIdToken } from 'firebase/auth'
import { db } from '@repo/firebase-config'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import type { Layout } from '@repo/modules'
import SelectFavorites from '@/core/Menu/SelectFavorites.vue'
import { BackgroundSettings } from '@repo/ui'
import { useThemeSwitcher, type ThemeMode } from '@repo/ui/src/composables/useThemeSwitcher'
import { useDisplay } from 'vuetify'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()
const { themePreference, setTheme } = useThemeSwitcher()
const { mdAndUp } = useDisplay()

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

// Speed steps
const speedSteps = ref('128')
const speedStepOptions = [
  { title: '14 steps', value: '14' },
  { title: '28 steps', value: '28' },
  { title: '128 steps', value: '128' },
]

// DEJA server config
const wsServerUrl = useStorage('@DEJA/wsServerUrl', '')
const mqttBrokerUrl = useStorage('@DEJA/mqttBrokerUrl', '')
const serverSaved = ref(false)
function saveServerSettings() {
  serverSaved.value = true
  setTimeout(() => { serverSaved.value = false }, 2000)
}

// Layout throttle connection
const layoutId = useStorage<string>('@DEJA/layoutId', '').value
const connectionType = ref<'deja-server' | 'withrottle'>('deja-server')
const connectionHost = ref('')
const connectionPort = ref(44444)
const isLayoutLoading = ref(true)
const isLayoutSaving = ref(false)

if (layoutId) {
  getDoc(doc(db, 'layouts', layoutId)).then((snap) => {
    if (snap.exists()) {
      const data = snap.data() as Layout
      if (data.throttleConnection) {
        connectionType.value = data.throttleConnection.type || 'deja-server'
        connectionHost.value = data.throttleConnection.host || ''
        connectionPort.value = data.throttleConnection.port || 44444
      }
    }
    isLayoutLoading.value = false
  })
}

async function saveLayoutConnectionSettings() {
  if (!layoutId) return
  isLayoutSaving.value = true
  try {
    await setDoc(doc(db, 'layouts', layoutId), {
      throttleConnection: { type: connectionType.value, host: connectionHost.value, port: connectionPort.value }
    }, { merge: true })
  } catch (e) {
    console.error('Error saving throttle connection:', e)
  }
  isLayoutSaving.value = false
}

// Theme options
const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'mdi-moon-waning-crescent' },
  { value: 'light', label: 'Light', icon: 'mdi-white-balance-sunny' },
  { value: 'high-contrast', label: 'High Contrast', icon: 'mdi-contrast-box' },
]

// Copy helpers
const copiedUid = ref(false)
const copiedLayoutId = ref(false)
const copiedInstall = ref(false)
const installCommand = 'curl -fsSL https://install.dejajs.com | bash'

async function copyToClipboard(text: string, flag: 'uid' | 'layoutId' | 'install') {
  await navigator.clipboard.writeText(text)
  if (flag === 'uid') {
    copiedUid.value = true
    setTimeout(() => { copiedUid.value = false }, 2000)
  } else if (flag === 'layoutId') {
    copiedLayoutId.value = true
    setTimeout(() => { copiedLayoutId.value = false }, 2000)
  } else {
    copiedInstall.value = true
    setTimeout(() => { copiedInstall.value = false }, 2000)
  }
}

// Jump-to sections
const sections = [
  { id: 'account', label: 'Account', icon: 'mdi-account-circle-outline' },
  { id: 'billing', label: 'Billing', icon: 'mdi-credit-card-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'mdi-palette-outline' },
  { id: 'throttle', label: 'Throttle', icon: 'mdi-speedometer' },
  { id: 'connection', label: 'Connection', icon: 'mdi-server-network' },
  { id: 'server-setup', label: 'Server Setup', icon: 'mdi-download-outline' },
  { id: 'favorites', label: 'Favorites', icon: 'mdi-star-outline' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const backgroundPages = [
  { path: '/', label: 'Home', icon: 'mdi-home' },
  { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
  { path: '/roster', label: 'Roster', icon: 'mdi-train' },
  { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
  { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
  { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
  { path: '/conductor', label: 'Conductor', icon: 'mdi-account-hard-hat' },
  { path: '/connect', label: 'Connect', icon: 'mdi-connection' },
]
</script>

<template>
  <v-container class="py-6">
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
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Backgrounds</span>
              <span class="settings-row__desc">Customize page backgrounds</span>
            </div>
            <BackgroundSettings app-name="throttle" :pages="backgroundPages" />
          </div>
        </div>

        <!-- Throttle Settings -->
        <div id="throttle" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-speedometer</v-icon>
            <h2 class="settings-section__title">Throttle</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Speed Steps</span>
              <span class="settings-row__desc">Number of throttle speed increments</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle v-model="speedSteps" mandatory divided density="compact" variant="outlined" color="primary">
                <v-btn v-for="opt in speedStepOptions" :key="opt.value" :value="opt.value" size="small" class="text-none">{{ opt.title }}</v-btn>
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

          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">DEJA Server</span>
              <span class="settings-row__desc">Configure your local server connection. Required for mobile apps.</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <v-text-field v-model="wsServerUrl" label="WebSocket Server URL" placeholder="ws://192.168.1.100:8082" hint="Leave blank for default" persistent-hint clearable density="compact" variant="outlined" hide-details="auto" />
              <v-text-field v-model="mqttBrokerUrl" label="MQTT Broker URL" placeholder="mqtt://192.168.1.100:1883" hint="Leave blank to disable" persistent-hint clearable density="compact" variant="outlined" hide-details="auto" />
            </div>
            <v-btn color="primary" variant="tonal" size="small" :prepend-icon="serverSaved ? 'mdi-check' : 'mdi-content-save'" class="text-none" @click="saveServerSettings">
              {{ serverSaved ? 'Saved!' : 'Save' }}
            </v-btn>
          </div>

          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Throttle Protocol</span>
              <span class="settings-row__desc">How this app connects to your command station</span>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 mb-3">
              <div
                v-for="opt in [
                  { value: 'deja-server', label: 'DEJA.js Server', desc: 'USB-connected to your DCC-EX Command Station', icon: 'mdi-usb' },
                  { value: 'withrottle', label: 'WiThrottle Server', desc: 'Existing WiThrottle on your network', icon: 'mdi-wifi' },
                ]"
                :key="opt.value"
                class="server-option"
                :class="{ 'server-option--selected': connectionType === opt.value }"
                @click="connectionType = opt.value as 'deja-server' | 'withrottle'"
              >
                <v-icon size="24" :color="connectionType === opt.value ? 'primary' : undefined" class="mb-2">{{ opt.icon }}</v-icon>
                <div class="font-medium text-sm text-sky-100">{{ opt.label }}</div>
                <div class="text-xs text-slate-400 mt-1">{{ opt.desc }}</div>
              </div>
            </div>
            <template v-if="connectionType === 'withrottle'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <v-text-field v-model="connectionHost" label="Host IP" placeholder="192.168.1.50" density="compact" variant="outlined" hide-details="auto" />
                <v-text-field v-model.number="connectionPort" label="Port" type="number" placeholder="44444" density="compact" variant="outlined" hide-details="auto" />
              </div>
            </template>
            <v-btn color="primary" variant="tonal" size="small" :loading="isLayoutSaving" prepend-icon="mdi-content-save" class="text-none" @click="saveLayoutConnectionSettings">
              Save Connection
            </v-btn>
          </div>
        </div>

        <!-- Server Setup -->
        <div id="server-setup" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-download-outline</v-icon>
            <h2 class="settings-section__title">Server Setup</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">User UID</span>
              <span class="settings-row__desc">Your Firebase user identifier — needed for the install script</span>
            </div>
            <div class="settings-row__value flex items-center gap-2">
              <code class="info-mono">{{ user?.uid || '—' }}</code>
              <v-btn v-if="user?.uid" variant="text" size="x-small" :icon="copiedUid ? 'mdi-check' : 'mdi-content-copy'" :color="copiedUid ? 'success' : undefined" @click="copyToClipboard(user.uid, 'uid')" />
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Layout ID</span>
              <span class="settings-row__desc">Your layout identifier — needed for the install script</span>
            </div>
            <div class="settings-row__value flex items-center gap-2">
              <code class="info-mono">{{ layoutId || '—' }}</code>
              <v-btn v-if="layoutId" variant="text" size="x-small" :icon="copiedLayoutId ? 'mdi-check' : 'mdi-content-copy'" :color="copiedLayoutId ? 'success' : undefined" @click="copyToClipboard(layoutId, 'layoutId')" />
            </div>
          </div>
          <div class="settings-row settings-row--block">
            <div class="settings-row__label mb-3">
              <span class="settings-row__name">Install Command</span>
              <span class="settings-row__desc">Run this on the machine connected to your DCC-EX Command Station. The installer will prompt for your UID and Layout ID.</span>
            </div>
            <div class="install-command">
              <code class="install-command__text">{{ installCommand }}</code>
              <v-btn variant="text" size="x-small" :icon="copiedInstall ? 'mdi-check' : 'mdi-content-copy'" :color="copiedInstall ? 'success' : undefined" @click="copyToClipboard(installCommand, 'install')" />
            </div>
          </div>
        </div>

        <!-- Favorites -->
        <div id="favorites" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-star-outline</v-icon>
            <h2 class="settings-section__title">Footer Menu Favorites</h2>
          </div>
          <div class="settings-row settings-row--block">
            <SelectFavorites />
          </div>
        </div>
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
  </v-container>
</template>

<style scoped>
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

.info-mono {
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #e0f2fe;
  background: rgba(2, 6, 23, 0.5);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  user-select: all;
}

.install-command {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(2, 6, 23, 0.6);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.install-command__text {
  flex: 1;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #22d3ee;
  word-break: break-all;
  user-select: all;
}
</style>
