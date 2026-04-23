<script setup lang="ts">
import { computed } from 'vue'
import { efxTypes, type Effect } from '@repo/modules'
import { useHaptics } from '../composables/useHaptics'

interface Props {
  effect: Effect
  isRunning: boolean
  progress?: number
}

const props = defineProps<Props>()
const state = defineModel('state', { type: Boolean })
const { vibrate } = useHaptics()

const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))
const isSound = computed(() => props.effect?.type === 'sound')
const accentColor = computed(() => props.effect?.color || efxType.value?.color || 'primary')
</script>

<template>
  <!-- Sound: circular play/stop button with progress ring + name label -->
  <div v-if="isSound" class="inline-flex flex-col items-center gap-1 m-1">
    <div class="relative inline-flex items-center justify-center w-[52px] h-[52px]">
      <v-progress-circular
        :model-value="isRunning ? progress : 0"
        :size="52"
        :width="3"
        :color="accentColor"
        bg-color="transparent"
        class="absolute inset-0 pointer-events-none"
      />
      <v-btn
        :icon="isRunning ? 'mdi-stop' : 'mdi-play'"
        :color="isRunning ? 'red-lighten-2' : accentColor"
        variant="tonal"
        size="small"
        @click="state = !state; vibrate('light')"
      />
    </div>
    <span class="text-xs text-center max-w-[72px] truncate opacity-80">{{ effect?.name }}</span>
  </div>

  <!-- Non-sound: standard wide button -->
  <v-btn
    v-else
    class="m-1"
    :color="accentColor"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="state = !state; vibrate('light')"
  >
    <template #prepend>
      <v-icon :icon="efxType?.icon || 'mdi-help'" />
    </template>
    {{ effect?.name }}
    <template #append>
      <v-icon icon="mdi-circle" :color="state ? 'green' : 'red'" class="w-4 h-4" />
    </template>
  </v-btn>
</template>