<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules'
import TurnoutSwitch from './TurnoutSwitch.vue'
import TurnoutCard from './TurnoutCard.vue'
import TurnoutButton from './TurnoutButton.vue'
import TurnoutRaw from './TurnoutRaw.vue'

interface Props {
  turnout: Turnout
  viewAs?: string
}

const props = defineProps<Props>()

const { setTurnout } = useTurnouts()

const state = ref(props.turnout?.state)
const isRunning = ref(false)

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
}, 2000)

watch(state, async (newState) => {
  console.log('Turnout state watched to:', newState)
  isRunning.value = true
  stop()
  start()
  await setTurnout(props.turnout.id, {
    ...props.turnout,
    id: props.turnout?.id,
    state: newState
  })
})
</script>

<template>
  <TurnoutSwitch 
    v-if="viewAs === 'switch'" 
    :turnout="turnout" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <TurnoutCard 
    v-else-if="viewAs === 'card'" 
    :is-running="isRunning"
    :turnout="turnout" 
    v-model:state.sync="state"
  />
  <TurnoutButton 
    v-else-if="viewAs === 'button'" 
    :turnout="turnout" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <TurnoutRaw 
    v-else-if="viewAs === 'raw'" 
    :turnout="turnout" 
  />
  <TurnoutButton 
    v-else 
    :turnout="turnout" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
</template>
