<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { QuickStart } from '@repo/ui'
import { useLocos } from '@repo/modules/locos'
import { useOnboarding, INSTALL_TIPS } from '@repo/modules'

const props = defineProps<{
  uid?: string | null
  layoutId?: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const { state: onboardingState } = useOnboarding()
const { createLoco } = useLocos()

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

// Status text cycling — Claude-style animated adjectives
const STATUS_PHRASES = [
  'Downloading server...',
  'Configuring your railroad...',
  'Detecting CommandStation...',
  'Setting up cloud sync...',
  'Preparing your throttle...',
  'Almost there...',
  'Connecting the dots...',
  'Wiring up the magic...',
  'Laying digital track...',
  'Tuning the signals...',
]
const currentPhraseIndex = ref(0)
let phraseInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tipInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % INSTALL_TIPS.length
  }, 6000)
  phraseInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % STATUS_PHRASES.length
  }, 3000)
})

const currentPhrase = computed(() => STATUS_PHRASES[currentPhraseIndex.value])

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
  locoLoading.value = true
  locoError.value = null
  try {
    const name = locoName.value || `Loco ${address}`
    await createLoco(address, name, undefined, true)
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
  if (phraseInterval) clearInterval(phraseInterval)
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

      <!-- 🍕 Pizza Tracker Progress Bar -->
      <div class="pizza-tracker mb-6">
        <div class="pizza-tracker__steps">
          <div class="pizza-tracker__step pizza-tracker__step--complete">
            <div class="pizza-tracker__dot"><v-icon size="12">mdi-check</v-icon></div>
            <span class="pizza-tracker__label hidden sm:inline">Account</span>
          </div>
          <div class="pizza-tracker__connector pizza-tracker__connector--complete" />
          <div class="pizza-tracker__step pizza-tracker__step--complete">
            <div class="pizza-tracker__dot"><v-icon size="12">mdi-check</v-icon></div>
            <span class="pizza-tracker__label hidden sm:inline">Plan</span>
          </div>
          <div class="pizza-tracker__connector pizza-tracker__connector--complete" />
          <div class="pizza-tracker__step pizza-tracker__step--complete">
            <div class="pizza-tracker__dot"><v-icon size="12">mdi-check</v-icon></div>
            <span class="pizza-tracker__label hidden sm:inline">Layout</span>
          </div>
          <div class="pizza-tracker__connector pizza-tracker__connector--active" />
          <div class="pizza-tracker__step pizza-tracker__step--active">
            <div class="pizza-tracker__dot pizza-tracker__dot--spinner">
              <v-progress-circular indeterminate color="cyan" size="14" width="2" />
            </div>
            <span class="pizza-tracker__label">Install</span>
          </div>
          <div class="pizza-tracker__connector" />
          <div class="pizza-tracker__step pizza-tracker__step--pending">
            <div class="pizza-tracker__dot"><v-icon size="12">mdi-train</v-icon></div>
            <span class="pizza-tracker__label hidden sm:inline">Drive!</span>
          </div>
        </div>

        <!-- Animated status text — cycles through phrases -->
        <div class="pizza-tracker__status">
          <div class="pizza-tracker__glow" />
          <Transition name="phrase-slide" mode="out-in">
            <p :key="currentPhraseIndex" class="pizza-tracker__phrase">
              {{ currentPhrase }}
            </p>
          </Transition>
        </div>
      </div>

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

      <!-- Skip to Dashboard -->
      <v-btn
        variant="text"
        size="small"
        class="text-none opacity-50"
        prepend-icon="mdi-arrow-right"
        @click="handleComplete"
      >
        Skip — go to dashboard
      </v-btn>
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

/* Pizza Tracker */
.pizza-tracker {
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.15);
}
.pizza-tracker__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.pizza-tracker__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pizza-tracker__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: rgba(148, 163, 184, 0.4);
  transition: all 0.3s ease;
}
.pizza-tracker__label {
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pizza-tracker__connector {
  flex: 1;
  height: 2px;
  min-width: 20px;
  max-width: 60px;
  background: rgba(148, 163, 184, 0.15);
  margin: 0 4px;
  margin-bottom: 18px;
  border-radius: 1px;
}
.pizza-tracker__connector--complete {
  background: linear-gradient(90deg, #22d3ee, #38bdf8);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.3);
}
.pizza-tracker__connector--active {
  background: linear-gradient(90deg, #38bdf8, rgba(148, 163, 184, 0.3));
}
.pizza-tracker__step--complete .pizza-tracker__dot {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
}
.pizza-tracker__step--complete .pizza-tracker__label {
  color: #22d3ee;
}
.pizza-tracker__step--active .pizza-tracker__dot {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.2);
  color: #e0f2fe;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
  animation: pizza-pulse 2s ease-in-out infinite;
}
.pizza-tracker__step--active .pizza-tracker__label {
  color: #e0f2fe;
  font-weight: 600;
}
.pizza-tracker__step--pending .pizza-tracker__dot {
  border-color: rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.4);
  color: rgba(148, 163, 184, 0.3);
}
.pizza-tracker__dot--spinner {
  border: none;
  background: transparent;
  box-shadow: none;
}
.pizza-tracker__status {
  position: relative;
  text-align: center;
  margin-top: 12px;
  overflow: hidden;
  height: 24px;
}
.pizza-tracker__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 30px;
  background: radial-gradient(ellipse, rgba(56, 189, 248, 0.15), transparent 70%);
  animation: glow-breathe 3s ease-in-out infinite;
  pointer-events: none;
}
.pizza-tracker__phrase {
  font-size: 0.8rem;
  font-weight: 500;
  color: #7dd3fc;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 1;
}

/* Phrase slide transition */
.phrase-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.phrase-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.phrase-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.phrase-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes pizza-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
  50% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.5); }
}
@keyframes glow-breathe {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
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
