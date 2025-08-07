<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect, type EffectType } from '@repo/modules/effects'

const { runEffect, getEfxType } = useEfx()

interface Props {
  effect: Effect
  effectId?: string
}

const props = defineProps<Props>()

const state = ref(props.effect?.state || false)
const efxType = ref<EffectType | null>(props.effect?.type ? getEfxType(props.effect?.type) as EffectType : null)
const isRunning = ref(false)

watch(state, async () => {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({
    ...props.effect,
    id: props.effectId || props.effect.id,
    state: state.value
  })
})
</script>

<template>
  <v-card 
    class="m-1 shadow-xl"
    :color="effect?.color || efxType?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon 
        v-if="efxType?.icon" 
        :icon="efxType?.icon" 
        class="stroke-none"
        :size="32"
        :color="effect?.color || efxType?.color || 'primary'"
      />
      <h4 class="text-md font-bold">{{effect?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{effect?.name}}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="effect?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{effect?.device}}
        </v-chip>
        <v-chip 
          v-if="effect?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{effect?.type}}
        </v-chip>
        <v-chip 
          v-for="tag in effect?.tags" 
          :key="tag" 
          class="ml-2 text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{tag}}
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-switch 
        v-model="state"
        :color="effect?.color || efxType?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template>