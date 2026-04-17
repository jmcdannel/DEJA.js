<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import SelectFavorites from '@/core/Menu/SelectFavorites.vue'
import { BackgroundSettings, ServerSetupInfo } from '@repo/ui'
import { useThemeSwitcher, type ThemeMode } from '@repo/ui/src/composables/useThemeSwitcher'
import { useDisplay } from 'vuetify'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import { useConductorSettings } from '@/conductor/useConductorSettings'
import { useQuickMenu } from '@/quick-menu/useQuickMenu'

const user = useCurrentUser()
const { plan, status, isTrialing, trialDaysLeft, subscription } = useSubscription()
const { themePreference, setTheme } = useThemeSwitcher()
const { mdAndUp } = useDisplay()

const {
  variant, speedDisplayType, showFunctions, showSpeedometer, showConsist,
  setVariant, setSpeedDisplayType, setShowFunctions, setShowSpeedometer, setShowConsist,
} = useThrottleSettings()

const {
  variant: conductorVariant,
  rightPanel: conductorRightPanel,
  setVariant: setConductorVariant,
  setRightPanel: setConductorRightPanel,
} = useConductorSettings()

const { quickMenuVisible } = useQuickMenu()

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

const layoutId = useStorage<string>('@DEJA/layoutId', '').value

// Theme options
const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'mdi-moon-waning-crescent' },
  { value: 'light', label: 'Light', icon: 'mdi-white-balance-sunny' },
  { value: 'high-contrast', label: 'High Contrast', icon: 'mdi-contrast-box' },
]

// Jump-to sections
const sections = [
  { id: 'account', label: 'Account', icon: 'mdi-account-circle-outline' },
  { id: 'billing', label: 'Billing', icon: 'mdi-credit-card-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'mdi-palette-outline' },
  { id: 'throttle', label: 'Throttle & Quick Menu', icon: 'mdi-speedometer' },
  { id: 'conductor', label: 'Conductor', icon: 'mdi-account-hard-hat' },
  { id: 'server-setup', label: 'Server Setup', icon: 'mdi-download-outline' },
  { id: 'favorites', label: 'Favorites', icon: 'mdi-star-outline' },
  { id: 'backgrounds', label: 'Backgrounds', icon: 'mdi-image-outline' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const appVersion = __APP_VERSION__

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
            <div class="settings-row__value opacity-60">{{ user?.email }}</div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label"><span class="settings-row__name">Display Name</span></div>
            <div class="settings-row__value opacity-60">{{ user?.displayName || '—' }}</div>
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
              <span class="opacity-50 text-sm">{{ planPrice }}</span>
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

        <!-- Throttle Settings -->
        <div id="throttle" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-speedometer</v-icon>
            <h2 class="settings-section__title">Throttle</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Throttle Type</span>
              <span class="settings-row__desc">Choose your preferred throttle control style</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle :model-value="variant" @update:model-value="(v) => setVariant(v)" mandatory divided density="compact" variant="outlined" color="primary">
                <v-btn value="buttons" size="small" class="text-none">
                  <v-icon start size="16">mdi-gesture-tap-button</v-icon>
                  <span class="hidden sm:inline">Buttons</span>
                </v-btn>
                <v-btn value="slider" size="small" class="text-none">
                  <v-icon start size="16">mdi-tune-vertical</v-icon>
                  <span class="hidden sm:inline">Slider</span>
                </v-btn>
                <v-btn value="dashboard" size="small" class="text-none">
                  <v-icon start size="16">mdi-train</v-icon>
                  <span class="hidden sm:inline">Dashboard</span>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Functions Panel</span>
              <span class="settings-row__desc">Show DCC function buttons (F0-F28)</span>
            </div>
            <div class="settings-row__value">
              <v-switch :model-value="showFunctions" @update:model-value="(v) => setShowFunctions(!!v)" color="primary" density="compact" hide-details />
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Speedometer</span>
              <span class="settings-row__desc">Show speed gauge on desktop, auto-hide on small screens</span>
            </div>
            <div class="settings-row__value">
              <v-switch :model-value="showSpeedometer" @update:model-value="(v) => setShowSpeedometer(!!v)" color="primary" density="compact" hide-details />
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Speed Display</span>
              <span class="settings-row__desc">Choose between round gauge dial or digital number readout</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle
                :model-value="speedDisplayType"
                @update:model-value="(v: string) => v && setSpeedDisplayType(v as 'dial' | 'digital')"
                mandatory
                density="compact"
                color="primary"
                variant="outlined"
              >
                <v-btn value="dial" size="small">🎛️ Dial</v-btn>
                <v-btn value="digital" size="small">🔢 Digital</v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Consist Info</span>
              <span class="settings-row__desc">Show coupled locomotive information</span>
            </div>
            <div class="settings-row__value">
              <v-switch :model-value="showConsist" @update:model-value="(v) => setShowConsist(!!v)" color="primary" density="compact" hide-details />
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Quick Menu</span>
              <span class="settings-row__desc">Show draggable quick-access menu for throttles and cloud navigation</span>
            </div>
            <div class="settings-row__value">
              <v-switch v-model="quickMenuVisible" color="primary" density="compact" hide-details />
            </div>
          </div>
        </div>

        <!-- Conductor -->
        <div id="conductor" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-account-hard-hat</v-icon>
            <h2 class="settings-section__title">Conductor</h2>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Throttle Style</span>
              <span class="settings-row__desc">Throttle control style used inside the Conductor view</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle :model-value="conductorVariant" @update:model-value="(v) => setConductorVariant(v)" mandatory divided density="compact" variant="outlined" color="primary">
                <v-btn value="buttons" size="small" class="text-none">
                  <v-icon start size="16">mdi-gesture-tap-button</v-icon>
                  <span class="hidden sm:inline">Buttons</span>
                </v-btn>
                <v-btn value="slider" size="small" class="text-none">
                  <v-icon start size="16">mdi-tune-vertical</v-icon>
                  <span class="hidden sm:inline">Slider</span>
                </v-btn>
                <v-btn value="dashboard" size="small" class="text-none">
                  <v-icon start size="16">mdi-train</v-icon>
                  <span class="hidden sm:inline">Dashboard</span>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__name">Right Panel</span>
              <span class="settings-row__desc">Which component to load in the Conductor's right column</span>
            </div>
            <div class="settings-row__value">
              <v-btn-toggle :model-value="conductorRightPanel" @update:model-value="(v) => setConductorRightPanel(v)" mandatory divided density="compact" variant="outlined" color="primary">
                <v-btn value="turnouts" size="small" class="text-none">
                  <v-icon start size="16">mdi-directions-fork</v-icon>
                  <span class="hidden sm:inline">Turnouts</span>
                </v-btn>
                <v-btn value="effects" size="small" class="text-none">
                  <v-icon start size="16">mdi-auto-fix</v-icon>
                  <span class="hidden sm:inline">Effects</span>
                </v-btn>
                <v-btn value="signals" size="small" class="text-none">
                  <v-icon start size="16">mdi-traffic-light</v-icon>
                  <span class="hidden sm:inline">Signals</span>
                </v-btn>
                <v-btn value="devices" size="small" class="text-none">
                  <v-icon start size="16">mdi-chip</v-icon>
                  <span class="hidden sm:inline">Devices</span>
                </v-btn>
                <v-btn value="routes" size="small" class="text-none">
                  <v-icon start size="16">mdi-map-marker-path</v-icon>
                  <span class="hidden sm:inline">Routes</span>
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
          <ServerSetupInfo :uid="user?.uid" :layout-id="layoutId" />
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

        <!-- Backgrounds -->
        <div id="backgrounds" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-image-outline</v-icon>
            <h2 class="settings-section__title">Backgrounds</h2>
          </div>
          <div class="settings-row settings-row--block">
            <BackgroundSettings app-name="throttle" :pages="backgroundPages" />
          </div>
        </div>

        <!-- Version -->
        <p class="settings-version">DEJA.js Throttle v{{ appVersion }}</p>
      </div>

      <!-- Jump-to nav (desktop only, right side) -->
      <nav v-if="mdAndUp" class="settings-nav">
        <div class="settings-nav__inner">
          <p class="text-xs opacity-40 uppercase tracking-widest font-medium mb-3">Settings</p>
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
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.settings-nav__item:hover {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-primary), 0.08);
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-section {
  background: rgba(var(--v-theme-surface), 0.45);
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
  color: rgb(var(--v-theme-on-surface));
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
