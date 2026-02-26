<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, efxTypes, type Effect } from '@repo/modules'

interface Props {
  effect: Effect
}

const props = defineProps<Props>()
const { runEffect } = useEfx()
const state = ref(props.effect?.state)
const isRunning = ref(false)
const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
}, 2000)

watch(state, async (newState) => {
  console.log('Effect state watched to:', newState)
  isRunning.value = true
  stop()
  start()
  await runEffect({...props.effect, state: newState})
})
</script>

<template>
  <v-card
    :elevation="effect.state ? 8 : 2"
    :class="{ 'animate-deja-pulse-glow': effect.state }"
    class="transition-transform duration-deja-normal ease-deja-standard hover:-translate-y-0.5"
    variant="tonal"
    :color="effect?.color || 'primary'"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon 
          :icon="efxType?.icon || 'mdi-help'"
          class="text-5xl m-3"></v-icon>
        <span>{{ effect.name }}</span>
      </div>
    </v-card-title>

    <v-card-text v-if="effect.tags && effect.tags.length > 0">
      <v-chip-group>
        <v-chip 
          v-for="tag in effect.tags" 
          :key="tag"
          size="small"
          variant="outlined"
          :color="'secondary'"
        >
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-switch 
        v-model="state" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
        label="Toggle Effect"
      />
    </v-card-actions>
  </v-card>
</template>
