<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos } from '@repo/modules/locos'
import { useServerStatus } from '@repo/modules'
import { Signout } from '@repo/auth'
import { QuickStart } from '@repo/ui'

const router = useRouter()
const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
const { createLoco } = useLocos()
const { serverStatus } = useServerStatus()

const userLayouts = useCollection(
  computed(() =>
    user.value?.uid
      ? query(collection(db, 'layouts'), where('ownerUid', '==', user.value.uid))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id || layoutId.value)

const quickStartCompleted = computed(() => {
  const steps: number[] = [1] // Always registered on this page
  if (serverStatus.value?.online) steps.push(2)
  return steps
})

// Quick-add loco
const locoAddress = ref<string>('')
const locoName = ref('')
const locoLoading = ref(false)
const locoAdded = ref(false)
const locoError = ref<string | null>(null)

async function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) {
    locoError.value = 'Enter a valid DCC address (1–9999)'
    return
  }
  locoLoading.value = true
  locoError.value = null
  try {
    await createLoco(address, locoName.value || `Loco ${address}`, undefined, true)
    locoAdded.value = true
  } catch {
    locoError.value = 'Failed to add locomotive'
  } finally {
    locoLoading.value = false
  }
}

function addAnother() {
  locoAddress.value = ''
  locoName.value = ''
  locoAdded.value = false
}

async function handleQuickStartAddLoco(address: number, name: string) {
  locoAddress.value = String(address)
  locoName.value = name
  await handleAddLoco()
}

function goToDashboard() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-container">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 success-glow">
          <v-icon color="success" size="40">mdi-check-circle</v-icon>
        </div>
        <h1 class="font-display text-4xl text-sky-100 mb-2">You're All Set!</h1>
        <p class="opacity-60 text-sm">
          Welcome{{ user?.displayName ? `, ${user.displayName}` : '' }}! Your layout
          <strong class="text-sky-300">{{ primaryLayoutId }}</strong> is ready to go.
        </p>
      </div>

      <!-- Quick Add Loco -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="pink" size="28">mdi-train</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Add Your First Locomotive</h2>
        </div>
        <p class="opacity-60 text-sm mb-4">
          Enter the DCC address programmed into your locomotive decoder to get running right away.
        </p>

        <v-alert v-if="locoError" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="locoError = null">
          {{ locoError }}
        </v-alert>

        <div v-if="!locoAdded">
          <div class="flex gap-3 mb-3">
            <v-text-field
              v-model="locoAddress"
              label="DCC Address"
              placeholder="3"
              type="number"
              variant="solo-filled"
              density="compact"
              bg-color="transparent"
              class="setup-input"
              style="max-width: 140px;"
              hide-details
              @keydown.enter="handleAddLoco"
            />
            <v-text-field
              v-model="locoName"
              label="Name (optional)"
              placeholder="My Engine"
              variant="solo-filled"
              density="compact"
              bg-color="transparent"
              class="setup-input flex-1"
              hide-details
              @keydown.enter="handleAddLoco"
            />
          </div>
          <v-btn
            color="pink"
            :loading="locoLoading"
            prepend-icon="mdi-plus"
            class="text-none"
            @click="handleAddLoco"
          >
            Add Locomotive
          </v-btn>
        </div>

        <div v-else>
          <v-alert type="success" variant="tonal" density="compact" class="mb-4">
            Locomotive {{ locoAddress }} added to your roster!
          </v-alert>
          <div class="flex gap-3">
            <v-btn
              variant="tonal"
              prepend-icon="mdi-plus"
              class="text-none"
              @click="addAnother"
            >
              Add Another
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Install Server — hidden once server is online and user is on "drive trains" step -->
      <div v-if="!serverStatus?.online" class="glass-card mb-6">
        <QuickStart
          :completed="quickStartCompleted"
          :uid="user?.uid"
          :layout-id="primaryLayoutId"
          :server-online="serverStatus?.online ?? false"
          @add-loco="handleQuickStartAddLoco"
        />
      </div>

      <!-- Explore More -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="primary" size="28">mdi-compass-outline</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Explore More</h2>
        </div>
        <p class="opacity-60 text-sm mb-4">
          Ready to dig deeper? Here are some next steps.
        </p>
        <div class="flex flex-col gap-2">
          <a href="https://dejajs.com/docs/install" target="_blank" rel="noopener noreferrer" class="explore-link">
            <v-icon size="18" class="mr-2">mdi-book-open-page-variant-outline</v-icon>
            Installation Guide
            <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
          </a>
          <a href="https://dejajs.com/docs/roster" target="_blank" rel="noopener noreferrer" class="explore-link">
            <v-icon size="18" class="mr-2">mdi-train</v-icon>
            Managing Your Roster
            <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
          </a>
          <a href="https://dejajs.com/docs/turnouts" target="_blank" rel="noopener noreferrer" class="explore-link">
            <v-icon size="18" class="mr-2">mdi-call-split</v-icon>
            Turnouts &amp; Routes
            <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
          </a>
          <a href="https://dejajs.com/docs/effects" target="_blank" rel="noopener noreferrer" class="explore-link">
            <v-icon size="18" class="mr-2">mdi-lightbulb-outline</v-icon>
            Effects &amp; Automation
            <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
          </a>
        </div>
      </div>

      <!-- Go to Dashboard -->
      <v-btn
        color="primary"
        size="large"
        block
        class="text-none font-weight-bold mb-4"
        prepend-icon="mdi-view-dashboard-outline"
        @click="goToDashboard"
      >
        Go to Dashboard
      </v-btn>

      <div class="text-center space-y-3">
        <Signout />
        <div>
          <a href="https://dejajs.com" class="advanced-link">
            <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
            Back to dejajs.com
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px;
}
.setup-container {
  width: 100%;
  max-width: 560px;
}

.success-glow {
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 24px rgba(34, 197, 94, 0.2);
}

.glass-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.glass-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

.setup-input :deep(.v-field) {
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  min-height: 44px;
  transition: border-color 150ms ease;
}
.setup-input :deep(.v-field:focus-within) {
  border-color: rgba(56, 189, 248, 0.5);
}
.setup-input :deep(.v-field__overlay) {
  display: none;
}
.setup-input :deep(.v-field input) {
  color: #e0f2fe;
  font-size: 0.95rem;
}
.setup-input :deep(.v-field input::placeholder) {
  color: rgba(148, 163, 184, 0.5);
}

.explore-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 150ms ease;
}
.explore-link:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.advanced-link {
  display: inline-flex;
  align-items: center;
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 150ms ease;
}
.advanced-link:hover {
  color: #38bdf8;
}
</style>
