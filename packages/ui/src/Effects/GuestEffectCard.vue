<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'

const { runEffect, getEfxType } = useEfx()

interface Props {
  effect: Effect
  effectId?: string
  state?: boolean
  showDescription?: boolean
  showTags?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
  showTags: true
})

const emit = defineEmits<{
  'update:state': [value: boolean]
  'activate': [effectId: string]
  'deactivate': [effectId: string]
}>()

const internalState = ref(props.state !== undefined ? props.state : props.effect?.state)
const isRunning = ref(false)
const timeoutProgress = ref(0)
const remainingTime = ref(0)

// Computed property for state that can be updated
const state = computed({
  get: () => props.state !== undefined ? props.state : internalState.value,
  set: (value: boolean) => {
    internalState.value = value
    emit('update:state', value)
  }
})

// Get effect type info for better icons and labels
const effectType = computed(() => getEfxType(props.effect.type))

// Determine if this effect has a timeout
const hasTimeout = computed(() => ['sound', 'relay', 'macro'].includes(props.effect.type))
const timeoutDuration = computed(() => {
  const timeouts: Record<string, number> = {
    'sound': 5000,
    'relay': 10000,
    'macro': 15000
  }
  return timeouts[props.effect.type] || 0
})

// Watch for prop changes
watch(() => props.state, (newState) => {
  if (newState !== undefined) {
    internalState.value = newState
  }
})

// Watch for state changes to handle timeout progress
watch(() => state.value, (isActive) => {
  if (isActive && hasTimeout.value && timeoutDuration.value) {
    remainingTime.value = timeoutDuration.value
    const interval = setInterval(() => {
      remainingTime.value -= 100
      timeoutProgress.value = ((timeoutDuration.value - remainingTime.value) / timeoutDuration.value) * 100
      if (remainingTime.value <= 0) {
        clearInterval(interval)
        timeoutProgress.value = 0
      }
    }, 100)
  } else {
    timeoutProgress.value = 0
    remainingTime.value = 0
  }
})

async function handleActivate() {
  if (isRunning.value) return
  
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  
  isRunning.value = isPending.value
  
  try {
    await runEffect({...props.effect, id: props.effectId || props.effect.id, state: true})
    emit('activate', props.effectId || props.effect.id)
    
    // Auto-deactivate after timeout if specified
    if (hasTimeout.value && timeoutDuration.value) {
      setTimeout(() => {
        handleDeactivate()
      }, timeoutDuration.value)
    }
  } catch (error) {
    console.error('Error activating effect:', error)
  }
}

async function handleDeactivate() {
  if (isRunning.value) return
  
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  
  isRunning.value = isPending.value
  
  try {
    await runEffect({...props.effect, id: props.effectId || props.effect.id, state: false})
    emit('deactivate', props.effectId || props.effect.id)
  } catch (error) {
    console.error('Error deactivating effect:', error)
  }
}
</script>

<template>
  <v-card 
    :color="effect.state ? 'success' : 'surface'"
    :elevation="effect.state ? 8 : 2"
    class="effect-card"
    :class="{ active: effect.state }"
  >
    <v-card-text class="text-center pa-4">
      <v-icon 
        :icon="effectType?.icon || 'mdi-lightning-bolt'" 
        size="48" 
        :color="effect.state ? 'white' : 'primary'"
        class="mb-3"
      ></v-icon>
      
      <h4 class="text-h6 mb-2" :class="{ 'text-white': effect.state }">
        {{ effect.name }}
      </h4>
      
      <p 
        v-if="showDescription"
        class="text-body-2 mb-3" 
        :class="{ 'text-white': effect.state, 'text-medium-emphasis': !effect.state }"
      >
        {{ effectType?.label || effect.type }} effect
        <span v-if="effect.device">on {{ effect.device }}</span>
        <span v-if="effect.pin">(Pin {{ effect.pin }})</span>
      </p>
      
      <div v-if="showTags && effect.tags?.length" class="mb-3">
        <v-chip 
          v-for="tag in effect.tags" 
          :key="tag"
          size="small" 
          :color="effect.state ? 'white' : 'info'"
          :text-color="effect.state ? 'success' : 'white'"
          class="ma-1"
        >
          {{ tag }}
        </v-chip>
      </div>
      
      <div class="d-flex justify-center">
        <v-btn
          v-if="!effect.state"
          color="primary"
          @click="handleActivate"
          :disabled="isRunning"
          :loading="isRunning"
        >
          <v-icon icon="mdi-play" class="mr-1"></v-icon>
          Activate
        </v-btn>
        
        <v-btn
          v-else
          color="white"
          variant="outlined"
          @click="handleDeactivate"
          :disabled="isRunning"
          :loading="isRunning"
        >
          <v-icon icon="mdi-stop" class="mr-1"></v-icon>
          Stop
        </v-btn>
      </div>
      
      <div v-if="hasTimeout && effect.state" class="mt-3">
        <v-progress-linear
          :model-value="timeoutProgress"
          color="white"
          height="4"
          rounded
        ></v-progress-linear>
        <p class="text-caption mt-1" :class="{ 'text-white': effect.state }">
          Auto-stop in {{ Math.ceil(remainingTime / 1000) }}s
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.effect-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.effect-card:hover {
  transform: translateY(-2px);
}

.effect-card.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>