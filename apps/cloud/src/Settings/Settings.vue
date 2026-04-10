<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY, useLayout } from '@repo/modules'
import { BackgroundSettings, ServerSetupInfo } from '@repo/ui'
import { useThemeSwitcher, type ThemeMode } from '@repo/ui/src/composables/useThemeSwitcher'
import { useDisplay } from 'vuetify'
import { PageHeader } from '@repo/ui'
import LayoutTags from '@/Layout/LayoutTags.vue'
import PortList from '@/Layout/PortList.vue'
import DevicesSection from '@/Settings/Devices/DevicesSection.vue'

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

const portalLoading = ref(false)

async function openBillingPortal() {
  if (!user.value) return
  portalLoading.value = true
  try {
    const token = await getIdToken(user.value)
    const res = await fetch('/api/billing-portal', {
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
  { id: 'server-setup', label: 'Server Setup', icon: 'mdi-download-outline' },
  { id: 'devices', label: 'Devices', icon: 'mdi-devices' },
  { id: 'layout', label: 'Layout', icon: 'mdi-floor-plan' },
  { id: 'backgrounds', label: 'Backgrounds', icon: 'mdi-image-outline' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader title="Settings" icon="mdi-cog" color="blue" :subtitle="layout?.name" />

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
        </div>

        <!-- Server Setup -->
        <div id="server-setup" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-download-outline</v-icon>
            <h2 class="settings-section__title">Server Setup</h2>
          </div>
          <ServerSetupInfo :uid="user?.uid" :layout-id="storedLayoutId" />
        </div>

        <!-- Devices -->
        <div id="devices" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-devices</v-icon>
            <h2 class="settings-section__title">Devices</h2>
          </div>
          <DevicesSection />
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

        <!-- Backgrounds -->
        <div id="backgrounds" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-image-outline</v-icon>
            <h2 class="settings-section__title">Backgrounds</h2>
          </div>
          <div class="settings-row settings-row--block">
            <BackgroundSettings app-name="cloud" :pages="backgroundPages" />
          </div>
        </div>

        <!-- Version -->
        <p class="settings-version">DEJA.js Cloud v{{ appVersion }}</p>
      </div>

      <!-- Jump-to nav (desktop only, right side) -->
      <nav v-if="mdAndUp" class="settings-nav">
        <div class="settings-nav__inner">
          <p class="text-xs uppercase tracking-widest font-medium mb-3 opacity-50">Settings</p>
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
  letter-spacing: 0.01em;
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
