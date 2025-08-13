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
  <v-card 
    class="m-1 shadow-xl"
    :color="effect?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleEffect"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon icon="mdi-lightning-bolt" class="w-6 h-6" />
      <h4 class="text-md font-bold">{{effect?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{effect?.name}}</p>
      <p class="my-4">{{ effect.type }}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="effect?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{effect?.device}}
        </v-chip>
        <v-chip 
          v-if="effect?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{effect?.type}}
        </v-chip>
        <v-chip 
          v-for="tag in effect?.tags" 
          :key="tag" 
          class="ml-2 text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{tag}}
        </v-chip>
        <v-chip 
          v-if="effect?.allowGuest" 
          class="ml-2 text-xs"
          prepend-icon="mdi-account-check"
          variant="outlined"
          color="success"
        >
          Guest Access
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-switch 
        v-model="state" 
        @change="handleEffect" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template>