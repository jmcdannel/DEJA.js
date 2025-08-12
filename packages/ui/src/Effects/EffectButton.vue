<script setup lang="ts">
import { ref } from 'vue'
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

async function handleEffect() {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  
  state.value = !state.value
  await runEffect({
    ...props.effect,
    id: props.effectId || props.effect.id,
    state: state.value
  })
}
</script>

<template>
  <v-btn 
    class="m-1"
    :color="effect?.color || efxType?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleEffect"
  >
    <template #prepend>
      <v-icon 
        v-if="efxType?.icon" 
        :icon="efxType?.icon" 
        class="stroke-none"
        :size="20"
        :color="effect?.color || efxType?.color || 'primary'"
      />
    </template>
    {{effect?.name}}
  </v-btn>
</template>