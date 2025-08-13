<template>
  <v-card 
    :elevation="effect.state ? 8 : 2" 
    :class="{ 'active-effect': effect.state }"
    class="effect-card"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon 
          :icon="effect.icon || 'mdi-lightning-bolt'" 
          :color="effect.state ? 'primary' : 'grey'"
          class="mr-2"
        />
        <span>{{ effect.name }}</span>
      </div>
      <v-chip 
        v-if="effect.category" 
        :color="effect.state ? 'primary' : 'grey'"
        size="small"
        variant="outlined"
      >
        {{ effect.category }}
      </v-chip>
    </v-card-title>

    <v-card-text v-if="showDescription && effect.description">
      <p class="text-body-2">{{ effect.description }}</p>
    </v-card-text>

    <v-card-text v-if="showTags && effect.tags && effect.tags.length > 0">
      <v-chip-group>
        <v-chip 
          v-for="tag in effect.tags" 
          :key="tag"
          size="small"
          variant="outlined"
          color="grey"
        >
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-btn
        v-if="!effect.state"
        color="primary"
        variant="elevated"
        @click="handleActivate"
        :loading="isRunning"
        :disabled="!effect.allowGuest"
      >
        <v-icon icon="mdi-play" class="mr-1" />
        Activate
      </v-btn>
      
      <v-btn
        v-else
        color="secondary"
        variant="elevated"
        @click="handleDeactivate"
        :loading="isRunning"
      >
        <v-icon icon="mdi-stop" class="mr-1" />
        Deactivate
      </v-btn>
    </v-card-actions>

    <v-progress-linear
      v-if="effect.state && hasTimeout"
      :model-value="timeoutProgress"
      color="warning"
      height="4"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Effect {
  id: string
  name: string
  description?: string
  icon?: string
  category?: string
  tags?: string[]
  state?: boolean
  allowGuest?: boolean
  type?: string
}

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

// Determine if this effect has a timeout
const hasTimeout = computed(() => ['sound', 'relay', 'macro'].includes(props.effect.type || ''))
const timeoutDuration = computed(() => {
  const timeouts: Record<string, number> = {
    'sound': 5000,
    'relay': 10000,
    'macro': 15000
  }
  return timeouts[props.effect.type || ''] || 0
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
  
  isRunning.value = true
  
  try {
    emit('activate', props.effectId || props.effect.id)
    
    // Auto-deactivate after timeout if specified
    if (hasTimeout.value && timeoutDuration.value) {
      setTimeout(() => {
        handleDeactivate()
      }, timeoutDuration.value)
    }
  } catch (error) {
    console.error('Error activating effect:', error)
  } finally {
    isRunning.value = false
  }
}

async function handleDeactivate() {
  if (isRunning.value) return
  
  isRunning.value = true
  
  try {
    emit('deactivate', props.effectId || props.effect.id)
  } catch (error) {
    console.error('Error deactivating effect:', error)
  } finally {
    isRunning.value = false
  }
}
</script>

<style scoped>
.effect-card {
  transition: all 0.3s ease;
}

.active-effect {
  border: 2px solid var(--v-primary-base);
  transform: scale(1.02);
}

.effect-card:hover {
  transform: translateY(-2px);
}
</style>
