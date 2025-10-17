<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

type CTCSwitchState = 'normal' | 'reverse'

type CTCSwitchEmits = {
  (event: 'update:state', state: boolean): void
  (event: 'state-change', state: boolean): void
  (event: 'update:locked', locked: boolean): void
  (event: 'update:occupied', occupied: boolean): void
}

const props = withDefaults(defineProps<{
  label?: string
  trackSegment?: string
  turnout?: Turnout
  turnoutId?: string
  state?: boolean
  locked?: boolean
  occupied?: boolean
}>(), {
  locked: false,
  occupied: false,
})

const emit = defineEmits<CTCSwitchEmits>()

const internalState = ref<boolean>(props.state ?? props.turnout?.state ?? false)
const locked = ref<boolean>(props.locked ?? false)
const occupied = ref<boolean>(props.occupied ?? false)

const indicatorClasses = 'w-3 h-3 rounded-full transition-all duration-300'

const label = computed(() => props.label ?? props.turnout?.name ?? 'Switch 12')
const trackSegment = computed(() => props.trackSegment ?? props.turnout?.device ?? 'Main')

const displayState = computed<CTCSwitchState>(() => (internalState.value ? 'reverse' : 'normal'))

const disabledReason = computed(() => {
  if (locked.value) return 'Lever locked'
  if (occupied.value) return 'Track occupied'
  return null
})

const leverAngle = computed(() => (displayState.value === 'normal' ? -28 : 28))

watch(
  () => props.state,
  (next) => {
    if (typeof next === 'boolean') {
      internalState.value = next
    }
  }
)

watch(
  () => props.turnout?.state,
  (next) => {
    if (typeof next === 'boolean' && props.state === undefined) {
      internalState.value = next
    }
  }
)

watch(
  () => props.locked,
  (next) => {
    if (typeof next === 'boolean') {
      locked.value = next
    }
  }
)

watch(
  () => props.occupied,
  (next) => {
    if (typeof next === 'boolean') {
      occupied.value = next
    }
  }
)

function updateState(next: boolean) {
  internalState.value = next
  emit('update:state', next)
  emit('state-change', next)
}

function toggleLocked() {
  const next = !locked.value
  locked.value = next
  emit('update:locked', next)
}

function toggleOccupied() {
  const next = !occupied.value
  occupied.value = next
  emit('update:occupied', next)
}

function handleThrow() {
  if (disabledReason.value) return
  updateState(!internalState.value)
}
</script>

<template>
  <div class="w-full max-w-sm rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 text-slate-100 shadow-2xl">
    <header class="mb-6 flex items-end justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
          CTC Switch
        </p>
        <h2 class="text-xl font-semibold tracking-wide text-slate-100">{{ label }}</h2>
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
          {{ trackSegment }} track
        </p>
      </div>
      <div class="space-y-2 text-right text-[10px] uppercase tracking-[0.25em]">
        <div class="flex items-center justify-end space-x-2">
          <span
            :class="[indicatorClasses, displayState === 'normal' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700']"
            aria-hidden="true"
          />
          <span class="text-slate-400">Normal</span>
        </div>
        <div class="flex items-center justify-end space-x-2">
          <span
            :class="[indicatorClasses, displayState === 'reverse' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700']"
            aria-hidden="true"
          />
          <span class="text-slate-400">Reverse</span>
        </div>
      </div>
    </header>

    <div class="relative mb-6 flex h-40 items-center justify-center">
      <div class="absolute inset-0 mx-auto w-52 rounded-full border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900/80 shadow-inner" />
      <div class="absolute bottom-8 left-1/2 h-28 w-[3.25rem] -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900/80" />
      <button
        type="button"
        class="relative flex h-32 w-8 origin-bottom justify-center focus:outline-none"
        :aria-pressed="displayState === 'reverse'"
        :aria-label="`Throw switch to ${displayState === 'normal' ? 'reverse' : 'normal'}`"
        :title="disabledReason ?? 'Throw switch'"
        :disabled="Boolean(disabledReason)"
        @click="handleThrow"
      >
        <div
          class="absolute bottom-0 left-1/2 h-28 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-100 via-slate-400 to-slate-600 transition-transform duration-500 ease-out"
          :class="disabledReason ? 'opacity-60' : ''"
          :style="{ transform: `translateX(-50%) rotate(${leverAngle}deg)` }"
        />
        <div
          class="absolute -top-3 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border border-slate-500 bg-gradient-to-b from-slate-50 to-slate-400 shadow-lg transition-transform duration-500 ease-out"
          :class="disabledReason ? 'opacity-70' : ''"
          :style="{ transform: `translate(-50%, -25%) rotate(${leverAngle}deg)` }"
        >
          <div class="absolute inset-1 rounded-full bg-gradient-to-b from-slate-200 to-slate-500" />
        </div>
        <div class="absolute bottom-0 left-1/2 h-3 w-12 -translate-x-1/2 rounded-b-xl bg-slate-700 shadow-inner" />
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.25em]">
      <button
        type="button"
        class="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 transition-colors"
        :class="locked ? 'bg-red-900/60 text-red-200' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'"
        :aria-pressed="locked"
        @click="toggleLocked"
      >
        <span>Lock</span>
        <span
          :class="[indicatorClasses, locked ? 'bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-slate-700']"
        />
      </button>
      <button
        type="button"
        class="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 transition-colors"
        :class="occupied ? 'bg-amber-900/50 text-amber-200' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'"
        :aria-pressed="occupied"
        @click="toggleOccupied"
      >
        <span>Track</span>
        <span
          :class="[indicatorClasses, occupied ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-700']"
        />
      </button>
      <div class="col-span-2 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-[10px] tracking-[0.2em] text-slate-300">
        <div class="flex items-center justify-between">
          <span>Status</span>
          <span class="font-semibold text-slate-100">{{ displayState.toUpperCase() }}</span>
        </div>
        <p class="mt-2 text-[9px] uppercase tracking-[0.3em] text-slate-500">
          {{ disabledReason ? disabledReason : 'Lever free' }}
        </p>
      </div>
    </div>
  </div>
</template>
