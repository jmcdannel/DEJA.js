<script setup lang="ts">
import type { Turnout } from '@repo/modules/turnouts'
import TurnoutSwitch from './TurnoutSwitch.vue'
import TurnoutCard from './TurnoutCard.vue'
import TurnoutButton from './TurnoutButton.vue'
import TurnoutRaw from './TurnoutRaw.vue'

interface Props {
  turnout: Turnout
  turnoutId?: string
  viewAs?: string
}

defineProps<Props>()
</script>

<template>
  <TurnoutSwitch 
    v-if="viewAs === 'switch'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
  />
  <TurnoutCard 
    v-else-if="viewAs === 'card'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
  />
  <TurnoutButton 
    v-else-if="viewAs === 'button'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
  />
  <TurnoutRaw 
    v-else-if="viewAs === 'raw'" 
    :turnout="turnout" 
  />
  <TurnoutButton 
    v-else 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
  />
</template>
