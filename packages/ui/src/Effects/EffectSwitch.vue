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
    class="shadow-xl my-1 p-[1px] rounded-full text-white"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900' : ''"
    :color="effect?.color || efxType?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center justify-between relative rounded-full px-2 bg-gray-900 bg-opacity-40"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
    >
      <h4 class="text-sm font-bold flex items-center gap-2">
        <v-icon 
          v-if="efxType?.icon" 
          :icon="efxType?.icon" 
          class="stroke-none"
          :size="32"
          :color="effect?.color || efxType?.color || 'primary'"
        />
        {{effect?.name}}
      </h4>
      <aside class="flex items-center gap-2">
        <v-chip size="small" :text="effect?.device || 'device'" />
        <v-switch 
          v-model="state" 
          :color="effect?.color || efxType?.color || 'primary'" 
          :disabled="isRunning" 
          :loading="isRunning" 
          hide-details 
        />
      </aside>
    </v-card-title>
  </v-card>
</template>