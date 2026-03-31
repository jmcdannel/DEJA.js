<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
// Note: computed is still used for serverConnected and currentPhrase
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useStorage } from '@vueuse/core'
import { QuickStart } from '@repo/ui'
import { useOnboarding, useLayout, INSTALL_TIPS } from '@repo/modules'

const props = defineProps<{
  uid?: string | null
  layoutId?: string
  layoutName?: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const { state: onboardingState, setLayoutCreated, setInstallStarted } = useOnboarding()
const { createLayout } = useLayout()
const layoutCreating = ref(false)
const layoutCreateError = ref<string | null>(null)
const storedLayoutId = useStorage('@DEJA/layoutId', '')

// Server detection
const serverConnected = computed(() => onboardingState.value.serverStarted)
const showCelebration = ref(false)

watch(serverConnected, (connected) => {
  if (connected) {
    showCelebration.value = true
  }
})

// Tips rotation
const currentTipIndex = ref(0)
let tipInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tipInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % INSTALL_TIPS.length
  }, 6000)
})

onMounted(async () => {
  const lid = props.layoutId || storedLayoutId.value
  const lname = props.layoutName || lid
  if (!lid) return

  // Skip if layout already created (e.g., user returned to this step)
  if (onboardingState.value.layoutCreated) return

  layoutCreating.value = true
  try {
    await createLayout(lid, { name: lname, id: lid })
    storedLayoutId.value = lid
    setLayoutCreated()
    setInstallStarted()
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    layoutCreateError.value = fbErr.message || 'Failed to create layout'
  } finally {
    layoutCreating.value = false
  }
})

// Loco form
const locoAddress = ref<string>('')
const locoName = ref('')
const locoLoading = ref(false)
const addedLocos = ref<Array<{ address: number; name: string }>>([])
const locoError = ref<string | null>(null)

async function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) {
    locoError.value = 'Enter a valid DCC address (1–9999)'
    return
  }
  const lid = props.layoutId || storedLayoutId.value
  if (!lid) {
    locoError.value = 'No layout selected'
    return
  }
  locoLoading.value = true
  locoError.value = null
  try {
    const name = locoName.value || `Loco ${address}`
    await setDoc(doc(collection(db, `layouts/${lid}/locos`), address.toString()), {
      address,
      name,
      hasSound: true,
      meta: {},
      timestamp: serverTimestamp(),
    })
    addedLocos.value.push({ address, name })
    locoAddress.value = ''
    locoName.value = ''
  } catch {
    locoError.value = 'Failed to add locomotive'
  } finally {
    locoLoading.value = false
  }
}

function handleComplete() {
  if (tipInterval) clearInterval(tipInterval)
  emit('complete')
}
</script>

<template>
  <div class="install-step">
    <!-- 🎉 Server Connected — Celebration State -->
    <template v-if="showCelebration">
      <div class="glass-card celebration-card mb-6 text-center">
        <div class="celebration-icon mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-sky-100 mb-2">Your Railroad is Connected!</h2>
        <p class="opacity-70 text-sm mb-6">
          The DEJA Server is running and linked to your layout. You're ready to drive trains.
        </p>

        <div v-if="addedLocos.length > 0" class="mb-6">
          <p class="text-xs uppercase tracking-wider opacity-50 mb-3">Your Roster</p>
          <div class="flex flex-wrap gap-2 justify-center">
            <v-chip
              v-for="loco in addedLocos"
              :key="loco.address"
              color="pink"
              variant="tonal"
              size="small"
              prepend-icon="mdi-train"
            >
              {{ loco.name }} (#{{ loco.address }})
            </v-chip>
          </div>
        </div>

        <v-btn
          color="pink"
          size="large"
          block
          class="text-none font-weight-bold mb-3"
          prepend-icon="mdi-speedometer"
          href="https://throttle.dejajs.com"
          target="_blank"
        >
          🚂 Open Throttle
        </v-btn>
        <v-btn
          variant="tonal"
          size="large"
          block
          class="text-none"
          prepend-icon="mdi-view-dashboard-outline"
          @click="handleComplete"
        >
          Explore Cloud Dashboard
        </v-btn>
      </div>
    </template>

    <!-- ⏳ Waiting for Server — Productive Wait State -->
    <template v-else>
      <v-alert
        v-if="layoutCreateError"
        type="error"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="layoutCreateError = null"
      >
        {{ layoutCreateError }}
      </v-alert>

      <div class="mb-6">
        <h2 class="text-xl font-semibold text-sky-100 mb-2">Install the DEJA Server</h2>
        <p class="opacity-60 text-sm">
          Run the installer on the machine connected to your DCC-EX CommandStation — a Raspberry Pi,
          Mac, or Linux box. Your account and layout are linked automatically.
        </p>
      </div>

      <!-- Install Command -->
      <div class="glass-card mb-6">
        <QuickStart :completed="[1]" :uid="uid" :layout-id="layoutId" />
      </div>

      <!-- Add Locomotives — Productive Wait -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="pink" size="28">mdi-train</v-icon>
          <div>
            <h2 class="text-lg font-semibold text-sky-100">Set Up Your Roster</h2>
            <p class="opacity-50 text-xs">Add locos while the server installs — they'll be ready when it connects.</p>
          </div>
        </div>

        <v-alert v-if="locoError" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="locoError = null">
          {{ locoError }}
        </v-alert>

        <!-- Added locos list -->
        <div v-if="addedLocos.length > 0" class="mb-4">
          <div class="flex flex-wrap gap-2">
            <v-chip
              v-for="loco in addedLocos"
              :key="loco.address"
              color="pink"
              variant="tonal"
              size="small"
              prepend-icon="mdi-train"
            >
              {{ loco.name }} (#{{ loco.address }})
            </v-chip>
          </div>
        </div>

        <!-- Add loco form -->
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
          {{ addedLocos.length > 0 ? 'Add Another' : 'Add Locomotive' }}
        </v-btn>
      </div>

      <!-- Tips & Tricks -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="amber" size="28">mdi-lightbulb-on-outline</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Tips & Tricks</h2>
        </div>

        <div class="tip-carousel">
          <TransitionGroup name="tip-fade">
            <div
              v-for="(tip, index) in INSTALL_TIPS"
              v-show="index === currentTipIndex"
              :key="tip.title"
              class="tip-item"
            >
              <div class="flex items-start gap-3">
                <v-icon :color="'amber'" size="20" class="mt-0.5 shrink-0">{{ tip.icon }}</v-icon>
                <div>
                  <p class="text-sky-100 font-medium text-sm mb-1">{{ tip.title }}</p>
                  <p class="opacity-60 text-xs leading-relaxed">{{ tip.text }}</p>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Tip dots -->
        <div class="flex justify-center gap-1.5 mt-4">
          <button
            v-for="(_, index) in INSTALL_TIPS"
            :key="index"
            class="tip-dot"
            :class="{ 'tip-dot--active': index === currentTipIndex }"
            @click="currentTipIndex = index"
          />
        </div>
      </div>

      <!-- Navigate to Cloud while waiting -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-3">
          <v-icon color="blue" size="24">mdi-cloud</v-icon>
          <h3 class="text-base font-semibold text-sky-100">Explore while you wait</h3>
        </div>
        <p class="opacity-50 text-xs mb-4">
          Your layout is ready to configure. Start managing your roster, devices, and settings in the Cloud dashboard — the server will connect automatically when it's ready.
        </p>
        <v-btn
          color="primary"
          variant="tonal"
          class="text-none"
          prepend-icon="mdi-view-dashboard-outline"
          @click="handleComplete"
        >
          Go to Dashboard
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped>
.install-step {
  max-width: 560px;
  margin: 0 auto;
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

/* Celebration card — golden glow */
.celebration-card::before {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(236, 72, 153, 0.3) 40%, rgba(56, 189, 248, 0.3));
}
.celebration-icon {
  font-size: 3rem;
  animation: celebration-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes celebration-bounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
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

/* Tip carousel */
.tip-carousel {
  position: relative;
  min-height: 70px;
}
.tip-item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.4s ease;
}
.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

/* Tip dots */
.tip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tip-dot--active {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
  transform: scale(1.3);
}
</style>
