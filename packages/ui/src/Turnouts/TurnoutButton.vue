<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const { setTurnout } = useTurnouts()

interface Props {
  turnout: Turnout
  turnoutId?: string
  state?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:state': [value: boolean]
}>()

const internalState = ref(props.state !== undefined ? props.state : props.turnout?.state)
const isRunning = ref(false)

// Computed property for state that can be updated
const state = computed({
  get: () => props.state !== undefined ? props.state : internalState.value,
  set: (value: boolean) => {
    internalState.value = value
    emit('update:state', value)
  }
})

// Watch for prop changes
watch(() => props.state, (newState) => {
  if (newState !== undefined) {
    internalState.value = newState
  }
})

async function handleTurnouts(event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await setTurnout(props.turnoutId || props.turnout.id, {...props.turnout, id: props.turnoutId || props.turnout.id, state: state.value})
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