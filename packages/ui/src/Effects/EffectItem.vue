<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import EffectSwitch from './EffectSwitch.vue'
import EffectCard from './EffectCard.vue'
import EffectButton from './EffectButton.vue'
import EffectRaw from './EffectRaw.vue'

interface Props {
  effect: Effect
  viewAs?: string
}

const props = defineProps<Props>()
const { runEffect } = useEfx()
const state = ref(props.effect?.state)
const isRunning = ref(false)

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
}, 2000)

watch(state, async (newState) => {
  console.log('Effect state watched to:', newState)
  isRunning.value = true
  stop()
  start()
  await runEffect({...props.effect, id: props.effect.id, state: newState})
})
</script>

<template>
  <EffectSwitch 
    v-if="viewAs === 'switch'" 
    :effect="effect" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <EffectCard 
    v-else-if="viewAs === 'card'" 
    :effect="effect" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <EffectButton 
    v-else-if="viewAs === 'button'" 
    :effect="effect" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <EffectRaw 
    v-else-if="viewAs === 'raw'" 
    :effect="effect" 
  />
  <EffectButton 
    v-else 
    :effect="effect" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
</template>