<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'
import EffectSwitch from './EffectSwitch.vue'
import EffectCard from './EffectCard.vue'
import EffectButton from './EffectButton.vue'
import EffectRaw from './EffectRaw.vue'

interface Props {
  effect: Effect
  effectId?: string
  viewAs?: string
}

defineProps<Props>()
</script>

<template>
  <EffectSwitch 
    v-if="viewAs === 'switch'" 
    :effect="effect" 
    :effect-id="effectId" 
  />
  <EffectCard 
    v-else-if="viewAs === 'card'" 
    :effect="effect" 
    :effect-id="effectId" 
  />
  <EffectButton 
    v-else-if="viewAs === 'button'" 
    :effect="effect" 
    :effect-id="effectId" 
  />
  <EffectRaw 
    v-else-if="viewAs === 'raw'" 
    :effect="effect" 
  />
  <EffectButton 
    v-else 
    :effect="effect" 
    :effect-id="effectId" 
  />
</template>