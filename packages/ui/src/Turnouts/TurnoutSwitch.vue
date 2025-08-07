<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const { switchTurnout } = useTurnouts()

interface Props {
  turnout: Turnout
  turnoutId?: string
}

const props = defineProps<Props>()

const state = ref(props.turnout?.state)
const isRunning = ref(false)

async function handleTurnouts(event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await switchTurnout({...props.turnout, id: props.turnoutId || props.turnout.id, state: state.value})
}
</script>

<template>
  <v-card 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="turnout?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center gap-4 justify-between rounded-full px-2 bg-gray-900 bg-opacity-40"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
    >
      <v-icon icon="mdi-call-split" class="w-6 h-6" />
      <h4 class="text-md font-bold mr-2">{{turnout?.name}}</h4>
      <v-switch 
        v-model="state" 
        @change="handleTurnouts" 
        :color="turnout?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-title>
  </v-card>
</template> 