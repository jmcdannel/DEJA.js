<!-- packages/ui/src/Functions/SoundButton.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx } from '@repo/modules/effects'
import { useFunctionIcon, type SoundSlot } from '@repo/modules/locos'

const props = defineProps<{
  soundSlot: SoundSlot
  showLabel?: boolean
}>()

const { runEffect } = useEfx()
const { getIconComponent } = useFunctionIcon()

const isActive = ref(false)
const icon = computed(() => getIconComponent(props.soundSlot.icon))

const buttonClasses = computed(() => {
  const classes = [
    'rounded-full',
    'border',
    'border-cyan-400/60',
    'fn-btn-bg',
    'relative',
    'p-2',
    'transition-all',
    'duration-deja-fast',
    'ease-deja-standard',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-cyan-300',
    'bg-blue-900/80',
    'text-cyan-100',
    'shadow-[inset_0_3px_6px_rgba(14,165,233,0.25)]',
  ]
  if (isActive.value) {
    classes.push('ring-2', 'ring-cyan-300', 'shadow-inner', 'scale-95')
  }
  return classes.join(' ')
})

async function activate() {
  if (isActive.value) return
  isActive.value = true
  await runEffect({
    id: props.soundSlot.label,
    type: 'sound',
    soundBlobUrl: props.soundSlot.soundKey,
    state: true,
  })
}

async function deactivate() {
  if (!isActive.value) return
  isActive.value = false
  // For momentary: send state: false to stop sound
  // For latching: only send state: false when explicitly toggled off (not on pointerup)
  if (props.soundSlot.isMomentary) {
    await runEffect({
      id: props.soundSlot.label,
      type: 'sound',
      soundBlobUrl: props.soundSlot.soundKey,
      state: false,
    })
  }
}

async function deactivateLatching() {
  if (!isActive.value) return
  isActive.value = false
  await runEffect({
    id: props.soundSlot.label,
    type: 'sound',
    soundBlobUrl: props.soundSlot.soundKey,
    state: false,
  })
}

function handlePointerDown(event: PointerEvent) {
  event.preventDefault()
  if (typeof event.pointerId === 'number') {
    (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
  }
  if (props.soundSlot.isMomentary) {
    activate()
  } else {
    // Latching: toggle on press
    if (isActive.value) {
      deactivateLatching()
    } else {
      activate()
    }
  }
}

function handlePointerUp(event: PointerEvent) {
  if (typeof event.pointerId === 'number') {
    (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId)
  }
  // Only deactivate on release for momentary sounds
  if (props.soundSlot.isMomentary) {
    deactivate()
  }
}

function handlePointerLeave(_event: PointerEvent) {
  if (props.soundSlot.isMomentary) {
    deactivate()
  }
}

function handlePointerCancel(_event: PointerEvent) {
  if (props.soundSlot.isMomentary) {
    deactivate()
  }
}

const sharedListeners = {
  onPointerdown: handlePointerDown,
  onPointerup: handlePointerUp,
  onPointerleave: handlePointerLeave,
  onPointercancel: handlePointerCancel,
}
</script>

<template>
  <v-btn
    v-if="showLabel"
    v-bind="sharedListeners"
    :prepend-icon="icon"
    :class="[buttonClasses, 'px-4 gap-2 justify-start text-sm font-semibold tracking-wide']"
  >
    {{ soundSlot.label }}
  </v-btn>
  <v-btn
    v-else
    v-bind="sharedListeners"
    :icon="icon"
    :class="[buttonClasses, 'w-12 h-12']"
  />
</template>

<style scoped>
.fn-btn-bg {
  background: rgba(var(--v-theme-surface), 0.8);
}
</style>
