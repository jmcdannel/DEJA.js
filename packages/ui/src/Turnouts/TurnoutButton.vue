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
  <v-btn 
    class="m-1"
    :color="turnout?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleTurnouts"
  >
    <template #prepend>
      <v-icon icon="mdi-call-split" class="w-6 h-6" />
    </template>
    {{turnout?.name}}
  </v-btn>
</template> 