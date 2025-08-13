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
  await runEffect({...props.effect, id: props.effectId || props.effect.id, state: internalState.value })
}
</script>

<template>
  <v-card 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="effect?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center gap-4 justify-between rounded-full px-2 bg-gray-900 bg-opacity-40"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
    >
      <v-icon icon="mdi-lightning-bolt" class="w-6 h-6" />
      <h4 class="text-md font-bold mr-2 text-white">{{effect?.name}}</h4>
      <v-switch 
        v-model="state" 
        @change="handleEffect" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />
    </v-card-title>
  </v-card>
</template>