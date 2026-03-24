<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import Speedometer from '@/throttle/Speedometer.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'
import { useHaptics } from '@/composables/useHaptics'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const { vibrate } = useHaptics()
const $router = useRouter()

// 🎛️ Notch-to-speed mapping (IDLE + 8 notches)
const NOTCH_SPEEDS = [0, 16, 32, 48, 64, 80, 96, 112, 126]
const NOTCH_LABELS = ['IDLE', '1', '2', '3', '4', '5', '6', '7', '8']

// 🔧 Local state
const localNotch = ref(0)
const localDirection = ref<'FWD' | 'REV'>('FWD')
const brakeLevel = ref(0)
const bellActive = ref(false)
const hornActive = ref(false)
const frontHeadlight = ref<'OFF' | 'DIM' | 'BRT' | 'DITCH'>('OFF')
const rearHeadlight = ref<'OFF' | 'DIM' | 'BRT' | 'DITCH'>('OFF')
const statusLedOn = ref(true)
const pressedButton = ref<string | null>(null)

const HEADLIGHT_STATES = ['OFF', 'DIM', 'BRT', 'DITCH'] as const

const headlightIcon = (state: string) => {
  switch (state) {
    case 'OFF': return 'mdi-lightbulb-off-outline'
    case 'DIM': return 'mdi-car-light-dimmed'
    case 'BRT': return 'mdi-car-light-high'
    case 'DITCH': return 'mdi-car-parking-lights'
    default: return 'mdi-lightbulb-off-outline'
  }
}

const brakeGradient = computed(() => {
  const pct = (brakeLevel.value / 10) * 100
  return `linear-gradient(90deg, #eab308 0%, #ef4444 ${pct}%, #1a202c ${pct}%, #1a202c 100%)`
})

// Sync localNotch from external speed changes
watch(currentSpeed, (speed) => {
  const absSpeed = Math.abs(speed)
  // Find the closest notch
  let closest = 0
  let minDiff = Infinity
  NOTCH_SPEEDS.forEach((ns, i) => {
    const diff = Math.abs(absSpeed - ns)
    if (diff < minDiff) {
      minDiff = diff
      closest = i
    }
  })
  localNotch.value = closest
  if (speed < 0) {
    localDirection.value = 'REV'
  } else if (speed > 0) {
    localDirection.value = 'FWD'
  }
})

// LCD display values
const displaySpeed = computed(() => {
  const absSpeed = Math.abs(currentSpeed.value)
  return String(absSpeed).padStart(3, '0')
})

const displayNotch = computed(() => NOTCH_LABELS[localNotch.value])
const displayDirection = computed(() => localDirection.value)
const displayLocoName = computed(() => loco?.name ?? '---')
const displayAddress = computed(() => String(props.address).padStart(4, '0'))

// 🎚️ Throttle notch control
function setNotch(notch: number) {
  if (notch < 0 || notch > 8) return
  localNotch.value = notch
  vibrate('medium')
  const speed = NOTCH_SPEEDS[notch]
  const signedSpeed = localDirection.value === 'REV' ? -speed : speed
  setSpeed(signedSpeed)
}

// ⬆️⬇️ Direction reverser
function toggleDirection() {
  // Only allow direction change when speed is 0
  if (currentSpeed.value !== 0) {
    vibrate('heavy')
    return
  }
  vibrate('medium')
  localDirection.value = localDirection.value === 'FWD' ? 'REV' : 'FWD'
}

// 📯 Horn — press and hold (F2)
function hornDown(e: PointerEvent) {
  e.preventDefault()
  if (typeof e.pointerId === 'number') {
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }
  hornActive.value = true
  pressedButton.value = 'horn'
  vibrate('heavy')
  // TODO: trigger F2 on
}

function hornUp(e: PointerEvent) {
  if (typeof e.pointerId === 'number') {
    (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
  }
  hornActive.value = false
  pressedButton.value = null
  // TODO: trigger F2 off
}

// 🔔 Bell — toggle (F1)
function toggleBell() {
  bellActive.value = !bellActive.value
  vibrate('medium')
  // TODO: trigger F1 toggle
}

// 💡 Headlight knob cycling
function cycleFrontHeadlight() {
  const idx = HEADLIGHT_STATES.indexOf(frontHeadlight.value)
  frontHeadlight.value = HEADLIGHT_STATES[(idx + 1) % HEADLIGHT_STATES.length]
  vibrate('light')
  // TODO: trigger F0 / headlight function
}

function cycleRearHeadlight() {
  const idx = HEADLIGHT_STATES.indexOf(rearHeadlight.value)
  rearHeadlight.value = HEADLIGHT_STATES[(idx + 1) % HEADLIGHT_STATES.length]
  vibrate('light')
  // TODO: trigger rear headlight function
}

// 🅱️ Menu / Select / Up / Down buttons
function handleMenuBtn() {
  pressedButton.value = 'menu'
  vibrate('light')
  setTimeout(() => { pressedButton.value = null }, 150)
}
function handleSelectBtn() {
  pressedButton.value = 'select'
  vibrate('light')
  setTimeout(() => { pressedButton.value = null }, 150)
}
function handleUpBtn() {
  pressedButton.value = 'up'
  vibrate('light')
  if (localNotch.value < 8) setNotch(localNotch.value + 1)
  setTimeout(() => { pressedButton.value = null }, 150)
}
function handleDownBtn() {
  pressedButton.value = 'down'
  vibrate('light')
  if (localNotch.value > 0) setNotch(localNotch.value - 1)
  setTimeout(() => { pressedButton.value = null }, 150)
}

// 🅿️ Park / clear
async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}

// Blink the status LED (with cleanup)
const ledInterval = setInterval(() => {
  statusLedOn.value = !statusLedOn.value
}, 2000)
onBeforeUnmount(() => clearInterval(ledInterval))
</script>

<template>
  <main v-if="throttle" class="proto-throttle-wrapper flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 relative">
    <!-- Header (consistent with other variants) -->
    <ThrottleHeader class="bg-gradient-to-r from-slate-700/20 to-blue-900/20">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4 bg-gray-900">
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" variant="flat" />
          <MiniConsist v-if="loco" :loco="loco" />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col sm:flex-row justify-center items-start gap-4 flex-grow relative z-10">
      <!-- Left: Speedometer + Logo (desktop only) -->
      <section v-if="loco" class="hidden sm:flex flex-col gap-4 items-center justify-center flex-1">
        <Speedometer v-if="showSpeedometer" :speed="currentSpeed" :address="address" :size="200" :show-label="false" />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
        <Consist v-if="showConsist" :loco="loco" />
      </section>

      <!-- Center: Device body -->
      <section class="proto-device mx-auto w-full max-w-[360px] flex flex-col items-center gap-0 sm:flex-none overflow-y-auto">

        <!-- 1. Status LED + Horn Handle -->
        <div class="device-top-row w-full flex items-center justify-between px-4 py-2">
          <!-- Status LED -->
          <div class="status-led" :class="{ 'led-on': statusLedOn }"></div>
          <!-- Horn handle -->
          <button
            class="horn-handle select-none"
            :class="{ 'horn-pressed': hornActive }"
            @pointerdown="hornDown"
            @pointerup="hornUp"
            @pointercancel="(e) => hornUp(e as PointerEvent)"
            @pointerleave="(e) => hornUp(e as PointerEvent)"
          >
            <v-icon size="14" color="#94a3b8">mdi-bugle</v-icon>
          </button>
        </div>

        <!-- 2. LCD Screen -->
        <div class="lcd-bezel">
          <div class="lcd-screen">
            <div class="lcd-row lcd-row-top">
              <span class="lcd-dir">{{ displayDirection }}</span>
              <span class="lcd-speed-label">SPD</span>
              <span class="lcd-speed">{{ displaySpeed }}</span>
            </div>
            <div class="lcd-row lcd-row-mid">
              <span class="lcd-loco-name">{{ displayLocoName }}</span>
            </div>
            <div class="lcd-row lcd-row-bottom">
              <span class="lcd-addr">ADDR:{{ displayAddress }}</span>
              <span class="lcd-notch">N:{{ displayNotch }}</span>
            </div>
            <!-- Bell / Horn indicators -->
            <div class="lcd-indicators">
              <span v-if="bellActive" class="lcd-indicator">🔔 BELL</span>
              <span v-if="hornActive" class="lcd-indicator">📯 HORN</span>
            </div>
          </div>
        </div>

        <!-- 3. Navigation Buttons (Menu, Select, Up, Down) -->
        <div class="nav-buttons-grid">
          <button
            class="nav-btn nav-btn-menu"
            :class="{ 'nav-btn-active': pressedButton === 'menu' }"
            @click="handleMenuBtn"
          >MENU</button>
          <button
            class="nav-btn nav-btn-up"
            :class="{ 'nav-btn-active': pressedButton === 'up' }"
            @click="handleUpBtn"
          >▲</button>
          <button
            class="nav-btn nav-btn-select"
            :class="{ 'nav-btn-active': pressedButton === 'select' }"
            @click="handleSelectBtn"
          >SEL</button>
          <button
            class="nav-btn nav-btn-down"
            :class="{ 'nav-btn-active': pressedButton === 'down' }"
            @click="handleDownBtn"
          >▼</button>
        </div>

        <!-- 4. Notch Markings -->
        <div class="notch-markings">
          <span
            v-for="(label, i) in [...NOTCH_LABELS].reverse()"
            :key="label"
            class="notch-label"
            :class="{ 'notch-active': localNotch === (8 - i) }"
          >{{ label }}</span>
        </div>

        <!-- 5. Throttle Slider (vertical, 9 positions) -->
        <div class="throttle-slider-area">
          <div class="slider-track">
            <input
              type="range"
              min="0"
              max="8"
              :value="localNotch"
              @input="(e) => setNotch(Number((e.target as HTMLInputElement).value))"
              class="throttle-range"
              orient="vertical"
            />
          </div>
        </div>

        <!-- 6. Reverser -->
        <div class="reverser-area">
          <span class="reverser-label">REVERSER</span>
          <button
            class="reverser-handle"
            :class="{ 'reverser-fwd': localDirection === 'FWD', 'reverser-rev': localDirection === 'REV', 'reverser-locked': currentSpeed !== 0 }"
            @click="toggleDirection"
          >
            <span class="reverser-text">{{ localDirection }}</span>
          </button>
        </div>

        <!-- 7. Bell Button -->
        <div class="bell-area">
          <button
            class="bell-btn"
            :class="{ 'bell-active': bellActive }"
            @click="toggleBell"
          >
            <v-icon size="20" class="mr-1">mdi-bell</v-icon>
            B E L L
          </button>
        </div>

        <!-- 8. Brake Slider -->
        <div class="brake-slider-area">
          <span class="brake-label">BRAKE</span>
          <div class="brake-track">
            <input
              type="range"
              min="0"
              max="10"
              v-model.number="brakeLevel"
              class="brake-range"
              :style="{ background: brakeGradient }"
            />
          </div>
        </div>

        <!-- 9. Headlight Knobs -->
        <div class="headlight-knobs">
          <div class="knob-group">
            <span class="knob-label">REAR</span>
            <button class="headlight-knob" @click="cycleRearHeadlight">
              <v-icon size="16" class="knob-value">{{ headlightIcon(rearHeadlight) }}</v-icon>
            </button>
          </div>
          <div class="knob-group">
            <span class="knob-label">FRONT</span>
            <button class="headlight-knob" @click="cycleFrontHeadlight">
              <v-icon size="16" class="knob-value">{{ headlightIcon(frontHeadlight) }}</v-icon>
            </button>
          </div>
        </div>

        <!-- Bottom of device -->
        <div class="device-bottom-cap"></div>
      </section>

      <!-- Right: Functions (desktop only) -->
      <section v-if="loco && showFunctions" class="hidden sm:flex flex-col gap-2 items-center justify-center flex-1">
        <FunctionsSpeedDial :loco="loco" />
      </section>
    </section>

    <!-- Mobile-only optional sections -->
    <section v-if="loco && showConsist" class="flex sm:hidden flex-col items-center mt-2">
      <Consist :loco="loco" />
    </section>
    <section v-if="loco && showFunctions" class="flex sm:hidden flex-col items-center mt-2">
      <FunctionsSpeedDial :loco="loco" />
    </section>
  </main>

  <!-- No throttle fallback -->
  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold text-gray-700">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   ProtoThrottle — Skeuomorphic ISE ProtoThrottle replica
   ═══════════════════════════════════════════════════════════════ */

.proto-throttle-wrapper {
  @container (min-width: 0px) {
    /* always active */
  }
}

/* ── Device body ──────────────────────────────────────────── */
.proto-device {
  background: linear-gradient(180deg, #2e4268 0%, #263752 40%, #1e2d45 100%);
  border-radius: 24px 24px 32px 32px;
  box-shadow:
    0 4px 24px 0 rgba(0,0,0,0.5),
    inset 0 1px 0 0 rgba(255,255,255,0.08),
    inset 0 -2px 4px 0 rgba(0,0,0,0.3);
  padding: 12px 8px 20px 8px;
  border: 2px solid #3a506e;
  position: relative;
}

.proto-device::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 22px 22px 30px 30px;
  border: 1px solid rgba(255,255,255,0.04);
  pointer-events: none;
}

/* ── Status LED ───────────────────────────────────────────── */
.status-led {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1a3a1a;
  border: 1px solid #0d1f0d;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.status-led.led-on {
  background: #4ade80;
  box-shadow:
    0 0 6px 2px rgba(74, 222, 128, 0.5),
    inset 0 0 2px rgba(255,255,255,0.3);
}

/* ── Horn Handle ──────────────────────────────────────────── */
.horn-handle {
  width: 48px;
  height: 64px;
  background: linear-gradient(180deg, #4a5568 0%, #2d3748 50%, #1a202c 100%);
  border-radius: 6px 6px 4px 4px;
  border: 1px solid #5a6a80;
  box-shadow:
    0 3px 8px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}

.horn-handle:active,
.horn-handle.horn-pressed {
  transform: translateY(3px);
  box-shadow:
    0 1px 3px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(180deg, #3a4558 0%, #252f3e 50%, #151a24 100%);
}

.horn-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #94a3b8;
  text-transform: uppercase;
}

/* ── LCD Screen ───────────────────────────────────────────── */
.lcd-bezel {
  width: 90%;
  margin: 8px auto;
  background: #1a1a1a;
  border-radius: 6px;
  padding: 4px;
  border: 2px solid #333;
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,0.6),
    0 1px 0 rgba(255,255,255,0.05);
}

.lcd-screen {
  background: #0a1a0a;
  border-radius: 4px;
  padding: 8px 10px;
  font-family: 'Courier New', 'Consolas', monospace;
  color: #4ade80;
  text-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

.lcd-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
}

.lcd-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  line-height: 1.4;
}

.lcd-row-top {
  font-size: 14px;
  font-weight: 700;
}

.lcd-dir {
  min-width: 32px;
}

.lcd-speed-label {
  font-size: 10px;
  opacity: 0.6;
}

.lcd-speed {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
}

.lcd-row-mid {
  font-size: 11px;
  justify-content: center;
  opacity: 0.8;
  margin: 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lcd-row-bottom {
  font-size: 10px;
  opacity: 0.6;
}

.lcd-indicators {
  display: flex;
  gap: 8px;
  justify-content: center;
  font-size: 9px;
  margin-top: 2px;
}

.lcd-indicator {
  animation: lcd-blink 0.8s ease-in-out infinite alternate;
}

@keyframes lcd-blink {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

/* ── Navigation Buttons ───────────────────────────────────── */
.nav-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  padding: 8px 24px;
  width: 100%;
}

.nav-btn {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(180deg, #3d4f6a 0%, #2a3a52 100%);
  border: 1px solid #4a5f7a;
  color: #c8d6e5;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.08);
  transition: all 0.1s ease;
  -webkit-user-select: none;
  user-select: none;
}

.nav-btn:active,
.nav-btn.nav-btn-active {
  transform: translateY(1px);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.3),
    inset 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(180deg, #2a3a52 0%, #1e2d40 100%);
}

/* ── Notch Markings ───────────────────────────────────────── */
.notch-markings {
  display: flex;
  justify-content: space-between;
  padding: 4px 16px;
  width: 100%;
}

.notch-label {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
  text-align: center;
  min-width: 20px;
}

.notch-label.notch-active {
  color: #4ade80;
  text-shadow: 0 0 4px rgba(74, 222, 128, 0.4);
}

/* ── Throttle Slider ──────────────────────────────────────── */
.throttle-slider-area {
  width: 100%;
  padding: 4px 32px;
  display: flex;
  justify-content: center;
}

.slider-track {
  width: 100%;
  position: relative;
}

.throttle-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 24px;
  background: linear-gradient(180deg, #111827 0%, #1a202c 100%);
  border-radius: 12px;
  border: 2px solid #374151;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
  outline: none;
  cursor: pointer;
}

.throttle-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 40%, #374151 100%);
  border: 2px solid #9ca3af;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: grab;
}

.throttle-range::-webkit-slider-thumb:active {
  cursor: grabbing;
  box-shadow:
    0 1px 4px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(0,0,0,0.2);
}

.throttle-range::-moz-range-thumb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 40%, #374151 100%);
  border: 2px solid #9ca3af;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: grab;
}

/* ── Reverser ─────────────────────────────────────────────── */
.reverser-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 24px;
  width: 100%;
}

.reverser-label {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
  text-transform: uppercase;
  min-width: 60px;
}

.reverser-handle {
  flex: 1;
  height: 32px;
  border-radius: 16px;
  border: 2px solid #4a5f7a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  transition: all 0.2s ease;
  -webkit-user-select: none;
  user-select: none;
}

.reverser-handle.reverser-fwd {
  background: linear-gradient(90deg, #1e293b 0%, #2a3a52 50%, #3b82f6 100%);
  color: #93c5fd;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.reverser-handle.reverser-rev {
  background: linear-gradient(90deg, #ef4444 0%, #2a3a52 50%, #1e293b 100%);
  color: #fca5a5;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
}

.reverser-handle.reverser-locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.reverser-text {
  pointer-events: none;
}

/* ── Bell Button ──────────────────────────────────────────── */
.bell-area {
  padding: 6px 24px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.bell-btn {
  width: 100%;
  max-width: 200px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(180deg, #4a4a2a 0%, #3a3a20 100%);
  border: 2px solid #6b6b3a;
  color: #d4d4a0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 3px;
  cursor: pointer;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.08);
  transition: all 0.15s ease;
  -webkit-user-select: none;
  user-select: none;
}

.bell-btn:active {
  transform: translateY(1px);
}

.bell-btn.bell-active {
  background: linear-gradient(180deg, #6b6b2a 0%, #5a5a18 100%);
  border-color: #a3a340;
  color: #fef08a;
  box-shadow:
    0 0 8px 2px rgba(250, 204, 21, 0.25),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

/* ── Brake Slider ─────────────────────────────────────────── */
.brake-slider-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 24px;
  width: 100%;
}

.brake-label {
  font-size: 9px;
  font-weight: 700;
  color: #ef4444;
  letter-spacing: 1px;
  text-transform: uppercase;
  min-width: 40px;
}

.brake-track {
  flex: 1;
}

.brake-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  background: linear-gradient(90deg, #422006 0%, #1a0505 50%, #2d0a0a 100%);
  border-radius: 8px;
  border: 2px solid #7f1d1d;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
  outline: none;
  cursor: pointer;
}

.brake-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
  border: 2px solid #f87171;
  box-shadow:
    0 2px 6px rgba(220, 38, 38, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: grab;
}

.brake-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
  border: 2px solid #f87171;
  box-shadow:
    0 2px 6px rgba(220, 38, 38, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: grab;
}

/* ── Headlight Knobs ──────────────────────────────────────── */
.headlight-knobs {
  display: flex;
  justify-content: space-around;
  padding: 8px 16px;
  width: 100%;
  gap: 16px;
}

.knob-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.knob-label {
  font-size: 8px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.headlight-knob {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4b5563 0%, #374151 40%, #1f2937 100%);
  border: 2px solid #6b7280;
  box-shadow:
    0 3px 8px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.08),
    inset 0 -1px 2px rgba(0,0,0,0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
}

.headlight-knob::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 10px;
  background: #9ca3af;
  border-radius: 2px;
}

.headlight-knob:active {
  transform: scale(0.95);
  box-shadow:
    0 1px 4px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(0,0,0,0.3);
}

.knob-value {
  font-size: 8px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* ── Device bottom cap ────────────────────────────────────── */
.device-bottom-cap {
  width: 80%;
  height: 6px;
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
  border-radius: 0 0 12px 12px;
  margin: 4px auto 0;
}
</style>
