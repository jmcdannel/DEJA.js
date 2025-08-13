<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'

const { runEffect } = useEfx()

interface Props {
  effect: Effect
  effectId?: string
  state?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:state': [value: boolean]
}>()

const internalState = ref(props.state !== undefined ? props.state : props.effect?.state)
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

async function handleEffect(event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({...props.effect, id: props.effectId || props.effect.id, state: state.value})
}
</script>

<template>
  <v-btn 
    class="m-1"
    :color="effect?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleEffect"
  >
    <template #prepend>
      <v-icon icon="mdi-lightning-bolt" class="w-6 h-6" />
    </template>
    {{effect?.name}}
  </v-btn>
</template>