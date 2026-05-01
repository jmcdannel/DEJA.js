<script setup lang="ts">
import { computed, watch } from 'vue'
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

watch(state, () => { vibrate('light') })

const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))
const isSound = computed(() => props.effect?.type === 'sound')
const accentColor = computed(() => props.effect?.color || efxType.value?.color || 'primary')
</script>

<template>
  <v-card
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900' : ''"
    :color="accentColor"
  >
    <v-card-title
      class="flex flex-row items-center gap-4 justify-between rounded-full px-2 efx-switch-inner"
      :class="isRunning ? 'shadow-inner shadow-pink-500' : ''"
    >
      <v-icon :icon="efxType?.icon || 'mdi-help'" class="text-5xl m-3" />
      <h4 class="text-md font-bold mr-2">
        {{ effect?.name }}
        <span class="hidden md:inline text-sm font-normal ml-2 opacity-60">
          <br />
          <v-chip
            v-if="effect?.device"
            class="ml-2 text-xs"
            prepend-icon="mdi-memory"
            variant="outlined"
          >
            {{ effect?.device }}
          </v-chip>
        </span>
      </h4>

      <!-- Sound: play/stop button with progress ring -->
      <div v-if="isSound" class="relative inline-flex items-center justify-center w-[52px] h-[52px] mr-1">
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
          variant="text"
          size="small"
          @click="state = !state; vibrate('light')"
        />
      </div>

      <!-- Non-sound: standard toggle switch -->
      <v-switch
        v-else
        v-model="state"
        :color="accentColor"
        :disabled="isRunning"
        :loading="isRunning"
        hide-details
      />
    </v-card-title>
  </v-card>
</template>

<style scoped>
.efx-switch-inner {
  background: rgba(var(--v-theme-surface), 0.85);
}
</style>