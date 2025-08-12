<script setup lang="ts">
import type { Turnout } from '@repo/modules/turnouts'
import TurnoutSwitch from './TurnoutSwitch.vue'
import TurnoutCard from './TurnoutCard.vue'
import TurnoutButton from './TurnoutButton.vue'
import TurnoutRaw from './TurnoutRaw.vue'

interface Props {
  state?: boolean
  turnout: Turnout
  turnoutId?: string
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
  <TurnoutSwitch 
    v-if="viewAs === 'switch'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <TurnoutCard 
    v-else-if="viewAs === 'card'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <TurnoutButton 
    v-else-if="viewAs === 'button'" 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
  <TurnoutRaw 
    v-else-if="viewAs === 'raw'" 
    :turnout="turnout" 
    :state="state"
  />
  <TurnoutButton 
    v-else 
    :turnout="turnout" 
    :turnout-id="turnoutId" 
    :state="state"
    @update:state="handleStateUpdate"
  />
</template>
