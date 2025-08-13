<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'
import EffectSwitch from './EffectSwitch.vue'
import EffectCard from './EffectCard.vue'
import EffectButton from './EffectButton.vue'
import EffectRaw from './EffectRaw.vue'

interface Props {
  state?: boolean
  effect: Effect
  effectId?: string
  viewAs?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:state': [value: boolean]
}>()

const handleStateUpdate = (newState: boolean) => {
  emit('update:state', newState)
}
</script>

<template>
  <EffectSwitch 
    v-if="viewAs === 'switch'" 
    :effect="effect" 
    :effect-id="effectId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <EffectCard 
    v-else-if="viewAs === 'card'" 
    :effect="effect" 
    :effect-id="effectId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <EffectButton 
    v-else-if="viewAs === 'button'" 
    :effect="effect" 
    :effect-id="effectId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <EffectRaw 
    v-else-if="viewAs === 'raw'" 
    :effect="effect" 
    :state="state"
  />
  <EffectButton 
    v-else 
    :effect="effect" 
    :effect-id="effectId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
</template>